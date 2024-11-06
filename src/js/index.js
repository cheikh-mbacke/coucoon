import { showSignupModal } from "./auth.js";

const currentUser = localStorage.getItem("currentUser");

if (currentUser) {
  window.location.href = "src/views/feed.html";
} else {
  showSignupModal();
}
