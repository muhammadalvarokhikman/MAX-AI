"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore, getThemeFromAge } from "@/store/user-store";
import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ThemeContext } from "../theme-provider";
import { useContext } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.coerce
    .number()
    .min(1, {
      message: "Age must be at least 1 year.",
    })
    .max(120, {
      message: "Age must be no more than 120 years.",
    }),
  occupation: z.string().min(2, {
    message: "Occupation must be at least 2 characters.",
  }),
});

export function OnboardingForm() {
  const { setUser } = useUserStore();
  const { setUserTheme } = useContext(ThemeContext);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    occupation: "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: 0,
      occupation: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Determine theme based on age
    const theme = getThemeFromAge(values.age);
    
    // Save user data
    setUser({
      name: values.name,
      age: values.age,
      occupation: values.occupation,
      theme,
      hasCompletedOnboarding: true,
    });
    
    // Set the theme
    setUserTheme(theme);
    
    toast.success("Onboarding complete! Welcome to MAX AI.", {
      duration: 3000,
    });
    
    // Redirect to chat page
    setTimeout(() => {
      router.push("/chat");
    }, 500);
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-sm border border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-display text-center">
          Welcome to <span className="text-primary">MAX</span>
          <span className="text-accent">AI</span>
        </CardTitle>
        <CardDescription className="text-center">
          Let's personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's your name?</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>How old are you?</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter your age" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This helps us personalize your experience.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>What do you do?</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your occupation" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <Button 
              type="submit" 
              className="w-full font-display"
            >
              Get Started
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}