const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const demoUsers = [
  { email: 'admin@chitraspanda.com', password: 'AdminPass321!', role: 'super_admin', name: 'Super Admin', roleTitle: 'Super Admin' },
  { email: 'director@chitraspanda.com', password: 'DirectorPass321!', role: 'director', name: 'Studio Director', roleTitle: 'Director' },
  { email: 'producer@chitraspanda.com', password: 'ProducerPass321!', role: 'producer', name: 'Lead Producer', roleTitle: 'Producer' },
  { email: 'pm@chitraspanda.com', password: 'PM_Pass321!', role: 'project_manager', name: 'Project Manager', roleTitle: 'Project Manager' },
  { email: 'teamlead@chitraspanda.com', password: 'LeadPass321!', role: 'team_lead', name: 'Team Lead', roleTitle: 'Team Lead' },
  { email: 'animator@chitraspanda.com', password: 'AnimatorPass321!', role: 'animator', name: 'Etta Asche (Animator)', roleTitle: 'Animator' },
  { email: 'designer@chitraspanda.com', password: 'DesignPass321!', role: 'designer', name: 'UI/UX Designer', roleTitle: 'Designer' },
  { email: 'hr@chitraspanda.com', password: 'HR_Pass321!', role: 'hr', name: 'HR Manager', roleTitle: 'HR' },
  { email: 'finance@chitraspanda.com', password: 'FinancePass321!', role: 'finance', name: 'Finance Head', roleTitle: 'Finance' },
  { email: 'student@chitraspanda.com', password: 'StudentPass321!', role: 'student', name: 'Academy Student', roleTitle: 'Student' },
  { email: 'client@chitraspanda.com', password: 'ClientPass321!', role: 'client', name: 'Studio Client', roleTitle: 'Client' },
];

async function seed() {
  for (const user of demoUsers) {
    db.get("SELECT email FROM users WHERE email = ?", [user.email], async (err, row) => {
      if (!row) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const stmt = db.prepare("INSERT INTO users (email, password, role, name, roleTitle) VALUES (?, ?, ?, ?, ?)");
        stmt.run(user.email, hashedPassword, user.role, user.name, user.roleTitle);
        stmt.finalize();
        console.log(`Seeded user: ${user.email}`);
      }
    });
  }
}

seed();
