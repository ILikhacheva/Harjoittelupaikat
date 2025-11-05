// ---
// серверная часть системы управления местами практики
// harjoittelupaikkojen hallintajärjestelmän palvelinpuoli
// ---
//
// этот файл содержит express.js сервер с api endpoints для:
// tämä tiedosto sisältää express.js palvelimen api-päätepisteineen:
//
// - аутентификация пользователей (логин/регистрация)
//   käyttäjien autentikointi (kirjautuminen/rekisteröinti)
//
// - crud операции для студентов, компаний и мест практики
//   crud-toiminnot opiskelijoille, yrityksille ja harjoittelupaikoille
//
// - управление правами доступа по ролям
//   roolipohjainen käyttöoikeuksien hallinta
//
// - подключение к postgresql базе данных
//   postgresql tietokantayhteys
//
// ---

// Загружаем переменные окружения из .env файла
// Ladataan ympäristömuuttujat .env tiedostosta
require("dotenv").config();

// Импортируем необходимые модули
// Tuodaan tarvittavat moduulit
const express = require("express");
const bcrypt = require("bcrypt"); // Для хеширования паролей / Salasanojen tiivistykseen
const cors = require("cors"); // Для кросс-доменных запросов / Cross-origin pyyntöjä varten
const { Pool } = require("pg"); // PostgreSQL клиент / PostgreSQL asiakasohjelma
const app = express();

// ---
// настройка middleware
// middleware konfiguraatio
// ---

// Настраиваем CORS для разрешения кросс-доменных запросов
// Konfiguroidaan CORS sallimaan cross-origin pyynnöt
app.use(
  cors({
    origin: "*", // Разрешаем запросы с любого домена / Sallitaan pyynnöt mistä tahansa domainista
  })
);

// Подключаем обслуживание статических файлов из текущей директории
// Kytketään staattisten tiedostojen tarjoilu nykyisestä hakemistosta
app.use(express.static(__dirname));

// Подключаем middleware для парсинга JSON в запросах
// Kytketään middleware JSON:n jäsentämiseen pyynnöissä
app.use(express.json());

// =====================================================
// НАСТРОЙКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ
// TIETOKANTAYHTEYDEN KONFIGURAATIO
// =====================================================

// Создаем пул подключений к PostgreSQL базе данных
// Luodaan PostgreSQL tietokantayhteyksien pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost", // Хост БД / Tietokannan isäntä
  port: process.env.DB_PORT || 5432, // Порт БД / Tietokannan portti
  database: process.env.DB_NAME || "harjoittelu_sivu", // Имя БД / Tietokannan nimi
  user: process.env.DB_USER || "harjoittelu_sivu",
  password: process.env.DB_PASSWORD || "12345",
});

// Testing connection
pool.on("connect", () => {
  console.log("✅ Connection to PostgreSQL established");
});

pool.on("error", (err) => {
  console.error("❌ Connection error to PostgreSQL:", err);
});

// =====================================================
// API ENDPOINTS ДЛЯ РАБОТЫ С ДАННЫМИ
// API-PÄÄTEPISTEET TIETOJEN KÄSITTELYYN
// =====================================================

// Получить список мест практики с фильтрацией по ролям
// Hae harjoittelupaikkojen luettelo roolisuodatuksella
app.get("/workplace", async (req, res) => {
  try {
    // Check for student restriction
    const userRole = req.headers["x-user-role"];
    const studentId = req.headers["x-student-id"];

    // Получаем параметры сортировки из query string
    // Haetaan lajitteluparametrit query stringistä
    const sortBy = req.query.sortBy; // 'student'
    const sortOrder = req.query.sortOrder; // 'asc' или 'desc'

    let query = `SELECT w.row_id, w.student_id, w.company_id, s.st_name, s.st_s_name,
      c.company_name, w.boss_name, w.boss_phone, w.boss_email,
      TO_CHAR(w.begin_date, 'YYYY-MM-DD') as begin_date,
      TO_CHAR(w.end_date, 'YYYY-MM-DD') as end_date,
      w.lunch_money, w.city, w.status
      FROM public.workplace w
      JOIN public.students s ON w.student_id = s.student_id
      JOIN public.companies c ON w.company_id = c.company_id`;

    let params = [];
    if (userRole === "3" && studentId) {
      query += " WHERE w.student_id = $1";
      params = [studentId];
    }

    // Добавляем сортировку / Lisätään lajittelu
    if (sortBy === "student" && (sortOrder === "asc" || sortOrder === "desc")) {
      query += ` ORDER BY s.st_name ${sortOrder.toUpperCase()}, s.st_s_name ${sortOrder.toUpperCase()}`;
    } else {
      // По умолчанию сортируем по имени студента / Oletuksena lajitellaan opiskelijan nimen mukaan
      query += ` ORDER BY s.st_name ASC, s.st_s_name ASC`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});

// Добавление нового студента
app.post("/add-student", async (req, res) => {
  const { nimi, sukunimi, ryhma } = req.body;
  try {
    await pool.query(
      "INSERT INTO students (st_name, st_group, st_s_name) VALUES ($1, $2, $3)",
      [nimi, ryhma, sukunimi]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("DB error");
  }
});
// Добавление новой компании
app.post("/add-company", async (req, res) => {
  const { nimi, count_place, y_tunnus, address } = req.body;
  try {
    await pool.query(
      "INSERT INTO companies (company_name, count_place, tunnus, address) VALUES ($1, $2, $3, $4)",
      [nimi, count_place, y_tunnus, address]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("DB error");
  }
});

// Получить список студентов (id, имя и фамилия)
app.get("/students", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT student_id, st_name, st_s_name FROM students ORDER BY st_name, st_s_name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR /students:", err);
    res.status(500).send("DB error");
  }
});

// Получить список компаний (id и имя)
app.get("/companies", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT company_id, company_name FROM companies ORDER BY company_name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR /companies:", err);
    res.status(500).send("DB error");
  }
});

