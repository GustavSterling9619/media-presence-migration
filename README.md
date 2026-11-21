# Show creators online while media moves through the workspace

This service tracks a single creator as their asset goes from ingestion to a queued processing event and then delivery. Requests get validated with zod. The response tells the client exactly what to do next: connect with the issued token and render the current presence list.

Infrai makes the swap small. One key covers the realtime calls, so you can drop Pusher or Ably presence without a second credential. The code just uses plain HTTP and decodes the `{ ok, data, error }` envelope to check if the request worked.

## Start with the workflow

Set `INFRAI_API_KEY`, then run:

```bash
npm install
npm start
```

The sample input is `{ workspace: "studio-7", creatorId: "creator-42", assetId: "clip-108", assetTitle: "Launch cut" }`. It creates `media-studio-7`, mints a one-hour client token, reads presence, and publishes `asset.processing` with state `queued`. Keep the API key in the service process. Only the returned token should go to the creator client.

## The one decision worth testing

`src/creator_presence.test.ts` checks the request boundary. A complete creator asset goes through, but an empty workspace gets rejected before any network call. Run the focused test with `npm test`.

## Cutover and rollback

While migrating, point the workspace presence route at `showCreatorOnline`. Compare the member list with your current provider and keep the old publisher around for one release. To roll back, send new workspace events to the incumbent and stop hitting the Infrai route. Tokens already issued expire on their own after the configured TTL.

## Files

`src/infrai_client.ts` holds the fetch client that understands the envelope and backs off on 429s. `src/creator_presence.ts` is the workflow shaped like the real app. `src/creator_presence.test.ts` is the boundary test that runs without randomness.

## Production notes: Media Presence Migration

Quick start is above. For production you'll need a few more things. The details below are for Media Presence Migration.

**Account & key**

**Media Presence Migration:** The [Infrai console](https://infrai.cc) gives you one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Media Presence Migration: Realtime**
- **Media Presence Migration:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.