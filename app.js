// =====================================================
// СИСТЕМА УПРАВЛЕНИЯ МЕСТАМИ ПРАКТИКИ
// HARJOITTELUPAIKKOJEN HALLINTAJÄRJESTELMÄ
// =====================================================
//
// Этот файл содержит весь клиентский JavaScript код для системы
// управления местами практики. Включает функции для:
//
// Tämä tiedosto sisältää kaiken asiakaspuolen JavaScript-koodin
// harjoittelupaikkojen hallintajärjestelmälle. Sisältää toiminnot:
//
// - Управление модальными окнами (студенты, компании, места практики)
//   Modal-ikkunoiden hallinta (opiskelijat, yritykset, harjoittelupaikat)
//
// - Встроенное редактирование в таблицах (для учителей)
//   Sisäänrakennettu taulukkomuokkaus (opettajille)
//
// - Аутентификация и авторизация пользователей
//   Käyttäjien autentikointi ja auktorisointi
//
// - Управление правами доступа по ролям (студент/учитель)
//   Roolipohjainen käyttöoikeuksien hallinta (opiskelija/opettaja)
//
// - Ограничения дат (только будущие даты)
//   Päivämäärärajoitukset (vain tulevat päivämäärät)
//
// =====================================================

// =====================================================
// ФУНКЦИИ УПРАВЛЕНИЯ ВИДИМОСТЬЮ КОЛОНОК И ЭЛЕМЕНТОВ
// TOIMINTOJEN NÄKYVYYDEN HALLINTA FUNKTIOT
// =====================================================

// Показать/скрыть заголовок колонки действий для учителей и студентов
// Näytä/piilota toimintojen sarakkeen otsikko opettajille ja opiskelijoille
function updateActionsHeader() {
  // Получаем элемент заголовка колонки действий в основной таблице
  // Haetaan toimintojen sarakkeen otsikko elementti päätaulukosta
  const actionsHeader = document.getElementById("actionsHeader");

  // Если элемент не найден, выходим из функции
  // Jos elementtiä ei löydy, poistutaan funktiosta
  if (!actionsHeader) return;

  // Проверяем роль пользователя из localStorage (2 = учитель, 3 = студент)
  // Tarkistetaan käyttäjän rooli localStoragesta (2 = opettaja, 3 = opiskelija)
  const isTeacher = localStorage.getItem("userRole") === "2";
  const isStudent = localStorage.getItem("userRole") === "3";

  // Показываем столбец действий только для учителей и студентов
  // Näytetään toimintosarake vain opettajille ja opiskelijoille
  actionsHeader.style.display = isTeacher || isStudent ? "table-cell" : "none";
}

// =====================================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// SOVELLUKSEN ALUSTUS SIVUN LATAUTUESSA
// =====================================================

// Вызываем функции после загрузки страницы и после входа/выхода
// Kutsutaan funktioita sivun latauduttua ja kirjautumisen/uloskirjautumisen jälkeen
window.addEventListener("DOMContentLoaded", function () {
  // Обновляем видимость заголовков колонок действий
  // Päivitetään toimintosarakkeiden otsikoiden näkyvyys
  updateActionsHeader();

  // Инициализируем ограничения дат при загрузке страницы
  // Alustetaan päivämäärärajoitukset sivun latautuessa
  setMinDatesForWorkplace();
});

// Слушаем изменения в localStorage (например, при входе/выходе)
// Kuunnellaan localStorage muutoksia (esim. kirjautumisessa/uloskirjautumisessa)
window.addEventListener("storage", updateActionsHeader);

// =====================================================
// ФУНКЦИИ МОДАЛЬНОГО ОКНА СПИСКА СТУДЕНТОВ
// OPISKELIJALUETTELON MODAL-IKKUNAN FUNKTIOT
// =====================================================

// Открыть модальное окно со списком студентов
// Avaa opiskelijaluettelon modal-ikkuna
function openStudentListModal() {
  // Делаем модальное окно видимым (display: flex для центрирования)
  // Tehdään modal-ikkuna näkyväksi (display: flex keskitystä varten)
  document.getElementById("StudentListModalOverlay").style.display = "flex";

  // Загружаем список студентов с сервера
  // Ladataan opiskelijalista palvelimelta
  loadStudentList();
}

// Закрыть модальное окно со списком студентов
// Sulje opiskelijaluettelon modal-ikkuna
function closeStudentListModal() {
  // Скрываем модальное окно
  // Piilotetaan modal-ikkuna
  document.getElementById("StudentListModalOverlay").style.display = "none";
}

