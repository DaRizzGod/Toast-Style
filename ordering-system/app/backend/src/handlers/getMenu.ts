import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const MENU_TABLE = process.env.MENU_TABLE!;

export const handler = async () => {
  try {
    const resp = await ddb.send(new QueryCommand({
      TableName: MENU_TABLE,
      KeyConditionExpression: "pk = :p",
      ExpressionAttributeValues: { ":p": "REST#righteous" }
    }));

    const items = (resp.Items || [])
      .filter(i => (i.sk as string)?.startsWith("ITEM#"))
      .map(i => ({ id: (i.sk as string).slice(5), name: i.name, priceCents: i.priceCents, category: i.category, isAvailable: i.isAvailable }));

    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ items }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "{}" };
  }
};
