import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const creatorRequest = z.object({
  workspace: z.string().min(1),
  creatorId: z.string().min(1),
  assetId: z.string().min(1),
  assetTitle: z.string().min(1)
});
export type CreatorRequest = z.infer<typeof creatorRequest>;

export async function showCreatorOnline(input: unknown, client = new InfraiClient(process.env.INFRAI_API_KEY ?? "")) {
  const request = creatorRequest.parse(input);
  const channel = `media-${request.workspace}`;
  await client.request("/v1/realtime/channel/create", {
    method: "POST",
    body: JSON.stringify({ channel, type: "presence" })
  });
  const token = await client.request<unknown>("/v1/realtime/token/issue", {
    method: "POST",
    body: JSON.stringify({ client_id: request.creatorId, channels: [channel], capabilities: ["presence", "publish"], ttl_seconds: 3600 })
  });
  const presence = await client.request<unknown>(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`, { method: "GET" });
  await client.request("/v1/realtime/publish", {
    method: "POST",
    body: JSON.stringify({ channel, event: "asset.processing", data: { assetId: request.assetId, title: request.assetTitle, state: "queued" }, account_id: request.workspace })
  });
  return { channel, token, presence, next: "creator-client-connects" };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = { workspace: "studio-7", creatorId: "creator-42", assetId: "clip-108", assetTitle: "Launch cut" };
  showCreatorOnline(sample).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
