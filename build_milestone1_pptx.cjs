// Milestone 1 progress deck generator — Smart Digital OPD Management System
// Run:  node build_milestone1_pptx.cjs
// Requires pptxgenjs (npm install pptxgenjs if not present)
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
pres.author = "Semester Project Team";
pres.title = "Smart Digital OPD Management System — Milestone 1";

// ---- Palette (healthcare + AI, teal-based) ----
const C = {
  dark:  "0B2E30",  // dark teal (title/conclusion bg)
  deep:  "0E5B58",  // deep teal
  teal:  "0E7C7B",  // primary teal
  mint:  "2EC4B6",  // secondary seafoam/mint
  accent:"F2A541",  // amber accent (AI/energy)
  light: "FFFFFF",
  surf:  "EAF3F2",  // card tint
  surf2: "F4F9F8",
  ink:   "13333A",  // body text
  muted: "5B7377",  // muted text
  line:  "CFE1DF",
  red:   "D64550",
  amber: "E8A13A",
  green: "2E9E6B",
  white: "FFFFFF",
};
const F = { head: "Cambria", body: "Calibri" };
const PW = 13.33, PH = 7.5, M = 0.6;

// ---- helpers ----
function bg(slide, color){ slide.background = { color }; }

function footer(slide, n, dark){
  const col = dark ? "8FB3B0" : C.muted;
  slide.addText("Smart Digital OPD  ·  Milestone 1 — Initial Progress Review",
    { x: M, y: PH-0.42, w: 9, h: 0.3, fontFace: F.body, fontSize: 9, color: col, align: "left" });
  slide.addText(String(n).padStart(2,"0"),
    { x: PW-1.1, y: PH-0.42, w: 0.5, h: 0.3, fontFace: F.body, fontSize: 9, color: col, align: "right" });
}

// section heading for light content slides
function heading(slide, title, kicker){
  slide.addText((kicker||"MILESTONE 1").toUpperCase(),
    { x: M, y: 0.5, w: 11, h: 0.3, fontFace: F.body, fontSize: 11, bold: true,
      color: C.teal, charSpacing: 2 });
  slide.addText(title,
    { x: M, y: 0.78, w: PW-2*M, h: 0.7, fontFace: F.head, fontSize: 30, bold: true, color: C.ink });
}

// rounded card
function card(slide, x, y, w, h, fill, opts){
  opts = opts || {};
  slide.addShape("roundRect", { x, y, w, h, fill: { color: fill },
    line: opts.line ? { color: opts.line, width: opts.lw||1 } : { type: "none" },
    rectRadius: opts.r!=null?opts.r:0.09,
    shadow: opts.shadow ? { type:"outer", color:"7A9A97", opacity:0.28, blur:6, offset:2, angle:90 } : undefined });
}

// small numbered/glyph circle
function circle(slide, x, y, d, fill, label, labelColor, fs){
  slide.addShape("ellipse", { x, y, w:d, h:d, fill:{ color: fill }, line:{ type:"none" } });
  slide.addText(label, { x, y, w:d, h:d, align:"center", valign:"middle",
    fontFace: F.head, fontSize: fs||14, bold:true, color: labelColor||C.white, margin:0 });
}

// vertical flow: array of {t, fill?, tc?} rendered as pills with down arrows
function vflow(slide, x, y, w, items, ph){
  const gap = 0.18;
  const total = items.length;
  const boxH = ph || Math.min(0.5, (5.4 - (total-1)*gap) / total);
  let cy = y;
  items.forEach((it, i) => {
    card(slide, x, cy, w, boxH, it.fill || C.surf, { r:0.08, line: it.line||C.line, lw:1 });
    slide.addText(it.t, { x:x+0.12, y:cy, w:w-0.24, h:boxH, align:"center", valign:"middle",
      fontFace: F.body, fontSize: it.fs||12.5, bold: it.bold!==false, color: it.tc || C.ink, margin:0 });
    if (i < total-1){
      slide.addText("▼", { x:x+w/2-0.2, y:cy+boxH-0.02, w:0.4, h:gap+0.04, align:"center", valign:"middle",
        fontFace:F.body, fontSize:10, color:C.mint, margin:0 });
    }
    cy += boxH + gap;
  });
  return cy;
}

// horizontal arrow between two x positions
function harrow(slide, x, y, w){
  slide.addShape("rightArrow", { x, y, w, h:0.16, fill:{color:C.mint}, line:{type:"none"} });
}

