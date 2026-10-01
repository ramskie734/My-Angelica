import { NextResponse } from "next/server";

/**
 * Legacy email-confirmation entry point. Defers to the callback route which
 * handles both the code and token_hash flows.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/auth/callback?${new URL(request.url).searchParams.toString()}`);
}
