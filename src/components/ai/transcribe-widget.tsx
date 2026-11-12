"use client";

import { useRef, useState, type ChangeEvent } from "react";
import type { TranscribeCaps } from "@/lib/ai/types";

const CHIP =
  "inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-surface px-2.5 py-1 text-xs font-medium text-navy hover:border-navy-300 hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-50";

export function TranscribeWidget({
  caps,
  onText,
}: {
  caps: TranscribeCaps;
  onText: (text: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  if (!caps.image && !caps.audio) {
    return (
      <p className="text-xs text-navy-300">
        AI transcription is off — add a provider key to enable scan &amp; voice notes.
      </p>
    );
  }

  async function send(file: Blob, kind: "image" | "audio", filename: string) {
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file, filename);
      fd.append("kind", kind);
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const j = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        setErr(j.error ?? "Transcription failed.");
        return;
      }
      if (j.text) onText(j.text);
      else setErr("No text detected — try again or type the note.");
    } catch {
      setErr("Transcription failed.");
    } finally {
      setBusy(false);
    }
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void send(f, "image", f.name);
    e.target.value = "";
  }

  async function toggleRec() {
    if (recording) {
      recRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev: BlobEvent) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setRecording(false);
        void send(blob, "audio", "clip.webm");
      };
      recRef.current = mr;
      mr.start();
      setRecording(true);
      setErr(null);
    } catch {
      setErr("Microphone unavailable.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {caps.image ? (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy || recording}
            className={CHIP}
          >
            Scan notes
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPick}
          />
        </>
      ) : null}
      {caps.audio ? (
        <button
          type="button"
          onClick={() => void toggleRec()}
          disabled={busy}
          className={
            recording
              ? "inline-flex items-center gap-1.5 rounded-lg border border-risk bg-risk-50 px-2.5 py-1 text-xs font-semibold text-risk-600"
              : CHIP
          }
        >
          {recording ? "Stop & transcribe" : "Record voice"}
        </button>
      ) : null}
      {busy ? <span className="text-xs text-navy-400">Transcribing…</span> : null}
      {err ? <span className="text-xs text-risk-600">{err}</span> : null}
      {!busy && !err ? (
        <span className="text-[11px] text-navy-300">Sent to your AI provider to transcribe</span>
      ) : null}
    </div>
  );
}
