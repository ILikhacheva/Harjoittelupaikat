// --- Student List Modal Logic ---
function openStudentListModal() {
  document.getElementById("StudentListModalOverlay").style.display = "flex";
  loadStudentList();
}
function closeStudentListModal() {
  document.getElementById("StudentListModalOverlay").style.display = "none";
}

async function loadStudentList() {
  const tbody = document.getElementById("studentListTableBody");
  tbody.innerHTML = "<tr><td colspan='2'>Ladataan...</td></tr>";
  try {
    const res = await fetch("http://localhost:3000/students-full");
    if (!res.ok) throw new Error("Virhe haettaessa opiskelijoita");
    const students = await res.json();
    if (!students.length) {
      tbody.innerHTML = "<tr><td colspan='2'>Ei opiskelijoita</td></tr>";
      return;
    }
    tbody.innerHTML = "";
    students.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${s.st_name}</td><td>${s.st_group}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan='3'>Virhe: ${e.message}</td></tr>`;
  }
}
// --- Company List Modal Logic ---
function openCompanyListModal() {
  document.getElementById("CompanyListModalOverlay").style.display = "flex";
  loadCompanyList();
}
function closeCompanyListModal() {
  document.getElementById("CompanyListModalOverlay").style.display = "none";
}

async function loadCompanyList() {
  const tbody = document.getElementById("companyListTableBody");
  tbody.innerHTML = "<tr><td colspan='3'>Ladataan...</td></tr>";
  try {
    const res = await fetch("http://localhost:3000/companies-full");
    if (!res.ok) throw new Error("Virhe haettaessa yrityksiä");
    const companies = await res.json();
    if (!companies.length) {
      tbody.innerHTML = "<tr><td colspan='3'>Ei yrityksiä</td></tr>";
      return;
    }
    tbody.innerHTML = "";
    companies.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${c.company_name}</td><td>${c.count_place}</td><td>${c.tunnus}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan='3'>Virhe: ${e.message}</td></tr>`;
  }
}
// --- Login/Logout modal logic ---
function openLoginModal() {
  document.getElementById("LoginModalOverlay").style.display = "flex";
}
function closeLoginModal() {
  document.getElementById("LoginModalOverlay").style.display = "none";
}
function openLogoutModal() {
  document.getElementById("LogoutModalOverlay").style.display = "flex";
}
function closeLogoutModal() {
  document.getElementById("LogoutModalOverlay").style.display = "none";
}

// Login form submit
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    // TODO: заменить URL на ваш реальный эндпоинт
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const user = await res.json();
      closeLoginModal();
      // Сохраняем статус авторизации и имя
      localStorage.setItem("isLoggedIn", "1");
      if (user && user.user_name) {
        localStorage.setItem("userName", user.user_name);
      }
      updateAuthButtons();
      updateGreeting();
    } else {
      alert("Virhe kirjautumisessa!");
    }
  });
}

// Logout logic
function logoutUser() {
  closeLogoutModal();
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userName");
  updateAuthButtons();
  updateGreeting();
}
// Приветствие пользователя
function updateGreeting() {
  const greeting = document.getElementById("userGreeting");
  const name = localStorage.getItem("userName");
  if (localStorage.getItem("isLoggedIn") && name) {
    greeting.textContent = `Hello, ${name}`;
    greeting.style.display = "block";
  } else {
    greeting.textContent = "";
    greeting.style.display = "none";
  }
}

window.addEventListener("DOMContentLoaded", updateGreeting);

// Управление видимостью кнопок входа/выхода
function updateAuthButtons() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  if (localStorage.getItem("isLoggedIn")) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

// Инициализация при загрузке страницы
window.addEventListener("DOMContentLoaded", updateAuthButtons);
// Функция для выбора CSS-класса по статусу
function getStatusClass(status) {
  if (status === "On") return "status-on";
  if (status === "Odottaa") return "status-odottaa";
  return "status-ei";
}
// Открытие модального окна регистрации (Kirjaudu)
function openKirjauduModal() {
  document.getElementById("UsersModalOverlay").style.display = "block";
}

// Закрытие модального окна регистрации
function closeUsersModal() {
  document.getElementById("UsersModalOverlay").style.display = "none";
}
// --- UsersModalOverlay: роли и кодовое слово ---
const roleStudent = document.getElementById("roleStudent");
const roleTeacher = document.getElementById("roleTeacher");
const teacherCodeGroup = document.getElementById("teacherCodeGroup");
const teacherCodeInput = document.getElementById("TeacherCode");
const codeError = document.getElementById("codeError");
const studentSelectGroup = document.getElementById("studentSelectGroup");
const teacherNameGroup = document.getElementById("teacherNameGroup");
const userStudentSelect = document.getElementById("UserStudentSelect");
const userNimiTeacher = document.getElementById("UserNimiTeacher");
const userEmailGroup = document.getElementById("UserEmailGroup");
const userPasswordGroup = document.getElementById("UserPasswordGroup");
const userEmail = document.getElementById("UserEmail");
const userPassword = document.getElementById("UserPassword");

