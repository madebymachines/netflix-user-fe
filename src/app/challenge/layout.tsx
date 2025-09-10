"use client";

import type { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ChallengeLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute require="auth" redirect="/sign-in">
      {children}
    </ProtectedRoute>
  );
}