import { getUserById, checkUserSession } from "./utils.js";

// Ensure the user is logged in
checkUserSession();

// Function to get query parameters
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Retrieve the user ID from the URL query parameter
const userId = getQueryParam("id");

async function displayUserProfile(userId) {
  if (!userId) {
    document.getElementById("profile-name").textContent = "User not found";
    document.getElementById("profile-bio").textContent =
      "Invalid user ID in URL.";
    return;
  }

  // Fetch the user data by ID
  const user = await getUserById(userId);

  if (user) {
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById(
      "profile-picture"
    ).src = `../../assets/images/profiles/${user.profile_picture}`;
    document.getElementById("profile-bio").textContent = user.bio;
  } else {
    document.getElementById("profile-name").textContent = "User not found";
    document.getElementById("profile-bio").textContent =
      "This user could not be found.";
  }
}

// Display the user profile
displayUserProfile(userId);
