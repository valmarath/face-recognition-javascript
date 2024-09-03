const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./src/routes/api.js');
const bodyParser = require('body-parser');

const app = express();  

// Serve Swagger documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const corsOptions = {
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enables cookie sharing or authentication
    optionsSuccessStatus: 204, // Respond with a 204 status code for preflight options
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('', apiRoutes);

app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Endpoint not found.' });
});

const errorHandler = (err, req, res, next) => {
    if(err.status) {
        res.status(err.status);
    } else {
        res.status(400); //Bad Request 
    }
    if(err.message) {
        res.json({ error: err.message });
    } else {
        res.json({ error: 'An error occurred.'});
    }
};
app.use(errorHandler);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = { app, server }; // Export both app and server