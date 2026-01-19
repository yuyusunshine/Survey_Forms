# Azure Static Web Apps 部署指南

本指南将帮助您将前端应用部署到 Azure Static Web Apps。

## 前提条件

- Azure 账户
- GitHub 账户
- 代码已推送到 GitHub 仓库

## 代码修改说明

为了支持 Azure Static Web Apps 部署，已进行以下修改：

### 1. 环境变量配置

- **新增文件**: `frontend/.env.example` - 环境变量模板
- **新增文件**: `frontend/.env.development` - 开发环境配置
- **新增文件**: `frontend/src/config.js` - API 配置模块

### 2. Vite 配置优化

- 更新 `frontend/vite.config.js` 添加构建优化配置
- 配置代码分割以优化加载性能

### 3. API 调用更新

所有前端页面已更新为使用配置化的 API URL：
- `PartnerForm.jsx`
- `AdminDashboard.jsx`
- `CreateSurvey.jsx`
- `SubmissionsList.jsx`

### 4. Azure Static Web Apps 配置

- **新增文件**: `frontend/staticwebapp.config.json` - Static Web Apps 路由和配置
- **新增文件**: `.github/workflows/azure-static-web-apps.yml` - GitHub Actions 部署工作流

## 部署步骤

### 步骤 1: 创建 Azure Static Web Apps 资源

1. 登录 [Azure Portal](https://portal.azure.com)
2. 点击 "创建资源"
3. 搜索 "Static Web Apps"
4. 点击 "创建"
5. 填写以下信息：
   - **订阅**: 选择您的订阅
   - **资源组**: 创建新的或选择现有的资源组
   - **名称**: 输入应用名称（如 `survey-forms-frontend`）
   - **计划类型**: 选择 "免费" 或 "标准"
   - **区域**: 选择最近的区域
   - **部署详细信息**:
     - 源: GitHub
     - 组织: 您的 GitHub 用户名
     - 存储库: 您的存储库名称
     - 分支: main

6. 在 "构建详细信息" 部分：
   - **构建预设**: 选择 "React"
   - **应用位置**: `/frontend`
   - **API 位置**: 留空（后端单独部署）
   - **输出位置**: `dist`

7. 点击 "查看 + 创建"，然后点击 "创建"

### 步骤 2: 配置 GitHub Secrets

Azure 会自动创建 GitHub Actions 工作流文件，但我们已经提供了优化版本。

1. 在 Azure Portal 中，找到刚创建的 Static Web Apps 资源
2. 在左侧菜单中点击 "概述"
3. 点击 "管理部署令牌"，复制令牌

4. 前往 GitHub 仓库：
   - Settings > Secrets and variables > Actions
   - 点击 "New repository secret"
   - 名称: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - 值: 粘贴刚复制的令牌
   - 点击 "Add secret"

### 步骤 3: 配置后端 API URL

1. 在 GitHub 仓库的 Secrets 中，再添加一个 secret：
   - 名称: `VITE_API_BASE_URL`
   - 值: 您的后端 API URL（如 `https://your-backend.azurewebsites.net`）
   - 点击 "Add secret"

### 步骤 4: 推送代码触发部署

1. 确保所有更改都已提交：
   ```bash
   git add .
   git commit -m "Configure for Azure Static Web Apps deployment"
   git push origin main
   ```

2. GitHub Actions 会自动触发部署
3. 在 GitHub 仓库的 "Actions" 标签页查看部署进度

### 步骤 5: 验证部署

1. 部署完成后，在 Azure Portal 中找到 Static Web Apps 资源
2. 点击 "URL" 访问您的应用
3. 测试表单提交和管理功能

## 本地开发

### 开发模式

```bash
cd frontend
npm install
npm run dev
```

开发模式下使用 Vite 代理，API 请求会自动转发到 `http://localhost:3000`

### 生产构建测试

```bash
cd frontend
npm run build
npm run preview
```

预览模式会模拟生产环境，但需要确保设置了正确的环境变量。

## 环境变量配置

### 本地开发

创建 `frontend/.env.local` 文件（不要提交到 Git）：

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 生产环境

在 Azure Static Web Apps 中配置环境变量：

1. 在 Azure Portal 中打开 Static Web Apps 资源
2. 左侧菜单选择 "配置"
3. 点击 "应用程序设置"
4. 添加设置：
   - 名称: `VITE_API_BASE_URL`
   - 值: 您的后端 API URL

## 后端部署

后端需要单独部署到 Azure App Service 或 Azure Functions。参考以下步骤：

### 选项 1: Azure App Service

1. 创建 Azure App Service (Node.js)
2. 配置环境变量
3. 通过 GitHub Actions 或 Azure CLI 部署

详细步骤请参考 [AZURE_DEPLOYMENT.md](../AZURE_DEPLOYMENT.md)

### 选项 2: Azure Functions (推荐)

使用 Azure Functions 可以降低成本并提高可扩展性。

## CORS 配置

确保后端正确配置 CORS，允许来自 Static Web Apps 域的请求：

```javascript
// backend/server.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.azurestaticapps.net'
  ],
  credentials: true
}));
```

## 自定义域名（可选）

1. 在 Azure Portal 的 Static Web Apps 资源中
2. 左侧菜单选择 "自定义域"
3. 点击 "添加"
4. 按照说明配置您的域名

## 故障排除

### 部署失败

- 检查 GitHub Actions 日志
- 确认 API token 正确设置
- 验证 `staticwebapp.config.json` 配置正确

### API 调用失败

- 检查 `VITE_API_BASE_URL` 是否正确设置
- 确认后端 CORS 配置正确
- 检查后端服务是否正常运行

### 路由问题

- 确保 `staticwebapp.config.json` 中的路由配置正确
- 检查 `navigationFallback` 设置

## 监控和日志

1. 在 Azure Portal 中打开 Static Web Apps 资源
2. 查看 "监视" 部分的指标
3. 使用 Application Insights 进行详细监控（需额外配置）

## 成本估算

- **免费层**: 适合开发和小型项目
  - 100 GB 带宽/月
  - 2 个自定义域
  - 无 SLA

- **标准层**: 适合生产环境
  - 100 GB 带宽/月（超出部分按量计费）
  - 5 个自定义域
  - 99.95% SLA

## 更多资源

- [Azure Static Web Apps 文档](https://docs.microsoft.com/azure/static-web-apps/)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions 文档](https://docs.github.com/actions)

## 支持

如有问题，请查阅项目 README 或提交 Issue。
