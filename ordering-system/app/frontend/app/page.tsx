import { fetchMenu } from "../lib/api";

export default async function Page() {
  const { items } = await fetchMenu();
  return (
    <div>
      <h1>Menu</h1>
      <ul>
        {items.map((i: any) => (
          <li key={i.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span>{i.name}</span>
              <span>${(i.priceCents/100).toFixed(2)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
