export function triggerParticleAnimation(element, emoji) {
  // Sets the number of particles to create for the animation
  const particleCount = 20;

  const rect = element.getBoundingClientRect();

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("span"); // Creates a <span> element to represent the particle
    particle.classList.add("particle");
    particle.textContent = emoji; 

    // Sets the initial position of the particle around the center of the target element
    particle.style.position = "absolute";
    particle.style.left = `${
      rect.left + rect.width / 2 + (Math.random() - 0.5) * 30
    }px`; // Positions horizontally near the center, with a slight random offset
    particle.style.top = `${
      rect.top + window.scrollY - 20 + (Math.random() - 0.5) * 30
    }px`; // Positions vertically above the element with a random offset, accounting for page scroll
    particle.style.animationDuration = `${0.5 + Math.random() * 0.5}s`; // Sets a random animation duration between 0.5 and 1 second

    document.body.appendChild(particle);

    // Removes the particle after the animation ends to avoid cluttering the DOM
    particle.addEventListener("animationend", () => {
      particle.remove();
    });
  }
}
