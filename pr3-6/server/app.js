const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// ========== ВСЕ ТОВАРЫ (10 штук) ==========
let products = [
  {
    id: nanoid(8),
    name: 'Ноутбук ASUS ROG Strix G15',
    category: 'Ноутбуки',
    description: 'Игровой ноутбук с AMD Ryzen 9, 16GB RAM, RTX 3060, 512GB SSD',
    price: 129990,
    stock: 5,
    rating: 4.8,
    image: '/images/asus-rog.jpg'
  },
  {
    id: nanoid(8),
    name: 'Смартфон Samsung Galaxy S23 Ultra',
    category: 'Смартфоны',
    description: 'Экран 6.8", 256GB, 12GB RAM, камера 200MP, S Pen',
    price: 99990,
    stock: 8,
    rating: 4.9,
    image: '/images/samsung-s23.jpg'
  },
  {
    id: nanoid(8),
    name: 'Наушники Sony WH-1000XM5',
    category: 'Аудио',
    description: 'Беспроводные наушники с шумоподавлением, 30ч работы',
    price: 32990,
    stock: 15,
    rating: 4.7,
    image: '/images/sony-xm5.jpg'
  },
  {
    id: nanoid(8),
    name: 'iPad Pro 12.9" M2',
    category: 'Планшеты',
    description: 'Чип M2, 256GB, Wi-Fi + Cellular, поддержка Apple Pencil',
    price: 119990,
    stock: 3,
    rating: 4.9,
    image: '/images/ipad-pro.jpg'
  },
  {
    id: nanoid(8),
    name: 'Монитор LG UltraGear 27"',
    category: 'Мониторы',
    description: '1440p, 165Hz, 1ms, IPS, G-Sync совместимый',
    price: 45990,
    stock: 7,
    rating: 4.6,
    image: '/images/lg-ultragear.jpg'
  },
  {
    id: nanoid(8),
    name: 'Клавиатура Logitech MX Mechanical',
    category: 'Аксессуары',
    description: 'Механическая клавиатура, подсветка, беспроводная',
    price: 18990,
    stock: 12,
    rating: 4.5,
    image: '/images/logitech-mx.jpg'
  },
  {
    id: nanoid(8),
    name: 'Мышь Razer DeathAdder V3 Pro',
    category: 'Аксессуары',
    description: 'Игровая мышь, беспроводная, 30000 DPI',
    price: 12990,
    stock: 20,
    rating: 4.7,
    image: '/images/razer-da.jpg'
  },
  {
    id: nanoid(8),
    name: 'SSD Samsung 980 Pro 1TB',
    category: 'Комплектующие',
    description: 'NVMe M.2, PCIe 4.0, скорость чтения 7000MB/s',
    price: 11990,
    stock: 25,
    rating: 4.8,
    image: '/images/samsung-ssd.jpg'
  },
  {
    id: nanoid(8),
    name: 'PlayStation 5 Slim',
    category: 'Игровые консоли',
    description: 'Консоль с 1TB SSD, геймпад DualSense в комплекте',
    price: 54990,
    stock: 2,
    rating: 5.0,
    image: '/images/ps5.jpg'
  },
  {
    id: nanoid(8),
    name: 'Умная колонка Яндекс Станция Макс',
    category: 'Умный дом',
    description: 'Алиса, звук Hi-Fi, Zigbee-хаб встроен',
    price: 22990,
    stock: 9,
    rating: 4.6,
    image: '/images/yandex-station.jpg'
  }
];

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('Body:', req.body);
    }
  });
  next();
});

// ========== Функция-помощник ==========
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

// ========== SWAGGER ==========
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API интернет-магазина электроники',
      version: '1.0.0',
      description: 'API для управления товарами',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер',
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена в рублях
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *         rating:
 *           type: number
 *           description: Рейтинг товара (0-5)
 *         image:
 *           type: string
 *           description: Путь к изображению
 *       example:
 *         id: abc12345
 *         name: Ноутбук ASUS ROG Strix G15
 *         category: Ноутбуки
 *         price: 129990
 *         stock: 5
 *         rating: 4.8
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (product) res.json(product);
});

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Получает товары по категории
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Название категории
 *     responses:
 *       200:
 *         description: Товары указанной категории
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products/category/:category', (req, res) => {
  const category = req.params.category;
  const filtered = products.filter(p => 
    p.category.toLowerCase() === category.toLowerCase()
  );
  res.json(filtered);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создаёт новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверные входные данные
 */
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;

  if (!name || !category || !price || stock === undefined) {
    return res.status(400).json({ 
      error: "Missing required fields: name, category, price, stock" 
    });
  }

  const newProduct = {
    id: nanoid(8),
    name: name.trim(),
    category: category.trim(),
    description: description?.trim() || '',
    price: Number(price),
    stock: Number(stock),
    rating: rating ? Number(rating) : 0,
    image: image || '/images/default.jpg'
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Частично обновляет данные товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновлённый товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
app.patch('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, category, description, price, stock, rating, image } = req.body;

  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = image;

  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет тела ответа)
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);

  if (!exists) {
    return res.status(404).json({ error: "Product not found" });
  }

  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

// 404 обработчик
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Сервер интернет-магазина запущен на http://localhost:${port}`);
  console.log(`Товары: http://localhost:${port}/api/products`);
  console.log(`Документация Swagger: http://localhost:${port}/api-docs`);
});