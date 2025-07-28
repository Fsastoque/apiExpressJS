const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();
const PORT = process.env.PORT || 3000;
const swaggerDocument = YAML.load('./openapi.yaml');
const OpenApiValidator = require('express-openapi-validator');
const { date } = require('express-openapi-validator/dist/framework/base.serdes');

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

// Simulación de usuarios en memoria
let users = [
    { id: 1, name: 'Juan', age: 25, email: 'juan@mail.com' },
    { id: 2, name: 'Ana', age: 30, email: 'ana@mail.com' }
];

// Obtener usuario por ID
app.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    if (user) {
        res.status(200).json({ id: user.id, name: user.name });
    } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
});

// Actualizar usuario por ID
app.post('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, age, email } = req.body;
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        users[userIndex] = { id, name, age, email };
        res.status(200).json({ id: id.toString(), name, age, email });
    } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
});

// Ruta base
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.get('/v2/hello', (req, res) => {
    res.json({ 
        message: 'Hello World',
        version: 'v2',
        timestamp: new Date().toISOString()
    });
});

app.post('/users', (req, res) => {
    const { name, age, email } = req.body;
    const newUser = {
        id: Date.now().toString(), // Generar un ID único basado en la fecha actual
        name, 
        age, 
        email 
    }
    res.status(201).json({newUser});
});

let products = [
  {
    id: "1",
    name: "Laptop Lenovo",
    description: "Laptop de 14 pulgadas, 8GB RAM, 256GB SSD.",
    price: 799.99,
    category: "Electronics",
    tags: ["computadora", "portátil"],
    inStock: true,
    specifications: {
      color: "gris",
      peso: "1.5kg"
    },
    ratings: [
      { score: 5, comment: "Excelente equipo" },
      { score: 4, comment: "Muy buena relación calidad/precio" }
    ]
  },
  {
    id: "2",
    name: "Camiseta Básica",
    description: "Camiseta de algodón, color blanco, talla M.",
    price: 12.5,
    category: "Clothing",
    tags: ["ropa", "básico"],
    inStock: true,
    specifications: {
      material: "algodón"
    },
    ratings: [
      { score: 4, comment: "Muy cómoda" }
    ]
  },
  {
    id: "3",
    name: "Libro: JavaScript Fácil",
    description: "Guía práctica para aprender JavaScript desde cero.",
    price: 25.0,
    category: "Books",
    tags: ["libro", "javascript"],
    inStock: false,
    specifications: {
      autor: "Juan Pérez",
      paginas: "320"
    },
    ratings: [
      { score: 5, comment: "Muy didáctico" },
      { score: 3, comment: "Esperaba más ejemplos" }
    ]
  }
];

// Función de validación según el esquema Product
function validateProduct(data) {
  const errors = [];

  // name
  if (typeof data.name !== 'string' || data.name.length < 2 || data.name.length > 40) {
    errors.push('El nombre debe ser una cadena de 2 a 40 caracteres.');
  }
  // price
  if (typeof data.price !== 'number' || data.price < 0 || Math.round(data.price * 100) % 1 !== 0) {
    errors.push('El precio debe ser un número mayor o igual a 0 y múltiplo de 0.01.');
  }
  // category
  const categories = ['Electronics', 'Clothing', 'Books', 'Other'];
  if (typeof data.category !== 'string' || !categories.includes(data.category)) {
    errors.push('La categoría debe ser una de: ' + categories.join(', '));
  }
  // description
  if (data.description && (typeof data.description !== 'string' || data.description.length > 500)) {
    errors.push('La descripción debe ser una cadena de máximo 500 caracteres.');
  }
  // tags
  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.push('Tags debe ser un arreglo de cadenas.');
    } else {
      for (const tag of data.tags) {
        if (typeof tag !== 'string' || tag.length < 1) {
          errors.push('Cada tag debe ser una cadena de al menos 1 caracter.');
          break;
        }
      }
    }
  }
  // inStock
  if (data.inStock !== undefined && typeof data.inStock !== 'boolean') {
    errors.push('inStock debe ser booleano.');
  }
  // specifications
  if (data.specifications) {
    if (typeof data.specifications !== 'object' || Array.isArray(data.specifications)) {
      errors.push('specifications debe ser un objeto.');
    } else {
      for (const key in data.specifications) {
        if (typeof data.specifications[key] !== 'string') {
          errors.push('Cada especificación debe ser una cadena.');
          break;
        }
      }
    }
  }
  // ratings
  if (data.ratings) {
    if (!Array.isArray(data.ratings)) {
      errors.push('ratings debe ser un arreglo.');
    } else {
      for (const rating of data.ratings) {
        if (
          typeof rating.score !== 'number' ||
          rating.score < 1 ||
          rating.score > 5 ||
          typeof rating.comment !== 'string' ||
          rating.comment.length > 200
        ) {
          errors.push('Cada rating debe tener score (1-5) y comment (máx 200 caracteres).');
          break;
        }
      }
    }
  }

  return errors;
}

// Crear producto
app.post('/products', (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length) {
    return res.status(400).json({ message: errors.join(' ') });
  }
  const product = { ...req.body, id: (Date.now()).toString() };
  products.push(product);
  res.status(201).json(product);
});

// Listar productos
app.get('/products', (req, res) => {
  res.json(products);
});

// Obtener producto por ID
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  res.json(product);
});

// Actualizar producto por ID
app.put('/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  const errors = validateProduct(req.body);
  if (errors.length) {
    return res.status(400).json({ message: errors.join(' ') });
  }
  products[idx] = { ...req.body, id: req.params.id };
  res.json(products[idx]);
});

// Eliminar producto por ID
app.delete('/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  products.splice(idx, 1);
  res.status(204).send();
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}/v1`);
    console.log(`http://localhost:${PORT}/v2`);
});