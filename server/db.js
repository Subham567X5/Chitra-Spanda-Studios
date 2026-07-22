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

    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      status TEXT,
      budget TEXT,
      completion INTEGER
    )`, (err) => {
      if (err) console.error('Error creating projects table', err);
      else seedProjects();
    });

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      assignedTo TEXT,
      status TEXT,
      priority TEXT,
      dueDate TEXT,
      projectName TEXT
    )`, (err) => {
      if (err) console.error('Error creating tasks table', err);
      else seedTasks();
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

function seedProjects() {
  db.get("SELECT id FROM projects LIMIT 1", (err, row) => {
    if (!row) {
      const stmt = db.prepare("INSERT INTO projects (id, name, description, status, budget, completion) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run('PRJ-001', 'DreamLink Alpha', 'Flagship 3D game universe', 'Production', '$150,000', 45);
      stmt.run('PRJ-002', 'Neon City VFX', 'Sci-fi short film VFX', 'Pre-Production', '$45,000', 10);
      stmt.run('PRJ-003', 'Client Commercial', '30s 3D product animation', 'Planning', '$12,000', 0);
      stmt.finalize();
      console.log('Seed projects created successfully.');
    }
  });
}

function seedTasks() {
  db.get("SELECT id FROM tasks LIMIT 1", (err, row) => {
    if (!row) {
      const stmt = db.prepare("INSERT INTO tasks (id, name, description, assignedTo, status, priority, dueDate, projectName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      stmt.run('TSK-100', 'Model Main Character', 'Create high poly mesh for protagonist', 'animator@dreamavian.com', 'In Progress', 'High', '2026-08-15', 'DreamLink Alpha');
      stmt.run('TSK-101', 'Storyboard Scene 1', 'Draft panels for opening sequence', 'storyboard@dreamavian.com', 'To Do', 'Medium', '2026-08-01', 'Neon City VFX');
      stmt.run('TSK-102', 'Lighting Setup', 'HDRI environment lighting setup', 'animator@dreamavian.com', 'Backlog', 'Low', '2026-08-20', 'Client Commercial');
      stmt.finalize();
      console.log('Seed tasks created successfully.');
    }
  });
}

module.exports = db;
