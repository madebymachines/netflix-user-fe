"use client";

import type { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ResetPasswordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute require="guest" redirect="/dashboard">
      {children}
    </ProtectedRoute>
  );
}
