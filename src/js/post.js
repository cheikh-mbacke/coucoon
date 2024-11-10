import { getUserById, updatePostInLocalStorage } from "./utils.js";
import { handleError } from "./errorHandler.js";
import { triggerParticleAnimation } from "./animations.js";

export async function createPostElement(post) {
  const user = await getUserById(post.user_id);

  if (!user) {
    handleError("Il n'y a aucun utilisateur associé à cette publication !");
    return null;
  }

  const postElement = document.createElement("article");
  postElement.classList.add("post"); // Utilise la classe post définie en CSS

  // User info section
  const userElement = document.createElement("div");
  userElement.classList.add("user-info");
  userElement.innerHTML = `
    <img src="../../assets/images/profiles/${user.profile_picture}" alt="${
    user.name
  }" class="user-pic" width="50" height="50">
    <div>
      <h3>${user.name}</h3>
      <span class="post-date">${new Date(post.date).toLocaleDateString(
        "fr-FR",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )}</span>
    </div>
  `;

  // Post content section
  const contentElement = document.createElement("div");
  contentElement.classList.add("post-content");
  contentElement.innerHTML = `<p>${post.content}</p>`;

  // Image handling
  if (post.image) {
    const imageElement = createImageWithFullscreenFeature(post.image);
    contentElement.appendChild(imageElement);
  }

  // Define reactions with emojis and types
  const reactions = [
    { emoji: "👍", type: "like" },
    { emoji: "👎", type: "dislike" },
    { emoji: "♡", type: "love" },
  ];

  // Add reaction buttons
  const reactionsElement = createReactionButtons(reactions, post);

  // Comments section
  const commentList = document.createElement("div");
  commentList.classList.add("comment-list");

  // Display existing comments
  for (const comment of post.comments) {
    const commentElement = await createCommentOrReplyElement(
      comment,
      post,
      null,
      true
    );
    commentList.appendChild(commentElement);
  }

  // Comment input form
  const commentForm = createCommentForm(post, commentList);

  // Assemble the post element
  postElement.appendChild(userElement);
  postElement.appendChild(contentElement);
  postElement.appendChild(reactionsElement);
  postElement.appendChild(commentList);
  postElement.appendChild(commentForm);

  return postElement;
}

// Helper function to create image with fullscreen feature
function createImageWithFullscreenFeature(imagePath) {
  const imageElement = document.createElement("img");
  imageElement.src = `../../assets/images/posts/${imagePath}`;
  imageElement.alt = "Post image";
  imageElement.classList.add("post-image");

  imageElement.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.classList.add("fullscreen-overlay");

    const container = document.createElement("div");
    container.classList.add("fullscreen-container");

    const fullscreenImage = document.createElement("img");
    fullscreenImage.src = imageElement.src;
    fullscreenImage.classList.add("fullscreen-image");

    const closeButton = document.createElement("span");
    closeButton.innerHTML = "&#10005;";
    closeButton.classList.add("close-button");

    const zoomInButton = document.createElement("button");
    zoomInButton.textContent = "+";
    zoomInButton.classList.add("zoom-button", "zoom-in");

    const zoomOutButton = document.createElement("button");
    zoomOutButton.textContent = "-";
    zoomOutButton.classList.add("zoom-button", "zoom-out");

    let zoomLevel = 1;
    zoomInButton.addEventListener("click", () => {
      zoomLevel += 0.1;
      fullscreenImage.style.transform = `scale(${zoomLevel})`;
    });

    zoomOutButton.addEventListener("click", () => {
      if (zoomLevel > 0.2) {
        zoomLevel -= 0.1;
        fullscreenImage.style.transform = `scale(${zoomLevel})`;
      }
    });

    closeButton.addEventListener("click", () => overlay.remove());

    container.appendChild(fullscreenImage);
    container.appendChild(closeButton);
    container.appendChild(zoomInButton);
    container.appendChild(zoomOutButton);

    overlay.appendChild(container);
    document.body.appendChild(overlay);
  });

  return imageElement;
}

