const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());   

let products = [
    { id: 1, name: 'мышь', price: 5000 },
    { id: 2, name: 'клавиатура', price: 7000 },
    { id: 3, name: 'микрофон', price: 8000 },
];


app.get('/', (req, res) => {
    res.send('Сервер работает 🚀');
});

app.get('/products', (req, res) => {
    res.json(products);
});

app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    res.json(product);
});

app.post('/products', (req, res) => {
    const { name, price } = req.body;

    const newProduct = {
        id: Date.now(),
        name,
        price
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.patch('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }

    const { name, price } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;

    res.json(product);
});

app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }

    products = products.filter(p => p.id !== id);

    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});