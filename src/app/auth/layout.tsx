import Link from "next/link";
import { Heart } from "lucide-react";
import { APP_NAME } from "@/constants";

/** Centered card layout shared by all auth screens. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-white via-blush to-accent px-4 py-10">
      <Link href="/auth/login" className="mb-8 flex flex-col items-center gap-2">
        <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary shadow-lift">
          <Heart className="h-6 w-6 fill-white text-white" />
        </span>
        <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
      </Link>
      {children}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Study in order, master every topic.
      </p>
    </div>
  );
}
