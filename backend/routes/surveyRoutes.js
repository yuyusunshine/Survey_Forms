import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import db from '../database/db.js';

const router = express.Router();

// 创建问卷
router.post('/', (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: '标题和问题是必填项' });
    }

    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO surveys (id, title, description, questions)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, title, description || '', JSON.stringify(questions));

    res.status(201).json({
      id,
      title,
      description,
      questions,
      message: '问卷创建成功'
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: '创建问卷失败' });
  }
});

// 获取所有问卷
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM surveys ORDER BY created_at DESC');
    const surveys = stmt.all();
    
    const formattedSurveys = surveys.map(survey => ({
      ...survey,
      questions: JSON.parse(survey.questions),
      is_active: Boolean(survey.is_active)
    }));

    res.json(formattedSurveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: '获取问卷失败' });
  }
});

// 获取单个问卷
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM surveys WHERE id = ?');
    const survey = stmt.get(id);

    if (!survey) {
      return res.status(404).json({ error: '问卷不存在' });
    }

    res.json({
      ...survey,
      questions: JSON.parse(survey.questions),
      is_active: Boolean(survey.is_active)
    });
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ error: '获取问卷失败' });
  }
});

// 生成问卷二维码
router.get('/:id/qrcode', async (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT id FROM surveys WHERE id = ?');
    const survey = stmt.get(id);

    if (!survey) {
      return res.status(404).json({ error: '问卷不存在' });
    }

    // 生成问卷填写链接
    const surveyUrl = `${req.protocol}://${req.get('host')}/survey/${id}`;
    
    // 生成二维码
    const qrCodeDataUrl = await QRCode.toDataURL(surveyUrl);

    res.json({
      url: surveyUrl,
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: '生成二维码失败' });
  }
});

// 更新问卷状态
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const stmt = db.prepare('UPDATE surveys SET is_active = ? WHERE id = ?');
    const result = stmt.run(is_active ? 1 : 0, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '问卷不存在' });
    }

    res.json({ message: '问卷状态更新成功' });
  } catch (error) {
    console.error('Error updating survey status:', error);
    res.status(500).json({ error: '更新问卷状态失败' });
  }
});

// 删除问卷
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM surveys WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '问卷不存在' });
    }

    res.json({ message: '问卷删除成功' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ error: '删除问卷失败' });
  }
});

export default router;