// ============ SLIDE 1 — TITLE ============
(function(){
  const s = pres.addSlide(); bg(s, C.dark);
  // subtle motif: layered translucent rounded panels on the right
  s.addShape("roundRect", { x: 9.7, y: -1.2, w: 5.2, h: 5.2, rectRadius:0.4,
    fill:{ color:C.teal, transparency:70 }, line:{type:"none"} });
  s.addShape("roundRect", { x: 10.6, y: 3.6, w: 4.6, h: 4.6, rectRadius:0.4,
    fill:{ color:C.mint, transparency:80 }, line:{type:"none"} });
  s.addShape("ellipse", { x: 11.4, y: 1.3, w: 2.6, h: 2.6, fill:{color:C.accent, transparency:82}, line:{type:"none"} });

  s.addText("SEMESTER PROJECT  ·  MILESTONE 1 — INITIAL PROGRESS REVIEW",
    { x:M, y:1.05, w:9.2, h:0.35, fontFace:F.body, fontSize:12.5, bold:true, color:C.mint, charSpacing:2 });
  s.addText("Design and Development of a\nSmart Digital OPD Management System\nwith AI-Based Patient Triage",
    { x:M, y:1.7, w:9.2, h:2.6, fontFace:F.head, fontSize:34, bold:true, color:C.white, lineSpacingMultiple:1.04 });

  // thin separator via whitespace + chips row
  const chips = ["Digital OPD Workflow","AI-Assisted Symptoms","Preliminary ML Triage","Realtime Queue"];
  let cx = M;
  chips.forEach(t=>{
    const w = 0.28 + t.length*0.088;
    s.addShape("roundRect",{ x:cx, y:4.55, w, h:0.42, rectRadius:0.21, fill:{color:C.deep}, line:{type:"none"} });
    s.addText(t,{ x:cx, y:4.55, w, h:0.42, align:"center", valign:"middle", fontFace:F.body, fontSize:10.5, color:C.white, margin:0 });
    cx += w + 0.18;
  });

  s.addText([
    { text:"Team: ", options:{bold:true, color:C.mint} },
    { text:"[Add team member names / roll numbers]", options:{color:"CFE1DF"} },
  ], { x:M, y:5.5, w:9.2, h:0.32, fontFace:F.body, fontSize:13 });
  s.addText([
    { text:"Department: ", options:{bold:true, color:C.mint} },
    { text:"[Add department]        ", options:{color:"CFE1DF"} },
    { text:"Institution: ", options:{bold:true, color:C.mint} },
    { text:"[Add institution]", options:{color:"CFE1DF"} },
  ], { x:M, y:5.86, w:11, h:0.32, fontFace:F.body, fontSize:13 });
  s.addText([
    { text:"Academic Year: ", options:{bold:true, color:C.mint} },
    { text:"[Add semester / academic year]", options:{color:"CFE1DF"} },
  ], { x:M, y:6.22, w:9.2, h:0.32, fontFace:F.body, fontSize:13 });

  s.addNotes("Introduce the project: a web-based Smart Digital OPD Management System with AI-assisted patient triage. State clearly this is a Milestone 1 / Initial Progress Review, not a final defense. Mention team, department, institution and academic year. Set expectations: we present the foundation and direction, not a completed system.");
})();

// ============ SLIDE 2 — PROJECT INTRODUCTION ============
(function(){
  const s = pres.addSlide(); bg(s, C.light);
  heading(s, "Project Introduction", "Overview");

  s.addText("A web-based Smart Digital OPD Management System that improves the outpatient workflow — from registration through consultation — by combining digital records with an AI-assisted, priority-aware triage layer.",
    { x:M, y:1.62, w:7.4, h:0.95, fontFace:F.body, fontSize:15, color:C.ink, lineSpacingMultiple:1.06 });

  // left: capability grid (2 columns)
  const caps = [
    "Digital patient registration","OPD visit management",
    "Structured symptom collection","AI-assisted symptom understanding",
    "Preliminary ML-based triage","Safety-rule evaluation",
    "Priority-aware queue management","Realtime staff–doctor coordination",
  ];
  const gx = M, gy = 2.75, cw = 3.6, ch = 0.62, gxp = 0.2, gyp = 0.18;
  caps.forEach((t,i)=>{
    const col = i % 2, row = Math.floor(i/2);
    const x = gx + col*(cw+gxp), y = gy + row*(ch+gyp);
    card(s, x, y, cw, ch, C.surf2, { r:0.08, line:C.line, lw:1 });
    s.addShape("ellipse",{ x:x+0.16, y:y+ch/2-0.08, w:0.16, h:0.16, fill:{color:C.mint}, line:{type:"none"} });
    s.addText(t,{ x:x+0.44, y:y, w:cw-0.56, h:ch, valign:"middle", fontFace:F.body, fontSize:12, color:C.ink, margin:0 });
  });

  // right: vertical workflow panel
  card(s, 8.55, 1.55, 4.18, 5.35, C.dark, { r:0.12 });
  s.addText("CORE FLOW", { x:8.55, y:1.72, w:4.18, h:0.3, align:"center", fontFace:F.body, fontSize:11, bold:true, color:C.mint, charSpacing:2 });
  const flow = ["Patient","Registration","OPD Visit","Symptoms","AI-Assisted Understanding","Preliminary Triage","Priority Queue","Doctor"];
  const fy0 = 2.15, fbh = 0.42, fgap = 0.155, fx = 8.9, fw = 3.48;
  flow.forEach((t,i)=>{
    const y = fy0 + i*(fbh+fgap);
    const hi = (t.includes("AI") || t.includes("Triage"));
    card(s, fx, y, fw, fbh, hi ? C.teal : "10403F", { r:0.09, line: hi?C.mint:"1C5250", lw:1 });
    s.addText(t,{ x:fx, y:y, w:fw, h:fbh, align:"center", valign:"middle", fontFace:F.body, fontSize:11.5, bold:true, color: C.white, margin:0 });
    if(i<flow.length-1) s.addText("▼",{ x:fx+fw/2-0.15, y:y+fbh-0.02, w:0.3, h:fgap+0.03, align:"center", valign:"middle", fontFace:F.body, fontSize:8.5, color:C.mint, margin:0 });
  });

  footer(s, 2, false);
  s.addNotes("We are building a web application that improves the OPD workflow end to end: digital registration, visit management and structured symptom collection, plus AI-assisted symptom understanding, preliminary ML triage, safety rules and a priority-aware realtime queue. Walk the flow on the right. Emphasise 'assisted' and 'preliminary' — the system supports staff, it does not replace clinical judgement.");
})();

