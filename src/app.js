const state = {
  page: "dashboard",
  query: "",
  project: 0,
  projectTab: "profile",
  skillFilter: "all",
  mcpFilter: "all",
  dialog: "",
  selectedSkill: "",
  selectedMcp: "",
  expandedSkillNotes: {},
  accountUi: {
    adminPasswordOpen: false
  },
  exportPanels: {
    active: "audit"
  },
  importer: {
    url: "",
    status: "支持 GitHub repo、blob、raw 链接；repo 链接会自动尝试 SKILL.md / README.md。",
    lastError: "",
    pending: null,
    history: []
  },
  formErrors: {},
  projectDraft: {
    folderPath: ""
  },
  promptOptimizer: {
    input: "",
    output: "",
    loading: false,
    status: "使用当前 AI 配置优化提示词。建议先配置本地代理或 OpenAI-compatible Endpoint。"
  },
  dashboardChat: {
    input: "",
    loading: false,
    status: "配置 AI 后可直接提问当前工作区问题。",
    messages: []
  },
  backup: {
    status: "建议定期导出配置包，避免浏览器清理 localStorage 后丢失配置。"
  },
  feedback: null,
  auth: {
    view: "login",
    status: "",
    current: null
  },
  workspace: {
    identity: {
      nickname: "",
      team: "",
      language: "中文",
      workMode: "标准"
    },
    accounts: {
      currentId: "local-admin",
      list: [
        { id: "local-admin", name: "本地管理员", role: "管理员", email: "", status: "启用" }
      ]
    },
    appearance: {
      theme: "light",
      accent: "green",
      density: "comfortable",
      fontSize: "default"
    },
    importRules: {
      cleanMarkdown: true,
      defaultStatus: "待复核",
      installFallback: "手动导入",
      summaryMaxLength: 120,
      requireReview: true
    },
    ui: {
      aiSettingsOpen: false
    },
    data: {
      lastBackupAt: "",
      lastSavedAt: ""
    }
  },
  recommendations: {
    loading: false,
    status: "",
    projectIndex: -1,
    skills: [],
    mcps: [],
    external: []
  },
  ai: {
    mode: "compatible",
    configOpen: false,
    provider: "",
    note: "",
    website: "",
    fullUrl: false,
    endpoint: "https://api.openai.com/v1",
    modelsEndpoint: "",
    model: "gpt-4o-mini",
    models: [],
    key: "",
    allowBrowserKey: false,
    proxyEndpoint: "",
    method: "POST",
    headers: "{\n  \"Content-Type\": \"application/json\",\n  \"Authorization\": \"Bearer {{apiKey}}\"\n}",
    body: "{\n  \"model\": \"{{model}}\",\n  \"temperature\": 0.3,\n  \"messages\": [\n    { \"role\": \"system\", \"content\": \"你是资深工程管理助手，只输出可直接保存的 AGENTS.md Markdown 内容。\" },\n    { \"role\": \"user\", \"content\": \"{{prompt}}\" }\n  ]\n}",
    responsePath: "choices.0.message.content",
    modelsPath: "data",
    loading: false,
    modelsLoading: false,
    status: "建议使用本地后端代理转发模型请求；也可填写远端 OpenAI-compatible Endpoint 与 API Key。"
  }
};

const nav = [
  ["dashboard", "仪表盘", "⌂"],
  ["projects", "项目管理", "▤"],
  ["skills", "Skill 库", "□"],
  ["mcps", "MCP 库", "▣"],
  ["promptOptimizer", "提示词优化", "✎"],
  ["settings", "工作区设置", "⇩"]
];

const DEFAULT_SKILL_CATEGORIES = ["设计/前端", "文档/接口", "工程协作", "内容生产", "AI 工具链", "外部推荐", "未分类"];
const DEFAULT_MCP_CATEGORIES = ["文档检索", "代码协作", "文件系统", "浏览器验收", "数据访问", "自定义", "未分类"];

const skills = [
  skill("frontend-design", "设计/前端", ["React", "UI", "Browser"], "GPT-5 / Claude Sonnet", "Browser, Vite", "codex skill install frontend-design", "把运营后台做成高完成度工作台页面", "视觉完成度高，会主动验收，适合从 0 到 1", "需要明确产品语境", "已安装", 96),
  skill("openai-docs", "文档/接口", ["OpenAI", "API", "Docs"], "GPT-5", "Docs MCP, Web", "codex skill install openai-docs", "查询 OpenAI API 用法和模型选择", "官方资料，适合高时效问题，可引用", "范围集中在 OpenAI", "推荐", 91),
  skill("github:gh-fix-ci", "工程协作", ["GitHub", "CI", "PR"], "GPT-5", "GitHub, gh", "codex plugin enable github", "读取 Actions 日志并修复 PR 检查", "能闭环 CI，适合 PR 上下文", "需要 GitHub 授权", "需权限", 88),
  skill("documents", "内容生产", ["DOCX", "Review", "PDF"], "GPT-5", "Documents Runtime", "codex plugin enable documents", "生成带批注和视觉校验的 Word 文档", "正式文档，可渲染检查", "不适合实时协同", "已安装", 84),
  skill("skill-creator", "AI 工具链", ["Skill", "Eval", "Prompt"], "GPT-5", "Filesystem", "codex skill install skill-creator", "创建或优化 Codex skill 的触发描述", "能沉淀工作流，适合团队规范", "需要测试触发准确率", "推荐", 90),
  skill("spreadsheets", "内容生产", ["XLSX", "CSV", "Chart"], "GPT-5", "Spreadsheet Runtime", "codex plugin enable spreadsheets", "分析表格、生成公式、图表和导出工作簿", "适合数据运营，支持公式", "复杂模型需复核", "已安装", 86)
];

const mcps = [
  mcp("context7", "最新官方文档检索", "npx -y @upstash/context7-mcp", "低", "Node.js / 网络", "框架、SDK、CLI 用法确认", "https://github.com/upstash/context7", "官方", "https://github.com/upstash/context7", "npm / npx", "内置已登记，待定期复核", "访问公开文档与网络资源"),
  mcp("github", "仓库、PR、Issue、CI", "GitHub App Connector", "中", "GitHub 授权", "PR 评审、CI 修复、发布", "GitHub App Connector", "官方", "https://docs.github.com/", "Codex GitHub connector", "内置已登记，需用户授权", "读取仓库、PR、Issue 和 Actions；写入操作需授权"),
  mcp("filesystem", "本地文件读写", "workspace_roots 限定", "高", "本地路径授权", "生成 AGENTS.md、修改代码", "本地工作区配置", "本地自定义", "本地 AGENTS.md / workspace_roots", "Codex filesystem tool", "内置已登记，按工作区边界执行", "读写 workspace_roots 内文件；高风险写入需确认范围"),
  mcp("browser", "本地页面测试和截图", "Browser plugin", "中", "浏览器实例", "前端视觉验收", "Browser plugin", "官方", "Codex Browser plugin", "Codex Browser plugin", "内置已登记，按浏览器会话执行", "访问本地页面、截图和交互测试")
];

const skillCategories = [...DEFAULT_SKILL_CATEGORIES];
const mcpCategories = [...DEFAULT_MCP_CATEGORIES];

const templates = [
  template("React SaaS 控制台", "前端应用", ["React", "Vite", "Playwright"], "中文沟通、读取设计系统、前端变更后启动服务并验收。", "# AGENTS.md\n\n- 始终使用中文沟通。\n- 修改 UI 前先读取设计系统和现有组件。\n- 前端变更后启动 dev server，并用 Browser 做验收。\n- 不把密钥写入代码。"),
  template("Python 数据分析", "数据/脚本", ["Python", "Pandas", "XLSX"], "优先结构化解析，说明临时产物和可复现实验命令。", "# AGENTS.md\n\n- 优先使用结构化解析器处理 CSV/XLSX。\n- 临时产物放入 artifacts/ 并说明用途。\n- 关键计算给出可复现命令。"),
  template("Codex 插件开发", "AI 工具链", ["MCP", "Skills", "JSON"], "约束 plugin manifest、skill 描述和重装验证流程。", "# AGENTS.md\n\n- 插件必须包含 .codex-plugin/plugin.json。\n- skill 描述保持短、准、可触发。\n- 修改后执行 cachebuster 和重新安装验证。"),
  template("GitHub PR 协作", "工程协作", ["GitHub", "CI", "Review"], "用于 PR 评论处理、CI 修复和草稿 PR 发布。", "# AGENTS.md\n\n- 先读取 PR 评论、检查和变更范围。\n- 只修改与反馈相关的文件。\n- 修复后运行相关测试并说明残余风险。")
];

const projects = [
  ["内部 CRM 重构", "SaaS 后台", ["frontend-design", "openai-docs"], ["github", "browser", "context7"], "React SaaS 控制台", "今天 09:42", "安全", projectMeta("1.2.0", "产品工程组", "CRM 后台", "保留现有交互节奏")],
  ["销售数据周报", "数据自动化", ["documents", "spreadsheets"], ["filesystem"], "Python 数据分析", "昨天 18:10", "关注", projectMeta("0.9.4", "数据运营", "周报自动化", "产物导出前需复核公式")],
  ["个人 Skill 市场", "AI 工具链", ["skill-creator", "github:gh-fix-ci"], ["github", "context7"], "Codex 插件开发", "6 月 3 日", "安全", projectMeta("1.0.0", "AI 平台", "个人工具链", "优先沉淀可复用规范")]
];

const STORAGE_KEY = "orchestra-os-data-v2";
const AUTH_KEY = "orchestra-os-auth-v1";
const DEFAULT_ADMIN_PASSWORD = "123456";
const PROJECT_STATUS_TAGS = ["已完成", "待完善", "待开启"];
const DEFAULT_DATA = JSON.parse(JSON.stringify({ skills, mcps, templates, projects, skillCategories, mcpCategories }));

function skill(name, category, tags, model, tools, install, example, pros, cons, status, score, md = "", source = "", note = "") {
  const resolvedSource = source || skillSource(name, install);
  return {
    name,
    category,
    tags,
    model,
    tools,
    install,
    example,
    pros,
    cons,
    status,
    score,
    source: resolvedSource,
    mdUrl: skillMdUrl(name),
    note,
    md: md || builtInSkillMd(name) || skillMarkdown({ name, category, tags, model, tools, install, example, pros, cons, status, score, source: resolvedSource })
  };
}

function mcp(name, ability, config, risk, deps, use, source = "", sourceType = "", docs = "", installSource = "", verified = "", permissions = "") {
  return normalizeMcpRecord({ name, ability, config, risk, deps, use, source, sourceType, docs, installSource, verified, permissions });
}

function template(name, type, stack, summary, body) {
  return { name, type, stack, summary, body };
}

function projectMeta(version = "1.0.0", owner = "未分配", scope = "全项目", notes = "") {
  return {
    version,
    owner,
    scope,
    notes,
    enabled: true,
    sort: 0,
    path: "",
    pathKind: "none",
    connected: false,
    scannedAt: "",
    scanError: "未连接本机项目",
    agentsFound: false,
    agentsContent: "",
    refinedAgents: "",
    refinedAt: "",
    templateRulesEnabled: true,
    templateRulesBody: "",
    detectedFiles: [],
    profile: {
      stack: [],
      packageName: "",
      dependencies: [],
      summary: "",
      keyFiles: []
    },
    brief: {
      purpose: "",
      users: "",
      features: "",
      aiTasks: "",
      avoidTasks: "",
      risks: "",
      confirmed: false
    },
    recommendationLog: [],
    history: [],
    bindings: { skills: {}, mcps: {}, template: {} }
  };
}

function getProjectMeta(project) {
  if (!project[7] || typeof project[7] !== "object" || Array.isArray(project[7])) project[7] = projectMeta();
  project[7].bindings ||= { skills: {}, mcps: {}, template: {} };
  project[7].bindings.skills ||= {};
  project[7].bindings.mcps ||= {};
  project[7].bindings.template ||= {};
  project[7].profile ||= { stack: [], packageName: "", dependencies: [], summary: "", keyFiles: [] };
  project[7].brief ||= { purpose: "", users: "", features: "", aiTasks: "", avoidTasks: "", risks: "", confirmed: false };
  project[7].statusTag ||= PROJECT_STATUS_TAGS.includes(project[7].statusTag) ? project[7].statusTag : "待完善";
  project[7].brief.confirmed = Boolean(project[7].brief.confirmed);
  project[7].recommendationLog ||= [];
  project[7].history ||= [];
  project[7].detectedFiles ||= [];
  project[7].path ||= "";
  project[7].pathKind ||= project[7].connected ? "browser-folder" : project[7].path ? "manual" : "none";
  project[7].scanError ||= project[7].connected ? "" : "未连接本机项目";
  project[7].agentsFound = Boolean(project[7].agentsFound);
  project[7].refinedAgents ||= "";
  project[7].refinedAt ||= "";
  project[7].templateRulesEnabled = project[7].templateRulesEnabled !== false;
  project[7].templateRulesBody ||= "";
  project[7].connected = Boolean(project[7].connected);
  project[7].enabled = project[7].enabled !== false;
  return project[7];
}

function getBindingMeta(project, type, name) {
  const meta = getProjectMeta(project);
  meta.bindings[type] ||= {};
  meta.bindings[type][name] ||= { version: "latest", owner: meta.owner || "未分配", scope: meta.scope || "全项目", note: "", enabled: true, order: 0 };
  meta.bindings[type][name].enabled = meta.bindings[type][name].enabled !== false;
  return meta.bindings[type][name];
}

function h(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function storagePayload() {
  return {
    schema: STORAGE_KEY,
    exportedAt: new Date().toISOString(),
    skills,
    mcps,
    skillCategories,
    mcpCategories,
    templates,
    projects,
    workspace: state.workspace,
    importer: { history: state.importer.history || [] },
    ai: {
      provider: state.ai.provider,
      note: state.ai.note,
      website: state.ai.website,
      fullUrl: state.ai.fullUrl,
      endpoint: state.ai.endpoint,
      modelsEndpoint: state.ai.modelsEndpoint,
      model: state.ai.model,
      models: state.ai.models,
      method: state.ai.method,
      headers: state.ai.headers,
      body: state.ai.body,
      responsePath: state.ai.responsePath,
      modelsPath: state.ai.modelsPath,
      allowBrowserKey: state.ai.allowBrowserKey,
      proxyEndpoint: state.ai.proxyEndpoint,
      mode: state.ai.mode
    }
  };
}

function authRegistry() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"accounts":{},"session":null}');
    parsed.accounts ||= {};
    return parsed;
  } catch {
    return { accounts: {}, session: null };
  }
}

function saveAuthRegistry(registry) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(registry));
}

function accountDataKey(username = state.auth.current?.username) {
  return username ? `${STORAGE_KEY}:${username}` : STORAGE_KEY;
}

function loadAuthSession() {
  const registry = authRegistry();
  const session = registry.session;
  if (!session?.username || !registry.accounts[session.username]) return;
  const account = registry.accounts[session.username];
  const roleId = account.roles?.some((item) => item.id === session.roleId) ? session.roleId : account.roles?.[0]?.id;
  state.auth.current = { username: session.username, roleId };
}

function currentBigAccount() {
  const username = state.auth.current?.username;
  if (!username) return null;
  const registry = authRegistry();
  const account = registry.accounts[username];
  if (!account) return null;
  account.adminPassword ||= DEFAULT_ADMIN_PASSWORD;
  account.roles ||= [];
  if (!account.roles.some((item) => item.role === "管理员")) {
    account.roles.unshift({ id: newWorkspaceAccountId(), name: "管理员", role: "管理员", email: "", status: "启用" });
    saveAuthRegistry(registry);
  }
  return account;
}

function currentRole() {
  const account = currentBigAccount();
  if (!account) return null;
  return account.roles?.find((item) => item.id === state.auth.current?.roleId) || account.roles?.[0] || null;
}

function currentRoleName() {
  return currentRole()?.role || "未登录";
}

function canManageMembers() {
  return currentRoleName() === "管理员";
}

function canAddLibrary() {
  return ["管理员", "成员"].includes(currentRoleName());
}

function canEditLibrary() {
  return currentRoleName() === "管理员";
}

function canDeleteLibrary() {
  return currentRoleName() === "管理员";
}

function canEditWorkspaceData() {
  return currentRoleName() !== "只读" && Boolean(state.auth.current);
}

function requirePermission(check, message) {
  if (check()) return true;
  alert(message);
  showFeedback(message, "warning");
  return false;
}

function disabledUnless(check) {
  return check() ? "" : "disabled";
}

function persistData() {
  if (!state.auth.current) return;
  const payload = storagePayload();
  try {
    localStorage.setItem(accountDataKey(), JSON.stringify(payload));
  } catch (error) {
    state.ai.status = `本地保存失败：${error.message}`;
  }
}

function restoreData() {
  if (!state.auth.current) return;
  try {
    const raw = localStorage.getItem(accountDataKey());
    if (!raw) return;
    const saved = JSON.parse(raw);
    applyStoragePayload(saved);
  } catch (error) {
    state.ai.status = `本地数据读取失败，已使用内置示例：${error.message}`;
  }
}

function applyStoragePayload(saved) {
  validateStoragePayload(saved);
  if (Object.hasOwn(saved, "skills")) replaceArray(skills, Array.isArray(saved.skills) ? saved.skills.map(normalizeSkillRecord) : []);
  if (Object.hasOwn(saved, "mcps")) replaceArray(mcps, Array.isArray(saved.mcps) ? saved.mcps.map(normalizeMcpRecord) : []);
  if (!Object.hasOwn(saved, "mcps") && Object.hasOwn(saved, "mcpServers")) replaceArray(mcps, Array.isArray(saved.mcpServers) ? saved.mcpServers.map(normalizeMcpRecord) : []);
  if (Object.hasOwn(saved, "skillCategories")) replaceArray(skillCategories, normalizeCategoryList(saved.skillCategories, DEFAULT_SKILL_CATEGORIES));
  if (Object.hasOwn(saved, "mcpCategories")) replaceArray(mcpCategories, normalizeCategoryList(saved.mcpCategories, DEFAULT_MCP_CATEGORIES));
  if (Object.hasOwn(saved, "templates")) replaceArray(templates, Array.isArray(saved.templates) ? saved.templates : []);
  if (Object.hasOwn(saved, "projects")) replaceArray(projects, Array.isArray(saved.projects) ? saved.projects : []);
  if (saved.workspace) state.workspace = mergeWorkspaceSettings(saved.workspace);
  if (ensureProjects()) persistData();
  ensureLibraryCategories();
  projects.forEach(getProjectMeta);
  if (saved.importer?.history) state.importer.history = saved.importer.history;
  if (saved.ai) Object.assign(state.ai, saved.ai, { key: "", loading: false, modelsLoading: false });
}

function validateStoragePayload(saved) {
  const fail = () => {
    throw new Error("配置包结构不符合当前工作区格式，未修改本地数据。");
  };
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) fail();
  if (Object.hasOwn(saved, "schema") && saved.schema !== STORAGE_KEY) fail();
  if (Object.hasOwn(saved, "skills") && !Array.isArray(saved.skills)) fail();
  if (Object.hasOwn(saved, "mcps") && !Array.isArray(saved.mcps)) fail();
  if (Object.hasOwn(saved, "mcpServers") && !Array.isArray(saved.mcpServers)) fail();
  if (Array.isArray(saved.skills) && !saved.skills.every(isValidSkillPayload)) fail();
  if (Array.isArray(saved.mcps) && !saved.mcps.every(isValidMcpPayload)) fail();
  if (Array.isArray(saved.mcpServers) && !saved.mcpServers.every(isValidMcpPayload)) fail();
  if (Array.isArray(saved.templates) && !saved.templates.every(isPlainObject)) fail();
  if (Array.isArray(saved.projects) && !saved.projects.every(Array.isArray)) fail();
  if (Object.hasOwn(saved, "skillCategories") && !Array.isArray(saved.skillCategories)) fail();
  if (Object.hasOwn(saved, "mcpCategories") && !Array.isArray(saved.mcpCategories)) fail();
  if (Array.isArray(saved.skillCategories) && !saved.skillCategories.every((item) => typeof item === "string")) fail();
  if (Array.isArray(saved.mcpCategories) && !saved.mcpCategories.every((item) => typeof item === "string")) fail();
  if (Object.hasOwn(saved, "templates") && !Array.isArray(saved.templates)) fail();
  if (Object.hasOwn(saved, "projects") && !Array.isArray(saved.projects)) fail();
  if (Object.hasOwn(saved, "workspace") && (!saved.workspace || typeof saved.workspace !== "object" || Array.isArray(saved.workspace))) fail();
  if (saved.workspace?.data && (typeof saved.workspace.data !== "object" || Array.isArray(saved.workspace.data))) fail();
  if (Object.hasOwn(saved, "ai") && (!saved.ai || typeof saved.ai !== "object" || Array.isArray(saved.ai))) fail();
  if (Object.hasOwn(saved, "importer") && (!saved.importer || typeof saved.importer !== "object" || Array.isArray(saved.importer))) fail();
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isValidSkillPayload(value) {
  return isPlainObject(value) && typeof value.name === "string" && value.name.trim().length > 0;
}

function isValidMcpPayload(value) {
  return isPlainObject(value) && typeof value.name === "string" && value.name.trim().length > 0;
}

function replaceArray(target, source) {
  if (!Array.isArray(source)) return;
  target.splice(0, target.length, ...source);
}

function resetRuntimeData() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_DATA));
  replaceArray(skills, defaults.skills.map(normalizeSkillRecord));
  replaceArray(mcps, defaults.mcps.map(normalizeMcpRecord));
  replaceArray(templates, defaults.templates);
  replaceArray(projects, defaults.projects);
  replaceArray(skillCategories, defaults.skillCategories);
  replaceArray(mcpCategories, defaults.mcpCategories);
  ensureLibraryCategories();
  state.project = 0;
  state.projectTab = "profile";
  state.skillFilter = "all";
  state.mcpFilter = "all";
  state.recommendations = { loading: false, status: "", projectIndex: -1, skills: [], mcps: [], external: [] };
  state.importer.history = [];
}

function normalizeCategoryList(items, defaults) {
  return unique([...defaults, ...items.map((item) => String(item || "").trim()).filter(Boolean)]);
}

function ensureLibraryCategories() {
  replaceArray(skillCategories, normalizeCategoryList(skills.map((item) => item.category), skillCategories.length ? skillCategories : DEFAULT_SKILL_CATEGORIES));
  replaceArray(mcpCategories, normalizeCategoryList(mcps.map((item) => item.category), mcpCategories.length ? mcpCategories : DEFAULT_MCP_CATEGORIES));
}

function mergeWorkspaceSettings(saved = {}) {
  return {
    identity: { ...state.workspace.identity, ...(saved.identity || {}) },
    accounts: normalizeWorkspaceAccounts(saved.accounts || state.workspace.accounts),
    appearance: { ...state.workspace.appearance, ...(saved.appearance || {}) },
    importRules: { ...state.workspace.importRules, ...(saved.importRules || {}) },
    ui: { ...state.workspace.ui, ...(saved.ui || {}) },
    data: { ...state.workspace.data, ...(saved.data || {}) }
  };
}

function normalizeWorkspaceAccounts(accounts = {}) {
  const fallback = { id: "local-admin", name: "本地管理员", role: "管理员", email: "", status: "启用" };
  const list = Array.isArray(accounts.list) ? accounts.list : [];
  const normalized = list
    .map((item) => ({
      id: String(item.id || newWorkspaceAccountId()).trim(),
      name: String(item.name || "").trim(),
      role: ["管理员", "成员", "只读"].includes(item.role) ? item.role : "成员",
      email: String(item.email || "").trim(),
      status: ["启用", "停用"].includes(item.status) ? item.status : "启用"
    }))
    .filter((item) => item.id && item.name);
  if (!normalized.length) normalized.push(fallback);
  const currentId = normalized.some((item) => item.id === accounts.currentId) ? accounts.currentId : normalized[0].id;
  return { currentId, list: normalized };
}

function newWorkspaceAccountId() {
  return `account-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function workspaceImportRules() {
  return state.workspace.importRules || {};
}

function isEnglish() {
  return state.workspace.identity?.language === "English";
}

function L(zh, en) {
  return isEnglish() ? en : zh;
}

function currentWorkMode() {
  return state.workspace.identity?.workMode || "标准";
}

function workModePolicy(mode = currentWorkMode()) {
  const table = {
    谨慎: {
      tone: "orange",
      title: "谨慎模式",
      titleEn: "Cautious mode",
      summary: "导入前可编辑复核，导出警告必须二次确认，AI 输出更强调风险边界。",
      summaryEn: "Uses editable import review, requires confirmation on export warnings, and asks AI to emphasize risk boundaries.",
      exportWarnings: "confirm"
    },
    标准: {
      tone: "green",
      title: "标准模式",
      titleEn: "Standard mode",
      summary: "导出警告二次确认，导入前可编辑复核，平衡效率和质量。",
      summaryEn: "Confirms export warnings, uses editable import review, and balances speed with quality.",
      exportWarnings: "confirm"
    },
    快速: {
      tone: "blue",
      title: "快速模式",
      titleEn: "Fast mode",
      summary: "非阻断导出警告不打断流程，导入仍需在可编辑预览中确认，AI 输出更偏行动清单。",
      summaryEn: "Non-blocking export warnings do not interrupt flow; imports still require editable review; AI output favors action lists.",
      exportWarnings: "skip"
    }
  };
  return table[mode] || table["标准"];
}

function workspaceGuidance() {
  const { language, workMode, nickname, team } = state.workspace.identity || {};
  const policy = workModePolicy(workMode);
  if (language === "English") {
    return [
      "Default language: English",
      `Work mode: ${policy.titleEn}. ${policy.summaryEn}`,
      team ? `Team: ${team}` : "",
      nickname ? `Local identity: ${nickname}` : ""
    ].filter(Boolean).join("\n");
  }
  return [
    `默认语言：${language || "中文"}`,
    `工作模式：${policy.title}。${policy.summary}`,
    team ? `团队名称：${team}` : "",
    nickname ? `本地身份：${nickname}` : ""
  ].filter(Boolean).join("\n");
}

function normalizeSkillRecord(item) {
  const next = { ...item };
  next.tags = Array.isArray(next.tags) ? next.tags : splitTags(next.tags || "Custom");
  next.category ||= "未分类";
  next.source ||= skillSource(next.name, next.install);
  next.mdUrl ||= skillMdUrl(next.name);
  next.install = normalizeSkillInstall(next.install, next.name);
  next.example = cleanSkillDescription(next.example || next.description || "");
  next.pros ||= "来自 GitHub，可沉淀为团队复用能力";
  next.cons ||= "导入后建议人工复核触发描述和权限边界";
  next.status ||= "待复核";
  if (/^https?:\/\//i.test(next.source || "") && next.status === "推荐") next.status = "待复核";
  next.note ||= "";
  next.md ||= builtInSkillMd(next.name) || skillMarkdown(next);
  if (next.mdUrl) next.rawLoaded = false;
  return next;
}

function normalizeMcpRecord(item = {}) {
  const name = item.name || "unnamed-mcp";
  const config = item.config || item.installSource || "MCP Connector";
  const source = item.source || mcpSource(name, config);
  const ability = item.ability || "项目上下文扩展服务";
  const use = item.use || "项目上下文扩展";
  return {
    name,
    category: item.category || inferMcpCategory(`${name} ${ability} ${use} ${config}`),
    ability,
    config,
    risk: normalizeRisk(item.risk || "中"),
    deps: item.deps || "按来源说明授权",
    use,
    source,
    sourceType: normalizeSourceType(item.sourceType || inferSourceType(source)),
    docs: item.docs || source,
    installSource: item.installSource || config,
    verified: item.verified || "待核验",
    permissions: item.permissions || item.deps || "按来源说明授权"
  };
}

function mcpSource(name, config = "") {
  const text = `${name} ${config}`;
  if (/context7/i.test(text)) return "https://github.com/upstash/context7";
  if (/github/i.test(text)) return "GitHub App Connector";
  if (/browser|playwright/i.test(text)) return "Browser plugin";
  if (/filesystem/i.test(text)) return "本地工作区配置";
  if (/^https?:\/\//i.test(config)) return config;
  return "manual";
}

function inferSourceType(source = "") {
  if (/github app connector|browser plugin|context7|microsoft|openai/i.test(source)) return "官方";
  if (/本地|workspace|manual/i.test(source)) return "本地自定义";
  if (/^https?:\/\//i.test(source)) return "第三方";
  return "待审核";
}

function normalizeSourceType(type = "") {
  return ["官方", "第三方", "本地自定义", "待审核"].includes(type) ? type : "待审核";
}

function render() {
  applyWorkspaceAppearance();
  document.documentElement.lang = isEnglish() ? "en" : "zh-CN";
  if (!state.auth.current) {
    document.getElementById("app").innerHTML = authPage();
    bindAuth();
    afterRender();
    return;
  }
  document.getElementById("app").innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">O</span>
          <div><strong>Orchestra OS</strong><small>skill config</small></div>
        </div>
        <nav>${nav.map(([id, label, icon]) => `<button class="${state.page === id ? "active" : ""}" data-page="${id}"><span>${icon}</span>${h(navLabel(id, label))}</button>`).join("")}</nav>
        <button class="sidebar-cta" data-create-project ${disabledUnless(canEditWorkspaceData)}>${L("+ 新配置", "+ New config")}</button>
      </aside>
      <main>
        <header class="topbar">
          <label class="search"><span>⌕</span><input id="global-search" placeholder="${L("搜索 Skill、MCP、模板...", "Search Skill, MCP, templates...")}" value="${h(state.query)}"></label>
          <div class="top-actions">${workspaceTopIdentity()}<button class="avatar" data-open-dialog="account-panel" title="账号与身份权限">${h(workspaceInitial())}</button></div>
        </header>
        ${pages[state.page]()}
        ${dialogMarkup()}
        ${feedbackToast()}
      </main>
    </div>`;
  bind();
  afterRender();
}

