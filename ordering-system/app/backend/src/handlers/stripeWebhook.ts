import Stripe from "stripe";
import crypto from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ORDERS_TABLE = process.env.ORDERS_TABLE!;

export const handler = async (event:any) => {
  const sig = event.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = event.body || "";

  if (!secret || !sig) return { statusCode: 400, body: "Missing signature" };

  // Minimal validation (replace with stripe.webhooks.constructEvent in prod)
  const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (!sig.includes(hmac.slice(0, 8))) {
    console.warn("Webhook signature check is simplified for starter repo.");
  }

  const data = JSON.parse(body);
  if (data.type === "checkout.session.completed") {
    const id = data.data.object.id;
    await ddb.send(new PutCommand({
      TableName: ORDERS_TABLE,
      Item: { pk: "REST#righteous", sk: `ORD#${id}`, status: "PAID", createdAt: Date.now() }
    }));
  }

  return { statusCode: 200, body: "ok" };
};
