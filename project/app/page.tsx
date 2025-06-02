"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ParticleBackground } from "@/components/ui/particle-background";
import { useUserStore } from "@/store/user-store";

export default function Home() {
  const router = useRouter();
  const { user } = useUserStore();

  // Check if user has completed onboarding
  useEffect(() => {
    if (user && user.hasCompletedOnboarding) {
      router.push("/chat");
    }
  }, [router, user]);

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden gradient-bg p-4">
      <ParticleBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-display font-bold mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="text-primary">MAX</span>
          <span className="text-accent">AI</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl mb-8 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Advanced AI assistant powered by Retrieval-Augmented Generation technology
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-display text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={handleGetStarted}
          >
            Get Started
          </motion.button>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-10 text-center z-10 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        Personalizing your experience with cutting-edge AI technology
      </motion.div>
    </main>
  );
}