const express = require('express');
const path = require('path');
const cors = require('cors');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken'); 
// Секреты подписи
const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";
// Время жизни токенов
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";
const JWT_SECRET = 'zh8';
const app = express();
const port = 3000;
const users = [];
const refreshTokens = new Set();
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role
    },
    ACCESS_SECRET,
    {    
      expiresIn: ACCESS_EXPIRES_IN,
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role
    },
    REFRESH_SECRET,
    {
      expiresIn: REFRESH_EXPIRES_IN,
    }
  );
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('Body:', req.body);
    }
  });
  next();
});


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
    image: 'https://dlcdnwebimgs.asus.com/gain/686260B2-E052-4E90-A287-6B829AE850B3'
  },
  {
    id: nanoid(8),
    name: 'Смартфон Samsung Galaxy S23 Ultra',
    category: 'Смартфоны',
    description: 'Экран 6.8", 256GB, 12GB RAM, камера 200MP, S Pen',
    price: 99990,
    stock: 8,
    rating: 4.9,
    image: 'https://hi-stores.ru/upload/iblock/da7/96tgb2xo7w1c4algermex8tpub75uo8e.jpg'
  },
  {
    id: nanoid(8),
    name: 'Наушники Sony WH-1000XM5',
    category: 'Аудио',
    description: 'Беспроводные наушники с шумоподавлением, 30ч работы',
    price: 32990,
    stock: 15,
    rating: 4.7,
    image: 'https://doctorhead.ru/upload/dev2fun.imagecompress/webp/iblock/81e/5zure0rbjtg5lv3nvxktztkaflzycvg3/sony_wh1000xm5_beige_silver.webp'
  },
  {
    id: nanoid(8),
    name: 'iPad Pro 12.9" M2',
    category: 'Планшеты',
    description: 'Чип M2, 256GB, Wi-Fi + Cellular, поддержка Apple Pencil',
    price: 119990,
    stock: 3,
    rating: 4.9,
    image: 'https://apple-rostov.com/image/cache/catalog/Apple-iPad-Pro-12-9-M2-2022/apple-ipad-pro-12-9-m2-wi%E2%80%91fi-cellular-512-gb-space-gray-2022-800x800-product_popup.jpg'
  },
  {
    id: nanoid(8),
    name: 'Монитор LG UltraGear 27"',
    category: 'Мониторы',
    description: '1440p, 165Hz, 1ms, IPS, G-Sync совместимый',
    price: 45990,
    stock: 7,
    rating: 4.6,
    image: 'https://www.lg.com/ru/images/monitors/md07593595/gallery/medium01.jpg'
  },
  {
    id: nanoid(8),
    name: 'Клавиатура Logitech MX Mechanical',
    category: 'Аксессуары',
    description: 'Механическая клавиатура, подсветка, беспроводная',
    price: 18990,
    stock: 12,
    rating: 4.5,
    image: 'https://m.onlinetrade.ru/img/items/m/logitech_mx_mechanical_mini_linear_graphite_grey__2941791_6.jpg'
  },
  {
    id: nanoid(8),
    name: 'Мышь Razer DeathAdder V3 Pro',
    category: 'Аксессуары',
    description: 'Игровая мышь, беспроводная, 30000 DPI',
    price: 12990,
    stock: 20,
    rating: 4.7,
    image: 'https://c.dns-shop.ru/thumb/st4/fit/300/300/ee5fc0e330d21a1930b46ee906a481e8/c23a6bd9c79cfb1ea93bbf371727f66a71c98e1fdfa23a39be54a750ad4f508b.jpg'
  },
  {
    id: nanoid(8),
    name: 'SSD Samsung 980 Pro 1TB',
    category: 'Комплектующие',
    description: 'NVMe M.2, PCIe 4.0, скорость чтения 7000MB/s',
    price: 11990,
    stock: 25,
    rating: 4.8,
    image: 'https://images.samsung.com/is/image/samsung/ru-980-pro-nvme-m2-ssd-mz-v8p1t0bw-frontblack-303678346?$Q90_1248_936_F_PNG$'
  },
  {
    id: nanoid(8),
    name: 'PlayStation 5 Slim',
    category: 'Игровые консоли',
    description: 'Консоль с 1TB SSD, геймпад DualSense в комплекте',
    price: 54990,
    stock: 2,
    rating: 5.0,
    image: 'https://gbstore.ru/pictures/product/middle/59523_middle.jpg'
  },
  {
    id: nanoid(8),
    name: 'Умная колонка Яндекс Станция Макс',
    category: 'Умный дом',
    description: 'Алиса, звук Hi-Fi, Zigbee-хаб встроен',
    price: 22990,
    stock: 9,
    rating: 4.6,
    image: 'https://ibrat.ru/upload/iblock/0bf/fdrhcvq46047xjl0oq8sm1op44q5y99h.jpg'
  }
];