function updateUserModalRole() {
  if (roleStudent.checked) {
    // Показываем поля для студента
    studentSelectGroup.style.display = "block";
    teacherNameGroup.style.display = "none";
    teacherCodeGroup.style.display = "none";
    codeError.style.display = "none";
    // Управляем required атрибутами
    userStudentSelect.setAttribute("required", "required");
    userNimiTeacher.removeAttribute("required");
    teacherCodeInput.removeAttribute("required");
  } else {
    // Показываем поля для преподавателя
    studentSelectGroup.style.display = "none";
    teacherNameGroup.style.display = "block";
    teacherCodeGroup.style.display = "block";
    // Управляем required атрибутами
    userStudentSelect.removeAttribute("required");
    userNimiTeacher.setAttribute("required", "required");
    teacherCodeInput.setAttribute("required", "required");
  }
}

if (roleStudent && roleTeacher) {
  roleStudent.addEventListener("change", updateUserModalRole);
  roleTeacher.addEventListener("change", updateUserModalRole);
  updateUserModalRole();
}

// Заполнить список студентов
async function populateUserStudentSelect() {
  if (!userStudentSelect) return;
  userStudentSelect.innerHTML = '<option value="">Valitse...</option>';
  try {
    const res = await fetch("http://localhost:3000/students");
    if (res.ok) {
      const students = await res.json();
      students.forEach((st) => {
        const opt = document.createElement("option");
        opt.value = st.student_id;
        opt.textContent = st.st_name;
        userStudentSelect.appendChild(opt);
      });
    }
  } catch {}
}
populateUserStudentSelect();

const usersForm = document.getElementById("Users-form");
if (usersForm) {
  usersForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    let nimi = "";
    let role = 3; // По умолчанию student

    if (roleTeacher && roleTeacher.checked) {
      role = 2; // teacher
      // Проверка кодового слова
      const code = teacherCodeInput.value;
      let valid = false;
      try {
        const res = await fetch("/api/teacher-code");
        if (res.ok) {
          const { code: envCode } = await res.json();
          valid = code === envCode;
        }
      } catch (err) {
        console.error("Ошибка при проверке кода:", err);
      }
      if (!valid) {
        codeError.style.display = "inline";
        teacherCodeInput.focus();
        return false;
      } else {
        codeError.style.display = "none";
      }
      // Проверка имени учителя
      if (!userNimiTeacher.value.trim()) {
        userNimiTeacher.focus();
        return false;
      }
      nimi = userNimiTeacher.value.trim();
    } else if (roleStudent && roleStudent.checked) {
      role = 3; // student
      // Проверка выбора студента
      if (!userStudentSelect.value) {
        userStudentSelect.focus();
        return false;
      }
      // Получаем имя выбранного студента
      const selectedOption =
        userStudentSelect.options[userStudentSelect.selectedIndex];
      nimi = selectedOption.textContent;
    }

    const email = userEmail.value.trim();
    const password = userPassword.value;

    if (!email || !password) {
      alert("Täytä kaikki kentät!");
      return false;
    }

    // Отправка данных на сервер
    try {
      let payload = { nimi, email, password, role };
      if (role === 3 && userStudentSelect && userStudentSelect.value) {
        payload.student_id = userStudentSelect.value;
      }
      const res = await fetch("http://localhost:3000/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(res);
      if (res.ok) {
        alert("Rekisteröinti onnistui!");
        closeUsersModal();
        usersForm.reset();
      } else if (res.status === 409) {
        alert(
          "A user with this email already exists. Please use another email."
        );
        // Оставляем окно регистрации открытым, можно добавить фокус на email
        userEmail.focus();
      } else {
        const text = await res.text();
        alert("Registration error: " + text);
      }
    } catch (err) {
      alert("Verkkovirhe: " + err.message);
    }
  });
}
// lisaa yritykset:  select Yritys
async function YritysSelect() {
  const select = document.getElementById("PaikanNimi");
  if (!select) return;
  try {
    const res = await fetch("http://localhost:3000/companies");
    if (!res.ok) return;
    const companies = await res.json();
    // Удалить старые опции, кроме первой
    while (select.options.length > 1) select.remove(1);
    companies.forEach((st) => {
      const opt = document.createElement("option");
      opt.value = st.company_id;
      opt.textContent = st.company_name;
      select.appendChild(opt);
    });
  } catch (e) {
    // можно добавить обработку ошибки
  }
}

