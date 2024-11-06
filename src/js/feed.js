import { loadPosts, checkUserSession } from "./utils.js";
import { createPostElement } from "./post.js";

// Load and display the feed
async function loadFeed() {
  const posts = await loadPosts();

  // Get the container element where posts will be displayed
  const postsContainer = document.getElementById("posts-container");

  // Iterate through each post and add it to the feed
  posts.forEach(async (post) => {
    const postElement = await createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}

// Check user session and load the feed once the DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => {
  checkUserSession();
  loadFeed();
});