// ========== ПОЛЬЗОВАТЕЛИ ==========

// Обновляем документацию для /api/auth/register
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     description: |
 *       Создает нового пользователя. При регистрации можно указать роль.
 *       
 *       **Роли:**
 *       - `user` (по умолчанию) - обычный пользователь
 *       - `seller` - продавец (может управлять товарами)
 *       - `admin` - администратор (полный доступ)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             Обычный пользователь:
 *               value:
 *                 username: user123
 *                 password: password123
 *             Продавец:
 *               value:
 *                 username: seller123
 *                 password: password123
 *                 role: seller
 *             Администратор:
 *               value:
 *                 username: admin123
 *                 password: password123
 *                 role: admin
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Не указаны username или password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Пользователь уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

app.post("/api/auth/register", async (req, res) => {
  const { username, password, role = "user" } = req.body; // ← role по умолчанию "user"
  
  if (!username || !password) {
    return res.status(400).json({
      error: "username and password are required",
    });
  }
  
  const exists = users.some((u) => u.username === username);
  if (exists) {
    return res.status(409).json({
      error: "username already exists",
    });
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: String(users.length + 1),
    username,
    passwordHash,
    role: role
  };
  users.push(user);
  
  
  res.status(201).json({
    id: user.id,
    username: user.username,
    role: user.role
  });
});

// Обновляем документацию для /api/auth/login
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     description: |
 *       Аутентификация пользователя.
 *       При успешном входе возвращаются:
 *       - **accessToken** (живет 15 минут)
 *       - **refreshToken** (живет 7 дней)
 *       
 *       **Для тестирования 10-й практики:**
 *       1. Сохраните accessToken для авторизации
 *       2. Сохраните refreshToken для обновления токенов
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Не указаны username или password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Неверные учетные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: "username and password are required",
    });
  }
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);
  res.json({
    accessToken,
    refreshToken,
  });
});

// Обновляем документацию для /api/auth/refresh
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов (Ротация)
 *     description: |
 *       **Практика 10 - Автоматическое обновление токенов**
 *       
 *       Получение новой пары токенов с использованием refreshToken.
 *       
 *       **Важно:** 
 *       - Старый refreshToken удаляется
 *       - Выдается новая пара токенов
 *       - Старый refreshToken больше не действителен
 *       
 *       **Процесс тестирования:**
 *       1. Получите refreshToken через /login
 *       2. Подождите 15 минут (или используйте старый accessToken)
 *       3. Отправьте refreshToken на этот эндпоинт
 *       4. Получите новые токены
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Токены успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Не указан refreshToken
 *       401:
 *         description: Недействительный или истекший refreshToken
 */

app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      error: "refreshToken is required",
    });
  }
  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({
      error: "Invalid refresh token",
    });
  }
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }
    // Ротация refresh-токена:
    // старый удаляем, новый создаём
    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired refresh token",
    });
  }
});
// ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (только для админа) ==========

// GET /api/users - получить всех пользователей
app.get("/api/users", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const usersList = users.map(({ passwordHash, ...user }) => user);
  res.json(usersList);
});

// GET /api/users/:id - получить пользователя по id
app.get("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const { passwordHash, ...userData } = user;
  res.json(userData);
});

// PUT /api/users/:id - обновить пользователя (роль или имя)
app.put("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const { username, role } = req.body;
  
  if (username) {
    users[userIndex].username = username;
  }
  if (role) {
    users[userIndex].role = role;
  }
  
  const { passwordHash, ...userData } = users[userIndex];
  res.json(userData);
});

