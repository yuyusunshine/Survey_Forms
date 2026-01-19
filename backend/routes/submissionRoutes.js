import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database/db.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('不支持的文件类型'));
  }
});

// 提交合作伙伴信息表单
router.post('/', upload.array('files', 10), async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      company_name, 
      contact_name, 
      position, 
      phone, 
      email,
      company_size,
      industry,
      cooperation_intent,
      project_description 
    } = req.body;
    
    if (!company_name || !contact_name || !email || !phone) {
      return res.status(400).json({ error: '请填写必填项' });
    }

    const submissionId = uuidv4();
    
    await client.query('BEGIN');

    // 保存提交记录
    await client.query(`
      INSERT INTO submissions (
        id, company_name, contact_name, position, phone, email,
        company_size, industry, cooperation_intent, project_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      submissionId, 
      company_name, 
      contact_name, 
      position || '', 
      phone, 
      email,
      company_size || '',
      industry || '',
      cooperation_intent || '',
      project_description || ''
    ]);

    // 保存上传的文件信息
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileId = uuidv4();
        
        await client.query(`
          INSERT INTO files (id, submission_id, question_id, filename, original_name, filepath, mimetype, size)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          fileId,
          submissionId,
          'attachments',
          file.filename,
          file.originalname,
          file.path,
          file.mimetype,
          file.size
        ]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      id: submissionId,
      message: '提交成功'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting form:', error);
    res.status(500).json({ error: '提交失败' });
  } finally {
    client.release();
  }
});

// 获取所有提交
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM submissions ORDER BY submitted_at DESC');
    const submissions = result.rows;

    // 获取每个提交的文件信息
    const submissionsWithFiles = await Promise.all(
      submissions.map(async (submission) => {
        const filesResult = await pool.query('SELECT * FROM files WHERE submission_id = $1', [submission.id]);
        return {
          ...submission,
          files: filesResult.rows
        };
      })
    );

    res.json(submissionsWithFiles);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: '获取提交记录失败' });
  }
});

// 获取单个提交详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
    const submission = result.rows[0];

    if (!submission) {
      return res.status(404).json({ error: '提交记录不存在' });
    }

    // 获取文件信息
    const filesResult = await pool.query('SELECT * FROM files WHERE submission_id = $1', [id]);
    const files = filesResult.rows;

    res.json({
      ...submission,
      files
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: '获取提交记录失败' });
  }
});

// 删除提交记录
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');

    // 获取文件信息以便删除物理文件
    const filesResult = await client.query('SELECT filepath FROM files WHERE submission_id = $1', [id]);
    const files = filesResult.rows;

    // 删除物理文件
    files.forEach(file => {
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
    });

    // 删除文件记录（由于设置了ON DELETE CASCADE，删除提交时会自动删除文件记录）
    // 但为了确保物理文件被删除，我们先手动删除
    await client.query('DELETE FROM files WHERE submission_id = $1', [id]);

    // 删除提交记录
    const result = await client.query('DELETE FROM submissions WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: '提交记录不存在' });
    }

    await client.query('COMMIT');
    res.json({ message: '提交记录删除成功' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: '删除提交记录失败' });
  } finally {
    client.release();
  }
});

export default router;