// Helper function to create comment form
function createCommentForm(post, commentList) {
  const commentForm = document.createElement("div");
  commentForm.classList.add("comment-form");
  commentForm.innerHTML = `
    <input type="text" placeholder="écrire un commentaire" class="comment-input">
    <button class="comment-submit">Commenter</button>
  `;

  const commentInput = commentForm.querySelector(".comment-input");
  const commentSubmit = commentForm.querySelector(".comment-submit");

  commentSubmit.addEventListener("click", async () => {
    const commentText = commentInput.value.trim();
    if (commentText) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const newComment = {
        id: `comment_${Date.now()}`,
        user_id: currentUser.id,
        content: commentText,
        timestamp: new Date().toISOString(),
        replies: [],
      };

      post.comments.push(newComment);
      await updatePostInLocalStorage(post);

      const commentElement = await createCommentOrReplyElement(
        newComment,
        post,
        null,
        true
      );
      commentList.appendChild(commentElement);

      commentInput.value = "";
    }
  });

  return commentForm;
}

// Function to create reaction buttons
function createReactionButtons(reactions, post) {
  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("reactions-container");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userReactions = currentUser.reactions || [];

  // Check if the current user has reacted to this post
  const hasReacted = (type) =>
    userReactions.some(
      (reaction) =>
        reaction.post_id === post.id && reaction.reaction_type === type
    );

  reactions.forEach(({ emoji, type }) => {
    const button = document.createElement("button");
    button.classList.add("reaction-button");
    button.innerHTML = `${emoji} <span class="reaction-count">${post.reactions[type]}</span>`;

    // Set initial state based on existing reactions
    if (hasReacted(type)) {
      button.classList.add("active");
      if (type === "love") {
        button.innerHTML = `❤️ <span class="reaction-count">${post.reactions[type]}</span>`;
      }
    }

    // Set button disabled state based on opposite reactions
    if (
      (type === "like" && hasReacted("dislike")) ||
      (type === "dislike" && hasReacted("like"))
    ) {
      button.disabled = true;
    }

    // Add click event to handle the reaction logic
    button.addEventListener("click", async () => {
      const oppositeType =
        type === "like" ? "dislike" : type === "dislike" ? "like" : null;
      const isActive = button.classList.contains("active");

      if (isActive) {
        // Remove reaction
        post.reactions[type] -= 1;
        button.classList.remove("active");
        currentUser.reactions = currentUser.reactions.filter(
          (reaction) =>
            !(reaction.post_id === post.id && reaction.reaction_type === type)
        );
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        button.querySelector(".reaction-count").textContent =
          post.reactions[type];

        if (type === "love") {
          button.innerHTML = `♡ <span class="reaction-count">${post.reactions[type]}</span>`;
        }

        // Re-enable opposite button when unreacted
        if (oppositeType) {
          const oppositeButton = buttonsContainer.querySelector(
            `[data-type="${oppositeType}"]`
          );
          if (oppositeButton) oppositeButton.disabled = false;
        }
      } else {
        // Add reaction
        post.reactions[type] += 1;
        button.classList.add("active");
        currentUser.reactions.push({ post_id: post.id, reaction_type: type });
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        button.querySelector(".reaction-count").textContent =
          post.reactions[type];
        if (type === "like") {
          emoji = "👍";
        } else if (type === "dislike") {
          emoji = "👎";
        } else if (type === "love") {
          emoji = "❤️";
        }
        button.innerHTML = `${emoji} <span class="reaction-count">${post.reactions[type]}</span>`;
        triggerParticleAnimation(button, emoji);

        // Disable opposite button if like/dislike was clicked
        if (oppositeType) {
          const oppositeButton = buttonsContainer.querySelector(
            `[data-type="${oppositeType}"]`
          );
          if (oppositeButton && oppositeButton.classList.contains("active")) {
            post.reactions[oppositeType] -= 1;
            oppositeButton.classList.remove("active");
            currentUser.reactions = currentUser.reactions.filter(
              (reaction) =>
                !(
                  reaction.post_id === post.id &&
                  reaction.reaction_type === oppositeType
                )
            );
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            oppositeButton.querySelector(".reaction-count").textContent =
              post.reactions[oppositeType];
          }
          if (oppositeButton) oppositeButton.disabled = true;
        }
      }

      await updatePostInLocalStorage(post);
    });

    button.setAttribute("data-type", type);
    buttonsContainer.appendChild(button);
  });

  return buttonsContainer;
}