function authPage() {
  const isRegister = state.auth.view === "register";
  return `<main class="auth-shell">
    <section class="auth-card">
      <div class="brand auth-brand">
        <span class="brand-mark">O</span>
        <div><strong>Orchestra OS</strong><small>account workspace</small></div>
      </div>
      <h1>${isRegister ? "注册大账号" : "登录大账号"}</h1>
      <p>大账号用于隔离团队或个人的数据空间。不同大账号的项目、Skill/MCP 库和成员信息会写入不同 localStorage 命名空间。</p>
      <div class="form-grid">
        <label><span>大账号账号</span><input id="auth-username" autocomplete="username" placeholder="team-or-user"></label>
        <label><span>大账号密码</span><input id="auth-password" type="password" autocomplete="${isRegister ? "new-password" : "current-password"}" placeholder="password"></label>
        ${isRegister ? `<label><span>团队名称</span><input id="auth-team" placeholder="产品工程组"></label>` : ""}
        <button class="primary" data-${isRegister ? "register" : "login"}-account>${isRegister ? "注册账号" : "登录账号"}</button>
      </div>
      <div class="auth-switch">
        <button data-auth-view="${isRegister ? "login" : "register"}">${isRegister ? "已有账号，去登录" : "没有账号，注册账号"}</button>
      </div>
      <p class="subtle">原型说明：当前是纯前端本地账号校验，密码只适合本机演示。真实安全隔离需要后端会话、密码哈希和服务端权限校验。</p>
      ${state.auth.status ? `<div class="validation-box"><span>${h(state.auth.status)}</span></div>` : ""}
    </section>
  </main>`;
}

function bindAuth() {
  on("[data-auth-view]", "click", (el) => {
    state.auth.view = el.dataset.authView;
    state.auth.status = "";
    render();
  });
  on("[data-login-account]", "click", loginBigAccount);
  on("[data-register-account]", "click", registerBigAccount);
}

let feedbackTimer = null;
let dialogCloseTimer = null;

function afterRender() {
  if (state.dialog) window.requestAnimationFrame(focusActiveDialog);
}

function focusActiveDialog() {
  const modal = document.querySelector(".modal");
  if (!modal) return;
  const firstControl = modal.querySelector("[autofocus], input:not([disabled]), textarea:not([disabled]), select:not([disabled])")
    || modal.querySelector("button:not([disabled]), a[href]");
  (firstControl || modal).focus?.({ preventScroll: true });
}

function closeDialog() {
  const backdrop = document.querySelector(".modal-backdrop");
  if (!backdrop) {
    state.dialog = "";
    render();
    return;
  }
  window.clearTimeout(dialogCloseTimer);
  backdrop.classList.add("is-closing");
  dialogCloseTimer = window.setTimeout(() => {
    state.dialog = "";
    render();
  }, 150);
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape" && state.dialog) {
    event.preventDefault();
    closeDialog();
  }
}

function showFeedback(text, tone = "success") {
  if (!text) return;
  window.clearTimeout(feedbackTimer);
  state.feedback = { text, tone, id: Date.now() };
  render();
  feedbackTimer = window.setTimeout(() => {
    if (state.feedback?.text === text) {
      state.feedback = null;
      render();
    }
  }, 1800);
}

function feedbackToast() {
  if (!state.feedback) return "";
  return `<div class="feedback-toast ${h(state.feedback.tone)}" role="status" aria-live="polite">${h(state.feedback.text)}</div>`;
}

function navLabel(id, fallback) {
  const labels = {
    dashboard: L("仪表盘", "Dashboard"),
    projects: L("项目管理", "Projects"),
    skills: L("Skill 库", "Skill Library"),
    mcps: L("MCP 库", "MCP Library"),
    promptOptimizer: L("提示词优化", "Prompt Optimizer"),
    settings: L("工作区设置", "Workspace Settings")
  };
  return labels[id] || fallback;
}

function registerBigAccount() {
  const username = valueOf("auth-username");
  const password = valueOf("auth-password");
  const team = valueOf("auth-team");
  if (!username || !password) {
    state.auth.status = "大账号账号和密码必填。";
    render();
    return;
  }
  const registry = authRegistry();
  if (registry.accounts[username]) {
    state.auth.status = "该大账号已存在，请直接登录。";
    render();
    return;
  }
  const adminId = newWorkspaceAccountId();
  registry.accounts[username] = {
    username,
    password,
    adminPassword: DEFAULT_ADMIN_PASSWORD,
    createdAt: new Date().toISOString(),
    roles: [{ id: adminId, name: "管理员", role: "管理员", email: "", status: "启用" }]
  };
  registry.session = { username, roleId: adminId };
  saveAuthRegistry(registry);
  state.auth.current = { username, roleId: adminId };
  resetRuntimeData();
  state.workspace.identity.team = team || username;
  state.workspace.identity.nickname = "管理员";
  persistData();
  render();
}

function loginBigAccount() {
  const username = valueOf("auth-username");
  const password = valueOf("auth-password");
  const registry = authRegistry();
  const account = registry.accounts[username];
  if (!account || account.password !== password) {
    state.auth.status = "大账号账号或密码不正确。";
    render();
    return;
  }
  const roleId = account.roles?.find((item) => item.role === "管理员" && item.status !== "停用")?.id || account.roles?.[0]?.id;
  registry.session = { username, roleId };
  saveAuthRegistry(registry);
  state.auth.current = { username, roleId };
  resetRuntimeData();
  restoreData();
  render();
}

function logoutBigAccount() {
  const registry = authRegistry();
  registry.session = null;
  saveAuthRegistry(registry);
  state.auth.current = null;
  state.auth.view = "login";
  state.auth.status = "已退出当前大账号。";
  render();
}

function bind() {
  on("[data-page]", "click", (el) => {
    state.page = el.dataset.page;
    render();
  });
  const search = document.getElementById("global-search");
  search.addEventListener("input", (event) => {
    state.query = event.target.value;
    if (["skills", "mcps"].includes(state.page)) render();
  });
  on("[data-project]", "click", (el) => {
    state.project = Number(el.dataset.project);
    state.projectTab = "profile";
    state.exportPanels = { audit: false, preview: false };
    render();
  });
  on("[data-binding-meta]", "input", (el) => {
    updateBindingMeta(el);
  });
  on("[data-binding-meta]", "change", (el) => {
    updateBindingMeta(el);
  });
  on("[data-copy]", "click", async (el) => {
    if (el.dataset.copyProject && !confirmProjectExport(projects[state.project] || projects[0])) return;
    await navigator.clipboard.writeText(el.dataset.copy);
    flash(el, "已复制");
  });
  on("[data-ai]", "input", (el) => {
    if (!canEditWorkspaceData()) return;
    state.ai[el.dataset.ai] = el.value;
    if (el.dataset.ai !== "key") markWorkspaceSaved();
  });
  document.querySelectorAll("[data-ai-check]").forEach((el) => {
    el.addEventListener("change", () => {
      if (!canEditWorkspaceData()) return;
      state.ai[el.dataset.aiCheck] = el.checked;
      markWorkspaceSaved();
      render();
    });
  });
  on("[data-model-select]", "change", (el) => {
    if (!canEditWorkspaceData()) return;
    state.ai.model = el.value;
    markWorkspaceSaved();
    render();
  });
  on("[data-chat-model]", "change", (el) => {
    if (!canEditWorkspaceData()) return;
    state.ai.model = el.value;
    markWorkspaceSaved();
    render();
  });
  on("[data-import-url]", "input", (el) => {
    state.importer.url = el.value;
  });
  on("[data-prompt-input]", "input", (el) => {
    state.promptOptimizer.input = el.value;
  });
  on("[data-dashboard-chat-input]", "input", (el) => {
    state.dashboardChat.input = el.value;
  });
  on("[data-optimize-prompt]", "click", optimizePrompt);
  on("[data-send-dashboard-chat]", "click", sendDashboardChat);
  on("[data-project-tab]", "click", (el) => {
    state.projectTab = el.dataset.projectTab;
    render();
  });
  on("[data-workspace]", "input", (el) => updateWorkspaceSetting(el));
  on("[data-workspace]", "change", (el) => updateWorkspaceSetting(el));
  on("[data-create-account]", "click", createWorkspaceAccount);
  on("[data-switch-account]", "click", (el) => switchWorkspaceAccount(el.dataset.switchAccount));
  on("[data-delete-account]", "click", (el) => deleteWorkspaceAccount(el.dataset.deleteAccount));
  on("[data-account-status]", "change", (el) => updateWorkspaceAccountStatus(el.dataset.accountStatus, el.value));
  on("[data-change-admin-password]", "click", changeAdminPassword);
  on("[data-toggle-admin-password]", "click", () => {
    state.accountUi.adminPasswordOpen = !state.accountUi.adminPasswordOpen;
    render();
  });
  on("[data-logout-account]", "click", logoutBigAccount);
  on("[data-toggle-workspace-ai]", "click", () => {
    state.workspace.ui.aiSettingsOpen = !state.workspace.ui.aiSettingsOpen;
    markWorkspaceSaved();
    render();
  });
  on("[data-folder-path]", "input", (el) => {
    state.projectDraft.folderPath = el.value;
  });
  on("[data-project-enabled]", "change", (el) => {
    saveProject();
  });
  on("[data-template-rule-body]", "input", (el) => updateTemplateRulesBody(el));
  on("[data-template-rule-select]", "change", (el) => changeProjectTemplateRule(el));
  on("[data-template-rule-enabled]", "change", (el) => toggleTemplateRules(el));
  on("[data-save-template-rules]", "click", (el) => saveTemplateRules(el));
  on("[data-save-template-as]", "click", (el) => saveTemplateAs(el));
  on("[data-reset-template-rules]", "click", (el) => resetTemplateRules(el));
  on("[data-brief-edit]", "input", (el) => {
    updateProjectBrief(el);
  });
  on("[data-confirm-brief]", "click", confirmProjectBrief);
  on("[data-generate-brief]", "click", generateProjectBrief);
  on("[data-ai-mode]", "click", (el) => {
    if (!canEditWorkspaceData()) return;
    state.ai.mode = el.dataset.aiMode;
    markWorkspaceSaved();
    render();
  });
  on("[data-toggle-ai-config]", "click", () => {
    if (!canEditWorkspaceData()) return;
    state.ai.configOpen = !state.ai.configOpen;
    markWorkspaceSaved();
    render();
  });
  on("[data-ai-generate]", "click", () => refineCurrentProjectAgents());
  on("[data-fetch-models]", "click", fetchModels);
  on("[data-open-dialog]", "click", (el) => {
    state.dialog = el.dataset.openDialog;
    render();
  });
  on("[data-close-dialog]", "click", closeDialog);
  document.onkeydown = handleGlobalKeydown;
  on("[data-skill-filter]", "click", (el) => {
    state.skillFilter = el.dataset.skillFilter;
    render();
  });
  on("[data-mcp-filter]", "click", (el) => {
    state.mcpFilter = el.dataset.mcpFilter;
    render();
  });
  on("[data-manage-category]", "click", (el) => {
    state.dialog = `category-${el.dataset.manageCategory}`;
    render();
  });
  on("[data-add-category]", "click", (el) => addLibraryCategory(el.dataset.addCategory));
  on("[data-rename-category]", "click", (el) => renameLibraryCategory(el.dataset.renameCategory, el.dataset.value));
  on("[data-delete-category]", "click", (el) => deleteLibraryCategory(el.dataset.deleteCategory, el.dataset.value));
  on("[data-add-binding]", "click", (el) => updateProjectBinding(el.dataset.addBinding, el.dataset.value, "add"));
  on("[data-remove-binding]", "click", (el) => updateProjectBinding(el.dataset.removeBinding, el.dataset.value, "remove"));
  on("[data-delete-skill]", "click", (el) => deleteSkill(el.dataset.deleteSkill));
  on("[data-open-skill]", "click", (el) => openSkill(el.dataset.openSkill));
  on("[data-edit-skill]", "click", (el) => {
    state.selectedSkill = el.dataset.editSkill;
    state.dialog = "skill-edit";
    render();
  });
  on("[data-save-skill-edit]", "click", saveSkillEdit);
  on("[data-toggle-skill-note]", "click", (el) => {
    state.expandedSkillNotes[el.dataset.toggleSkillNote] = !state.expandedSkillNotes[el.dataset.toggleSkillNote];
    render();
  });
  on("[data-skill-note]", "input", (el) => updateSkillNote(el));
  on("[data-delete-mcp]", "click", (el) => deleteMcp(el.dataset.deleteMcp));
  on("[data-edit-mcp]", "click", (el) => {
    state.selectedMcp = el.dataset.editMcp;
    state.dialog = "mcp-edit";
    render();
  });
  on("[data-save-mcp-edit]", "click", saveMcpEdit);
  on("[data-toggle-export-panel]", "click", (el) => {
    state.exportPanels.active = el.dataset.toggleExportPanel || "audit";
    render();
  });
  on("[data-create-skill]", "click", createSkill);
  on("[data-create-mcp]", "click", createMcp);
  on("[data-import-github]", "click", (el) => importFromGithub(el.dataset.importGithub, el.dataset.ai === "true"));
  on("[data-save-import-review]", "click", saveImportReview);
  on("[data-save-project]", "click", saveProject);
  on("[data-delete-project]", "click", deleteProject);
  on("[data-ai-recommend]", "click", recommendProjectConfig);
  on("[data-add-recommend]", "click", (el) => updateProjectBinding(el.dataset.recommendType, el.dataset.value, "add"));
  on("[data-add-external]", "click", (el) => addExternalRecommendation(Number(el.dataset.addExternal), el.dataset.mode));
  on("[data-verify-external]", "click", (el) => verifyExternalRecommendation(Number(el.dataset.verifyExternal)));
  on("[data-clear-recommendations]", "click", clearRecommendations);
  on("[data-save-folder-current]", "click", savePathToCurrentProject);
  on("[data-add-folder-project]", "click", addProjectFromPath);
  document.querySelectorAll("[data-folder-picker]").forEach((picker) => {
    picker.addEventListener("change", addProjectFromFiles);
  });
  on("[data-export-project]", "click", async (el) => {
    const project = projects[state.project];
    if (!confirmProjectExport(project)) return;
    await navigator.clipboard.writeText(JSON.stringify(projectPayload(project), null, 2));
    recordProjectHistory(project, "复制项目 JSON", "导出了项目画像、绑定和生成结果。");
    persistData();
    flash(el, "JSON 已复制");
  });
  on("[data-open-project-folder]", "click", openCurrentProjectFolder);
  on("[data-generate-project]", "click", () => {
    const project = projects[state.project];
    state.projectTab = "generate";
    render();
  });
  on("[data-create-project]", "click", () => {
    if (!requirePermission(canEditWorkspaceData, "只读角色不能创建项目。")) return;
    projects.push([nextProjectName(), "待配置", ["openai-docs"], ["context7"], "React SaaS 控制台", "刚刚", "关注", projectMeta()]);
    state.project = projects.length - 1;
    state.page = "projects";
    persistData();
    render();
  });
  on("[data-download]", "click", (el) => downloadFile(el.dataset.download));
  on("[data-export-backup]", "click", exportBackup);
  on("[data-repair-storage]", "click", repairLocalStorage);
  on("[data-reset-demo]", "click", resetDemoData);
  const backupInput = document.querySelector("[data-import-backup]");
  if (backupInput) backupInput.addEventListener("change", importBackup);
}

function on(selector, event, handler) {
  document.querySelectorAll(selector).forEach((el) => el.addEventListener(event, () => handler(el)));
}

function flash(el, text) {
  const old = el.textContent;
  el.textContent = text;
  setTimeout(() => { el.textContent = old; }, 900);
  showFeedback(text);
}

function dashboardRecommendationCard() {
  return `<article class="panel recommendation dashboard-recommendation">
    <div class="panel-head"><div><p class="kicker">recommended stack</p><h2>推荐配置</h2></div>${chip("React SaaS", "blue")}</div>
    <div class="recommendation-stack-line">
      ${["frontend-design", "context7", "browser"].map((item) => chip(item, item === "browser" ? "green" : "blue")).join("")}
    </div>
    <p>适合从产品描述或设计稿快速落地可验收的前端控制台。</p>
    <button data-page="projects">进入项目工作台</button>
  </article>`;
}

function dashboardChatPanel() {
  const messages = state.dashboardChat.messages.length
    ? state.dashboardChat.messages
    : [{ role: "assistant", content: "可以问我当前工作区的 Skill、MCP、项目导出、导入规范或 AGENTS.md 生成建议。" }];
  const modelOptions = chatModelOptions();
  return `<article class="panel llm-chat-panel dashboard-chat-panel">
    <div class="panel-head">
      <div><p class="kicker">AI WORKSPACE</p><h2>AI 工作区问答</h2><p class="subtle">${h(state.dashboardChat.status)}</p></div>
      ${chip(canCallModel() ? "可用" : "未配置", canCallModel() ? "green" : "orange")}
    </div>
    <label><span>模型</span><select data-chat-model ${canEditWorkspaceData() ? "" : "disabled"}>${modelOptions.map((model) => `<option value="${h(model)}" ${state.ai.model === model ? "selected" : ""}>${h(model)}</option>`).join("")}</select></label>
    <div class="chat-log">
      ${messages.slice(-6).map((message) => `<div class="chat-message ${message.role === "user" ? "user" : ""}"><span>${message.role === "user" ? "你" : "AI"}</span><p>${h(message.content)}</p></div>`).join("")}
    </div>
    <div class="chat-compose">
      <textarea data-dashboard-chat-input placeholder="问一个工作区问题，例如：这个项目应该启用哪些 MCP？" ${canEditWorkspaceData() ? "" : "disabled"}>${h(state.dashboardChat.input)}</textarea>
      <button class="primary" data-send-dashboard-chat ${state.dashboardChat.loading || !canCallModel() || !canEditWorkspaceData() ? "disabled" : ""}>${state.dashboardChat.loading ? "思考中" : "发送"}</button>
    </div>
  </article>`;
}

function dashboardModelPicker() {
  const modelOptions = chatModelOptions();
  const canEdit = canEditWorkspaceData();
  return `<div class="dashboard-model-picker">
    <div>
      <span>模型</span>
      <select data-model-select ${canEdit ? "" : "disabled"}>
        ${modelOptions.map((model) => `<option value="${h(model)}" ${state.ai.model === model ? "selected" : ""}>${h(model)}</option>`).join("")}
      </select>
    </div>
    <button data-fetch-models ${state.ai.modelsLoading || !canEdit ? "disabled" : ""}>${state.ai.modelsLoading ? "拉取中..." : "拉取模型"}</button>
  </div>`;
}

function chatModelOptions() {
  const models = [state.ai.model, ...(state.ai.models || [])].filter(Boolean);
  return [...new Set(models)].length ? [...new Set(models)] : ["gpt-4o-mini"];
}

const pages = {
  dashboard() {
    return `
      <section class="page dashboard-page">
        <div class="hero">
          <p class="kicker">orchestration desk</p>
          <h1>早上好，指挥家</h1>
          <p>集中管理团队项目的 skills、MCP 服务与 AGENTS.md 配置，保持每个 Agent 工作方式清晰可复用。</p>
        </div>
        <section class="metrics">
          ${metric("pr", "项目", projects.length, "+3 本周")}
          ${metric("sk", "收藏 Skill", skills.length, `${skills.filter((item) => item.status === "已安装").length} 已安装`)}
          ${metric("mc", "MCP 服务", mcps.length, `${mcps.filter((item) => item.risk === "高").length} 个高风险`)}
        </section>
        <section class="dashboard-grid">
          <article class="panel large-panel">
            <div class="panel-head"><h2>最近使用</h2><button data-page="projects">全部项目</button></div>
            ${projects.map(rowProject).join("")}
          </article>
          <div class="dashboard-side">
            <article class="panel ai-workspace-card">
              <div class="panel-head">
                <div><p class="kicker">AI WORKSPACE</p><h2>AI 工作区</h2><p class="subtle">配置 AI 后可直接提问当前工作区问题。</p></div>
                ${chip(canCallModel() ? "已配置" : "未配置", canCallModel() ? "green" : "orange")}
              </div>
              ${dashboardModelPicker()}
              ${dashboardChatPanel()}
            </article>
          </div>
        </section>
      </section>`;
  },

  skills() {
    const q = state.query.toLowerCase();
    const list = skills.filter((item) => {
      const matchQuery = !q || [item.name, item.category, item.tags.join(" ")].join(" ").toLowerCase().includes(q);
      const matchFilter = state.skillFilter === "all" || item.category === state.skillFilter;
      return matchQuery && matchFilter;
    });
    return `
      <section class="page">
        ${titleBlock("Skill 库", "按分类、标签、适用模型、工具和安装方式管理团队常用 skills。")}
        <div class="toolbar library-actions">
          ${categoryToolbar("skill", skillCategories)}
          <button class="primary" data-open-dialog="skill" ${disabledUnless(canAddLibrary)}>+ 新 Skill</button>
        </div>
        <section class="stats-grid">
          ${categoryStats("skill")}
        </section>
        <section class="library-layout">
          <div class="split">
            <div class="panel list-panel">${list.map(skillCard).join("") || emptyState("没有匹配的 skill")}</div>
            <aside class="panel detail-panel manage-panel"><p class="kicker">manage skill</p><h2>添加 Skill</h2>${skillForm()}</aside>
          </div>
        </section>
      </section>`;
  },

  mcps() {
    const q = state.query.toLowerCase();
    const list = mcps.filter((item) => {
      const normalized = normalizeMcpRecord(item);
      const matchQuery = !q || Object.values(normalized).join(" ").toLowerCase().includes(q);
      const matchFilter = state.mcpFilter === "all" || normalized.category === state.mcpFilter;
      return matchQuery && matchFilter;
    });
    return `
      <section class="page">
        ${titleBlock("模型上下文协议", "为每个项目选择可审计、可解释、权限最小化的 MCP 服务。")}
        <div class="toolbar library-actions">
          ${categoryToolbar("mcp", mcpCategories)}
          <button class="primary" data-open-dialog="mcp" ${disabledUnless(canAddLibrary)}>登记服务</button>
        </div>
        <section class="library-layout"><div class="card-grid">${list.map(mcpCard).join("") || emptyState("没有匹配的 MCP")}</div></section>
      </section>`;
  },

  projects() {
    ensureProjects();
    const selected = projects[state.project];
    const meta = getProjectMeta(selected);
    return `
      <section class="page">
        ${titleBlock("项目协调", "为项目生成 AGENTS.md、推荐调用策略，并导出可复核的 Skill/MCP 配置。")}
        <section class="project-layout">
          <aside class="project-rail">
            <div class="project-list">${projects.map((item) => {
              const index = projects.indexOf(item);
              return `
              <button data-project="${index}" class="${state.project === index ? "active" : ""}">
                <strong>${h(item[0])}</strong><span>${h(item[1])} · ${h(item[5])}</span><em>${h(getProjectMeta(item).statusTag)}</em>
              </button>`;
            }).join("")}</div>
            <article class="panel folder-panel">
              <p class="kicker">local project</p>
              <h3>连接或记录项目</h3>
              <label><span>手填本机路径</span><input data-folder-path value="${h(state.projectDraft.folderPath)}" placeholder="D:\\Desktop\\my-project"></label>
              <div class="folder-actions">
                <button data-save-folder-current ${disabledUnless(canEditWorkspaceData)}>保存到当前项目</button>
                <button class="primary" data-add-folder-project ${disabledUnless(canEditWorkspaceData)}>记录为新项目</button>
              </div>
              <label class="folder-picker">
                <input type="file" webkitdirectory directory multiple data-folder-picker="current" ${disabledUnless(canEditWorkspaceData)}>
                <span>连接当前项目</span>
              </label>
              <label class="folder-picker">
                <input type="file" webkitdirectory directory multiple data-folder-picker="new" ${disabledUnless(canEditWorkspaceData)}>
                <span>导入为新项目</span>
              </label>
              <p class="subtle">手填路径仅记录，浏览器无法验证；文件夹扫描只能拿到授权文件夹名，但会读取关键文件。</p>
            </article>
          </aside>
          <div class="project-workspace">
            <article class="panel project-hero">
              <div><p class="kicker">project workspace</p><h2>${h(selected[0])}</h2><p>${h(selected[1])} · ${scanStatusText(meta)} · ${scanTimeLabel(meta)}</p></div>
              <div class="project-actions">
                ${chip(selected[6], selected[6] === "安全" ? "green" : "orange")}
                <button data-save-project ${disabledUnless(canEditWorkspaceData)}>保存项目</button>
                <button data-ai-recommend ${state.recommendations.loading || !canEditWorkspaceData() ? "disabled" : ""}>${state.recommendations.loading ? "推荐中..." : "AI 推荐配置"}</button>
                <button data-open-project-folder>打开项目文件夹</button>
                <label class="rescan-picker">
                  <input type="file" webkitdirectory directory multiple data-folder-picker="current" ${disabledUnless(canEditWorkspaceData)}>
                  <span>重新扫描</span>
                </label>
                <button class="ghost-danger" data-delete-project ${disabledUnless(canEditWorkspaceData)}>删除项目</button>
              </div>
            </article>
            ${projectWorkflowTabs()}
            ${projectTabContent(selected, meta)}
          </div>
        </section>
      </section>`;
  },

  settings() {
    return `
      <section class="page">
        ${titleBlock(L("工作区设置", "Workspace Settings"), L("集中管理全局偏好、AI 配置、导入规范、操作身份和本地数据。", "Manage global preferences, AI configuration, import rules, operator identities, and local data."))}
        ${workspaceSaveStatus()}
        <section class="settings-grid">
          ${workspaceIdentityPanel()}
          ${workspaceAppearancePanel()}
          ${workspaceAiPanel()}
          ${workspaceImportRulesPanel()}
          ${workspaceDataPanel()}
        </section>
      </section>`;
  },

  promptOptimizer() {
    return `
      <section class="page">
        ${titleBlock("提示词优化", "调用当前工作区 AI 配置，将粗略提示词整理为目标清晰、约束明确、可直接复制使用的版本。")}
        ${promptOptimizerPanel("standalone")}
      </section>`;
  }
};

function projectWorkflowTabs() {
  const tabs = [
    ["profile", "1 画像"],
    ["bindings", "2 Skill / MCP"],
    ["generate", "3 生成"],
    ["diff", "4 差异"],
    ["export", "5 导出"]
  ];
  return `<nav class="project-tabs">${tabs.map(([id, label]) => `<button data-project-tab="${id}" class="${state.projectTab === id ? "selected" : ""}">${h(label)}</button>`).join("")}</nav>`;
}

function workspaceTopIdentity() {
  const role = currentRole();
  const name = role?.name || state.auth.current?.username || state.workspace.identity.nickname || state.workspace.identity.team;
  if (!name) return "";
  return `<span class="workspace-user"><strong>${h(state.auth.current?.username || name)}</strong><small>${h(role ? `${role.name} · ${role.role}` : currentWorkMode())}</small></span>`;
}

function workspaceInitial() {
  const name = state.workspace.identity.nickname || state.workspace.identity.team || "W";
  return String(name).trim().slice(0, 1).toUpperCase();
}

function applyWorkspaceAppearance() {
  const root = document.documentElement;
  const appearance = state.workspace.appearance || {};
  const theme = appearance.theme === "system"
    ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : appearance.theme || "light";
  root.dataset.theme = theme;
  root.dataset.accent = appearance.accent || "green";
  root.dataset.density = appearance.density || "comfortable";
  root.dataset.fontSize = appearance.fontSize || "default";
}

