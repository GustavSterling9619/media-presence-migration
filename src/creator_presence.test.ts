import assert from "node:assert/strict";
import { creatorRequest } from "./creator_presence.js";

const accepted = creatorRequest.safeParse({ workspace: "studio-7", creatorId: "creator-42", assetId: "clip-108", assetTitle: "Launch cut" });
assert.equal(accepted.success, true);
const rejected = creatorRequest.safeParse({ workspace: "", creatorId: "creator-42", assetId: "clip-108", assetTitle: "Launch cut" });
assert.equal(rejected.success, false);
console.log("creator request boundary: pass");
