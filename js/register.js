function validSurname(v) {
    return /^[А-ЯЁ][а-яё]+$/.test(v);
}
function validName(v) {
    return /^[А-ЯЁ][а-яё]+$/.test(v);
}
function validAge(v) {
    return v >= 0 && v <= 999;
}
function validLogin(v) {
    return /^[A-Za-z]{4}\d{2}$/.test(v);
}
function validPassword(v) {
    return v.length <= 8 && /[A-Za-z]/.test(v) && /\d/.test(v) && /[.,!?;:@#$%^&*]/.test(v);
}

document.getElementById("registerBtn").onclick = () => {
    const surname = document.getElementById("surname").value;
    const nameVal = document.getElementById("name").value;
    const ageVal = document.getElementById("age").value;
    const genderVal = document.getElementById("gender").value;
    const loginVal = document.getElementById("login").value;
    const passVal = document.getElementById("password").value;
    const error = document.getElementById("error");

    if (!surname || !nameVal || !ageVal || !genderVal || !loginVal || !passVal) {
        error.textContent = "Все поля должны быть заполнены.";
        error.className = "";
        return;
    }
    if (!validSurname(surname)) {
        error.textContent = "Фамилия — первая заглавная, кириллица.";
        return;
    }
    if (!validName(nameVal)) {
        error.textContent = "Имя — первая заглавная, кириллица.";
        return;
    }
    if (!validAge(+ageVal)) {
        error.textContent = "Возраст 0–999.";
        return;
    }
    if (!validLogin(loginVal)) {
        error.textContent = "Логин: 4 буквы + 2 цифры.";
        return;
    }
    if (!validPassword(passVal)) {
        error.textContent = "Пароль: до 8 символов, буквы, цифры, знаки.";
        return;
    }

    const user = { 
        surname, 
        name: nameVal, 
        age: +ageVal, 
        gender: genderVal,
        login: loginVal, 
        pass: passVal 
    };
    localStorage.setItem("plannerUser", JSON.stringify(user));
    error.textContent = "✅ Регистрация успешна! Теперь нажмите 'Войти'.";
    error.className = "success";
};

document.getElementById("loginBtn").onclick = () => {
    const loginVal = document.getElementById("login").value;
    const passVal = document.getElementById("password").value;
    const error = document.getElementById("error");
    
    const user = JSON.parse(localStorage.getItem("plannerUser"));
    if (!user) {
        error.textContent = "Сначала зарегистрируйтесь.";
        error.className = "";
        return;
    }
    
    if (user.login !== loginVal || user.pass !== passVal) {
        error.textContent = "Неверный логин или пароль.";
        error.className = "";
        return;
    }
    
    window.location.href = "31.html";
};