function storageUsageText() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || JSON.stringify(storagePayload());
    return formatBytes(new Blob([raw]).size);
  } catch {
    return "无法读取";
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function workspaceSaveStatus() {
  return `<p class="settings-save-status" data-workspace-save-status>${L("自动保存 · 最近保存：", "Auto-save · Last saved: ")}${h(state.workspace.data.lastSavedAt || L("尚未修改", "Not modified"))}</p>`;
}

function currentTimestamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function markWorkspaceSaved() {
  state.workspace.data.lastSavedAt = currentTimestamp();
  persistData();
  const saveStatus = document.querySelector("[data-workspace-save-status]");
  if (saveStatus) {
    saveStatus.textContent = `${L("自动保存 · 最近保存：", "Auto-save · Last saved: ")}${state.workspace.data.lastSavedAt} · ${L("已保存", "Saved")}`;
    saveStatus.classList.remove("is-saved");
    void saveStatus.offsetWidth;
    saveStatus.classList.add("is-saved");
    window.setTimeout(() => {
      saveStatus.textContent = `${L("自动保存 · 最近保存：", "Auto-save · Last saved: ")}${state.workspace.data.lastSavedAt}`;
      saveStatus.classList.remove("is-saved");
    }, 1400);
  }
}

function workspaceAccountsPanel(mode = "settings") {
  const account = currentBigAccount();
  const roles = account?.roles || [];
  const current = currentRole();
  const admin = canManageMembers();
  const articleClass = mode === "drawer" ? "account-panel-body" : "panel settings-panel settings-wide";
  return `<article class="${articleClass}">
    ${mode === "drawer" ? "" : `<div class="settings-head">
      <div><p class="kicker">account workspace</p><h3>账号与身份权限</h3></div>
      ${chip(`大账号：${state.auth.current?.username || "-"}`, "blue")}
    </div>`}
    <div class="settings-summary">
      <span>当前身份：${h(current?.name || "-")}</span>
      <span>当前角色：${h(current?.role || "-")}</span>
      <span>权限：${h(permissionSummary())}</span>
    </div>
    <p class="subtle">大账号隔离当前浏览器内的数据空间；角色权限会在核心操作函数中校验。当前仍是纯前端原型，真实安全需要后端会话与服务端权限校验。</p>
    <div class="account-list">
      ${roles.map(accountRow).join("")}
    </div>
    <div class="account-management-row">
      <div class="settings-form account-create-grid">
        ${miniField("身份名称", "account-name", "例如：前端成员")}
        ${miniField("Email", "account-email", "name@example.com")}
        ${miniSelect("角色", "account-role", ["成员", "只读"])}
        ${miniSelect("状态", "account-status", ["启用", "停用"])}
        <button class="primary" data-create-account ${admin ? "" : "disabled"}>添加成员/只读</button>
      </div>
      <div class="account-admin-actions">
        <button data-toggle-admin-password ${admin ? "" : "disabled"}>${state.accountUi.adminPasswordOpen ? "收起密码修改" : "修改管理员密码"}</button>
        <button class="ghost-danger" data-logout-account>退出账号</button>
      </div>
    </div>
    ${state.accountUi.adminPasswordOpen ? `<div class="settings-form admin-password-row">
      <input id="admin-old-password" type="password" placeholder="旧管理员密码">
      <input id="admin-new-password" type="password" placeholder="新管理员密码">
      <button data-change-admin-password ${admin ? "" : "disabled"}>确认修改</button>
    </div>` : ""}
  </article>`;
}

function accountRow(account) {
  const isCurrent = account.id === state.auth.current?.roleId;
  const disabled = account.status === "停用";
  const manageable = canManageMembers() && account.role !== "管理员" && !isCurrent;
  return `<div class="account-row ${isCurrent ? "active" : ""}">
    <div>
      <strong>${h(account.name)}</strong>
      <span>${h(account.role)} · ${h(account.status)}${account.email ? ` · ${h(account.email)}` : ""}</span>
    </div>
    <div class="account-actions">
      ${isCurrent ? chip("当前", "green") : `<button data-switch-account="${h(account.id)}" ${disabled ? "disabled" : ""}>切换身份</button>`}
      ${manageable ? `<select class="account-status-select" data-account-status="${h(account.id)}">
        ${["启用", "停用"].map((status) => `<option value="${h(status)}" ${account.status === status ? "selected" : ""}>${h(status)}</option>`).join("")}
      </select>` : ""}
      <button class="ghost-danger" data-delete-account="${h(account.id)}" ${manageable ? "" : "disabled"}>删除</button>
    </div>
  </div>`;
}

function permissionSummary() {
  const role = currentRoleName();
  if (role === "管理员") return "可新增、编辑、删除 Skill/MCP，并管理成员。";
  if (role === "成员") return "可新增 Skill/MCP；不可编辑、删除或管理成员。";
  if (role === "只读") return "只能查看数据。";
  return "未登录。";
}

function workspaceIdentityPanel() {
  return `<article class="panel settings-panel">
    <div><p class="kicker">local identity</p><h3>${L("本地身份", "Local Identity")}</h3></div>
    <div class="settings-form two-col-form">
      ${workspaceField(L("昵称", "Nickname"), "identity.nickname", "Alex")}
      ${workspaceField(L("团队名称", "Team"), "identity.team", L("例如：产品工程组", "e.g. Product Engineering"))}
      ${workspaceSelect(L("默认语言", "Default language"), "identity.language", ["中文", "English"])}
      ${workspaceSelect(L("工作模式", "Work mode"), "identity.workMode", ["谨慎", "标准", "快速"])}
    </div>
    ${workModeNotice()}
    <p class="subtle">${L("语言设置主要影响 AI 提示、AGENTS.md 偏好和部分工作区界面；项目页与库管理还不是完整国际化。", "Language currently affects AI prompts, AGENTS.md preferences, and part of the workspace UI. Project and library pages are not fully internationalized yet.")}</p>
    <p class="subtle">${L("本地身份保存团队、语言和工作模式偏好；上方操作身份用于切换当前维护者标签，不代表账号登录。", "Local identity stores team, language, and work-mode preferences. Operator identity above switches the current maintainer label and is not account login.")}</p>
  </article>`;
}

function workModeNotice() {
  const policy = workModePolicy();
  return `<div class="mode-policy">
    ${chip(isEnglish() ? policy.titleEn : policy.title, policy.tone)}
    <span>${h(isEnglish() ? policy.summaryEn : policy.summary)}</span>
  </div>`;
}

function workspaceAppearancePanel() {
  return `<article class="panel settings-panel">
    <div><p class="kicker">appearance</p><h3>${L("外观偏好", "Appearance")}</h3></div>
    <div class="settings-form two-col-form">
      ${workspaceSelect(L("主题", "Theme"), "appearance.theme", ["明亮", "暗色", "跟随系统"], { light: L("明亮", "Light"), dark: L("暗色", "Dark"), system: L("跟随系统", "System") })}
      ${workspaceSelect(L("主题色", "Accent"), "appearance.accent", ["绿色", "蓝色", "石墨"], { green: L("绿色", "Green"), blue: L("蓝色", "Blue"), graphite: L("石墨", "Graphite") })}
      ${workspaceSelect(L("界面密度", "Density"), "appearance.density", ["舒适", "紧凑"], { comfortable: L("舒适", "Comfortable"), compact: L("紧凑", "Compact") })}
      ${workspaceSelect(L("字号", "Font size"), "appearance.fontSize", ["小", "默认", "大"], { small: L("小", "Small"), default: L("默认", "Default"), large: L("大", "Large") })}
    </div>
    <p class="subtle">${L("外观偏好会立即作用于当前工作区，并随配置包导入导出。“跟随系统”会在页面渲染时读取系统主题；系统主题变化后刷新页面即可同步。", "Appearance preferences apply immediately and are included in backup import/export. System theme is read when the page renders; refresh after OS theme changes.")}</p>
  </article>`;
}

function workspaceAiPanel() {
  const open = Boolean(state.workspace.ui.aiSettingsOpen);
  return `<article class="panel settings-panel settings-wide">
    <div class="settings-head">
      <div><p class="kicker">ai settings</p><h3>${L("AI 设置", "AI Settings")}</h3></div>
      <button data-toggle-workspace-ai>${open ? L("收起", "Collapse") : L("展开配置", "Expand")}</button>
    </div>
    <div class="settings-summary">
      <span>${h(modelStatusText())}</span>
      <span>默认模型：${h(state.ai.model || "未设置")}</span>
      <span>Endpoint：${h(state.ai.proxyEndpoint || state.ai.endpoint || "未设置")}</span>
    </div>
    <p class="subtle">${L("这里是完整的全局 AI 配置。项目页的模型配置按钮只是快捷入口，使用同一套配置。推荐使用本地代理转发模型请求。API Key 只保存在当前页面内存中，刷新后不会持久保存，也不会进入配置包。", "This is the full global AI configuration. Project-page model buttons are shortcuts to the same configuration. A local proxy is recommended. API Key stays in memory only and is not exported.")}</p>
    ${open ? providerApiForm() : ""}
  </article>`;
}

function promptOptimizerPanel(mode = "embedded") {
  const output = state.promptOptimizer.output || "";
  const wideClass = mode === "embedded" ? "settings-wide" : "";
  return `<article class="panel settings-panel ${wideClass} prompt-optimizer-panel">
    <div class="settings-head">
      <div><p class="kicker">prompt optimizer</p><h3>提示词优化</h3></div>
      ${chip(canCallModel() ? "AI 已配置" : "需配置 AI", canCallModel() ? "green" : "orange")}
    </div>
    <p class="subtle">调用当前工作区 AI 配置，把粗略提示词整理成目标清晰、上下文完整、约束明确、输出格式可控的版本。</p>
    <div class="prompt-optimizer-grid">
      <label><span>原始提示词</span><textarea data-prompt-input placeholder="粘贴需要优化的提示词，例如：帮我写一个项目周报生成脚本。">${h(state.promptOptimizer.input)}</textarea></label>
      <label><span>优化结果</span><textarea readonly placeholder="优化后的提示词会显示在这里。">${h(output)}</textarea></label>
    </div>
    <div class="prompt-actions">
      <button class="primary" data-optimize-prompt ${state.promptOptimizer.loading || !canCallModel() || !canEditWorkspaceData() ? "disabled" : ""}>${state.promptOptimizer.loading ? "优化中..." : "优化提示词"}</button>
      <button data-copy="${h(output)}" ${output ? "" : "disabled"}>复制结果</button>
      <span>${h(state.promptOptimizer.status)}</span>
    </div>
  </article>`;
}

function workspaceImportRulesPanel() {
  return `<article class="panel settings-panel">
    <div><p class="kicker">import rules</p><h3>${L("导入规范", "Import Rules")}</h3></div>
    <div class="settings-form two-col-form">
      ${workspaceCheck("自动清洗 Markdown", "importRules.cleanMarkdown")}
      <label class="compact-toggle settings-toggle"><input type="checkbox" checked disabled><span>导入前可编辑复核</span></label>
      ${workspaceSelect("导入后默认状态", "importRules.defaultStatus", ["待复核", "推荐", "已安装"])}
      ${workspaceField("未识别安装命令时显示", "importRules.installFallback", "手动导入")}
      ${workspaceField("卡片简介最大长度", "importRules.summaryMaxLength", "120", "number")}
    </div>
    <p class="subtle">${L("这些规范会影响 GitHub 导入后的确认、状态、安装命令兜底和简介清洗。已导入条目不会自动回写，需要手动重新导入或编辑。", "These rules affect GitHub import confirmation, status, install fallback, and summary cleaning. Existing imported items are not rewritten automatically.")}</p>
  </article>`;
}

function workspaceDataPanel() {
  return `<article class="panel settings-panel">
    <div><p class="kicker">local data</p><h3>${L("数据管理", "Data Management")}</h3></div>
    <p>${h(state.backup.status)}</p>
    <div class="settings-summary">
      <span>本地存储：${h(storageUsageText())}</span>
      <span>最近备份：${h(state.workspace.data.lastBackupAt || "尚未导出")}</span>
    </div>
    <div class="backup-actions">
      <button data-export-backup>导出全部配置包</button>
      <label class="backup-import">
        <input type="file" accept="application/json,.json" data-import-backup ${disabledUnless(canEditWorkspaceData)}>
        <span>导入配置包</span>
      </label>
      <button class="ghost-danger" data-reset-demo ${disabledUnless(canEditWorkspaceData)}>重置示例库</button>
      <button class="ghost-danger" data-repair-storage>修复本地存储</button>
    </div>
    <p class="subtle">配置包不包含 API Key。数据保存在浏览器 localStorage。清理浏览器数据或换设备前请先导出配置包。只重置 Skill、MCP、模板和项目示例，不会清空工作区身份、外观和 AI 设置。如果刷新后反复提示配置读取失败，可使用“修复本地存储”用当前页面状态覆盖浏览器本地存储。</p>
  </article>`;
}

function workspaceField(label, path, placeholder = "", type = "text") {
  return `<label><span>${h(label)}</span><input type="${h(type)}" data-workspace="${h(path)}" value="${h(workspaceValue(path))}" placeholder="${h(placeholder)}" ${disabledUnless(canEditWorkspaceData)}></label>`;
}

function workspaceSelect(label, path, labels, valueMap = null) {
  const current = workspaceValue(path);
  const entries = valueMap ? Object.entries(valueMap).map(([value, text]) => ({ value, text })) : labels.map((text) => ({ value: text, text }));
  return `<label><span>${h(label)}</span><select data-workspace="${h(path)}" ${disabledUnless(canEditWorkspaceData)}>${entries.map(({ value, text }) => `<option value="${h(value)}" ${String(current) === String(value) ? "selected" : ""}>${h(text)}</option>`).join("")}</select></label>`;
}

function workspaceCheck(label, path) {
  return `<label class="compact-toggle settings-toggle"><input type="checkbox" data-workspace="${h(path)}" ${workspaceValue(path) ? "checked" : ""} ${disabledUnless(canEditWorkspaceData)}><span>${h(label)}</span></label>`;
}

function workspaceValue(path) {
  return path.split(".").reduce((current, part) => current?.[part], state.workspace);
}

function updateWorkspaceSetting(el) {
  if (!canEditWorkspaceData()) return;
  const parts = el.dataset.workspace.split(".");
  const key = parts.pop();
  const target = parts.reduce((current, part) => current?.[part], state.workspace);
  if (!target || !key) return;
  target[key] = el.type === "checkbox" ? el.checked : el.type === "number" ? finiteNumber(el.value, target[key]) : el.value;
  if (parts[0] === "appearance") applyWorkspaceAppearance();
  markWorkspaceSaved();
  if (parts[0] === "identity" && ["language", "workMode"].includes(key)) render();
}

function createWorkspaceAccount() {
  if (!requirePermission(canManageMembers, "只有管理员可以添加成员或只读身份。")) return;
  const registry = authRegistry();
  const account = registry.accounts[state.auth.current.username];
  const name = valueOf("account-name");
  if (!name) {
    alert("身份名称必填。");
    return;
  }
  if (account.roles.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
    alert("已存在同名身份。");
    return;
  }
  const role = {
    id: newWorkspaceAccountId(),
    name,
    role: valueOf("account-role") || "成员",
    email: valueOf("account-email"),
    status: valueOf("account-status") || "启用"
  };
  if (role.role === "管理员") role.role = "成员";
  account.roles.push(role);
  saveAuthRegistry(registry);
  markWorkspaceSaved();
  render();
}

function switchWorkspaceAccount(id) {
  const registry = authRegistry();
  const account = registry.accounts[state.auth.current.username];
  const role = account.roles.find((item) => item.id === id);
  if (!role || role.status === "停用") return;
  if (role.role === "管理员" && currentRoleName() !== "管理员") {
    const password = prompt("切换到管理员身份需要输入管理员密码。");
    if (password !== account.adminPassword) {
      alert("管理员密码不正确。");
      return;
    }
  }
  state.auth.current.roleId = role.id;
  registry.session = { username: state.auth.current.username, roleId: role.id };
  saveAuthRegistry(registry);
  state.workspace.identity.nickname = role.name;
  markWorkspaceSaved();
  render();
}

function deleteWorkspaceAccount(id) {
  if (!requirePermission(canManageMembers, "只有管理员可以删除成员或只读身份。")) return;
  const registry = authRegistry();
  const account = registry.accounts[state.auth.current.username];
  const role = account.roles.find((item) => item.id === id);
  if (!role || role.role === "管理员" || id === state.auth.current.roleId) return;
  if (!confirm(`确认删除身份“${role.name}”？`)) return;
  account.roles = account.roles.filter((item) => item.id !== id);
  saveAuthRegistry(registry);
  markWorkspaceSaved();
  render();
}

function updateWorkspaceAccountStatus(id, status) {
  if (!requirePermission(canManageMembers, "只有管理员可以停用或启用成员身份。")) return;
  const registry = authRegistry();
  const account = registry.accounts[state.auth.current.username];
  const role = account.roles.find((item) => item.id === id);
  if (!role || role.role === "管理员" || id === state.auth.current.roleId) return;
  role.status = status === "停用" ? "停用" : "启用";
  saveAuthRegistry(registry);
  markWorkspaceSaved();
  showFeedback(`已${role.status === "停用" ? "停用" : "启用"}身份：${role.name}`);
}

function changeAdminPassword() {
  if (!requirePermission(canManageMembers, "只有管理员可以修改管理员密码。")) return;
  const oldPassword = valueOf("admin-old-password");
  const newPassword = valueOf("admin-new-password");
  const registry = authRegistry();
  const account = registry.accounts[state.auth.current.username];
  if (!newPassword) {
    alert("新管理员密码不能为空。");
    return;
  }
  if (account.adminPassword !== oldPassword) {
    alert("旧管理员密码不正确。");
    return;
  }
  account.adminPassword = newPassword;
  saveAuthRegistry(registry);
  state.accountUi.adminPasswordOpen = false;
  showFeedback("管理员密码已修改");
}

function projectTabContent(project, meta) {
  const tab = state.projectTab || "profile";
  if (tab === "bindings") return projectBindingsTab(project);
  if (tab === "generate") return projectGenerateTab(project, meta);
  if (tab === "diff") return projectDiffTab(project, meta);
  if (tab === "export") return projectExportTab(project, meta);
  return projectProfileTab(project, meta);
}

function projectProfileTab(project, meta) {
  return `
    <article class="panel project-edit-card">
      ${projectField("项目名", "name", project[0])}
      ${projectField("项目类型", "type", project[1])}
      ${projectField("状态", "status", project[6])}
      ${projectSelectField("项目状态标签", "statusTag", PROJECT_STATUS_TAGS, meta.statusTag)}
      <label class="project-notes"><span>备注</span><textarea data-project-edit="notes" ${disabledUnless(canEditWorkspaceData)}>${h(meta.notes)}</textarea></label>
      ${projectBriefFields(meta)}
    </article>
    <section class="project-summary">
      ${summaryTile(projectLocationTitle(meta), projectLocationValue(meta), projectLocationDetail(meta))}
      ${summaryTile("AGENTS.md", meta.agentsFound ? "已检测" : "未检测", meta.agentsFound ? "可预览 / 可覆盖" : "可生成")}
      ${summaryTile("关键文件", meta.detectedFiles.length, meta.scanError || "扫描完成")}
    </section>
    ${scanFilesPanel(meta)}`;
}

function projectBindingsTab(project) {
  return `
    ${recommendationPanel(project)}
    <section class="binding-board two">
      ${bindingPanel("Skills", "skills", project[2], skills.map((item) => item.name), project)}
      ${bindingPanel("MCP", "mcps", project[3], mcps.map((item) => item.name), project)}
    </section>`;
}

function projectGenerateTab(project, meta) {
  const generated = projectGeneratedAgents(project);
  return `
    <section class="generate-workbench">
      ${templateRulesEditor(project, meta)}
      <article class="panel preview-panel">
        <div class="panel-head">
          <div><p class="kicker">agents preview</p><h3>生成内容</h3></div>
          <div class="agents-actions">
            <button data-copy="${h(generated)}" data-copy-project="agents">复制</button>
            <button data-ai-generate ${state.ai.loading || !canEditWorkspaceData() ? "disabled" : ""}>${state.ai.loading ? "润色中..." : "模型润色草稿"}</button>
            <button data-open-dialog="model-config">模型配置</button>
          </div>
        </div>
        <p class="subtle">静态站不会直接写回项目文件；请复制或下载后手动放入项目根目录，或后续接入本地后端写回。</p>
        <pre>${h(generated)}</pre>
      </article>
    </section>`;
}

function templateRulesEditor(project, meta) {
  const selected = templates.find((item) => item.name === project[4]);
  const body = currentTemplateRulesBody(project);
  const options = [...templates.map((item) => item.name), "自定义模板"];
  return `<article class="panel template-rules-panel">
    <div class="panel-head">
      <div><p class="kicker">base rules</p><h3>模板基础规则</h3></div>
      ${chip(meta.templateRulesEnabled ? "已启用" : "未启用", meta.templateRulesEnabled ? "green" : "orange")}
    </div>
    <label><span>当前模板</span><select data-template-rule-select ${disabledUnless(canEditWorkspaceData)}>${options.map((name) => `<option value="${h(name)}" ${name === (selected?.name || "自定义模板") ? "selected" : ""}>${h(name)}</option>`).join("")}</select></label>
    <label class="compact-toggle"><input type="checkbox" data-template-rule-enabled ${meta.templateRulesEnabled ? "checked" : ""} ${disabledUnless(canEditWorkspaceData)}><span>启用模板基础规则</span></label>
    <label><span>规则内容</span><textarea data-template-rule-body ${meta.templateRulesEnabled && canEditWorkspaceData() ? "" : "disabled"}>${h(body)}</textarea></label>
    <div class="template-rule-actions">
      <button class="primary" data-save-template-rules ${meta.templateRulesEnabled && canEditWorkspaceData() ? "" : "disabled"}>保存为当前项目规则</button>
      <button data-save-template-as ${meta.templateRulesEnabled && canEditWorkspaceData() ? "" : "disabled"}>另存为模板</button>
      <button data-reset-template-rules ${selected && meta.templateRulesEnabled && canEditWorkspaceData() ? "" : "disabled"}>恢复默认模板</button>
    </div>
    <p class="subtle">模板基础规则会写入 AGENTS.md。它不是 Skill/MCP 资源绑定，而是当前项目的可编辑生成规则。</p>
  </article>`;
}

function currentTemplateRulesBody(project) {
  const meta = getProjectMeta(project);
  if (meta.templateRulesBody) return meta.templateRulesBody;
  return defaultTemplateRulesBody(project);
}

function defaultTemplateRulesBody(project) {
  const item = templates.find((templateItem) => templateItem.name === project?.[4]);
  return item?.body ? item.body.replace(/^#\s*AGENTS\.md\s*/i, "").trim() : "";
}

function projectGeneratedAgents(project) {
  const meta = getProjectMeta(project);
  if (meta.refinedAgents) return meta.refinedAgents;
  return projectAgents(project);
}

async function refineCurrentProjectAgents() {
  const project = projects[state.project];
  if (!project || state.ai.loading) return;
  if (!canCallModel()) {
    state.ai.status = "未启用模型调用。请先配置本地代理或远端 OpenAI-compatible Endpoint。";
    render();
    return;
  }
  saveProject(false);
  const meta = getProjectMeta(project);
  const draft = meta.refinedAgents || projectAgents(project);
  state.ai.loading = true;
  state.ai.status = "正在基于当前项目草稿润色 AGENTS.md...";
  render();
  try {
    const response = state.ai.mode === "custom"
      ? await customModelRequest(projectAgentsPrompt(project, draft))
      : await compatibleModelRequest(projectAgentsPrompt(project, draft));
    if (!response.ok) throw new Error(`${response.status} ${(await response.text()).slice(0, 180)}`);
    const data = await response.json();
    const content = getByPath(data, state.ai.mode === "custom" ? state.ai.responsePath : "choices.0.message.content") || data.output_text || data.text || "";
    meta.refinedAgents = content.trim() || draft;
    meta.refinedAt = new Date().toISOString();
    state.ai.status = "项目 AGENTS.md 草稿已润色。";
    recordProjectHistory(project, "模型润色 AGENTS.md", `模型：${state.ai.model}`);
    persistData();
  } catch (error) {
    state.ai.status = `模型生成失败：${error.message}`;
  } finally {
    state.ai.loading = false;
    render();
  }
}

function projectAgentsPrompt(project, draft) {
  return `请根据当前项目画像生成或改写 AGENTS.md。
要求：清晰、可执行，保留项目画像、关键文件、模板规则、Skill/MCP 备注、来源可信状态和权限边界；只做结构化润色、去重和补强。

工作区偏好：
${workspaceGuidance()}

当前项目：
${JSON.stringify(projectPayload(project), null, 2)}

当前 AGENTS.md 草稿：
${draft}`;
}

function projectDiffTab(project, meta) {
  const existing = meta.agentsContent || "";
  const generated = projectGeneratedAgents(project);
  return `
    <section class="agents-preview-grid">
      <section class="panel preview-panel">
        <h3>现有 AGENTS.md</h3>
        <pre>${h(existing || "未检测到现有 AGENTS.md。")}</pre>
      </section>
      <section class="panel preview-panel">
        <h3>即将导出的版本</h3>
        <pre>${h(generated)}</pre>
      </section>
    </section>
    <article class="panel diff-panel">
      <h3>差异对比</h3>
      <div class="diff-list">${agentsDiff(existing, generated)}</div>
    </article>`;
}

function projectExportTab(project, meta) {
  const command = installCommand(project);
  const downloads = currentProjectDownloads(project);
  const items = auditItems(project);
  const blockerCount = items.filter((item) => item.level === "blocker").length;
  const warningCount = items.filter((item) => item.level === "warning").length;
  const activePanel = state.exportPanels.active || "audit";
  const auditOpen = blockerCount > 0 || activePanel === "audit";
  const agentsSize = formatBytes(new Blob([projectGeneratedAgents(project)]).size);
  return `
    <section class="panel export-workbench">
      <div class="panel-head">
        <div>
          <h3>${activePanel === "preview" ? "最终产物预览" : "导出前检查"}</h3>
          <p class="subtle">${activePanel === "preview" ? `最终产物：AGENTS.md，约 ${h(agentsSize)}` : blockerCount ? `有 ${blockerCount} 个阻断` : warningCount ? `有 ${warningCount} 个警告` : "全部通过"}</p>
        </div>
        <div class="export-switch">
          <button data-toggle-export-panel="audit" class="${activePanel === "audit" ? "selected" : ""}">导出前检查</button>
          <button data-toggle-export-panel="preview" class="${activePanel === "preview" ? "selected" : ""}">最终产物预览</button>
        </div>
      </div>
      <div class="export-stage">
        ${activePanel === "preview"
          ? `<pre>${h(projectArtifactsPreview(project))}</pre>`
          : `<div class="audit-list">
              ${auditOpen ? auditRows(project) : auditRows(project, ["blocker", "warning"])}
              ${auditOpen ? `<div class="audit-row"><span>安装命令</span><code>${command || "无需安装命令"}</code></div>` : ""}
            </div>
            <p class="subtle">当前为纯静态站：导出会下载文件或复制 JSON，不会直接写入本机项目。</p>`}
      </div>
    </section>
    <div class="download-grid compact-downloads">${downloads.map((item) => downloadCard(item, false)).join("")}</div>
    <article class="panel command-card">
      <div><h3>项目配置 JSON</h3><p>用于备份、审查或迁移当前项目画像与绑定。</p></div>
      <code>${h(project[0])}_project.json</code>
      <button data-export-project>复制 JSON</button>
    </article>
    ${projectHistoryPanel(meta)}`;
}

function scanFilesPanel(meta) {
  const files = meta.detectedFiles || [];
  if (!files.length) return `<article class="panel scan-files-panel">${emptyState("尚未扫描关键文件。连接项目文件夹后会展示 README、package.json、AGENTS.md 等摘要来源。")}</article>`;
  return `<article class="panel scan-files-panel">
    <div class="panel-head"><div><p class="kicker">scan scope</p><h3>扫描摘要与文件范围</h3></div>${chip(`${files.length} 个关键文件`, "blue")}</div>
    <p class="subtle">当前只读取关键配置和文档文件，避免无控制地扫描整个项目。后续可扩展为可选扫描范围和目录树确认。</p>
    <div class="scan-file-list">${files.slice(0, 16).map((file) => `<code>${h(file)}</code>`).join("")}</div>
  </article>`;
}

function projectHistoryPanel(meta) {
  const rows = (meta.history || []).slice(0, 8);
  return `<article class="panel history-panel">
    <div class="panel-head"><div><p class="kicker">version history</p><h3>最近变更记录</h3></div>${chip(`${rows.length} 条`, "blue")}</div>
    ${rows.length ? rows.map((item) => `<div class="history-row"><span>${h(new Date(item.time).toLocaleString())}</span><strong>${h(item.action)}</strong><p>${h(item.detail || "")}</p></div>`).join("") : emptyState("暂无生成、绑定或导出记录。")}
  </article>`;
}

function recordProjectHistory(project, action, detail = "") {
  const meta = getProjectMeta(project);
  meta.history.unshift({ action, detail, time: new Date().toISOString() });
  meta.history = meta.history.slice(0, 30);
}

function invalidateProjectRefinement(project) {
  const meta = getProjectMeta(project);
  meta.refinedAgents = "";
  meta.refinedAt = "";
}

function updateTemplateRulesBody(el) {
  const project = projects[state.project];
  const meta = getProjectMeta(project);
  meta.templateRulesBody = el.value;
  invalidateProjectRefinement(project);
  persistData();
}

function changeProjectTemplateRule(el) {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能切换模板规则。")) return;
  const project = projects[state.project];
  const meta = getProjectMeta(project);
  project[4] = el.value;
  meta.templateRulesBody = el.value === "自定义模板" ? "" : defaultTemplateRulesBody(project);
  getProjectMeta(project).bindings.template = {};
  if (el.value !== "自定义模板") getBindingMeta(project, "template", el.value);
  invalidateProjectRefinement(project);
  recordProjectHistory(project, "切换模板规则", el.value);
  persistData();
  render();
}

function toggleTemplateRules(el) {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能修改模板规则。")) return;
  const project = projects[state.project];
  const meta = getProjectMeta(project);
  meta.templateRulesEnabled = el.checked;
  invalidateProjectRefinement(project);
  recordProjectHistory(project, el.checked ? "启用模板规则" : "关闭模板规则", project[4]);
  persistData();
  render();
}

function saveTemplateRules(el) {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能保存模板规则。")) return;
  saveProject(false);
  const project = projects[state.project];
  const textarea = document.querySelector("[data-template-rule-body]");
  getProjectMeta(project).templateRulesBody = textarea?.value || "";
  invalidateProjectRefinement(project);
  recordProjectHistory(project, "保存项目模板规则", project[4]);
  persistData();
  flash(el, "已保存");
}

function saveTemplateAs(el) {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能另存模板。")) return;
  const project = projects[state.project];
  const body = document.querySelector("[data-template-rule-body]")?.value.trim() || "";
  if (!body) return;
  const name = uniqueTemplateName(`${project[0]} 自定义模板`);
  templates.push(template(name, "自定义", getProjectMeta(project).profile?.stack || [], "从项目规则另存的自定义模板。", `# AGENTS.md\n\n${body}`));
  project[4] = name;
  getProjectMeta(project).templateRulesBody = body;
  getProjectMeta(project).bindings.template = {};
  getBindingMeta(project, "template", name);
  invalidateProjectRefinement(project);
  recordProjectHistory(project, "另存为模板", name);
  persistData();
  flash(el, "已另存");
  render();
}

function resetTemplateRules(el) {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能重置模板规则。")) return;
  const project = projects[state.project];
  const meta = getProjectMeta(project);
  meta.templateRulesBody = defaultTemplateRulesBody(project);
  invalidateProjectRefinement(project);
  recordProjectHistory(project, "恢复默认模板", project[4]);
  persistData();
  flash(el, "已恢复");
  render();
}

function uniqueTemplateName(base) {
  let name = base;
  let index = 2;
  while (templates.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
    name = `${base} ${index}`;
    index += 1;
  }
  return name;
}

function dialogMarkup() {
  if (!state.dialog) return "";
  if (state.dialog === "model-config") return modelConfigDrawer();
  if (state.dialog === "account-panel") return accountPanelDialog();
  if (state.dialog === "skill-detail") return skillDetailDialog();
  if (state.dialog === "skill-edit") return skillEditDialog();
  if (state.dialog === "mcp-edit") return mcpEditDialog();
  if (state.dialog === "import-review") return importReviewDialog();
  if (state.dialog === "category-skill") return categoryManagerDialog("skill");
  if (state.dialog === "category-mcp") return categoryManagerDialog("mcp");
  const isSkill = state.dialog === "skill";
  return `<div class="modal-backdrop" data-close-dialog>
    <section class="modal" onclick="event.stopPropagation()">
      <div class="panel-head">
        <div><p class="kicker">${isSkill ? "manage skill" : "manage mcp"}</p><h2>${isSkill ? "添加 Skill" : "登记 MCP 服务"}</h2></div>
        <button data-close-dialog>关闭</button>
      </div>
      ${isSkill ? skillForm() : mcpForm()}
    </section>
  </div>`;
}

function modelConfigDrawer() {
  return `<div class="modal-backdrop drawer-backdrop" data-close-dialog>
    <section class="modal model-drawer" onclick="event.stopPropagation()">
      <div class="panel-head">
        <div><p class="kicker">global model api</p><h2>全局模型配置</h2></div>
        <button data-close-dialog>关闭</button>
      </div>
      <p class="subtle drawer-intro">这套配置会被项目页 AGENTS.md 生成和 GitHub 大模型解析导入共用。API Key 只在当前页面内存中使用，刷新后不会持久保存。</p>
      ${providerApiForm()}
      <div class="model-usage-list">
        <span>项目页：生成 AGENTS.md</span>
        <span>Skill 导入：识别 SKILL.md 字段</span>
        <span>MCP 导入：识别服务能力与风险</span>
      </div>
    </section>
  </div>`;
}

function accountPanelDialog() {
  return `<div class="modal-backdrop drawer-backdrop" data-close-dialog>
    <section class="modal account-drawer" onclick="event.stopPropagation()">
      <div class="panel-head">
        <div><p class="kicker">account workspace</p><h2>账号与身份权限</h2></div>
        <button data-close-dialog>关闭</button>
      </div>
      ${workspaceAccountsPanel("drawer")}
    </section>
  </div>`;
}

function categoryManagerDialog(kind) {
  const context = categoryContext(kind);
  const title = kind === "skill" ? "管理 Skill 分类" : "管理 MCP 分类";
  return `<div class="modal-backdrop" data-close-dialog>
    <section class="modal" onclick="event.stopPropagation()">
      <div class="panel-head">
        <div><p class="kicker">category manager</p><h2>${h(title)}</h2></div>
        <button data-close-dialog>关闭</button>
      </div>
      <div class="category-manager">
        <div class="category-manager-list">
          ${context.categories.map((category) => categoryManagerRow(kind, category)).join("")}
        </div>
        <div class="category-create-row">
          <input id="${h(kind)}-category-name" placeholder="新分类名称">
          <button class="primary" data-add-category="${h(kind)}">添加分类</button>
        </div>
        <p class="subtle">分类可重命名或删除。删除分类不会删除库条目，已有条目会移动到“未分类”。</p>
      </div>
    </section>
  </div>`;
}

function importReviewDialog() {
  const pending = state.importer.pending;
  if (!pending) return "";
  const isSkill = pending.kind === "skill";
  const item = pending.item;
  const title = isSkill ? "导入前复核 Skill" : "导入前复核 MCP";
  const exists = isSkill
    ? skills.some((skillItem) => skillItem.name === item.name)
    : mcps.some((mcpItem) => mcpItem.name === item.name);
  return `<div class="modal-backdrop" data-close-dialog>
    <section class="modal import-review-modal" onclick="event.stopPropagation()">
      <div class="panel-head">
        <div><p class="kicker">import review</p><h2>${h(title)}</h2></div>
        <button data-close-dialog>关闭</button>
      </div>
      <div class="source-row"><span>来源</span>${sourceLink(pending.source, true)}${exists ? chip("同名将覆盖", "orange") : chip("新条目", "green")}</div>
      <p class="subtle">入库前可直接修正解析结果。保存后才会写入当前大账号的数据空间。</p>
      <div class="form-grid two-col-form">
        ${validationBlock("importReview")}
        ${isSkill ? importSkillReviewFields(item, pending.source) : importMcpReviewFields(item, pending.source)}
        <button class="primary modal-action" data-save-import-review>确认入库</button>
      </div>
    </section>
  </div>`;
}

function importSkillReviewFields(item, source) {
  return `
    ${editField("名称", "import-skill-name", item.name)}
    ${editDatalist("分类", "import-skill-category", item.category, skillCategories)}
    ${editField("标签", "import-skill-tags", (item.tags || []).join(", "))}
    ${editField("模型", "import-skill-model", item.model || "按项目选择")}
    ${editField("工具", "import-skill-tools", item.tools || "Filesystem")}
    ${editField("安装方式", "import-skill-install", item.install || importInstallFallback())}
    ${editField("出处", "import-skill-source", item.source || source)}
    ${editField("简介", "import-skill-example", item.example || "", true)}
    ${editField("优点", "import-skill-pros", item.pros || "来自 GitHub，可沉淀为团队复用能力")}
    ${editField("限制", "import-skill-cons", item.cons || "导入后建议人工复核触发描述和权限边界")}
    ${editSelect("状态", "import-skill-status", ["待复核", "推荐", "已安装", "需权限", "收藏"], item.status || workspaceImportRules().defaultStatus || "待复核")}
    ${editField("评分", "import-skill-score", item.score || 82, false, "number")}`;
}

function importMcpReviewFields(item, source) {
  const normalized = normalizeMcpRecord(item);
  return `
    ${editField("名称", "import-mcp-name", normalized.name)}
    ${editDatalist("分类", "import-mcp-category", normalized.category, mcpCategories)}
    ${editField("服务能力", "import-mcp-ability", normalized.ability, true)}
    ${editField("配置方式", "import-mcp-config", normalized.config)}
    ${editSelect("风险等级", "import-mcp-risk", ["低", "中", "高"], normalized.risk)}
    ${editField("依赖", "import-mcp-deps", normalized.deps)}
    ${editField("使用场景", "import-mcp-use", normalized.use, true)}
    ${editField("来源链接", "import-mcp-source", normalized.source || source)}
    ${editSelect("来源类型", "import-mcp-source-type", ["官方", "第三方", "本地自定义", "待审核"], normalized.sourceType)}
    ${editField("文档链接", "import-mcp-docs", normalized.docs || source)}
    ${editField("安装来源", "import-mcp-install-source", normalized.installSource)}
    ${editField("最近核验状态", "import-mcp-verified", normalized.verified)}
    ${editField("权限说明", "import-mcp-permissions", normalized.permissions, true)}`;
}

function categoryManagerRow(kind, category) {
  const context = categoryContext(kind);
  const count = context.items.filter((item) => (item.category || "未分类") === category).length;
  return `<div class="category-manager-row">
    <div><strong>${h(category)}</strong><span>${count} 个条目</span></div>
    <div class="category-row-actions">
      <button data-rename-category="${h(kind)}" data-value="${h(category)}">重命名</button>
      <button class="ghost-danger" data-delete-category="${h(kind)}" data-value="${h(category)}">删除</button>
    </div>
  </div>`;
}

function skillDetailDialog() {
  const item = skills.find((skillItem) => skillItem.name === state.selectedSkill) || skills[0];
  if (!item) return "";
  return `<div class="modal-backdrop" data-close-dialog>
    <section class="modal skill-md-modal" onclick="event.stopPropagation()">
      <div class="panel-head">
        <div><p class="kicker">SKILL.md</p><h2>${h(item.name)} / SKILL.md</h2></div>
        <div class="modal-tools">
          ${sourceLink(item.source)}
          <button data-copy="${h(item.md)}">复制 MD</button>
          <button data-close-dialog>关闭</button>
        </div>
      </div>
      <div class="source-row"><span>出处</span>${sourceLink(item.source, true)}</div>
      <pre class="skill-md-view">${h(item.loadingMd ? "正在读取原始 SKILL.md..." : item.md)}</pre>
    </section>
  </div>`;
}

function skillEditDialog() {
  const item = skills.find((skillItem) => skillItem.name === state.selectedSkill);
  if (!item) return "";
  return `<div class="modal-backdrop" data-close-dialog>
    <section class="modal" onclick="event.stopPropagation()">
      <div class="panel-head">
        <div><p class="kicker">edit skill</p><h2>编辑 Skill</h2></div>
        <div class="modal-tools">
          <button data-open-skill="${h(item.name)}">打开原始 SKILL.md</button>
          <button data-close-dialog>关闭</button>
        </div>
      </div>
      <div class="form-grid two-col-form">
        ${validationBlock("skillEdit")}
        ${editField("名称", "skill-edit-name", item.name)}
        ${editDatalist("分类", "skill-edit-category", item.category, skillCategories)}
        ${editField("标签", "skill-edit-tags", item.tags.join(", "))}
        ${editField("模型", "skill-edit-model", item.model)}
        ${editField("工具", "skill-edit-tools", item.tools)}
        ${editField("安装方式", "skill-edit-install", item.install)}
        ${editField("出处", "skill-edit-source", item.source)}
        ${editField("简介", "skill-edit-example", item.example, true)}
        ${editField("优点", "skill-edit-pros", item.pros)}
        ${editField("限制", "skill-edit-cons", item.cons)}
        ${editSelect("状态", "skill-edit-status", ["待复核", "推荐", "已安装", "需权限", "收藏"], item.status)}
        ${editField("评分", "skill-edit-score", item.score, false, "number")}
        ${editField("使用心得 / 备注", "skill-edit-note", item.note || "", true)}
        <button class="primary modal-action" data-save-skill-edit>保存 Skill</button>
      </div>
    </section>
  </div>`;
}

function mcpEditDialog() {
  const item = mcps.find((mcpItem) => mcpItem.name === state.selectedMcp);
  if (!item) return "";
  const normalized = normalizeMcpRecord(item);
  return `<div class="modal-backdrop" data-close-dialog>
    <section class="modal" onclick="event.stopPropagation()">
      <div class="panel-head">
        <div><p class="kicker">edit mcp</p><h2>编辑 MCP</h2></div>
        <button data-close-dialog>关闭</button>
      </div>
      <div class="form-grid two-col-form">
        ${validationBlock("mcpEdit")}
        ${editField("名称", "mcp-edit-name", normalized.name)}
        ${editDatalist("分类", "mcp-edit-category", normalized.category, mcpCategories)}
        ${editField("服务能力", "mcp-edit-ability", normalized.ability)}
        ${editField("配置方式", "mcp-edit-config", normalized.config)}
        ${editSelect("风险等级", "mcp-edit-risk", ["低", "中", "高"], normalized.risk)}
        ${editField("依赖", "mcp-edit-deps", normalized.deps)}
        ${editField("使用场景", "mcp-edit-use", normalized.use, true)}
        ${editField("来源链接", "mcp-edit-source", normalized.source)}
        ${editSelect("来源类型", "mcp-edit-source-type", ["官方", "第三方", "本地自定义", "待审核"], normalized.sourceType)}
        ${editField("文档链接", "mcp-edit-docs", normalized.docs)}
        ${editField("安装来源", "mcp-edit-install-source", normalized.installSource)}
        ${editField("最近核验状态", "mcp-edit-verified", normalized.verified)}
        ${editField("权限说明", "mcp-edit-permissions", normalized.permissions, true)}
        <button class="primary modal-action" data-save-mcp-edit>保存 MCP</button>
      </div>
    </section>
  </div>`;
}

function skillForm() {
  return `${importPanel("skill")}
  <div class="form-grid two-col-form">
    ${validationBlock("skill")}
    ${miniField("名称", "skill-name", "my-team-skill")}
    ${miniDatalist("分类", "skill-category", "AI 工具链", skillCategories, "AI 工具链")}
    ${miniField("标签", "skill-tags", "Team, Review")}
    ${miniField("模型", "skill-model", "GPT-5")}
    ${miniField("工具", "skill-tools", "Filesystem")}
    ${miniField("安装方式", "skill-install", "codex skill install my-team-skill")}
    ${miniField("出处", "skill-source", "https://github.com/owner/repo/blob/main/SKILL.md")}
    ${miniField("示例", "skill-example", "沉淀团队专属工作流", true)}
    ${miniField("优点", "skill-pros", "贴合团队流程")}
    ${miniField("限制", "skill-cons", "需要定期维护")}
    <button class="primary modal-action" data-create-skill>添加到 Skill 库</button>
    <p class="subtle modal-note">新增后会立刻出现在项目绑定池里；删除 Skill 会同步从项目绑定中移除。</p>
  </div>`;
}

function mcpForm() {
  return `${importPanel("mcp")}
  <div class="form-grid two-col-form">
    ${validationBlock("mcp")}
    ${miniField("名称", "mcp-name", "linear")}
    ${miniDatalist("分类", "mcp-category", "自定义", mcpCategories, "自定义")}
    ${miniField("安全风险", "mcp-risk", "中")}
    ${miniField("服务能力", "mcp-ability", "任务、Issue 与项目同步")}
    ${miniField("配置方式", "mcp-config", "Linear Connector")}
    ${miniField("来源链接", "mcp-source", "https://github.com/owner/mcp-server")}
    ${miniSelect("来源类型", "mcp-source-type", ["官方", "第三方", "本地自定义", "待审核"])}
    ${miniField("文档链接", "mcp-docs", "https://docs.example.com/mcp")}
    ${miniField("安装来源", "mcp-install-source", "npm / uvx / connector / local")}
    ${miniField("最近核验状态", "mcp-verified", "待核验")}
    ${miniField("依赖", "mcp-deps", "Linear 授权")}
    ${miniField("权限说明", "mcp-permissions", "读取 Issue；写入前需确认")}
    ${miniField("使用场景", "mcp-use", "研发任务规划与状态同步", true)}
    <button class="primary modal-action" data-create-mcp>添加到 MCP 库</button>
    <p class="subtle modal-note">高风险服务会在项目页的导出检查里提示复核。</p>
  </div>`;
}

function importPanel(kind) {
  return `<section class="import-panel">
    <div>
      <p class="kicker">github import</p>
      <h3>一键导入 ${kind === "skill" ? "Skill" : "MCP"}</h3>
      <p>粘贴 GitHub 地址后会自动读取内容并加入当前库，之后仍可手动编辑或删除。</p>
    </div>
    <div class="source-review-actions">
      ${chip(canCallModel() ? "模型解析可用" : "仅规则解析", canCallModel() ? "green" : "orange")}
      <button data-open-dialog="model-config">配置模型</button>
    </div>
    <label><span>GitHub URL</span><input data-import-url value="${h(state.importer.url)}" placeholder="https://github.com/owner/repo/blob/main/SKILL.md"></label>
    <div class="import-actions">
      <button data-import-github="${kind}">规则导入</button>
      <button class="primary" data-import-github="${kind}" data-ai="true">大模型解析导入</button>
    </div>
    <p class="subtle">${h(state.importer.status)}</p>
    ${state.importer.lastError ? `<pre class="error-detail">${h(state.importer.lastError)}</pre>` : ""}
    ${importHistory()}
  </section>`;
}

function importHistory() {
  const list = state.importer.history || [];
  if (!list.length) return "";
  return `<div class="import-history"><small>最近导入</small>${list.slice(0, 4).map((item) => `<span>${h(item.time)} · ${h(item.kind)} · ${h(item.name)}</span>`).join("")}</div>`;
}

function providerApiForm() {
  return `<div class="provider-form">
    <div class="provider-avatar">${h((state.ai.provider || "P").slice(0, 1).toUpperCase())}</div>
    <p class="subtle provider-tip">自定义配置需手动填写必要字段；这套配置会被项目页生成和大模型解析导入共用。</p>
    <div class="provider-two">
      ${aiField("供应商名称", "provider", "例如：Claude 官方")}
      ${aiField("备注", "note", "例如：公司专用账号")}
    </div>
    ${aiField("官网链接", "website", "https://example.com（可选）")}
    ${aiField("API Key", "key", "只需要填这里，下方 auth.json 会自动填充", "password")}
    ${aiField("本地代理地址", "proxyEndpoint", "http://localhost:8787/v1（推荐）")}
    <label class="compact-toggle"><input type="checkbox" data-ai-check="allowBrowserKey" ${state.ai.allowBrowserKey ? "checked" : ""} ${disabledUnless(canEditWorkspaceData)}><span>向本地代理转发 API Key</span></label>
    <div class="api-url-head">
      <label class="compact-toggle"><input type="checkbox" data-ai-check="fullUrl" ${state.ai.fullUrl ? "checked" : ""} ${disabledUnless(canEditWorkspaceData)}><span>已填完整请求 URL</span></label>
      <button class="tiny-link" data-toggle-ai-config ${disabledUnless(canEditWorkspaceData)}>${state.ai.configOpen ? "收起高级配置" : "管理与测速"}</button>
    </div>
    ${aiField("API 请求地址", "endpoint", "https://your-api-endpoint.com/v1")}
    <div class="hint-strip">通常填写到 /v1 即可；只有填 /chat/completions 这类完整路径时才勾选完整 URL</div>
    <div class="model-row">
      ${aiField("模型名称", "model", "gpt-5.4")}
      <button data-fetch-models ${state.ai.modelsLoading || !canEditWorkspaceData() ? "disabled" : ""}>${state.ai.modelsLoading ? "获取中..." : "获取模型列表"}</button>
    </div>
    ${modelSelect()}
    ${state.ai.configOpen ? `<div class="advanced-api">
      <div class="mode-switch">
        <button class="${state.ai.mode === "compatible" ? "selected" : ""}" data-ai-mode="compatible" ${disabledUnless(canEditWorkspaceData)}>OpenAI-compatible</button>
        <button class="${state.ai.mode === "custom" ? "selected" : ""}" data-ai-mode="custom" ${disabledUnless(canEditWorkspaceData)}>自定义 HTTP</button>
      </div>
      ${state.ai.mode === "compatible" ? compatibleAdvancedPanel() : customApiPanel()}
    </div>` : ""}
    <p class="subtle">${h(state.ai.status)}</p>
  </div>`;
}

function validationBlock(scope) {
  const errors = state.formErrors[scope] || [];
  return errors.length ? `<div class="validation-box">${errors.map((error) => `<span>${h(error)}</span>`).join("")}</div>` : "";
}

function modelStatusText() {
  const channel = state.ai.proxyEndpoint ? "代理优先" : state.ai.key && state.ai.endpoint ? "远端 API" : "未启用调用";
  return `${state.ai.mode === "compatible" ? "Chat Completions" : "自定义 HTTP"} · ${channel}`;
}

function projectField(label, key, value) {
  return `<label><span>${h(label)}</span><input data-project-edit="${h(key)}" value="${h(value)}" ${disabledUnless(canEditWorkspaceData)}></label>`;
}

function projectSelectField(label, key, options, value) {
  return `<label><span>${h(label)}</span><select data-project-edit="${h(key)}" ${disabledUnless(canEditWorkspaceData)}>${options.map((option) => `<option value="${h(option)}" ${option === value ? "selected" : ""}>${h(option)}</option>`).join("")}</select></label>`;
}

function projectBriefFields(meta) {
  const brief = meta.brief || {};
  const generateLabel = canCallModel() ? "AI 优化项目简介" : "根据扫描结果生成简介";
  return `<section class="project-brief-fields">
    <div class="panel-head">
      <div><p class="kicker">project brief</p><h3>项目简介</h3></div>
      ${chip(brief.confirmed ? "已确认" : "待确认", brief.confirmed ? "green" : "orange")}
    </div>
    <label><span>项目用途</span><textarea data-brief-edit="purpose" placeholder="这个项目是做什么的？" ${disabledUnless(canEditWorkspaceData)}>${h(brief.purpose || "")}</textarea></label>
    <label><span>主要用户 / 场景</span><textarea data-brief-edit="users" placeholder="谁会使用？在哪些业务场景使用？" ${disabledUnless(canEditWorkspaceData)}>${h(brief.users || "")}</textarea></label>
    <label><span>核心功能</span><textarea data-brief-edit="features" placeholder="列出核心模块、工作流或输出物。" ${disabledUnless(canEditWorkspaceData)}>${h(brief.features || "")}</textarea></label>
    <label><span>AI 适合参与的工作</span><textarea data-brief-edit="aiTasks" placeholder="例如代码生成、文档整理、测试、数据分析、PR 协作。" ${disabledUnless(canEditWorkspaceData)}>${h(brief.aiTasks || "")}</textarea></label>
    <label><span>不适合自动化的工作</span><textarea data-brief-edit="avoidTasks" placeholder="例如生产数据修改、权限审批、财务结论等。" ${disabledUnless(canEditWorkspaceData)}>${h(brief.avoidTasks || "")}</textarea></label>
    <label><span>权限和风险边界</span><textarea data-brief-edit="risks" placeholder="Token、客户数据、写文件、外部 API 等风险。" ${disabledUnless(canEditWorkspaceData)}>${h(brief.risks || "")}</textarea></label>
    <div class="brief-actions">
      <button data-generate-brief ${disabledUnless(canEditWorkspaceData)}>${h(generateLabel)}</button>
      <button class="primary" data-confirm-brief ${disabledUnless(canEditWorkspaceData)}>${brief.confirmed ? "更新确认" : "确认项目简介"}</button>
    </div>
  </section>`;
}

function metric(key, label, value, sub) {
  return `<article class="metric"><span class="metric-icon">${h(key)}</span><strong>${h(value)}</strong><small>${h(label)}</small><p>${h(sub)}</p></article>`;
}

function titleBlock(title, text) {
  return `<div class="title-block"><p class="kicker">Orchestra OS</p><h1>${h(title)}</h1><p>${h(text)}</p></div>`;
}

function categoryCard(name, count, text) {
  return `<article class="stat-card"><span>${h(count)}</span><h3>${h(name)}</h3><p>${h(text)}</p></article>`;
}

function categoryStats(kind) {
  const categories = kind === "skill" ? skillCategories : mcpCategories;
  const counter = kind === "skill"
    ? (category) => countSkills(category)
    : (category) => mcps.filter((item) => normalizeMcpRecord(item).category === category).length;
  return categories
    .filter((category) => category !== "未分类")
    .slice(0, 4)
    .map((category) => categoryCard(category, counter(category), kind === "skill" ? "Skill 分类" : "MCP 分类"))
    .join("");
}

function countSkills(category) {
  return skills.filter((item) => item.category === category).length;
}

function rowProject(project) {
  const meta = getProjectMeta(project);
  return `<div class="project-row"><div><strong>${h(project[0])}</strong><span>${h(project[1])} · ${h(project[5])}</span></div><div>${project[2].map((item) => chip(item)).join("")}</div>${chip(meta.statusTag, projectStatusTone(meta.statusTag))}</div>`;
}

function projectStatusTone(status) {
  return status === "已完成" ? "green" : status === "待开启" ? "blue" : "orange";
}

function sourceLink(source, compact = false) {
  if (!source) return `<span class="muted-note">未记录</span>`;
  const normalized = normalizeSource(source);
  const label = compact ? shortSource(normalized.label) : "打开来源项目";
  if (normalized.url) {
    return `<a class="source-link" href="${h(normalized.url)}" target="_blank" rel="noreferrer">${h(label)}</a>`;
  }
  return `<code class="source-code">${h(normalized.label)}</code>`;
}

function shortSource(source) {
  if (!source) return "未记录";
  if (source.length <= 56) return source;
  return `${source.slice(0, 28)}...${source.slice(-22)}`;
}

function normalizeSource(source) {
  const rawGithub = source.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/);
  if (rawGithub) {
    const url = `https://github.com/${rawGithub[1]}/${rawGithub[2]}/blob/${rawGithub[3]}/${rawGithub[4]}`;
    return { label: `${rawGithub[1]}/${rawGithub[2]}:${rawGithub[4].split("/").pop()}`, url };
  }
  const blobGithub = source.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|tree)\/([^/]+)\/?.*$/);
  if (blobGithub) {
    const file = source.split("/").pop() || blobGithub[2];
    return { label: `${blobGithub[1]}/${blobGithub[2]}:${file}`, url: source };
  }
  if (/^https?:\/\//i.test(source)) return { label: source, url: source };
  return { label: source, url: "" };
}

