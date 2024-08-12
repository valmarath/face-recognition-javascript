const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Face Recognition API',
        version: '1.0.0',
        description: 'This API provides a few examples of user authentication and registration using face recognition technology.'
    },
};

const options = {
    swaggerDefinition,
    apis: ['./src/docs/*.js'], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;