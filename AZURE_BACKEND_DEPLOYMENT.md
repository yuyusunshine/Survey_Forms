# Azure 后端 API 部署指南

## 概述

本指南介绍如何将 Survey Forms 后端 API 部署到 Azure App Service。提供两种部署方式：
- **方式一：Azure Portal GUI（推荐新手）** - 图形界面操作，简单直观
- **方式二：Azure CLI** - 命令行操作，适合自动化

## 前提条件

- Azure 账户（[免费注册](https://azure.microsoft.com/free/)）
- 已部署 Azure PostgreSQL 数据库（参考 [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)）
- 项目代码已上传到 GitHub（可选，用于 CI/CD）

---

## 方式一：通过 Azure Portal GUI 部署（推荐）

### 步骤 1：创建 App Service

1. **登录 Azure Portal**
   - 访问：https://portal.azure.com
   - 使用您的 Azure 账户登录

2. **创建 Web 应用**
   - 点击左上角 "**创建资源**" 或 "**+ Create a resource**"
   - 搜索 "**Web App**" 并选择
   - 点击 "**创建**" 按钮

3. **配置基本信息**
   
   **项目详细信息：**
   - **订阅**：选择您的订阅
   - **资源组**：
     - 选择现有的 `survey-forms-rg`
     - 或点击 "新建" 创建新的资源组
   
   **实例详细信息：**
   - **名称**：`survey-forms-backend`（必须全局唯一，如已被占用请加后缀）
   - **发布**：选择 "**代码**"
   - **运行时堆栈**：选择 "**Node 20 LTS**" 或 "**Node 22 LTS**"（推荐最新版本）
   - **操作系统**：选择 "**Linux**"
   - **区域**：选择 "**East Asia**"（或您附近的区域）
   
   **应用服务计划：**
   - 点击 "**新建**" 创建新计划
   - 名称：`survey-forms-plan`
   - **定价计划**：点击 "更改大小"
     - 开发/测试环境：选择 "**B1**"（约 ¥70/月）
     - 生产环境：选择 "**P1V2**" 或更高
   
4. **部署设置（可选）**
   - 暂时跳过，稍后配置 GitHub Actions

5. **网络、监视、标记**
   - 使用默认设置即可

6. **查看 + 创建**
   - 检查配置信息
   - 点击 "**创建**" 按钮
   - 等待 1-2 分钟完成部署

### 步骤 2：配置环境变量

1. **打开已创建的 App Service**
   - 部署完成后，点击 "**转到资源**"
   - 或在搜索栏搜索 `survey-forms-backend`

2. **设置应用程序配置**
   - 在左侧菜单找到 "**配置**" (Settings → Configuration)
   - 点击 "**应用程序设置**" 选项卡
   - 点击 "**+ 新建应用程序设置**" 添加以下环境变量：

   | 名称 | 值 | 说明 |
   |------|-----|------|
   | `DB_HOST` | `your-db.postgres.database.azure.com` | PostgreSQL 服务器地址 |
   | `DB_PORT` | `5432` | 数据库端口 |
   | `DB_NAME` | `survey_forms` | 数据库名称 |
   | `DB_USER` | `adminuser` | 数据库用户名 |
   | `DB_PASSWORD` | `your-password` | 数据库密码 |
   | `PORT` | `8080` | 应用端口（固定值） |
   | `NODE_ENV` | `production` | Node.js 环境 |

3. **保存配置**
   - 点击顶部 "**保存**" 按钮
   - 点击 "**继续**" 确认（应用会自动重启）

### 步骤 3：配置启动命令

1. **常规设置**
   - 在 "配置" 页面，点击 "**常规设置**" 选项卡
   - 找到 "**启动命令**" (Startup Command)
   - 输入：`npm start`
   - 点击 "**保存**"

### 步骤 4：部署代码

#### 选项 A：从 GitHub 部署（推荐）

1. **配置部署中心**
   - 在左侧菜单找到 "**部署中心**" (Deployment → Deployment Center)
   - **源**：选择 "**GitHub**"
   - 点击 "**授权**" 按钮授权 Azure 访问 GitHub
   - 登录您的 GitHub 账户并授权

2. **配置存储库**
   - **组织**：选择您的 GitHub 用户名
   - **存储库**：选择 `Survey_Forms`
   - **分支**：选择 `main`

3. **构建配置**
   - 选择 "**GitHub Actions**"（推荐）
   - 点击 "**保存**"

4. **自动生成工作流**
   - Azure 会自动在您的 GitHub 仓库创建 `.github/workflows` 文件
   - 每次推送代码到 `main` 分支时自动部署

5. **编辑工作流（重要）**
   - 由于后端代码在 `backend/` 子目录，需要修改工作流文件
   - 去 GitHub 仓库编辑 `.github/workflows/main_survey-forms-backend.yml`
   - 参考下方的 "GitHub Actions 配置文件" 部分

#### 选项 B：本地 ZIP 部署（快速测试）

1. **准备部署包**
   - 打开终端，进入 `backend` 目录
   - 确保有 `package.json` 和 `server.js`
   - 将 `backend` 目录所有文件压缩为 `backend.zip`

2. **上传部署**
   - 在 Azure Portal 的 App Service 页面
   - 左侧菜单选择 "**部署中心**"
   - 选择 "**FTPS 凭据**" 或 "**本地 Git**"
   - 或使用下方的 "高级工具 (Kudu)" 上传

3. **使用 Kudu 上传**
   - 左侧菜单选择 "**高级工具**" (Development Tools → Advanced Tools)
   - 点击 "**转到**" 打开 Kudu 控制台
   - 访问：`https://survey-forms-backend.scm.azurewebsites.net/ZipDeployUI`
   - 拖拽 `backend.zip` 文件到页面上传
   - 等待部署完成

#### 选项 C：Visual Studio Code 部署

1. **安装扩展**
   - 安装 "Azure App Service" 扩展

2. **登录 Azure**
   - 在 VS Code 侧边栏点击 Azure 图标
   - 点击 "Sign in to Azure"

3. **部署**
   - 右键点击 App Service 名称
   - 选择 "Deploy to Web App"
   - 选择 `backend` 文件夹

### 步骤 5：验证部署

1. **获取应用 URL**
   - 在 App Service 概述页面
   - 复制 "**默认域**" (Default domain)
   - 格式：`https://survey-forms-backend.azurewebsites.net`

2. **测试 API**
   - 在浏览器访问：`https://your-app-name.azurewebsites.net/api/health`
   - 或使用 PowerShell 测试：
   ```powershell
   Invoke-RestMethod -Uri "https://survey-forms-backend.azurewebsites.net/api/surveys"
   ```

3. **查看日志**
   - 左侧菜单选择 "**日志流**" (Monitoring → Log stream)
   - 实时查看应用日志

### 步骤 6：配置 CORS（如果需要）

1. **设置 CORS**
   - 左侧菜单选择 "**CORS**" (API → CORS)
   - 在 "**允许的源**" 中添加前端域名：
     - `https://your-frontend.azurestaticapps.net`
     - 或 `*`（仅开发环境）
   - 点击 "**保存**"

### 步骤 7：启用日志记录

1. **配置日志**
   - 左侧菜单选择 "**App Service 日志**" (Monitoring → App Service logs)
   - 启用以下选项：
     - **应用程序日志记录 (文件系统)**：开启，级别选择 "信息"
     - **Web 服务器日志记录**：开启，选择 "文件系统"
     - **详细错误消息**：开启
     - **失败请求跟踪**：开启
   - 点击 "**保存**"

### 优势
- ✅ 完全托管的 Node.js 运行环境
- ✅ 自动扩展和负载均衡
- ✅ 内置 CI/CD 支持
- ✅ 简单的环境变量配置
- ✅ 支持自定义域名和 SSL
- ✅ 图形界面操作简单直观

---

## 方式二：通过 Azure CLI 部署

### 部署步骤

#### 1. 安装和登录 Azure CLI

```bash
# 安装 Azure CLI (Windows)
# 下载: https://aka.ms/installazurecliwindows

# 登录 Azure
az login

# 设置默认订阅（如果有多个）
az account list --output table
az account set --subscription "你的订阅ID"
```

#### 2. 创建资源

```bash
# 设置变量
$RESOURCE_GROUP="survey-forms-rg"
$LOCATION="eastasia"
$APP_SERVICE_PLAN="survey-forms-plan"
$WEB_APP_NAME="survey-forms-backend"  # 必须全局唯一

# 创建资源组
az group create --name $RESOURCE_GROUP --location $LOCATION

# 创建 App Service Plan (B1 基础层)
az appservice plan create `
  --name $APP_SERVICE_PLAN `
  --resource-group $RESOURCE_GROUP `
  --sku B1 `
  --is-linux

# 创建 Web App (Node.js 20 或 22)
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name $WEB_APP_NAME `
  --runtime "NODE:20-lts"  # 或使用 "NODE:22-lts"
```

#### 3. 配置环境变量

```bash
# 配置应用设置
az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --settings `
    DB_HOST="your-db.postgres.database.azure.com" `
    DB_PORT="5432" `
    DB_NAME="survey_forms" `
    DB_USER="adminuser" `
    DB_PASSWORD="your-strong-password" `
    PORT="8080" `
    NODE_ENV="production"
```

#### 4. 配置启动命令

```bash
# 设置启动命令
az webapp config set `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --startup-file "npm start"
```

#### 5. 部署代码

**方式 A：从本地部署（快速测试）**

```bash
cd backend

# 创建 .deployment 文件
@"
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
"@ | Out-File -FilePath .deployment -Encoding UTF8

# 使用 ZIP 部署
Compress-Archive -Path * -DestinationPath deploy.zip -Force

az webapp deployment source config-zip `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --src deploy.zip
```

**方式 B：从 GitHub 部署（推荐生产环境）**

```bash
# GitHub 仓库部署
az webapp deployment source config `
  --name $WEB_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --repo-url https://github.com/your-username/Survey_Forms `
  --branch main `
  --manual-integration
```

**方式 C：配置 GitHub Actions（最佳实践）**

1. 获取发布配置文件：
```bash
az webapp deployment list-publishing-profiles `
  --name $WEB_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --xml
```

2. 在 GitHub 仓库设置中添加 Secret：
   - 名称：`AZURE_WEBAPP_PUBLISH_PROFILE`
   - 值：上面命令输出的 XML 内容

3. 创建 GitHub Actions 工作流（见下方配置文件）

#### 6. 配置文件上传目录

```bash
# 启用本地存储（用于上传文件持久化）
az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --settings WEBSITES_ENABLE_APP_SERVICE_STORAGE=true
```

**重要提示**：App Service 的文件系统在重启后会重置。对于生产环境，建议使用 Azure Blob Storage 存储上传的文件。

#### 7. 验证部署

```bash
# 获取应用 URL
az webapp show `
  --name $WEB_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --query defaultHostName --output tsv

# 测试健康检查
$APP_URL="https://$WEB_APP_NAME.azurewebsites.net"
Invoke-RestMethod -Uri "$APP_URL/api/health"
```

#### 8. 查看日志

```bash
# 启用日志
az webapp log config `
  --name $WEB_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --application-logging filesystem `
  --detailed-error-messages true `
  --failed-request-tracing true `
  --web-server-logging filesystem

# 实时查看日志
az webapp log tail `
  --name $WEB_APP_NAME `
  --resource-group $RESOURCE_GROUP
```

### GitHub Actions 工作流配置

创建文件 `.github/workflows/azure-backend-deploy.yml`：

```yaml
name: Deploy Backend to Azure App Service

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'  # 或使用 '22'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci --production
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'survey-forms-backend'  # 替换为你的应用名称
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./backend
```

### 成本估算

**B1 基础层（推荐开发/小型应用）**
- 价格：约 $13-15/月
- 配置：1 核心，1.75 GB RAM
- 适合：日访问量 < 10,000

**S1 标准层（生产环境）**
- 价格：约 $70/月
- 配置：1 核心，1.75 GB RAM
- 功能：自动扩展、部署槽位、备份

## 方案二：Azure Container Apps

### 优势
- 完全容器化
- 自动扩展至 0（节省成本）
- 支持多容器应用

### 快速部署

#### 1. 创建 Dockerfile

在 `backend/` 目录创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine  # 或使用 node:22-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --production

# 复制应用代码
COPY . .

# 创建 uploads 目录
RUN mkdir -p /app/uploads

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### 2. 构建并推送镜像

```bash
# 登录 Azure Container Registry
az acr create --resource-group $RESOURCE_GROUP --name surveyformsacr --sku Basic
az acr login --name surveyformsacr

# 构建镜像
cd backend
az acr build --registry surveyformsacr --image survey-backend:latest .
```

#### 3. 创建 Container App

```bash
# 创建 Container Apps 环境
az containerapp env create `
  --name survey-forms-env `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION

# 创建 Container App
az containerapp create `
  --name survey-backend `
  --resource-group $RESOURCE_GROUP `
  --environment survey-forms-env `
  --image surveyformsacr.azurecr.io/survey-backend:latest `
  --target-port 3000 `
  --ingress external `
  --registry-server surveyformsacr.azurecr.io `
  --env-vars `
    DB_HOST="your-db.postgres.database.azure.com" `
    DB_PORT="5432" `
    DB_NAME="survey_forms" `
    DB_USER="adminuser" `
    DB_PASSWORD="your-password"
```

## 方案三：Azure Blob Storage（文件上传优化）

### 为什么需要？

App Service 的文件系统是临时的，建议使用 Azure Blob Storage 存储上传的文件。

### 配置步骤

#### 1. 创建 Storage Account

```bash
az storage account create `
  --name surveyformsstorage `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Standard_LRS

# 创建容器
az storage container create `
  --name uploads `
  --account-name surveyformsstorage `
  --public-access blob
```

#### 2. 获取连接字符串

```bash
az storage account show-connection-string `
  --name surveyformsstorage `
  --resource-group $RESOURCE_GROUP `
  --output tsv
```

#### 3. 更新应用配置

```bash
az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --settings AZURE_STORAGE_CONNECTION_STRING="连接字符串"
```

#### 4. 修改代码（可选）

需要安装 `@azure/storage-blob` 包并修改文件上传逻辑。

## 配置 CORS

```bash
# 允许前端域名访问
az webapp cors add `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --allowed-origins https://your-frontend.azurestaticapps.net

# 或允许所有（仅开发环境）
az webapp cors add `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --allowed-origins "*"
```

## 安全最佳实践

### 1. 使用 Key Vault 存储敏感信息

```bash
# 创建 Key Vault
az keyvault create `
  --name survey-forms-kv `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION

# 存储数据库密码
az keyvault secret set `
  --vault-name survey-forms-kv `
  --name db-password `
  --value "your-password"

# 配置 Web App 使用 Key Vault
az webapp identity assign `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME

# 授予权限
$principalId = az webapp identity show --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME --query principalId --output tsv
az keyvault set-policy --name survey-forms-kv --object-id $principalId --secret-permissions get
```

### 2. 配置 IP 限制

```bash
# 仅允许特定 IP 访问
az webapp config access-restriction add `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --rule-name 'Allow-Office' `
  --action Allow `
  --ip-address 1.2.3.4/32 `
  --priority 100
```

### 3. 启用 HTTPS Only

```bash
az webapp update `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --https-only true
```

## 监控和诊断

### Application Insights

```bash
# 创建 Application Insights
az monitor app-insights component create `
  --app survey-forms-insights `
  --location $LOCATION `
  --resource-group $RESOURCE_GROUP `
  --application-type web

# 获取 Instrumentation Key
$INSTRUMENTATION_KEY = az monitor app-insights component show `
  --app survey-forms-insights `
  --resource-group $RESOURCE_GROUP `
  --query instrumentationKey --output tsv

# 配置应用
az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

## 故障排查

### 常见问题

1. **应用无法启动**
   ```bash
   # 检查日志
   az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP
   ```

2. **数据库连接失败**
   - 检查防火墙规则：在 PostgreSQL 设置中添加 App Service 出站 IP
   - 验证连接字符串和环境变量

3. **文件上传失败**
   - 检查 `uploads` 目录权限
   - 考虑使用 Blob Storage

### 获取出站 IP 地址

```bash
az webapp show `
  --resource-group $RESOURCE_GROUP `
  --name $WEB_APP_NAME `
  --query outboundIpAddresses --output tsv
```

将这些 IP 添加到 PostgreSQL 防火墙规则中。

## 部署后配置

### 更新前端 API 地址

在前端的 `.env.production` 文件中：

```env
VITE_API_BASE_URL=https://survey-forms-backend.azurewebsites.net
```

### 测试完整流程

1. 访问健康检查：`https://your-app.azurewebsites.net/api/health`
2. 测试提交表单
3. 验证文件上传
4. 检查数据库记录

## 总结

**推荐方案**：
- **小型项目/测试**：Azure App Service (B1 层)
- **生产环境**：Azure App Service (S1 层) + Blob Storage
- **高级需求**：Azure Container Apps

**下一步**：
1. 完成后端部署
2. 参考 [AZURE_STATIC_WEB_APPS_DEPLOYMENT.md](AZURE_STATIC_WEB_APPS_DEPLOYMENT.md) 部署前端
3. 配置自定义域名和 SSL

## 参考资源

- [Azure App Service 文档](https://docs.microsoft.com/azure/app-service/)
- [Azure CLI 参考](https://docs.microsoft.com/cli/azure/)
- [Node.js on Azure](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)