// DELETE /api/users/:id - удалить пользователя
app.delete("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  
  users.splice(userIndex, 1);
  res.status(204).send();
});
// middleware для проверки jwt
// server/app.js - authMiddleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Токен не предоставлен" });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: "Неверный формат токена. Используй: Bearer <token>" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Токен истек" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Недействительный токен" });
    }
    return res.status(401).json({ error: "Ошибка аутентификации" });
  }
}


function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    
    if (!userRole) {
      return res.status(403).json({ error: "Role not found" });
    }
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }
    
    next();
  };
}

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получение информации о текущем пользователе
 *     description: |
 *       **Практика 10 - Проверка accessToken**
 *       
 *       Возвращает данные текущего пользователя.
 *       Требуется валидный accessToken.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Недействительный или истекший токен
 */

// server/app.js - убедитесь, что /api/auth/me возвращает role
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const userId = req.user.sub;
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role  
  });
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

// ========== SWAGGER КОНФИГУРАЦИЯ ==========
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API интернет-магазина',
      version: '1.0.0',
      description: `
        ## 🔐 Система аутентификации с JWT токенами
        
        ### Механизм работы:
        - **Access Token**: живет 15 минут, используется для доступа к защищенным маршрутам
        - **Refresh Token**: живет 7 дней, используется для получения новой пары токенов
        - **Ротация**: при обновлении старый refresh токен удаляется, создается новый
        
        ### Последовательность действий:
        1. Регистрация → 2. Логин (получаем accessToken + refreshToken)
        3. Используем accessToken для запросов к защищенным API
        4. При истечении accessToken (401 ошибка) → отправляем refreshToken на /refresh
        5. Получаем новую пару токенов и повторяем запрос
        
        ### Защищенные маршруты:
        - GET /api/auth/me - информация о текущем пользователе
        - GET /api/products/:id - получение товара по ID
        - DELETE /api/products/:id - удаление товара
        - PUT /api/products/:id - полное обновление товара
      `,
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер разработки',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите ваш accessToken в формате: Bearer <token>',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'category', 'price', 'stock'],
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный ID товара',
              example: 'abc12345',
            },
            name: {
              type: 'string',
              description: 'Название товара',
              example: 'Ноутбук ASUS ROG Strix G15',
            },
            category: {
              type: 'string',
              description: 'Категория товара',
              example: 'Ноутбуки',
            },
            description: {
              type: 'string',
              description: 'Описание товара',
              example: 'Игровой ноутбук с AMD Ryzen 9, 16GB RAM, RTX 3060',
            },
            price: {
              type: 'number',
              description: 'Цена в рублях',
              example: 129990,
            },
            stock: {
              type: 'integer',
              description: 'Количество на складе',
              example: 5,
            },
            rating: {
              type: 'number',
              description: 'Рейтинг товара (0-5)',
              example: 4.8,
            },
            image: {
              type: 'string',
              description: 'Путь к изображению',
              example: '/images/asus-rog.jpg',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '1',
            },
            username: {
              type: 'string',
              example: 'john_doe',
            },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT токен доступа (срок 15 минут)',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT токен обновления (срок 7 дней)',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'username and password are required',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Эндпоинты для регистрации и аутентификации',
      },
      {
        name: 'User',
        description: 'Эндпоинты для работы с пользователем',
      },
      {
        name: 'Products',
        description: 'Эндпоинты для работы с товарами',
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true, // Сохранять авторизацию между запросами
    docExpansion: 'list', // Раскрыть все разделы
    filter: true, // Включить поиск
    showExtensions: true,
    showCommonExtensions: true,
  },
}));


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: john_doe
 *         password:
 *           type: string
 *           format: password
 *           example: securePassword123
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: john_doe
 *         password:
 *           type: string
 *           format: password
 *           example: securePassword123
 *     
 *     RefreshRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */








/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     description: |
 *       **Доступ:** Пользователь (user), Продавец (seller), Администратор (admin)
 *       
 *       Возвращает список всех товаров в каталоге.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 */
app.get("/api/products", authMiddleware, (req, res) => {
  res.json(products);
});


/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     description: |
 *       **Доступ:** Пользователь (user), Продавец (seller), Администратор (admin)
 *       
 *       Возвращает детальную информацию о товаре.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */



