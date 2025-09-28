const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;
const db = new sqlite3.Database(":memory:"); // Use in-memory DB for simplicity

// Middleware to parse form data and cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Database Setup ---
// We set up a simple users and guestbook table.
db.serialize(() => {
  db.run(
    "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)"
  );
  db.run("CREATE TABLE guestbook (id INTEGER PRIMARY KEY, comment TEXT)");

  // Add some dummy data
  db.run(
    "INSERT INTO users (username, password, role) VALUES ('admin', 'password123', 'admin')"
  );
  db.run(
    "INSERT INTO users (username, password, role) VALUES ('user', 'password', 'user')"
  );
  db.run(
    "INSERT INTO guestbook (comment) VALUES ('Welcome to the guestbook!')"
  );
  db.run("INSERT INTO guestbook (comment) VALUES ('This is a test comment.')");
});

// --- Routes ---

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 1. Brute Force Vulnerability
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // VULNERABILITY: No rate limiting or account lockout.
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.get(sql, [], (err, row) => {
    if (row) {
      // 4. Cookie Manipulation Vulnerability
      // VULNERABILITY: Sets a predictable cookie. A user can change this cookie value in their browser from 'user' to 'admin'.
      res.cookie("role", row.role, { maxAge: 900000, httpOnly: false }); // httpOnly: false to make it readable by JS
      res.send(
        `<h1>Login Successful!</h1><p>Welcome, ${row.username}. Your role is: ${row.role}</p><a href="/">Go Back</a>`
      );
    } else {
      res.send('<h1>Login Failed</h1><a href="/">Go Back</a>');
    }
  });
});

// 2. SQL Injection Vulnerability
app.get("/user", (req, res) => {
  const userId = req.query.id;
  if (!userId) {
    return res.send("<p>Please provide a user ID. Example: ?id=1</p>");
  }
  // VULNERABILITY: The user input 'userId' is directly concatenated into the SQL query.
  // Try an ID like: 1' OR '1'='1
  const sql = `SELECT id, username, role FROM users WHERE id = ${userId}`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).send(`Database error: ${err.message}`);
    }
    res.send(
      `<pre>${JSON.stringify(rows, null, 2)}</pre><a href="/">Go Back</a>`
    );
  });
});

// 3. File Inclusion Vulnerability
app.get("/page", (req, res) => {
  const filename = req.query.file;
  if (!filename) {
    return res.send(
      "<p>Provide a file to include. Example: ?file=page1.txt</p>"
    );
  }
  // VULNERABILITY: User can control the file path.
  // Try to access sensitive files like: ../../package.json
  const filePath = path.join(__dirname, "pages", filename);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res
        .status(404)
        .send(
          `<h1>File not found</h1><p>${err.message}</p><a href="/">Go Back</a>`
        );
    } else {
      res.send(
        `<h1>Content of ${filename}</h1><div>${data}</div><a href="/">Go Back</a>`
      );
    }
  });
});

// Create a dummy file for the File Inclusion challenge
if (!fs.existsSync("pages")) {
  fs.mkdirSync("pages");
}
fs.writeFileSync("pages/page1.txt", "This is the content of page 1.");
fs.writeFileSync("pages/page2.txt", "This is the content of page 2.");

// 5. Stored XSS Vulnerability
app.post("/guestbook", (req, res) => {
  const { comment } = req.body;
  if (comment) {
    // VULNERABILITY: Comment is inserted into the database without any sanitization.
    const sql = "INSERT INTO guestbook (comment) VALUES (?)";
    db.run(sql, comment, (err) => {
      res.redirect("/#xss-stored");
    });
  } else {
    res.redirect("/#xss-stored");
  }
});

app.get("/guestbook/comments", (req, res) => {
  const sql = "SELECT comment FROM guestbook";
  db.all(sql, [], (err, rows) => {
    // VULNERABILITY: Comments are sent to the client without sanitization.
    res.json(rows);
  });
});

// 6. CSRF Vulnerability
app.get("/change-password", (req, res) => {
  const { newpassword } = req.query;
  // VULNERABILITY: No CSRF token. Changes state with a simple GET request.
  // An attacker could trick a logged-in user into visiting a URL like:
  // http://localhost:3000/change-password?newpassword=hacked
  // to change their password without their knowledge.
  if (req.cookies.role && newpassword) {
    // For simplicity, we just show a message. A real app would update the DB.
    res.send(
      `<h1>Password Changed!</h1><p>Your new password is now '${newpassword}'</p><a href="/">Go Back</a>`
    );
  } else {
    res
      .status(400)
      .send(
        '<h1>Error</h1><p>You must be logged in and provide a new password.</p><a href="/">Go Back</a>'
      );
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Vulnerable server running on http://localhost:3000`);
});