// Обновление компании
app.put("/companies/:id", async (req, res) => {
  const { id } = req.params;
  const { company_name, count_place, tunnus, address } = req.body;
  try {
    const result = await pool.query(
      "UPDATE companies SET company_name = $2, count_place = $3, tunnus = $4, address = $5 WHERE company_id = $1",
      [id, company_name, count_place, tunnus, address]
    );
    if (result.rowCount === 0) {
      res.status(404).send("Компания не найдена");
    } else {
      res.send("OK, обновлено строк: " + result.rowCount);
    }
  } catch (err) {
    console.error("DB ERROR /companies PUT:", err);
    res.status(500).send("DB error: " + err.message);
  }
});

// Добавление нового места практики
app.post("/add-workplace", async (req, res) => {
  let {
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
  } = req.body;
  // If student, force student_id from header
  const userRole = req.headers["x-user-role"];
  const studentIdHeader = req.headers["x-student-id"];
  if (userRole === "3" && studentIdHeader) {
    student_id = studentIdHeader;
  }
  const companyIdInt = parseInt(company_id, 10);
  try {
    await pool.query(
      `INSERT INTO workplace (student_id, company_id, boss_name, boss_phone, boss_email, begin_date, end_date, lunch_money, city, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        student_id,
        companyIdInt,
        ohjaaja,
        puhelin,
        email,
        alku,
        loppu,
        ruokaraha,
        kaupunki,
        status,
      ]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("DB error");
  }
});

// Endpoint для получения кодового слова преподавателя (для проверки)
app.get("/api/teacher-code", (req, res) => {
  const code = process.env.OppiKodi || "secret123";
  res.json({ code: code });
});

// Добавление пользователя с хешированием пароля
app.post("/add-user", async (req, res) => {
  const { nimi, email, password, role, student_id } = req.body;
  try {
    // Проверка на существование email
    const check = await pool.query(
      "SELECT user_id FROM users WHERE user_email = $1",
      [email]
    );
    if (check.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "A user with this email already exists." });
    }
    const hash = await bcrypt.hash(password, 10);
    let query, params;
    if (role == 3 && student_id) {
      // student
      query =
        "INSERT INTO users (user_email, user_password, user_name, user_role, student_id) VALUES ($1, $2, $3, $4, $5)";
      params = [email, hash, nimi, role, student_id];
    } else {
      // teacher
      query =
        "INSERT INTO users (user_email, user_password, user_name, user_role, student_id) VALUES ($1, $2, $3, $4, NULL)";
      params = [email, hash, nimi, role];
    }
    await pool.query(query, params);
    res.sendStatus(200);
  } catch (err) {
    console.error("DB ERROR /add-user:", err);
    res.status(500).send("DB error");
  }
});

// Логин пользователя
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT user_id, user_email, user_password, user_name, user_role, student_id, password_reset FROM users WHERE user_email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Käyttäjää ei löydy" });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.user_password);
    if (!match) {
      return res.status(401).json({ error: "Väärä salasana" });
    }
    const response = {
      user_id: user.user_id,
      user_email: user.user_email,
      user_name: user.user_name,
      user_role: user.user_role,
      student_id: user.student_id || null,
      password_reset: user.password_reset || false,
    };
    res.json(response);
  } catch (err) {
    console.error("DB ERROR /api/login:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// Получить полный список компаний для списка (company_name, count_place, tunnus, address)
app.get("/companies-full", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT company_id, company_name, count_place, tunnus, address FROM companies ORDER BY company_name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR /companies-full:", err);
    res.status(500).send("DB error");
  }
});

// Получить полный список студентов для списка (student_id, st_name, st_s_name, st_group)
app.get("/students-full", async (req, res) => {
  try {
    // Получаем параметры сортировки из query string
    // Haetaan lajitteluparametrit query stringistä
    const sortBy = req.query.sortBy || "st_name"; // По умолчанию по имени / Oletuksena nimen mukaan
    const sortOrder = req.query.sortOrder || "asc"; // По умолчанию по возрастанию / Oletuksena nousevasti

    // Валидируем параметры сортировки для безопасности
    // Validoidaan lajitteluparametrit turvallisuuden vuoksi
    const allowedSortColumns = ["st_name", "st_s_name", "st_group"];
    const allowedSortOrders = ["asc", "desc"];

    const validSortBy = allowedSortColumns.includes(sortBy)
      ? sortBy
      : "st_name";
    const validSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : "asc";

    // Строим SQL запрос с динамической сортировкой
    // Rakennetaan SQL-kysely dynaamisella lajittelulla
    const orderClause = `ORDER BY ${validSortBy} ${validSortOrder.toUpperCase()}`;
    const query = `SELECT student_id as st_id, st_name, st_s_name, st_group FROM students ${orderClause}`;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR /students-full:", err);
    res.status(500).send("DB error");
  }
});

// Обновить студента (только для учителей)
app.put("/students/:id", async (req, res) => {
  try {
    const userRole = req.headers["x-user-role"];

    // Проверяем, что это учитель
    if (userRole !== "2") {
      return res
        .status(403)
        .send("Только учителя могут редактировать студентов");
    }

    const studentId = req.params.id;
    const { st_name, st_s_name, st_group } = req.body;

    if (!st_name || !st_group) {
      return res.status(400).send("Nimi ja ryhmä ovat pakollisia");
    }

    const result = await pool.query(
      "UPDATE students SET st_name = $1, st_group = $2, st_s_name = $3 WHERE student_id = $4 RETURNING *",
      [st_name, st_group, st_s_name, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Opiskelijaa ei löytynyt");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB ERROR PUT /students/:id:", err);
    res.status(500).send("Tietokantavirhe");
  }
});

// Обновление места практики
app.put("/workplace", async (req, res) => {
  const {
    row_id,
    company_id,
    boss_name,
    boss_phone,
    boss_email,
    begin_date,
    end_date,
    lunch_money,
    city,
    status,
  } = req.body;
  const userRole = req.headers["x-user-role"];
  const studentIdHeader = req.headers["x-student-id"];
  try {
    let query = `UPDATE workplace SET company_id=$2, boss_name=$3, boss_phone=$4, boss_email=$5, begin_date=$6, end_date=$7, lunch_money=$8, city=$9, status=$10 WHERE row_id=$1`;
    let params = [
      row_id,
      company_id,
      boss_name,
      boss_phone,
      boss_email,
      begin_date,
      end_date,
      lunch_money,
      city,
      status,
    ];
    // If student, only allow update if row belongs to them
    if (userRole === "3" && studentIdHeader) {
      query += " AND student_id = $11";
      params.push(studentIdHeader);
    }
    const result = await pool.query(query, params);
    if (result.rowCount === 0) {
      res.status(404).send("Не найдена строка для обновления (row_id)");
    } else {
      res.send("OK, обновлено строк: " + result.rowCount);
    }
  } catch (err) {
    console.error("DB ERROR /workplace PUT:", err);
    res.status(500).send("DB error: " + err.message);
  }
});

// =====================================================
// ОТЧЕТЫ / RAPORTIT
// =====================================================

// Получение отчета по местам практики
// Harjoittelupaikkaraportin hakeminen
app.get("/report", async (req, res) => {
  try {
    // SQL запрос как указано в требованиях
    // SQL-kysely kuten vaatimuksissa määritetty
    const query = `
      SELECT 
        c.company_name, 
        c.tunnus, 
        c.address, 
        s.st_name, 
        s.st_s_name, 
        s.st_group, 
        w.boss_name, 
        w.boss_phone, 
        w.boss_email
      FROM students s, companies c, workplace w
      WHERE w.student_id = s.student_id 
        AND w.company_id = c.company_id
      ORDER BY c.company_name, s.st_name, s.st_s_name
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("SERVER ERROR /report:", err);
    res.status(500).json({ error: err.message });
  }
});

// Отчет по компаниям с количеством студентов
// Yritysraportti opiskelijamäärän kanssa
app.get("/company-report", async (req, res) => {
  try {
    // SQL запрос для отчета по компаниям
    // SQL-kysely yritysraporttia varten
    const query = `
      SELECT 
        c.company_name, 
        c.tunnus, 
        c.address, 
        COUNT(w.row_id) as "Number of students"
      FROM students s, companies c, workplace w
      WHERE w.student_id = s.student_id 
        AND w.company_id = c.company_id
      GROUP BY c.company_name, c.tunnus, c.address
      ORDER BY c.company_name
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("SERVER ERROR /company-report:", err);
    res.status(500).json({ error: err.message });
  }
});

// Удаление места практики
app.delete("/workplace", async (req, res) => {
  const { student_id, company_id } = req.body;
  try {
    await pool.query(
      `DELETE FROM workplace WHERE student_id=$1 AND company_id=$2`,
      [student_id, company_id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("DB ERROR /workplace DELETE:", err);
    res.status(500).send("DB error");
  }
});

// ---
// endpoints для восстановления пароля
// salasanan palautuksen päätepisteet
// ---

// Проверить существование email в базе данных
// Tarkista sähköpostin olemassaolo tietokannassa
app.post("/check-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await pool.query(
      "SELECT user_id FROM users WHERE user_email = $1",
      [email]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error("DB ERROR /check-email:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Сброс пароля
// Salasanan nollaus
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ error: "Email and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  try {
    // Проверяем, существует ли пользователь
    // Tarkistetaan, onko käyttäjä olemassa
    const userCheck = await pool.query(
      "SELECT user_id FROM users WHERE user_email = $1",
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Хешируем новый пароль
    // Tiivistetään uusi salasana
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Обновляем пароль в базе данных
    // Päivitetään salasana tietokannassa
    await pool.query(
      "UPDATE users SET user_password = $1 WHERE user_email = $2",
      [hashedPassword, email]
    );

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("DB ERROR /reset-password:", err);
    res.status(500).json({
      error: "Database error",
      success: false,
    });
  }
});

// ---
// endpoints для админ-панели
// admin-paneelin päätepisteet
// ---

// создание поля password_reset в таблице users (если не существует)
// password_reset-kentän luominen users-taulukkoon (jos ei ole olemassa)
async function ensurePasswordResetColumn() {
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_reset BOOLEAN DEFAULT false
    `);
    console.log("Password reset column ensured");
  } catch (err) {
    console.error("Error ensuring password_reset column:", err);
  }
}

// вызываем при старте сервера
// kutsutaan palvelimen käynnistyessä
ensurePasswordResetColumn();

// получить список всех пользователей (кроме админов)
// hae kaikkien käyttäjien lista (paitsi admin)
app.get("/admin/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.user_id,
        u.user_email as email,
        u.user_role,
        COALESCE(u.password_reset, false) as password_reset,
        CASE 
          WHEN u.user_role = 2 THEN u.user_name
          WHEN u.user_role = 3 THEN CONCAT(s.st_name, ' ', s.st_s_name)
          ELSE 'unknown'
        END as name
      FROM users u 
      LEFT JOIN students s ON u.student_id = s.student_id 
      WHERE u.user_role != 1
      ORDER BY u.user_role, u.user_email
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR /admin/users:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// сброс пароля пользователя администратором
// käyttäjän salasanan nollaus ylläpitäjän toimesta
app.post("/admin/reset-user-password", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // проверяем, что пользователь не админ
    // tarkistetaan, että käyttäjä ei ole admin
    const userCheck = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userCheck.rows[0].user_role === 1) {
      return res.status(403).json({ error: "Cannot reset admin password" });
    }

    // устанавливаем флаг сброса пароля
    // asetetaan salasanan nollauslippu
    await pool.query(
      "UPDATE users SET password_reset = true WHERE user_id = $1",
      [userId]
    );

    res.json({
      success: true,
      message: "Password reset flag set successfully",
    });
  } catch (err) {
    console.error("DB ERROR /admin/reset-user-password:", err);
    res.status(500).json({
      error: "Database error",
      success: false,
    });
  }
});

// изменение пароля пользователем (только если пароль сброшен)
// käyttäjän salasanan vaihto (vain jos salasana on nollattu)
app.post("/user/change-password", async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res
      .status(400)
      .json({ error: "User ID and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  try {
    // проверяем, что у пользователя установлен флаг сброса
    // tarkistetaan, että käyttäjällä on nollauslippu asetettu
    const userCheck = await pool.query(
      "SELECT password_reset FROM users WHERE user_id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!userCheck.rows[0].password_reset) {
      return res.status(403).json({
        error:
          "Password change not allowed. Contact administrator to reset your password first.",
      });
    }

    // хешируем новый пароль и сбрасываем флаг
    // tiivistetään uusi salasana ja nollataan lippu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      "UPDATE users SET user_password = $1, password_reset = false WHERE user_id = $2",
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("DB ERROR /user/change-password:", err);
    res.status(500).json({
      error: "Database error",
      success: false,
    });
  }
});
