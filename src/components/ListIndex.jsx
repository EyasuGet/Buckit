import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/List.css";

function readAllListsFromStorage() {
  const keys = Object.keys(sessionStorage).filter((k) => k.startsWith("list:"));
  const rows = [];
  for (const k of keys) {
    try {
      const obj = JSON.parse(sessionStorage.getItem(k) || "{}");
      if (!obj || typeof obj !== "object") continue;
      const id = k.replace(/^list:/, "");
      const items = Array.isArray(obj.items) ? obj.items : [];
      const done = items.filter((it) => it?.done).length;
      const total = items.length;
      const pct = total ? Math.round((done / total) * 100) : 0;

      rows.push({
        id,
        title: obj.title || "Untitled List",
        location: obj.location || obj.place || "",
        party: obj.party || obj.audience || "friends",
        budget: obj.budget || "medium",
        createdAt: obj.createdAt || new Date().toISOString(),
        verificationPhoto: obj.verificationPhoto || null,
        items,
        totals: { done, total, pct },
        statePayload: obj,
      });
    } catch(error) {
      console.log(error)
    }
  }
  return rows.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
}

function seedIfEmpty() {
  return readAllListsFromStorage();
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function MetaIcon({ type }) {
  if (type === "pin") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="12" cy="11" r="2.4" fill="currentColor"/>
      </svg>
    );
  }
  if (type === "users") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 3a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm8 2c-3.3 0-6 1.34-6 3v2h12v-2c0-1.66-2.7-3-6-3Zm-8 0c-.69 0-1.35.07-1.97.2A6.43 6.43 0 0 1 6 18c-3.31 0-6 1.34-6 3v2h10v-2c0-1.46.96-2.75 2.46-3.68A10.7 10.7 0 0 0 8 16Z"/>
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h16M4 6h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ListCard({ list, onAddPhoto }) {
  const { id, title, location, party, budget, createdAt, totals, statePayload, verificationPhoto } = list;
  const completed = totals.total > 0 && totals.done >= totals.total;
  const hasPhoto = Boolean(verificationPhoto || statePayload?.verificationPhoto);

  const fileRef = useRef(null);
  const triggerFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileRef.current?.click();
  };
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      onAddPhoto?.(id, String(dataUrl));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const cardStyle = hasPhoto ? { border: "2px solid #22c55e" } : undefined;

  return (
    <Link
      to={`/lists/${id}`}
      state={statePayload}
      className="list-card"
      style={cardStyle}
    >
      <h3 className="list-title">{title}</h3>

      <div className="list-meta">
        {location ? (
          <span className="meta-chip">
            <MetaIcon type="pin" />
            {location}
          </span>
        ) : null}
        {party ? (
          <span className="meta-chip">
            <MetaIcon type="users" />
            {party}
          </span>
        ) : null}
        {budget ? <span className="meta-chip">${budget}</span> : null}
        {hasPhoto ? (
          <span className="meta-chip" style={{ marginLeft: "auto", color: "#16a34a" }}>Photo added ✅</span>
        ) : null}
      </div>

      <div className="list-progress">
        <div className="progress-row">
          <span className="label">Progress</span>
          <span className="count">{totals.done}/{totals.total || 0}</span>
        </div>
        <div className="bar">
          <span className="fill" style={{ width: `${totals.pct}%` }} />
        </div>
      </div>

      <div className="list-footer">
        <span className="date">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 2v3M17 2v3M3 10h18M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {fmtDate(createdAt)}
        </span>
        {/* Add Photo button appears only when completed and no photo yet */}
        {completed && !hasPhoto ? (
          <button
            className="btn btn-small btn-green"
            style={{ marginLeft: "auto" }}
            onClick={triggerFile}
          >
            Add Photo
          </button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ display: "none" }}
        />
      </div>
    </Link>
  );
}

export default function ListIndex() {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    setLists(seedIfEmpty());
  }, []);

  const count = useMemo(() => lists.length, [lists]);

  const handleAddPhoto = (id, dataUrl) => {
    try {
      const key = `list:${id}`;
      const raw = sessionStorage.getItem(key);
      const obj = raw ? JSON.parse(raw) : {};
      obj.verificationPhoto = dataUrl;
      sessionStorage.setItem(key, JSON.stringify(obj));
      setLists((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, verificationPhoto: dataUrl, statePayload: { ...(l.statePayload || {}), verificationPhoto: dataUrl } }
            : l
        )
      );
    } catch {}
  };

  return (
    <main className="lists-page">
      <div className="radial-bg" aria-hidden="true" />
      <div className="shell">
        <div className="page-head">
          <div className="titles">
            <h1 className="page-title">Your Bucket Lists</h1>
            <p className="page-subtitle">{count} {count === 1 ? "list" : "lists"} created</p>
          </div>
        </div>

        {lists.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any lists yet.</p>
            <Link to="/create" className="btn btn-primary">Create your first list</Link>
          </div>
        ) : (
          <section className="cards-grid">
            {lists.map((l) => (
              <ListCard key={l.id} list={l} onAddPhoto={handleAddPhoto} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}