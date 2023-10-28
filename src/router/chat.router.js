import { Router } from "express";
import { messageModel } from "../dao/models/messages.models.js"
const router = Router();

router.get('/getMessages', async (req, res) => {
  try {
    const message = await messageModel.find().lean();
    res.render("chat", { message });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

router.get('/chat', (req, res) => {
  const userEmail = req.user.email;
  res.render('chat', { userEmail });
});

router.post('/saveMessage', (req, res) => {
  const userEmail = req.body.email;
  const message = req.body.message;

  if (!userEmail || !message) {
    return res.status(400).json({ error: 'El correo electrónico o el mensaje están vacíos' });
  }

  if (!validateEmail(userEmail)) {
    return res.status(400).json({ error: 'Correo electrónico no válido' });
  }

  if (message.length > 1000) {
    return res.status(400).json({ error: 'El mensaje es demasiado largo' });
  }

  const cleanedMessage = sanitizeMessage(message);

  console.log('userEmail:', userEmail);
  console.log('message:', message);

  const newMessage = new messageModel({ email: userEmail, message: message });
  newMessage.save()
    .then(() => {
      res.status(200).json({ message: 'Mensaje guardado con éxito', data: newMessage });
    })
    .catch((error) => {
      console.error('Error al guardar el mensaje:', error);
      res.status(500).json({ error: 'Error al guardar el mensaje' });
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