// ============ SLIDE 3 — EXISTING SYSTEM & PROBLEM ============
(function(){
  const s = pres.addSlide(); bg(s, C.light);
  heading(s, "Existing System & Problem", "Context");

  s.addText("Digital OPD is already established. National ecosystems such as India's ORS / eHospital provide substantial digital capability. The opportunity is a more integrated, intelligent OPD workflow on top of that foundation.",
    { x:M, y:1.62, w:PW-2*M, h:0.7, fontFace:F.body, fontSize:14, color:C.ink, lineSpacingMultiple:1.05 });

  // left panel — existing
  const lx=M, pw=5.55, py=2.55, pht=4.3;
  card(s, lx, py, pw, pht, C.surf2, { r:0.12, line:C.line, lw:1 });
  s.addText("EXISTING DIGITAL OPD (ORS / eHospital)", { x:lx+0.3, y:py+0.22, w:pw-0.6, h:0.35, fontFace:F.body, fontSize:12.5, bold:true, color:C.deep, charSpacing:1 });
  const ex = ["Digital patient registration","OPD appointment workflows","Patient records & digital OPD slips","Prescriptions & laboratory reports","Hospital administration","Dashboards & reports"];
  ex.forEach((t,i)=>{
    const y = py+0.72 + i*0.56;
    s.addShape("ellipse",{ x:lx+0.32, y:y+0.06, w:0.14, h:0.14, fill:{color:C.muted}, line:{type:"none"} });
    s.addText(t,{ x:lx+0.6, y:y-0.04, w:pw-0.9, h:0.36, valign:"middle", fontFace:F.body, fontSize:12.5, color:C.ink, margin:0 });
  });

  // plus
  circle(s, 6.42, 4.35, 0.6, C.accent, "+", C.white, 26);

  // right panel — our focus
  const rx=7.22, rpw=5.55;
  card(s, rx, py, rpw, pht, C.dark, { r:0.12 });
  s.addText("OUR FOCUS", { x:rx+0.3, y:py+0.22, w:rpw-0.6, h:0.35, fontFace:F.body, fontSize:12.5, bold:true, color:C.mint, charSpacing:1 });
  const our = ["AI-assisted symptom understanding","Preliminary ML-based triage","Deterministic safety rules","Priority-aware live queue","Realtime staff–doctor coordination"];
  our.forEach((t,i)=>{
    const y = py+0.78 + i*0.63;
    s.addShape("ellipse",{ x:rx+0.32, y:y+0.07, w:0.14, h:0.14, fill:{color:C.mint}, line:{type:"none"} });
    s.addText(t,{ x:rx+0.6, y:y-0.04, w:rpw-0.9, h:0.4, valign:"middle", fontFace:F.body, fontSize:13, bold:true, color:C.white, margin:0 });
  });

  footer(s, 3, false);
  s.addNotes("Be explicit that digital OPD is NOT new — ORS/eHospital already provide registration, appointments, records, OPD slips, prescriptions, lab reports, administration and reporting. So the problem is not 'hospitals are manual.' The opportunity: existing systems digitise administration and records well; we add an integrated intelligent layer — AI symptom understanding, preliminary ML triage, safety rules, priority-aware live queue and realtime coordination. Avoid any 'first in the world' or 'no hospital has this' claims.");
})();

