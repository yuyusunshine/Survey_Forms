import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import submissionRoutes from './routes/submissionRoutes.js';
import { initDatabase } from './database/db.js';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化数据库（异步）
await initDatabase();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供上传的文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/submissions', submissionRoutes);

// 生成表单二维码
app.get('/api/qrcode', async (req, res) => {
  try {
    const formUrl = `${req.protocol}://${req.get('host')}/`;
    const qrCodeDataUrl = await QRCode.toDataURL(formUrl);
    res.json({ url: formUrl, qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: '生成二维码失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
