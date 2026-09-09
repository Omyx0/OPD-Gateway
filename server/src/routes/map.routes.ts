/**
 * Hospital Map & Navigation routes.
 *
 * Provides the data layer for the hospital indoor map/navigation foundation.
 * Supports: hospitals → buildings → floors → rooms → navigation paths.
 */
import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError } from "../utils/errors.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";

const router = Router();

// ── Read endpoints (all authenticated users) ────────────────────────

/**
 * GET /map/hospitals — List hospitals
 */
router.get("/hospitals", authenticate, async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("hospitals")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    sendSuccess(res, data ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /map/hospitals/:id/buildings — Buildings for a hospital
 */
router.get("/hospitals/:id/buildings", authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("buildings")
      .select("*")
      .eq("hospital_id", req.params.id)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    sendSuccess(res, data ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /map/buildings/:id/floors — Floors for a building
 */
router.get("/buildings/:id/floors", authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("floors")
      .select("*")
      .eq("building_id", req.params.id)
      .eq("is_active", true)
      .order("floor_number");

    if (error) throw error;
    sendSuccess(res, data ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /map/floors/:id/rooms — Rooms on a floor
 */
router.get("/floors/:id/rooms", authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("rooms")
      .select("*, departments(name)")
      .eq("floor_id", req.params.id)
      .eq("is_active", true)
      .order("room_number");

    if (error) throw error;
    sendSuccess(res, data ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /map/rooms/:id — Single room detail
 */
router.get("/rooms/:id", authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("rooms")
      .select("*, departments(name), floors(name, floor_number, buildings(name, hospitals(name)))")
      .eq("id", req.params.id)
      .single();

    if (error || !data) throw new NotFoundError("Room not found.");
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /map/rooms/search?q=Room+204 — Search rooms
 */
router.get("/rooms/search", authenticate, async (req, res, next) => {
  try {
    const q = (req.query.q as string) || "";
    if (!q.trim()) {
      sendSuccess(res, []);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("rooms")
      .select("*, departments(name), floors(name, floor_number)")
      .or(`room_number.ilike.%${q}%,name.ilike.%${q}%`)
      .eq("is_active", true)
      .limit(20);

    if (error) throw error;
    sendSuccess(res, data ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /map/navigate?from=ROOM_ID&to=ROOM_ID — Basic path calculation (BFS)
 */
router.get("/navigate", authenticate, async (req, res, next) => {
  try {
    const fromId = req.query.from as string;
    const toId = req.query.to as string;

    if (!fromId || !toId) {
      sendSuccess(res, { path: [], directions: [], error: "Both 'from' and 'to' room IDs required." });
      return;
    }

    // Fetch all edges for BFS
    const { data: edges, error } = await supabaseAdmin
      .from("map_edges")
      .select("from_room_id, to_room_id, distance, direction")
      .eq("is_accessible", true);

    if (error) throw error;

    // Build adjacency list
    const adj = new Map<string, { to: string; distance: number; direction: string | null }[]>();
    for (const edge of edges ?? []) {
      if (!adj.has(edge.from_room_id)) adj.set(edge.from_room_id, []);
      if (!adj.has(edge.to_room_id)) adj.set(edge.to_room_id, []);
      adj.get(edge.from_room_id)!.push({ to: edge.to_room_id, distance: edge.distance, direction: edge.direction });
      adj.get(edge.to_room_id)!.push({ to: edge.from_room_id, distance: edge.distance, direction: edge.direction ? reverseDirection(edge.direction) : null });
    }

    // BFS to find shortest path
    const visited = new Set<string>();
    const parent = new Map<string, { from: string; direction: string | null }>();
    const queue = [fromId];
    visited.add(fromId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === toId) break;

      for (const neighbor of adj.get(current) ?? []) {
        if (!visited.has(neighbor.to)) {
          visited.add(neighbor.to);
          parent.set(neighbor.to, { from: current, direction: neighbor.direction });
          queue.push(neighbor.to);
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    const directions: string[] = [];
    let current = toId;

    if (!parent.has(toId) && fromId !== toId) {
      sendSuccess(res, { path: [], directions: [], message: "No path found between these rooms." });
      return;
    }

    while (current !== fromId) {
      path.unshift(current);
      const p = parent.get(current);
      if (!p) break;
      if (p.direction) directions.unshift(p.direction);
      current = p.from;
    }
    path.unshift(fromId);

    // Fetch room details for the path
    const { data: roomDetails } = await supabaseAdmin
      .from("rooms")
      .select("id, room_number, name, room_type, floors(name, floor_number)")
      .in("id", path);

    const roomMap = new Map((roomDetails ?? []).map(r => [r.id, r]));
    const pathWithDetails = path.map(id => roomMap.get(id) || { id });

    sendSuccess(res, { path: pathWithDetails, directions });
  } catch (err) {
    next(err);
  }
});

function reverseDirection(dir: string): string {
  const map: Record<string, string> = {
    "left": "right", "right": "left",
    "up": "down", "down": "up",
    "forward": "back", "back": "forward",
    "north": "south", "south": "north",
    "east": "west", "west": "east",
    "upstairs": "downstairs", "downstairs": "upstairs",
  };
  return map[dir.toLowerCase()] || dir;
}

// ── Admin write endpoints ───────────────────────────────────────────

/**
 * POST /map/rooms — Create a room (ADMIN)
 */
router.post(
  "/rooms",
  authenticate,
  authorize("ADMIN"),
  validate({
    body: z.object({
      floorId: z.string().uuid(),
      departmentId: z.string().uuid().optional(),
      roomNumber: z.string().min(1),
      roomType: z.string(),
      name: z.string().optional(),
      capacity: z.number().optional(),
      xCoord: z.number().optional(),
      yCoord: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      svgPath: z.string().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      const { floorId, departmentId, roomNumber, roomType, name, capacity, xCoord, yCoord, width, height, svgPath } = req.body;

      const { data, error } = await supabaseAdmin
        .from("rooms")
        .insert({
          floor_id: floorId,
          department_id: departmentId,
          room_number: roomNumber,
          room_type: roomType,
          name,
          capacity,
          x_coord: xCoord,
          y_coord: yCoord,
          width,
          height,
          svg_path: svgPath,
        })
        .select()
        .single();

      if (error) throw error;
      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /map/edges — Create a navigation edge (ADMIN)
 */
router.post(
  "/edges",
  authenticate,
  authorize("ADMIN"),
  validate({
    body: z.object({
      fromRoomId: z.string().uuid(),
      toRoomId: z.string().uuid(),
      distance: z.number().default(1),
      direction: z.string().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      const { fromRoomId, toRoomId, distance, direction } = req.body;

      const { data, error } = await supabaseAdmin
        .from("map_edges")
        .insert({
          from_room_id: fromRoomId,
          to_room_id: toRoomId,
          distance,
          direction,
        })
        .select()
        .single();

      if (error) throw error;
      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /map/floor-plan/:floorId — Get complete floor plan data for vector rendering
 */
router.get("/floor-plan/:floorId", authenticate, async (req, res, next) => {
  try {
    const { data: floor, error: floorErr } = await supabaseAdmin
      .from("floors")
      .select("*, buildings(name, hospitals(name))")
      .eq("id", req.params.floorId)
      .single();

    if (floorErr || !floor) throw new NotFoundError("Floor not found.");

    const { data: rooms } = await supabaseAdmin
      .from("rooms")
      .select("*, departments(name, code)")
      .eq("floor_id", req.params.floorId)
      .eq("is_active", true);

    const roomIds = (rooms ?? []).map(r => r.id);
    const { data: edges } = await supabaseAdmin
      .from("map_edges")
      .select("*")
      .or(`from_room_id.in.(${roomIds.join(",")}),to_room_id.in.(${roomIds.join(",")})`)
      .eq("is_accessible", true);

    sendSuccess(res, {
      floor,
      rooms: rooms ?? [],
      edges: edges ?? [],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
