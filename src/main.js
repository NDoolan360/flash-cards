import { setupDeckControls } from "./deck/controls.js";
import { setupDeckProgress } from "./deck/progress.js";
import { setupSlide } from "./slide/slide.js";
import { setupSlideControls } from "./slide/controls.js";
import { setupStorage } from "./storage.js";

// setup storage
setupStorage((deckDatabase) => {
  const deckControls = document.getElementById("deck-controls");
  if (!deckControls) throw new Error("Deck controls element is not found");
  setupDeckControls(deckControls, deckDatabase);

  const progress = document.getElementById("progress");
  if (!progress) throw new Error("Progress element is not found");
  setupDeckProgress(progress);

  const slide = document.getElementById("slide");
  if (!slide) throw new Error("Slide element is not found");
  setupSlide(slide, () => parseInt(progress.dataset.index));

  const slideControls = document.getElementById("slide-controls");
  if (!slideControls) throw new Error("Slide controls element is not found");
  setupSlideControls(slideControls, progress, slide);
});
