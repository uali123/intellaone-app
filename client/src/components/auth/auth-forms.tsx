"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { loginSchema, insertUserSchema } from "@shared/schema";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Schemas
const extendedLoginSchema = loginSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const extendedRegistrationSchema = insertUserSchema.extend({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof extendedLoginSchema>;
type RegistrationFormValues = z.infer<typeof extendedRegistrationSchema>;

export function AuthForms() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const loginMutation = {
    isPending: false,
    error: null,
    mutate: async (data: LoginFormValues) => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Login failed");

        const resData = await res.json();
        localStorage.setItem("user", JSON.stringify(resData.user));
        localStorage.setItem("token", resData.token);
        window.location.href = "/dashboard";
      } catch (err: any) {
        console.error(err);
        setError(new Error(err.message));
      }
    },
  };

  const registerMutation = {
    isPending: false,
    error: null,
    mutate: async (data: RegistrationFormValues) => {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username: data.username,
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            role: "marketer",
          }),
        });

        if (!res.ok) throw new Error("Registration failed");

        const resData = await res.json();
        localStorage.setItem("user", JSON.stringify(resData.user));
        localStorage.setItem("token", resData.token);
        window.location.href = "/dashboard";
      } catch (err: any) {
        console.error(err);
        setError(new Error(err.message));
      }
    },
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">IntellaOne</CardTitle>
        <CardDescription className="text-center">
          AI-powered marketing asset management
        </CardDescription>
      </CardHeader>

      <div className="mx-6 -mt-2 mb-4">
        <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold text-blue-700 dark:text-blue-300">Try Without Sign Up</h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Experience our AI marketing tools instantly -{" "}
              <span className="font-semibold">no credit card or account required!</span>
            </p>
            <Button
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={() => {
                localStorage.setItem("free-trial-mode", "true");
                window.location.href = "/agents";
              }}
            >
              Start Free Trial Now →
            </Button>
          </CardContent>
        </Card>
      </div>

      <CardContent>
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm
              isPending={loginMutation.isPending}
              error={error}
              onSubmit={loginMutation.mutate}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
            />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm
              isPending={registerMutation.isPending}
              error={error}
              onSubmit={registerMutation.mutate}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <Separator className="my-4" />
        <p className="text-sm text-gray-500 text-center mb-2">
          {activeTab === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            setActiveTab(activeTab === "login" ? "register" : "login")
          }
        >
          {activeTab === "login" ? "Create Account" : "Login"}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface LoginFormProps {
  isPending: boolean;
  error: Error | null;
  onSubmit: (data: LoginFormValues) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
}

function LoginForm({ isPending, error, onSubmit, showPassword, togglePasswordVisibility }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(extendedLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} autoComplete="username" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...field}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </Form>
  );
}

interface RegisterFormProps {
  isPending: boolean;
  error: Error | null;
  onSubmit: (data: RegistrationFormValues) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
}

function RegisterForm({ isPending, error, onSubmit, showPassword, togglePasswordVisibility }: RegisterFormProps) {
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(extendedRegistrationSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} autoComplete="username" />
              </FormControl>
              <FormDescription className="text-xs">
                Letters, numbers, and underscores only
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your email address" {...field} autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    {...field}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormDescription className="text-xs">
                Min. 8 characters with uppercase, lowercase, and numbers
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...field}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
