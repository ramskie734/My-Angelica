"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase/client";
import { LS_REMEMBER_KEY, FIXED_ACCOUNT_EMAIL } from "@/constants";

/**
 * Accepts any typing style and returns a valid email for Supabase:
 * matches the fixed account with or without @ / domain (e.g. "rhiannekenrama",
 * "rhiannekenrama@gmail" all resolve to the fixed account), otherwise appends
 * a safe placeholder domain when the input has no "@".
 */
function resolveEmail(raw: string): string {
  const input = raw.trim().toLowerCase();
  if (!input) return input;
  const fixedLocal = FIXED_ACCOUNT_EMAIL.split("@")[0];
  if (input === FIXED_ACCOUNT_EMAIL || input.startsWith(fixedLocal)) {
    return FIXED_ACCOUNT_EMAIL;
  }
  return input.includes("@") ? input : `${input}@myangelica.app`;
}

/** Sign in with Remember Me and forgot password. Accepts flexible email input. */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (remember) window.localStorage.setItem(LS_REMEMBER_KEY, email);
      else window.localStorage.removeItem(LS_REMEMBER_KEY);

      const { error } = await supabase.auth.signInWithPassword({
        email: resolveEmail(email),
        password
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Welcome back 💖");
      router.replace("/");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
      <Card className="shadow-lift">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue your studies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={signIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                autoCapitalize="none"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
              <Switch id="remember" checked={remember} onCheckedChange={setRemember} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>


        </CardContent>
      </Card>
    </motion.div>
  );
}
