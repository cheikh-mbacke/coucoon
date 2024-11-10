import {
  checkUserSession,
  getUserById,
  loadUserConversations,
  sendMessage,
  getLastMessage,
} from "./utils.js";

// Function to display all user conversations, sorted by the latest message timestamp
async function displayConversations() {
  const conversations = await loadUserConversations(); 
  const conversationList = document.getElementById("conversation-list"); 

  // Sort conversations by the most recent message timestamp in descending order
  conversations.sort(
    (a, b) =>
      new Date(getLastMessage(b.messages).timestamp) -
      new Date(getLastMessage(a.messages).timestamp)
  );

  // Generate HTML for each conversation and inject it into the DOM
  conversationList.innerHTML = await Promise.all(
    conversations.map(async (conv) => {
      const lastMessage = getLastMessage(conv.messages);
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      // Determine if the last message was sent by the current user
      const isCurrentUser = lastMessage.sender === currentUser.id;
      let userId;

      // Set userId to the conversation participant who is not the current user
      if (isCurrentUser) {
        userId = conv.participants.filter((id) => id !== currentUser.id)[0];
      } else {
        userId = lastMessage.sender;
      }

      const user = await getUserById(userId); // Retrieve user information by ID

      // Return the conversation item HTML structure with profile picture, name, and last message content
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
  ).then((items) => items.join("")); // Convert HTML elements array to a single string for insertion

  // Add click event listeners to each conversation item to open the conversation
  document.querySelectorAll(".conversation-item").forEach((item) => {
    item.addEventListener("click", () => openConversation(item.dataset.id));
  });
}

// Function to open a specific conversation and display message history
async function openConversation(conversationId) {
  const conversations = await loadUserConversations(); // Load conversations
  const conversation = conversations.find((conv) => conv.id === conversationId);
  const messageHistory = document.getElementById("message-history"); 
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (conversation) {
    // Sort messages by timestamp in ascending order to show the conversation flow
    const sortedMessages = conversation.messages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    const lastMessage = sortedMessages[sortedMessages.length - 1]; // Get the last message for unique ID generation

    // Generate HTML for each message and inject it into the DOM
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
    ).then((items) => items.join("")); // Convert HTML elements array to a single string for insertion

    // Set up the send message button functionality
    const sendMessageButton = document.getElementById("send-message");
    sendMessageButton.onclick = async () => {
      const messageInput = document.getElementById("new-message");
      const messageContent = messageInput.value.trim();
      if (!messageContent) return;

      // Generate unique ID for new message
      const idNumber = parseInt(lastMessage.id.split("-")[1], 10);
      const newIdNumber = idNumber + 1;

      // Create new message object
      const newMessage = {
        id: `msg-${newIdNumber}`,
        sender: currentUser.id,
        content: messageContent,
        timestamp: new Date().toISOString(),
      };

      // Send new message and display it in the conversation
      const updatedConversation = await sendMessage(conversationId, newMessage);
      displayMessageInConversation(updatedConversation, newMessage);
      messageInput.value = ""; // Clear the message input field
    };
  }
}

// Function to display a new message in the current conversation
async function displayMessageInConversation(conversation, newMessage) {
  const messageHistory = document.getElementById("message-history"); // Get message history container
  const currentUser = JSON.parse(localStorage.getItem("currentUser")); // Get current user data
  const user =
    newMessage.sender === currentUser.id
      ? currentUser
      : await getUserById(newMessage.sender); // Determine the message sender

  // Create HTML structure for the new message
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

  // Append the new message to the conversation's message history
  messageHistory.insertAdjacentHTML("beforeend", messageElement);
}

// Event listener for when the DOM content is fully loaded
window.addEventListener("DOMContentLoaded", () => {
  checkUserSession(); // Verify user session
  displayConversations(); // Display the list of conversations
});
