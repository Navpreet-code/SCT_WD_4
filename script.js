let taskLists = JSON.parse(localStorage.getItem("taskLists")) || { Default: [] };
let currentList = localStorage.getItem("currentList") || "Default";
let currentFilter = "all";
let isDark = false;

const listSelector = document.getElementById("listSelector");

function saveToStorage() {
  localStorage.setItem("taskLists", JSON.stringify(taskLists));
  localStorage.setItem("currentList", currentList);
}

function populateListSelector() {
  listSelector.innerHTML = "";
  for (let list in taskLists) {
    const opt = document.createElement("option");
    opt.value = list;
    opt.text = list;
    listSelector.appendChild(opt);
  }
  listSelector.value = currentList;
}

function deleteList() {
  if (currentList === "Default") {
    alert("⚠️ Default list cannot be deleted.");
    return;
  }

  const confirmDelete = confirm(`Are you sure you want to delete the "${currentList}" list and all its tasks?`);
  if (confirmDelete) {
    delete taskLists[currentList];
    currentList = "Default";
    saveToStorage();
    populateListSelector();
    renderTasks();
  }
}

function createList() {
  const name = document.getElementById("newListInput").value.trim();
  if (!name || taskLists[name]) return alert("Invalid or duplicate list name");
  taskLists[name] = [];
  currentList = name;
  document.getElementById("newListInput").value = "";
  populateListSelector();
  renderTasks();
  saveToStorage();
}

listSelector.addEventListener("change", () => {
  currentList = listSelector.value;
  renderTasks();
  saveToStorage();
});

function addTask() {
  const task = document.getElementById("taskInput").value.trim();
  const date = document.getElementById("taskDateTime").value;
  if (!task) return alert("Please enter a task");
  taskLists[currentList].push({ text: task, datetime: date, completed: false });
  document.getElementById("taskInput").value = "";
  document.getElementById("taskDateTime").value = "";
  renderTasks();
  saveToStorage();
}

function setFilter(type) {
  currentFilter = type;
  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  let total = 0, completed = 0, pending = 0;
  let visibleCount = 0;

  taskLists[currentList].forEach((task, i) => {
    const isOverdue = task.datetime && !task.completed && new Date(task.datetime) < new Date();

    if (
      (currentFilter === "completed" && !task.completed) ||
      (currentFilter === "pending" && task.completed)
    ) return;

    visibleCount++;
    total++;
    if (task.completed) completed++;
    else pending++;

    // List Item
    const li = document.createElement("li");
    li.className = "list-group-item shadow-sm";
    li.style.border = "2px solid #000";
    li.style.borderRadius = "12px";
    li.style.marginBottom = "12px";
    li.style.backgroundColor = "whitesmoke";
    li.style.transition = "0.3s ease";
    li.onmouseover = () => li.style.backgroundColor = "#f8f9fa";
    li.onmouseout = () => li.style.backgroundColor = "whitesmoke";

    // Row
    const row = document.createElement("div");
    row.className = "row align-items-center";

    // Checkbox
    const col1 = document.createElement("div");
    col1.className = "col-auto";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.checked = task.completed;
    checkbox.style.cursor = "pointer";
    checkbox.onclick = () => {
      task.completed = checkbox.checked;
      renderTasks();
      saveToStorage();
      if (checkbox.checked) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };
    col1.appendChild(checkbox);

    // Task Info
    const col2 = document.createElement("div");
    col2.className = "col";
    const taskText = document.createElement("div");
    taskText.innerText = task.text;
    taskText.className = "fw-bold mb-1" + (task.completed ? " completed" : "");

    const taskDate = document.createElement("small");
    taskDate.style.color = isOverdue ? "red" : "black";
    taskDate.style.fontWeight = isOverdue ? "600" : "normal";
    taskDate.style.fontSize = "0.85rem";
    if (task.datetime) {
      taskDate.innerText = "Due: " + new Date(task.datetime).toLocaleString();
    }

    col2.appendChild(taskText);
    col2.appendChild(taskDate);

    // Buttons
    const col3 = document.createElement("div");
    col3.className = "col-auto d-flex gap-2";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-dark rounded-circle px-2 py-1";
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editBtn.title = "Edit Task";
    editBtn.style.border = "1px solid black";
    editBtn.onmouseover = () => editBtn.style.backgroundColor = "#39d6dbff";
    editBtn.onmouseout = () => editBtn.style.backgroundColor = "";
    editBtn.onclick = () => {
      const updated = prompt("Edit task", task.text);
      if (updated) {
        task.text = updated.trim();
        renderTasks();
        saveToStorage();
      }
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-sm btn-outline-dark rounded-circle px-2 py-1";
    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    delBtn.title = "Delete Task";
    delBtn.style.border = "1px solid black";
    delBtn.onmouseover = () => delBtn.style.backgroundColor = "#f00a0aff";
    delBtn.onmouseout = () => delBtn.style.backgroundColor = "";
    delBtn.onclick = () => {
      if (confirm("Are you sure you want to delete this task?")) {
        taskLists[currentList].splice(i, 1);
        renderTasks();
        saveToStorage();
      }
    };

    col3.appendChild(editBtn);
    col3.appendChild(delBtn);

    row.appendChild(col1);
    row.appendChild(col2);
    row.appendChild(col3);
    li.appendChild(row);
    taskList.appendChild(li);
  });

  // Show empty message if no tasks to display
  if (visibleCount === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "text-center text-muted py-5";
    emptyMessage.innerHTML = `
      <i class="fa-solid fa-inbox fa-2x mb-2"></i><br />
      <span>No tasks to show</span>
    `;
    taskList.appendChild(emptyMessage);
  }

  // Update counters
  document.getElementById("totalCount").innerText = total;
  document.getElementById("completedCount").innerText = completed;
  document.getElementById("pendingCount").innerText = pending;
}


// Initialize
populateListSelector();
renderTasks();
