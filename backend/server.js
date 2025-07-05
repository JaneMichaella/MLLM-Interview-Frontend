const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// 使用 CORS 中间件，允许来自任何源的请求
app.use(cors());

// 配置 Multer 进行内存存储，以便在解析前处理文件
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 定义简历上传和解析的 API 路由
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '未上传文件' });
  }

  try {
    let text = '';
    const buffer = req.file.buffer;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === '.pdf') {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (fileExtension === '.docx') {
      const result = await mammoth.extractRawText({ buffer: buffer });
      text = result.value;
    } else {
      return res.status(400).json({ error: '不支持的文件格式。请上传 PDF 或 DOCX 文件。' });
    }

    // 返回解析出的文本
    console.log(`成功解析文件: ${req.file.originalname}`);
    res.json({ parsedText: text });

  } catch (error) {
    console.error('解析简历时出错:', error);
    res.status(500).json({ error: '无法解析简历文件' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`简历解析服务正在监听 http://localhost:${port}`);
});
