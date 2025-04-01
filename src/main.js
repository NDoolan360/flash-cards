import { setupControl } from "./control.js";
import { parseFromFile } from "./deck/parse.js";
import { setupDeckList } from "./deck/select.js";
import { getIndex, getMax, setupDeckSlides } from "./slide/slide.js";
import { setupDeckProgress } from "./slide/progress.js";
import { events } from "./events.js";
import { addToStorage } from "./storage.js";

// setup indexedDB
const deckDatabase = indexedDB.open("deckData", 1);
deckDatabase.onerror = function () {
  console.error(`Database error: ${this.error?.message}`);
  throw new Error("Failed to open the deck database");
};
deckDatabase.onupgradeneeded = function () {
  const db = this.result;
  const store = db.createObjectStore("decks", { keyPath: "name" });
  store.createIndex("name", "name", { unique: true });
};
deckDatabase.onsuccess = async function () {
  const deckDatabase = this.result;
  setupDeckSlides(document.getElementById("slide-display"));
  setupDeckList(document.getElementById("deck"), deckDatabase);
  // setup deck events
  events.newDecks.subscribe(async (files) => {
    for (const file of files) {
      const newDeck = await parseFromFile(file);
      console.log(newDeck);
      if (newDeck === undefined) {
        alert(
          "Invalid deck file. Please upload a valid .csv file with only two columns.",
        );
      } else {
        await addToStorage(deckDatabase, newDeck);
      }
    }
  });
  events.deckRemoved.subscribe((deckName) => {
    if (!confirm("Are you sure you want to remove this deck?")) return;
    const transaction = deckDatabase.transaction("decks", "readwrite");
    const store = transaction.objectStore("decks");
    store.delete(deckName);
  });
};


// setup deck controls
setupControl(document.getElementById("new-deck"), {
  target: document.getElementById("deck-input"),
  eventHandlers: { click: (_, target) => target.click() },
});
setupControl(document.getElementById("deck-input"), {
  eventHandlers: {
    input: (element) => {
      if (element.files) {
        events.newDecks.dispatch(element.files);
      }
      element.value = "";
    },
  },
});
setupControl(document.getElementById("remove-deck"), {
  target: document.getElementById("deck"),
  eventHandlers: {
    click: (_, target) => events.deckRemoved.dispatch(target.value),
  },
  checkDisabled: (_, target) => !target.value.length,
});


//setup  slide controls
setupControl(document.getElementById("prev"), {
  target: document.getElementById("slide-display"),
  eventHandlers: { click: () => events.slideUpdate.dispatch(-1) },
  checkDisabled: (_, target) =>
    (getIndex(target) ?? 0) <= 1 && target?.dataset.endless !== "true",
});
setupControl(document.getElementById("shuffle"), {
  target: document.getElementById("slide-display"),
  eventHandlers: {
    change: (element) => events.shuffle.dispatch(element.checked),
  },
  checkDisabled: (_, target) => (getMax(target) ?? 0) < 2,
});
setupDeckProgress(document.getElementById("slide-progress"), {
  target: document.getElementById("slide-display"),
});
setupControl(document.getElementById("correct"), {
  target: document.getElementById("slide-display"),
  eventHandlers: {
    change: (element) => events.slideCorrect.dispatch(element.checked),
  },
  checkDisabled: (_, target) => !target.dataset.index,
});
setupControl(document.getElementById("endless"), {
  target: document.getElementById("slide-display"),
  eventHandlers: {
    change: (element) => events.endless.dispatch(element.checked),
  },
  checkDisabled: (_, target) => (getMax(target) ?? 0) < 2,
});
setupControl(document.getElementById("next"), {
  target: document.getElementById("slide-display"),
  eventHandlers: { click: () => events.slideUpdate.dispatch(+1) },
  checkDisabled: (_, target) =>
    (getIndex(target) ?? 0) >= (getMax(target) ?? 0) &&
    target?.dataset.endless !== "true",
});


// setup slide events
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    events.slideUpdate.dispatch(-1);
  } else if (event.key === "ArrowRight") {
    events.slideUpdate.dispatch(+1);
  }
});
