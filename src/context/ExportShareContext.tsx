"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ExportPayload } from "@/lib/export/types";

interface ExportShareContextValue {
  payload: ExportPayload | null;
  setExportPayload: (payload: ExportPayload | null) => void;
  toastVisible: boolean;
  showCopiedToast: () => void;
  hideToast: () => void;
}

const ExportShareContext = createContext<ExportShareContextValue | null>(null);

export function ExportShareProvider({ children }: { children: ReactNode }) {
  const [payload, setPayloadState] = useState<ExportPayload | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const setExportPayload = useCallback((next: ExportPayload | null) => {
    setPayloadState(next);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const showCopiedToast = useCallback(() => {
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2600);
  }, []);

  const value = useMemo(
    () => ({
      payload,
      setExportPayload,
      toastVisible,
      showCopiedToast,
      hideToast,
    }),
    [payload, setExportPayload, toastVisible, showCopiedToast, hideToast],
  );

  return (
    <ExportShareContext.Provider value={value}>
      {children}
    </ExportShareContext.Provider>
  );
}

export function useExportShare() {
  const context = useContext(ExportShareContext);
  if (!context) {
    throw new Error("useExportShare must be used within ExportShareProvider");
  }
  return context;
}
