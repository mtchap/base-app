"use client";

import { AppDataProvider } from "@/lib/AppDataContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AppDataProvider>{children}</AppDataProvider>;
}