app.get("/api/products/:id", authMiddleware, (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
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
app.get('/api/products/category/:category' , (req, res) => {
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
 *     summary: Создать новый товар
 *     description: |
 *       **Практика 11 - RBAC**
 *       
 *       **Доступ:** Только Продавец (seller) и Администратор (admin)
 *       
 *       Создает новый товар в каталоге.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *                 example: Новый товар
 *               category:
 *                 type: string
 *                 example: Категория
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 1000
 *               stock:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав (требуется роль seller или admin)
 */
app.post("/api/products", authMiddleware, roleMiddleware(["seller", "admin"]), (req, res) => {
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
app.patch("/api/products/:id", authMiddleware, roleMiddleware(["seller", "admin"]), (req, res) => {
const productIndex = products.findIndex(p => p.id === Number(req.params.id));
const id = Number(req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, category, description, price, stock, rating, image } = req.body;

  if (name !== undefined) products[productIndex].name = name.trim();
  if (category !== undefined) products[productIndex].category = category.trim();
  if (description !== undefined) products[productIndex].description = description.trim();
  if (price !== undefined) products[productIndex].price = Number(price);
  if (stock !== undefined) products[productIndex].stock = Number(stock);
  if (rating !== undefined) products[productIndex].rating = Number(rating);
  if (image !== undefined) products[productIndex].image = image;

  res.json(products[productIndex]);
});
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     description: |
 *       **Практика 11 - RBAC**
 *       
 *       **Доступ:** Только Администратор (admin)
 *       
 *       Удаляет товар из каталога.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав (требуется роль admin)
 *       404:
 *         description: Товар не найден
 */

app.delete("/api/products/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  
  const deletedProduct = products[productIndex];
  products.splice(productIndex, 1);
  
  res.status(204).send();
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар
 *     description: |
 *       **Практика 11 - RBAC**
 *       
 *       **Доступ:** Только Продавец (seller) и Администратор (admin)
 *       
 *       Полностью обновляет информацию о товаре.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Товар не найден
 */


app.put("/api/products/:id", authMiddleware, roleMiddleware(["seller", "admin"]), (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  // ВАЖНО: принимаем name, а не title!
  const { name, category, description, price, stock, rating, image } = req.body;

  const updatedProduct = { ...products[productIndex] };
  
  if (name !== undefined) updatedProduct.name = name.trim();
  if (category !== undefined) updatedProduct.category = category.trim();
  if (description !== undefined) updatedProduct.description = description.trim();
  if (price !== undefined) updatedProduct.price = Number(price);
  if (stock !== undefined) updatedProduct.stock = Number(stock);
  if (rating !== undefined) updatedProduct.rating = Number(rating);
  if (image !== undefined) updatedProduct.image = image;

  products[productIndex] = updatedProduct;
  
  res.json(updatedProduct);
});


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     description: |
 *       **Практика 11 - RBAC (только администратор)**
 *       
 *       **Доступ:** Только Администратор (admin)
 *       
 *       Возвращает список всех зарегистрированных пользователей.
 *       Пароли не отображаются.
 *     tags: [Users Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав (требуется роль admin)
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     description: |
 *       **Практика 11 - RBAC (только администратор)**
 *       
 *       **Доступ:** Только Администратор (admin)
 *     tags: [Users Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить пользователя
 *     description: |
 *       **Практика 11 - RBAC (только администратор)**
 *       
 *       **Доступ:** Только Администратор (admin)
 *       
 *       Изменяет роль или имя пользователя.
 *     tags: [Users Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     description: |
 *       **Практика 11 - RBAC (только администратор)**
 *       
 *       **Доступ:** Только Администратор (admin)
 *       
 *       Удаляет пользователя из системы.
 *     tags: [Users Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Пользователь удален
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */


// ========== СТАТИКА REACT ==========
app.use(express.static(path.join(__dirname, '../client/build')));

// ========== ВСЕ НЕ-API ЗАПРОСЫ НА REACT ==========
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
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

// ========== ЗАПУСК ==========
app.listen(port, () => {
  console.log(`\n🚀 СЕРВЕР ЗАПУЩЕН НА ПОРТУ ${port}`);
  console.log(`📦 API: http://localhost:${port}/api/products`);
  console.log(`📚 Swagger: http://localhost:${port}/api-docs`);
  console.log(`🖥️  Клиент: http://localhost:${port}\n`);
});