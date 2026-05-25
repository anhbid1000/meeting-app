import { Router } from "express";

// NOTE: Legacy file endpoints were removed/disabled during refactor.
// Workspace-scoped file APIs are served via:
//   /api/v1/workspaces/:workspaceId/files (FileAsset.route.ts)
// Keep this router empty to avoid broken exports during TS compile.

const router = Router();

export default router;
