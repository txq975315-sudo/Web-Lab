# Thinking Lab（思维训练工作台）

本地优先的 React + Vite 单页应用：项目树与对话数据保存在浏览器 **localStorage**，AI 能力采用 **自备 API Key（BYOK）**，密钥仅保存在本机，详见应用内「设置」说明。

## 环境要求

- **Node.js** ≥ 18（推荐使用 `.nvmrc` 中的版本：`nvm use`）
- 包管理器：**npm**（仓库以 `package-lock.json` 作为锁文件）

## 安装与常用命令

```bash
npm install
npm run dev      # 开发：http://localhost:5173
npm run build    # 生产构建 → dist/
npm run preview  # 本地预览构建结果
npm run test     # 单元测试（Vitest）
```

若安装依赖失败，请检查网络、镜像或本机 **npm 代理** 配置（勿将仅适用于你机器的 `proxy` 写入仓库）。

## API 与跨域说明

- 请在 **设置** 中自行填写 OpenRouter、DeepSeek 等服务商的 API Key。
- **本地开发** 时，Vite 将 `/api/deepseek` 代理到 DeepSeek 官方接口，避免开发环境下的跨域问题。
- **静态部署**（如 GitHub Pages）无内置代理：若所选服务商不允许浏览器直连（CORS），需改用支持前端直连的网关（如 OpenRouter），或自行部署与服务端/边缘函数转发；请勿把需要保密的**你的**密钥写进前端代码仓库。

## GitHub Pages 自动部署（本仓库：小白步骤）

本仓库已包含工作流 **`.github/workflows/deploy-pages.yml`**：推送代码到 **`main`** 或 **`master`** 分支后，GitHub 会自动构建并发布站点。

**你的线上地址（仓库名 `Web-Lab`）：**

**https://txq975315-sudo.github.io/Web-Lab/**

### 第一次使用前你在网页上要做的（只需一次）

1. **把本地代码推到 GitHub**  
   在项目文件夹打开终端，依次执行（若从未配置过 Git 用户名/邮箱，先按 GitHub 文档完成登录）：
   ```bash
   git status
   git add .
   git commit -m "chore: add Pages deploy workflow"
   git branch -M main
   git remote add origin https://github.com/txq975315-sudo/Web-Lab.git
   ```
   若已存在 `origin`，改用：`git remote set-url origin https://github.com/txq975315-sudo/Web-Lab.git`  
   然后：`git push -u origin main`  
   （若 GitHub 默认分支是 `master`，把上面两处 `main` 改成 `master`。）

2. **打开仓库设置启用 Pages**  
   浏览器打开：`https://github.com/txq975315-sudo/Web-Lab/settings/pages`  
   - **Build and deployment → Source**：选 **GitHub Actions**（不要选「Deploy from a branch」的旧方式）。  
   - 保存后，回到 **Actions** 标签页，确认 **Deploy GitHub Pages** 工作流已成功跑完（绿勾）。

3. **等待几分钟**，用浏览器打开：**https://txq975315-sudo.github.io/Web-Lab/**  
   若 404，再等 1～2 分钟或刷新 **Actions** 里最近一次部署是否失败。

### 以后更新网站要做什么？

只需像平常一样 **`git add` → `commit` → `push`**，GitHub 会自动重新构建并更新线上页面。**不需要**每次手动改部署配置。

### 若你改了 GitHub 上的仓库名

请同步修改 **`.github/workflows/deploy-pages.yml`** 里的环境变量 **`VITE_BASE:/xxx/`**（路径必须与 **`https://用户名.github.io/仓库名/`** 里的仓库名一致），否则会出现白屏或静态资源 404。

### 本地开发与线上的区别

| 场景 | 用法 |
|------|------|
| 本机改代码 | `npm run dev` → `http://localhost:5173`（无需 `VITE_BASE`） |
| 线上正式访问 | 打开上面的 **github.io** 链接，**不必**开终端 |

构建脚本里已为 Pages 设置 **`VITE_BASE=/Web-Lab/`**；若仅在本机用 **`npm run build`** 想模拟线上路径，可执行：  
`set VITE_BASE=/Web-Lab/&& npm run build`（PowerShell）或先阅读下方通用说明。

## 数据备份

应用支持在「设置」中导出/导入工作台 JSON；跨浏览器或 Trae 预览与本地 Chrome 的存储相互隔离属正常现象。

## 许可证

私有项目或未指定许可证时，请勿擅自对外再分发；如需开源请补充 `LICENSE`。
