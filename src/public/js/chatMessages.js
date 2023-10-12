const socketClient = io();

const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const chatMessages = document.getElementById("chat-messages");

document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userEmail = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  if (
    message &&
    typeof message === "string" &&
    userEmail &&
    typeof userEmail === "string"
  ) {
    socketClient.emit('message', { email: userEmail, message });
    document.getElementById("message").value = "";
    const newMessage = {
      email: userEmail,
      message: message,
    };

    try {
      const response = await fetch("/api/chat/saveMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        console.log("Mensaje guardado con éxito.");
      } else {
        console.error("Error al guardar el mensaje en la base de datos.");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje al servidor:", error);
    }
  } else {
    console.error("El mensaje no es válido.");
  }
});

function addMessage(message, user) {
  const messageElement = document.createElement("div");
  messageElement.innerText = `[${user}] ${message}`;
  chatMessages.appendChild(messageElement);
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = messageInput.value;
  socketClient.emit("message", message);
  messageInput.value = "";
});

socketClient.on("chatMessage", (data) => {
  const { user, message } = data;
  addMessage(message, user);
});

let user;

async function getUserInput() {
  const { value } = await Swal.fire({
    title: "Bienvenid@",
    text: "¿Cuál es tu nombre?",
    input: "text",
    inputValidator: (value) => {
      if (!value) {
        return "No has escrito un nombre";
      }
    },
    confirmButtonText: "Enter",
  });

  if (value) {
    user = value;
    socketClient.emit("newUser", user);
    return true;
  } else {
    return false;
  }
}

getUserInput().then((isValid) => {
  if (isValid) {
    chatForm.style.display = "block";
  }
});

socketClient.on("newUserBroadcast", (user) => {
  Toastify({
    text: `${user} connected`,
    duration: 5000,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
});