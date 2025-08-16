import React, { useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../styles/Results.css";

export default function Results() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const incoming = routerLocation.state?.data;

  if (!incoming) {
    return (
      <div className="res-container">
        <p>Nothing to show. Please create a list first.</p>
        <Link to="/">Back to form</Link>
      </div>
    );
  }

  const [activities, setActivities] = useState(incoming.activities || []);

  const done = activities.filter((a) => a.done).length;
  const total = activities.length;
  const percent = useMemo(() => (total ? Math.round((done / total) * 100) : 0), [done, total]);

  const toggle = (index) => {
    setActivities((prev) =>
      prev.map((a, i) => (i === index ? { ...a, done: !a.done } : a))
    );
  };

  return (
    <div className="res-container">
      <div className="back-row">
        <Link to="/" className="back-link">← Back to All Lists</Link>
      </div>

      <h1 className="res-title">{incoming.listName}</h1>
      <p className="res-subtitle">View your bucket list activities</p>

      <div className="res-card">
        <div className="res-progress-row">
          <strong>Progress</strong>
          <span>{done}/{total}</span>
        </div>
        <div className="res-progress-track">
          <div className="res-progress-bar" style={{ ['--pct']: `${percent}%` }} />
        </div>
      </div>

      <div className="res-grid">
        {activities.map((a, idx) => (
          <div key={a.id ?? idx} className="res-item-card">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <button
                aria-label={a.done ? "Mark as not done" : "Mark as done"}
                onClick={() => toggle(idx)}
                className={`res-check ${a.done ? 'done' : ''}`}
              />
              <div style={{ flex: 1 }}>
                <div className="res-index">#{idx + 1}</div>
                <div className="res-item-title">{a.title}</div>
                <div className="res-item-desc">{a.description}</div>
                <div className="res-tags">
                  {(a.tags || []).map((tag, i) => (
                    <span key={i} className="res-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="res-actions">
        <button onClick={() => navigate("/")} className="res-cta">Create another</button>
      </div>
    </div>
  );
}