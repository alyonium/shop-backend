import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';

const app = express();
const port = process.env.PORT || 3000;

// eslint-disable-next-line no-bitwise
const db = new sqlite3.Database('db.db', sqlite3.OPEN_READWRITE);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/getProductsList', (req, res) => {
  db.all('SELECT * FROM Products', (err, products) => {
    res.status(200).send(JSON.stringify(products));
  });
});

app.post('/makeOrder', (req, res) => {
  const order = {
    summary: req.body.summary,
    date: req.body.date,
    product: req.body.product,
  };

  db.run('INSERT INTO Orders(summary, date) VALUES (?, ?)', [order.summary, order.date]);

  db.get('SELECT last_insert_rowid() as id', (err1, row) => {
    order.id = row.id;

    order.product.forEach((product) => {
      db.get('SELECT id FROM Products WHERE title = ?', [product.title], (err2, productRow) => {
        db.run('INSERT INTO Products_Orders(productId, orderId, quantity) VALUES(?, ?, ?)',
          [productRow.id, order.id, product.quantity]);
      });
    });
  });

  res.status(200).send();
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
