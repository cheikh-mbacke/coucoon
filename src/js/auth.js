import { loadUsers, saveNewUser } from "./utils.js";

export const showSignupModal = () => {
  const modal = document.getElementById("signup-modal");
  modal.classList.remove("hidden");

  const avatarOptions = document.querySelectorAll(".avatar-option");
  let selectedAvatar = "avatar-user.webp"; // Default avatar

  // Handle avatar selection by clicking on predefined options
  avatarOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove the active class from other avatars
      avatarOptions.forEach((o) => o.classList.remove("selected"));
      option.classList.add("selected");

      // Set the selected avatar
      selectedAvatar = option.getAttribute("data-avatar");
    });
  });

  // Handle form submission
  const form = document.getElementById("signup-form");
  form.addEventListener("submit", (event) =>
    handleSignup(event, selectedAvatar)
  );
};

async function handleSignup(event, selectedAvatar) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const bio = document.getElementById("bio").value;

  // Load the list of existing users
  const users = await loadUsers();
  const newUserId = `user_${users.length + 1}`;

  // Create the user object with selected avatar
  const newUser = {
    id: newUserId,
    name: name,
    profile_picture: selectedAvatar,
    bio: bio,
    reactions: [],
  };

  // Save the user in LocalStorage for the current session
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  // Add the new user to the stored users list
  await saveNewUser(newUser);

  // Redirect to the feed page
  window.location.href = "src/views/feed.html";
}
