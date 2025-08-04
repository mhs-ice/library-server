const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
require('dotenv').config();

const session = require('express-session');
const bcrypt = require('bcrypt');

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

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

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about', 'about.html'));
});

app.get('/book', (req, res) => {
  res.sendFile(path.join(__dirname, 'book', 'books.html'));
});

app.get('/donate', (req, res) => {
  res.sendFile(path.join(__dirname, 'donate', 'donate.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname,'authentication', 'login', 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'authentication', 'signup', 'signup.html'));
});
app.get('/forgot-pass', (req, res) => {
  res.sendFile(path.join(__dirname,'authentication', 'forgot-pass', 'forgot-password.html'));
});

app.get('/checkout', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout', 'checkout.html'));
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
    if (err) {
      console.error("Error Occurred:", err);
      return res.status(500).json({ error: 'Database insertion failed' });
    }
    res.json({
      message: 'Borrowing record submitted successfully!',
      recordId: result.insertId
    });
  });

});

// POST API for book donations
app.post('/submit-book', (req, res) => {
  const { title, author, book_condition, isbn, description } = req.body;

  const sql = `
    INSERT INTO book_donations (title, author, book_condition, isbn, description)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, author, book_condition, isbn, description], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Book donation submitted successfully!' });
  });
});

// POST API for financial support
app.post('/submit-support', (req, res) => {
  const { amount, donor_name, donor_email, message, anonymous } = req.body;

  const sql = `
    INSERT INTO financial_supports (amount, donor_name, donor_email, message, anonymous)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [amount, donor_name, donor_email, message, anonymous], (err, result) => {
    if (err) {
      console.error('Support insert error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Thank you for your financial support!' });
  });
});

app.get('/featured-books', (req, res) =>{
  const sql='select * from books';
  db.query(sql, (err, results)=>{
    if(err){
      console.log("Error:", err)
      return res.status(500).json({error: 'Error in fetching books'})
    }
    res.json(results)
  })
})

// ----------------------------------------main--------------------------------------------

// Signup route
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { student_id, first_name, last_name, email, phone, department, year, address, pass } = req.body;

        const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR student_id = ?';
        db.query(checkUserQuery, [email, student_id], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length > 0) {
                return res.status(409).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(pass, 10);

            const insertQuery = 'INSERT INTO users (student_id, first_name, last_name, email, phone, department, year, address, pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(insertQuery, [student_id, first_name, last_name, email, phone, department, year, address, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({ message: 'Error creating user' });
                }

                res.status(201).json({ 
                    message: 'User created successfully',
                    userId: result.insertId 
                });
            });
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = results[0];

            const isPasswordValid = await bcrypt.compare(password, user.pass);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create session
            req.session.userId = user.student_id;
            req.session.username = user.first_name;
            req.session.email = user.email;

            res.json({ 
                message: 'Login successful',
                user: {
                    id: user.student_id,
                    username: user.first_name,
                    email: user.email
                }
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Check authentication status
app.get('/api/auth/check', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            authenticated: true, 
            user: { 
                id: req.session.userId, 
                username: req.session.username,
                email: req.session.email
            } 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Middleware to protect routes
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
}



// ------------------main----------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
