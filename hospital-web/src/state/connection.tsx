import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ConnectionStatus = "online" | "offline" | "reconnecting";

type ConnectionContextValue = {
  status: ConnectionStatus;
  /** Frontend-only simulation of a dropped connection (no network involved). */
  simulateDrop: (ms?: number) => void;
  retry: () => void;
};

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("online");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const off = () => setStatus("offline");
    const on = () => setStatus("online");
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => {
      window.removeEventListener("offline", off);
      window.removeEventListener("online", on);
      timers.current.forEach(window.clearTimeout);
    };
  }, []);

  const retry = useCallback(() => {
    setStatus("reconnecting");
    timers.current.push(window.setTimeout(() => setStatus("online"), 1600));
  }, []);

  const simulateDrop = useCallback(
    (ms = 4000) => {
      setStatus("offline");
      timers.current.push(window.setTimeout(() => retry(), ms));
    },
    [retry],
  );

  const value = useMemo(() => ({ status, simulateDrop, retry }), [status, simulateDrop, retry]);

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error("useConnection must be used inside ConnectionProvider");
  return ctx;
}
