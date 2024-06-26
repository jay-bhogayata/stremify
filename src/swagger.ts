import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stremify API",
      version: "0.0.1",
      description: "A backend api for video streaming platform.",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "jay bhogayata",
        email: "contact@jaybhogayata.dev",
      },
    },

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "sessionId",
        },
      },
    },
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./src/schemas.ts",
    "./routes/*.js",
    "./controllers/*.js",
    "./schemas.js",
  ],
};

export const swaggerDocs = swaggerJsdoc(swaggerOptions);
