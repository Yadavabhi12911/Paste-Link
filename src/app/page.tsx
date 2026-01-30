"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [pasteId, setPasteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Shareable link in API format: http://localhost:3000/api/pastes/PASTE_ID
  const shareableUrl =
    typeof window !== "undefined" && pasteId
      ? `${window.location.origin}/api/pastes/${pasteId}`
      : pasteId
        ? `/api/pastes/${pasteId}`
        : null;

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPasteId(null);
    setLoading(true);
    try {
      const body: { content: string; ttl_seconds?: number; max_views?: number } =
        { content: content.trim() };
      if (ttlSeconds.trim() !== "") {
        const n = parseInt(ttlSeconds, 10);
        if (isNaN(n) || n < 1) {
          setError("ttl_seconds must be an integer >= 1");
          setLoading(false);
          return;
        }
        body.ttl_seconds = n;
      }
      if (maxViews.trim() !== "") {
        const n = parseInt(maxViews, 10);
        if (isNaN(n) || n < 1) {
          setError("max_views must be an integer >= 1");
          setLoading(false);
          return;
        }
        body.max_views = n;
      }
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.details || data.error || "Failed to create paste");
        setLoading(false);
        return;
      }
      // Use id from API so link is always correct; build absolute URL on client
      setPasteId(data.id);
      setContent("");
      setTtlSeconds("");
      setMaxViews("");
    } catch (err) {
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="animate-in">
      <h1 className="hero-title">
        <span className="hero-emoji">📋</span> Pastebin-Lite
      </h1>
      <p className="hero-subtitle">
        Drop your text, get a link. 🚀 Optional: TTL or max views.
      </p>

      <form onSubmit={handleSubmit} className="form-animate">
        <div className="form-row">
          <label htmlFor="content">Content (required)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
            placeholder="Paste your text here..."
          />
        </div>
        <div className="form-row-inline">
          <div>
            <label htmlFor="ttl_seconds">TTL (seconds)</label>
            <input
              id="ttl_seconds"
              type="number"
              min={1}
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              placeholder="e.g. 60"
            />
          </div>
          <div>
            <label htmlFor="max_views">Max views</label>
            <input
              id="max_views"
              type="number"
              min={1}
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>
        </div>
        <div className="form-row">
          <button type="submit" className="primary btn-pulse" disabled={loading}>
            {loading ? "⏳ Creating…" : "✨ Create paste"}
          </button>
        </div>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {pasteId && shareableUrl && (
        <div className="success-box success-animate">
          <h2>🎉 Paste created!</h2>
          <p className="success-hint">
            Share this link — anyone can open it. Clicking it shows a readable view.
          </p>
          <div className="link-row">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="link-input"
              aria-label="Shareable link"
            />
            <button
              type="button"
              className="secondary"
              onClick={() => copyToClipboard(shareableUrl)}
            >
              {copied ? "✅ Copied!" : "📎 Copy link"}
            </button>
          </div>
          <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.875rem" }}>
            <Link href={`/p/${pasteId}`} target="_blank" rel="noopener noreferrer" className="link-home">
              👁 View as page in new tab →
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
