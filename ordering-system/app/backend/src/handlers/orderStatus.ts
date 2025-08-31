import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ORDERS_TABLE = process.env.ORDERS_TABLE!;

export const handler = async (event:any) => {
  const id = event.pathParameters?.id;
  const { status } = JSON.parse(event.body || "{}");
  if (!id || !status) return { statusCode: 400, body: "Missing" };
  await ddb.send(new UpdateCommand({
    TableName: ORDERS_TABLE,
    Key: { pk: "REST#righteous", sk: `ORD#${id}` },
    UpdateExpression: "SET #s = :s",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":s": status }
  }));
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
