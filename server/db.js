const mongoose = require('mongoose');

// Схема для сообщений
const MessageSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'audio'], required: true },
  content: { type: String, required: true }, // Текст или путь к аудиофайлу
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);