function skillCard(item) {
  const install = normalizeSkillInstall(item.install, item.name);
  const noteOpen = Boolean(state.expandedSkillNotes[item.name]);
  const noteSummary = item.note ? `心得：${item.note.slice(0, 64)}${item.note.length > 64 ? "..." : ""}` : "暂无使用心得";
  return `<article class="skill-card">
    <div class="card-head"><div><h3>${h(item.name)}</h3><p>${h(item.category)} · ${h(item.model)}</p></div><div>${chip(item.status, statusTone(item.status))}</div></div>
    <div class="tag-row">${item.tags.map((tag) => chip(tag)).join("")}</div>
    <code>${h(install)}</code>
    <div class="source-line"><span>出处</span>${sourceLink(item.source, true)}</div>
    <p>${h(item.example)}</p>
    <div class="skill-meta"><span>优点：${h(item.pros)}</span><span>限制：${h(item.cons)}</span><b>${h(item.score)}</b></div>
    <div class="skill-note-summary"><span>${h(noteSummary)}</span></div>
    ${noteOpen ? `<label class="skill-note"><span>使用心得</span><textarea data-skill-note="${h(item.name)}" placeholder="记录你使用这个 Skill 的经验、适用场景或注意事项。" ${disabledUnless(canEditLibrary)}>${h(item.note || "")}</textarea></label>` : ""}
    <div class="card-actions">
      <button class="text-action" data-open-skill="${h(item.name)}">打开 SKILL.md</button>
      <button class="text-action" data-edit-skill="${h(item.name)}" ${disabledUnless(canEditLibrary)}>编辑</button>
      <button class="text-action" data-toggle-skill-note="${h(item.name)}">${noteOpen ? "收起备注" : "展开备注"}</button>
      <button class="ghost-danger" data-delete-skill="${h(item.name)}" ${disabledUnless(canDeleteLibrary)}>删除</button>
    </div>
  </article>`;
}

function mcpCard(item) {
  const normalized = normalizeMcpRecord(item);
  return `<article class="registry-card">
    <div class="card-head"><div><h3>${h(normalized.name)}</h3><p>${h(normalized.category)}</p></div><div>${chip(`${normalized.risk}风险`, riskTone(normalized.risk))}${chip(normalized.sourceType, sourceTypeTone(normalized.sourceType))}</div></div>
    <p>${h(normalized.ability)}</p>
    <code>${h(normalized.config)}</code>
    <div class="mcp-trust-grid">
      <span>来源：${sourceLink(normalized.source, true)}</span>
      <span>文档：${sourceLink(normalized.docs, true)}</span>
      <span>安装来源：${h(normalized.installSource)}</span>
      <span>最近核验：${h(normalized.verified)}</span>
      <span>权限说明：${h(normalized.permissions)}</span>
      <span>场景：${h(normalized.use)}</span>
    </div>
    <div class="card-actions">
      <button class="text-action" data-edit-mcp="${h(normalized.name)}" ${disabledUnless(canEditLibrary)}>编辑</button>
      <button class="ghost-danger" data-delete-mcp="${h(normalized.name)}" ${disabledUnless(canDeleteLibrary)}>删除</button>
    </div>
  </article>`;
}

function downloadCard([name, type, desc, size], disabled = false) {
  return `<article class="download-card">
    <span class="file-type">${h(type)}</span>
    <h3>${h(name)}</h3>
    <p>${h(desc)}</p>
    <small>${h(size)}</small>
    <button data-download="${h(name)}" ${disabled ? "disabled" : ""}>下载</button>
  </article>`;
}

function currentProjectDownloads(project) {
  const safe = safeFileName(project?.[0] || "project");
  return [
    [`${safe}_AGENTS.md`, ".md", "将写入项目根目录的 AGENTS.md", `${Math.max(1, Math.round(projectGeneratedAgents(project).length / 1024))} KB`],
    [`${safe}_project-profile.json`, ".json", "项目画像、连接状态与扫描摘要", "JSON"],
    [`${safe}_install.sh`, ".sh", "当前项目安装命令", "Shell"],
    [`${safe}_mcp-config.json`, ".json", "MCP 配置片段与权限边界", "JSON"]
  ];
}

function safeFileName(name) {
  return String(name).replace(/[^\w\u4e00-\u9fa5.-]+/g, "_").replace(/^_+|_+$/g, "") || "project";
}

function projectPathFieldLabel(meta) {
  return meta.pathKind === "browser-folder" ? "授权文件夹名" : "本机路径";
}

