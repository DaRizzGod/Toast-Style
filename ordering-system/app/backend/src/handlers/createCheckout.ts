import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" as any });

export const handler = async (event:any) => {
  const { lineItems, successUrl, cancelUrl } = JSON.parse(event.body || "{}");
  if (!stripe.apiKey) {
    return { statusCode: 200, body: JSON.stringify({ demo: true, url: cancelUrl || "/" }) };
  }
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl
  });
  return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
};
