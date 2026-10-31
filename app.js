import { getDateKey, getStreak, parseHabits, summarizeHabits } from "./habit-data.mjs";

const STORAGE_KEY = "little-by-little.habits.v1";
const EMOJIS = ["🌱", "💧", "📚", "🚶", "🧘", "✍️", "🍎", "☀️"];
const habitList = document.querySelector("#habit-list");
const todayLabel = document.querySelector("#today-label");
const todayCount = document.querySelector("#today-count");
const progressRing = document.querySelector("#progress-ring");
const progressPercent = document.querySelector("#progress-percent");
const weekDays = document.querySelector("#week-days");
const weekCount = document.querySelector("#week-count");
const warning = document.querySelector("#storage-warning");
const dialog = document.querySelector("#habit-dialog");
const form = document.querySelector("#habit-form");
const nameInput = document.querySelector("#habit-name");
const emojiPicker = document.querySelector("#emoji-picker");
const toast = document.querySelector("#toast");
const installButton = document.querySelector("#install-button");

let habits = [];
let selectedEmoji = EMOJIS[0];
let storageAvailable = true;
let toastTimer;
let installPrompt;

function showStorageWarning(message) {
  storageAvailable = false;
  warning.textContent = message;
  warning.hidden = false;
  document.querySelector("#open-dialog").disabled = true;
  document.querySelector("#open-dialog").setAttribute("aria-label", "Habit editing unavailable");
}

function loadHabits() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    habits = saved === null ? [] : parseHabits(saved);
  } catch (error) {
    console.error("Could not load saved habits.", error);
    showStorageWarning("Saved habits could not be read. Your existing data has been left untouched; editing is disabled to avoid overwriting it.");
  }
}

function saveHabits(nextHabits) {
  if (!storageAvailable) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHabits));
    habits = nextHabits;
    return true;
  } catch (error) {
    console.error("Could not save habits.", error);
    showStorageWarning("Your change could not be saved on this device. Free up browser storage or reopen this app in a supported browser, then try again.");
    render();
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderHabits(today) {
  habitList.replaceChildren();
  if (habits.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.append(
      createTextElement("div", "empty-emoji", "🌿"),
      createTextElement("p", "", "Choose one small thing you would like to do regularly. You can always start with just one."),
    );
    habitList.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const habit of habits) {
    const isDone = habit.doneDates.includes(today);
    const card = document.createElement("article");
    card.className = "habit-card";

    const main = document.createElement("div");
    main.className = "habit-main";
    main.append(
      createTextElement("span", "habit-emoji", habit.emoji),
    );
    const details = document.createElement("div");
    details.append(createTextElement("h3", "habit-name", habit.name));
    const streak = getStreak(habit.doneDates);
    const streakText = streak === 0 ? "Start a new streak today" : `${streak} day${streak === 1 ? "" : "s"} in a row`;
    details.append(createTextElement("p", "habit-streak", streakText));
    main.append(details);

    const meta = document.createElement("div");
    meta.className = "habit-meta";
    const check = document.createElement("button");
    check.className = `check-button${isDone ? " is-done" : ""}`;
    check.type = "button";
    check.dataset.action = "toggle";
    check.dataset.id = habit.id;
    check.setAttribute("aria-label", `${isDone ? "Unmark" : "Mark"} ${habit.name} ${isDone ? "as not done" : "done"} today`);
    check.setAttribute("aria-pressed", String(isDone));
    check.textContent = "✓";
    meta.append(check);

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.dataset.action = "delete";
    remove.dataset.id = habit.id;
    remove.setAttribute("aria-label", `Delete ${habit.name}`);
    remove.textContent = "×";
    meta.append(remove);
    card.append(main, meta);
    fragment.append(card);
  }
  habitList.append(fragment);
}

function renderWeek(summary) {
  weekDays.replaceChildren();
  for (const day of summary.days) {
    const item = document.createElement("div");
    item.className = "week-day";
    item.append(createTextElement("span", "", day.label));
    const dot = createTextElement("span", `week-dot${day.checkins > 0 ? " has-checkin" : ""}${day.isToday ? " is-today" : ""}`, String(day.dayNumber));
    dot.setAttribute("aria-label", `${day.dateKey}: ${day.checkins} check-ins`);
    item.append(dot);
    weekDays.append(item);
  }
  weekCount.textContent = `${summary.weeklyCheckins} check-in${summary.weeklyCheckins === 1 ? "" : "s"}`;
}

function render() {
  const now = new Date();
  const summary = summarizeHabits(habits, now);
  todayLabel.textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(now).toUpperCase();
  todayCount.textContent = `${summary.completedToday} of ${summary.totalHabits}`;
  progressPercent.textContent = `${summary.percentComplete}%`;
  progressRing.style.setProperty("--progress", `${summary.percentComplete}%`);
  progressRing.setAttribute("aria-label", `${summary.percentComplete}% complete`);
  renderHabits(getDateKey(now));
  renderWeek(summary);
}

function renderEmojiPicker() {
  emojiPicker.replaceChildren();
  for (const emoji of EMOJIS) {
    const button = document.createElement("button");
    button.className = "emoji-choice";
    button.type = "button";
    button.textContent = emoji;
    button.setAttribute("aria-label", `Choose ${emoji}`);
    button.setAttribute("aria-pressed", String(emoji === selectedEmoji));
    button.addEventListener("click", () => {
      selectedEmoji = emoji;
      renderEmojiPicker();
    });
    emojiPicker.append(button);
  }
}

document.querySelector("#open-dialog").addEventListener("click", () => {
  if (!storageAvailable) return;
  form.reset();
  selectedEmoji = EMOJIS[0];
  renderEmojiPicker();
  dialog.showModal();
  nameInput.focus();
});

document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }

  const newHabit = { id: crypto.randomUUID(), name, emoji: selectedEmoji, doneDates: [] };
  if (saveHabits([...habits, newHabit])) {
    render();
    dialog.close();
    showToast("Your new habit is ready.");
  }
});

habitList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || !storageAvailable) return;
  const habit = habits.find((item) => item.id === button.dataset.id);
  if (!habit) return;

  if (button.dataset.action === "toggle") {
    const today = getDateKey();
    const done = habit.doneDates.includes(today);
    const nextHabits = habits.map((item) => {
      if (item.id !== habit.id) return item;
      return {
        ...item,
        doneDates: done ? item.doneDates.filter((date) => date !== today) : [...item.doneDates, today],
      };
    });
    if (saveHabits(nextHabits)) {
      render();
      showToast(done ? "Check-in removed." : "Nice work showing up today!");
    }
  } else if (button.dataset.action === "delete" && window.confirm(`Delete "${habit.name}" and its check-ins?`)) {
    if (saveHabits(habits.filter((item) => item.id !== habit.id))) {
      render();
      showToast("Habit deleted.");
    }
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  const result = await installPrompt.userChoice;
  if (result.outcome === "accepted") showToast("App added to your home screen.");
  installPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
  showToast("App installed. Glad to have you here!");
});

loadHabits();
renderEmojiPicker();
render();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Could not register the offline app worker.", error);
      showToast("Offline support could not be enabled in this browser.");
    });
  });
}
