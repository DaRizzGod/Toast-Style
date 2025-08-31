export const API = process.env.NEXT_PUBLIC_API_BASE || "";
export async function fetchMenu() {
  const r = await fetch(`${API}/menu`, { cache: 'no-store' });
  if (!r.ok) throw new Error('menu');
  return r.json();
}
