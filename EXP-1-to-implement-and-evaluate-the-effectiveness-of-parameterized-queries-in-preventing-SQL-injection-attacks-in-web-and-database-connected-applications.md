# Experiment 01: Evaluating the Effectiveness of Parameterized Queries


## 🎯 Aim
To demonstrate and evaluate the effectiveness of **parameterized queries** in preventing SQL injection attacks by testing a secure Python Flask application.


## 📖 Theory

### What is SQL Injection (SQLi)?
**SQL Injection** is a code injection technique used to attack data-driven applications. It occurs when an attacker inserts malicious SQL statements into an entry field for execution by the backend database. A successful SQLi attack can arise when an application fails to properly sanitize user-supplied input, typically by mixing SQL command logic with user data through string concatenation.

### How to Prevent SQLi: Parameterized Queries
The most effective way to prevent SQL injection is to use **parameterized queries**, also known as **prepared statements**.

This technique works by separating the SQL query's logic from the data being supplied. The SQL query is sent to the database server with placeholders (like `?`) for the parameters. Separately, the application sends the user-supplied values. The database engine then combines them, but with a crucial difference: it treats the user input **strictly as data**, not as part of the executable SQL command. This means any malicious SQL code provided by an attacker is simply treated as a literal text string, rendering the attack harmless.


---

## 🛠️ Requirements
* **Language/Framework:** Python 3.x with **Flask**.
* **Database:** SQLite (via Python's built-in `sqlite3` module).
* **IDE / Text Editor:** Visual Studio Code, PyCharm, or any other editor.
* **Web Browser:** Firefox, Chrome, etc.
* **Installation:** You'll need to install Flask if you haven't already:
    ```sh
    pip install Flask
    ```

---

## 📝 Procedure: Testing the Secure Application

This procedure involves setting up a secure Flask application and then running two tests: a valid login and an attempted SQL injection attack to confirm the defense is working.

1.  **Create the Project Structure:**
    Organize your files in a new folder as follows:
    ```
    /SECURE_SQL_LAB
    |-- app.py
    |-- /templates
        |-- login.html
    ```

2.  **Create the HTML Template (`login.html`):**
    Inside the `templates` folder, create the `login.html` file. This version includes accessibility and best-practice improvements.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <title>Safe SQL Lab - Login</title>
    </head>
    <body>
        <h2>Login</h2>
        <form method="POST">
            Username: <input type="text" name="username"><br>
            Password: <input type="password" name="password"><br>
            <input type="submit" value="Login">
        </form>
        <p style="color: red;">{{ message }}</p>
    </body>
    </html>
    ```

3.  **Create the Secure Flask App (`app.py`):**
    This code uses parameterized queries from the start, ensuring there is no vulnerability.

    ```python
    from flask import Flask, request, render_template
    import sqlite3
    import os

    app = Flask(__name__)
    DB_NAME = "users.db"

    
    def setup_database():
        if os.path.exists(DB_NAME):
            os.remove(DB_NAME)
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL
            )
        ''')

        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", ('admin', 'password123'))
        conn.commit()
        conn.close()
        print("Database initialized with a sample user.")

    @app.route('/', methods=['GET', 'POST'])
    def login():
        message = ""
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']
            
            conn = sqlite3.connect(DB_NAME)
            cursor = conn.cursor()
            
            query = "SELECT * FROM users WHERE username = ? AND password = ?"
            cursor.execute(query, (username, password))
            user = cursor.fetchone()
            
            if user:
                message = "Login Successful!"
            else:
                message = "Invalid credentials."
        
        return render_template('login.html', message=message)

    if __name__ == '__main__':
        setup_database()
        app.run(debug=True)
    ```

4.  **Run the Secure Application:**
    * Open your terminal in the `SECURE_SQL_LAB` directory.
    * Run the application with the command: `python app.py` (or `flask run` if you've set environment variables).

5.  **Evaluate the Effectiveness:**
    * Open your web browser and navigate to `http://127.0.0.1:5000`.

    * **Test Case 1: Legitimate Login**
        * **Username:** `admin`
        * **Password:** `password123`
        * Click **Login**.

    * **Test Case 2: Attempted SQL Injection**
        * **Username:** `' OR '1'='1' --`
        * **Password:** `any_fake_password`
        * Click **Login**.



## ✅ Expected Output
* **For the Legitimate Login:** The page should display the message **"Login Successful!"**. This confirms the application works as expected for valid users.
* **For the SQL Injection Attempt:** The page should display the message **"Invalid credentials."**. This proves the parameterized query is effective; it treated the malicious input as a literal string and did not find a matching user, successfully preventing the attack.
