# Experiment 9: Securing File Uploads in a Web Application

---

## 🎯 Aim
To build and secure a file upload feature in a Python Flask application by implementing robust validation for file types and protecting against directory traversal attacks.

---

## 📖 Theory

### The Security Risks of File Uploads
File upload features are a double-edged sword. While essential for many modern web applications, they are a common and high-risk entry point for attackers if not properly secured. An insecure file upload mechanism can be exploited in several critical ways:

* **Remote Code Execution (RCE):** This is the most severe threat. An attacker could upload a malicious file, such as a web shell (e.g., a `.php`, `.py`, or `.jsp` file disguised as an image), and then execute it on the server. This would give them complete control over the server, allowing them to steal data, deface the website, or use the server to attack other systems.
* **Directory Traversal (Path Traversal):** This attack involves manipulating the filename to include `../` sequences. The goal is to navigate out of the intended upload directory and into other parts of the server's file system. A successful attack could allow an attacker to overwrite critical system files, configuration files (like `.htaccess`), or even application source code.
* **Denial of Service (DoS):** If there are no restrictions on file size, an attacker can upload extremely large files to exhaust the server's disk space, causing the application to crash or become unavailable to legitimate users.
* **Cross-Site Scripting (XSS):** An attacker might upload a seemingly harmless file like an SVG image that contains malicious JavaScript. When another user's browser renders this file, the script executes, potentially stealing their session cookies or other sensitive data.

### A Defense-in-Depth Strategy
To mitigate these risks, a multi-layered "defense-in-depth" strategy is essential. Relying on a single security check is not enough. A robust implementation should include:

1.  **File Type Validation:** Never trust the file extension alone. An attacker can easily rename `shell.php` to `image.jpg`. True validation involves:
    * **Extension Whitelisting:** Only allow a specific list of safe file extensions (e.g., `.png`, `.jpg`, `.pdf`). Deny everything else.
    * **MIME Type Verification:** Check the file's `Content-Type` header and, more securely, inspect the file's "magic numbers" (the first few bytes of the file) to verify its actual type.
2.  **Directory Traversal Protection:** All user-supplied input, especially filenames, must be rigorously sanitized. The `werkzeug` library in Flask provides a `secure_filename()` function that strips out directory traversal sequences (`../`), slashes, and other potentially malicious characters, rendering the filename safe.
3.  **Randomized Filenames:** Never save an uploaded file using its original user-supplied name. This prevents an attacker from guessing the URL of their uploaded shell to execute it and stops them from overwriting existing files. Always generate a random, unpredictable, and unique filename for the stored file.
4.  **File Size Limits:** Enforce a strict maximum file size to prevent DoS attacks aimed at filling up server storage.
5.  **Isolated Upload Directory:** Store uploaded files in a dedicated directory **outside** of the web root. Crucially, this directory must be configured so that the web server cannot execute files within it. For example, if a user uploads a `.php` file, the server should serve it as a plain text download, not execute it as a script.

---

## 🛠️ Tools & Requirements
* **Python 3:** The programming language for the application.
* **Flask:** A lightweight web framework for Python. Install it using pip: `pip install Flask`.
* **API Client:** A tool to send HTTP requests to the application. `curl` (a command-line tool) or Postman (a graphical application) can be used.

---

## 👣 Implementation

This section is divided into two parts: developing the secure Flask application and then testing its security features.

### Part 1: Application Development

1.  **Install Flask:** If you haven't already, open your terminal or command prompt and install Flask:
    ```bash
    pip install Flask
    ```

2.  **Create the Flask Application:** Create a new Python file named `secure_upload_app.py` and add the following code. The comments explain each security measure being implemented.

    ```python
    import os
    import uuid
    from flask import Flask, request, jsonify
    from werkzeug.utils import secure_filename

    # Initialize the Flask app
    app = Flask(__name__)

    # --- Configuration for Security ---

    # 1. Define the folder to store uploads
    UPLOAD_FOLDER = "uploads"

    # 2. Define a whitelist of allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

    # 3. Define the maximum allowed file size (e.g., 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024

    # Apply the configuration to the Flask app
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

    # Create the upload folder if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # --- Helper Function for File Validation ---

    def allowed_file(filename):
        """Checks if a filename has an allowed extension."""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    # --- The Main Upload Endpoint ---

    @app.route('/upload', methods=['POST'])
    def upload_file():
        # Check if the 'file' part is in the request
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['file']

        # Check if a file was actually selected
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # --- Security Checks ---

        # 4. Check if the file has an allowed extension and exists
        if file and allowed_file(file.filename):
            
            # 5. Sanitize the filename to prevent directory traversal
            # This removes any '..' or '/' characters.
            filename = secure_filename(file.filename)
            
            # Get the file extension
            file_ext = filename.rsplit('.', 1)[1].lower()
            
            # 6. Generate a random, unique filename to prevent overwrites and guessing
            random_filename = f"{uuid.uuid4().hex}.{file_ext}"
            
            # Construct the full file path
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], random_filename)
            
            # Save the file to the secure path
            file.save(file_path)
            
            return jsonify({
                "message": "File uploaded successfully",
                "filename": random_filename
            }), 201
        else:
            # If the file type is not allowed, return an error
            return jsonify({"error": "File type not allowed"}), 400

    # --- Run the Application ---

    if __name__ == '__main__':
        app.run(debug=True)
    ```

### Part 2: Testing the Security Features

Now, let's test the endpoint to ensure our security measures are working correctly.

1.  **Run the application:** Open your terminal in the same directory as your `secure_upload_app.py` file and run:
    ```bash
    python secure_upload_app.py
    ```
    The server will start, typically on `http://127.0.0.1:5000`.

2.  **Test Case 1: A Successful, Valid Upload**
    * Create a sample image file (e.g., `my_image.png`).
    * In a new terminal window, use `curl` to upload it:
    ```bash
    curl -X POST -F "file=@my_image.png" [http://127.0.0.1:5000/upload](http://127.0.0.1:5000/upload)
    ```

3.  **Test Case 2: An Invalid File Type**
    * Create an empty text file (e.g., `test.txt`).
    * Attempt to upload it. The server should reject it.
    ```bash
    curl -X POST -F "file=@test.txt" [http://127.0.0.1:5000/upload](http://127.0.0.1:5000/upload)
    ```

4.  **Test Case 3: A Directory Traversal Attack**
    * Attempt to upload a file with a malicious filename designed to escape the `uploads` directory.
    * The `secure_filename` function should neutralize this attack.
    ```bash
    # This command tries to save the file as '../../hacked.png'
    curl -X POST -F "file=@my_image.png;filename=../../hacked.png" [http://127.0.0.1:5000/upload](http://127.0.0.1:5000/upload)
    ```
    * Observe that the file is not saved in a parent directory but is safely sanitized, renamed, and saved within the `uploads` folder.

---

## 👀 Observations / Expected Output

**1. Successful File Upload:**
The server should respond with a JSON message indicating success and providing the new, randomized filename.

```json
{
  "filename": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6.png",
  "message": "File uploaded successfully"
}