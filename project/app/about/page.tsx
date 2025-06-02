"use client";

import { Header } from "@/components/header";
import { ParticleBackground } from "@/components/ui/particle-background";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-16">
      <ParticleBackground />
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <section>
            <h1 className="text-4xl font-display font-bold mb-6">About MAX<span className="text-accent">AI</span></h1>
            <p className="text-lg leading-relaxed mb-4">
              MAX AI is an advanced conversational assistant powered by Retrieval-Augmented Generation (RAG) technology, 
              designed to provide more accurate, contextual, and helpful responses.
            </p>
            <p className="text-lg leading-relaxed">
              Unlike traditional language models that rely solely on pre-trained knowledge, 
              MAX AI can dynamically retrieve relevant information from documents, websites, and knowledge bases 
              before generating responses, ensuring up-to-date and highly relevant answers.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-display font-bold mb-4">What is RAG Technology?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-bold mb-2">Retrieval-Augmented Generation</h3>
              <p className="mb-4">
                RAG combines two powerful capabilities:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Retrieval</h4>
                  <p>
                    Searches through and retrieves relevant information from a knowledge base of documents, 
                    websites, and other sources when presented with a query.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Generation</h4>
                  <p>
                    Uses the retrieved information to generate accurate, contextual responses 
                    that are grounded in specific sources rather than general knowledge.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-display font-bold mb-4">Key Benefits</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Enhanced Accuracy</h3>
                <p>
                  By retrieving specific information before responding, MAX AI provides more accurate answers 
                  that are grounded in factual sources.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Up-to-Date Information</h3>
                <p>
                  MAX AI can access and process the latest information, unlike traditional models 
                  limited to their training data cutoff.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Personalized Experience</h3>
                <p>
                  The interface and interaction style adapt to your preferences, creating 
                  a more engaging and satisfying user experience.
                </p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-display font-bold mb-4">Our Technology Stack</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="mb-4">
                MAX AI is built using cutting-edge technologies:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li><strong>Frontend:</strong> Next.js, TailwindCSS, and Framer Motion for smooth animations</li>
                <li><strong>Language Model:</strong> Powered by Google's Gemini 2.0 Flash model</li>
                <li><strong>RAG Architecture:</strong> Utilizing LangChain for document processing and retrieval</li>
                <li><strong>Vector Database:</strong> Using advanced embedding storage for efficient document retrieval</li>
              </ul>
            </div>
          </section>
        </motion.div>
      </div>
    </main>
  );
}