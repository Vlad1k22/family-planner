// ===== Проверка входа =====
const user = JSON.parse(localStorage.getItem("plannerUser"));
if (!user) location.href = "index.html";

// ===== Определяем роль =====
let role = "";
if (user.age < 18) role = user.gender === "male" ? "младший сын" : "младшая дочь";
else if (user.age < 50) role = user.gender === "male" ? "сын" : "дочь";
else role = user.gender === "male" ? "отец" : "мать";

// ===== Тема =====
let theme = "blue";
if (user.age < 18) theme = "blue";
else if (user.age < 50) theme = user.gender === "female" ? "pink" : "light";
else theme = user.gender === "female" ? "yellow" : "dark";
document.body.className = theme;

// ===== Приветствие =====
document.getElementById("greet").textContent = 
    `Привет, ${role} ${user.name}. Сегодня ${new Date().toLocaleDateString('ru-RU')}`;

// ===== Список дел по возрасту =====
const tasksByAge = user.age < 18
    ? ["Сделать уроки","Убрать комнату"]
    : user.age < 50
    ? ["Сходить в магазин","Сделать тренировку"]
    : ["Прогулка","Позвонить близким"];

const taskList = document.getElementById("taskList");
taskList.innerHTML = `<option value="">не выбрано</option>`;
tasksByAge.forEach(t => taskList.innerHTML += `<option>${t}</option>`);

const customTask = document.getElementById("customTask");
taskList.onchange = () => customTask.value = "";
customTask.oninput = () => taskList.value = "";

// ===== Дата =====
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");

function localISO(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
dateInput.min = localISO();

dateInput.onchange = () => {
    const today = localISO();
    const now = new Date();
    timeInput.min = (dateInput.value === today)
        ? `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
        : "00:00";
};

// ===== Генерация уникального ID пользователя =====
function getUserID(u) {
    // Группируем по возрасту: 0-17, 18-49, 50+
    let ageGroup = u.age < 18 ? 'child' : u.age < 50 ? 'adult' : 'senior';
    return `${u.gender}_${ageGroup}`;
}

const currentUserID = getUserID(user);

// ===== Хранение: все задачи всех пользователей =====
let familyTasks = JSON.parse(localStorage.getItem("familyTasks")) || {};

// Инициализация задач текущего пользователя
if (!familyTasks[currentUserID]) {
    familyTasks[currentUserID] = [];
}

function saveFamilyTasks() {
    localStorage.setItem("familyTasks", JSON.stringify(familyTasks));
}

// ===== Рендер: только мои задачи =====
function renderMyTasks() {
    const container = document.getElementById("tablesContainer");
    container.innerHTML = `<h3>Мои дела (${role} ${user.name})</h3>`;

    const tasks = familyTasks[currentUserID] || [];
    if (tasks.length === 0) {
        container.innerHTML += "<p>Нет дел</p>";
        return;
    }

    const table = document.createElement("table");
    table.innerHTML = "<tr><th>Дело</th><th>Дата</th><th>Время</th><th>Период</th><th>Важное</th><th>Удалить</th></tr>";

    tasks.forEach((task, i) => {
        const row = table.insertRow();
        if (task.important) row.classList.add("important");
        row.innerHTML = `
            <td>${task.text}</td>
            <td>${task.date || ""}</td>
            <td>${task.time || ""}</td>
            <td>${task.period || ""}</td>
            <td><input type="checkbox" ${task.important ? "checked" : ""}></td>
            <td><button class="btn delBtn" data-index="${i}">X</button></td>
        `;
        row.querySelector("input").onchange = () => {
            task.important = !task.important;
            saveFamilyTasks();
            renderMyTasks();
        };
        row.querySelector(".delBtn").onclick = () => {
            familyTasks[currentUserID].splice(i, 1);
            saveFamilyTasks();
            renderMyTasks();
        };
    });

    container.appendChild(table);
}

// ===== Рендер: все дела семьи =====
function renderMerged() {
    const container = document.getElementById("tablesContainer");
    container.innerHTML = "<h3>Все дела семьи</h3>";

    const allEntries = [];
    const rolesMap = {
        'male_child': 'младший сын',
        'female_child': 'младшая дочь',
        'male_adult': 'сын',
        'female_adult': 'дочь',
        'male_senior': 'отец',
        'female_senior': 'мать'
    };

    for (const userID in familyTasks) {
        const tasks = familyTasks[userID] || [];
        const roleName = rolesMap[userID] || 'член семьи';
        tasks.forEach(t => allEntries.push({ ...t, userRole: roleName }));
    }

    if (allEntries.length === 0) {
        container.innerHTML += "<p>Нет дел у всей семьи</p>";
        return;
    }

    const table = document.createElement("table");
    table.innerHTML = "<tr><th>Кто</th><th>Дело</th><th>Дата</th><th>Время</th><th>Период</th><th>Важное</th></tr>";

    allEntries.forEach(t => {
        const row = table.insertRow();
        if (t.important) row.classList.add("important");
        row.innerHTML = `
            <td>${t.userRole}</td>
            <td>${t.text}</td>
            <td>${t.date || ""}</td>
            <td>${t.time || ""}</td>
            <td>${t.period || ""}</td>
            <td>${t.important ? "✓" : ""}</td>
        `;
    });

    container.appendChild(table);
}

// ===== Добавление задач =====
document.getElementById("addBtn").onclick = () => {
    const text = customTask.value.trim() || taskList.value;
    if (!text) return alert("Введите дело");
    if (!dateInput.value) return alert("Выберите дату");

    const dt = new Date(`${dateInput.value}T${timeInput.value || "00:00"}`);
    if (dt < new Date()) return alert("Нельзя в прошлом!");

    familyTasks[currentUserID].push({
        text, date: dateInput.value, time: timeInput.value || null,
        period: null, important: false
    });
    saveFamilyTasks();
    renderMyTasks();
    customTask.value = ""; taskList.value = "";
};

document.querySelectorAll(".periodBtn").forEach(btn => {
    btn.onclick = () => {
        const text = customTask.value.trim() || taskList.value;
        if (!text) return alert("Введите дело");

        familyTasks[currentUserID].push({
            text, period: btn.dataset.period, date: null, time: null, important: false
        });
        saveFamilyTasks();
        renderMyTasks();
        customTask.value = ""; taskList.value = "";
    };
});

// ===== Кнопки =====
document.getElementById("clearBtn").onclick = () => {
    if (confirm("Очистить ВСЕ мои дела?")) {
        familyTasks[currentUserID] = [];
        saveFamilyTasks();
        renderMyTasks();
    }
};

document.getElementById("mergeBtn").onclick = () => {
    renderMerged();
};

// ===== Старт =====
renderMyTasks();
