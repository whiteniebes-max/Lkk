let data = {};
let completed = new Set();

async function loadData() {
  const resp = await fetch("curricula.json");
  data = await resp.json();
}

function loadProgress() {
  const saved = localStorage.getItem("completedCourses");
  if (saved) completed = new Set(JSON.parse(saved));
}

function saveProgress() {
  localStorage.setItem("completedCourses", JSON.stringify([...completed]));
}

function prereqsMet(course) {
  return course.prereqs.every(p => completed.has(p));
}

function renderProgram(program) {
  const container = document.getElementById("coursesContainer");
  container.innerHTML = "";
  const courses = data[program];
  const bySem = {};
  courses.forEach(c => {
    if (!bySem[c.semester]) bySem[c.semester] = [];
    bySem[c.semester].push(c);
  });
  Object.keys(bySem).sort((a,b)=>a-b).forEach(sem => {
    const semDiv = document.createElement("div");
    semDiv.className = "semester-card";
    const title = document.createElement("h2");
    title.textContent = "Semestre " + sem;
    semDiv.appendChild(title);

    bySem[sem].forEach(course => {
      const cDiv = document.createElement("div");
      let cls = "blocked";
      if (completed.has(course.code)) cls = "completed";
      else if (prereqsMet(course)) cls = "available";
      cDiv.className = "course " + cls;

      const label = document.createElement("label");
      label.textContent = course.code + " - " + course.name;

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = completed.has(course.code);
      cb.onchange = () => {
        if (cb.checked) completed.add(course.code);
        else completed.delete(course.code);
        saveProgress();
        renderProgram(program);
      };

      cDiv.appendChild(label);
      cDiv.appendChild(cb);
      semDiv.appendChild(cDiv);
    });

    container.appendChild(semDiv);
  });
}

async function main() {
  await loadData();
  loadProgress();

  const select = document.getElementById("programSelect");
  select.onchange = () => renderProgram(select.value);

  document.getElementById("resetBtn").onclick = () => {
    completed.clear();
    saveProgress();
    renderProgram(select.value);
  };

  renderProgram(select.value);
}

main();
