

# Experiment 5: Static Code Analysis (SAST) using SonarQube ⚙️

## 1. Aim
To perform **Static Code Analysis** using tools like **SonarQube** to identify insecure code patterns and prevent vulnerabilities in an application's source code.

---

## 2. Theory and Concept Elaboration

### What is Static Code Analysis (SAST)?
Static Code Analysis, also known as **Static Application Security Testing (SAST)**, is a security methodology that analyzes an application's **source code for vulnerabilities without executing it**. This is a "white-box" testing method because it requires access to the underlying source code.

### Why is SAST Important?
It helps developers **"shift left,"** which means finding and fixing security issues early in the development process. Catching a vulnerability during development is significantly cheaper and easier to fix than discovering it in a live production environment after a security breach.

### What is SonarQube?
SonarQube is a leading open-source platform for the continuous inspection of code quality and security. It automates code reviews by using static analysis to detect:
* Bugs.
* Code Smells (patterns that indicate deeper problems).
* Critical Security Vulnerabilities (e.g., SQL Injection).
* Security Hotspots (code that is security-sensitive and requires manual review).

### How SonarQube Works
The process involves two main components:
1.  **SonarScanner:** A command-line tool that analyzes the project's source code.
2.  **SonarQube Server:** A web server that receives the analysis report from the scanner, processes it, and displays the results on a detailed, interactive dashboard.

The typical workflow is:
1.  Developer pushes code.
2.  CI/CD triggers SonarScanner.
3.  Scanner sends the report to the SonarQube Server.
4.  Server displays results on a Dashboard.


---

## 3. Prerequisites and Tools
| Requirement | Description |
| :--- | :--- |
| **Tool 1** | **Docker** (to simplify the SonarQube Server setup). |
| **Tool 2** | **SonarScanner** command-line tool (downloaded and configured). |
| **Code** | A simple application file containing easily identifiable security vulnerabilities. |
| **Access** | Web Browser (to access the SonarQube dashboard at `http://localhost:9000`). |

### ❗ Detailed Setup Steps: Environment Configuration

1.  **Install Docker:** Ensure you have Docker installed and running on your system.
2.  **Start SonarQube Server:** Open your terminal and run this command:
    ```bash
    docker run --name sonarqube -p 9000:9000 -d sonarqube:community
    ```
3.  **Access Dashboard:** Once started, access the SonarQube dashboard in your browser at `http://localhost:9000`.
4.  **Log In:** Log in with the default credentials: **Username: `admin`**, **Password: `admin`**.
5.  **Download SonarScanner:** Download the SonarScanner command-line tool from the official SonarQube website and unzip it.

---

## 4. Disclaimers and Safety Precautions

1.  **Resource Usage:** SonarQube can be resource-intensive. Ensure your machine has sufficient resources before starting the Docker container.
2.  **Default Credentials:** Change the default `admin/admin` credentials immediately after the first login in a non-lab environment.
3.  **Project Structure:** Ensure the **`sonar-project.properties`** configuration file is placed in the **root directory** of the code you wish to scan.
4.  **Scanner Path:** Verify that the `sonar-scanner` command is accessible from your project directory's terminal (either via PATH or by executing it directly from its downloaded location).

---

## 5. Detailed Steps for Practical Execution

### Step 5.1: Prepare the Vulnerable Code
1.  Create a project folder named `my-vulnerable-project`.
2.  Inside this folder, create a Python file named **`insecure_app.py`**. This code includes common security vulnerabilities like hardcoded secrets, SQL injection, and command injection:

```python
import os
import sqlite3
from flask import Flask, request

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret-key-that-should-not-be-here'

def get_user_data(username):
    db = sqlite3.connect('users.db')
    cursor = db.cursor()
    # Vulnerability: SQL Injection (string concatenation)
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    return cursor.fetchone()

@app.route('/files')
def list_files():
    subfolder = request.args.get('subfolder')
    # Vulnerability: OS Command Injection
    command = 'ls -l ' + subfolder
    file_list = os.system(command)
    return str(file_list)


Step 5.2: Configure SonarScanner
In the root of the 

my-vulnerable-project folder, create a configuration file named sonar-project.properties.

Paste the following configuration into the file:




Properties

# Must be unique in a given SonarQube instance
sonar.projectKey=my-py-project
# Sources for analysis
sonar.sources=.
# Language of the project
sonar.language=py
# Encoding of the source code
sonar.sourceEncoding=UTF-8
Step 5.3: Run the Analysis
Open a terminal in your project's root directory.

Execute the 

sonar-scanner command:


Bash

sonar-scanner
The scanner will analyze the vulnerable code and send the results to the local SonarQube server.

Step 5.4: Review the Results on the Dashboard
Navigate to the SonarQube dashboard in your web browser (

http://localhost:9000).

Locate your newly created project and explore the 

"Issues" tab to see the detailed list of vulnerabilities SonarQube has detected.

Observe how the tool pinpoints issues like SQL Injection and hardcoded secrets.

7. Learning Outcome and Conclusion
Learning Outcome:
Upon completing this experiment, you will understand the principles of 

Static Application Security Testing (SAST) and its role in identifying vulnerabilities early in the development lifecycle. You will gain practical experience using a SAST tool like 

SonarQube to scan code, interpret security reports, and identify common insecure patterns like SQL injection or hardcoded secrets.

Conclusion:
This experiment successfully demonstrated the power and simplicity of using a SAST tool like 

SonarQube to automatically identify critical security vulnerabilities directly from source code. By scanning a deliberately insecure application, we saw how SonarQube pinpointed exact issues like SQL Injection and hardcoded secrets without ever running the program. Integrating static analysis into the development workflow provides developers with immediate, actionable feedback, allowing them to fix security flaws proactively and build more secure applications from the ground up.



