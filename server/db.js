const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      name TEXT,
      roleTitle TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating users table', err);
      } else {
        seedInitialUser();
      }
    });
  }
});

function seedInitialUser() {
  db.get("SELECT email FROM users WHERE email = 'dreamavianstudios@gmail.com'", async (err, row) => {
    if (!row) {
      // Seed the initial Studio Owner user with secure hashed password
      const plainPassword = 'Dr3@mAv!an$2026#';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      const stmt = db.prepare("INSERT INTO users (email, password, role, name, roleTitle) VALUES (?, ?, ?, ?, ?)");
      stmt.run('dreamavianstudios@gmail.com', hashedPassword, 'studio_owner', 'Studio Owner', 'Studio Owner');
      stmt.finalize();
      
      console.log('Seed user created successfully.');
    }
  });
}

module.exports = db;
