import { fetchData } from "./api.js";
import { handleError } from "./errorHandler.js";

// Define base URL depending on the environment (local or GitHub Pages)
const baseURL =
  window.location.hostname === "localhost"
    ? "../../data/"
    : "https://cheikh-mbacke.github.io/coucoon/data/";

// Define URLs for the data files to be fetched
const usersDataUrl = `${baseURL}users.json`;
const postsDataUrl = `${baseURL}posts.json`;
const conversationsDataUrl = `${baseURL}conversations.json`;

// Check if a user is logged in
export const checkUserSession = () => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "../../index.html";
  }
};

// Load user data with LocalStorage persistence
export const loadUsers = async () => {
  const storedUsers = localStorage.getItem("usersData"); 
  if (storedUsers) {
    return JSON.parse(storedUsers);
  } else {
    const users = await fetchData(usersDataUrl);
    localStorage.setItem("usersData", JSON.stringify(users));
    return users;
  }
};

// Save a new user to LocalStorage
export const saveNewUser = async (newUser) => {
  const users = await loadUsers();
  users.push(newUser); 
  localStorage.setItem("usersData", JSON.stringify(users));
};

// Retrieve a user by their ID
export const getUserById = async (userId) => {
  const users = await loadUsers(); 
  return users.find((user) => user.id === userId);
};

// Load posts data with LocalStorage persistence
export const loadPosts = async () => {
  const storedPosts = localStorage.getItem("postsData"); 
  if (storedPosts) {
    return JSON.parse(storedPosts);
  } else {
    const posts = await fetchData(postsDataUrl);
    localStorage.setItem("postsData", JSON.stringify(posts));
    return posts;
  }
};

// To save updated posts to LocalStorage
export const savePosts = (posts) => {
  localStorage.setItem("postsData", JSON.stringify(posts));
};

// To update a specific post in LocalStorage
export const updatePostInLocalStorage = async (updatedPost) => {
  const posts = await loadPosts();
  const postIndex = posts.findIndex((post) => post.id === updatedPost.id);

  if (postIndex !== -1) {
    posts[postIndex] = updatedPost;
    savePosts(posts);
  }
};

// Load conversations data with LocalStorage persistence
export const loadConversations = async () => {
  const storedConversations = localStorage.getItem("conversationsData");
  if (storedConversations) {
    return JSON.parse(storedConversations);
  } else {
    const conversations = await fetchData(conversationsDataUrl);
    localStorage.setItem("conversationsData", JSON.stringify(conversations));
    return conversations;
  }
};

// Load only conversations of the current user
export const loadUserConversations = async () => {
  const storedConversations = localStorage.getItem("conversationsData");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  let conversations;
  if (storedConversations) {
    conversations = JSON.parse(storedConversations);
  } else {
    conversations = await fetchData(conversationsDataUrl);
    localStorage.setItem("conversationsData", JSON.stringify(conversations));
  }

  // Filter and return only conversations that include the current user
  return conversations.filter((conv) =>
    conv.participants.includes(currentUser.id)
  );
};

// Update a user's conversations in LocalStorage
export const updateUserConversations = async (conversations) => {
  localStorage.setItem("conversationsData", JSON.stringify(conversations));
}

// Send a message in an existing conversation
export const sendMessage = async (conversationId, newMessage) => {
  const conversations = await loadUserConversations();
  const conversation = conversations.find((conv) => conv.id === conversationId);

  if (!conversation) {
    handleError("La conversation n'est pas trouvée !");
    return null;
  }

  conversation.messages.push(newMessage);
  await updateUserConversations(conversations);
  return conversation;
};

// G the latest message in a list of messages
export function getLastMessage(messages) {
  return messages
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sort messages by timestamp
    .pop();
}
