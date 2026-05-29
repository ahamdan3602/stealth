"use client";

import { useRef, useState } from "react";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ingestDocument } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const DOC_TYPES = [
  { value: "clinical", label: "Clinical",  description: "Drug references, clinical guidelines" },
  { value: "admin",    label: "Admin",     description: "Billing policies, scheduling docs" },
  { value: "patient",  label: "Patient",   description: "Discharge summaries, patient records" },
] as const;

type DocType = typeof DOC_TYPES[number]["value"];
type Status  = "idle" | "uploading" | "success" | "error";

export function IngestForm() {
  const inputRef          = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<DocType>("clinical");
  const [file, setFile]   = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  function handleFile(f: File) {
    if (!f.type.startsWith("text/") && !f.name.endsWith(".txt") && !f.name.endsWith(".pdf")) {
      setStatus("error");
      setMessage("Only .txt and .pdf files are supported.");
      return;
    }
    setFile(f);
    setStatus("idle");
    setMessage("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("uploading");
    setMessage("");
    try {
      await ingestDocument(file, docType);
      setStatus("success");
      setMessage(`"${file.name}" queued for ingestion as ${docType}.`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : "Upload failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Document ingestion form">
      <h2 className="text-sm font-semibold text-[var(--text)]">Ingest Document</h2>

      {/* Doc type selector */}
      <fieldset>
        <legend className="text-xs font-medium text-[var(--text-muted)] mb-2">
          Document type
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DOC_TYPES.map((dt) => (
            <label
              key={dt.value}
              className={cn(
                "flex flex-col gap-0.5 rounded-lg border p-3 cursor-pointer transition-all duration-150",
                docType === dt.value
                  ? "border-[var(--brand-blue)] bg-[var(--brand-blue)]/5 ring-1 ring-[var(--brand-blue)]"
                  : "border-[var(--border)] hover:border-[var(--text-muted)]"
              )}
            >
              <input
                type="radio"
                name="doc_type"
                value={dt.value}
                checked={docType === dt.value}
                onChange={() => setDocType(dt.value)}
                className="sr-only"
                aria-label={dt.label}
              />
              <span className="text-sm font-medium text-[var(--text)]">{dt.label}</span>
              <span className="text-xs text-[var(--text-muted)]">{dt.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-150",
          dragging
            ? "border-[var(--brand-blue)] bg-[var(--brand-blue)]/5"
            : "border-[var(--border)] hover:border-[var(--text-muted)] hover:bg-[var(--background)]"
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload file — click or drag and drop"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        {file ? (
          <>
            <FileText className="h-8 w-8 text-[var(--brand-blue)]" aria-hidden />
            <p className="text-sm font-medium text-[var(--text)]">{file.name}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-[var(--text-muted)]" aria-hidden />
            <p className="text-sm text-[var(--text-muted)]">
              Drop a file here, or <span className="text-[var(--brand-blue)] font-medium">browse</span>
            </p>
            <p className="text-xs text-[var(--text-muted)]">.txt, .pdf supported</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.pdf,text/plain,application/pdf"
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          aria-hidden
        />
      </div>

      {/* Status feedback */}
      {message && (
        <div
          role="alert"
          className={cn(
            "flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm",
            status === "success"
              ? "bg-[var(--success)]/8 text-[var(--success)] border border-[var(--success)]/20"
              : "bg-[var(--danger)]/8 text-[var(--danger)] border border-[var(--danger)]/20"
          )}
        >
          {status === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          )}
          {message}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={!file || status === "uploading"}
        loading={status === "uploading"}
        className="w-full sm:w-auto sm:self-end"
      >
        <Upload className="h-4 w-4" aria-hidden />
        {status === "uploading" ? "Uploading…" : "Ingest document"}
      </Button>
    </form>
  );
}