function projectLocationTitle(meta) {
  return meta.pathKind === "browser-folder" ? "文件夹扫描" : "路径记录";
}

function projectLocationValue(meta) {
  if (meta.pathKind === "browser-folder") return meta.connected ? "已读取" : "待扫描";
  if (meta.pathKind === "manual") return "仅记录";
  return "未记录";
}

function projectLocationDetail(meta) {
  if (!meta.path) return "未记录路径";
  if (meta.pathKind === "browser-folder") return `授权文件夹名：${meta.path}`;
  return `手填路径：${meta.path}`;
}

function agentsStatusPanel(project) {
  const meta = getProjectMeta(project);
  const generated = projectGeneratedAgents(project);
  const existing = meta.agentsContent || "";
  const downloadName = `${safeFileName(project?.[0] || "project")}_AGENTS.md`;
  return `<article class="panel agents-status-panel">
    <div class="panel-head">
      <div>
        <p class="kicker">agents.md</p>
        <h3>${meta.agentsFound ? "已检测到 AGENTS.md" : "未检测到 AGENTS.md"}</h3>
      </div>
      <div class="agents-actions">
        ${chip(meta.agentsFound ? "可预览" : "可生成", meta.agentsFound ? "green" : "orange")}
        ${chip("可导出", "blue")}
        ${meta.agentsFound ? chip("可覆盖", "orange") : ""}
      </div>
    </div>
    <p class="subtle">${meta.agentsFound ? "左侧是扫描到的现有内容，右侧是根据当前 Skill/MCP 绑定生成的覆盖版本。" : "将根据当前项目画像、已选 Skills 和 MCP 权限边界生成新的 AGENTS.md。"}</p>
    <div class="agents-preview-grid">
      <section>
        <h4>${meta.agentsFound ? "当前文件" : "当前文件状态"}</h4>
        <pre>${h(existing || "未检测到现有 AGENTS.md。")}</pre>
      </section>
      <section>
        <h4>生成/覆盖内容</h4>
        <pre>${h(generated)}</pre>
      </section>
    </div>
    <div class="agents-write-actions">
      <button data-copy="${h(generated)}" data-copy-project="agents">复制生成内容</button>
      <button data-download="${h(downloadName)}">导出 AGENTS.md</button>
      <span>静态站不能直接写回本机文件；覆盖时请使用复制或下载后的文件。</span>
    </div>
  </article>`;
}

function summaryTile(label, value, text) {
  return `<article class="summary-tile"><small>${h(label)}</small><strong>${h(value)}</strong><span>${h(text)}</span></article>`;
}

function scanStatusText(meta) {
  if (meta.scanError && !meta.connected) return "未连接";
  if (meta.scanError) return "扫描失败";
  if (meta.connected) return "已连接";
  return "未扫描";
}

function relativeScanTime(meta) {
  if (!meta.scannedAt) return "未扫描";
  const diff = Date.now() - new Date(meta.scannedAt).getTime();
  if (!Number.isFinite(diff) || diff < 0) return "刚刚";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

function scanTimeLabel(meta) {
  if (!meta.scannedAt) return meta.scanError || "未扫描";
  const date = new Date(meta.scannedAt);
  if (Number.isNaN(date.getTime())) return "扫描时间异常";
  return `扫描时间 ${date.toLocaleString("zh-CN", { hour12: false })}`;
}

function auditRows(project, levels = null) {
  const items = auditItems(project).filter((item) => !levels || levels.includes(item.level));
  return items.length
    ? items.map((item) => `<div class="audit-row ${h(item.level)}"><span>${h(item.label)}</span><div>${chip(auditLevelLabel(item.level), auditLevelTone(item.level))}${chip(item.value, item.tone)}</div></div>`).join("")
    : `<div class="export-preview-placeholder">当前没有阻断或警告。</div>`;
}

function auditItems(project) {
  const meta = getProjectMeta(project);
  const activeSkillCount = activeBindings(project, "skills").length;
  const activeMcpCount = activeBindings(project, "mcps").length;
  const disabledCount = disabledBindingCount(project);
  const templateActive = getProjectMeta(project).templateRulesEnabled;
  const pathPending = Boolean(meta.path && !meta.connected && meta.scanError);
  const highRiskMissingAuth = highRiskMcpsWithoutNotes(project).length;
  return [
    { label: "项目简介", value: meta.brief?.confirmed ? "已确认" : "待确认", level: meta.brief?.confirmed ? "pass" : "warning", tone: meta.brief?.confirmed ? "green" : "orange" },
    { label: "文件夹扫描", value: meta.connected ? "通过" : "未扫描", level: meta.connected ? "pass" : "warning", tone: meta.connected ? "green" : "orange" },
    { label: "路径状态", value: pathPending ? "待扫描" : "通过", level: pathPending ? "warning" : "pass", tone: pathPending ? "orange" : "green" },
    { label: "关键文件", value: meta.detectedFiles.length ? "已读取" : "缺失", level: meta.detectedFiles.length ? "pass" : "warning", tone: meta.detectedFiles.length ? "green" : "orange" },
    { label: "高风险 MCP", value: hasHighRiskMcp(project) ? "需确认" : "通过", level: hasHighRiskMcp(project) ? "warning" : "pass", tone: hasHighRiskMcp(project) ? "orange" : "green" },
    { label: "授权说明", value: highRiskMissingAuth ? "缺少备注" : "通过", level: highRiskMissingAuth ? "warning" : "pass", tone: highRiskMissingAuth ? "orange" : "green" },
    { label: "写入 Skills", value: activeSkillCount ? "会写入" : "为空", level: activeSkillCount ? "pass" : "warning", tone: activeSkillCount ? "green" : "orange" },
    { label: "写入 MCP", value: activeMcpCount ? "会写入" : "为空", level: activeMcpCount ? "pass" : "warning", tone: activeMcpCount ? "green" : "orange" },
    { label: "禁用项", value: disabledCount ? "已排除" : "无禁用", level: "pass", tone: "green" },
    { label: "基础规则", value: templateActive ? "已启用" : "未启用", level: templateActive ? "pass" : "warning", tone: templateActive ? "green" : "orange" },
    { label: "导出内容", value: projectGeneratedAgents(project).trim() ? "非空" : "为空", level: projectGeneratedAgents(project).trim() ? "pass" : "blocker", tone: projectGeneratedAgents(project).trim() ? "green" : "red" }
  ];
}

function auditLevelLabel(level) {
  return level === "blocker" ? "阻断" : level === "warning" ? "警告" : "通过";
}

function auditLevelTone(level) {
  return level === "blocker" ? "red" : level === "warning" ? "orange" : "green";
}

function projectArtifactsPreview(project) {
  return [
    "## 将写入的 AGENTS.md",
    projectGeneratedAgents(project),
    "",
    "## 安装命令",
    installCommand(project) || "无需安装命令",
    "",
    "## MCP 配置片段",
    JSON.stringify(mcpConfigSummary(project), null, 2)
  ].join("\n");
}

function bindingPanel(title, type, selectedItems, allItems, project) {
  const unused = allItems.filter((item) => !selectedItems.includes(item));
  const activeCount = activeBindings(project, type).length;
  return `<article class="panel binding-panel">
    <div class="panel-head"><h3>${h(title)}</h3><span>${activeCount} enabled / ${selectedItems.length} bound</span></div>
    <div class="bound-list">
      ${selectedItems.map((item) => bindingItem(project, type, item)).join("")}
    </div>
    <div class="resource-pool">
      <small>可添加</small>
      ${unused.slice(0, 6).map((item) => `<button data-add-binding="${h(type)}" data-value="${h(item)}" ${disabledUnless(canEditWorkspaceData)}>+ ${h(item)}</button>`).join("") || "<span class='muted-note'>暂无可添加项</span>"}
    </div>
  </article>`;
}

function bindingItem(project, type, item) {
  const meta = getBindingMeta(project, type, item);
  return `<div class="bound-item enhanced-bound">
    <div class="bound-title">
      <span>${h(item)}</span>
      ${type === "template" ? "<small>当前模板</small>" : `<button data-remove-binding="${h(type)}" data-value="${h(item)}" ${disabledUnless(canEditWorkspaceData)}>移除</button>`}
    </div>
    <div class="binding-meta-grid">
      <label class="compact-toggle"><input type="checkbox" data-binding-meta="${h(type)}" data-binding-item="${h(item)}" data-binding-key="enabled" ${meta.enabled ? "checked" : ""} ${disabledUnless(canEditWorkspaceData)}><span>启用</span></label>
      <label class="binding-note"><span>备注</span><input data-binding-meta="${h(type)}" data-binding-item="${h(item)}" data-binding-key="note" value="${h(meta.note)}" ${disabledUnless(canEditWorkspaceData)}></label>
    </div>
  </div>`;
}

function recommendationPanel(project) {
  const rec = state.recommendations;
  if (rec.projectIndex !== state.project) return "";
  const skillRows = rec.skills.map((item) => recommendationItem("skills", item, bindingState(project, "skills", item.name))).join("");
  const mcpRows = rec.mcps.map((item) => recommendationItem("mcps", item, bindingState(project, "mcps", item.name))).join("");
  const externalRows = (rec.external || []).map((item, index) => externalRecommendationItem(item, index)).join("");
  const rescanPrompt = !rec.loading && rec.status === "扫描完成，可重新推荐" && !skillRows && !mcpRows && !externalRows;
  return `<article class="panel recommendation-panel">
    <div class="panel-head">
      <div><p class="kicker">ai recommendation</p><h3>推荐配置</h3></div>
      <div class="recommendation-actions">
        ${rec.loading ? chip("分析中", "orange") : chip(rec.status || "待确认", "blue")}
        <button data-clear-recommendations>收起</button>
      </div>
    </div>
    <p class="subtle">推荐不会自动覆盖项目绑定。外部条目是模型候选 / 待审核推荐，未点击核验前不代表已经全网搜索或验证来源。</p>
    ${rescanPrompt ? `<div class="recommendation-refresh"><span>项目画像已更新，建议重新生成 Skill/MCP 推荐。</span><button class="primary" data-ai-recommend>基于新画像重新推荐</button></div>` : ""}
    <div class="recommendation-grid">
      <section>
        <h4>推荐 Skill</h4>
        ${skillRows || emptyState("暂无 Skill 推荐。可以补充项目备注、技术栈，或打开模型配置后重新推荐。")}
      </section>
      <section>
        <h4>推荐 MCP</h4>
        ${mcpRows || emptyState("暂无 MCP 推荐。可以补充项目备注、技术栈，或打开模型配置后重新推荐。")}
      </section>
    </div>
    <section class="external-recommendations">
      <h4>外部候选 / 待审核推荐</h4>
      <p class="subtle">可对 GitHub 来源做基础核验：仓库是否存在、README 是否可读、更新时间是否来自 GitHub；安装命令仍需人工复核来源内容。</p>
      ${externalRows || emptyState("暂无外部候选。配置模型后可返回带 URL、安装方式和来源审核信息的候选。")}
    </section>
  </article>`;
}

function clearRecommendations() {
  state.recommendations = { loading: false, status: "", projectIndex: -1, skills: [], mcps: [], external: [] };
  render();
}

function recommendationItem(type, item, stateText) {
  const tone = item.risk === "高" ? "red" : item.risk === "中" ? "orange" : "green";
  const isActive = stateText === "active";
  const isDisabled = stateText === "disabled";
  return `<div class="recommendation-item">
    <div>
      <strong>${h(item.name)}</strong>
      <p>${h(item.reason || "适合当前项目上下文。")}</p>
      <div class="recommendation-meta">
        ${chip(`置信度 ${Math.round(Number(item.confidence || 0.72) * 100)}%`, "blue")}
        ${chip(`风险 ${item.risk || "低"}`, tone)}
      </div>
    </div>
    <button data-add-recommend data-recommend-type="${h(type)}" data-value="${h(item.name)}" ${isActive ? "disabled" : ""}>${isActive ? "已启用" : isDisabled ? "重新启用" : "添加"}</button>
  </div>`;
}

function bindingState(project, type, name) {
  const list = type === "skills" ? project[2] : project[3];
  if (!list.includes(name)) return "none";
  return getBindingMeta(project, type, name).enabled === false ? "disabled" : "active";
}

function externalRecommendationItem(item, index) {
  const tone = item.risk === "高" ? "red" : item.risk === "中" ? "orange" : "green";
  const addedMode = item.addedMode || "";
  const isAdded = Boolean(addedMode);
  const statusText = addedMode === "enable" ? "已启用" : addedMode === "favorite" ? "已收藏" : addedMode === "library" ? "已加入库" : "";
  const favoriteLabel = item.type === "mcp" ? "加入库不启用" : "仅收藏";
  const auditTone = item.auditStatus === "已核验" ? "green" : item.auditStatus === "核验失败" ? "red" : item.auditStatus === "部分核验" ? "orange" : "orange";
  return `<article class="external-rec-card">
    <div>
      <div class="external-title"><strong>${h(item.name)}</strong>${isAdded ? chip(statusText, addedMode === "enable" ? "green" : "blue") : ""}</div>
      <p>${h(item.reason)}</p>
      <div class="recommendation-meta">
        ${chip(item.type === "mcp" ? "MCP" : "Skill", "blue")}
        ${chip(item.official ? "官方/可信来源" : "第三方待审", item.official ? "green" : "orange")}
        ${chip(`风险 ${item.risk}`, tone)}
        ${chip(`置信度 ${Math.round(item.confidence * 100)}%`, "blue")}
        ${item.requiresToken ? chip("需要 Token", "orange") : chip("无需 Token", "green")}
        ${chip(item.auditStatus || "未联网核验", auditTone)}
      </div>
      <small>${h(item.sourceSummary)} · 更新时间：${h(item.updated)}</small>
      ${item.auditNote ? `<small>来源核验：${h(item.auditNote)}</small>` : `<small>来源核验：尚未检查 URL 可访问性、README 真实性和安装命令出处。</small>`}
      ${item.url ? `<a class="source-link" href="${h(item.url)}" target="_blank" rel="noreferrer">查看来源</a>` : ""}
      ${item.install ? `<code>${h(item.install)}</code>` : ""}
    </div>
    <div class="external-actions">
      <button data-verify-external="${index}" ${!item.url ? "disabled" : ""}>核验来源</button>
      <button data-add-external="${index}" data-mode="library" ${isAdded ? "disabled" : ""}>${addedMode === "library" ? "已加入库" : "加入库"}</button>
      <button class="primary" data-add-external="${index}" data-mode="enable" ${isAdded ? "disabled" : ""}>${addedMode === "enable" ? "已启用" : "加入并启用"}</button>
      <button data-add-external="${index}" data-mode="favorite" ${isAdded ? "disabled" : ""}>${addedMode === "favorite" ? statusText : favoriteLabel}</button>
    </div>
  </article>`;
}

function agentsDiff(existing, generated) {
  if (!existing.trim()) return `<div class="diff-line added"><b>+</b><span>${h("将创建新的 AGENTS.md 文件。")}</span></div>`;
  const before = existing.split(/\r?\n/);
  const after = generated.split(/\r?\n/);
  const max = Math.max(before.length, after.length);
  const rows = [];
  for (let index = 0; index < max; index += 1) {
    const left = before[index];
    const right = after[index];
    if (left === right) {
      if (left !== undefined && rows.length < 160) rows.push(`<div class="diff-line same"><b> </b><span>${h(left || " ")}</span></div>`);
      continue;
    }
    if (left !== undefined) rows.push(`<div class="diff-line removed"><b>-</b><span>${h(left || " ")}</span></div>`);
    if (right !== undefined) rows.push(`<div class="diff-line added"><b>+</b><span>${h(right || " ")}</span></div>`);
    if (rows.length > 220) {
      rows.push(`<div class="diff-line same"><b>…</b><span>差异过长，已截断预览。</span></div>`);
      break;
    }
  }
  return rows.join("") || `<div class="diff-line same"><b>=</b><span>当前文件与生成内容一致。</span></div>`;
}

function aiField(label, key, placeholder, type = "text", disabled = false) {
  return `<label><span>${h(label)}</span><input type="${h(type)}" data-ai="${h(key)}" placeholder="${h(placeholder)}" value="${h(state.ai[key])}" ${disabled || !canEditWorkspaceData() ? "disabled" : ""}></label>`;
}

function aiTextarea(label, key, placeholder) {
  return `<label><span>${h(label)}</span><textarea data-ai="${h(key)}" placeholder="${h(placeholder)}" ${disabledUnless(canEditWorkspaceData)}>${h(state.ai[key])}</textarea></label>`;
}

function compatibleAdvancedPanel() {
  return `
    ${aiField("Models Endpoint", "modelsEndpoint", state.ai.proxyEndpoint ? "代理启用时忽略，默认使用代理地址 /models" : "https://api.openai.com/v1/models", "text", Boolean(state.ai.proxyEndpoint))}
    ${aiField("响应文本路径", "responsePath", "choices.0.message.content")}
    ${aiField("模型列表路径", "modelsPath", "data")}
    <p class="subtle">${state.ai.proxyEndpoint ? "已启用本地代理，模型列表固定请求代理地址的 /models，避免绕过代理产生 CORS 或密钥暴露问题。" : "适用于 OpenAI-compatible Chat Completions 结构："}<code>choices[0].message.content</code></p>`;
}

function customApiPanel() {
  return `
    <div class="inline-fields">
      ${aiField("Method", "method", "POST")}
      ${aiField("API Endpoint", "endpoint", "https://api.example.com/generate")}
    </div>
    ${aiField("Models Endpoint", "modelsEndpoint", state.ai.proxyEndpoint ? "代理启用时忽略，默认使用代理地址 /models" : "https://api.example.com/models", "text", Boolean(state.ai.proxyEndpoint))}
    ${aiField("Model", "model", "your-model")}
    ${aiField("API Key / Token", "key", "token...", "password")}
    ${aiTextarea("Headers JSON", "headers", "{ \"Authorization\": \"Bearer {{apiKey}}\" }")}
    ${aiTextarea("Body JSON 模板", "body", "{ \"model\": \"{{model}}\", \"prompt\": \"{{prompt}}\" }")}
    ${aiField("响应文本路径", "responsePath", "choices.0.message.content")}
    ${aiField("模型列表路径", "modelsPath", "data")}
    <p class="subtle">模板变量支持 <code>{{apiKey}}</code>、<code>{{model}}</code>、<code>{{prompt}}</code>。</p>`;
}

function modelSelect() {
  if (!state.ai.models.length) return `<p class="subtle">还没有拉取模型列表。配置本地代理，或填写远端 Endpoint + API Key 后点击“获取模型列表”。</p>`;
  return `<label><span>可用模型</span><select data-model-select>${state.ai.models.map((model) => `<option value="${h(model)}" ${state.ai.model === model ? "selected" : ""}>${h(model)}</option>`).join("")}</select></label>`;
}

function miniField(label, id, placeholder, textarea = false) {
  return `<label><span>${h(label)}</span>${textarea ? `<textarea id="${h(id)}" placeholder="${h(placeholder)}"></textarea>` : `<input id="${h(id)}" placeholder="${h(placeholder)}">`}</label>`;
}

function miniSelect(label, id, options) {
  return `<label><span>${h(label)}</span><select id="${h(id)}">${options.map((option) => `<option value="${h(option)}">${h(option)}</option>`).join("")}</select></label>`;
}

function miniDatalist(label, id, value, options, placeholder = "") {
  return `<label><span>${h(label)}</span><input id="${h(id)}" list="${h(id)}-list" value="${h(value || "")}" placeholder="${h(placeholder)}"><small class="field-hint">可选已有分类，也可输入新分类</small><datalist id="${h(id)}-list">${options.map((option) => `<option value="${h(option)}"></option>`).join("")}</datalist></label>`;
}

function editField(label, id, value, textarea = false, type = "text") {
  return `<label><span>${h(label)}</span>${textarea ? `<textarea id="${h(id)}">${h(value || "")}</textarea>` : `<input id="${h(id)}" type="${h(type)}" value="${h(value ?? "")}">`}</label>`;
}

function editSelect(label, id, options, value) {
  const current = String(value || "");
  const entries = options.includes(current) || !current ? options : [...options, current];
  return `<label><span>${h(label)}</span><select id="${h(id)}">${entries.map((option) => `<option value="${h(option)}" ${option === current ? "selected" : ""}>${h(option)}</option>`).join("")}</select></label>`;
}

function editDatalist(label, id, value, options) {
  return `<label><span>${h(label)}</span><input id="${h(id)}" list="${h(id)}-list" value="${h(value || "")}"><small class="field-hint">可选标准分类，也可自定义</small><datalist id="${h(id)}-list">${options.map((option) => `<option value="${h(option)}"></option>`).join("")}</datalist></label>`;
}

function categoryToolbar(group, categories) {
  const title = group === "skill" ? "Skill 分类" : "MCP 分类";
  return `<div class="category-toolbar" aria-label="${h(title)}">
    ${filterButton(group, "all", "全部")}
    ${categories.map((category) => filterButton(group, category, category)).join("")}
    <button class="text-action category-add" data-manage-category="${h(group)}" ${disabledUnless(canEditLibrary)}>管理分类</button>
  </div>`;
}

function filterButton(group, value, label) {
  const current = group === "skill" ? state.skillFilter : state.mcpFilter;
  return `<button class="${current === value ? "selected" : ""}" data-${group}-filter="${h(value)}">${h(label)}</button>`;
}

function categoryContext(kind) {
  if (kind === "mcp") return { categories: mcpCategories, defaults: DEFAULT_MCP_CATEGORIES, items: mcps, filterKey: "mcpFilter", label: "MCP" };
  return { categories: skillCategories, defaults: DEFAULT_SKILL_CATEGORIES, items: skills, filterKey: "skillFilter", label: "Skill" };
}

function isDefaultCategory(kind, category) {
  const context = categoryContext(kind);
  return context.defaults.includes(category);
}

function addCategoryValue(kind, value) {
  const context = categoryContext(kind);
  const category = String(value || "").trim();
  if (!category) return "";
  if (!context.categories.some((item) => item.toLowerCase() === category.toLowerCase())) {
    context.categories.push(category);
  }
  return category;
}

function addLibraryCategory(kind) {
  if (!requirePermission(canEditLibrary, "只有管理员可以管理 Skill/MCP 分类。")) return;
  const context = categoryContext(kind);
  const name = valueOf(`${kind}-category-name`) || prompt(`新增 ${context.label} 分类名称`);
  const category = String(name || "").trim();
  if (!category) return;
  if (context.categories.some((item) => item.toLowerCase() === category.toLowerCase())) {
    alert(`分类“${category}”已存在。`);
    return;
  }
  addCategoryValue(kind, category);
  state[context.filterKey] = category;
  persistData();
  showFeedback(`已添加分类：${category}`);
}

function deleteLibraryCategory(kind, value) {
  if (!requirePermission(canEditLibrary, "只有管理员可以管理 Skill/MCP 分类。")) return;
  const context = categoryContext(kind);
  const category = String(value || "").trim();
  if (!category || category === "未分类") return;
  const usedCount = context.items.filter((item) => (item.category || "未分类") === category).length;
  const message = usedCount
    ? `删除分类“${category}”后，${usedCount} 个${context.label}条目会移动到“未分类”。是否继续？`
    : `确认删除分类“${category}”？`;
  if (!confirm(message)) return;
  context.items.forEach((item) => {
    if ((item.category || "未分类") === category) item.category = "未分类";
  });
  replaceArray(context.categories, context.categories.filter((item) => item !== category));
  if (!context.categories.includes("未分类")) context.categories.push("未分类");
  if (state[context.filterKey] === category) state[context.filterKey] = "all";
  persistData();
  showFeedback(`已删除分类：${category}`, "warning");
}

function renameLibraryCategory(kind, value) {
  if (!requirePermission(canEditLibrary, "只有管理员可以管理 Skill/MCP 分类。")) return;
  const context = categoryContext(kind);
  const oldCategory = String(value || "").trim();
  if (!oldCategory) return;
  const nextCategory = String(prompt(`将分类“${oldCategory}”重命名为`, oldCategory) || "").trim();
  if (!nextCategory || nextCategory === oldCategory) return;
  if (context.categories.some((item) => item.toLowerCase() === nextCategory.toLowerCase())) {
    alert(`分类“${nextCategory}”已存在。`);
    return;
  }
  context.items.forEach((item) => {
    if ((item.category || "未分类") === oldCategory) item.category = nextCategory;
  });
  replaceArray(context.categories, context.categories.map((item) => item === oldCategory ? nextCategory : item));
  if (state[context.filterKey] === oldCategory) state[context.filterKey] = nextCategory;
  ensureLibraryCategories();
  persistData();
  showFeedback(`已重命名分类：${nextCategory}`);
}

function chip(text, tone = "") {
  return `<span class="chip ${tone}">${h(text)}</span>`;
}

function statusTone(status) {
  return status === "已安装" ? "green" : status === "推荐" ? "blue" : status === "需权限" || status === "待复核" ? "orange" : "red";
}

function riskTone(risk) {
  return risk === "低" ? "green" : risk === "中" ? "orange" : "red";
}

function sourceTypeTone(type) {
  return type === "官方" ? "green" : type === "本地自定义" ? "blue" : type === "第三方" ? "orange" : "red";
}

function emptyState(text) {
  return `<div class="empty-state">${h(text)}</div>`;
}

function createSkill() {
  if (!requirePermission(canAddLibrary, "当前角色无权新增 Skill。")) return;
  const name = valueOf("skill-name");
  const errors = [];
  if (!name) errors.push("Skill 名称必填。");
  if (name && skills.some((item) => item.name.toLowerCase() === name.toLowerCase())) errors.push(`已存在同名 Skill：${name}。`);
  if (!valueOf("skill-install")) errors.push("安装方式必填，用于生成项目安装命令。");
  if (errors.length) {
    state.formErrors.skill = errors;
    render();
    return;
  }
  state.formErrors.skill = [];
  const category = addCategoryValue("skill", valueOf("skill-category") || "未分类");
  skills.push(skill(
    name,
    category || "未分类",
    splitTags(valueOf("skill-tags") || "Custom"),
    valueOf("skill-model") || "GPT-5",
    valueOf("skill-tools") || "Filesystem",
    valueOf("skill-install") || `codex skill install ${name}`,
    valueOf("skill-example") || "团队自定义工作流",
    valueOf("skill-pros") || "贴合团队流程",
    valueOf("skill-cons") || "需要维护",
    "推荐",
    80,
    "",
    valueOf("skill-source") || "manual"
  ));
  ensureLibraryCategories();
  state.skillFilter = "all";
  state.dialog = "";
  persistData();
  showFeedback(`已添加 Skill：${name}`);
}

function saveSkillEdit() {
  if (!requirePermission(canEditLibrary, "只有管理员可以编辑 Skill。")) return;
  const oldName = state.selectedSkill;
  const index = skills.findIndex((item) => item.name === oldName);
  if (index === -1) return;
  const nextName = valueOf("skill-edit-name");
  const errors = [];
  if (!nextName) errors.push("Skill 名称必填。");
  if (isInvalidImportedName(nextName)) errors.push("Skill 名称不能是 README、README.md、SKILL 或 SKILL.md。");
  if (nextName && nextName.toLowerCase() !== oldName.toLowerCase() && skills.some((item) => item.name.toLowerCase() === nextName.toLowerCase())) errors.push(`已存在同名 Skill：${nextName}。`);
  if (errors.length) {
    state.formErrors.skillEdit = errors;
    render();
    return;
  }
  state.formErrors.skillEdit = [];
  const current = skills[index];
  const category = addCategoryValue("skill", valueOf("skill-edit-category") || "未分类");
  const next = normalizeSkillRecord({
    ...current,
    name: nextName,
    category: category || "未分类",
    tags: splitTags(valueOf("skill-edit-tags") || "Custom").slice(0, 6),
    model: valueOf("skill-edit-model") || "按项目选择",
    tools: valueOf("skill-edit-tools") || "Filesystem",
    install: normalizeSkillInstall(valueOf("skill-edit-install"), nextName),
    source: valueOf("skill-edit-source") || "manual",
    example: cleanSkillDescription(valueOf("skill-edit-example") || "从 GitHub 导入的 Skill，需人工补充能力描述。"),
    pros: valueOf("skill-edit-pros") || "来自 GitHub，可沉淀为团队复用能力",
    cons: valueOf("skill-edit-cons") || "导入后建议人工复核触发描述和权限边界",
    status: valueOf("skill-edit-status") || workspaceImportRules().defaultStatus || "待复核",
    score: finiteNumber(valueOf("skill-edit-score"), current.score || 82),
    note: valueOf("skill-edit-note")
  });
  skills[index] = next;
  if (next.name !== oldName) renameProjectBinding("skills", oldName, next.name);
  ensureLibraryCategories();
  recordImport("编辑 Skill", next.name);
  markWorkspaceSaved();
  state.selectedSkill = next.name;
  state.dialog = "";
  persistData();
  showFeedback(`已保存 Skill：${next.name}`);
}

function updateSkillNote(el) {
  if (!canEditLibrary()) return;
  const item = skills.find((skillItem) => skillItem.name === el.dataset.skillNote);
  if (!item) return;
  item.note = el.value;
  persistData();
}

function createMcp() {
  if (!requirePermission(canAddLibrary, "当前角色无权新增 MCP。")) return;
  const name = valueOf("mcp-name");
  const errors = [];
  if (!name) errors.push("MCP 名称必填。");
  if (name && mcps.some((item) => item.name.toLowerCase() === name.toLowerCase())) errors.push(`已存在同名 MCP：${name}。`);
  if (!valueOf("mcp-config")) errors.push("配置方式必填，用于项目绑定和导出。");
  if (!valueOf("mcp-ability")) errors.push("服务能力必填。");
  if (errors.length) {
    state.formErrors.mcp = errors;
    render();
    return;
  }
  state.formErrors.mcp = [];
  const category = addCategoryValue("mcp", valueOf("mcp-category") || "未分类");
  const next = mcp(
    name,
    valueOf("mcp-ability") || "自定义服务能力",
    valueOf("mcp-config") || "MCP Connector",
    normalizeRisk(valueOf("mcp-risk")),
    valueOf("mcp-deps") || "待配置授权",
    valueOf("mcp-use") || "团队自定义场景",
    valueOf("mcp-source") || "manual",
    valueOf("mcp-source-type") || "",
    valueOf("mcp-docs") || "",
    valueOf("mcp-install-source") || valueOf("mcp-config"),
    valueOf("mcp-verified") || "待核验",
    valueOf("mcp-permissions") || valueOf("mcp-deps") || "待确认"
  );
  next.category = category || "未分类";
  mcps.push(next);
  ensureLibraryCategories();
  state.mcpFilter = "all";
  state.dialog = "";
  persistData();
  showFeedback(`已添加 MCP：${next.name}`);
}

function saveMcpEdit() {
  if (!requirePermission(canEditLibrary, "只有管理员可以编辑 MCP。")) return;
  const oldName = state.selectedMcp;
  const index = mcps.findIndex((item) => item.name === oldName);
  if (index === -1) return;
  const nextName = valueOf("mcp-edit-name");
  const errors = [];
  if (!nextName) errors.push("MCP 名称必填。");
  if (nextName && nextName.toLowerCase() !== oldName.toLowerCase() && mcps.some((item) => item.name.toLowerCase() === nextName.toLowerCase())) errors.push(`已存在同名 MCP：${nextName}。`);
  if (!valueOf("mcp-edit-config")) errors.push("配置方式必填。");
  if (!valueOf("mcp-edit-ability")) errors.push("服务能力必填。");
  if (errors.length) {
    state.formErrors.mcpEdit = errors;
    render();
    return;
  }
  state.formErrors.mcpEdit = [];
  const category = addCategoryValue("mcp", valueOf("mcp-edit-category") || "未分类");
  const next = normalizeMcpRecord({
    name: nextName,
    category: category || "未分类",
    ability: valueOf("mcp-edit-ability") || "自定义服务能力",
    config: valueOf("mcp-edit-config") || "MCP Connector",
    risk: normalizeRisk(valueOf("mcp-edit-risk")),
    deps: valueOf("mcp-edit-deps") || "待配置授权",
    use: valueOf("mcp-edit-use") || "团队自定义场景",
    source: valueOf("mcp-edit-source") || "manual",
    sourceType: normalizeSourceType(valueOf("mcp-edit-source-type")),
    docs: valueOf("mcp-edit-docs") || "",
    installSource: valueOf("mcp-edit-install-source") || valueOf("mcp-edit-config"),
    verified: valueOf("mcp-edit-verified") || "待核验",
    permissions: valueOf("mcp-edit-permissions") || valueOf("mcp-edit-deps") || "待确认"
  });
  mcps[index] = next;
  if (next.name !== oldName) renameProjectBinding("mcps", oldName, next.name);
  ensureLibraryCategories();
  recordImport("编辑 MCP", next.name);
  markWorkspaceSaved();
  state.selectedMcp = next.name;
  state.dialog = "";
  persistData();
  showFeedback(`已保存 MCP：${next.name}`);
}

function renameProjectBinding(type, oldName, newName) {
  const slot = type === "skills" ? 2 : 3;
  projects.forEach((project) => {
    project[slot] = project[slot].map((name) => name === oldName ? newName : name);
    const bindings = getProjectMeta(project).bindings[type];
    if (bindings[oldName]) {
      bindings[newName] = bindings[oldName];
      delete bindings[oldName];
    }
  });
}

function addExternalRecommendation(index, mode) {
  if (!requirePermission(canAddLibrary, "当前角色无权把外部候选加入 Skill/MCP 库。")) return;
  const item = state.recommendations.external?.[index];
  if (!item) return;
  if (item.addedMode) return;
  const project = projects[state.project];
  const meta = getProjectMeta(project);
  if (item.type === "mcp") {
    if (!mcps.some((mcpItem) => mcpItem.name === item.name)) {
      mcps.unshift(mcp(
        item.name,
        item.reason,
        item.install || item.url || "待配置",
        item.risk,
        item.requiresToken ? "需要 Token / 授权" : "按来源说明授权",
        item.sourceSummary,
        item.url || "external recommendation",
        item.official ? "官方" : "待审核",
        item.url || "",
        item.install || item.url || "待审核",
        item.auditStatus || "未联网核验",
        item.requiresToken ? "需要 Token / 授权" : "按来源说明授权"
      ));
    }
    if (mode === "enable" && !project[3].includes(item.name)) project[3].push(item.name);
    if (mode === "enable") getBindingMeta(project, "mcps", item.name).enabled = true;
    if ((mode === "library" || mode === "favorite") && project[3].includes(item.name)) getBindingMeta(project, "mcps", item.name).enabled = false;
  } else {
    if (!skills.some((skillItem) => skillItem.name === item.name)) {
      skills.unshift(skill(
        item.name,
        "外部推荐",
        ["External", item.official ? "Official" : "Review"],
        "按项目选择",
        item.type === "mcp" ? "MCP" : "Filesystem",
        normalizeSkillInstall(item.install, item.name),
        cleanSkillDescription(item.reason),
        item.sourceSummary,
        item.requiresToken ? "需要确认 Token / 权限边界" : "需要复核 README 和安装方式",
        mode === "favorite" ? "收藏" : "待复核",
        Math.round(item.confidence * 100),
        "",
        item.url || "external recommendation"
      ));
    }
    if (mode === "enable" && !project[2].includes(item.name)) project[2].push(item.name);
    if (mode === "enable") getBindingMeta(project, "skills", item.name).enabled = true;
  }
  item.addedMode = mode;
  meta.recommendationLog.unshift({
    name: item.name,
    type: item.type,
    url: item.url,
    reason: item.reason,
    risk: item.risk,
    install: item.install,
    mode,
    time: new Date().toISOString()
  });
  meta.recommendationLog = meta.recommendationLog.slice(0, 30);
  recordProjectHistory(project, "处理外部候选", `${item.name} · ${mode}`);
  ensureLibraryCategories();
  persistData();
  showFeedback(`${item.name} 已${mode === "enable" ? "加入并启用" : mode === "favorite" ? "收藏" : "加入库"}`);
}

async function verifyExternalRecommendation(index) {
  const item = state.recommendations.external?.[index];
  if (!item?.url) return;
  item.auditStatus = "核验中";
  item.auditNote = "正在读取来源元数据...";
  render();
  try {
    const result = await verifyGithubSource(item);
    Object.assign(item, result);
  } catch (error) {
    item.auditStatus = "核验失败";
    item.auditNote = error.message || "无法读取来源，请人工打开 URL 复核。";
  }
  persistData();
  render();
}

async function verifyGithubSource(item) {
  const repo = githubRepoFromUrl(item.url);
  if (!repo) {
    return {
      auditStatus: "部分核验",
      auditNote: "当前仅支持 GitHub 仓库基础核验；请人工检查 URL 可访问性、README 和安装命令。"
    };
  }
  const repoResponse = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}`);
  if (!repoResponse.ok) throw new Error(`GitHub 仓库不可读：${repoResponse.status}`);
  const repoData = await repoResponse.json();
  const readmeResponse = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/readme`, {
    headers: { Accept: "application/vnd.github.raw" }
  });
  const readmeText = readmeResponse.ok ? await readmeResponse.text() : "";
  const install = String(item.install || "").trim();
  const installChecked = install ? readmeText.toLowerCase().includes(install.toLowerCase()) : false;
  const summary = readmeText ? firstSentence(readmeText.replace(/[#>*_`[\]()]/g, " ")) : item.sourceSummary;
  return {
    official: item.official || Boolean(repoData.owner?.type === "Organization" && repoData.verified),
    updated: repoData.pushed_at ? new Date(repoData.pushed_at).toISOString().slice(0, 10) : item.updated,
    sourceSummary: summary || item.sourceSummary,
    auditStatus: readmeText ? "已核验" : "部分核验",
    auditNote: [
      "GitHub 仓库存在",
      readmeText ? "README 可读" : "README 未读取到",
      install ? (installChecked ? "安装命令出现在 README 中" : "安装命令未在 README 中精确匹配") : "未提供安装命令"
    ].join("；")
  };
}

function githubRepoFromUrl(url) {
  const match = String(url || "").trim().match(/^https:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)(?:[/?#].*)?$/i);
  if (!match) return null;
  return { owner: match[1], name: match[2].replace(/\.git$/i, "") };
}

function firstSentence(text) {
  return String(text || "").replace(/\s+/g, " ").trim().split(/[。.!?]/)[0]?.slice(0, 220) || "";
}

function saveProject(shouldRender = true) {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能修改项目。")) return;
  const selected = projects[state.project];
  const meta = getProjectMeta(selected);
  const nextPath = valueOfEdit("path") || meta.path;
  selected[0] = valueOfEdit("name") || selected[0];
  selected[1] = valueOfEdit("type") || selected[1];
  selected[6] = valueOfEdit("status") || selected[6];
  if (nextPath !== meta.path) {
    meta.path = nextPath;
    meta.pathKind = nextPath ? "manual" : "none";
    meta.connected = false;
    meta.scannedAt = "";
    meta.scanError = "路径已变更，待重新扫描。";
    meta.agentsFound = false;
    meta.agentsContent = "";
    meta.detectedFiles = [];
    meta.profile = { stack: [], packageName: "", dependencies: [], summary: "", keyFiles: [] };
    invalidateProjectRefinement(selected);
    selected[5] = "未扫描";
  }
  meta.version = valueOfEdit("version") || meta.version;
  meta.owner = valueOfEdit("owner") || meta.owner;
  meta.scope = valueOfEdit("scope") || meta.scope;
  meta.statusTag = PROJECT_STATUS_TAGS.includes(valueOfEdit("statusTag")) ? valueOfEdit("statusTag") : meta.statusTag;
  meta.notes = valueOfEdit("notes");
  document.querySelectorAll("[data-brief-edit]").forEach((el) => {
    meta.brief[el.dataset.briefEdit] = el.value;
  });
  meta.sort = finiteNumber(valueOfEdit("sort"), meta.sort || 0);
  meta.enabled = document.querySelector("[data-project-enabled]")?.checked !== false;
  persistData();
  if (shouldRender) render();
}

function updateProjectBrief(el) {
  if (!canEditWorkspaceData()) return;
  const meta = getProjectMeta(projects[state.project]);
  meta.brief[el.dataset.briefEdit] = el.value;
  meta.brief.confirmed = false;
  invalidateProjectRefinement(projects[state.project]);
  persistData();
}

function confirmProjectBrief() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能确认项目简介。")) return;
  saveProject(false);
  const meta = getProjectMeta(projects[state.project]);
  meta.brief.confirmed = true;
  invalidateProjectRefinement(projects[state.project]);
  persistData();
  render();
}

async function generateProjectBrief() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能生成或改写项目简介。")) return;
  saveProject(false);
  const project = projects[state.project];
  const meta = getProjectMeta(project);
  const fallback = generatedBriefFromProject(project);
  if (!canCallModel()) {
    meta.brief = { ...fallback, confirmed: false };
    persistData();
    render();
    return;
  }
  const previousStatus = state.ai.status;
  state.ai.status = "正在优化项目简介...";
  render();
  try {
    const system = "你是项目画像整理助手。只返回合法 JSON，不要解释。";
    const response = state.ai.mode === "custom"
      ? await customModelRequest(briefPrompt(project, fallback))
      : await compatibleModelRequest(briefPrompt(project, fallback), system);
    if (!response.ok) throw new Error(`${response.status} ${(await response.text()).slice(0, 160)}`);
    const data = await response.json();
    const content = getByPath(data, state.ai.mode === "custom" ? state.ai.responsePath : "choices.0.message.content") || data.output_text || data.text || "";
    const parsed = parseJson(stripJsonFence(content));
    meta.brief = normalizeBrief(parsed || fallback);
    state.ai.status = "项目简介已生成，请人工确认后再导出。";
  } catch (error) {
    meta.brief = { ...fallback, confirmed: false };
    state.ai.status = `模型生成失败，已使用扫描初版：${error.message}`;
  }
  persistData();
  render();
  window.setTimeout(() => {
    if (state.ai.status.startsWith("项目简介已生成") || state.ai.status.startsWith("模型生成失败")) {
      state.ai.status = previousStatus;
      render();
    }
  }, 3500);
}

function generatedBriefFromProject(project) {
  const meta = getProjectMeta(project);
  const profile = meta.profile || {};
  const scan = {
    root: meta.path || project[0],
    detectedFiles: meta.detectedFiles || profile.keyFiles || [],
    profile: {
      packageName: profile.packageName || "",
      dependencies: profile.dependencies || [],
      stack: profile.stack || [],
      keyFiles: profile.keyFiles || meta.detectedFiles || [],
      summary: profile.summary || meta.notes || project[1]
    }
  };
  return initialProjectBrief(scan);
}

function briefPrompt(project, fallback) {
  return `请基于项目扫描信息生成项目简介 JSON。不要编造未扫描到的事实；不确定的地方写“待补充”。
只返回 JSON，结构为 {"purpose":"","users":"","features":"","aiTasks":"","avoidTasks":"","risks":""}。
工作区偏好：
${workspaceGuidance()}

当前项目：
${JSON.stringify(projectPayload(project), null, 2)}
扫描初版：
${JSON.stringify(fallback, null, 2)}`;
}

function normalizeBrief(value = {}) {
  return {
    purpose: String(value.purpose || "").slice(0, 800),
    users: String(value.users || "").slice(0, 800),
    features: String(value.features || "").slice(0, 800),
    aiTasks: String(value.aiTasks || "").slice(0, 800),
    avoidTasks: String(value.avoidTasks || "").slice(0, 800),
    risks: String(value.risks || "").slice(0, 800),
    confirmed: false
  };
}

function deleteProject() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能删除项目。")) return;
  if (projects.length <= 1) return;
  const selected = projects[state.project];
  if (!confirm(`确认删除项目「${selected[0]}」？\n\n这会移除它的 Skill/MCP 绑定和备注，刷新后也不会恢复。`)) return;
  projects.splice(state.project, 1);
  state.project = Math.max(0, state.project - 1);
  persistData();
  render();
}

async function recommendProjectConfig() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能生成推荐并修改推荐状态。")) return;
  saveProject(false);
  const projectIndex = state.project;
  const project = projects[projectIndex];
  const brief = getProjectMeta(project).brief || {};
  state.recommendations = { loading: true, status: brief.confirmed ? "正在分析项目画像" : "简介未确认，先按草稿分析", projectIndex, skills: [], mcps: [], external: [] };
  render();
  try {
    const result = canCallModel() ? await recommendWithModel(project) : fallbackRecommendations(project);
    state.recommendations = {
      loading: false,
      status: canCallModel() ? "模型推荐" : "本地规则",
      projectIndex,
      skills: sanitizeRecommendations(result.skills, skills, activeBindings(project, "skills").map((item) => item.name)),
      mcps: sanitizeRecommendations(result.mcps, mcps, activeBindings(project, "mcps").map((item) => item.name)),
      external: sanitizeExternalRecommendations(result.external || [])
    };
  } catch (error) {
    const fallback = fallbackRecommendations(project);
    state.recommendations = {
      loading: false,
      status: `已使用本地规则：${error.message}`,
      projectIndex,
      skills: sanitizeRecommendations(fallback.skills, skills, activeBindings(project, "skills").map((item) => item.name)),
      mcps: sanitizeRecommendations(fallback.mcps, mcps, activeBindings(project, "mcps").map((item) => item.name)),
      external: sanitizeExternalRecommendations(fallback.external || [])
    };
  }
  render();
}

