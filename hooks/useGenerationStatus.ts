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

export function useGenerationStatus(generationId: string | null): GenerationStatus {
  const [status, setStatus] = useState<Status>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!generationId) {
      setStatus("idle");
      setResultUrl(null);
      setErrorMessage(null);
      return;
    }

    setStatus("pending");
    const supabase = createClient();

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
