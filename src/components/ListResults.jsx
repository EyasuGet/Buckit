import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "../styles/ListResults.css";

export default function ListResults() {
  const { id } = useParams();
  const { state } = useLocation() || {};

  const [data, setData] = useState(() => {
    const fromState = state && typeof state === "object" ? state : null;
    if (fromState) return fromState;
    try {
      const raw = sessionStorage.getItem(`list:${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [items, setItems] = useState(() => data?.items || []);

  useEffect(() => {
    if (data && Array.isArray(data.items)) {
      setItems(data.items);
    }
  }, [data]);

  useEffect(() => {
    if (!id) return;
    try {
      const current = { ...(data || {}), items };
      sessionStorage.setItem(`list:${id}`, JSON.stringify(current));
    } catch {}
  }, [id, data, items]);

  const totals = useMemo(() => {
    const total = items.length;
    const done = items.filter((it) => it.done).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const photos = items.filter((it) => it?.photo?.dataUrl).length;
    return { total, done, pct, photos };
  }, [items]);

  const toggleItem = (index) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], done: !next[index].done };
      return next;
    });
  };

  const fileInputRef = useRef(null);
  const [photoTarget, setPhotoTarget] = useState(null);

  const requestPhotoFor = (index) => {
    setPhotoTarget(index);
    fileInputRef.current?.click();
  };

  const readFileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || photoTarget == null) return;
    try {
      const dataUrl = await readFileToDataUrl(file);
      setItems((prev) => {
        const next = [...prev];
        const curr = next[photoTarget] || {};
        next[photoTarget] = {
          ...curr,
          photo: {
            name: file.name,
            dataUrl,
            addedAt: Date.now(),
          },
        };
        return next;
      });
    } finally {
      e.target.value = "";
      setPhotoTarget(null);
    }
  };

  const allDone = totals.total > 0 && totals.done === totals.total;
  const allPhotos = totals.total > 0 && totals.photos === totals.total;
  const collageReady = allDone && allPhotos;

  const collageCanvasRef = useRef(null);
  const [collageUrl, setCollageUrl] = useState(null);
  useEffect(() => {
    setCollageUrl(null);
  }, [items]);

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const buildCollage = async () => {
    try {
      const photos = items.map((it) => it?.photo?.dataUrl).filter(Boolean);
      if (!photos.length) return;

      const canvas = collageCanvasRef.current;
      if (!canvas) return;

      const W = 1600;
      const H = 900;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);

      const n = photos.length;
      const cols = n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 4;
      const rows = Math.ceil(n / cols);
      const gap = 12;
      const tileW = Math.floor((W - gap * (cols + 1)) / cols);
      const tileH = Math.floor((H - gap * (rows + 1)) / rows);

      const imgs = await Promise.all(photos.map((p) => loadImage(p)));

      imgs.forEach((img, idx) => {
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        const x = gap + c * (tileW + gap);
        const y = gap + r * (tileH + gap);

        const scale = Math.max(tileW / img.width, tileH / img.height);
        const dw = Math.round(img.width * scale);
        const dh = Math.round(img.height * scale);
        const dx = x + Math.round((tileW - dw) / 2);
        const dy = y + Math.round((tileH - dh) / 2);

        ctx.save();
        const radius = 14;
        ctx.beginPath();
        const rx = x, ry = y, rw = tileW, rh = tileH;
        ctx.moveTo(rx + radius, ry);
        ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, radius);
        ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, radius);
        ctx.arcTo(rx, ry + rh, rx, ry, radius);
        ctx.arcTo(rx, ry, rx + rw, ry, radius);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();

        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileW, tileH);
      });

      const title = (data?.title || "Your Bucket List").toString();
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 28px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.textAlign = "left";
      ctx.fillText(title, gap, H - gap);

      setCollageUrl(canvas.toDataURL("image/jpeg", 0.9));
    } catch (e) {
      console.error("Failed to build collage", e);
    }
  };

  useEffect(() => {
    if (collageReady && !collageUrl) {
      buildCollage();
    }
  }, [collageReady]);

  if (!data) {
    return (
      <main className="results-page">
        <div className="radial-bg" aria-hidden="true" />
        <div className="shell">
          <div className="header">
            <Link to="/lists" className="back-link">← Back to All Lists</Link>
            <h1 className="title">List Not Found</h1>
            <p className="subtitle">We couldn't find that list. Try creating a new one.</p>
          </div>
        </div>
      </main>
    );
  }

  const title = data.title || "Summer 2025";
  const subtitle = data.subtitle || "View your bucket list activities";

  return (
    <main className="results-page">
      <div className="radial-bg" aria-hidden="true" />
      <div className="shell">
        <div className="header">
          <Link to="/lists" className="back-link">← Back to All Lists</Link>
          <h1 className="title">{title}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>

        <section className="progress-card" aria-label="Progress summary">
          <div className="progress-header">
            <span className="progress-label">Progress</span>
            <span className="progress-count">{totals.done}/{totals.total || 0}</span>
          </div>

          <div className="progress-wrap">
            <div className="progress-arc" aria-hidden="true" />
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={totals.pct}
            >
              <div
                className="progress-fill"
                style={{ width: `${totals.pct}%` }}
              />
            </div>
          </div>

          {totals.photos > 0 && (
            <p className="progress-note">
              {totals.photos} {totals.photos === 1 ? "activity has" : "activities have"} photos for your collage
            </p>
          )}
        </section>

        {(() => {
          const missingPhotoIdxs = items
            .map((it, i) => (!it?.photo?.dataUrl ? i : null))
            .filter((v) => v !== null);
          if (allDone && !allPhotos) {
            return (
              <div
                className="reward-banner"
                role="note"
                style={{
                  marginTop: 12,
                  marginBottom: 12,
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "#abc3f5ff",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 18 }}>🎁</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>You're finished! Unlock your Memory Collage album</div>
                  <div style={{ opacity: 0.9, fontSize: 14 }}>
                    Add {missingPhotoIdxs.length} more {missingPhotoIdxs.length === 1 ? "photo" : "photos"} to generate a downloadable collage of your adventure.
                  </div>
                </div>
                {missingPhotoIdxs.length > 0 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => requestPhotoFor(missingPhotoIdxs[0])}
                  >
                    Add Photos
                  </button>
                ) : null}
              </div>
            );
          }
          if (!allDone) {
            return (
              <div
                className="reward-banner"
                role="note"
                style={{
                  marginTop: 12,
                  marginBottom: 12,
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "#abc3f5ff",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontWeight: 600 }}>Finish your bucket list to unlock a Memory Collage</div>
                <div style={{ fontSize: 14 }}>
                  Check off each activity and add a photo to build a beautiful collage album that you can download and share.
                </div>
              </div>
            );
          }
          return null;
        })()}

        <section className="items">
          {items.map((it, i) => {
            const done = !!it.done;
            const hasPhoto = !!it?.photo?.dataUrl;
            return (
              <article
                key={it.id || i}
                className="item-card"
                data-done={done ? "true" : "false"}
                data-photo={hasPhoto ? "true" : "false"}
              >
                <button
                  type="button"
                  className="check"
                  aria-pressed={done}
                  aria-label={done ? "Mark as not done" : "Mark as done"}
                  onClick={() => toggleItem(i)}
                  title={done ? "Completed" : "Mark complete"}
                >
                  <span className="check-inner" />
                </button>

                <div className="item-body">
                  <div className="item-topline">
                    <span className="index">#{i + 1}</span>
                    <h3 className="item-title">{it.title}</h3>
                  </div>

                  {it.description && (
                    <p className="item-desc">{it.description}</p>
                  )}

                  {Array.isArray(it.tags) && it.tags.length > 0 && (
                    <div className="tags">
                      {it.tags.map((t, k) => (
                        <span key={k} className="pill">
                          <svg
                            className="pin"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 22s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              fill="currentColor"
                              fillOpacity="0.08"
                            />
                            <circle cx="12" cy="11" r="2.6" fill="currentColor" />
                          </svg>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="item-right">
                  {hasPhoto ? (
                    <span className="photo-chip" title={it.photo?.name || "Photo"}>
                      <img
                        src={it.photo.dataUrl}
                        alt={`Uploaded for ${it.title}`}
                        className="photo-thumb"
                      />
                      <span className="photo-label">Photo added!</span>
                    </span>
                  ) : done ? (
                    <button
                      type="button"
                      className="add-photo-btn"
                      onClick={() => requestPhotoFor(i)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm8 3v6m-3-3h6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                      Add Photo
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {collageReady && (
          <section className="collage-section" style={{ marginTop: 24 }}>
            <div className="congrats">
              <h2 style={{ marginBottom: 8, alignItems: "center" }}>Congratulations! 🎉</h2>
              <p>You completed every activity and added photos. Here is your memory collage.</p>
            </div>

            {collageUrl ? (
              <div className="collage-actions" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, marginBottom: 12 }}>
                <a
                  href={collageUrl}
                  download={`${(data.title || "bucket-list").toLowerCase().replace(/\s+/g, '-')}-collage.jpg`}
                  className="btn btn-primary"
                >
                  Download Collage
                </a>
              </div>
            ) : (
              <div style={{ marginTop: 12, marginBottom: 12 }}>
                <button type="button" className="btn btn-primary" onClick={buildCollage}>Build Collage</button>
              </div>
            )}

            {collageUrl ? (
              <img
                src={collageUrl}
                alt="Memory collage preview"
                className="collage-preview"
                style={{ width: "100%", maxWidth: 960, borderRadius: 12, boxShadow: "0 6px 30px rgba(0,0,0,0.25)" }}
              />
            ) : null}
            
            <canvas ref={collageCanvasRef} style={{ display: "none" }} />
          </section>
        )}
      </div>
    </main>
  );
}