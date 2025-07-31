const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/about', express.static(path.join(__dirname, 'about')));
app.use('/book', express.static(path.join(__dirname, 'book')));
app.use('/donate', express.static(path.join(__dirname, 'donate')));
app.use('/authentication', express.static(path.join(__dirname, 'authentication')));
app.use('/checkout', express.static(path.join(__dirname, 'checkout')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'mysqlmehedi',
  database: process.env.DB_NAME || 'library_db'
});

db.connect(err => {
  if (err) {
    console.error('DB Connection Failed:', err);
  } else {
    console.log('MySQL Connected!');
  }
});

app.post('/borrow-checkout', (req, res) => {
  const { id, first_name, last_name, email, phone_number, borrowed_date, return_date, department, s_session, address, notes } = req.body;

  if (!id || !first_name || !last_name || !email || !phone_number || !borrowed_date) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['id', 'first_name', 'last_name', 'email', 'phone_number', 'borrowed_date']
    });
  }

  const sql = `
    INSERT INTO borrowing_records (id, first_name, last_name, email, phone_number, borrowed_date, return_date, department, s_session, address, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [id, first_name, last_name, email, phone_number, borrowed_date, return_date, department, s_session, address, notes], (err, result) => {
    res.json({ 
      message: 'Borrowing record submitted successfully!',
      recordId: result.insertId 
    });
  });
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