// Загрузить и отобразить список студентов в таблице
// Lataa ja näytä opiskelijalista taulukossa
async function loadStudentList() {
  // Получаем тело таблицы студентов для заполнения данными
  // Haetaan opiskelijataulukon runko tietojen täyttämiseksi
  const tbody = document.getElementById("studentListTableBody");

  // Проверяем, является ли текущий пользователь учителем
  // Tarkistetaan onko nykyinen käyttäjä opettaja
  const isTeacher = localStorage.getItem("userRole") === "2";

  // Получаем заголовок колонки действий в таблице студентов
  // Haetaan toimintosarakkeen otsikko opiskelijataulukosta
  const actionsHeader = document.getElementById("studentActionsHeader");

  // Показываем/скрываем колонку действий для учителей
  // Näytetään/piilotetaan toimintosarake opettajille
  if (actionsHeader) {
    actionsHeader.style.display = isTeacher ? "table-cell" : "none";
  }

  // Определяем количество колонок для сообщений (с действиями или без)
  // Määritetään sarakkeiden määrä viestejä varten (toimintojen kanssa tai ilman)
  const colspan = isTeacher ? "4" : "3";

  // Показываем сообщение о загрузке
  // Näytetään latausviesti
  tbody.innerHTML = `<tr><td colspan='${colspan}'>Ladataan...</td></tr>`;

  try {
    // Отправляем запрос на сервер для получения списка студентов
    // Lähetetään pyyntö palvelimelle opiskelijalistan hakemiseksi
    const res = await fetch("http://localhost:3000/students-full");

    // Проверяем успешность запроса
    // Tarkistetaan pyynnön onnistuminen
    if (!res.ok) throw new Error("Virhe haettaessa opiskelijoita");

    // Парсим JSON-ответ от сервера
    // Jäsennetään JSON-vastaus palvelimelta
    const students = await res.json();

    // Если студентов нет, показываем соответствующее сообщение
    // Jos opiskelijoita ei ole, näytetään vastaava viesti
    if (!students.length) {
      tbody.innerHTML = `<tr><td colspan='${colspan}'>Ei opiskelijoita</td></tr>`;
      return;
    }

    // Очищаем таблицу перед добавлением данных
    // Tyhjennetään taulukko ennen tietojen lisäämistä
    tbody.innerHTML = "";

    // Перебираем всех студентов и создаем для каждого строку таблицы
    // Käydään läpi kaikki opiskelijat ja luodaan kullekin taulukon rivi
    students.forEach((s, idx) => {
      // Создаем новую строку таблицы
      // Luodaan uusi taulukon rivi
      const tr = document.createElement("tr");

      // Добавляем ID студента как атрибут для идентификации
      // Lisätään opiskelijan ID attribuutiksi tunnistusta varten
      tr.setAttribute("data-student-id", s.st_id);

      // Создаем кнопки действий только для учителей (кнопка редактирования с иконкой карандаша)
      // Luodaan toimintopainikkeet vain opettajille (muokkaus painike lyijykynä ikonilla)
      const actionButtons = isTeacher
        ? `<td><button class='edit-student-btn' data-idx='${idx}'>✏️</button></td>`
        : "";
      // Заполняем строку данными: имя студента, фамилия, группа и кнопки действий
      // Täytetään rivi tiedoilla: opiskelijan nimi, sukunimi, ryhmä ja toimintopainikkeet
      tr.innerHTML = `<td>${s.st_name}</td><td>${s.st_s_name || ""}</td><td>${
        s.st_group
      }</td>${actionButtons}`;

      // Добавляем строку в тело таблицы
      // Lisätään rivi taulukon runkoon
      tbody.appendChild(tr);
    });

    // Добавляем обработчик событий для кнопок редактирования (делегирование событий)
    // Lisätään tapahtumankäsittelijä muokkauspainikkeille (event delegation)
    if (isTeacher) {
      tbody.onclick = function (e) {
        // Ищем нажатую кнопку
        // Etsitään painettua painiketta
        const btn = e.target.closest("button");

        // Проверяем, что это именно кнопка редактирования студента
        // Tarkistetaan että kyseessä on opiskelijan muokkauspainike
        if (!btn || !btn.classList.contains("edit-student-btn")) return;

        // Получаем индекс студента из атрибута кнопки
        // Haetaan opiskelijan indeksi painikkeen attribuutista
        const idx = btn.getAttribute("data-idx");

        // Получаем строку таблицы, содержащую кнопку
        // Haetaan taulukon rivi, joka sisältää painikkeen
        const tr = btn.closest("tr");

        // Получаем данные студента по индексу
        // Haetaan opiskelijan tiedot indeksin perusteella
        const student = students[idx];

        // Вызываем функцию редактирования строки студента
        // Kutsutaan opiskelijan rivin muokkaustoimintoa
        editStudentRow(tr, student, students, idx);
      };
    }

    // Заполняем список групп для фильтра и инициализируем поиск
    // Täytetään ryhmälista suodatinta varten ja alustetaan haku
    populateGroupFilter(students);
    initializeStudentSearch();
  } catch (e) {
    // Обработка ошибок - показываем сообщение об ошибке в таблице
    // Virheiden käsittely - näytetään virheviesti taulukossa
    tbody.innerHTML = `<tr><td colspan='${colspan}'>Virhe: ${e.message}</td></tr>`;
  }
}

// =====================================================
// ФУНКЦИИ МОДАЛЬНОГО ОКНА СПИСКА КОМПАНИЙ
// YRITYSLUETTELON MODAL-IKKUNAN FUNKTIOT
// =====================================================

// Открыть модальное окно со списком компаний
// Avaa yritysluettelon modal-ikkuna
function openCompanyListModal() {
  // Делаем модальное окно видимым
  // Tehdään modal-ikkuna näkyväksi
  document.getElementById("CompanyListModalOverlay").style.display = "flex";

  // Показываем/скрываем колонку действий для учителей
  // Näytetään/piilotetaan toimintosarake opettajille
  const actionsHeader = document.getElementById("companyActionsHeader");
  const isTeacher = localStorage.getItem("userRole") === "2";
  if (actionsHeader) {
    actionsHeader.style.display = isTeacher ? "table-cell" : "none";
  }

  // Загружаем список компаний с сервера
  // Ladataan yritysluettelo palvelimelta
  loadCompanyList();
}
function closeCompanyListModal() {
  document.getElementById("CompanyListModalOverlay").style.display = "none";
}

