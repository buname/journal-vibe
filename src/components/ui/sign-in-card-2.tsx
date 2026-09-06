"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";

import { cn } from "@/lib/utils";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function Component({
  signedIn = false,
  callbackUrl = "/notebook",
  embedded = false,
}: {
  signedIn?: boolean;
  callbackUrl?: string;
  /** Fits the split gate left column instead of full viewport */
  embedded?: boolean;
}) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleGoogle = () => {
    setError(null);
    setGoogleLoading(true);
    void signIn("google", { callbackUrl }).catch(() => {
      setError(
        "Google sign-in failed. Check OAuth redirect URIs for this domain.",
      );
      setGoogleLoading(false);
    });
  };

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-black text-white",
        embedded ? "h-full min-h-0" : "min-h-screen w-screen",
      )}
    >
      <div className="absolute inset-0 bg-black" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-sm px-4"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="group relative">
            <motion.div
              className="absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 40%, transparent 60%, rgba(255,255,255,0.08))",
              }}
            />

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/70 p-6 shadow-2xl backdrop-blur-xl">
              <div className="relative mb-6 space-y-2 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="relative mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/gate/eye.png"
                    alt=""
                    className="h-full w-full object-cover object-[center_42%]"
                  />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-white"
                >
                  {signedIn ? "Welcome back" : "Welcome Back"}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-white/70"
                >
                  {signedIn
                    ? "The book is open."
                    : "Sign in with Google to open your journal and trades."}
                </motion.p>
              </div>

              {signedIn ? (
                <a
                  href="/notebook"
                  className="relative mt-2 flex h-11 w-full items-center justify-center gap-1 rounded-lg bg-white text-sm font-medium text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Open the book
                  <ArrowRight className="h-3 w-3" />
                </a>
              ) : (
                <div className="relative space-y-4">
                  {error ? (
                    <p className="text-center text-xs text-red-300" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    className="group/google relative w-full disabled:opacity-60"
                  >
                    <div className="relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-lg bg-white font-medium text-black transition-all duration-300">
                      <GoogleMark />
                      <AnimatePresence mode="wait">
                        {googleLoading ? (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm"
                          >
                            Opening Google…
                          </motion.span>
                        ) : (
                          <motion.span
                            key="label"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-1 text-sm font-medium"
                          >
                            Sign in with Google
                            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/google:translate-x-1" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>

                  <p className="text-center text-[11px] leading-relaxed text-white/45">
                    Use the same Google account as before — your trades and
                    journals stay on that account.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
