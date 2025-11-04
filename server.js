// =====================================================
// СЕРВЕРНАЯ ЧАСТЬ СИСТЕМЫ УПРАВЛЕНИЯ МЕСТАМИ ПРАКТИКИ
// HARJOITTELUPAIKKOJEN HALLINTAJÄRJESTELMÄN PALVELINPUOLI
// =====================================================
//
// Этот файл содержит Express.js сервер с API endpoints для:
// Tämä tiedosto sisältää Express.js palvelimen API-päätepisteineen:
//
// - Аутентификация пользователей (логин/регистрация)
//   Käyttäjien autentikointi (kirjautuminen/rekisteröinti)
//
// - CRUD операции для студентов, компаний и мест практики
//   CRUD-toiminnot opiskelijoille, yrityksille ja harjoittelupaikoille
//
// - Управление правами доступа по ролям
//   Roolipohjainen käyttöoikeuksien hallinta
//
// - Подключение к PostgreSQL базе данных
//   PostgreSQL tietokantayhteys
//
// =====================================================

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

// =====================================================
// НАСТРОЙКА MIDDLEWARE
// MIDDLEWARE KONFIGURAATIO
// =====================================================

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
    let query = `SELECT w.row_id, w.student_id, w.company_id, s.st_name,
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
      "SELECT user_id, user_email, user_password, user_name, user_role, student_id FROM users WHERE user_email = $1",
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
    const result = await pool.query(
      "SELECT student_id as st_id, st_name, st_s_name, st_group FROM students ORDER BY st_name, st_s_name"
    );
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
