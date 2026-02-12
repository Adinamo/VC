const STORAGE_KEY = "mini-focus-board.tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

let tasks = loadTasks();
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  input.value = "";
  saveTasks();
  render();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const item = button.closest("li");
  const id = item?.dataset.id;
  if (!id) return;

  if (button.classList.contains("done-btn")) {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
  }

  if (button.classList.contains("delete-btn")) {
    tasks = tasks.filter((task) => task.id !== id);
  }

  saveTasks();
  render();
});

function render() {
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item${task.done ? " done" : ""}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <span class="text">${escapeHtml(task.text)}</span>
      <div class="actions">
        <button class="icon-btn done-btn" title="Marcheaza">✓</button>
        <button class="icon-btn delete-btn" title="Sterge">✕</button>
      </div>
    `;

    list.appendChild(li);
  });

  emptyState.hidden = tasks.length > 0;
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
