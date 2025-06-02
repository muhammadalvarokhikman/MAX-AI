"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { ParticleBackground } from "@/components/ui/particle-background";
import { useUserStore } from "@/store/user-store";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUserStore();

  // Check if user has already completed onboarding
  useEffect(() => {
    if (user && user.hasCompletedOnboarding) {
      router.push("/chat");
    }
  }, [router, user]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <ParticleBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <OnboardingForm />
      </motion.div>
    </main>
  );
}