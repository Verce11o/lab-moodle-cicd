const courseProperties = {
  title: {
    type: "string",
    minLength: 3,
    maxLength: 100,
    example: "Основы веб-разработки"
  },
  modules: {
    type: "integer",
    minimum: 1,
    maximum: 20,
    example: 3
  },
  practice: {
    type: "string",
    maxLength: 150,
    example: "Многостраничный HTML5-сайт"
  },
  program: {
    type: "string",
    maxLength: 1000,
    description: "Темы курса, каждая тема с новой строки",
    example: "Структура HTML-документа.\nСсылки, изображения, списки и таблицы.\nФормы и проверка ввода."
  }
};

const errorResponse = (description, message) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { error: message }
    }
  }
});

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "Идентификатор курса",
  schema: { type: "integer", minimum: 1, example: 1 }
};

const courseBody = {
  required: true,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/CourseInput" }
    }
  }
};

const courseResponse = (description) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Course" }
    }
  }
});

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Мудл - API учебных курсов",
    version: "1.0.0",
    description:
      "REST API сайта Мудл. Позволяет просматривать, добавлять, изменять и удалять учебные курсы. Данные хранятся в базе SQLite."
  },
  servers: [{ url: "/", description: "Текущий сервер" }],
  tags: [
    { name: "Courses", description: "Операции с курсами" },
    { name: "System", description: "Состояние приложения" }
  ],
  paths: {
    "/api/status": {
      get: {
        tags: ["System"],
        summary: "Проверить состояние сервера",
        responses: {
          200: {
            description: "Сервер работает",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    message: { type: "string", example: "Сервер работает" },
                    containerized: { type: "boolean", example: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/info": {
      get: {
        tags: ["System"],
        summary: "Информация о приложении",
        responses: {
          200: {
            description: "Сведения о приложении",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Мудл" },
                    description: { type: "string", example: "Сайт учебных курсов" },
                    version: { type: "string", example: "2.0.0" },
                    node: { type: "string", example: "v22.0.0" },
                    port: { type: "integer", example: 3000 },
                    environment: { type: "string", example: "production" },
                    containerized: { type: "boolean", example: true },
                    courses: { type: "integer", example: 3 }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/courses": {
      get: {
        tags: ["Courses"],
        summary: "Получить список всех курсов",
        responses: {
          200: {
            description: "Список курсов",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Course" }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Courses"],
        summary: "Добавить новый курс",
        requestBody: courseBody,
        responses: {
          201: courseResponse("Курс создан"),
          400: errorResponse("Некорректные данные", "Название курса обязательно (от 3 до 100 символов)")
        }
      }
    },
    "/api/courses/{id}": {
      get: {
        tags: ["Courses"],
        summary: "Получить курс по идентификатору",
        parameters: [idParameter],
        responses: {
          200: courseResponse("Найденный курс"),
          400: errorResponse("Некорректный ID", "Некорректный ID"),
          404: errorResponse("Курс не найден", "Курс не найден")
        }
      },
      put: {
        tags: ["Courses"],
        summary: "Изменить курс",
        parameters: [idParameter],
        requestBody: courseBody,
        responses: {
          200: courseResponse("Курс изменён"),
          400: errorResponse("Некорректные данные или ID", "Название курса обязательно (от 3 до 100 символов)"),
          404: errorResponse("Курс не найден", "Курс не найден")
        }
      },
      delete: {
        tags: ["Courses"],
        summary: "Удалить курс",
        parameters: [idParameter],
        responses: {
          200: {
            description: "Курс удалён",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Курс успешно удалён" }
                  }
                }
              }
            }
          },
          400: errorResponse("Некорректный ID", "Некорректный ID"),
          404: errorResponse("Курс не найден", "Курс не найден")
        }
      }
    }
  },
  components: {
    schemas: {
      Course: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          ...courseProperties
        }
      },
      CourseInput: {
        type: "object",
        required: ["title", "modules", "practice"],
        properties: courseProperties
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Курс не найден" }
        }
      }
    }
  }
};
