import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.OAS3Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Task Delivery Preference API",
      version: "1.0.0",
      description: "API for managing delivery preferences and orders.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        OrderInput: {
          type: "object",
          required: ["deliveryType", "scheduledTime", "contactPhone"],
          properties: {
            deliveryType: {
              type: "string",
              enum: ["IN_STORE", "DELIVERY", "CURBSIDE"],
            },
            scheduledTime: {
              type: "string",
              format: "date-time",
            },
            contactPhone: {
              type: "string",
            },
            deliveryAddress: {
              type: "string",
            },
            pickupPerson: {
              type: "string",
            },
            curbsideVehicleInfo: {
              type: "string",
            },
            notes: {
              type: "string",
            },
          },
        },
        OrderUpdate: {
          allOf: [
            {
              $ref: "#/components/schemas/OrderInput",
            },
          ],
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