// Подгрузка студентов в select Oppilas
async function populateStudentsSelect() {
  const select = document.getElementById("OppilasLista");
  if (!select) return;
  try {
    const res = await fetch("http://localhost:3000/students");
    if (!res.ok) return;
    const students = await res.json();
    // Удалить старые опции, кроме первой
    while (select.options.length > 1) select.remove(1);
    students.forEach((st) => {
      const opt = document.createElement("option");
      opt.value = st.student_id;
      opt.textContent = st.st_name;
      select.appendChild(opt);
    });
  } catch (e) {
    // можно добавить обработку ошибки
  }
}

// Заполнять select при открытии модального окна
const paikkaBtn = document.querySelector('button[onclick*="openPaikkaModal"]');
if (paikkaBtn) {
  paikkaBtn.addEventListener("click", populateStudentsSelect);
  paikkaBtn.addEventListener("click", YritysSelect);
}
// Если форма может открываться иначе, можно вызвать populateStudentsSelect() при загрузке страницы

// Side menu logic
function openSideMenu() {
  document.getElementById("sideMenu").style.display = "block";
}
function closeSideMenu() {
  document.getElementById("sideMenu").style.display = "none";
}
// Modal open helpers
function openOppilasModal() {
  document.getElementById("OppilasModalOverlay").style.display = "flex";
}
function closeOppilasModal() {
  document.getElementById("OppilasModalOverlay").style.display = "none";
}
function openYritysModal() {
  document.getElementById("YritysModalOverlay").style.display = "flex";
}
function closeYritysModal() {
  document.getElementById("YritysModalOverlay").style.display = "none";
}
function openPaikkaModal() {
  document.getElementById("PaikkaModalOverlay").style.display = "flex";
}
function closePaikkaModal() {
  document.getElementById("PaikkaModalOverlay").style.display = "none";
}

// Fetch and display workplace data
fetch("http://localhost:3000/workplace")
  .then((response) => response.json())
  .then((data) => {
    // Здесь data — это массив объектов из вашего SQL-запроса
    // Например, вывести в таблицу:
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";
    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.st_name}</td>
        <td>${row.company_name}</td>
        <td>${row.boss_name}</td>
        <td>${row.boss_phone}</td>
        <td>${row.boss_email}</td>
        <td>${row.begin_date}</td>
        <td>${row.end_date}</td>
        <td>${row.lunch_money}</td>
        <td>${row.city}</td>
        <td><span class="${getStatusClass(row.status)}">${
        row.status
      }</span></td>
      `;
      tbody.appendChild(tr);
    });
  });

// Lisaaminen oppilasta
document
  .getElementById("oppilas-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const nimi = document.getElementById("OppilasNimi").value;
    const ryhma = document.getElementById("RyhmanNimi").value;
    const res = await fetch("http://localhost:3000/add-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nimi, ryhma }),
    });
    if (res.ok) {
      closeOppilasModal();
    } else {
      const text = await res.text();
      alert("Virhe tallennuksessa: " + text);
    }
  });

// Lisaaminen yritystä
document
  .getElementById("yritys-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const nimi = document.getElementById("YrityksenNimi").value;
    const count_place = document.getElementById("PaikkojenMaara").value;
    const y_tunnus = document.getElementById("YrityksenTunnus").value;
    const res = await fetch("http://localhost:3000/add-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nimi, count_place, y_tunnus }),
    });
    if (res.ok) {
      closeYritysModal();
    } else {
      const text = await res.text();
      alert("Virhe tallennuksessa: " + text);
    }
  });

// lisaaminen paikkaa
document
  .getElementById("paikka-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const student_id = parseInt(
      document.getElementById("OppilasLista").value,
      10
    );
    const company_id = parseInt(
      document.getElementById("PaikanNimi").value,
      10
    );
    console.log("Valitut ID:t:", student_id, company_id);
    if (
      isNaN(student_id) ||
      student_id === -1 ||
      isNaN(company_id) ||
      company_id === -1
    ) {
      alert("Valitse opiskelija ja paikka!");
      return;
    }
    const ohjaaja = document.getElementById("Ohjaaja").value;
    const puhelin = document.getElementById("Puhelin").value;
    const email = document.getElementById("Email").value;
    const alku = document.getElementById("Alku").value;
    const loppu = document.getElementById("Loppu").value;
    let ruokaraha = document.getElementById("Ruokaraha").value;
    if (ruokaraha === "true") ruokaraha = true;
    else if (ruokaraha === "false") ruokaraha = false;
    const kaupunki = document.getElementById("Kaupunki").value;
    const status = document.getElementById("Status").value;

    const res = await fetch("http://localhost:3000/add-workplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id,
        company_id,
        ohjaaja,
        puhelin,
        email,
        alku,
        loppu,
        ruokaraha,
        kaupunki,
        status,
      }),
    });
    if (res.ok) {
      closePaikkaModal();
      // Перезагрузка страницы для обновления данных
      location.reload();
    } else {
      const text = await res.text();
      alert("Virhe tallennuksessa: " + text);
    }
  });
