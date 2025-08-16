import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/CreateList.css";

export default function CreateList() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("free");
  const [party, setParty] = useState("friends");

  const navigate = useNavigate();
  const { state: navState } = useLocation() || {};
  const [error, setError] = useState(navState?.error || "");

  const isValid = Boolean(title.trim()) && Boolean(location.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setError("");

    const payload = { title, location, budget, party };
    navigate("/create/loading", { state: payload, replace: false });
  };

  return (
    <main className="create-page">
      <div className="shell">
        <header className="form-header">
          <h1>Create New List</h1>
          <p>Answer a few questions and we'll generate a personalized bucket list of activities for you.</p>
        </header>

        {error ? (
          <div
            role="alert"
            className="error-banner"
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              padding: "12px 14px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        ) : null}

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">What would you like to name this list?</label>
            <div className="input-wrap">
              <span className="leading-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7a2 2 0 0 1 2-2h8l6 6v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="#64748b" strokeWidth="1.6"/>
                  <path d="M13 5v4a2 2 0 0 0 2 2h4" stroke="#64748b" strokeWidth="1.6"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder='e.g., Summer 2025, Paris Adventure, Weekend Fun...'
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(""); }}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Where do you want to explore?</label>
            <div className="input-wrap">
              <span className="leading-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11z" stroke="#64748b" strokeWidth="1.6"/>
                  <circle cx="12" cy="10" r="2.5" stroke="#64748b" strokeWidth="1.6"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Enter a city, country, or region..."
                value={location}
                onChange={(e) => { setLocation(e.target.value); setError(""); }}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">What's your budget?</label>
            <div className="option-grid three" role="radiogroup" aria-label="Budget">
              <OptionCard active={budget === "free"} onClick={() => { setBudget("free"); setError(""); }} title="Free" icon={<span className="money">$</span>} />
              <OptionCard active={budget === "budget"} onClick={() => { setBudget("budget"); setError(""); }} title="Budget Friendly" icon={<span className="money">$$</span>} />
              <OptionCard active={budget === "high"} onClick={() => { setBudget("high"); setError(""); }} title="High Roller" icon={<span className="money">$$$</span>} />
            </div>
          </div>

          <div className="field">
            <label className="label">Who's joining the adventure?</label>
            <div className="option-grid three" role="radiogroup" aria-label="Who’s joining">
              <OptionCard active={party === "friends"} onClick={() => { setParty("friends"); setError(""); }} title="Friends" icon={<span className="emoji">👥</span>} />
              <OptionCard active={party === "families"} onClick={() => { setParty("families"); setError(""); }} title="Families" icon={<span className="emoji">👨‍👩‍👧‍👦</span>} />
              <OptionCard active={party === "couples"} onClick={() => { setParty("couples"); setError(""); }} title="Couples" icon={<span className="emoji">❤️</span>} />
            </div>
          </div>

          <div className="sticky-footer">
            <button type="submit" className="generate-btn" disabled={!isValid}>
              Generate My Bucket List ✨
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function OptionCard({ active, onClick, title, icon }) {
  return (
    <button
      type="button"
      className="option-card"
      data-active={active ? "true" : "false"}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="option-icon">{icon}</div>
      <div className="option-title">{title}</div>
    </button>
  );
}