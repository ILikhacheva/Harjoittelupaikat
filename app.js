// Show/hide actions column header for teachers
function updateActionsHeader() {
  const actionsHeader = document.getElementById("actionsHeader");
  if (!actionsHeader) return;
  const isTeacher = localStorage.getItem("userRole") === "2";
  actionsHeader.style.display = isTeacher ? "table-cell" : "none";
}

// Call after login/logout and on load
window.addEventListener("DOMContentLoaded", updateActionsHeader);
window.addEventListener("storage", updateActionsHeader);
// Also call in updateAuthButtons
function updateAuthButtons() {
  // ...existing code...
  updateActionsHeader();
}
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
      // Сохраняем статус авторизации, имя и роль
      localStorage.setItem("isLoggedIn", "1");
      if (user && user.user_name) {
        localStorage.setItem("userName", user.user_name);
      }
      if (user && user.user_role !== undefined) {
        localStorage.setItem("userRole", String(user.user_role));
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
  localStorage.removeItem("userRole");
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

// Управление видимостью кнопок входа/выхода и доступом к меню/таблице
function updateAuthButtons() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const addStudentBtn = document.getElementById("addStudentBtn");
  const listStudentBtn = document.getElementById("listStudentBtn");
  const addCompanyBtn = document.getElementById("addCompanyBtn");
  const addPlaceBtn = document.getElementById("addPlaceBtn");
  const dataTable = document.getElementById("dataTable");
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userRole = localStorage.getItem("userRole");
  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
    // Учитель (роль 2) — всё доступно
    if (userRole === "2") {
      if (addStudentBtn) {
        addStudentBtn.disabled = false;
        addStudentBtn.setAttribute("aria-disabled", "false");
      }
      if (listStudentBtn) {
        listStudentBtn.disabled = false;
        listStudentBtn.setAttribute("aria-disabled", "false");
      }
      if (addCompanyBtn) {
        addCompanyBtn.disabled = false;
        addCompanyBtn.setAttribute("aria-disabled", "false");
      }
      if (addPlaceBtn) {
        addPlaceBtn.disabled = false;
        addPlaceBtn.setAttribute("aria-disabled", "false");
      }
    } else {
      // Студент — только просмотр списков
      if (addStudentBtn) {
        addStudentBtn.disabled = true;
        addStudentBtn.setAttribute("aria-disabled", "true");
      }
      if (listStudentBtn) {
        listStudentBtn.disabled = false;
        listStudentBtn.setAttribute("aria-disabled", "false");
      }
      if (addCompanyBtn) {
        addCompanyBtn.disabled = true;
        addCompanyBtn.setAttribute("aria-disabled", "true");
      }
      if (addPlaceBtn) {
        addPlaceBtn.disabled = true;
        addPlaceBtn.setAttribute("aria-disabled", "true");
      }
    }
    // Показываем таблицу для всех залогиненных
    if (dataTable) dataTable.style.display = "block";
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (addStudentBtn) {
      addStudentBtn.disabled = true;
      addStudentBtn.setAttribute("aria-disabled", "true");
    }
    if (listStudentBtn) {
      listStudentBtn.disabled = true;
      listStudentBtn.setAttribute("aria-disabled", "true");
    }
    if (addCompanyBtn) {
      addCompanyBtn.disabled = true;
      addCompanyBtn.setAttribute("aria-disabled", "true");
    }
    if (addPlaceBtn) {
      addPlaceBtn.disabled = true;
      addPlaceBtn.setAttribute("aria-disabled", "true");
    }
    if (dataTable) dataTable.style.display = "none";
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
function loadWorkplaceTable() {
  fetch("http://localhost:3000/workplace")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.getElementById("tableBody");
      tbody.innerHTML = "";
      const isTeacher = localStorage.getItem("userRole") === "2";
      // Получаем список компаний для select (один раз)
      let companiesList = [];
      fetch("http://localhost:3000/companies")
        .then((r) => r.json())
        .then((companies) => {
          companiesList = companies;
          renderRows();
        });
      function renderRows() {
        data.forEach((row, idx) => {
          const tr = document.createElement("tr");
          // Сохраняем row_id, student_id, company_id как data-атрибуты (row_id обязательно)
          tr.setAttribute("data-row-id", row.row_id);
          tr.setAttribute("data-student-id", row.student_id);
          tr.setAttribute("data-company-id", row.company_id);
          // Найти название компании по company_id
          let companyName = row.company_name;
          if (
            (!companyName || companyName === String(row.company_id)) &&
            Array.isArray(companiesList)
          ) {
            const found = companiesList.find(
              (c) => String(c.company_id) === String(row.company_id)
            );
            if (found) companyName = found.company_name;
          }
          // Форматировать даты в YYYY-MM-DD без смещения (UTC -> local)
          function formatDateOnly(date) {
            if (!date) return "";
            // Если это уже строка в формате YYYY-MM-DD, возвращаем как есть
            if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
              return date;
            }
            // Если это строка с временем (например, 2025-03-17T00:00:00.000Z)
            if (typeof date === "string" && date.length >= 10) {
              return date.slice(0, 10);
            }
            // Если это Date объект (fallback)
            if (date instanceof Date) {
              // Добавляем 12 часов чтобы избежать смещения
              const adjustedDate = new Date(
                date.getTime() + 12 * 60 * 60 * 1000
              );
              const year = adjustedDate.getUTCFullYear();
              const month = String(adjustedDate.getUTCMonth() + 1).padStart(
                2,
                "0"
              );
              const day = String(adjustedDate.getUTCDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            }
            return "";
          }
          const beginDate = formatDateOnly(row.begin_date);
          const endDate = formatDateOnly(row.end_date);
          // lunch_money: показывать Kyllä/Ei
          let lunchText =
            row.lunch_money === true || row.lunch_money === "true"
              ? "Kyllä"
              : "Ei";
          tr.innerHTML = `
            <td style="display:none;">${
              row.row_id
            }</td> <!-- скрытый столбец row_id -->
            <td style="display:none;">${
              row.student_id
            }</td> <!-- скрытый столбец student_id -->
            <td style="display:none;">${
              row.company_id
            }</td> <!-- скрытый столбец company_id -->
            <td data-student-id="${row.student_id || ""}">${row.st_name}</td>
            <td data-company-id="${row.company_id || ""}">${
            companyName || ""
          }</td>
            <td>${row.boss_name}</td>
            <td>${row.boss_phone}</td>
            <td>${row.boss_email}</td>
            <td>${beginDate}</td>
            <td>${endDate}</td>
            <td>${lunchText}</td>
            <td>${row.city}</td>
            <td><span class="${getStatusClass(row.status)}">${
            row.status
          }</span></td>
            ${
              isTeacher
                ? `<td><button class='edit-btn' data-idx='${idx}'>✏️</button> <button class='delete-btn' data-idx='${idx}'>🗑️</button></td>`
                : ""
            }
          `;
          tbody.appendChild(tr);
        });
      }
      // Add event delegation for edit/delete/inline save/cancel
      tbody.onclick = function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;
        const idx = btn.getAttribute("data-idx");
        if (btn.classList.contains("edit-btn")) {
          const tr = btn.closest("tr");
          if (!tr) return;
          const originalHTML = tr.innerHTML;
          const rowData = data[idx];
          // Получаем row_id из data-атрибута строки
          const rowId = tr.getAttribute("data-row-id") || rowData.row_id;
          // Форматировать даты для input[type='date']
          function formatDateInput(dateStr) {
            if (!dateStr) return "";
            const d = new Date(dateStr);
            if (isNaN(d)) return "";
            return d.toISOString().slice(0, 10);
          }
          const beginDateInputValue = formatDateInput(rowData.begin_date);
          const endDateInputValue = formatDateInput(rowData.end_date);

          // Найти корректный company_id для выбора
          let companyId = rowData.company_id;
          if (
            (!companyId || companyId === "" || companyId === undefined) &&
            rowData.company_name
          ) {
            const found = companiesList.find(
              (c) => c.company_name === rowData.company_name
            );
            if (found) companyId = found.company_id;
          }
          // Список компаний для select
          let companyOptions = companiesList
            .map(
              (c) =>
                `<option value="${c.company_id}" ${
                  String(c.company_id) === String(companyId) ? "selected" : ""
                }>${c.company_name}</option>`
            )
            .join("");
          // Select для ruokaraha
          let lunchOptions = `<option value="true" ${
            rowData.lunch_money == true || rowData.lunch_money === "true"
              ? "selected"
              : ""
          }>Kyllä</option><option value="false" ${
            rowData.lunch_money == false || rowData.lunch_money === "false"
              ? "selected"
              : ""
          }>Ei</option>`;
          // Select для статуса
          let statusOptions = `<option value="On" ${
            rowData.status === "On" ? "selected" : ""
          }>On</option><option value="Odottaa" ${
            rowData.status === "Odottaa" ? "selected" : ""
          }>Odottaa</option><option value="Ei" ${
            rowData.status === "Ei" ? "selected" : ""
          }>Ei</option>`;
          tr.innerHTML = `
            <td><input type='text' value="${rowData.st_name}" disabled style="width:90px;"></td>
            <td><select class='edit-company' style="width:110px;">${companyOptions}</select></td>
            <td><input type='text' class='edit-boss-name' value="${rowData.boss_name}" style="width:90px;"></td>
            <td><input type='text' class='edit-boss-phone' value="${rowData.boss_phone}" style="width:90px;"></td>
            <td><input type='text' class='edit-boss-email' value="${rowData.boss_email}" style="width:110px;"></td>
            <td><input type='date' class='edit-begin-date' value="${beginDateInputValue}" style="width:110px;"></td>
            <td><input type='date' class='edit-end-date' value="${endDateInputValue}" style="width:110px;"></td>
            <td><select class='edit-lunch' style="width:70px;">${lunchOptions}</select></td>
            <td><input type='text' class='edit-city' value="${rowData.city}" style="width:90px;"></td>
            <td><select class='edit-status' style="width:90px;">${statusOptions}</select></td>
            <td>
              <button class='save-btn' data-idx='${idx}'>💾</button>
              <button class='cancel-btn' data-idx='${idx}'>✖️</button>
            </td>
          `;
          tr._originalHTML = originalHTML;
        } else if (btn.classList.contains("cancel-btn")) {
          // Restore original row
          const tr = btn.closest("tr");
          if (tr && tr._originalHTML) {
            tr.innerHTML = tr._originalHTML;
          } else {
            // fallback: reload table
            loadWorkplaceTable();
          }
        } else if (btn.classList.contains("save-btn")) {
          // Диагностика: срабатывает ли обработчик
          console.log("save-btn clicked");
          // Если кнопка внутри формы, предотвратить submit
          if (e && typeof e.preventDefault === "function") e.preventDefault();
          const tr = btn.closest("tr");
          const rowData = data[idx];
          // Получаем row_id из data-атрибута строки
          const rowId = tr.getAttribute("data-row-id") || rowData.row_id;
          // Получаем значения по уникальным классам
          const companyInput = tr.querySelector(".edit-company");
          const bossNameInput = tr.querySelector(".edit-boss-name");
          const bossPhoneInput = tr.querySelector(".edit-boss-phone");
          const bossEmailInput = tr.querySelector(".edit-boss-email");
          const beginDateInput = tr.querySelector(".edit-begin-date");
          const endDateInput = tr.querySelector(".edit-end-date");
          const lunchInput = tr.querySelector(".edit-lunch");
          const cityInput = tr.querySelector(".edit-city");
          const statusInput = tr.querySelector(".edit-status");

          const payload = {
            row_id: rowId,
            company_id: companyInput
              ? Number(companyInput.value)
              : Number(rowData.company_id),
            boss_name: bossNameInput ? bossNameInput.value : rowData.boss_name,
            boss_phone: bossPhoneInput
              ? bossPhoneInput.value
              : rowData.boss_phone,
            boss_email: bossEmailInput
              ? bossEmailInput.value
              : rowData.boss_email,
            begin_date: beginDateInput
              ? beginDateInput.value
              : rowData.begin_date,
            end_date: endDateInput ? endDateInput.value : rowData.end_date,
            lunch_money: lunchInput ? lunchInput.value : rowData.lunch_money,
            city: cityInput ? cityInput.value : rowData.city,
            status: statusInput ? statusInput.value : rowData.status,
          };
          // Диагностика: выводим все данные
          alert(
            "Отправляемые данные (PUT):\n" + JSON.stringify(payload, null, 2)
          );
          fetch("http://localhost:3000/workplace", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
            .then(async (res) => {
              const text = await res.text();
              // Диагностика: показываем ответ сервера
              alert("Ответ сервера (PUT):\n" + text);
              if (res.ok) {
                location.reload();
              } else {
                throw new Error(text);
              }
            })
            .catch((err) => {
              alert("Virhe tallennuksessa: " + err.message);
            });
        } else if (btn.classList.contains("delete-btn")) {
          if (confirm("Удалить строку " + idx + "?")) {
            const rowData = data[idx];
            fetch("http://localhost:3000/workplace", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                student_id: rowData.student_id,
                company_id: rowData.company_id,
              }),
            })
              .then((res) => {
                if (res.ok) {
                  loadWorkplaceTable();
                } else {
                  return res.text().then((text) => {
                    throw new Error(text);
                  });
                }
              })
              .catch((err) => {
                alert("Virhe poistossa: " + err.message);
              });
          }
        }
      };
    });
}
// Call on load and after login/logout
window.addEventListener("DOMContentLoaded", loadWorkplaceTable);
window.addEventListener("storage", loadWorkplaceTable);
// Also reload table after login/logout

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