// ============ SLIDE 4 — OBJECTIVES ============
(function(){
  const s = pres.addSlide(); bg(s, C.light);
  heading(s, "Objectives", "Goals");

  const obj = [
    "Digitize patient registration and OPD visit management.",
    "Structure patient symptom information.",
    "Provide AI-assisted symptom interaction and extraction.",
    "Develop a prototype ML-based preliminary triage model.",
    "Apply deterministic safety rules before prioritization.",
    "Improve queue prioritization and realtime OPD coordination.",
    "Implement secure authentication and role-based access.",
    "Establish a foundation for future intelligent OPD services.",
  ];
  const gx=M, gy=1.75, cw=5.9, ch=1.12, gxp=0.25, gyp=0.2;
  obj.forEach((t,i)=>{
    const col=i%2, row=Math.floor(i/2);
    const x=gx+col*(cw+gxp), y=gy+row*(ch+gyp);
    card(s, x, y, cw, ch, C.surf2, { r:0.1, line:C.line, lw:1, shadow:true });
    circle(s, x+0.28, y+ch/2-0.28, 0.56, i%2===0?C.teal:C.deep, String(i+1), C.white, 18);
    s.addText(t,{ x:x+1.02, y:y+0.1, w:cw-1.25, h:ch-0.2, valign:"middle", fontFace:F.body, fontSize:13.5, color:C.ink, lineSpacingMultiple:1.03, margin:0 });
  });

  footer(s, 4, false);
  s.addNotes("These are intentions for the full project, not all achieved yet. Group them: (1-2) digitise and structure OPD data; (3-5) the intelligence layer — AI symptom interaction, prototype ML triage, safety rules; (6) queue and realtime coordination; (7) security and RBAC; (8) foundation for future patient-facing services. Stress the ML triage is a prototype and safety rules run before prioritisation.");
})();

// ============ SLIDE 5 — PROPOSED WORKFLOW ============
(function(){
  const s = pres.addSlide(); bg(s, C.light);
  heading(s, "Proposed Smart OPD Workflow", "Concept");

  const hi = { fill:C.teal, tc:C.white, line:C.mint };
  const col1 = [
    { t:"Patient Registration" }, { t:"OPD Visit Creation" }, { t:"Symptom Collection" },
    { t:"AI-Assisted Symptom Understanding", ...hi }, { t:"Structured Symptoms" },
    { t:"Safety-Rule Evaluation", ...hi },
  ];
  const col2 = [
    { t:"ML-Based Preliminary Triage", ...hi }, { t:"Priority-Aware Queue" },
    { t:"Realtime Staff / Doctor Updates" }, { t:"Doctor Consultation" }, { t:"Visit Completion" },
  ];
  vflow(s, M, 1.75, 4.1, col1, 0.62);
  vflow(s, 5.0, 1.75, 4.1, col2, 0.62);
  // connector between columns
  s.addShape("rightArrow",{ x:4.72, y:5.55, w:0.5, h:0.18, fill:{color:C.accent}, line:{type:"none"} });

  // boundary callout
  const bx=9.55, bw=3.18;
  card(s, bx, 1.75, bw, 5.0, C.dark, { r:0.12 });
  s.addShape("ellipse",{ x:bx+bw/2-0.35, y:2.05, w:0.7, h:0.7, fill:{color:C.teal}, line:{color:C.mint, width:1.5} });
  s.addText("!", { x:bx+bw/2-0.35, y:2.05, w:0.7, h:0.7, align:"center", valign:"middle", fontFace:F.head, fontSize:26, bold:true, color:C.white, margin:0 });
  s.addText("Important Boundary", { x:bx+0.2, y:2.95, w:bw-0.4, h:0.35, align:"center", fontFace:F.body, fontSize:13, bold:true, color:C.mint });
  s.addText([
    { text:"AI does NOT diagnose the patient.\n\n", options:{bold:true, color:C.white} },
    { text:"The system provides preliminary triage / decision support only.\n\n", options:{color:"CFE1DF"} },
    { text:"The final clinical decision remains with the authorized healthcare professional.", options:{color:"CFE1DF"} },
  ], { x:bx+0.3, y:3.4, w:bw-0.6, h:3.1, fontFace:F.body, fontSize:12.5, align:"left", lineSpacingMultiple:1.05, valign:"top" });

  footer(s, 5, false);
  s.addNotes("This is the complete conceptual workflow. Note the order: AI structures symptoms first, then deterministic safety rules are evaluated, then the ML model produces a PRELIMINARY priority. Safety rules take precedence over the model. Restate the boundary on the right: AI does not diagnose; it is decision support; the final clinical decision stays with the authorised professional.");
})();

