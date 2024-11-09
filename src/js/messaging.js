import {
  checkUserSession,
  getUserById,
  loadUserConversations,
  sendMessage,
  getLastMessage,
} from "./utils.js";

async function displayConversations() {
  const conversations = await loadUserConversations();
  const conversationList = document.getElementById("conversation-list");

  // Trie les conversations par date du dernier message
  conversations.sort(
    (a, b) =>
      new Date(getLastMessage(b.messages).timestamp) -
      new Date(getLastMessage(a.messages).timestamp)
  );

  // Génère la liste HTML des conversations
  conversationList.innerHTML = await Promise.all(
    conversations.map(async (conv) => {
      const lastMessage = getLastMessage(conv.messages);
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      const isCurrentUser = lastMessage.sender === currentUser.id;
      let userId;

      if (isCurrentUser) {
        userId = conv.participants.filter((id) => id !== currentUser.id)[0];
      } else {
        userId = lastMessage.sender;
      }

      const user = await getUserById(userId);

      return `
        <div class="conversation-item" data-id="${conv.id}">
          <img src="../../assets/images/profiles/${user.profile_picture}" alt="${user.name}'s profile picture" class="profile-pic" width="50" height="50">
          <div class="conversation-details">
            <span class="contact-name">${user.name}</span>
            <p class="last-message">${lastMessage.content}</p>
          </div>
        </div>
      `;
    })
  ).then((items) => items.join(""));

  // Ajoute un événement de clic pour chaque conversation
  document.querySelectorAll(".conversation-item").forEach((item) => {
    item.addEventListener("click", () => openConversation(item.dataset.id));
  });
}

async function openConversation(conversationId) {
  const conversations = await loadUserConversations();
  const conversation = conversations.find((conv) => conv.id === conversationId);
  const messageHistory = document.getElementById("message-history");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (conversation) {
    // Trier les messages par timestamp pour obtenir le dernier message
    const sortedMessages = conversation.messages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    const lastMessage = sortedMessages[sortedMessages.length - 1];

    // Utiliser Promise.all pour charger les informations des utilisateurs en parallèle
    messageHistory.innerHTML = await Promise.all(
      conversation.messages.map(async (msg) => {
        const user = await getUserById(msg.sender);
        return `
          <div class="message ${
            msg.sender === currentUser.id ? "sent" : "received"
          }">
            <img src="../../assets/images/profiles/${
              user.profile_picture
            }" alt="${
          user.name
        }'s profile picture" class="message-pic" width="30" height="30">
            <div class="message-content">
              <span class="message-sender">${user.name}</span>
              <p>${msg.content}</p>
              <span class="message-timestamp">${new Date(
                msg.timestamp
              ).toLocaleString()}</span>
            </div>
          </div>
        `;
      })
    ).then((items) => items.join(""));

    // Gère l'envoi de nouveaux messages
    const sendMessageButton = document.getElementById("send-message");
    sendMessageButton.onclick = async () => {
      const messageInput = document.getElementById("new-message");
      const messageContent = messageInput.value.trim();
      if (!messageContent) return;

      const idNumber = parseInt(lastMessage.id.split("-")[1], 10);
      const newIdNumber = idNumber + 1;

      const newMessage = {
        id: `msg-${newIdNumber}`,
        sender: currentUser.id,
        content: messageContent,
        timestamp: new Date().toISOString(),
      };

      const updatedConversation = await sendMessage(conversationId, newMessage);
      displayMessageInConversation(updatedConversation, newMessage);
      messageInput.value = "";
    };
  }
}

// Fonction pour afficher le nouveau message dans l'interface
async function displayMessageInConversation(conversation, newMessage) {
  const messageHistory = document.getElementById("message-history");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const user =
    newMessage.sender === currentUser.id
      ? currentUser
      : await getUserById(newMessage.sender);

  const messageElement = `
    <div class="message ${
      newMessage.sender === currentUser.id ? "sent" : "received"
    }">
      <img src="../../assets/images/profiles/${user.profile_picture}" alt="${
    user.name
  }'s profile picture" class="message-pic" width="30" height="30">
      <div class="message-content">
        <span class="message-sender">${user.name}</span>
        <p>${newMessage.content}</p>
        <span class="message-timestamp">${new Date(
          newMessage.timestamp
        ).toLocaleString()}</span>
      </div>
    </div>
  `;

  messageHistory.insertAdjacentHTML("beforeend", messageElement);
}

// Check user session and load conversations once the DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => {
  checkUserSession();
  displayConversations();
});
