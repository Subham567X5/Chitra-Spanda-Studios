const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'super_secret_dreamavian_jwt_key_2026';

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Securely compare the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Don't send the password hash back to the frontend
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  });
});

app.post('/api/register', async (req, res) => {
  const { email, password, name, role, roleTitle } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const stmt = db.prepare("INSERT INTO users (email, password, role, name, roleTitle) VALUES (?, ?, ?, ?, ?)");
    stmt.run(email.toLowerCase(), hashedPassword, role || 'client', name, roleTitle || 'Client', function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email already exists.' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Internal server error.' });
      }

      res.status(201).json({ message: 'User registered successfully.' });
    });
    stmt.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing registration.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Secure Backend Server running on http://localhost:${PORT}`);
});
