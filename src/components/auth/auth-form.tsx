"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { UvaniLogo } from "@/components/icons";

interface AuthFormProps {
  type: "signin" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const isSignUp = type === "signup";

  return (
    <Card className="w-full max-w-md animate-fade-in-up shadow-2xl shadow-primary/10">
      <form onSubmit={handleSubmit}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <UvaniLogo className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-4xl">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Enter your details to join Uvani."
              : "Sign in to access your tailor dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="artisan@uvani.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required placeholder="••••••••" />
          </div>
          {isSignUp && (
             <div className="space-y-2">
             <Label htmlFor="confirm-password">Confirm Password</Label>
             <Input id="confirm-password" type="password" required placeholder="••••••••" />
           </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full font-bold">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <div className="text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