async function recommendWithModel(project) {
  const prompt = recommendationPrompt(project);
  const system = "你是 Skill/MCP 配置推荐助手。只返回合法 JSON，不要解释。";
  const response = state.ai.mode === "custom" ? await customModelRequest(prompt) : await compatibleModelRequest(prompt, system);
  if (!response.ok) throw new Error(`${response.status} ${(await response.text()).slice(0, 160)}`);
  const data = await response.json();
  const content = getByPath(data, state.ai.mode === "custom" ? state.ai.responsePath : "choices.0.message.content") || data.output_text || data.text || "";
  const parsed = parseJson(stripJsonFence(content));
  if (!parsed) throw new Error("模型返回不是合法 JSON");
  return parsed;
}

function recommendationPrompt(project) {
  const payload = projectPayload(project);
  const skillCatalog = skills.map((item) => ({
    name: item.name,
    category: item.category,
    tags: item.tags,
    model: item.model,
    tools: item.tools,
    example: item.example,
    pros: item.pros,
    cons: item.cons
  }));
  const mcpCatalog = mcps.map((item) => ({
    name: item.name,
    ability: item.ability,
    risk: item.risk,
    deps: item.deps,
    use: item.use,
    config: item.config
  }));
  return `请基于当前项目画像推荐 Skill/MCP。推荐必须考虑项目目标、核心功能、主要用户、AI 参与工作、权限和风险边界。
不要推荐已启用项；如果某个已禁用项仍然适合当前项目，可以推荐它并说明恢复启用的理由。
结果分三层：
1. skills：已有 Skill 库推荐，可直接启用。
2. mcps：已有 MCP 库推荐，可直接启用。
3. external：外部可导入候选，不要宣称已经全网搜索验证；如果无法确认 README、更新时间或安装命令来源，请写“待审核”。
只返回 JSON，结构为 {"skills":[{"name":"","reason":"","risk":"低|中|高","confidence":0.8}],"mcps":[...],"external":[{"name":"","type":"skill|mcp","url":"","reason":"","risk":"低|中|高","install":"","official":false,"sourceSummary":"","updated":"待审核","requiresToken":false,"confidence":0.7,"auditStatus":"未联网核验","auditNote":"模型候选，需人工或 GitHub 核验"}]}。
工作区偏好：
${workspaceGuidance()}

当前项目：
${JSON.stringify(payload, null, 2)}
可选 Skill：
${JSON.stringify(skillCatalog, null, 2)}
可选 MCP：
${JSON.stringify(mcpCatalog, null, 2)}`;
}

function fallbackRecommendations(project) {
  const meta = getProjectMeta(project);
  const profile = meta.profile || {};
  const brief = meta.brief || {};
  const context = [
    project[0],
    project[1],
    meta.notes,
    brief.purpose,
    brief.users,
    brief.features,
    brief.aiTasks,
    brief.avoidTasks,
    brief.risks,
    project[4],
    profile.packageName,
    ...(profile.stack || []),
    ...(profile.dependencies || []),
    profile.summary,
    ...(meta.detectedFiles || []),
    ...project[2],
    ...project[3]
  ].join(" ").toLowerCase();
  const activeSkillNames = new Set(activeBindings(project, "skills").map((item) => item.name));
  const activeMcpNames = new Set(activeBindings(project, "mcps").map((item) => item.name));
  const skillRecs = skills
    .filter((item) => !activeSkillNames.has(item.name))
    .map((item) => scoreSkillRecommendation(item, context))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const mcpRecs = mcps
    .filter((item) => !activeMcpNames.has(item.name))
    .map((item) => scoreMcpRecommendation(item, context))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return { skills: skillRecs, mcps: mcpRecs, external: externalFallbackRecommendations(context) };
}

function externalFallbackRecommendations(context) {
  const list = [];
  if (context.includes("react") || context.includes("vite") || context.includes("前端")) {
    list.push({
      name: "Playwright MCP",
      type: "mcp",
      url: "https://github.com/microsoft/playwright-mcp",
      reason: "适合前端项目的页面交互、截图和回归验证。",
      risk: "中",
      install: "npx @playwright/mcp@latest",
      official: true,
      sourceSummary: "Microsoft Playwright 生态 MCP，需要浏览器访问权限。",
      updated: "待审核",
      requiresToken: false,
      confidence: 0.72
    });
  }
  if (context.includes("python") || context.includes("数据") || context.includes("csv")) {
    list.push({
      name: "duckdb-mcp",
      type: "mcp",
      url: "https://github.com/ktanaka101/duckdb-mcp-server",
      reason: "适合本地数据分析、CSV/Parquet 查询和报告辅助。",
      risk: "高",
      install: "uvx duckdb-mcp-server",
      official: false,
      sourceSummary: "第三方 MCP，涉及本地文件读取，需要确认数据范围。",
      updated: "待审核",
      requiresToken: false,
      confidence: 0.62
    });
  }
  return list;
}

function scoreSkillRecommendation(item, context) {
  const text = [item.name, item.category, item.tags.join(" "), item.example, item.pros].join(" ").toLowerCase();
  let score = sharedKeywordScore(context, text);
  if (context.includes("react") || context.includes("前端") || context.includes("ui")) score += item.category === "设计/前端" ? 4 : 0;
  if (context.includes("数据") || context.includes("csv") || context.includes("xlsx")) score += item.name.includes("spreadsheets") ? 4 : 0;
  if (context.includes("文档") || context.includes("word") || context.includes("docx")) score += item.name.includes("documents") ? 4 : 0;
  if (context.includes("github") || context.includes("ci") || context.includes("pr")) score += item.name.includes("github") ? 4 : 0;
  return { name: item.name, reason: `${item.category} 与当前项目上下文匹配，可补足 ${item.example || item.pros}。`, risk: item.status === "需权限" ? "中" : "低", confidence: Math.min(0.95, 0.55 + score * 0.06), score };
}

function scoreMcpRecommendation(item, context) {
  const text = [item.name, item.ability, item.use, item.deps].join(" ").toLowerCase();
  let score = sharedKeywordScore(context, text);
  if (context.includes("react") || context.includes("前端") || context.includes("ui")) score += item.name === "browser" ? 4 : 0;
  if (context.includes("github") || context.includes("ci") || context.includes("pr")) score += item.name === "github" ? 4 : 0;
  if (context.includes("api") || context.includes("docs") || context.includes("框架")) score += item.name === "context7" ? 3 : 0;
  return { name: item.name, reason: `${item.ability}，适合用于${item.use}。`, risk: item.risk, confidence: Math.min(0.92, 0.52 + score * 0.07), score };
}

function sharedKeywordScore(left, right) {
  const words = left.split(/[\s,，;；/\\]+/).filter((word) => word.length > 1);
  return words.reduce((sum, word) => sum + (right.includes(word) ? 1 : 0), 0);
}

function sanitizeRecommendations(items, catalog, boundItems = []) {
  const names = new Set(catalog.map((item) => item.name));
  const bound = new Set(boundItems);
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && names.has(item.name) && !bound.has(item.name))
    .slice(0, 4)
    .map((item) => ({
      name: item.name,
      reason: item.reason || "适合当前项目上下文。",
      risk: ["低", "中", "高"].includes(item.risk) ? item.risk : "低",
      confidence: normalizeConfidence(item.confidence)
    }));
}

function sanitizeExternalRecommendations(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && item.name)
    .slice(0, 6)
    .map((item) => ({
      name: String(item.name),
      type: String(item.type || "skill").toLowerCase() === "mcp" ? "mcp" : "skill",
      url: item.url || "",
      reason: item.reason || "适合当前项目画像。",
      risk: ["低", "中", "高"].includes(item.risk) ? item.risk : "中",
      install: item.install || "",
      official: Boolean(item.official),
      sourceSummary: item.sourceSummary || "需要人工复核来源和 README。",
      updated: item.updated || "待审核",
      requiresToken: Boolean(item.requiresToken),
      confidence: normalizeConfidence(item.confidence),
      auditStatus: item.auditStatus || "未联网核验",
      auditNote: item.auditNote || "",
      addedMode: item.addedMode || ""
    }));
}

function normalizeConfidence(value) {
  const numeric = Number(value || 0.72);
  const ratio = numeric > 1 ? numeric / 100 : numeric;
  return Math.max(0.1, Math.min(0.99, Number.isFinite(ratio) ? ratio : 0.72));
}

function addProjectFromPath() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能新增项目。")) return;
  const path = state.projectDraft.folderPath.trim();
  if (!path) return;
  const name = uniqueProjectName(folderName(path));
  const meta = projectMeta();
  meta.path = path;
  meta.pathKind = "manual";
  meta.connected = false;
  meta.scanError = "已记录手填路径；浏览器不能直接验证该路径，请使用文件夹扫描读取关键文件。";
  projects.push([name, inferProjectType(path), defaultProjectSkills(path), defaultProjectMcps(path), inferTemplate(path), "未扫描", "关注", meta]);
  state.project = projects.length - 1;
  state.projectDraft.folderPath = "";
  persistData();
  render();
}

function savePathToCurrentProject() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能修改项目路径。")) return;
  const path = state.projectDraft.folderPath.trim();
  if (!path) return;
  const project = projects[state.project];
  const meta = getProjectMeta(project);
  meta.path = path;
  meta.pathKind = "manual";
  meta.connected = false;
  meta.scannedAt = "";
  meta.scanError = "已记录手填路径，待通过文件夹扫描读取关键文件。";
  meta.agentsFound = false;
  meta.agentsContent = "";
  meta.detectedFiles = [];
  meta.profile = { stack: [], packageName: "", dependencies: [], summary: "", keyFiles: [] };
  project[5] = "未扫描";
  project[6] = "关注";
  state.projectDraft.folderPath = "";
  persistData();
  showFeedback("已保存项目路径");
}

function openCurrentProjectFolder() {
  const project = projects[state.project];
  if (!project) return;
  const meta = getProjectMeta(project);
  const path = String(meta.path || "").trim();
  if (!path) {
    showFeedback("当前项目还没有记录文件夹路径，请先连接或记录项目。", "warning");
    return;
  }
  if (meta.pathKind === "browser-folder" && !isAbsoluteLocalPath(path)) {
    showFeedback("浏览器只保留了授权文件夹名，不能直接打开目录；可用“重新扫描”再次授权。", "warning");
    return;
  }
  if (!isAbsoluteLocalPath(path)) {
    showFeedback("当前路径不是可打开的本机绝对路径。", "warning");
    return;
  }
  window.open(localFolderUrl(path), "_blank", "noopener,noreferrer");
  showFeedback("已尝试打开项目文件夹");
}

function isAbsoluteLocalPath(path) {
  return /^[a-zA-Z]:[\\/]/.test(path) || /^\\\\[^\\]+\\[^\\]+/.test(path) || /^\//.test(path);
}

function localFolderUrl(path) {
  const normalized = path.replace(/\\/g, "/");
  if (/^[a-zA-Z]:\//.test(normalized)) return encodeURI(`file:///${normalized}`);
  if (normalized.startsWith("//")) return encodeURI(`file:${normalized}`);
  return encodeURI(`file://${normalized}`);
}

async function addProjectFromFiles(event) {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能导入或扫描项目。")) {
    event.target.value = "";
    return;
  }
  const files = [...event.target.files];
  if (!files.length) return;
  const scan = await scanSelectedFiles(files);
  const root = scan.root || "导入项目";
  const profileText = projectProfileText(scan);
  const meta = projectMeta();
  Object.assign(meta, {
    path: root,
    pathKind: "browser-folder",
    connected: true,
    scannedAt: new Date().toISOString(),
    scanError: scan.error,
    agentsFound: Boolean(scan.agentsContent),
    agentsContent: scan.agentsContent,
    detectedFiles: scan.detectedFiles,
    profile: scan.profile,
    brief: initialProjectBrief(scan)
  });
  const mode = event.target.dataset.folderPicker || "current";
  if (mode === "new") {
    projects.push([uniqueProjectName(root), inferProjectType(profileText), defaultProjectSkills(profileText), defaultProjectMcps(profileText), inferTemplate(profileText), meta.scannedAt, scan.error ? "关注" : "安全", meta]);
    state.project = projects.length - 1;
  } else {
    const project = projects[state.project];
    const previousMeta = getProjectMeta(project);
    meta.version = previousMeta.version;
    meta.owner = previousMeta.owner;
    meta.scope = previousMeta.scope;
    meta.notes = previousMeta.notes;
    meta.brief = shouldKeepBrief(previousMeta.brief) ? previousMeta.brief : meta.brief;
    meta.enabled = previousMeta.enabled;
    meta.sort = previousMeta.sort;
    meta.bindings = previousMeta.bindings;
    project[0] = project[0] || uniqueProjectName(root);
    project[1] = inferProjectType(profileText);
    project[4] = inferTemplate(profileText);
    project[5] = meta.scannedAt;
    project[6] = scan.error ? "关注" : "安全";
    project[7] = meta;
    getProjectMeta(project);
    state.recommendations = {
      loading: false,
      status: "扫描完成，可重新推荐",
      projectIndex: state.project,
      skills: [],
      mcps: [],
      external: []
    };
  }
  event.target.value = "";
  persistData();
  render();
}

