"use client";

import { Button } from "@flyt-breif/ui/components/button";
import { Input } from "@flyt-breif/ui/components/input";
import { Label } from "@flyt-breif/ui/components/label";
import { AlertCircle, Drone, LockKeyhole, LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

const ADMIN_SESSION_KEY = "flytbdr-admin-session";

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void checkExistingSession();
  }, []);

  async function checkExistingSession() {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== "active") {
      setHasHydrated(true);
      return;
    }

    try {
      const response = await fetch("/api/admin/leads", {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
    } finally {
      setHasHydrated(true);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.includes("@") || password.trim().length < 6) {
      setError("Enter an admin email and a password with at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isLoginSuccess(payload)) {
        setError(getLoginError(payload));
        return;
      }

      sessionStorage.setItem(ADMIN_SESSION_KEY, "active");
      setIsAuthenticated(true);
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Admin login failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (hasHydrated && isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#292927] p-5 text-[#f7f6f2]">
      <section className="w-full max-w-[520px]">
        <div className="text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-[18px] bg-[#062d5f] text-[#7db7ff] shadow-[0_18px_46px_rgba(0,0,0,0.24)]">
            <Drone className="size-10" strokeWidth={2.5} />
          </div>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#45443f] bg-[#242421] px-3 py-1 text-[11px] font-semibold uppercase tracking-normal text-[#b8b6b0]">
            <LockKeyhole className="size-3.5" />
            Admin only
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-none text-[#faf9f6]">
            FlytBDR Admin Login
          </h1>
          <p className="mt-4 text-lg font-semibold leading-7 text-[#c9c7c1]">
            Review submitted lead intelligence, AE handoff briefs, and generated
            outreach.
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-3">
            <Label
              htmlFor="admin-email"
              className="text-xl font-semibold text-[#c9c7c1]"
            >
              Admin email
            </Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="admin@flytbase.com"
              className="h-16 rounded-[14px] border-[#45443f] bg-[#292927] px-5 text-xl font-semibold text-[#f7f6f2] placeholder:text-[#777672] focus-visible:border-[#6ca8ff] focus-visible:ring-2 focus-visible:ring-[#0b4f9c]/45 md:text-xl"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="admin-password"
              className="text-xl font-semibold text-[#c9c7c1]"
            >
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              className="h-16 rounded-[14px] border-[#45443f] bg-[#292927] px-5 text-xl font-semibold text-[#f7f6f2] placeholder:text-[#777672] focus-visible:border-[#6ca8ff] focus-visible:ring-2 focus-visible:ring-[#0b4f9c]/45 md:text-xl"
              disabled={isSubmitting}
              required
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-[14px] border border-red-300/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200"
            >
              <AlertCircle className="size-3.5" />
              <span>{error}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-16 w-full rounded-[16px] bg-[#fafafa] text-xl font-semibold text-[#060606] shadow-[0_18px_38px_rgba(0,0,0,0.22)] hover:bg-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LockKeyhole /> : <LogIn />}
            {isSubmitting ? "Checking credentials" : "Continue to admin cockpit"}
          </Button>

          <Link
            href="/contact-us"
            className="inline-flex h-10 w-full items-center justify-center rounded-full border border-transparent px-3 text-sm font-semibold text-[#928f89] transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#242421] hover:text-[#f7f6f2] active:scale-[0.98]"
          >
            Back to contact form
          </Link>
        </form>
      </section>
    </main>
  );
}

function isLoginSuccess(value: unknown) {
  return isRecord(value) && value.ok === true;
}

function getLoginError(value: unknown) {
  return isRecord(value) && typeof value.error === "string"
    ? value.error
    : "Admin login failed.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
