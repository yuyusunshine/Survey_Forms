# 创新活动合作伙伴信息收集系统

一个专为创新活动设计的合作伙伴信息收集表单，支持文件上传、二维码分享、匿名提交和管理后台。

## 功能特性

- ✅ 固定的合作伙伴信息表单
- ✅ 文件上传功能（支持多文件）
- ✅ 二维码分享
- ✅ 匿名提交
- ✅ 管理后台查看提交数据
- ✅ 导出数据为CSV
- ✅ 实时查看上传的文件

## 表单字段

### 公司信息
- 公司名称 *
- 公司规模
- 所属行业

### 联系人信息
- 联系人姓名 *
- 职位
- 联系电话 *
- 电子邮箱 *

### 合作意向
- 合作意向描述
- 创新项目描述
- 附件上传（公司介绍、产品手册、项目方案等）

## 技术栈

### 后端
- Node.js + Express
- **PostgreSQL (Azure Database for PostgreSQL)** - 云数据库
- Multer (文件上传)
- QRCode (二维码生成)

### 前端
- React 18
- Vite
- React Router
- Axios

## 项目结构

```
Survey_Forms/
├── backend/              # 后端服务
│   ├── database/         # 数据库配置
│   ├── routes/           # API路由
│   ├── server.js         # 服务器入口
│   └── package.json
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   │   ├── PartnerForm.jsx      # 合作伙伴信息表单
│   │   │   └── AdminDashboard.jsx   # 管理后台
│   │   ├── App.jsx       # 主应用
│   │   └── main.jsx      # 入口文件
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── uploads/              # 文件上传目录
└── README.md
```

## 快速开始

### 前置要求
- Node.js 16+ 
- Azure PostgreSQL 数据库（或本地PostgreSQL用于开发）

### 1. 配置数据库

**选项A：使用Azure PostgreSQL（推荐生产环境）**
1. 按照 [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md) 创建Azure PostgreSQL数据库
2. 复制 `backend/.env.example` 为 `backend/.env`
3. 填写Azure数据库连接信息

**选项B：本地PostgreSQL（开发测试）**
1. 安装PostgreSQL: https://www.postgresql.org/download/
2. 创建数据库: `createdb survey_forms`
3. 复制 `backend/.env.example` 为 `backend/.env`
4. 配置本地连接信息

### 2. 安装依赖

**后端:**
```bash
cd backend
npm install
```

**前端:**
```bash
cd frontend
npm install
```

### 3. 启动项目

**启动后端服务器:**
```bash
cd backend
npm start
```
后端服务将运行在 `http://localhost:3000`

首次启动会自动创建数据库表。

**启动前端开发服务器:**
```bash
cd frontend
npm run dev
```
前端应用将运行在 `http://localhost:5173`

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

## 使用说明

### 管理员功能

1. **生成二维码**
   - 点击"生成表单二维码"
   - 用户可以扫描二维码访问表单

2. **查看提交**
   - 在管理后台查看所有提交记录
   - 可以下载用户上传的文件
   - 可以导出数据为CSV格式

3. **管理提交**
   - 删除提交记录

### 用户功能

1. **填写表单**
   - 访问表单页面
   - 填写公司和联系人信息
   - 上传相关文件（可选）
   - 提交表单（匿名）

## API 端点

### 表单管理
- `GET /api/qrcode` - 生成表单二维码

### 提交管理
- `POST /api/submissions` - 提交表单
- `GET /api/submissions` - 获取所有提交
- `GET /api/submissions/:id` - 获取单个提交
- `DELETE /api/submissions/:id` - 删除提交

## 数据库结构

### submissions 表
- id (主键)
- company_name (公司名称)
- contact_name (联系人姓名)
- position (职位)
- phone (电话)
- email (邮箱)
- company_size (公司规模)
- industry (所属行业)
- cooperation_intent (合作意向)
- project_description (项目描述)
- submitted_at (提交时间)

### files 表
- id (主键)
- submission_id (外键)
- question_id (问题ID)
- filename (文件名)
- original_name (原始文件名)
- filepath (文件路径)
- mimetype (MIME类型)
- size (文件大小)
- uploaded_at (上传时间)

## 配置说明

### 文件上传限制
- 最大文件大小: 10MB
- 支持的文件类型: jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, ppt, pptx, txt

### 端口配置
- 后端: 3000 (可在 `backend/server.js` 中修改)
- 前端: 5173 (可在 `frontend/vite.config.js` 中修改)

## 开发说明

### 开发模式
使用 `npm run dev` 启动开发服务器，支持热重载。

### 生产构建
```bash
# 构建前端
cd frontend
npm run build

# 启动后端
cd backend
npm start
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