async function scanSelectedFiles(files) {
  const keyPatterns = /(package\.json|readme\.md|agents\.md|vite\.config|next\.config|tsconfig\.json|requirements\.txt|pyproject\.toml|dockerfile|compose\.ya?ml|\.env\.example)$/i;
  const root = (files[0].webkitRelativePath || files[0].name).split("/")[0] || "";
  const selected = files
    .filter((file) => keyPatterns.test(file.name) || keyPatterns.test(file.webkitRelativePath || ""))
    .sort((left, right) => filePriority(left) - filePriority(right))
    .slice(0, 24);
  const entries = [];
  for (const file of selected) {
    try {
      entries.push({ path: file.webkitRelativePath || file.name, name: file.name, text: (await file.text()).slice(0, 24000) });
    } catch (error) {
      entries.push({ path: file.webkitRelativePath || file.name, name: file.name, text: "", error: error.message });
    }
  }
  const packageEntry = preferredEntry(entries, /package\.json$/i);
  const readme = preferredEntry(entries, /readme\.md$/i);
  const agents = preferredEntry(entries, /agents\.md$/i);
  const profile = buildProjectProfile(entries, packageEntry, readme);
  return {
    root,
    detectedFiles: entries.map((entry) => entry.path),
    agentsContent: agents?.text || "",
    profile,
    error: entries.length ? "" : "没有读取到 package.json、README、AGENTS.md 等关键文件"
  };
}

function filePriority(file) {
  const path = file.webkitRelativePath || file.name;
  const depth = path.split("/").length;
  const name = file.name.toLowerCase();
  const rank = name === "package.json" ? 0 : name === "readme.md" ? 1 : name === "agents.md" ? 2 : 4;
  return depth * 10 + rank;
}

function preferredEntry(entries, pattern) {
  return entries
    .filter((entry) => pattern.test(entry.path))
    .sort((left, right) => pathDepth(left.path) - pathDepth(right.path))[0];
}

function pathDepth(path) {
  return String(path).split("/").length;
}

function buildProjectProfile(entries, packageEntry, readme) {
  let pkg = {};
  try { pkg = packageEntry ? JSON.parse(packageEntry.text) : {}; } catch { pkg = {}; }
  const deps = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
  const stack = inferStackFromEntries(entries, deps);
  return {
    packageName: pkg.name || "",
    dependencies: deps.slice(0, 40),
    stack,
    keyFiles: entries.map((entry) => entry.path),
    summary: (readme?.text || "").replace(/\s+/g, " ").slice(0, 600)
  };
}

function inferStackFromEntries(entries, deps) {
  const text = `${entries.map((entry) => entry.path).join(" ")} ${deps.join(" ")}`.toLowerCase();
  const stack = [];
  if (/react|vite|next/.test(text)) stack.push("React/Vite/Next");
  if (/vue|nuxt/.test(text)) stack.push("Vue/Nuxt");
  if (/typescript|tsconfig/.test(text)) stack.push("TypeScript");
  if (/python|pyproject|requirements/.test(text)) stack.push("Python");
  if (/docker|compose/.test(text)) stack.push("Docker");
  if (/playwright|vitest|jest/.test(text)) stack.push("Testing");
  return stack.length ? stack : ["待识别"];
}

function projectProfileText(scan) {
  return [scan.root, scan.profile.packageName, scan.profile.stack.join(" "), scan.profile.dependencies.join(" "), scan.profile.summary, scan.detectedFiles.join(" ")].join(" ");
}

function initialProjectBrief(scan) {
  const profile = scan.profile || {};
  const stack = (profile.stack || []).join(", ") || "待识别";
  const summary = profile.summary || `扫描到 ${scan.detectedFiles.length} 个关键文件。`;
  const lower = `${scan.root} ${summary} ${(profile.dependencies || []).join(" ")}`.toLowerCase();
  const isFrontend = /react|vue|next|vite|ui|dashboard|admin|crm/.test(lower);
  const isData = /data|csv|xlsx|report|pandas|python|周报|数据/.test(lower);
  return {
    purpose: summary.slice(0, 420),
    users: isFrontend ? "业务运营、产品或内部管理用户。" : isData ? "数据分析、运营或需要定期查看报告的团队。" : "项目维护者和相关业务团队。",
    features: (profile.keyFiles || scan.detectedFiles || []).slice(0, 8).join("；") || "待用户补充核心功能。",
    aiTasks: isFrontend ? "前端页面实现、组件整理、交互验收、文档补充和 PR 协作。" : isData ? "数据处理脚本、报表生成、公式复核、文档整理和结果解释。" : "代码阅读、文档整理、测试建议、配置生成和变更说明。",
    avoidTasks: "生产数据变更、权限审批、财务/法律结论和不可复核的自动发布。",
    risks: `技术栈：${stack}。使用写文件、GitHub、浏览器或外部 API 前需要确认授权边界。`,
    confirmed: false
  };
}

function shouldKeepBrief(brief = {}) {
  return Boolean(brief.confirmed || brief.purpose || brief.users || brief.features || brief.aiTasks || brief.avoidTasks || brief.risks);
}

async function importFromGithub(kind, useAi = false) {
  if (!requirePermission(canAddLibrary, `当前角色无权导入 ${kind === "skill" ? "Skill" : "MCP"}。`)) return;
  const url = state.importer.url.trim();
  state.importer.lastError = "";
  if (!url) {
    state.importer.status = "请先粘贴 GitHub 链接。";
    state.importer.lastError = "GitHub URL 不能为空。示例：https://github.com/owner/repo/blob/main/SKILL.md";
    render();
    return;
  }
  state.importer.status = "正在读取 GitHub 内容...";
  render();
  try {
    const result = await fetchGithubContent(url, kind);
    const reviewSource = githubReviewUrl(url, result.source);
    if (kind === "skill") {
      const imported = useAi ? await parseImportWithModel(result.text, reviewSource, "skill") : parseSkill(result.text, reviewSource);
      if (isInvalidImportedName(imported.name)) throw new Error("未识别到有效 Skill 名称，请使用 AI 解析或手动编辑后导入。");
      openImportReview("skill", imported, reviewSource, useAi);
    } else {
      const imported = useAi ? await parseImportWithModel(result.text, reviewSource, "mcp") : parseMcp(result.text, reviewSource);
      openImportReview("mcp", imported, reviewSource, useAi);
    }
  } catch (error) {
    state.importer.status = `导入失败：${error.message}`;
    state.importer.lastError = error.details || error.stack || error.message;
  }
  render();
}

function openImportReview(kind, item, source, useAi = false) {
  state.importer.pending = {
    kind,
    source,
    useAi,
    item: kind === "skill" ? normalizeSkillRecord(item) : normalizeMcpRecord(item)
  };
  state.importer.status = `${kind === "skill" ? "Skill" : "MCP"} 已解析，请在预览弹窗中复核后入库。`;
  state.dialog = "import-review";
}

function githubReviewUrl(inputUrl, fetchedUrl) {
  const input = inputUrl.trim().replace(/\/$/, "");
  const repoOnly = /^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?$/i.test(input);
  if (/^https:\/\/github\.com\//i.test(input) && !repoOnly) return input;
  const raw = (fetchedUrl || input).match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i);
  if (raw) return `https://github.com/${raw[1]}/${raw[2]}/blob/${raw[3]}/${raw[4]}`;
  return input || fetchedUrl;
}

function recordImport(kind, name) {
  state.importer.history = [
    { kind, name, time: new Date().toLocaleString("zh-CN", { hour12: false }) },
    ...(state.importer.history || [])
  ].slice(0, 12);
}

function importPreview(kind, item, source) {
  const exists = kind === "Skill"
    ? skills.some((skillItem) => skillItem.name === item.name)
    : mcps.some((mcpItem) => mcpItem.name === item.name);
  const mcpItem = kind === "MCP" ? normalizeMcpRecord(item) : null;
  const lines = kind === "Skill"
    ? [`名称：${item.name}`, `分类：${item.category}`, `标签：${item.tags.join(", ")}`, `安装方式：${item.install}`, `出处：${item.source || source}`, `简介：${item.example}`, `状态：${item.status}`]
    : [
      `名称：${mcpItem.name}`,
      `能力：${mcpItem.ability}`,
      `风险：${mcpItem.risk}`,
      `配置：${mcpItem.config}`,
      `来源：${mcpItem.source || source || "待审核"}`,
      `来源类型：${mcpItem.sourceType || "待审核"}`,
      `文档：${mcpItem.docs || "待审核"}`,
      `权限说明：${mcpItem.permissions || "待审核"}`,
      `核验状态：${mcpItem.verified || "待审核"}`
    ];
  return `${kind} 导入预览\n\n${lines.join("\n")}\n来源：${source}\n\n${exists ? "检测到同名条目，确认后会合并覆盖旧条目。" : "确认导入到本地库？"}`;
}

function saveImportReview() {
  if (!requirePermission(canAddLibrary, "当前角色无权导入 Skill/MCP。")) return;
  const pending = state.importer.pending;
  if (!pending) return;
  const errors = [];
  if (pending.kind === "skill") {
    const name = valueOf("import-skill-name");
    if (!name) errors.push("Skill 名称必填。");
    if (isInvalidImportedName(name)) errors.push("Skill 名称不能是 README、README.md、SKILL 或 SKILL.md。");
    if (errors.length) {
      state.formErrors.importReview = errors;
      render();
      return;
    }
    const category = addCategoryValue("skill", valueOf("import-skill-category") || "未分类");
    const item = normalizeSkillRecord({
      ...pending.item,
      name,
      category,
      tags: splitTags(valueOf("import-skill-tags") || "GitHub, Import").slice(0, 6),
      model: valueOf("import-skill-model") || "按项目选择",
      tools: valueOf("import-skill-tools") || "Filesystem",
      install: normalizeSkillInstall(valueOf("import-skill-install"), name),
      source: valueOf("import-skill-source") || pending.source,
      example: cleanSkillDescription(valueOf("import-skill-example") || "从 GitHub 导入的 Skill，需人工补充能力描述。"),
      pros: valueOf("import-skill-pros") || "来自 GitHub，可沉淀为团队复用能力",
      cons: valueOf("import-skill-cons") || "导入后建议人工复核触发描述和权限边界",
      status: valueOf("import-skill-status") || workspaceImportRules().defaultStatus || "待复核",
      score: finiteNumber(valueOf("import-skill-score"), pending.item.score || 82)
    });
    upsertSkill(item);
    state.skillFilter = "all";
    state.importer.status = `已导入 Skill：${item.name}${pending.useAi ? "（大模型解析）" : ""}`;
    recordImport("Skill", item.name);
  } else {
    const name = valueOf("import-mcp-name");
    if (!name) errors.push("MCP 名称必填。");
    if (errors.length) {
      state.formErrors.importReview = errors;
      render();
      return;
    }
    const category = addCategoryValue("mcp", valueOf("import-mcp-category") || "未分类");
    const item = normalizeMcpRecord({
      ...pending.item,
      name,
      category,
      ability: valueOf("import-mcp-ability") || "从 GitHub 导入的 MCP 服务。",
      config: valueOf("import-mcp-config") || pending.source,
      risk: normalizeRisk(valueOf("import-mcp-risk")),
      deps: valueOf("import-mcp-deps") || "按仓库说明安装",
      use: valueOf("import-mcp-use") || "项目上下文扩展",
      source: valueOf("import-mcp-source") || pending.source,
      sourceType: normalizeSourceType(valueOf("import-mcp-source-type")),
      docs: valueOf("import-mcp-docs") || pending.source,
      installSource: valueOf("import-mcp-install-source") || valueOf("import-mcp-config") || pending.source,
      verified: valueOf("import-mcp-verified") || "导入待复核",
      permissions: valueOf("import-mcp-permissions") || "按仓库 README 授权"
    });
    upsertMcp(item);
    state.mcpFilter = "all";
    state.importer.status = `已导入 MCP：${item.name}${pending.useAi ? "（大模型解析）" : ""}`;
    recordImport("MCP", item.name);
  }
  state.formErrors.importReview = [];
  state.importer.pending = null;
  state.importer.url = "";
  state.dialog = "";
  persistData();
  showFeedback(`已导入${pending.kind === "skill" ? " Skill" : " MCP"}：${name}`);
}

async function openSkill(name) {
  const item = skills.find((skillItem) => skillItem.name === name);
  if (!item) return;
  state.selectedSkill = name;
  if (item.mdUrl && !item.rawLoaded) {
    item.loadingMd = true;
    state.dialog = "skill-detail";
    render();
    try {
      const response = await fetch(item.mdUrl);
      if (response.ok) {
        item.md = await response.text();
        item.rawLoaded = true;
      } else {
        item.md = cachedSkillMd(item.name) || `原始 SKILL.md 读取失败：HTTP ${response.status}\n\n路径：${item.mdUrl}\n请检查本地 skill-sources 文件是否存在，或重新导入该 Skill。`;
        item.rawLoaded = Boolean(cachedSkillMd(item.name));
      }
    } catch (error) {
      item.md = cachedSkillMd(item.name) || `原始 SKILL.md 读取失败：${error.message}\n\n路径：${item.mdUrl}\n请检查本地预览服务或 skill-sources 文件。`;
      item.rawLoaded = Boolean(cachedSkillMd(item.name));
    } finally {
      item.loadingMd = false;
    }
  }
  state.dialog = "skill-detail";
  render();
}

async function parseImportWithModel(text, source, kind) {
  const rules = workspaceImportRules();
  if (!state.ai.model || !canCallModel()) {
    state.importer.status = "未配置大模型 API，已改用规则导入。";
    return kind === "skill" ? parseSkill(text, source) : parseMcp(text, source);
  }
  const schema = kind === "skill"
    ? "JSON 字段：name, category, tags(array), model, tools, install, example, pros, cons, status, score(number)"
    : "JSON 字段：name, ability, config, risk(低/中/高), deps, use";
  const prompt = `请从 GitHub 内容中识别一个 ${kind === "skill" ? "Codex Skill" : "MCP 服务"}，只返回合法 JSON，不要解释。\n${schema}\n工作区偏好：\n${workspaceGuidance()}\n来源：${source}\n内容：\n${text.slice(0, 12000)}`;
  const response = state.ai.mode === "custom" ? await customModelRequest(prompt) : await compatibleModelRequest(prompt);
  if (!response.ok) throw new Error(`${response.status} ${(await response.text()).slice(0, 180)}`);
  const data = await response.json();
  const content = getByPath(data, state.ai.mode === "custom" ? state.ai.responsePath : "choices.0.message.content") || data.output_text || data.text || "";
  const json = parseJson(stripJsonFence(content));
  if (!json) throw new Error("大模型返回内容不是合法 JSON。");
  if (kind === "skill") {
    const name = cleanImportedName(json.name || importedSkillName(text, source));
    if (isInvalidImportedName(name)) throw new Error("未识别到有效 Skill 名称，请使用 AI 解析或手动编辑后导入。");
    return skill(
      name,
      json.category || inferSkillCategory(`${json.name} ${json.example}`),
      (Array.isArray(json.tags) ? json.tags : splitTags(json.tags || "GitHub, Import")).slice(0, 6),
      json.model || "按项目选择",
      json.tools || "Filesystem",
      normalizeSkillInstall(json.install, name),
      cleanSkillDescription(json.example || json.description || "从 GitHub 导入的 Skill，需人工补充能力描述。"),
      json.pros || "由大模型整理，便于团队复用",
      json.cons || "导入后建议人工复核",
      rules.defaultStatus || json.status || "待复核",
      Number(json.score || 84),
      text.trim() || json.md || skillMarkdown(json),
      source
    );
  }
  return mcp(
    json.name || repoName(source),
    json.ability || json.description || "从 GitHub 导入的 MCP 服务。",
    json.config || source,
    normalizeRisk(json.risk),
    json.deps || "按仓库说明安装",
    json.use || "项目上下文扩展",
    source,
    json.sourceType || inferSourceType(source),
    json.docs || source,
    json.installSource || json.config || source,
    json.verified || "导入待复核",
    json.permissions || json.deps || "按仓库说明授权"
  );
}

async function fetchGithubContent(url, kind) {
  const candidates = githubCandidates(url, kind);
  let lastError = "";
  const attempts = [];
  for (const source of candidates) {
    try {
      const response = await fetch(source);
      if (!response.ok) {
        lastError = `${response.status} ${source}`;
        attempts.push(lastError);
        continue;
      }
      const text = await response.text();
      if (text.trim()) return { text, source };
      attempts.push(`空内容 ${source}`);
    } catch (error) {
      lastError = error.message;
      attempts.push(`${error.message} ${source}`);
    }
  }
  const error = new Error(lastError || "没有读取到可解析内容。raw.githubusercontent.com 链接最稳定。");
  error.details = `尝试读取：\n${attempts.join("\n")}`;
  throw error;
}

function githubCandidates(url, kind) {
  const clean = url.trim().replace(/\/$/, "").replace(/\.git$/i, "");
  const candidates = [clean];
  const blob = clean.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
  if (blob) {
    candidates.unshift(`https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}/${blob[4]}`);
    return unique(candidates);
  }
  const tree = clean.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/?(.*)$/);
  if (tree) {
    const base = `https://raw.githubusercontent.com/${tree[1]}/${tree[2]}/${tree[3]}/${tree[4] ? `${tree[4]}/` : ""}`;
    candidates.unshift(...defaultFiles(base, kind));
    return unique(candidates);
  }
  const repo = clean.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/);
  if (repo) {
    ["main", "master"].forEach((branch) => {
      const base = `https://raw.githubusercontent.com/${repo[1]}/${repo[2]}/${branch}/`;
      candidates.push(...defaultFiles(base, kind));
    });
  }
  return unique(candidates);
}

function defaultFiles(base, kind) {
  return kind === "skill"
    ? [`${base}SKILL.md`, `${base}skill.md`, `${base}README.md`]
    : [`${base}mcp.json`, `${base}server.json`, `${base}README.md`];
}

function unique(items) {
  return [...new Set(items)];
}

function parseSkill(text, source) {
  const rules = workspaceImportRules();
  const name = importedSkillName(text, source);
  if (isInvalidImportedName(name)) throw new Error("未识别到有效 Skill 名称，请使用 AI 解析或手动编辑后导入。");
  const description = cleanSkillDescription(frontmatter(text, "description") || firstParagraph(text) || "从 GitHub 导入的 Skill，需人工补充能力描述。");
  const tags = inferTags(`${name} ${description}`);
  return skill(
    name,
    inferSkillCategory(`${name} ${description}`),
    tags.slice(0, 6),
    frontmatter(text, "model") || "按项目选择",
    inferTools(`${name} ${description}`),
    installLine(text) || rules.installFallback || "手动导入",
    description,
    "来自 GitHub，可沉淀为团队复用能力",
    "导入后建议人工复核触发描述和权限边界",
    rules.defaultStatus || "待复核",
    82,
    text.trim() || "",
    source
  );
}

function parseMcp(text, source) {
  const json = parseJson(text);
  if (json) {
    const name = json.name || json.serverName || repoName(source);
    const command = [json.command, ...(json.args || [])].filter(Boolean).join(" ");
    const ability = json.description || json.summary || "从 GitHub 导入的 MCP 服务。";
    return mcp(name, ability, command || source, inferMcpRisk(`${name} ${ability} ${command}`), json.dependencies || "按仓库说明安装", json.scenario || "项目上下文扩展", source, inferSourceType(source), json.documentation || source, command || source, "导入待复核", json.permissions || json.dependencies || "按仓库说明授权");
  }
  const name = frontmatter(text, "name") || repoName(source);
  const ability = cleanSkillDescription(frontmatter(text, "description") || firstParagraph(text) || "从 GitHub 导入的 MCP 服务。");
  const command = installLine(text) || source;
  return mcp(name, ability, command, inferMcpRisk(`${name} ${ability} ${command}`), "按仓库说明安装", inferMcpUse(`${name} ${ability}`), source, inferSourceType(source), source, command, "导入待复核", "按仓库 README 授权");
}

function upsertSkill(item) {
  item = normalizeSkillRecord(item);
  const index = skills.findIndex((skillItem) => skillItem.name === item.name);
  if (index !== -1) {
    skills[index] = item;
    ensureLibraryCategories();
    return;
  }
  skills.unshift(item);
  ensureLibraryCategories();
}

function skillMarkdown(item) {
  const tags = Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "";
  return `---
name: ${item.name || "unnamed-skill"}
description: ${item.example || item.description || "团队 Skill"}
source: ${item.source || "manual"}
---

# ${item.name || "Skill"}

## 分类
${item.category || "AI 工具链"}

## 标签
${tags}

## 适用模型
${item.model || "按项目选择"}

## 依赖工具
${item.tools || "Filesystem"}

## 安装方式
\`\`\`bash
${item.install || "codex skill install <name>"}
\`\`\`

## 出处
${item.source || "manual"}

## 示例
${item.example || "暂无示例"}

## 优点
${item.pros || "暂无"}

## 限制
${item.cons || "暂无"}
`;
}

function skillSource(name, install = "") {
  const known = {
    "frontend-design": "Codex local skill package: frontend-design",
    "openai-docs": "OpenAI bundled skill: openai-docs",
    "github:gh-fix-ci": "Codex GitHub plugin: gh-fix-ci",
    "documents": "Codex Documents plugin: documents",
    "skill-creator": "OpenAI bundled skill: skill-creator",
    "spreadsheets": "Codex Spreadsheets plugin: spreadsheets"
  };
  return known[name] || install || "manual";
}

function skillMdUrl(name) {
  const known = {
    "frontend-design": "skill-sources/frontend-design/SKILL.md",
    "openai-docs": "skill-sources/openai-docs/SKILL.md",
    "github:gh-fix-ci": "skill-sources/gh-fix-ci/SKILL.md",
    "documents": "skill-sources/documents/SKILL.md",
    "skill-creator": "skill-sources/skill-creator/SKILL.md",
    "spreadsheets": "skill-sources/spreadsheets/SKILL.md"
  };
  return known[name] || "";
}

function builtInSkillMd(name) {
  const cached = cachedSkillMd(name);
  if (cached) return cached;
  if (name !== "frontend-design") return "";
  return `---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes, predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details.

Remember: Codex is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.`;
}

function upsertMcp(item) {
  item = normalizeMcpRecord(item);
  const index = mcps.findIndex((mcpItem) => mcpItem.name === item.name);
  if (index !== -1) {
    mcps[index] = item;
    ensureLibraryCategories();
    return;
  }
  mcps.unshift(item);
  ensureLibraryCategories();
}

function frontmatter(text, key) {
  const match = text.match(new RegExp(`^---[\\s\\S]*?\\n${key}:\\s*["']?([^\\n"']+)["']?[\\s\\S]*?---`, "im"));
  return match?.[1]?.trim() || "";
}

function firstParagraph(text) {
  return text
    .replace(/^---[\s\S]*?---/, "")
    .split(/\n{2,}/)
    .map((part) => cleanSkillDescription(part.replace(/^#+\s*/gm, "").trim()))
    .find((part) => part && !part.startsWith("```") && part.length > 18) || "";
}

function installLine(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^>\s*/, "").replace(/^[-*]\s*/, "").replace(/^`{1,3}|`{1,3}$/g, "").trim())
    .filter(Boolean);
  const commandPattern = /^(?:codex\s+(?:skill\s+install|plugin\s+enable)\b|npx\s+[-@\w./]+|npm\s+(?:i|install|exec|create)\b|pnpm\s+(?:add|dlx|create|exec)\b|yarn\s+(?:add|dlx|create)\b|uvx\s+[-@\w./]+|pip(?:3)?\s+install\b|python(?:3)?\s+-m\s+pip\s+install\b|git\s+clone\s+https?:\/\/)/i;
  return lines.find((line) => commandPattern.test(line)) || "";
}

function normalizeSkillInstall(value, name = "") {
  const command = installLine(String(value || ""));
  if (command) return command;
  const raw = String(value || "").trim();
  if (/^(?:codex\s+(?:skill\s+install|plugin\s+enable)\b|npx\s+|npm\s+|pnpm\s+|yarn\s+|uvx\s+|pip(?:3)?\s+install\b|git\s+clone\s+|python(?:3)?\s+-m\s+pip\s+install\b)/i.test(raw)) return raw;
  return workspaceImportRules().installFallback || "手动导入";
}

function cleanSkillDescription(text) {
  const rules = workspaceImportRules();
  const source = String(text || "");
  const cleaned = (rules.cleanMarkdown === false ? source : source
      .replace(/^---[\s\S]*?---/, "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*|__|[*#>]/g, "")
      .replace(/\[[^\]]*]\([^)]*\)/g, "")
      .replace(/[①②③④⑤⑥⑦⑧⑨⑩]\s*$/g, "")
      .replace(/\b(?:TODO|WIP)\b/gi, ""))
    .replace(/\s+/g, " ")
    .trim();
  const sentence = completeSentence(cleaned);
  return sentence || "从 GitHub 导入的 Skill，需人工补充能力描述。";
}

