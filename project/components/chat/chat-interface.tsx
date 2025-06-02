"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Upload, Bot, Trash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore, Message, MessageRole } from "@/store/chat-store";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/user-store";
import { toast } from "sonner";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, addMessage, isLoading, setLoading, clearMessages } = useChatStore();
  const { user } = useUserStore();
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    addMessage(input, 'user');
    setInput("");
    
    // Set loading state for AI response
    setLoading(true);
    
    try {
      // Generate AI response
      const response = await api.generateResponse(input, messages.map(m => m.content));
      
      // Add AI response with slight delay for natural feeling
      setTimeout(() => {
        addMessage(response, 'assistant');
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error generating response:", error);
      setLoading(false);
      toast.error("Sorry, I couldn't generate a response. Please try again.");
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Add a system message about the document
      addMessage(`Uploading document: ${file.name}`, 'system');
      
      // Simulate document processing
      await api.indexDocument(file);
      
      // Add confirmation message
      addMessage(
        `I've indexed the document "${file.name}" (${(file.size / 1024).toFixed(1)} KB). You can now ask questions about it.`,
        'assistant'
      );
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pt-16">
      {/* Message area */}
      <ScrollArea className="flex-1 p-4 bg-[hsl(var(--chat-bg))]">
        <div className="max-w-3xl mx-auto space-y-4 pb-20">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Welcome to MAX AI</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm your personal assistant powered by RAG technology. Ask me anything or upload documents for me to analyze!
              </p>
            </div>
          ) : (
            messages.map((message, i) => (
              <AnimatePresence key={message.id} mode="wait">
                {message.role === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-end mb-2"
                  >
                    <div className="chat-bubble-user">
                      {formatMessageContent(message.content)}
                    </div>
                  </motion.div>
                )}
                {message.role === 'assistant' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex mb-2"
                  >
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="chat-bubble-ai">
                        {formatMessageContent(message.content)}
                      </div>
                    </div>
                  </motion.div>
                )}
                {message.role === 'system' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-2 px-4 text-sm text-center text-muted-foreground bg-muted rounded-md mx-auto max-w-md"
                  >
                    {message.content}
                  </motion.div>
                )}
              </AnimatePresence>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex mb-2"
            >
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="chat-bubble-ai">
                  <div className="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={endOfMessagesRef} />
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="min-h-10 resize-none pr-24 py-3"
              disabled={isLoading}
            />
            <div className="absolute right-1 bottom-1 flex space-x-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className="h-8 w-8"
              >
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload document</span>
              </Button>
              
              {messages.length > 0 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all messages?")) {
                      clearMessages();
                    }
                  }}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Clear chat</span>
                </Button>
              )}
              
              <Button
                type="submit"
                size="icon"
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="h-8 w-8"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
            disabled={isLoading || isUploading}
          />
        </div>
      </div>
    </div>
  );
}