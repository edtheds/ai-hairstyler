"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type GenerationRow = Database["public"]["Tables"]["generations"]["Row"];

type Status = GenerationRow["status"] | "idle";

interface GenerationStatus {
  status: Status;
  resultUrl: string | null;
  errorMessage: string | null;
}

// After this many ms of "processing", trigger the sync endpoint as a webhook fallback
const WEBHOOK_FALLBACK_AFTER_MS = 30_000;

export function useGenerationStatus(generationId: string | null): GenerationStatus {
  const [status, setStatus] = useState<Status>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncAttemptsRef = useRef(0);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!generationId) {
      setStatus("idle");
      setResultUrl(null);
      setErrorMessage(null);
      syncAttemptsRef.current = 0;
      return;
    }

    setStatus("pending");
    syncAttemptsRef.current = 0;
    startedAtRef.current = Date.now();
    const supabase = createClient();

    async function triggerSync() {
      if (syncAttemptsRef.current >= 3) return; // max 3 attempts
      syncAttemptsRef.current += 1;
      await fetch(`/api/generations/${generationId}/sync`, { method: "POST" });
    }

    async function poll() {
      const { data } = await supabase
        .from("generations")
        .select("status, result_url, error_message")
        .eq("id", generationId!)
        .single();

      if (!data) return;

      setStatus(data.status);
      setResultUrl(data.result_url);
      setErrorMessage(data.error_message);

      if (data.status === "succeeded" || data.status === "failed") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      // Webhook fallback: sync every 30s if still processing (up to 3 times)
      if (
        (data.status === "processing" || data.status === "pending") &&
        Date.now() - startedAtRef.current > WEBHOOK_FALLBACK_AFTER_MS * (syncAttemptsRef.current + 1)
      ) {
        triggerSync();
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [generationId]);

  return { status, resultUrl, errorMessage };
}
