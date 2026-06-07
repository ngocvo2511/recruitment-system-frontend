"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getStoredAccountType, getStoredToken } from "@/lib/authSession";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    const accountType = getStoredAccountType();
    router.replace(token && accountType === "admin" ? "/admin/dashboard" : "/admin/login");
  }, [router]);

  return null;
}
