"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ParticleBackground } from "@/components/ui/particle-background";
import { useUserStore } from "@/store/user-store";

export default function ChatPage() {
  const router = useRouter();
  const { user } = useUserStore();

  // Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    if (!user || !user.hasCompletedOnboarding) {
      router.push("/onboarding");
    }
  }, [router, user]);

  if (!user) {
    return null; // Prevent flash of content while redirecting
  }

  return (
    <main className="min-h-screen">
      <ParticleBackground />
      <Header />
      <ChatInterface />
    </main>
  );
}