// ============ SLIDE 6 — SYSTEM ARCHITECTURE ============
(function(){
  const s = pres.addSlide(); bg(s, C.light);
  heading(s, "System Architecture", "Technology");

  const LX=M, LW=8.1;
  // frontend band
  function band(y, h, fill, title, sub){
    card(s, LX, y, LW, h, fill, { r:0.1 });
    s.addText([
      { text:title, options:{bold:true, fontSize:15, color:C.white} },
      { text:sub?("   —   "+sub):"", options:{fontSize:12, color:"D7ECEA"} },
    ], { x:LX+0.3, y:y, w:LW-0.6, h:h, valign:"middle", fontFace:F.body, margin:0 });
  }
  band(1.8, 0.72, C.teal, "React Frontend", "React + Vite + Tailwind CSS");
  s.addText("▼",{ x:LX+LW/2-0.15, y:2.5, w:0.3, h:0.24, align:"center", fontFace:F.body, fontSize:11, color:C.mint, margin:0 });
  band(2.72, 0.72, C.deep, "Node.js + Express", "API Layer");
  s.addText("▼",{ x:LX+LW/2-0.15, y:3.42, w:0.3, h:0.24, align:"center", fontFace:F.body, fontSize:11, color:C.mint, margin:0 });

  // three service cards
  const sy=3.72, sh=1.62, sw=2.5, sgap=0.3;
  const svc = [
    { t:"Supabase\nPostgreSQL + PostGIS", d:"Data & geospatial", c:C.dark },
    { t:"Gemini AI", d:"Symptom language\nunderstanding", c:C.dark },
    { t:"Python FastAPI", d:"scikit-learn\nML triage model", c:C.dark },
  ];
  svc.forEach((v,i)=>{
    const x = LX + i*(sw+sgap);
    card(s, x, sy, sw, sh, v.c, { r:0.1, line:C.deep, lw:1 });
    s.addText(v.t,{ x:x+0.15, y:sy+0.22, w:sw-0.3, h:0.7, align:"center", fontFace:F.body, fontSize:13.5, bold:true, color:C.white, margin:0, lineSpacingMultiple:1.0 });
    s.addText(v.d,{ x:x+0.15, y:sy+0.95, w:sw-0.3, h:0.55, align:"center", fontFace:F.body, fontSize:11, color:C.mint, margin:0, lineSpacingMultiple:1.0 });
  });
  // small connectors from backend to services
  [0,1,2].forEach(i=>{ const x=LX+i*(sw+sgap)+sw/2; s.addShape("line",{ x, y:3.44, w:0, h:0.28, line:{color:C.line, width:1.5} }); });

  // right column: security + realtime
  const RX=9.1, RW=3.63;
  card(s, RX, 1.8, RW, 2.62, C.surf2, { r:0.12, line:C.line, lw:1 });
  s.addText("SECURITY", { x:RX+0.25, y:1.95, w:RW-0.5, h:0.3, fontFace:F.body, fontSize:11.5, bold:true, color:C.deep, charSpacing:1.5 });
  ["Supabase Auth","JWT","RBAC","RLS","PostgreSQL"].forEach((t,i)=>{
    const y=2.35+i*0.4;
    s.addText([{text:"▸  ", options:{color:C.mint, bold:true}},{text:t, options:{color:C.ink}}],
      { x:RX+0.3, y, w:RW-0.55, h:0.36, valign:"middle", fontFace:F.body, fontSize:12.5, margin:0 });
  });
  card(s, RX, 4.62, RW, 2.13, C.dark, { r:0.12 });
  s.addText("REALTIME LAYER", { x:RX+0.25, y:4.8, w:RW-0.5, h:0.3, fontFace:F.body, fontSize:11.5, bold:true, color:C.mint, charSpacing:1.5 });
  s.addText("Socket.io", { x:RX+0.25, y:5.15, w:RW-0.5, h:0.55, fontFace:F.head, fontSize:24, bold:true, color:C.white });
  s.addText("Single realtime layer for live queue and staff/doctor status updates.",
    { x:RX+0.25, y:5.75, w:RW-0.5, h:0.85, fontFace:F.body, fontSize:11.5, color:"CFE1DF", lineSpacingMultiple:1.03 });

  footer(s, 6, false);
  s.addNotes("High-level only. React front end talks to a Node.js + Express backend, which coordinates three services: Supabase PostgreSQL with PostGIS for data, Gemini for AI language tasks, and a Python FastAPI service running scikit-learn for the custom ML triage model. Security spans Supabase Auth to JWT to RBAC to Row-Level Security. Realtime is handled by Socket.io — the single realtime layer. If asked: no Firebase, no MongoDB, no separate realtime service.");
})();

