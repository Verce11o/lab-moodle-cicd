const express = require("express");
const Database = require("better-sqlite3");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const swaggerSpec = require("./swagger");
const packageInfo = require("./package.json");

const app = express();
const PORT = process.env.PORT || 3000;

const dbFile = process.env.DB_FILE === ":memory:"
  ? ":memory:"
  : path.resolve(__dirname, process.env.DB_FILE || "courses.db");
const db = new Database(dbFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    modules INTEGER NOT NULL,
    practice TEXT NOT NULL,
    program TEXT DEFAULT ''
  )
`);

if (db.prepare("SELECT COUNT(*) AS count FROM courses").get().count === 0) {
  const insert = db.prepare(
    "INSERT INTO courses (title, modules, practice, program) VALUES (?, ?, ?, ?)"
  );
  insert.run(
    "Основы веб-разработки",
    3,
    "Многостраничный HTML5-сайт",
    "Структура HTML-документа.\nСсылки, изображения, списки и таблицы.\nФормы и проверка ввода."
  );
  insert.run(
    "Алгоритмы и логика",
    3,
    "Алгоритм поиска максимума",
    "Последовательность действий.\nУсловия и ветвления.\nЦиклы и перебор элементов."
  );
  insert.run(
    "Введение в базы данных",
    3,
    "Модель каталога курсов",
    "Таблицы, строки и столбцы.\nПервичные ключи и связи.\nПростые запросы SELECT."
  );
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Мудл - документация API"
}));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id >= 1 ? id : null;
}

function validateCourse(body) {
  const { title, modules, practice, program = "" } = body || {};
  if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 100) {
    return { error: "Название курса обязательно (от 3 до 100 символов)" };
  }
  if (!Number.isInteger(modules) || modules < 1 || modules > 20) {
    return { error: "Количество модулей должно быть целым числом от 1 до 20" };
  }
  if (typeof practice !== "string" || !practice.trim() || practice.trim().length > 150) {
    return { error: "Практическая работа обязательна (до 150 символов)" };
  }
  if (typeof program !== "string" || program.length > 1000) {
    return { error: "Программа должна быть строкой до 1000 символов" };
  }
  return {
    data: {
      title: title.trim(),
      modules,
      practice: practice.trim(),
      program: program.trim()
    }
  };
}

const getCourse = db.prepare("SELECT * FROM courses WHERE id = ?");

app.get("/api/courses", (req, res) => {
  res.json(db.prepare("SELECT * FROM courses ORDER BY id").all());
});

app.get("/api/courses/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Некорректный ID" });
  }
  const course = getCourse.get(id);
  if (!course) {
    return res.status(404).json({ error: "Курс не найден" });
  }
  res.json(course);
});

app.post("/api/courses", (req, res) => {
  const { data, error } = validateCourse(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const result = db.prepare(
    "INSERT INTO courses (title, modules, practice, program) VALUES (?, ?, ?, ?)"
  ).run(data.title, data.modules, data.practice, data.program);
  res.status(201).json(getCourse.get(result.lastInsertRowid));
});

app.put("/api/courses/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Некорректный ID" });
  }
  const { data, error } = validateCourse(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const result = db.prepare(
    "UPDATE courses SET title = ?, modules = ?, practice = ?, program = ? WHERE id = ?"
  ).run(data.title, data.modules, data.practice, data.program, id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Курс не найден" });
  }
  res.json(getCourse.get(id));
});

app.delete("/api/courses/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Некорректный ID" });
  }
  const result = db.prepare("DELETE FROM courses WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Курс не найден" });
  }
  res.json({ message: "Курс успешно удалён" });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "success",
    message: "Сервер работает",
    containerized: process.env.CONTAINERIZED === "true"
  });
});

app.get("/api/info", (req, res) => {
  res.json({
    name: "Мудл",
    description: "Сайт учебных курсов",
    version: packageInfo.version,
    node: process.version,
    port: Number(PORT),
    environment: process.env.NODE_ENV || "development",
    containerized: process.env.CONTAINERIZED === "true",
    courses: db.prepare("SELECT COUNT(*) AS count FROM courses").get().count
  });
});

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Некорректный JSON" });
  }
  res.status(500).json({ error: "Ошибка сервера" });
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
