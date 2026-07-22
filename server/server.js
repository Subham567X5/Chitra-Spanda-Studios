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

app.post('/api/update-profile', async (req, res) => {
  const { email, password, name, roleTitle } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    let query = "UPDATE users SET name = ?, roleTitle = ?";
    let params = [name, roleTitle];

    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      query += ", password = ?";
      params.push(hashedPassword);
    }
    
    query += " WHERE email = ?";
    params.push(email.toLowerCase());

    const stmt = db.prepare(query);
    stmt.run(...params, function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update profile.' });
      }
      res.json({ message: 'Profile updated successfully.' });
    });
    stmt.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating profile.' });
  }
});

// ==========================
// API Endpoints for Projects
// ==========================
app.get('/api/projects', (req, res) => {
  db.all("SELECT * FROM projects", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    res.json(rows);
  });
});

app.post('/api/projects', (req, res) => {
  const { id, name, description, status, budget, completion } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'Missing required fields' });

  const stmt = db.prepare("INSERT INTO projects (id, name, description, status, budget, completion) VALUES (?, ?, ?, ?, ?, ?)");
  stmt.run(id, name, description, status || 'Planning', budget || '$0', completion || 0, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create project' });
    }
    res.status(201).json({ message: 'Project created successfully' });
  });
  stmt.finalize();
});

// ==========================
// API Endpoints for Tasks
// ==========================
app.get('/api/tasks', (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(rows);
  });
});

app.post('/api/tasks', (req, res) => {
  const { id, name, description, assignedTo, status, priority, dueDate, projectName } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'Missing required fields' });

  const stmt = db.prepare("INSERT INTO tasks (id, name, description, assignedTo, status, priority, dueDate, projectName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run(id, name, description, assignedTo, status || 'To Do', priority || 'Medium', dueDate, projectName, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create task' });
    }
    res.status(201).json({ message: 'Task created successfully' });
  });
  stmt.finalize();
});

// ==========================
// API Endpoint for Simulated Advanced AI
// ==========================
app.post('/api/ai/chat', (req, res) => {
  const { message, role } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  let responseText = "I am processing your request. All studio systems are online.";
  const msgLower = message.toLowerCase();

  // Simulated Advanced AI Logic
  if (msgLower.includes('maya') || msgLower.includes('blender')) {
    responseText = "Initializing 3D software support module...\n\n```python\nimport maya.cmds as cmds\n# Quick script to center pivot and freeze transforms\nselection = cmds.ls(selection=True)\nfor obj in selection:\n    cmds.xform(obj, centerPivots=True)\n    cmds.makeIdentity(obj, apply=True, t=1, r=1, s=1, n=0)\n```\n\nScript executed. Your rig should now be optimized.";
  } else if (msgLower.includes('budget') || msgLower.includes('invoice')) {
    responseText = "Accessing Studio Finance ledgers...\n\nCurrent quarterly expenditure is well within the projected $150,000 budget constraint. Would you like me to generate a PDF breakdown?";
  } else if (msgLower.includes('render') || msgLower.includes('farm')) {
    responseText = "[SYSTEM ALERT] Render farm utilization is currently at 87%.\n\nI have automatically prioritized the 'DreamLink Alpha' sequence. ETA for completion is 2 hours 14 minutes.";
  } else {
    responseText = `Acknowledged. As a ${role || 'user'}, you have clearance for this operation. I have updated the studio logs. Is there anything else you need?`;
  }

  // Simulate "thinking" delay
  setTimeout(() => {
    res.json({ reply: responseText });
  }, 1200);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Secure Backend Server running on http://localhost:${PORT}`);
});