function completeSentence(text) {
  const maxLength = Math.max(40, Math.min(360, Number(workspaceImportRules().summaryMaxLength) || 120));
  const limited = String(text || "").slice(0, maxLength).trim();
  const end = Math.max(limited.lastIndexOf("。"), limited.lastIndexOf("."), limited.lastIndexOf("！"), limited.lastIndexOf("!"), limited.lastIndexOf("？"), limited.lastIndexOf("?"));
  const candidate = end > 24 ? limited.slice(0, end + 1) : limited;
  return candidate
    .replace(/[：:、,，;；/\\()[\]（【①②③④⑤⑥⑦⑧⑨⑩\s]+$/g, "")
    .trim()
    .replace(/([^。.!！？?])$/, "$1。");
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function repoName(url) {
  return githubRepoName(url) || fallbackFileName(url);
}

function importedSkillName(text, source) {
  const repo = cleanImportedName(githubRepoName(source) || fallbackFileName(source));
  const titleRaw = readmeTitle(text);
  const title = cleanImportedName(titleRaw);
  const candidates = [
    cleanImportedName(frontmatter(text, "name")),
    title && !shouldPreferRepoName(titleRaw) ? title : repo,
    repo
  ].filter(Boolean);
  return candidates.find((name) => !isInvalidImportedName(name)) || "";
}

function readmeTitle(text) {
  const body = String(text || "").replace(/^---[\s\S]*?---/, "");
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || "";
}

function githubRepoName(url = "") {
  const raw = String(url).match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\//i);
  if (raw) return raw[2].replace(/\.git$/i, "");
  const github = String(url).match(/^https:\/\/github\.com\/([^/]+)\/([^/\s#?]+)(?:[/?#].*)?$/i);
  if (github) return github[2].replace(/\.git$/i, "");
  return "";
}

function fallbackFileName(url = "") {
  const parts = String(url).split(/[/?#]/)[0].split("/").filter(Boolean);
  return (parts[parts.length - 1] || "github-import").replace(/\.(md|json|git)$/i, "");
}

function cleanImportedName(name = "") {
  return String(name)
    .replace(/\r?\n/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]*]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[`*_#~>]/g, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*(?:[-|–—]\s*(?:README|Documentation|Docs|文档|官网|Home|Official))$/i, "")
    .replace(/[：:]+$/g, "")
    .trim()
    .slice(0, 48)
    .trim();
}

function shouldPreferRepoName(title = "") {
  const value = String(title || "").trim();
  if (!value) return false;
  if (value.length > 48) return true;
  if (/[.。]$/.test(value)) return true;
  const words = value.match(/[A-Za-z0-9]+/g) || [];
  return words.length > 8;
}

function isInvalidImportedName(name = "") {
  return /^(?:readme|readme\.md|skill|skill\.md)$/i.test(String(name).trim());
}

function cachedSkillMd(name) {
  return globalThis.SKILL_MD_CACHE?.[name] || window.SKILL_MD_CACHE?.[name] || "";
}

function inferTags(text) {
  const lower = text.toLowerCase();
  const tags = [];
  if (lower.includes("react") || lower.includes("frontend") || lower.includes("ui")) tags.push("UI");
  if (lower.includes("ppt") || lower.includes("presentation") || lower.includes("slide") || lower.includes("幻灯片")) tags.push("PPT");
  if (lower.includes("html")) tags.push("HTML");
  if (lower.includes("webgl")) tags.push("WebGL");
  if (lower.includes("openai") || lower.includes("api") || lower.includes("docs")) tags.push("API");
  if (lower.includes("github") || lower.includes("ci") || lower.includes("pr")) tags.push("GitHub");
  if (lower.includes("browser") || lower.includes("playwright")) tags.push("Browser");
  if (lower.includes("mcp")) tags.push("MCP");
  return tags.length ? tags : ["GitHub", "Import"];
}

function inferSkillCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes("frontend") || lower.includes("react") || lower.includes("ui") || lower.includes("design") || lower.includes("webgl") || lower.includes("html") || lower.includes("ppt")) return "设计/前端";
  if (lower.includes("doc") || lower.includes("api") || lower.includes("openai")) return "文档/接口";
  if (lower.includes("github") || lower.includes("ci") || lower.includes("pull request")) return "工程协作";
  if (lower.includes("spreadsheet") || lower.includes("document") || lower.includes("ppt")) return "内容生产";
  return "AI 工具链";
}

function inferTools(text) {
  const tags = inferTags(text);
  return tags.includes("Browser") || tags.includes("HTML") || tags.includes("WebGL") ? "Browser, Filesystem" : tags.includes("GitHub") ? "GitHub, gh" : "Filesystem";
}

function inferMcpRisk(text) {
  const lower = text.toLowerCase();
  if (lower.includes("filesystem") || lower.includes("file write") || lower.includes("token") || lower.includes("secret")) return "高";
  if (lower.includes("github") || lower.includes("auth") || lower.includes("api key") || lower.includes("oauth")) return "中";
  return "低";
}

function inferMcpUse(text) {
  const lower = text.toLowerCase();
  if (lower.includes("github")) return "仓库、PR、Issue 与 CI 协作";
  if (lower.includes("doc") || lower.includes("context")) return "文档检索与上下文补充";
  if (lower.includes("browser")) return "页面测试与交互验收";
  return "项目上下文扩展";
}

function inferMcpCategory(text) {
  const lower = String(text || "").toLowerCase();
  if (lower.includes("context") || lower.includes("doc") || lower.includes("readme") || lower.includes("文档")) return "文档检索";
  if (lower.includes("github") || lower.includes("pr") || lower.includes("issue") || lower.includes("ci")) return "代码协作";
  if (lower.includes("file") || lower.includes("filesystem") || lower.includes("workspace") || lower.includes("文件")) return "文件系统";
  if (lower.includes("browser") || lower.includes("playwright") || lower.includes("页面")) return "浏览器验收";
  if (lower.includes("data") || lower.includes("db") || lower.includes("sql") || lower.includes("数据")) return "数据访问";
  return "自定义";
}

function deleteSkill(name) {
  if (!requirePermission(canDeleteLibrary, "只有管理员可以删除 Skill。")) return;
  const index = skills.findIndex((item) => item.name === name);
  if (index === -1) return;
  const affected = projects.filter((project) => project[2].includes(name)).map((project) => project[0]);
  if (!confirm(`确认删除 Skill「${name}」？\n\n会影响 ${affected.length} 个项目：${affected.join("、") || "无"}。`)) return;
  skills.splice(index, 1);
  projects.forEach((project) => {
    project[2] = project[2].filter((item) => item !== name);
    delete getProjectMeta(project).bindings.skills[name];
    if (!project[2].length && skills[0]) {
      project[2].push(skills[0].name);
      getBindingMeta(project, "skills", skills[0].name);
    }
  });
  persistData();
  showFeedback(`已删除 Skill：${name}`, "warning");
}

function deleteMcp(name) {
  if (!requirePermission(canDeleteLibrary, "只有管理员可以删除 MCP。")) return;
  const index = mcps.findIndex((item) => item.name === name);
  if (index === -1) return;
  const affected = projects.filter((project) => project[3].includes(name)).map((project) => project[0]);
  if (!confirm(`确认删除 MCP「${name}」？\n\n会影响 ${affected.length} 个项目：${affected.join("、") || "无"}。`)) return;
  mcps.splice(index, 1);
  projects.forEach((project) => {
    project[3] = project[3].filter((item) => item !== name);
    delete getProjectMeta(project).bindings.mcps[name];
    if (!project[3].length && mcps[0]) {
      project[3].push(mcps[0].name);
      getBindingMeta(project, "mcps", mcps[0].name);
    }
  });
  persistData();
  showFeedback(`已删除 MCP：${name}`, "warning");
}

function valueOf(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function valueOfEdit(key) {
  return document.querySelector(`[data-project-edit="${key}"]`)?.value.trim() || "";
}

function splitTags(value) {
  return value.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
}

function normalizeRisk(value) {
  return ["低", "中", "高"].includes(value) ? value : "中";
}

function folderName(path) {
  return path.replace(/\\/g, "/").split("/").filter(Boolean).pop() || "导入项目";
}

function nextProjectName() {
  return uniqueProjectName(`新项目 ${projects.length + 1}`);
}

function ensureProjects() {
  if (projects.length) {
    state.project = Math.min(Math.max(state.project, 0), projects.length - 1);
    return false;
  }
  projects.push(["新项目 1", "待配置", defaultProjectSkills(""), defaultProjectMcps(""), templates[0]?.name || "AGENTS.md", "刚刚", "关注", projectMeta()]);
  state.project = 0;
  return true;
}

function finiteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function uniqueProjectName(base) {
  let name = base;
  let index = 2;
  while (projects.some((project) => project[0].toLowerCase() === name.toLowerCase())) {
    name = `${base} ${index}`;
    index += 1;
  }
  return name;
}

function inferProjectType(text) {
  const lower = text.toLowerCase();
  if (lower.includes("package.json") || lower.includes("react") || lower.includes("vite") || lower.includes("next")) return "前端应用";
  if (lower.includes("requirements.txt") || lower.includes("pyproject") || lower.includes(".py")) return "数据/脚本";
  if (lower.includes("plugin.json") || lower.includes("skill.md") || lower.includes("mcp")) return "AI 工具链";
  return "待配置";
}

function defaultProjectSkills(text) {
  const lower = text.toLowerCase();
  if (lower.includes("react") || lower.includes("vite") || lower.includes("next") || lower.includes("package.json")) return ["frontend-design", "openai-docs"].filter((name) => skills.some((item) => item.name === name));
  if (lower.includes("py") || lower.includes("csv") || lower.includes("xlsx")) return ["spreadsheets", "documents"].filter((name) => skills.some((item) => item.name === name));
  return skills[0] ? [skills[0].name] : [];
}

function defaultProjectMcps(text) {
  const lower = text.toLowerCase();
  const names = lower.includes("github") ? ["github", "context7"] : lower.includes("react") || lower.includes("vite") ? ["browser", "context7"] : ["context7"];
  return names.filter((name) => mcps.some((item) => item.name === name));
}

function inferTemplate(text) {
  const lower = text.toLowerCase();
  if (lower.includes("py") || lower.includes("pandas") || lower.includes("csv")) return "Python 数据分析";
  if (lower.includes("plugin") || lower.includes("skill") || lower.includes("mcp")) return "Codex 插件开发";
  return "React SaaS 控制台";
}

function updateProjectBinding(type, value, action) {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能修改项目绑定。")) return;
  const project = projects[state.project];
  if (type === "skills") updateList(project[2], value, action);
  if (type === "mcps") updateList(project[3], value, action);
  if (type === "template" && action === "add") {
    getProjectMeta(project).bindings.template = {};
    project[4] = value;
  }
  if (action === "add") getBindingMeta(project, type, value).enabled = true;
  if (action === "remove") delete getProjectMeta(project).bindings[type]?.[value];
  invalidateProjectRefinement(project);
  recordProjectHistory(project, action === "add" ? "添加绑定" : "移除绑定", `${type}: ${value}`);
  persistData();
  render();
}

function updateBindingMeta(el) {
  if (!canEditWorkspaceData()) return;
  const project = projects[state.project];
  const meta = getBindingMeta(project, el.dataset.bindingMeta, el.dataset.bindingItem);
  const key = el.dataset.bindingKey;
  meta[key] = key === "enabled" ? el.checked : key === "order" ? finiteNumber(el.value, meta.order || 0) : el.value;
  invalidateProjectRefinement(project);
  persistData();
}

function updateList(list, value, action) {
  const index = list.indexOf(value);
  if (action === "add" && index === -1) list.push(value);
  if (action === "remove" && index !== -1) list.splice(index, 1);
}

function hasHighRiskMcp(project) {
  return activeBindings(project, "mcps").some(({ name }) => mcps.find((item) => item.name === name)?.risk === "高");
}

function activeBindings(project, type) {
  const list = type === "skills" ? project[2] : type === "mcps" ? project[3] : project[4] && templates.some((item) => item.name === project[4]) ? [project[4]] : [];
  return list
    .map((name, index) => ({ name, index, meta: getBindingMeta(project, type, name) }))
    .filter((item) => item.meta.enabled !== false)
    .sort((left, right) => (left.meta.order || 0) - (right.meta.order || 0) || left.index - right.index);
}

function disabledBindingCount(project) {
  return ["skills", "mcps", "template"].reduce((total, type) => {
    const list = type === "skills" ? project[2] : type === "mcps" ? project[3] : project[4] ? [project[4]] : [];
    return total + list.filter((name) => getBindingMeta(project, type, name).enabled === false).length;
  }, 0);
}

function highRiskMcpsWithoutNotes(project) {
  return activeBindings(project, "mcps").filter(({ name, meta }) => {
    const item = mcps.find((mcpItem) => mcpItem.name === name);
    return item?.risk === "高" && !String(meta.note || "").trim();
  });
}

function exportWarnings(project) {
  return auditItems(project).filter((item) => item.level !== "pass");
}

function confirmProjectExport(project) {
  const issues = exportWarnings(project);
  const blockers = issues.filter((item) => item.level === "blocker");
  const warnings = issues.filter((item) => item.level === "warning");
  if (blockers.length) {
    alert(`导出被阻断：\n\n${blockers.map((item) => `- ${item.label}：${item.value}`).join("\n")}`);
    return false;
  }
  if (!warnings.length) return true;
  if (workModePolicy().exportWarnings === "skip") return true;
  return confirm(`导出前检查发现警告：\n\n${warnings.map((item) => `- ${item.label}：${item.value}`).join("\n")}\n\n仍然继续导出吗？`);
}

function projectPayload(project) {
  if (!project) {
    ensureProjects();
    project = projects[state.project];
  }
  const meta = normalizeProjectBindings(project);
  return {
    project: project[0],
    type: project[1],
    path: meta.path,
    pathKind: meta.pathKind,
    connected: meta.connected,
    scannedAt: meta.scannedAt,
    scanError: meta.scanError,
    agentsFound: meta.agentsFound,
    refinedAt: meta.refinedAt,
    hasRefinedAgents: Boolean(meta.refinedAgents),
    detectedFiles: meta.detectedFiles,
    profile: meta.profile,
    brief: meta.brief,
    skills: project[2],
    mcps: project[3],
    activeSkills: activeBindings(project, "skills").map((item) => item.name),
    activeMcps: activeBindings(project, "mcps").map((item) => item.name),
    agentsTemplate: project[4],
    status: project[6],
    statusTag: meta.statusTag,
    version: meta.version,
    owner: meta.owner,
    scope: meta.scope,
    enabled: meta.enabled,
    sort: meta.sort,
    notes: meta.notes,
    recommendationLog: meta.recommendationLog,
    history: meta.history,
    bindings: meta.bindings,
    install: installCommand(project),
    mcpConfig: mcpConfigSummary(project),
    agentsMd: projectGeneratedAgents(project)
  };
}

function normalizeProjectBindings(project) {
  const meta = getProjectMeta(project);
  project[2].forEach((name) => getBindingMeta(project, "skills", name));
  project[3].forEach((name) => getBindingMeta(project, "mcps", name));
  if (project[4]) getBindingMeta(project, "template", project[4]);
  Object.keys(meta.bindings.skills).forEach((name) => { if (!project[2].includes(name)) delete meta.bindings.skills[name]; });
  Object.keys(meta.bindings.mcps).forEach((name) => { if (!project[3].includes(name)) delete meta.bindings.mcps[name]; });
  Object.keys(meta.bindings.template).forEach((name) => { if (name !== project[4]) delete meta.bindings.template[name]; });
  return meta;
}

function installCommand(project) {
  const pluginNames = new Set(activeBindings(project, "mcps").map((item) => item.name).filter((item) => ["github", "browser"].includes(item)));
  const skillParts = activeBindings(project, "skills")
    .map(({ name }) => skills.find((item) => item.name === name)?.install)
    .filter(Boolean)
    .filter((command) => {
      const pluginMatch = command.match(/^codex\s+plugin\s+enable\s+(.+)$/i);
      if (!pluginMatch) return true;
      pluginMatch[1].split(/\s+/).filter(Boolean).forEach((name) => pluginNames.add(name));
      return false;
    });
  const pluginPart = pluginNames.size ? `codex plugin enable ${[...pluginNames].join(" ")}` : "";
  const mcpParts = mcpConfigLines(project);
  return unique([...skillParts, pluginPart, ...mcpParts].filter(Boolean)).join(" && ");
}

function mcpConfigLines(project) {
  return activeBindings(project, "mcps")
    .map(({ name }) => mcps.find((item) => item.name === name))
    .filter((item) => item && !["github", "browser"].includes(item.name))
    .map((item) => item.config)
    .filter(isCommandLike)
    .filter(Boolean);
}

function mcpConfigSummary(project) {
  return activeBindings(project, "mcps")
    .map(({ name, meta }) => {
      const item = mcps.find((mcpItem) => mcpItem.name === name);
      return item ? { ...item, note: meta.note || "" } : null;
    })
    .filter(Boolean)
    .map((item) => {
      const normalized = normalizeMcpRecord(item);
      return {
        name: normalized.name,
        config: normalized.config,
        risk: normalized.risk,
        deps: normalized.deps,
        use: normalized.use,
        source: normalized.source,
        sourceType: normalized.sourceType,
        docs: normalized.docs,
        installSource: normalized.installSource,
        verified: normalized.verified,
        permissions: normalized.permissions,
        note: item.note
      };
    });
}

function projectAgents(project) {
  if (!project) return "# AGENTS.md\n\n## 项目画像\n- 项目未选择，请先在项目管理页创建或选择项目。";
  const meta = getProjectMeta(project);
  const profile = meta.profile || {};
  const brief = meta.brief || {};
  const templateRules = meta.templateRulesEnabled ? currentTemplateRulesBody(project) : "";
  const templateBlock = templateRules ? `\n## 模板基础规则\n当前项目使用模板：${project[4] || "自定义模板"}\n\n${templateRules.trim()}\n` : "";
  const workspaceBlock = workspaceGuidance();
  const skillLines = activeBindings(project, "skills").map(({ name, meta: binding }) => {
    const item = skills.find((skillItem) => skillItem.name === name);
    return `- ${name}: ${item?.example || item?.pros || "按项目需要使用"}。${binding.note ? `备注：${binding.note}。` : ""}`;
  }).join("\n") || "- 暂无绑定 Skill。";
  const mcpLines = activeBindings(project, "mcps").map(({ name, meta: binding }) => {
    const item = normalizeMcpRecord(mcps.find((mcpItem) => mcpItem.name === name) || { name });
    return `- ${name}: ${item.ability || "项目上下文工具"}；风险：${item.risk || "中"}；来源：${item.sourceType}（${item.source}）；最近核验：${item.verified}；权限说明：${item.permissions || item.deps || "按需授权"}。${binding.note ? `备注：${binding.note}。` : ""}`;
  }).join("\n") || "- 暂无绑定 MCP。";
  const keyFiles = (profile.keyFiles || meta.detectedFiles || []).slice(0, 12).map((file) => `- ${file}`).join("\n") || "- 未扫描关键文件。";
  return `# AGENTS.md

## 项目画像
- 项目名：${project[0]}
- 项目类型：${project[1]}
- ${projectPathFieldLabel(meta)}：${meta.path || "未连接"}
- 扫描状态：${scanStatusText(meta)}（${scanTimeLabel(meta)}）
- 技术栈：${(profile.stack || []).join(", ") || "待识别"}
- 包名：${profile.packageName || "未读取"}
${templateBlock}

## 项目简介
- 项目用途：${brief.purpose || "待补充。"}
- 主要用户 / 场景：${brief.users || "待补充。"}
- 核心功能：${brief.features || "待补充。"}
- AI 适合参与：${brief.aiTasks || "待补充。"}
- 不适合自动化：${brief.avoidTasks || "待补充。"}
- 权限和风险边界：${brief.risks || "待补充。"}
- 简介状态：${brief.confirmed ? "用户已确认" : "AI/扫描初版，待用户确认"}

## 关键文件
${keyFiles}

## 推荐使用 Skills
${skillLines}

## 可用工具 / MCP 权限边界
${mcpLines}

## 工作规则
- 遵循工作区偏好：${workspaceBlock.replace(/\n/g, "；")}。
- 修改前先阅读现有代码结构、README、配置文件和本 AGENTS.md。
- 使用高风险 MCP 前先说明权限边界和需要访问的数据范围。
- API Key、Token 和本地凭据只能通过环境变量、本地安全配置或后端代理读取。
- 前端变更后进行浏览器验收；数据/文档变更后保留可复核的导出产物。

## 项目备注
${meta.notes || "暂无备注。"}`;
}

function isCommandLike(text) {
  return /^(npx|npm|pnpm|yarn|uvx|python|node|codex)\b/i.test(String(text).trim());
}

async function fetchModels() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能更新模型配置。")) return;
  if (!canCallModel()) {
    state.ai.status = "请先配置本地代理；或填写远端 Endpoint + API Key。";
    render();
    return;
  }
  state.ai.modelsLoading = true;
  state.ai.status = "正在拉取模型列表...";
  render();
  try {
    const response = await fetch(modelsEndpoint(), {
      method: "GET",
      headers: requestHeaders()
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${(await response.text()).slice(0, 180)}`);
    }
    const data = await response.json();
    const rawModels = getByPath(data, state.ai.modelsPath || "data") || data.models || data;
    const models = normalizeModels(rawModels);
    if (!models.length) throw new Error("响应里没有识别到模型列表。");
    state.ai.models = models;
    if (!models.includes(state.ai.model)) state.ai.model = models[0];
    state.ai.status = `已拉取 ${models.length} 个模型，当前使用 ${state.ai.model}。`;
    markWorkspaceSaved();
  } catch (error) {
    state.ai.status = `模型拉取失败：${error.message}`;
  } finally {
    state.ai.modelsLoading = false;
    render();
  }
}

function normalizeModels(rawModels) {
  if (!Array.isArray(rawModels)) return [];
  return rawModels
    .map((item) => typeof item === "string" ? item : item.id || item.name || item.model)
    .filter(Boolean)
    .sort();
}

async function optimizePrompt() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能优化提示词。")) return;
  const input = state.promptOptimizer.input.trim();
  if (!input) {
    state.promptOptimizer.status = "请先输入需要优化的提示词。";
    render();
    return;
  }
  if (!canCallModel()) {
    state.promptOptimizer.status = "请先在 AI 设置中配置模型调用。";
    render();
    return;
  }
  state.promptOptimizer.loading = true;
  state.promptOptimizer.status = "正在调用 AI 优化提示词...";
  render();
  try {
    const prompt = promptOptimizationPrompt(input);
    const system = "你是提示词工程专家。只输出优化后的提示词正文，不要解释，不要使用代码块。";
    const response = state.ai.mode === "custom" ? await customModelRequest(prompt) : await compatibleModelRequest(prompt, system);
    if (!response.ok) throw new Error(`${response.status} ${(await response.text()).slice(0, 180)}`);
    const data = await response.json();
    const content = getByPath(data, state.ai.mode === "custom" ? state.ai.responsePath : "choices.0.message.content") || data.output_text || data.text || "";
    state.promptOptimizer.output = String(content || "").trim();
    state.promptOptimizer.status = state.promptOptimizer.output ? "已生成优化结果。" : "模型返回为空，请检查响应文本路径。";
  } catch (error) {
    state.promptOptimizer.status = `优化失败：${error.message}`;
  } finally {
    state.promptOptimizer.loading = false;
    render();
  }
}

function promptOptimizationPrompt(input) {
  return `请优化下面的提示词，使其更适合交给 AI 执行。

要求：
- 保留用户原始意图，不添加无关需求。
- 明确任务目标、必要上下文、输入材料、输出格式和质量标准。
- 如果原提示词缺少关键信息，用“待补充：...”列出，不要编造。
- 输出应为可直接复制使用的完整提示词。
- 使用工作区默认语言：${state.workspace.identity.language || "中文"}。
- 适配工作模式：${currentWorkMode()}。

原始提示词：
${input}`;
}

async function sendDashboardChat() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能发送 AI 问答。")) return;
  const input = state.dashboardChat.input.trim();
  if (!input) {
    state.dashboardChat.status = "请先输入问题。";
    render();
    return;
  }
  if (!canCallModel()) {
    state.dashboardChat.status = "请先到工作区设置配置 AI Endpoint、模型和必要的 Key。";
    render();
    return;
  }
  state.dashboardChat.messages.push({ role: "user", content: input });
  state.dashboardChat.input = "";
  state.dashboardChat.loading = true;
  state.dashboardChat.status = `正在使用 ${state.ai.model || "当前模型"} 回答...`;
  render();
  try {
    const prompt = dashboardChatPrompt(input);
    const system = "你是 Skill/MCP 工作区的产品与工程助手。回答要简洁、可执行，优先基于用户当前工作区数据，不要声称访问了真实后端或云端权限。";
    const response = state.ai.mode === "custom" ? await customModelRequest(prompt) : await compatibleModelRequest(prompt, system);
    if (!response.ok) throw new Error(`${response.status} ${(await response.text()).slice(0, 180)}`);
    const data = await response.json();
    const content = getByPath(data, state.ai.mode === "custom" ? state.ai.responsePath : "choices.0.message.content") || data.output_text || data.text || "";
    state.dashboardChat.messages.push({ role: "assistant", content: String(content || "").trim() || "模型返回为空，请检查响应路径或模型配置。" });
    state.dashboardChat.messages = state.dashboardChat.messages.slice(-12);
    state.dashboardChat.status = "已回答。";
  } catch (error) {
    state.dashboardChat.messages.push({ role: "assistant", content: `调用失败：${error.message}` });
    state.dashboardChat.status = "调用失败，请检查 AI 配置。";
  } finally {
    state.dashboardChat.loading = false;
    render();
  }
}

function dashboardChatPrompt(input) {
  return `请回答用户关于当前 Skill/MCP 管理工作区的问题。

工作区概况：
- 项目数：${projects.length}
- Skill 数：${skills.length}
- MCP 数：${mcps.length}
- 当前项目：${projects[state.project]?.[0] || "未选择"}
- 当前模型：${state.ai.model || "未设置"}
- 工作模式：${currentWorkMode()}

最近项目：
${projects.slice(0, 5).map((project) => `- ${project[0]}｜${project[1]}｜${getProjectMeta(project).statusTag}`).join("\n")}

用户问题：
${input}`;
}

function chatCompletionsEndpoint() {
  const base = activeEndpoint();
  if (state.ai.mode === "custom") return base;
  return chatEndpointFrom(base);
}

function modelsEndpoint() {
  if (state.ai.proxyEndpoint) {
    const base = state.ai.proxyEndpoint.trim();
    return modelsEndpointFrom(base);
  }
  if (state.ai.modelsEndpoint) return modelsEndpointFrom(state.ai.modelsEndpoint);
  const base = activeEndpoint();
  return modelsEndpointFrom(base);
}

function activeEndpoint() {
  return (state.ai.proxyEndpoint || state.ai.endpoint || "").trim();
}

function chatEndpointFrom(url) {
  const clean = String(url || "").trim().replace(/\/$/, "");
  if (!clean) return "";
  if (/\/chat\/completions(?:[?#].*)?$/i.test(clean)) return clean;
  if (/\/v1$/i.test(clean)) return `${clean}/chat/completions`;
  return state.ai.fullUrl ? clean : `${clean}/chat/completions`;
}

function modelsEndpointFrom(url) {
  const clean = String(url || "").trim().replace(/\/$/, "");
  if (!clean) return "";
  if (/\/models(?:[?#].*)?$/i.test(clean)) return clean;
  if (/\/v1$/i.test(clean)) return `${clean}/models`;
  return state.ai.fullUrl ? clean : `${clean}/models`;
}

function canCallModel() {
  if (state.ai.proxyEndpoint) return Boolean(isLocalProxyEndpoint() || state.ai.key || state.ai.allowBrowserKey);
  return Boolean(state.ai.key && state.ai.endpoint);
}

function requestHeaders(extra = {}) {
  const headers = { "Content-Type": "application/json", ...extra };
  if (shouldSendAuthorization()) headers.Authorization = `Bearer ${state.ai.key}`;
  return headers;
}

function shouldSendAuthorization() {
  if (!state.ai.key) return false;
  if (!state.ai.proxyEndpoint) return true;
  return state.ai.allowBrowserKey || !isLocalProxyEndpoint();
}

function isLocalProxyEndpoint() {
  const endpoint = String(state.ai.proxyEndpoint || "").trim();
  if (!endpoint) return false;
  try {
    const url = new URL(endpoint);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return /^(?:https?:\/\/)?(?:localhost|127\.0\.0\.1|\[?::1\]?)(?::|\/|$)/i.test(endpoint);
  }
}

function compatibleModelRequest(prompt = "", system = "你是资深工程管理助手，只输出可直接保存的 AGENTS.md Markdown 内容。") {
  return fetch(chatCompletionsEndpoint(), {
    method: "POST",
    headers: requestHeaders(),
    body: JSON.stringify({
      model: state.ai.model,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ]
    })
  });
}

function customModelRequest(prompt = "") {
  const headersText = fillTemplate(state.ai.headers, prompt);
  const bodyText = fillTemplate(state.ai.body, prompt);
  let headers;
  let body;
  try {
    headers = JSON.parse(headersText);
    body = JSON.parse(bodyText);
  } catch (error) {
    throw new Error(`自定义 Headers 或 Body 不是合法 JSON：${error.message}`);
  }
  const outgoingHeaders = state.ai.proxyEndpoint && isLocalProxyEndpoint() && !state.ai.allowBrowserKey
    ? requestHeaders(stripAuthorization(headers))
    : requestHeaders(headers);
  return fetch(activeEndpoint(), {
    method: state.ai.method || "POST",
    headers: outgoingHeaders,
    body: JSON.stringify(body)
  });
}

function stripAuthorization(headers) {
  const next = { ...headers };
  delete next.Authorization;
  delete next.authorization;
  return next;
}

function fillTemplate(text, prompt = "") {
  const values = {
    apiKey: state.ai.key,
    model: state.ai.model,
    prompt
  };
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = values[key] ?? "";
    return JSON.stringify(value).slice(1, -1);
  });
}

function stripJsonFence(text) {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

function getByPath(data, path) {
  if (!path) return "";
  return path.split(".").reduce((current, part) => {
    if (current == null) return undefined;
    return current[part];
  }, data);
}

function exportContent(name) {
  const current = projects[state.project] || projects[0];
  if (name.endsWith("_AGENTS.md") || name.endsWith(".md")) return { type: "text/markdown", text: projectGeneratedAgents(current) };
  if (name.endsWith("_project-profile.json")) {
    const payload = projectPayload(current);
    persistData();
    return { type: "application/json", text: JSON.stringify(payload, null, 2) };
  }
  if (name.endsWith("_mcp-config.json")) return { type: "application/json", text: JSON.stringify(mcpConfigSummary(current), null, 2) };
  if (name.endsWith(".json")) {
    const payload = { skills, mcps, templates, projects: projects.map(projectPayload) };
    persistData();
    return { type: "application/json", text: JSON.stringify(payload, null, 2) };
  }
  if (name.endsWith(".sh")) return { type: "text/plain", text: `${installCommand(current) || "# 当前项目没有可生成的安装命令"}\n` };
  return { type: "application/json", text: JSON.stringify(projects.map(projectPayload), null, 2) };
}

function downloadFile(name) {
  const current = projects[state.project] || projects[0];
  if (!confirmProjectExport(current)) return;
  const content = exportContent(name);
  saveTextFile(name, content.text, content.type);
  recordProjectHistory(current, "下载导出文件", name);
  persistData();
}

function saveTextFile(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportBackup() {
  if (canEditWorkspaceData()) state.workspace.data.lastBackupAt = currentTimestamp();
  const payload = storagePayload();
  const stamp = new Date().toISOString().slice(0, 10);
  saveTextFile(`orchestra-os-backup-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json");
  state.backup.status = "已导出全部本地配置包。API Key 不会被写入备份。";
  if (canEditWorkspaceData()) persistData();
  render();
}

async function importBackup(event) {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能导入配置包。")) {
    event.target.value = "";
    return;
  }
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    validateStoragePayload(payload);
    if (!confirm(importBackupSummary(payload))) {
      state.backup.status = "已取消导入，未修改本地数据。";
      return;
    }
    applyStoragePayload(payload);
    persistData();
    state.backup.status = `已导入配置包：${file.name}`;
    state.page = "settings";
  } catch (error) {
    state.backup.status = `导入失败：${error.message}`;
  } finally {
    event.target.value = "";
    render();
  }
}

function importBackupSummary(payload) {
  return `即将导入配置包：
- Schema: ${payload.schema || "旧版/未记录"}
- 导出时间: ${payload.exportedAt || "未记录"}
- Skill: ${Array.isArray(payload.skills) ? payload.skills.length : 0} 个
- MCP: ${Array.isArray(payload.mcps) ? payload.mcps.length : 0} 个
- 模板: ${Array.isArray(payload.templates) ? payload.templates.length : 0} 个
- 项目: ${Array.isArray(payload.projects) ? payload.projects.length : 0} 个
- 包含工作区设置：${payload.workspace ? "是" : "否"}
- 包含 AI 配置: ${payload.ai ? "是" : "否"}
- 包含导入历史: ${payload.importer?.history?.length ? "是" : "否"}

导入会覆盖当前本地库和项目配置，API Key 不会导入。
是否继续？`;
}

function repairLocalStorage() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能修复本地存储。")) return;
  if (!confirm("确认用当前页面状态覆盖浏览器本地存储？\n\n这不会删除当前页面已加载的数据，用于修复刷新后反复读取失败的损坏 localStorage。")) return;
  markWorkspaceSaved();
  state.backup.status = "已用当前页面状态修复本地存储。";
  render();
}

function resetDemoData() {
  if (!requirePermission(canEditWorkspaceData, "只读角色不能重置示例库。")) return;
  if (!confirm("确认重置示例库？\n\n只会覆盖当前 Skill、MCP、模板和项目示例，不会清空工作区身份、外观和 AI 设置。建议先导出备份。")) return;
  const defaults = JSON.parse(JSON.stringify(DEFAULT_DATA));
  replaceArray(skills, defaults.skills.map(normalizeSkillRecord));
  replaceArray(mcps, defaults.mcps.map(normalizeMcpRecord));
  replaceArray(skillCategories, defaults.skillCategories);
  replaceArray(mcpCategories, defaults.mcpCategories);
  replaceArray(templates, defaults.templates);
  replaceArray(projects, defaults.projects);
  ensureLibraryCategories();
  projects.forEach(getProjectMeta);
  state.project = 0;
  state.importer.history = [];
  state.recommendations = { loading: false, status: "", projectIndex: -1, skills: [], mcps: [], external: [] };
  state.backup.status = "已重置示例库。工作区身份、外观和 AI 设置已保留。";
  persistData();
  render();
}

loadAuthSession();
if (state.auth.current) restoreData();
ensureLibraryCategories();
render();
