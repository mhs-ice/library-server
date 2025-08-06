const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { createClient } = require('redis');
const { RedisStore } = require('connect-redis');

const app = express();

app.use(cors());
app.use(express.json());
require('dotenv').config();

// Redis and Session Initialization
let redisClient;

(async () => {
  try {
    // 1. Create Redis client
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => Math.min(retries * 100, 5000)
      }
    });

    // 2. Add error handling
    redisClient.on('error', err => console.error('Redis Client Error:', err));

    // 3. Connect to Redis
    await redisClient.connect();
    console.log('Redis connected successfully');

    // 4. Configure session middleware FIRST
    app.use(session({
      store: new RedisStore({
        client: redisClient,
        prefix: "myapp:"
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
        maxAge: 86400000
      }
    }));
    // ================== MIDDLEWARE DEFINITIONS ==================
    function checkAuthStatus(req, res, next) {
      // 1. Verify session middleware is loaded
      if (!req.session) {
        return res.status(500).json({ error: 'Authentication system not ready' });
      }

      // 2. Check authentication
      if (!req.session.userId) {
        // Track where user came from for redirect back
        const returnTo = req.originalUrl;
        return res.redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      }

      // 3. Add user data to response locals
      res.locals.user = {
        id: req.session.userId,
        email: req.session.email
      };

      next();
    }

    console.log('Redis session store configured');

    // Database Connection
    const db = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 36628,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 30000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      timezone: 'Z',
      charset: 'utf8mb4_unicode_ci'
    });

    // Test DB Connection
    async function testConnection() {
      try {
        const connection = await db.getConnection();
        console.log('Database connected successfully');
        connection.release();
      } catch (error) {
        console.error('Database connection failed:', error);
      }
    }
    await testConnection();

    // Middleware to check if session is ready
    app.use((req, res, next) => {
      if (!req.session && !['/health', '/login', '/signup', '/api/auth/signup', '/api/auth/login'].includes(req.path)) {
        return res.status(503).json({ error: 'Service initializing' });
      }
      next();
    });

    // Static Files Middleware
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/about', express.static(path.join(__dirname, 'about')));
    app.use('/book', express.static(path.join(__dirname, 'book')));
    app.use('/donate', express.static(path.join(__dirname, 'donate')));
    app.use('/authentication', express.static(path.join(__dirname, 'authentication')));
    app.use('/checkout', express.static(path.join(__dirname, 'checkout')));
    app.use('/profile', express.static(path.join(__dirname, 'profile')));

    // Route Handlers
    app.get('/', (req, res) => {
      // res.sendFile(path.join(__dirname, 'index.html'));
      res.send("Hello from Railway")
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
      res.sendFile(path.join(__dirname, 'authentication', 'login', 'login.html'));
    });

    app.get('/signup', (req, res) => {
      res.sendFile(path.join(__dirname, 'authentication', 'signup', 'signup.html'));
    });

    app.get('/forgot-pass', (req, res) => {
      res.sendFile(path.join(__dirname, 'authentication', 'forgot-pass', 'forgot-password.html'));
    });

    app.get('/reset-password', (req, res) => {
      res.sendFile(path.join(__dirname, 'authentication', 'forgot-pass', 'reset-password.html'));
    });

    app.get('/checkout', checkAuthStatus, (req, res) => {
      res.sendFile(path.join(__dirname, 'checkout', 'checkout.html'));
    });

    app.get('/health', (req, res) => res.sendStatus(200));

    // Authentication Middleware
    function requireAuth(req, res, next) {
      if (!req.session.userId) {
        return res.redirect('/login');
      }
      next();
    }

    // Protected Routes
    app.get('/checkout', requireAuth, (req, res) => {
      res.sendFile(path.join(__dirname, 'checkout', 'checkout.html'));
    });

    app.get('/profile', requireAuth, (req, res) => {
      res.sendFile(path.join(__dirname, 'profile', 'profile.html'));
    });

    // Database Operations
    app.post('/borrow-checkout', async (req, res) => {
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

      try {
        const [result] = await db.query(sql, [id, first_name, last_name, email, phone_number, borrowed_date, return_date, department, s_session, address, notes]);
        res.json({
          message: 'Borrowing record submitted successfully!',
          recordId: result.insertId
        });
      } catch (error) {
        console.error("Error Occurred:", error);
        res.status(500).json({ error: 'Database insertion failed' });
      }
    });

    // POST API for book donations
    app.post('/submit-book', async (req, res) => {
      const { title, author, book_condition, isbn, description } = req.body;

      const sql = `
        INSERT INTO book_donations (title, author, book_condition, isbn, description)
        VALUES (?, ?, ?, ?, ?)
      `;

      try {
        await db.execute(sql, [title, author, book_condition, isbn, description]);
        res.json({ message: 'Book donation submitted successfully!' });
      } catch (err) {
        console.error('Insert error:', err);
        res.status(500).json({ error: err.message });
      }
    });

    // POST API for financial support
    app.post('/submit-support', async (req, res) => {
      const { amount, donor_name, donor_email, message, anonymous } = req.body;

      const sql = `
        INSERT INTO financial_supports (amount, donor_name, donor_email, message)
        VALUES (?, ?, ?, ?)
      `;

      try {
        await db.execute(sql, [amount, donor_name, donor_email, message]);
        res.json({ message: 'Thank you for your financial support!' });
      } catch (err) {
        console.error('Support insert error:', err);
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/featured-books', async (req, res) => {
      const sql = 'select * from books';

      try {
        const [results] = await db.query(sql);
        res.json(results);
      } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ error: 'Error in fetching books' });
      }
    });

    // Authentication Routes
    app.post('/api/auth/signup', async (req, res) => {
      try {
        const { student_id, first_name, last_name, email, phone, department, year, address, pass } = req.body;

        const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR student_id = ?';
        const [results] = await db.query(checkUserQuery, [email, student_id]);

        if (results.length > 0) {
          return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(pass, 10);

        const insertQuery = 'INSERT INTO users (student_id, first_name, last_name, email, phone, department, year, address, pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(insertQuery, [student_id, first_name, last_name, email, phone, department, year, address, hashedPassword]);

        res.status(201).json({
          message: 'User created successfully',
          userId: result.insertId
        });

      } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
        }

        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await db.query(query, [email]);

        if (results.length === 0) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = results[0];

        const isPasswordValid = await bcrypt.compare(password, user.pass);

        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

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
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/auth/logout', (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    });

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

    // Password Reset Routes
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    app.post('/api/forgot-password', async (req, res) => {
      const { email } = req.body;

      try {
        const [users] = await db.query(
          'SELECT student_id, email FROM users WHERE email = ?',
          [email]
        );

        if (users.length === 0) {
          return res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
        }

        const user = users[0];

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const expiresAt = new Date(Date.now() + 3600000);

        await db.query('DELETE FROM password_resets WHERE student_id = ?', [user.student_id]);

        await db.query(
          'INSERT INTO password_resets (student_id, token, expires_at) VALUES (?, ?, ?)',
          [user.student_id, hashedToken, expiresAt]
        );

        const resetUrl = `http://localhost:5000/reset-password?token=${resetToken}`;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Password Reset Request',
          html: `
            <h2>Password Reset Request</h2>
            <p>Hello Beautiful People,</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>Or copy and paste this link: ${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <h3>From - Mehedi <h3>
          `
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });

      } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing request' });
      }
    });

    app.post('/reset-password', async (req, res) => {
      const { token, newPassword } = req.body;

      try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const [resets] = await db.query(
          'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
          [hashedToken]
        );

        if (resets.length === 0) {
          return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const reset = resets[0];

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
          'UPDATE users SET pass = ? WHERE student_id = ?',
          [hashedPassword, reset.student_id]
        );

        await db.query('DELETE FROM password_resets WHERE id = ?', [reset.id]);

        res.json({ message: 'Password reset successful' });

      } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
      }
    });

    // Error Handling Middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on Railway at port ${PORT}`);
    });

  } catch (err) {
    console.error('Server initialization failed:', err);
    process.exit(1);
  }
})();