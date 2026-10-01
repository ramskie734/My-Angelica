import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback: exchanges OAuth codes (Google sign-in, email confirm links,
 * password recovery links) for a session, then redirects into the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Support the newer token_hash + type email confirmation flow.
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as never });
    if (!error) {
      return NextResponse.redirect(
        type === "recovery" ? `${origin}/settings` : `${origin}/`
      );
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`);
}
