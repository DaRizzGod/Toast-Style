export default function OrderStatus({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Order #{params.id}</h1>
      <p>Thanks! Your order is being prepared. Refresh for updates.</p>
    </div>
  );
}