// ============ SLIDE 7 — MILESTONE 1 FOUNDATION ============
(function(){
  const s = pres.addSlide(); bg(s, C.light);
  heading(s, "Milestone 1 — Initial System Foundation", "Progress so far");

  const items = [
    { t:"Project Architecture", b:["Overall Smart OPD workflow defined","Major components & data flow identified"] },
    { t:"Minimal Frontend Design", b:["Initial frontend prototype developed","Basic OPD workflow & interface established","Labelled as an initial / minimal prototype"] },
    { t:"Initial Backend Foundation", b:["Initial backend components developed","Server-side foundation for future OPD APIs","Complete backend not yet finished"] },
    { t:"AI / ML Approach Exploration", b:["AI-assisted symptom workflow explored","Preliminary ML triage approach defined","Safety-rule layer identified"] },
    { t:"Dataset Exploration", b:["Relevant symptom datasets explored","Examined for triage-model suitability","No final model trained yet"] },
    { t:"Existing-System Research", b:["ORS / eHospital ecosystem studied","Digital OPD capabilities analysed","Project gap & differentiation identified"] },
  ];
  const gx=M, gy=1.72, cw=3.87, ch=2.32, gxp=0.26, gyp=0.24;
  items.forEach((it,i)=>{
    const col=i%3, row=Math.floor(i/3);
    const x=gx+col*(cw+gxp), y=gy+row*(ch+gyp);
    card(s, x, y, cw, ch, C.surf2, { r:0.1, line:C.line, lw:1, shadow:true });
    circle(s, x+0.24, y+0.24, 0.5, i<3?C.teal:C.deep, String(i+1), C.white, 16);
    s.addText(it.t,{ x:x+0.85, y:y+0.24, w:cw-1.05, h:0.5, valign:"middle", fontFace:F.head, fontSize:14.5, bold:true, color:C.ink, margin:0 });
    const runs=[];
    it.b.forEach((line,j)=>{
      runs.push({ text:line, options:{ bullet:{ code:"2022", indent:12 }, color:C.ink, breakLine:true, paraSpaceAfter:4 } });
    });
    s.addText(runs, { x:x+0.32, y:y+0.86, w:cw-0.6, h:ch-1.0, fontFace:F.body, fontSize:11, valign:"top", lineSpacingMultiple:1.0 });
  });

  footer(s, 7, false);
  s.addNotes("The core 'what have you done' slide — be precise and honest. Architecture defined. Minimal frontend prototype exists (initial/minimal, mock-data driven, not final UI). Initial backend foundation only — complete backend not finished. AI/ML approach explored and defined. Datasets explored for suitability — no final model trained. Existing digital OPD systems researched to identify the gap.");
})();

// ============ SLIDE 8 — AI/ML & DATASET EXPLORATION ============
(function(){
  const s = pres.addSlide(); bg(s, C.light);
  heading(s, "AI/ML & Dataset Exploration", "Research");

  // left pipeline
  const steps = [
    { t:"Healthcare / Symptom Datasets" }, { t:"Dataset Exploration" },
    { t:"Feature & Label Analysis" }, { t:"Preprocessing Strategy" },
    { t:"Candidate ML Models" }, { t:"Preliminary Triage Model", fill:C.teal, tc:C.white, line:C.mint },
  ];
  vflow(s, M, 1.8, 3.75, steps, 0.6);

  // right top: datasets explored
  const RX=4.85, RW=7.88;
  card(s, RX, 1.8, RW, 2.15, C.surf2, { r:0.12, line:C.line, lw:1 });
  s.addText("DATASETS EXPLORED", { x:RX+0.28, y:1.95, w:RW-0.56, h:0.3, fontFace:F.body, fontSize:12, bold:true, color:C.deep, charSpacing:1.5 });
  const ds = ["MIMIC-IV-ED","MIMIC-IV-ED Demo","Symptom2Disease","MedQuAD","MedDialog"];
  let dx=RX+0.28;
  ds.forEach(t=>{
    const w=0.3+t.length*0.095;
    s.addShape("roundRect",{ x:dx, y:2.32, w, h:0.42, rectRadius:0.21, fill:{color:C.teal}, line:{type:"none"} });
    s.addText(t,{ x:dx, y:2.32, w, h:0.42, align:"center", valign:"middle", fontFace:F.body, fontSize:11, color:C.white, margin:0 });
    dx+=w+0.16;
  });
  s.addText("Explored for suitability; dataset selection in progress. Purpose: identify suitable data to train and evaluate a prototype model for preliminary OPD triage prioritization.",
    { x:RX+0.28, y:2.92, w:RW-0.56, h:0.9, fontFace:F.body, fontSize:12, color:C.ink, lineSpacingMultiple:1.05 });

  // right bottom left: candidate models
  const BY=4.12, BH=2.6;
  card(s, RX, BY, 3.78, BH, C.light, { r:0.12, line:C.line, lw:1 });
  s.addText("CANDIDATE MODELS", { x:RX+0.28, y:BY+0.18, w:3.4, h:0.3, fontFace:F.body, fontSize:12, bold:true, color:C.deep, charSpacing:1.5 });
  [["TF-IDF + Logistic Regression","baseline (text)"],["Random Forest","under consideration"],["XGBoost","under consideration"]].forEach((m,i)=>{
    const y=BY+0.62+i*0.62;
    s.addText([{text:m[0]+"\n", options:{bold:true, color:C.ink, fontSize:12.5}},{text:m[1], options:{color:C.muted, fontSize:10.5}}],
      { x:RX+0.28, y, w:3.3, h:0.58, fontFace:F.body, valign:"middle", margin:0, lineSpacingMultiple:0.95 });
  });
  s.addText("scikit-learn · served via FastAPI", { x:RX+0.28, y:BY+BH-0.42, w:3.3, h:0.3, fontFace:F.body, fontSize:10.5, italic:true, color:C.muted });

  // right bottom right: triage target
  const TX=RX+3.98, TW=3.9;
  card(s, TX, BY, TW, BH, C.dark, { r:0.12 });
  s.addText("TRIAGE TARGET (PRIORITY)", { x:TX+0.28, y:BY+0.18, w:TW-0.56, h:0.3, fontFace:F.body, fontSize:12, bold:true, color:C.mint, charSpacing:1.2 });
  [["RED",C.red],["YELLOW",C.amber],["GREEN",C.green]].forEach((p,i)=>{
    const y=BY+0.6+i*0.42;
    s.addShape("roundRect",{ x:TX+0.28, y, w:1.6, h:0.34, rectRadius:0.05, fill:{color:p[1]}, line:{type:"none"} });
    s.addText(p[0],{ x:TX+0.28, y, w:1.6, h:0.34, align:"center", valign:"middle", fontFace:F.body, fontSize:11.5, bold:true, color:C.white, margin:0 });
  });
  s.addText("Operational priority — not a medical diagnosis.", { x:TX+2.0, y:BY+0.6, w:TW-2.2, h:1.1, fontFace:F.body, fontSize:11.5, color:"CFE1DF", valign:"top", lineSpacingMultiple:1.05, margin:0 });
  s.addText("No accuracy or performance results yet — the model has not been trained.",
    { x:TX+0.28, y:BY+BH-0.72, w:TW-0.56, h:0.6, fontFace:F.body, fontSize:11, bold:true, italic:true, color:C.accent, lineSpacingMultiple:1.02 });

  footer(s, 8, false);
  s.addNotes("We have already begun the intelligent-system research, not just the UI. Pipeline: candidate datasets to feature/label analysis to preprocessing to candidate models to a preliminary triage model. Name only datasets we examined (MIMIC-IV-ED and its demo subset, Symptom2Disease; others supporting/optional). The target is an operational priority RED/YELLOW/GREEN, not a diagnosis. Candidate models: TF-IDF + Logistic Regression baseline, then Random Forest / XGBoost. Be explicit: no accuracy numbers yet — placeholders only.");
})();

