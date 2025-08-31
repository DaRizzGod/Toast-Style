import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { request } from "undici";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";
export const handler = async (event:any) => {
  const summary = await summarize(event);
  if (SLACK_WEBHOOK_URL) await postToSlack(summary);
  return { statusCode: 200, body: "ok" };
};

async function summarize(payload:any) {
  const text = "Summarize this CloudWatch alarm event and propose the top 1 likely cause with 2 safe next actions.\n\n" + JSON.stringify(payload).slice(0, 4000);
  try {
    const bedrock = new BedrockRuntimeClient({});
    const res:any = await bedrock.send(new InvokeModelCommand({
      modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: Buffer.from(JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 400,
        messages: [{ role: "user", content: text }]
      }))
    }));
    const body = JSON.parse(new TextDecoder().decode(res.body));
    const content = body?.content?.[0]?.text || JSON.stringify(body).slice(0,300);
    return content;
  } catch (e) {
    console.warn("Bedrock failed, falling back to raw summary");
    return `Alarm event: ${JSON.stringify(payload).slice(0, 500)}`;
  }
}

async function postToSlack(message:string) {
  await request(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: `🤖 AI Triage\n${message}` })
  });
}
