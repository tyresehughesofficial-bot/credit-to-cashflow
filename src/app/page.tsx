"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Client redirect so the home route works in both the server build (Vercel)
// and the fully static export (GitHub Pages preview).
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/command-center");
  }, [router]);
  return null;
}
