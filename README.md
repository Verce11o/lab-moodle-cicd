# Мудл

Учебный сайт курсов: четыре страницы, REST API на Node.js и Express, база SQLite и документация Swagger.

## Установка

Нужны Node.js 22 и npm.

```bash
git clone https://github.com/Verce11o/lab-moodle-cicd.git
cd lab-moodle-cicd
npm install
```

## Запуск

```bash
npm start
```

Сайт открывается по адресу http://localhost:3000, документация API по адресу http://localhost:3000/api-docs.

## Тесты

```bash
npm test
```

При каждом push и pull request тесты запускаются автоматически в GitHub Actions.
