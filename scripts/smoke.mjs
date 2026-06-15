import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const source = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");

execFileSync("node", ["--check", "src/app.js"], { stdio: "pipe" });

assert.match(source, /function importReviewDialog\(\)/, "missing editable import review dialog");
assert.match(source, /function saveImportReview\(\)/, "missing import review save handler");
assert.doesNotMatch(source, /confirm\(importPreview/, "GitHub import should not use read-only confirm preview");

assert.match(source, /function accountDataKey/, "missing account-scoped storage key");
assert.match(source, /\$\{STORAGE_KEY\}:\$\{username\}/, "storage key must include big account username");
assert.match(source, /accountPanelDialog/, "missing account panel dialog");
assert.match(source, /data-open-dialog="account-panel"/, "avatar should open account panel");
assert.doesNotMatch(source, /data-project-status-filter/, "project status filter should not be shown");

assert.match(source, /function canDeleteLibrary\(\)/, "missing delete permission helper");
assert.match(source, /function deleteSkill\(name\) \{\s*if \(!requirePermission\(canDeleteLibrary/s, "deleteSkill must guard admin-only delete");
assert.match(source, /function deleteMcp\(name\) \{\s*if \(!requirePermission\(canDeleteLibrary/s, "deleteMcp must guard admin-only delete");
assert.match(source, /function saveSkillEdit\(\) \{\s*if \(!requirePermission\(canEditLibrary/s, "saveSkillEdit must guard admin-only edit");
assert.match(source, /function createSkill\(\) \{\s*if \(!requirePermission\(canAddLibrary/s, "createSkill must guard member/admin add");

assert.match(source, /const PROJECT_STATUS_TAGS = \["已完成", "待完善", "待开启"\]/, "missing project status tags");
assert.doesNotMatch(source, /data-project-status-filter/, "project status filter should not be shown");
assert.match(source, /function promptOptimizerPanel\(/, "missing prompt optimizer panel");
assert.match(source, /function optimizePrompt\(\)/, "missing prompt optimizer action");
assert.match(source, /data-optimize-prompt/, "missing prompt optimizer trigger");
assert.match(source, /\["promptOptimizer", "提示词优化"/, "missing prompt optimizer nav item");
assert.match(source, /promptOptimizer\(\) \{/, "missing prompt optimizer page");

assert.match(source, /isValidSkillPayload/, "missing skill payload validation");
assert.match(source, /isValidMcpPayload/, "missing MCP payload validation");
assert.match(source, /mcpServers/, "missing mcpServers backup compatibility");

console.log("smoke tests passed");
