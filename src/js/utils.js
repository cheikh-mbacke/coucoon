import { fetchData } from "./api.js";

const usersDataUrl = "/data/users.json";
const postsDataUrl = "/data/posts.json";

// Check if the user is logged in
export const checkUserSession = () => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    // Redirect to the homepage if the user is not logged in
    window.location.href = "../../index.html";
  }
}

// Load users with LocalStorage persistence
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

// Load posts with LocalStorage persistence
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

// Save updated posts to LocalStorage
export const savePosts = (posts) => {
  localStorage.setItem("postsData", JSON.stringify(posts));
};

// Update a specific post in LocalStorage
export const updatePostInLocalStorage = async (updatedPost) => {
  const posts = await loadPosts();
  const postIndex = posts.findIndex((post) => post.id === updatedPost.id);

  if (postIndex !== -1) {
    posts[postIndex] = updatedPost;
    savePosts(posts);
  }
};
