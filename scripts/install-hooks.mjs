#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const insideRepository = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
if (insideRepository.status === 0) {
  const result = spawnSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log("已启用 .githooks/pre-commit 相册检查。");
}
