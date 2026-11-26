const form = document.getElementById("course-form");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");
const message = document.getElementById("message");
const tableBody = document.getElementById("courses-body");
const programsList = document.getElementById("programs-list");

let editingId = null;

function showMessage(text, type) {
  message.textContent = text;
  message.className = "message " + type;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Ошибка запроса");
  }
  return data;
}

function createButton(text, className, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  if (className) {
    button.className = className;
  }
  button.addEventListener("click", handler);
  return button;
}

function renderTable(courses) {
  tableBody.innerHTML = "";
  if (courses.length === 0) {
    const row = tableBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.textContent = "Курсов пока нет";
    return;
  }
  courses.forEach((course) => {
    const row = tableBody.insertRow();
    const nameCell = document.createElement("th");
    nameCell.scope = "row";
    const link = document.createElement("a");
    link.href = "#course-" + course.id;
    link.textContent = course.title;
    nameCell.appendChild(link);
    row.appendChild(nameCell);
    row.insertCell().textContent = course.modules;
    row.insertCell().textContent = course.practice;
    const actions = row.insertCell();
    actions.className = "actions";
    actions.appendChild(createButton("Редактировать", "secondary", () => startEdit(course)));
    actions.append(" ");
    actions.appendChild(createButton("Удалить", "danger", () => removeCourse(course)));
  });
}

function renderPrograms(courses) {
  programsList.innerHTML = "";
  courses.forEach((course) => {
    const article = document.createElement("article");
    article.id = "course-" + course.id;
    const title = document.createElement("h3");
    title.textContent = course.title;
    article.appendChild(title);
    const topics = course.program.split("\n").filter((line) => line.trim());
    if (topics.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "Программа пока не заполнена.";
      article.appendChild(empty);
    } else {
      const list = document.createElement("ol");
      topics.forEach((topic) => {
        list.appendChild(document.createElement("li")).textContent = topic;
      });
      article.appendChild(list);
    }
    programsList.appendChild(article);
  });
}

async function loadCourses() {
  try {
    const courses = await request("/api/courses");
    renderTable(courses);
    renderPrograms(courses);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Добавить курс";
  submitButton.textContent = "Добавить курс";
  cancelButton.hidden = true;
}

function startEdit(course) {
  editingId = course.id;
  form.title.value = course.title;
  form.modules.value = course.modules;
  form.practice.value = course.practice;
  form.program.value = course.program;
  formTitle.textContent = "Изменить курс № " + course.id;
  submitButton.textContent = "Сохранить изменения";
  cancelButton.hidden = false;
  form.title.focus();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function removeCourse(course) {
  if (!confirm("Удалить курс «" + course.title + "»?")) {
    return;
  }
  try {
    await request("/api/courses/" + course.id, { method: "DELETE" });
    if (editingId === course.id) {
      resetForm();
    }
    showMessage("Курс удалён", "ok");
    loadCourses();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = {
    title: form.title.value,
    modules: Number(form.modules.value),
    practice: form.practice.value,
    program: form.program.value
  };
  const url = editingId ? "/api/courses/" + editingId : "/api/courses";
  const method = editingId ? "PUT" : "POST";
  try {
    await request(url, { method, body: JSON.stringify(body) });
    showMessage(editingId ? "Курс изменён" : "Курс добавлен", "ok");
    resetForm();
    loadCourses();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

cancelButton.addEventListener("click", resetForm);

loadCourses();
