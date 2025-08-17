export async function generateList(payload) {
  const apiBase =
    (
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_API_URL) ||
    (typeof process !== "undefined" &&
      process.env &&
      process.env.REACT_APP_API_URL) ||
    "";

  if (apiBase) {
    const res = await fetch(`${apiBase.replace(/\/$/, "")}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API error ${res.status}: ${text}`);
    }
    return await res.json();
  }

  await new Promise((r) => setTimeout(r, 2200));
  const fakeId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());
  return { id: fakeId, ...payload, items: [] };
}