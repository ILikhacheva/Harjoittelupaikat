//подключаемся к базе данных PostgreSQL и создаем сервер Express

// Загружаем переменные окружения из .env файла
require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static(__dirname));
app.use(express.json());

// Настройки подключения к базе данных PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "harjoittelu_sivu",
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

// Получить список мест практики
app.get("/workplace", async (req, res) => {
  try {
    const result = await pool.query(`SELECT s.st_name,
    c.company_name, w.boss_name, w.boss_phone, w.boss_email,
    w.begin_date, w.end_date, w.lunch_money, w.city, w.status

    FROM public.workplace w, public.students s, public.companies c
    WHERE w.company_id=c.company_id
    AND w.student_id=s.student_id`);
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
  const { nimi, ryhma } = req.body;
  console.log("Adding student:", nimi, ryhma);

  try {
    await pool.query(
      "INSERT INTO students (st_name, st_group) VALUES ($1, $2)",
      [nimi, ryhma]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("DB error");
  }
});
// Добавление новой компании
app.post("/add-company", async (req, res) => {
  const { nimi, count_place, y_tunnus } = req.body;
  console.log("Adding company:", nimi, count_place, y_tunnus);

  try {
    await pool.query(
      "INSERT INTO companies (company_name, count_place, tunnus) VALUES ($1, $2, $3)",
      [nimi, count_place, y_tunnus]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("DB error");
  }
});

// Получить список студентов (id и имя)
app.get("/students", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT student_id, st_name FROM students ORDER BY st_name"
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

// Добавление нового места практики
app.post("/add-workplace", async (req, res) => {
  const {
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
  // company_id должен быть числом
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
