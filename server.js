const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/about', express.static(path.join(__dirname, 'about')));
app.use('/book', express.static(path.join(__dirname, 'book')));
app.use('/donate', express.static(path.join(__dirname, 'donate')));
app.use('/authentication', express.static(path.join(__dirname, 'authentication')));
app.use('/checkout', express.static(path.join(__dirname, 'checkout')));

// Serve index.html at the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// app.get('/about', (req, res) => {
//   res.sendFile(path.join(__dirname, 'about', 'about.html'));
// });

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});