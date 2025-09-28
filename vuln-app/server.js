// server-minimal-fix.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;
const db = new sqlite3.Database(":memory:");

// Middleware
app.use(express.static(path.join(__dirname))); // serve index.html + other pages
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // <-- important: handle JSON from fetch()
app.use(cookieParser());

// DB setup (same as you had)
db.serialize(() => {
  db.run(
    "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)"
  );
  db.run("CREATE TABLE guestbook (id INTEGER PRIMARY KEY, comment TEXT)");
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

// Login (vulnerable intentionally — same behaviour)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.get(sql, [], (err, row) => {
    if (row) {
      // Set the role cookie (as before)
      res.cookie("role", row.role, { maxAge: 900000, httpOnly: false });

      //  NEW: Also set a username cookie to identify the user for the CSRF attack
      res.cookie("username", row.username, { maxAge: 900000, httpOnly: false });

      res.send(
        `<h1>Login Successful!</h1><p>Welcome, ${row.username}. Your role is: ${row.role}</p><a href="/">Go Back</a>`
      );
    } else {
      res.send('<h1>Login Failed</h1><a href="/">Go Back</a>');
    }
  });
});

// User lookup (still vulnerable)
app.get("/user", (req, res) => {
  const userId = req.query.id;
  if (!userId)
    return res.send("<p>Please provide a user ID. Example: ?id=1</p>");
  const sql = `SELECT id, username, role FROM users WHERE id = ${userId}`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).send(`Database error: ${err.message}`);
    res.send(
      `<pre>${JSON.stringify(rows, null, 2)}</pre><a href="/">Go Back</a>`
    );
  });
});

app.get("/admin", (req, res) => {
  // Check the 'role' cookie from the user's browser
  if (req.cookies.role === "admin") {
    res.send(
      `<h1>Welcome to the Admin Panel!</h1>
       <p>You have successfully escalated your privileges.</p>
       <a href="/">Go Back</a>`
    );
  } else {
    res.status(403).send(
      `<h1>🚫 Access Denied</h1>
       <p>You do not have sufficient privileges to access this page. Your role is: '${
         req.cookies.role || "guest"
       }'</p>
       <a href="/">Go Back</a>`
    );
  }
});

// File inclusion (still intentionally vulnerable)
app.get("/page", (req, res) => {
  const filename = req.query.file;
  if (!filename)
    return res.send(
      "<p>Provide a file to include. Example: ?file=page1.txt</p>"
    );
  const filePath = path.join(__dirname, "pages", filename);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err)
      res
        .status(404)
        .send(
          `<h1>File not found</h1><p>${err.message}</p><a href="/">Go Back</a>`
        );
    else
      res.send(
        `<h1>Content of ${filename}</h1><div>${data}</div><a href="/">Go Back</a>`
      );
  });
});

// Ensure pages exist
if (!fs.existsSync("pages")) fs.mkdirSync("pages");
fs.writeFileSync("pages/page1.txt", "This is the content of page 1.");
fs.writeFileSync("pages/page2.txt", "This is the content of page 2.");

// Guestbook: note we now accept JSON body
app.post("/guestbook", (req, res) => {
  const { comment } = req.body;
  if (comment) {
    const sql = "INSERT INTO guestbook (comment) VALUES (?)";
    db.run(sql, comment, (err) => {
      res.redirect("/xss-stored.html"); // redirect to the stored XSS page
    });
  } else {
    res.redirect("/xss-stored.html");
  }
});

app.get("/guestbook/comments", (req, res) => {
  const sql = "SELECT comment FROM guestbook";
  db.all(sql, [], (err, rows) => {
    res.json(rows);
  });
});

app.post("/change-password", (req, res) => {
  const { newpassword } = req.body;
  const { username } = req.cookies; // Get the user from the new cookie

  // Check if the user is logged in (has a username cookie) and a new password was provided
  if (username && newpassword) {
    // IMPORTANT: Actually update the database
    // We use parameterized queries (?) to prevent SQL Injection, a crucial security practice!
    const sql = "UPDATE users SET password = ? WHERE username = ?";

    db.run(sql, [newpassword, username], (err) => {
      if (err) {
        return res
          .status(500)
          .send(`<h1>Database Error</h1><p>${err.message}</p>`);
      }
      // On success, send the confirmation message
      res.send(
        `<h1>Password Changed!</h1>
         <p>The password for user '<b>${username}</b>' is now '<b>${newpassword}</b>'.</p>
         <p>This request was made without your consent via CSRF!</p>
         <a href="/">Go Back</a>`
      );
    });
  } else {
    res
      .status(400)
      .send(
        '<h1>Error</h1><p>You must be logged in and provide a new password.</p><a href="/">Go Back</a>'
      );
  }
});

app.listen(port, () =>
  console.log(`Vulnerable server running on http://localhost:${port}`)
);
