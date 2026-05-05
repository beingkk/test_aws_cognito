"use client";

import { useEffect } from "react";
import { configureAmplify } from "../lib/amplify-config";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureAmplify();
  }, []);

  return children;
}