async function loadCompanyList() {
  const tbody = document.getElementById("companyListTableBody");
  const isTeacher = localStorage.getItem("userRole") === "2";
  tbody.innerHTML = `<tr><td colspan='${
    isTeacher ? 5 : 4
  }'>Ladataan...</td></tr>`;
  try {
    const res = await fetch("http://localhost:3000/companies-full");
    if (!res.ok) throw new Error("Virhe haettaessa yrityksiä");
    const companies = await res.json();
    if (!companies.length) {
      tbody.innerHTML = `<tr><td colspan='${
        isTeacher ? 5 : 4
      }'>Ei yrityksiä</td></tr>`;
      return;
    }
    tbody.innerHTML = "";
    companies.forEach((c, idx) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-company-id", c.company_id);
      const actionButtons = isTeacher
        ? `<td><button class='edit-company-btn' data-idx='${idx}'>✏️</button></td>`
        : "";
      tr.innerHTML = `<td>${c.company_name}</td><td>${c.count_place}</td><td>${
        c.tunnus
      }</td><td>${c.address || ""}</td>${actionButtons}`;
      tbody.appendChild(tr);
    });

    // Add event delegation for edit buttons
    if (isTeacher) {
      tbody.onclick = function (e) {
        const btn = e.target.closest("button");
        if (!btn || !btn.classList.contains("edit-company-btn")) return;
        const idx = btn.getAttribute("data-idx");
        const tr = btn.closest("tr");
        const company = companies[idx];
        editCompanyRow(tr, company, companies, idx);
      };
    }

    // Заполняем список адресов для фильтра и инициализируем поиск
    // Täytetään osoitelista suodatinta varten ja alustetaan haku
    populateAddressFilter(companies);
    initializeCompanySearch();
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan='${isTeacher ? 5 : 4}'>Virhe: ${
      e.message
    }</td></tr>`;
  }
}

// Function to edit company row
function editCompanyRow(tr, company, companies, idx) {
  const originalHTML = tr.innerHTML;
  tr.innerHTML = `
    <td><input type='text' class='edit-company-name' value="${
      company.company_name
    }" style="width:150px;"></td>
    <td><input type='number' class='edit-count-place' value="${
      company.count_place
    }" style="width:80px;"></td>
    <td><input type='text' class='edit-tunnus' value="${
      company.tunnus
    }" style="width:100px;"></td>
    <td><input type='text' class='edit-address' value="${
      company.address || ""
    }" style="width:120px;"></td>
    <td>
      <button class='save-company-btn' data-idx='${idx}'>💾</button>
      <button class='cancel-company-btn' data-idx='${idx}'>✖️</button>
    </td>
  `;
  tr._originalHTML = originalHTML;

  // Add event listeners for save/cancel
  const saveBtn = tr.querySelector(".save-company-btn");
  const cancelBtn = tr.querySelector(".cancel-company-btn");

  saveBtn.onclick = async function (e) {
    e.preventDefault();
    const companyName = tr.querySelector(".edit-company-name").value;
    const countPlace = tr.querySelector(".edit-count-place").value;
    const tunnus = tr.querySelector(".edit-tunnus").value;
    const address = tr.querySelector(".edit-address").value;

    try {
      const res = await fetch(
        `http://localhost:3000/companies/${company.company_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: companyName,
            count_place: parseInt(countPlace),
            tunnus: tunnus,
            address: address,
          }),
        }
      );

      if (res.ok) {
        loadCompanyList(); // Reload the list
      } else {
        const text = await res.text();
        alert("Virhe tallennuksessa: " + text);
      }
    } catch (err) {
      alert("Virhe tallennuksessa: " + err.message);
    }
  };

  cancelBtn.onclick = function () {
    tr.innerHTML = originalHTML;
  };
}

// =====================================================
// ФУНКЦИИ ВСТРОЕННОГО РЕДАКТИРОВАНИЯ СТРОК ТАБЛИЦЫ
// TAULUKKORIVIEN SISÄÄNRAKENNETUT MUOKKAUSTOIMINNOT
// =====================================================