async function createCommentOrReplyElement(
  item,
  post,
  parentItem = null,
  isComment = true
) {
  const elementType = isComment ? "comment" : "reply";
  const element = document.createElement("div");
  element.classList.add(elementType);

  const author = await getUserById(item.user_id);
  const authorName = author ? author.name : "Unknown";
  const authorProfilePic = author && author.profile_picture;

  // Create profile picture
  const authorPicElement = document.createElement("img");
  authorPicElement.src = `../../assets/images/profiles/${authorProfilePic}`;
  authorPicElement.width = isComment ? 30 : 25;
  authorPicElement.height = isComment ? 30 : 25;
  authorPicElement.classList.add(`${elementType}-author-pic`);

  // Create author and content wrapper
  const contentWrapper = document.createElement("div");
  contentWrapper.classList.add(`${elementType}-content-wrapper`);

  // Create author element
  const authorElement = document.createElement("span");
  authorElement.classList.add(`${elementType}-author`);
  authorElement.textContent = `${authorName}: `;

  // Create content element
  const contentElement = document.createElement("span");
  contentElement.classList.add(`${elementType}-content`);
  contentElement.textContent = item.content;

  contentWrapper.appendChild(authorElement);
  contentWrapper.appendChild(contentElement);

  // Create footer for timestamp and reply button
  const footerElement = document.createElement("div");
  footerElement.classList.add("comment-footer");

  // Create timestamp element
  const timestampElement = document.createElement("span");
  timestampElement.classList.add(`${elementType}-timestamp`);
  timestampElement.textContent = new Date(item.timestamp).toLocaleString();

  // Create reply button
  const replyButton = document.createElement("button");
  replyButton.classList.add("reply-button");
  replyButton.textContent = "Répondre";

  // Append timestamp and reply button to footer
  footerElement.appendChild(timestampElement);
  footerElement.appendChild(replyButton);

  // Create containers for replies
  const replyContainer = document.createElement("div");
  replyContainer.classList.add("reply-container");

  const replyList = document.createElement("div");
  replyList.classList.add("reply-list");

  // Handle existing replies
  if (item.replies && item.replies.length > 0) {
    for (const reply of item.replies) {
      const replyElement = await createCommentOrReplyElement(
        reply,
        post,
        item,
        false
      );
      replyList.appendChild(replyElement);
    }
  }

  // Handle reply button click
  replyButton.addEventListener("click", () => {
    replyContainer.innerHTML = ""; // Clear existing reply form

    const replyInput = document.createElement("input");
    replyInput.classList.add("reply-input");
    replyInput.placeholder = "écrire une réponse...";

    const replySubmit = document.createElement("button");
    replySubmit.classList.add("reply-submit");
    replySubmit.textContent = "Envoyer";

    replySubmit.addEventListener("click", async () => {
      const replyText = replyInput.value.trim();
      if (replyText) {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const newReply = {
          id: `reply_${Date.now()}`,
          user_id: currentUser.id,
          content: replyText,
          timestamp: new Date().toISOString(),
          replies: [], // Initialize nested replies array
        };

        // Ensure replies array exists
        if (!item.replies) item.replies = [];
        item.replies.push(newReply);

        await updatePostInLocalStorage(post);

        const replyElement = await createCommentOrReplyElement(
          newReply,
          post,
          item,
          false
        );
        replyList.appendChild(replyElement);

        replyContainer.innerHTML = ""; // Clear input after submission
      }
    });

    replyContainer.appendChild(replyInput);
    replyContainer.appendChild(replySubmit);
  });

  // Append all elements
  element.appendChild(authorPicElement);
  element.appendChild(contentWrapper);
  element.appendChild(footerElement);
  element.appendChild(replyContainer);
  element.appendChild(replyList);

  return element;
}
