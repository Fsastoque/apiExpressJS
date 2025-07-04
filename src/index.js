const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();
const PORT = process.env.PORT || 3000;
const swaggerDocument = YAML.load('./openapi.yaml');

app.use('/docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Middleware para parsear JSON
app.use(express.json());

// Ruta base
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello World' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});