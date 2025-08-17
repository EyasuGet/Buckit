import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateList } from "../api";
import "../styles/CreateLoading.css";

export default function CreateLoading() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const payload = state || null;

  useEffect(() => {
    if (!payload) {
      navigate("/create", { replace: true });
      return;
    }
    let cancelled = false;

    async function run() {
      try {
        const data = await generateList(payload);
        if (cancelled) return;
        const id =
          data?.id ||
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()));

        try {
          sessionStorage.setItem(`list:${id}`, JSON.stringify(data));
        } catch {}
        navigate(`/lists/${id}`, { state: data, replace: true });
      } catch (e) {
        console.error("Generation failed:", e);
        if (!cancelled) {
          navigate("/create", {
            replace: true,
            state: { error: "Failed to generate list. Please try again." },
          });
        }
      }
    }
    run();

    return () => {
      cancelled = true;
    };
  }, [navigate, payload]);

  if (!payload) return null;

  const title = payload.title || "Your Bucket List";
  const where = payload.location || "your area";
  const party = payload.party || "friends";

  return (
    <main className="loading-page">
      <div className="shell">
        <header className="loading-header">
          <h1>Create New List</h1>
          <p>
            Answer a few questions and we'll generate a personalized bucket list
            of activities for you.
          </p>
        </header>

        <section className="loading-center">
          <div className="status-card" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <h2 className="status-title">Crafting "{title}"</h2>
            <p className="status-desc">
              Our AI is analyzing {where} to find the most exciting activities
              for {party}...
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}