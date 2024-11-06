import { getUserById, updatePostInLocalStorage } from "./utils.js";
import { handleError } from "./errorHandler.js";
import { triggerParticleAnimation } from "./animations.js";

export async function createPostElement(post) {
  const user = await getUserById(post.user_id);

  if (!user) {
    handleError("Il n'y a pas d'utilisateur associé à ce poste !");
    return null;
  }

  const postElement = document.createElement("article");
  postElement.classList.add("post");

  // User information
  const userElement = document.createElement("div");
  userElement.classList.add("user-info");
  userElement.innerHTML = `
        <img src="/assets/images/profiles/${user.profile_picture}" alt="${user.name}" class="user-pic" width="50" height="50">
        <div>
            <h3>${user.name}</h3>
        </div>
    `;

  // Post content
  const contentElement = document.createElement("div");
  contentElement.classList.add("post-content");
  contentElement.innerHTML = `<p>${post.content}</p>`;

  // Post image (if available)
  if (post.image) {
    const imageElement = document.createElement("img");
    imageElement.src = `/assets/images/posts/${post.image}`;
    imageElement.width = "200";
    imageElement.height = "200";
    imageElement.alt = "Image du post";
    imageElement.classList.add("post-image");
    contentElement.appendChild(imageElement);
  }

  // Post reactions
  const reactionsElement = document.createElement("div");
  reactionsElement.classList.add("post-reactions");

  // Create reaction buttons with toggle functionality
  const likeButton = createReactionButton("👍", post, "like");
  const dislikeButton = createReactionButton("👎", post, "dislike");
  const loveButton = createReactionButton("♡", post, "love"); // Default empty heart

  // Append all buttons to the reactions container
  reactionsElement.appendChild(likeButton.button);
  reactionsElement.appendChild(dislikeButton.button);
  reactionsElement.appendChild(loveButton.button);

  // Post date
  const dateElement = document.createElement("p");
  dateElement.classList.add("post-date");
  dateElement.textContent = new Date(post.date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Assemble the post element
  postElement.appendChild(userElement);
  postElement.appendChild(contentElement);
  postElement.appendChild(reactionsElement);
  postElement.appendChild(dateElement);

  return postElement;
}

// Function to create reaction buttons with toggle functionality
function createReactionButton(emoji, post, type) {
  const button = document.createElement("button");
  button.classList.add("reaction-button");
  button.innerHTML = `${emoji} <span class="reaction-count">${post.reactions[type]}</span>`;

  let isReacted = false;

  button.addEventListener("click", async () => {
    // Toggle the reaction: add or remove based on the current state
    if (isReacted) {
      post.reactions[type] -= 1;
      isReacted = false;
      if (type === "love")
        button.innerHTML = `♡ <span class="reaction-count">${post.reactions[type]}</span>`;
    } else {
      post.reactions[type] += 1;
      isReacted = true;
      if (type === "love")
        button.innerHTML = `❤️ <span class="reaction-count">${post.reactions[type]}</span>`;
      triggerParticleAnimation(button, emoji === "♡" ? "❤️" : emoji);
    }

    // Update the displayed count
    button.querySelector(".reaction-count").textContent = post.reactions[type];

    // Update the post in LocalStorage
    await updatePostInLocalStorage(post);
  });

  return { button, type, isReacted };
}
