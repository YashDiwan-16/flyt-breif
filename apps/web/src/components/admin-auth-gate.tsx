"use client";

import { Button } from "@flyt-breif/ui/components/button";
import { Input } from "@flyt-breif/ui/components/input";
import { Label } from "@flyt-breif/ui/components/label";
import { AlertCircle, LockKeyhole, LogIn } from "lucide-react";
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
    <main className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground">
      <section className="w-full max-w-md border bg-card shadow-[0_18px_45px_rgba(12,35,29,0.12)]">
        <div className="border-b bg-[#fbfdf9] p-5">
          <div className="inline-flex items-center gap-2 border border-emerald-600/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-normal text-emerald-800">
            <LockKeyhole className="size-3.5" />
            Admin only
          </div>
          <h1 className="mt-3 text-xl font-semibold">FlytBDR Admin Login</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sign in to review submitted lead intelligence, AE handoff briefs, and
            generated outreach.
          </p>
        </div>

        <form className="space-y-4 p-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="admin@flytbase.com"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              disabled={isSubmitting}
              required
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="flex items-center gap-2 border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive"
            >
              <AlertCircle className="size-3.5" />
              <span>{error}</span>
            </div>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <LockKeyhole /> : <LogIn />}
            {isSubmitting ? "Checking credentials" : "Continue to admin cockpit"}
          </Button>

          <Link
            href="/contact-us"
            className="inline-flex h-8 w-full items-center justify-center border border-transparent px-2.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-muted active:scale-[0.98]"
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
