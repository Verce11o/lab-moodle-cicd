const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");

process.env.DB_FILE = ":memory:";
const app = require("./server");

describe("Мудл: тесты Web-приложения", () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, "127.0.0.1", resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => {
    server.close();
  });

  const send = (url, method, body) =>
    fetch(baseUrl + url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

  it("главная страница открывается", async () => {
    const response = await fetch(baseUrl + "/");
    assert.strictEqual(response.status, 200);
    assert.match(await response.text(), /Мудл/);
  });

  it("GET /api/status возвращает success", async () => {
    const response = await fetch(baseUrl + "/api/status");
    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.status, "success");
  });

  it("GET /api/info возвращает информацию о приложении", async () => {
    const response = await fetch(baseUrl + "/api/info");
    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.name, "Мудл");
    assert.strictEqual(data.courses, 3);
  });

  it("GET /api/courses возвращает три курса", async () => {
    const response = await fetch(baseUrl + "/api/courses");
    assert.strictEqual(response.status, 200);
    const courses = await response.json();
    assert.strictEqual(courses.length, 3);
  });

  it("POST /api/courses добавляет курс", async () => {
    const response = await send("/api/courses", "POST", {
      title: "Основы Docker",
      modules: 2,
      practice: "Сборка образа"
    });
    assert.strictEqual(response.status, 201);
    const course = await response.json();
    assert.strictEqual(course.title, "Основы Docker");
  });

  it("POST /api/courses с пустым названием возвращает 400", async () => {
    const response = await send("/api/courses", "POST", {
      title: "",
      modules: 2,
      practice: "Тест"
    });
    assert.strictEqual(response.status, 400);
  });
});