// ============ SLIDE 9 — CURRENT STATUS & NEXT STEPS ============
(function(){
  const s = pres.addSlide(); bg(s, C.light);
  heading(s, "Current Status & Next Steps", "Milestone Review");

  const achieved = [
    "Initial project architecture defined","Minimal frontend prototype developed",
    "Initial backend foundation developed","AI/ML workflow explored",
    "Relevant datasets explored","Existing digital OPD systems researched",
    "Initial system direction established",
  ];
  const next = [
    "Complete database implementation","Implement authentication & authorization",
    "Develop complete backend APIs","Integrate AI symptom pipeline",
    "Prepare & preprocess selected dataset","Train & evaluate ML model",
    "Implement safety-rule engine","Implement realtime queue management",
    "Integrate frontend with backend","Testing & validation",
  ];
  // left card
  const LX=M, LW=5.85, TY=1.75, TH=5.0;
  card(s, LX, TY, LW, TH, C.surf2, { r:0.12, line:C.line, lw:1 });
  s.addText("CURRENT / ACHIEVED", { x:LX+0.3, y:TY+0.2, w:LW-0.6, h:0.35, fontFace:F.body, fontSize:13, bold:true, color:C.green, charSpacing:1 });
  achieved.forEach((t,i)=>{
    const y=TY+0.72+i*0.585;
    s.addShape("roundRect",{ x:LX+0.3, y:y+0.02, w:0.26, h:0.26, rectRadius:0.06, fill:{color:C.green}, line:{type:"none"} });
    s.addText("✓",{ x:LX+0.3, y:y+0.02, w:0.26, h:0.26, align:"center", valign:"middle", fontFace:F.body, fontSize:11, bold:true, color:C.white, margin:0 });
    s.addText(t,{ x:LX+0.7, y:y-0.05, w:LW-1.0, h:0.4, valign:"middle", fontFace:F.body, fontSize:12.5, color:C.ink, margin:0 });
  });

  // right card
  const RX=6.85, RW=5.88;
  card(s, RX, TY, RW, TH, C.dark, { r:0.12 });
  s.addText("NEXT MILESTONE  ·  FUTURE WORK", { x:RX+0.3, y:TY+0.2, w:RW-0.6, h:0.35, fontFace:F.body, fontSize:13, bold:true, color:C.accent, charSpacing:1 });
  next.forEach((t,i)=>{
    const y=TY+0.68+i*0.42;
    s.addText("▸",{ x:RX+0.3, y:y-0.03, w:0.3, h:0.36, align:"center", valign:"middle", fontFace:F.body, fontSize:12, bold:true, color:C.mint, margin:0 });
    s.addText(t,{ x:RX+0.62, y:y-0.03, w:RW-0.9, h:0.36, valign:"middle", fontFace:F.body, fontSize:12, color:C.white, margin:0 });
  });

  footer(s, 9, false);
  s.addNotes("Left = achieved: architecture defined, minimal frontend prototype, initial backend foundation, AI/ML workflow explored, datasets explored, existing systems researched, direction established. Right = next milestone (future work): complete database, auth/authorisation, full backend APIs, AI symptom pipeline, dataset preprocessing, train/evaluate ML model, safety-rule engine, realtime queue, frontend-backend integration, testing. Keep the two columns clearly separated — the right items are not done.");
})();

