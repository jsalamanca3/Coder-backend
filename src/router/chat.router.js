import { Router } from "express";
import { messageModel } from "../persistencia/dao/models/messages.models.js";
import autorizeMiddleware from '../middlewares/authorize.middleware.js';
import { errorDictionary } from "../error/error.enum.js";
import logger from "../winston.js";
const router = Router();

router.get('/getMessages', async (req, res) => {
  try {
    const message = await messageModel.find().lean();
    res.render("chat", { message });
  } catch (error) {
    logger.error('Error al obtener mensajes:', error);
    return res.status(401).json({ error: errorDictionary['MESSAGE_ERROR'] });
  }
});

router.get('/chat', (req, res) => {
  const userEmail = req.user.email;
  res.render('chat', { userEmail });
});

router.post('/saveMessage', autorizeMiddleware, (req, res) => {
  const userEmail = req.body.email;
  const message = req.body.message;

  if (!userEmail || !message) {
    return res.status(401).json({ error: errorDictionary['INVALID_DATA_FORMAT'] });
  }

  if (!validateEmail(userEmail)) {
    return res.status(401).json({ error: errorDictionary['INVALID_EMAIL'] });
  }

  if (message.length > 1000) {
    return res.status(401).json({ error: errorDictionary['MESSAGE_IS_VERY_LONG'] });
  }

  const cleanedMessage = sanitizeMessage(message);

  logger.info('userEmail:', userEmail);
  logger.info('message:', message);

  const newMessage = new messageModel({ email: userEmail, message: message });
  newMessage.save()
    .then(() => {
      res.status(200).json({ message: 'Mensaje guardado con éxito', data: newMessage });
    })
    .catch((error) => {
      console.error('Error al guardar el mensaje:', error);
      return res.status(401).json({ error: errorDictionary['ERROR_TO_SAVE_MESSAGE'] });
    });
});

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailRegex.test(email);
};

function sanitizeMessage(message) {
  let cleanedMessage = escape(message);
  cleanedMessage = cleanedMessage.replace(/<[^>]*>/g, '');
  return cleanedMessage;
}

export default router;