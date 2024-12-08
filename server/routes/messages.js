// Импортируемые модули
const express = require('express');
const multer = require('multer');
const path = require('path');
const Message = require('../db');
const router = express.Router();

// Настройка загрузки аудио
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../public/uploads')),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Обработка отправки сообщения
router.post('/send', upload.single('audio'), async (req, res) => {
  try {
    const { type, text } = req.body;
    let content;

    if (type === 'text') {
      content = text; // Храним текст как есть
    } else if (type === 'audio' && req.file) {
      content = req.file.filename; // Сохраняем имя аудиофайла
    } else {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Сохраняем сообщение в базу данных
    const message = new Message({ type, content });
    await message.save();

    // Получение случайного сообщения
    const randomMessage = await Message.aggregate([{ $sample: { size: 1 } }]);
    if (!randomMessage.length) return res.status(200).json({ received: null });

    res.status(200).json({ received: randomMessage[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Удаление старых сообщений
router.delete('/cleanup', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: 1 });
    if (messages.length > 650) {
      const toDelete = messages.slice(0, messages.length - 650);

      // Удаляем файлы аудио, если есть
      for (const msg of toDelete) {
        if (msg.type === 'audio') {
          const filePath = path.join(__dirname, '../../public/uploads', msg.content);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await msg.remove();
      }
    }
    res.status(200).json({ message: 'Cleanup complete' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

