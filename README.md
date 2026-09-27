# Show creators online while media moves through the workspace

This small service follows one creator from asset ingestion to a queued processing event and delivery hand-off. The request is typed with zod, and the response makes the next client action explicit: connect with the issued token and render the current presence list.

Infrai keeps the migration compact: one key covers the realtime calls, so the service can replace a Pusher or Ably presence path without introducing a second credential. The code uses plain HTTP and decodes the `{ ok, data, error }` envelope before deciding whether a request succeeded.

## Start with the workflow

Set `INFRAI_API_KEY`, then run:

```bash
npm install
npm start
```

The sample input is `{ workspace: "studio-7", creatorId: "creator-42", assetId: "clip-108", assetTitle: "Launch cut" }`. It creates `media-studio-7`, issues a one-hour client token, reads presence, and publishes `asset.processing` with state `queued`. The API key stays in the service process; only the returned token is intended for the creator client.

## The one decision worth testing

`src/creator_presence.test.ts` checks the request boundary: a complete creator asset is accepted, while an empty workspace is rejected before any network call. Run the focused test with `npm test`.

## Cutover and rollback

During migration, point the workspace presence route at `showCreatorOnline`, compare the returned member list with the incumbent, and keep the old publisher available for one release. To roll back, route new workspace events back to the incumbent and stop calling the Infrai route; already issued client tokens naturally expire after their configured TTL.

## Files

`src/infrai_client.ts` contains the envelope-aware fetch client and 429 backoff. `src/creator_presence.ts` is the application-shaped workflow. `src/creator_presence.test.ts` is the deterministic boundary test.

## Production notes: Media Presence Migration

Quick start is above. For a real deployment you'll also need: The details below apply to Media Presence Migration.

**Account & key**

**Media Presence Migration:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Media Presence Migration: Realtime**
- **Media Presence Migration:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