// ============ SLIDE 10 — PROJECT DIRECTION (CONCLUSION) ============
(function(){
  const s = pres.addSlide(); bg(s, C.dark);
  // motif panels
  s.addShape("ellipse", { x: 11.2, y: -1.0, w: 3.2, h: 3.2, fill:{color:C.teal, transparency:78}, line:{type:"none"} });
  s.addShape("roundRect", { x: -1.0, y: 5.6, w: 4.5, h: 3.0, rectRadius:0.4, fill:{color:C.mint, transparency:85}, line:{type:"none"} });

  s.addText("CONCLUSION", { x:M, y:0.55, w:8, h:0.3, fontFace:F.body, fontSize:12, bold:true, color:C.mint, charSpacing:2 });
  s.addText("Project Direction", { x:M, y:0.85, w:10, h:0.7, fontFace:F.head, fontSize:32, bold:true, color:C.white });
  s.addText("Existing digital OPD systems already handle registration, appointments, records and hospital operations. Our project integrates an intelligent layer into a focused OPD workflow.",
    { x:M, y:1.65, w:12.1, h:0.75, fontFace:F.body, fontSize:14.5, color:"CFE1DF", lineSpacingMultiple:1.05 });

  // additive list (left)
  const comps = ["Digital OPD","AI-Assisted Symptoms","ML Preliminary Triage","Safety Rules","Realtime Queue"];
  const LX=M, LW=5.6, y0=2.75, rh=0.6, rg=0.135;
  comps.forEach((t,i)=>{
    const y=y0+i*(rh+rg);
    card(s, LX, y, LW, rh, i===0?C.teal:"10403F", { r:0.3, line:i===0?C.mint:"1C5250", lw:1 });
    s.addText(t,{ x:LX+0.5, y, w:LW-0.7, h:rh, valign:"middle", fontFace:F.body, fontSize:14, bold:true, color:C.white, margin:0 });
    if(i>0) s.addText("+",{ x:LX-0.02, y:y-rg-0.06, w:LW, h:rg+0.12, align:"center", valign:"middle", fontFace:F.head, fontSize:14, bold:true, color:C.accent, margin:0 });
  });

  // arrow to result
  s.addShape("rightArrow",{ x:6.35, y:4.35, w:0.7, h:0.22, fill:{color:C.accent}, line:{type:"none"} });

  // result card
  const RX=7.25, RW=5.48;
  card(s, RX, 3.05, RW, 3.0, C.teal, { r:0.16, line:C.mint, lw:1.5 });
  s.addText("SMART OPD WORKFLOW", { x:RX+0.3, y:3.4, w:RW-0.6, h:0.9, align:"center", valign:"middle", fontFace:F.head, fontSize:26, bold:true, color:C.white, margin:0 });
  s.addText("A secure, intelligent and realtime OPD workflow designed as a semester-level prototype — decision support for staff, not autonomous diagnosis or a doctor replacement.",
    { x:RX+0.4, y:4.4, w:RW-0.8, h:1.5, align:"center", fontFace:F.body, fontSize:13, color:"EAF7F5", lineSpacingMultiple:1.08, margin:0 });

  s.addText("Milestone 1 — Initial Progress Review", { x:M, y:6.75, w:12.1, h:0.35, align:"center", fontFace:F.body, fontSize:11.5, italic:true, color:"8FB3B0" });

  s.addNotes("Tie it together: existing digital OPD systems handle registration, appointments, records and operations well. Our contribution is to integrate AI-assisted symptom understanding, preliminary ML triage, safety-rule evaluation and a realtime priority-aware queue into one focused OPD workflow. Close on the honest positioning: a secure, intelligent, realtime OPD workflow built as a semester-level prototype — decision support, not autonomous diagnosis or a doctor replacement. Invite questions.");
})();

// ---- write ----
pres.writeFile({ fileName: "SMART_OPD_MILESTONE_1_PRESENTATION.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });










