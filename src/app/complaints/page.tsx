"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-store";
import { Loader2 } from "lucide-react";

export default function ComplaintsPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.push("/complaints/new");
    } else {
      router.push("/register");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
    </div>
  );
}
