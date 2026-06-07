"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CandidateIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/candidate/dashboard");
  }, [router]);

  return null;
}
