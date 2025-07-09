const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();
const PORT = process.env.PORT || 3000;
const swaggerDocument = YAML.load('./openapi.yaml');
const OpenApiValidator = require('express-openapi-validator')

app.use('/docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(express.json());
app.use(
    OpenApiValidator.middleware(
        {
            apiSpec: swaggerDocument,
            validateRequests: true,
            validateResponses: true,
            ignorePaths: /.*\/docs.*/,//Ignore the docs path
        }
    )
)

//Middleware para capturar el error de la  validaciones
app.use((err, req, res, next) => {
res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
        status:err.status,
    });
});



// Middleware para parsear JSON
app.use(express.json());


// Ruta base
app.get('/', (req, res) => {
    res.json({ message: 'Curso Platzi' });
});

// Ruta base
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.post('/users', (req, res) => {
    const { name, age, email } = req.body;
    const newUser = {
        id: Date.now(), // Generar un ID único basado en la fecha actual
        name, 
        age, 
        email 
    }
    res.status(201).json({newUser});
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});