// Функция редактирования строки студента прямо в таблице
// Opiskelijan rivin muokkaustoiminto suoraan taulukossa
function editStudentRow(tr, student, students, idx) {
  // Сохраняем оригинальный HTML строки для возможности отмены
  // Tallennetaan rivin alkuperäinen HTML peruuttamisen mahdollistamiseksi
  const originalHTML = tr.innerHTML;

  // Заменяем содержимое строки на поля ввода для редактирования
  // Korvataan rivin sisältö syöttökentillä muokkausta varten
  tr.innerHTML = `
    <td><input type='text' class='edit-student-name' value="${
      student.st_name
    }" style="width:150px;"></td>
    <td><input type='text' class='edit-student-surname' value="${
      student.st_s_name || ""
    }" style="width:150px;"></td>
    <td><input type='text' class='edit-student-group' value="${
      student.st_group
    }" style="width:120px;"></td>
    <td>
      <button class='save-student-btn' data-idx='${idx}'>💾</button>
      <button class='cancel-student-btn' data-idx='${idx}'>✖️</button>
    </td>
  `;

  // Сохраняем оригинальный HTML в свойстве строки
  // Tallennetaan alkuperäinen HTML rivin ominaisuuteen
  tr._originalHTML = originalHTML;

  // Add event listeners for save/cancel
  const saveBtn = tr.querySelector(".save-student-btn");
  const cancelBtn = tr.querySelector(".cancel-student-btn");

  saveBtn.onclick = async function (e) {
    e.preventDefault();
    const studentName = tr.querySelector(".edit-student-name").value;
    const studentSurname = tr.querySelector(".edit-student-surname").value;
    const studentGroup = tr.querySelector(".edit-student-group").value;

    try {
      const res = await fetch(
        `http://localhost:3000/students/${student.st_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": localStorage.getItem("userRole") || "",
          },
          body: JSON.stringify({
            st_name: studentName,
            st_s_name: studentSurname,
            st_group: studentGroup,
          }),
        }
      );

      if (res.ok) {
        loadStudentList(); // Reload the list
      } else {
        const text = await res.text();
        alert("Virhe tallennuksessa: " + text);
      }
    } catch (err) {
      alert("Virhe tallennuksessa: " + err.message);
    }
  };

  cancelBtn.onclick = function () {
    tr.innerHTML = originalHTML;
  };
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
      // Store student_id if present (for students)
      if (user && user.student_id) {
        localStorage.setItem("studentId", String(user.student_id));
      } else {
        localStorage.removeItem("studentId");
      }
      updateAuthButtons();
      updateGreeting();
      // Перезагружаем таблицу после логина
      loadWorkplaceTable();
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
  localStorage.removeItem("studentId");
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
  const welcomeGif = document.getElementById("welcomeGif");
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
      // Студент — просмотр списков + добавление компании + добавление места практики для себя
      if (addStudentBtn) {
        addStudentBtn.disabled = true;
        addStudentBtn.setAttribute("aria-disabled", "true");
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
    }
    // Показываем таблицу и скрываем GIF для всех залогиненных
    if (dataTable) dataTable.style.display = "block";
    if (welcomeGif) welcomeGif.style.display = "none";
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
    // Скрываем таблицу и показываем GIF для незалогиненных
    if (dataTable) dataTable.style.display = "none";
    if (welcomeGif) welcomeGif.style.display = "block";
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
      if (res.ok) {
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
  const isStudent = localStorage.getItem("userRole") === "3";
  const studentId = localStorage.getItem("studentId");
  try {
    const res = await fetch("http://localhost:3000/students");
    if (!res.ok) return;
    const students = await res.json();
    // Удалить старые опции, кроме первой
    while (select.options.length > 1) select.remove(1);
    if (isStudent && studentId) {
      // Найти только себя
      const st = students.find(
        (s) => String(s.student_id) === String(studentId)
      );
      if (st) {
        const opt = document.createElement("option");
        opt.value = st.student_id;
        const fullName = st.st_s_name
          ? `${st.st_name} ${st.st_s_name}`
          : st.st_name;
        opt.textContent = fullName;
        select.appendChild(opt);
        select.value = st.student_id;
        select.disabled = true; // нельзя выбрать другого
      }
    } else {
      students.forEach((st) => {
        const opt = document.createElement("option");
        opt.value = st.student_id;
        const fullName = st.st_s_name
          ? `${st.st_name} ${st.st_s_name}`
          : st.st_name;
        opt.textContent = fullName;
        select.appendChild(opt);
      });
      select.disabled = false;
    }
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
  populateStudentsSelect();
  setMinDatesForWorkplace();
}

// =====================================================
// ФУНКЦИИ УПРАВЛЕНИЯ ДАТАМИ И ОГРАНИЧЕНИЯМИ
// PÄIVÄMÄÄRIEN JA RAJOITUSTEN HALLINTA
// =====================================================

// Устанавливает минимальные даты для формы рабочего места (только сегодня и будущие даты)
// Asettaa vähimmäispäivämäärät työpaikkaformulaarille (vain tänään ja tulevat päivämäärät)
function setMinDatesForWorkplace() {
  // Получаем сегодняшнюю дату в формате YYYY-MM-DD
  // Haetaan tämän päivän päivämäärä muodossa YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Получаем поля ввода дат начала и окончания
  // Haetaan alku- ja loppupäivämäärien syöttökentät
  const alkuInput = document.getElementById("Alku");
  const loppuInput = document.getElementById("Loppu");

  // Устанавливаем минимальную дату для поля начала (сегодня)
  // Asetetaan vähimmäispäivämäärä alkupäivälle (tänään)
  if (alkuInput) {
    alkuInput.min = today;
  }

  // Устанавливаем минимальную дату для поля окончания (сегодня)
  // Asetetaan vähimmäispäivämäärä loppupäivälle (tänään)
  if (loppuInput) {
    loppuInput.min = today;
  }

  // Добавляем слушатель события для обеспечения того, чтобы дата окончания не была раньше даты начала
  // Lisätään tapahtumankuuntelija varmistamaan, että loppupäivä ei ole ennen alkupäivää
  if (alkuInput && loppuInput) {
    alkuInput.addEventListener("change", function () {
      // При изменении даты начала, устанавливаем минимальную дату окончания
      // Alkupäivän muuttuessa asetetaan loppupäivän vähimmäispäivämäärä
      loppuInput.min = this.value || today;
    });
  }
}
function closePaikkaModal() {
  document.getElementById("PaikkaModalOverlay").style.display = "none";
}

// =====================================================
// ФУНКЦИИ ПОИСКА ПО ТАБЛИЦЕ МЕСТ ПРАКТИКИ
// HARJOITTELUPAIKKATAULUKON HAKUTOIMINNOT
// =====================================================

// Инициализация поиска - добавляем обработчики событий
// Haun alustus - lisätään tapahtumankäsittelijät
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");

  if (searchInput) {
    // Поиск в реальном времени при вводе текста
    // Reaaliaikainen haku tekstin syöttämisen aikana
    searchInput.addEventListener("input", function () {
      filterWorkplaceTable(this.value);
    });
  }

  if (clearBtn) {
    // Очистка поиска и показ всех записей
    // Haun tyhjentäminen ja kaikkien tietueiden näyttäminen
    clearBtn.addEventListener("click", function () {
      searchInput.value = "";
      filterWorkplaceTable("");
    });
  }
}

// Фильтрация таблицы мест практики по поисковому запросу
// Harjoittelupaikkataulukon suodatus hakukyselyn mukaan
function filterWorkplaceTable(searchTerm) {
  const tableBody = document.getElementById("tableBody");
  const rows = tableBody.getElementsByTagName("tr");

  // Приводим поисковый запрос к нижнему регистру для нечувствительного поиска
  // Muutetaan hakutermi pieniksi kirjaimiksi case-insensitive hakua varten
  const searchLower = searchTerm.toLowerCase();

  // Проходим по всем строкам таблицы
  // Käydään läpi kaikki taulukon rivit
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.getElementsByTagName("td");
    let found = false;

    // Если нет поискового запроса, показываем все строки
    // Jos ei ole hakutermiä, näytetään kaikki rivit
    if (searchTerm === "") {
      found = true;
    } else {
      // Ищем только в колонках с именами студентов и компаний:
      // Индекс 3 - Имя студента (Oppilas)
      // Индекс 4 - Название компании (Paikan nimi)
      // Etsitään vain sarakkeissa joissa on opiskelijoiden ja yritysten nimet:
      // Indeksi 3 - Opiskelijan nimi (Oppilas)
      // Indeksi 4 - Yrityksen nimi (Paikan nimi)
      const searchColumns = [3, 4]; // Индексы колонок для поиска

      for (let colIndex of searchColumns) {
        if (colIndex < cells.length) {
          const cellText = cells[colIndex].textContent.toLowerCase();
          if (cellText.includes(searchLower)) {
            found = true;
            break;
          }
        }
      }
    }

    // Показываем или скрываем строку в зависимости от результата поиска
    // Näytetään tai piilotetaan rivi hakutuloksen mukaan
    row.style.display = found ? "" : "none";
  }
}

// =====================================================
// ФУНКЦИИ ПОИСКА И ФИЛЬТРАЦИИ КОМПАНИЙ
// YRITYSTEN HAKU- JA SUODATUSTOIMINNOT
// =====================================================

// Заполнение выпадающего списка групп уникальными значениями
// Ryhmien pudotusvalikon täyttäminen yksilöllisillä arvoilla
function populateGroupFilter(students) {
  const groupFilterSelect = document.getElementById("groupFilterSelect");
  if (!groupFilterSelect) return;

  // Очищаем список, оставляя только опцию "Все группы"
  // Tyhjennetään lista, jätetään vain "Kaikki ryhmät" -vaihtoehto
  groupFilterSelect.innerHTML = '<option value="">Kaikki ryhmät</option>';

  // Собираем уникальные группы из списка студентов
  // Kerätään yksilölliset ryhmät opiskelijalistasta
  const uniqueGroups = [
    ...new Set(students.map((s) => s.st_group).filter((group) => group)),
  ];

  // Добавляем опции для каждой уникальной группы
  // Lisätään vaihtoehdot jokaiselle yksilölliselle ryhmälle
  uniqueGroups.sort().forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    groupFilterSelect.appendChild(option);
  });
}

// =====================================================
// ФУНКЦИИ ПОИСКА И ФИЛЬТРАЦИИ СТУДЕНТОВ
// OPISKELIJOIDEN HAKU- JA SUODATUSTOIMINNOT
// =====================================================

// Инициализация поиска студентов - добавляем обработчики событий
// Opiskelijahaun alustus - lisätään tapahtumankäsittelijät
function initializeStudentSearch() {
  const studentSearchInput = document.getElementById("studentSearchInput");
  const groupFilterSelect = document.getElementById("groupFilterSelect");
  const clearStudentFiltersBtn = document.getElementById(
    "clearStudentFiltersBtn"
  );

  if (studentSearchInput) {
    // Поиск в реальном времени при вводе имени
    // Reaaliaikainen haku nimen syöttämisen aikana
    studentSearchInput.addEventListener("input", function () {
      filterStudentTable(this.value, groupFilterSelect.value);
    });
  }

  if (groupFilterSelect) {
    // Фильтрация при выборе группы
    // Suodatus ryhmän valitsemisen yhteydessä
    groupFilterSelect.addEventListener("change", function () {
      filterStudentTable(studentSearchInput.value, this.value);
    });
  }

  if (clearStudentFiltersBtn) {
    // Очистка всех фильтров
    // Kaikkien suodattimien tyhjentäminen
    clearStudentFiltersBtn.addEventListener("click", function () {
      studentSearchInput.value = "";
      groupFilterSelect.value = "";
      filterStudentTable("", "");
    });
  }
}

// Фильтрация таблицы студентов по имени и группе
// Opiskelijataulukon suodatus nimen ja ryhmän mukaan
function filterStudentTable(nameSearch, groupFilter) {
  const tableBody = document.getElementById("studentListTableBody");
  const rows = tableBody.getElementsByTagName("tr");

  // Приводим поисковый запрос к нижнему регистру для нечувствительного поиска
  // Muutetaan hakutermi pieniksi kirjaimiksi case-insensitive hakua varten
  const nameSearchLower = nameSearch.toLowerCase();

  // Проходим по всем строкам таблицы студентов
  // Käydään läpi kaikki opiskelijataulukon rivit
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.getElementsByTagName("td");
    let found = true;

    // Проверяем только строки с данными (не сообщения типа "Ladataan...")
    // Tarkistetaan vain tietorivit (ei viestejä kuten "Ladataan...")
    if (cells.length >= 3) {
      const nameCell = cells[0]; // Имя студента / Opiskelijan nimi
      const surnameCell = cells[1]; // Фамилия студента / Opiskelijan sukunimi
      const groupCell = cells[2]; // Группа / Ryhmä

      // Проверяем соответствие имени или фамилии (если есть поисковый запрос)
      // Tarkistetaan nimen tai sukunimen vastaavuus (jos hakutermi on annettu)
      if (nameSearch && (nameCell || surnameCell)) {
        const nameText = nameCell ? nameCell.textContent.toLowerCase() : "";
        const surnameText = surnameCell
          ? surnameCell.textContent.toLowerCase()
          : "";
        const fullName = (nameText + " " + surnameText).trim();

        if (
          !nameText.includes(nameSearchLower) &&
          !surnameText.includes(nameSearchLower) &&
          !fullName.includes(nameSearchLower)
        ) {
          found = false;
        }
      }

      // Проверяем соответствие группе (если выбран фильтр)
      // Tarkistetaan ryhmän vastaavuus (jos suodatin on valittu)
      if (groupFilter && groupCell) {
        const groupText = groupCell.textContent.trim();
        if (groupText !== groupFilter) {
          found = false;
        }
      }
    }

    // Показываем или скрываем строку в зависимости от результата фильтрации
    // Näytetään tai piilotetaan rivi suodatuksen tuloksen mukaan
    row.style.display = found ? "" : "none";
  }
}

// Заполнение выпадающего списка групп уникальными значениями
// Ryhmien pudotusvalikon täyttäminen yksilöllisillä arvoilla
function populateGroupFilter(students) {
  const groupFilterSelect = document.getElementById("groupFilterSelect");
  if (!groupFilterSelect) return;

  // Очищаем список, оставляя только опцию "Все группы"
  // Tyhjennetään lista, jätetään vain "Kaikki ryhmät" -vaihtoehto
  groupFilterSelect.innerHTML = '<option value="">Kaikki ryhmät</option>';

  // Собираем уникальные группы из списка студентов
  // Kerätään yksilölliset ryhmät opiskelijalistasta
  const uniqueGroups = [
    ...new Set(students.map((s) => s.st_group).filter((group) => group)),
  ];

  // Добавляем опции для каждой уникальной группы
  // Lisätään vaihtoehdot jokaiselle yksilölliselle ryhmälle
  uniqueGroups.sort().forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    groupFilterSelect.appendChild(option);
  });
}

// =====================================================
// ФУНКЦИИ ПОИСКА И ФИЛЬТРАЦИИ КОМПАНИЙ
// YRITYSTEN HAKU- JA SUODATUSTOIMINNOT
// =====================================================

// Инициализация поиска компаний - добавляем обработчики событий
// Yrityshaun alustus - lisätään tapahtumankäsittelijät
function initializeCompanySearch() {
  const companySearchInput = document.getElementById("companySearchInput");
  const addressFilterSelect = document.getElementById("addressFilterSelect");
  const clearCompanyFiltersBtn = document.getElementById(
    "clearCompanyFiltersBtn"
  );

  if (companySearchInput) {
    // Поиск в реальном времени при вводе названия
    // Reaaliaikainen haku nimen syöttämisen aikana
    companySearchInput.addEventListener("input", function () {
      filterCompanyTable(this.value, addressFilterSelect.value);
    });
  }

  if (addressFilterSelect) {
    // Фильтрация при выборе адреса
    // Suodatus osoitteen valitsemisen yhteydessä
    addressFilterSelect.addEventListener("change", function () {
      filterCompanyTable(companySearchInput.value, this.value);
    });
  }

  if (clearCompanyFiltersBtn) {
    // Очистка всех фильтров
    // Kaikkien suodattimien tyhjentäminen
    clearCompanyFiltersBtn.addEventListener("click", function () {
      companySearchInput.value = "";
      addressFilterSelect.value = "";
      filterCompanyTable("", "");
    });
  }
}

// Фильтрация таблицы компаний по названию и адресу
// Yritystaulukon suodatus nimen ja osoitteen mukaan
function filterCompanyTable(nameSearch, addressFilter) {
  const tableBody = document.getElementById("companyListTableBody");
  const rows = tableBody.getElementsByTagName("tr");

  // Приводим поисковый запрос к нижнему регистру для нечувствительного поиска
  // Muutetaan hakutermi pieniksi kirjaimiksi case-insensitive hakua varten
  const nameSearchLower = nameSearch.toLowerCase();

  // Проходим по всем строкам таблицы компаний
  // Käydään läpi kaikki yritystaulukon rivit
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.getElementsByTagName("td");
    let found = true;

    // Проверяем только строки с данными (не сообщения типа "Ladataan...")
    // Tarkistetaan vain tietorivit (ei viestejä kuten "Ladataan...")
    if (cells.length >= 4) {
      const nameCell = cells[0]; // Название компании / Yrityksen nimi
      const addressCell = cells[3]; // Адрес / Osoite

      // Проверяем соответствие названию (если есть поисковый запрос)
      // Tarkistetaan nimen vastaavuus (jos hakutermi on annettu)
      if (nameSearch && nameCell) {
        const nameText = nameCell.textContent.toLowerCase();
        if (!nameText.includes(nameSearchLower)) {
          found = false;
        }
      }

      // Проверяем соответствие адресу (если выбран фильтр)
      // Tarkistetaan osoitteen vastaavuus (jos suodatin on valittu)
      if (addressFilter && addressCell) {
        const addressText = addressCell.textContent.trim();
        if (addressText !== addressFilter) {
          found = false;
        }
      }
    }

    // Показываем или скрываем строку в зависимости от результата фильтрации
    // Näytetään tai piilotetaan rivi suodatuksen tuloksen mukaan
    row.style.display = found ? "" : "none";
  }
}

// Заполнение выпадающего списка адресов уникальными значениями
// Osoitteiden pudotusvalikon täyttäminen yksilöllisillä arvoilla
function populateAddressFilter(companies) {
  const addressFilterSelect = document.getElementById("addressFilterSelect");
  if (!addressFilterSelect) return;

  // Очищаем список, оставляя только опцию "Все адреса"
  // Tyhjennetään lista, jätetään vain "Kaikki osoitteet" -vaihtoehto
  addressFilterSelect.innerHTML = '<option value="">Kaikki osoitteet</option>';

  // Собираем уникальные адреса из списка компаний
  // Kerätään yksilölliset osoitteet yrityslistasta
  const uniqueAddresses = [
    ...new Set(companies.map((c) => c.address).filter((address) => address)),
  ];

  // Добавляем опции для каждого уникального адреса
  // Lisätään vaihtoehdot jokaiselle yksilölliselle osoitteelle
  uniqueAddresses.sort().forEach((address) => {
    const option = document.createElement("option");
    option.value = address;
    option.textContent = address;
    addressFilterSelect.appendChild(option);
  });
}

// Загрузить и отобразить данные мест практики
// Lataa ja näytä harjoittelupaikkojen tiedot
function loadWorkplaceTable() {
  fetch("http://localhost:3000/workplace")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.getElementById("tableBody");
      tbody.innerHTML = "";
      const isTeacher = localStorage.getItem("userRole") === "2";
      const isStudent = localStorage.getItem("userRole") === "3";
      const studentId = localStorage.getItem("studentId");
      // Получаем список компаний для select (один раз)
      let companiesList = [];
      fetch("http://localhost:3000/companies")
        .then((r) => r.json())
        .then((companies) => {
          companiesList = companies;
          renderRows();
        });
      function renderRows() {
        // If student, filter data to only own records
        let filteredData = data;
        if (isStudent && studentId) {
          filteredData = data.filter(
            (row) => String(row.student_id) === String(studentId)
          );
        }
        filteredData.forEach((row, idx) => {
          // Найти исходный индекс в data
          const originalIdx = data.findIndex((d) => d.row_id === row.row_id);
          const tr = document.createElement("tr");
          tr.setAttribute("data-row-id", row.row_id);
          tr.setAttribute("data-student-id", row.student_id);
          tr.setAttribute("data-company-id", row.company_id);
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
          function formatDateOnly(date) {
            if (!date) return "";
            if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
              return date;
            }
            if (typeof date === "string" && date.length >= 10) {
              return date.slice(0, 10);
            }
            if (date instanceof Date) {
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
          let lunchText =
            row.lunch_money === true || row.lunch_money === "true"
              ? "Kyllä"
              : "Ei";
          // Показывать кнопки только если:
          // - учитель (isTeacher)
          // - студент и это его запись (isStudent && row.student_id == studentId)
          let actionButtons = "";
          if (
            isTeacher ||
            (isStudent && String(row.student_id) === String(studentId))
          ) {
            actionButtons = `<button class='edit-btn' data-idx='${originalIdx}'>✏️</button> <button class='delete-btn' data-idx='${originalIdx}'>🗑️</button>`;
          }

          // Для залогиненных пользователей всегда показываем столбец действий
          const showActionsColumn = isTeacher || isStudent;

          tr.innerHTML = `
            <td style="display:none;">${row.row_id}</td>
            <td style="display:none;">${row.student_id}</td>
            <td style="display:none;">${row.company_id}</td>
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
            ${showActionsColumn ? `<td>${actionButtons}</td>` : ""}
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

          // Set minimum dates for editing (today and future only)
          const today = new Date().toISOString().split("T")[0];
          const beginDateInput = tr.querySelector(".edit-begin-date");
          const endDateInput = tr.querySelector(".edit-end-date");

          if (beginDateInput) {
            beginDateInput.min = today;
          }
          if (endDateInput) {
            endDateInput.min = today;
          }

          // Ensure end date is not before start date
          if (beginDateInput && endDateInput) {
            beginDateInput.addEventListener("change", function () {
              endDateInput.min = this.value || today;
            });
          }
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
          fetch("http://localhost:3000/workplace", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-user-role": localStorage.getItem("userRole") || "",
              "x-student-id": localStorage.getItem("studentId") || "",
            },
            body: JSON.stringify(payload),
          })
            .then(async (res) => {
              if (res.ok) {
                location.reload();
              } else {
                const text = await res.text();
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
window.addEventListener("DOMContentLoaded", function () {
  loadWorkplaceTable();
  initializeSearch(); // Инициализируем поиск / Alustetaan haku
});
window.addEventListener("storage", loadWorkplaceTable);
// Also reload table after login/logout

// Lisaaminen oppilasta
document
  .getElementById("oppilas-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const nimi = document.getElementById("OppilasNimi").value;
    const sukunimi = document.getElementById("OppilasSukunimi").value;
    const ryhma = document.getElementById("RyhmanNimi").value;
    const res = await fetch("http://localhost:3000/add-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nimi, sukunimi, ryhma }),
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
    const address = document.getElementById("YrityksenOsoite").value;
    const res = await fetch("http://localhost:3000/add-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nimi, count_place, y_tunnus, address }),
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
      headers: {
        "Content-Type": "application/json",
        "x-user-role": localStorage.getItem("userRole") || "",
        "x-student-id": localStorage.getItem("studentId") || "",
      },
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

// =====================================================
// ПРОСТАЯ СОРТИРОВКА ТАБЛИЦЫ ПО ИМЕНИ СТУДЕНТА
// YKSINKERTAINEN TAULUKON LAJITTELU OPISKELIJAN NIMEN MUKAAN
// =====================================================

// Переменная для отслеживания направления сортировки
// Muuttuja lajittelusuunnan seurantaan
let currentSortDirection = null; // null, 'asc', 'desc'

// Функция сортировки таблицы
// Taulukon lajittelutoiminto
function sortTable(column, direction) {
  if (column !== "student") return; // Сортируем только по студентам / Lajitellaan vain opiskelijoiden mukaan

  const tableBody = document.getElementById("tableBody");
  const rows = Array.from(tableBody.getElementsByTagName("tr"));

  // Обновляем визуальные индикаторы
  // Päivitetään visuaaliset indikaattorit
  updateSortIndicators(direction);

  // Сохраняем текущее направление
  // Tallennetaan nykyinen suunta
  currentSortDirection = direction;

  // Сортируем строки
  // Lajitellaan rivit
  const sortedRows = rows.sort((a, b) => {
    // Получаем имена студентов (первая видимая колонка, индекс 3 если считать скрытые)
    // Haetaan opiskelijoiden nimet (ensimmäinen näkyvä sarake, indeksi 3 jos lasketaan piilotetut)
    const aStudentName = a.cells[3] ? a.cells[3].textContent.toLowerCase() : "";
    const bStudentName = b.cells[3] ? b.cells[3].textContent.toLowerCase() : "";

    // Сравниваем имена
    // Verrataan nimet
    const comparison = aStudentName.localeCompare(bStudentName, "fi");

    return direction === "asc" ? comparison : -comparison;
  });

  // Очищаем таблицу и добавляем отсортированные строки
  // Tyhjennetään taulukko ja lisätään lajitellut rivit
  tableBody.innerHTML = "";
  sortedRows.forEach((row) => tableBody.appendChild(row));

  // Применяем поиск заново, если он активен
  // Sovelletaan haku uudelleen, jos se on aktiivinen
  const searchInput = document.getElementById("searchInput");
  if (searchInput && searchInput.value) {
    filterWorkplaceTable(searchInput.value);
  }
}

// Обновление визуальных индикаторов сортировки
// Lajittelun visuaalisten indikaattoreiden päivittäminen
function updateSortIndicators(direction) {
  // Убираем активный класс со всех стрелок
  // Poistetaan aktiivinen luokka kaikista nuolista
  document.querySelectorAll(".sort-up, .sort-down").forEach((arrow) => {
    arrow.classList.remove("active");
  });

  // Добавляем активный класс к соответствующей стрелке
  // Lisätään aktiivinen luokka vastaavaan nuoleen
  const targetHeader = document.querySelector('[data-column="student"]');
  if (targetHeader) {
    const arrowClass = direction === "asc" ? ".sort-up" : ".sort-down";
    const arrow = targetHeader.querySelector(arrowClass);
    if (arrow) {
      arrow.classList.add("active");
    }
  }
}
