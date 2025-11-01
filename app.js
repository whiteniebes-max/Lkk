let data = {};
let completed = new Set(JSON.parse(localStorage.getItem("completedCourses") || "[]"));

async function load() {
  data = await fetch("curricula.json").then(r => r.json());
  render();
}

function render() {
  const mode = document.getElementById("viewMode").value;
  let courses = [];

  if (mode === "bioingenieria") {
    courses = data.bioingenieria;
  } else if (mode === "cienciadatos") {
    courses = data.cienciadatos;
  } else if (mode === "combinada") {
    // merge
    courses = mergeCurricula(data.bioingenieria, data.cienciadatos);
  }

  displaySemesters(courses);
}

function mergeCurricula(a, b) {
  const merged = JSON.parse(JSON.stringify(a));

  for (const sem in b) {
    if (!merged[sem]) merged[sem] = [];
    merged[sem].push(...b[sem]);
  }
  return merged;
}

function displaySemesters(courses) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  for (const sem in courses) {
    const box = document.createElement("div");
    box.innerHTML = `<h2>${sem}</h2>`;
    courses[sem].forEach(course => box.appendChild(renderCourse(course)));
    app.appendChild(box);
  }
}

function renderCourse(c) {
  const el = document.createElement("div");
  el.classList.add("course");

  if (completed.has(c.code)) {
    el.classList.add("completed");
  } else if (canTake(c)) {
    el.classList.add("available");
  } else {
    el.classList.add("locked");
  }

  el.textContent = `${c.code}: ${c.name}`;
  el.onclick = () => toggle(c.code);
  return el;
}

function canTake(course) {
  if (!course.prereq || course.prereq.length === 0) return true;
  return course.prereq.every(p => completed.has(p));
}

function toggle(code) {
  if (completed.has(code)) completed.delete(code);
  else completed.add(code);

  localStorage.setItem("completedCourses", JSON.stringify([...completed]));
  render();
}

document.getElementById("viewMode").onchange = render;

load();
