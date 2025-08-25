
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
import { Separator } from "../ui/separator";

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
    <Card className="w-full max-w-sm animate-fade-in-up border-0 shadow-none sm:border sm:shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <UvaniLogo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "Create your Account" : "Sign In to Uvani"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Start managing your craft with precision."
              : "Welcome back, artisan. Let's get creating."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" placeholder="Tiana" required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" placeholder="Odum" required />
                </div>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full font-semibold">
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>
           <div className="relative w-full">
            <Separator className="absolute top-1/2 -translate-y-1/2" />
            <p className="text-center bg-card px-2 text-xs text-muted-foreground relative">OR</p>
           </div>
           <Button variant="outline" className="w-full">
            Continue with Google
           </Button>
          <div className="text-sm text-center text-muted-foreground">
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
