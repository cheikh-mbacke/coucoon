// Filter friends dynamically based on search input
document.getElementById("search-bar").addEventListener("input", filterFriends);

function filterFriends() {
  const filter = document.getElementById("search-bar").value.toLowerCase();
  const friends = document.querySelectorAll("#friends-list li");

  friends.forEach((friend) => {
    const name = friend.querySelector(".friend-name").textContent.toLowerCase();
    friend.style.display = name.includes(filter) ? "" : "none";
  });
}

// Drag and drop functionality with visual feedback and streamlined event handling
let draggedItem = null;

document.querySelectorAll("#friends-list li").forEach((friend) => {
  friend.addEventListener("dragstart", dragStart);
  friend.addEventListener("dragover", dragOver);
  friend.addEventListener("drop", drop);
  friend.addEventListener("dragleave", dragLeave);
  friend.addEventListener("dragend", dragEnd);

  // Prevent links inside the friend item from initiating a drag event
  friend.querySelectorAll("a").forEach((link) => {
    link.addEventListener("mousedown", (event) => event.stopPropagation());
    link.addEventListener("dragstart", (event) => event.preventDefault()); // Prevent drag on links
  });
});

function dragStart(event) {
  // Check if the drag started on a link, if so prevent it
  if (event.target.tagName === "A") {
    event.preventDefault();
    return;
  }

  draggedItem = event.target.closest("li");
  if (!draggedItem) return;

  event.stopPropagation(); // Stop propagation if it's triggered by mistake
  draggedItem.classList.add("dragging"); // Add visual feedback for the dragged item
  event.dataTransfer.effectAllowed = "move";
}

function dragOver(event) {
  event.preventDefault();
  const target = event.target.closest("li");
  if (target && target !== draggedItem) {
    target.classList.add("drop-target"); // Highlight the drop target
  }
}

function dragLeave(event) {
  const target = event.target.closest("li");
  if (target) {
    target.classList.remove("drop-target"); // Remove highlight when leaving the target
  }
}

function drop(event) {
  event.preventDefault();
  const target = event.target.closest("li");

  if (target && target !== draggedItem) {
    const friendsList = document.getElementById("friends-list");
    const allFriends = [...friendsList.children];
    const draggedIndex = allFriends.indexOf(draggedItem);
    const targetIndex = allFriends.indexOf(target);

    if (draggedIndex < targetIndex) {
      friendsList.insertBefore(draggedItem, target.nextSibling);
    } else {
      friendsList.insertBefore(draggedItem, target);
    }

    // Clear visual feedback
    resetDraggedItem();
    target.classList.remove("drop-target");
  }
}

function dragEnd() {
  resetDraggedItem();
}

// Function to reset any visual feedback from dragging
function resetDraggedItem() {
  if (draggedItem) {
    draggedItem.classList.remove("dragging");
    draggedItem = null;
  }
  document.querySelectorAll(".drop-target").forEach((item) => {
    item.classList.remove("drop-target");
  });
}
