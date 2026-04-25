"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnlockAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
          const response = await fetch("/api/paywall/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
          });

          const payload = (await response.json()) as { error?: string };

          if (!response.ok) {
            setStatus("error");
            setMessage(payload.error ?? "We could not verify that purchase email yet.");
            return;
          }

          window.location.href = "/dashboard";
        } catch {
          setStatus("error");
          setMessage("Verification failed due to a network error. Please retry.");
        }
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="name@company.com"
          className="sm:flex-1"
        />
        <Button type="submit" variant="outline" disabled={status === "loading"}>
          {status === "loading" ? "Checking..." : "Unlock dashboard"}
        </Button>
      </div>
      {status === "error" ? <p className="text-sm text-red-300">{message}</p> : null}
    </form>
  );
}
