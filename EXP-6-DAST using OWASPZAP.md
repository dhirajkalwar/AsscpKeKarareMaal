# Experiment 6: Dynamic Application Security Testing (DAST) with OWASP ZAP

---

## 🎯 Aim
[cite_start]To conduct Dynamic Application Security Testing (DAST) using the OWASP Zed Attack Proxy (ZAP) for automated vulnerability scanning on a web application. [cite: 9]

---

## 📖 Theory

### What is DAST?
[cite_start]**Dynamic Application Security Testing (DAST)** is a "black-box" security testing method used to find vulnerabilities in a running web application. [cite: 16] [cite_start]The term "black-box" means the test is performed from the outside, without any prior knowledge of the internal workings, source code, or architecture of the application. [cite: 17] [cite_start]This approach simulates how a real-world attacker would probe the application for weaknesses. [cite: 18]

[cite_start]Unlike Static Application Security Testing (SAST), which analyzes the application's source code at rest, DAST interacts with the live application, sending various payloads and observing the responses to identify security flaws. [cite: 17]

### Common Vulnerabilities Detected by DAST
DAST tools are excellent at finding a wide range of runtime vulnerabilities, including:
* [cite_start]**SQL Injection (SQLi)** [cite: 19]
* [cite_start]**Cross-Site Scripting (XSS)** [cite: 20]
* [cite_start]**Cross-Site Request Forgery (CSRF)** [cite: 21]
* **Broken Authentication & Session Management** [cite: 22]
* [cite_start]**Security Misconfigurations** [cite: 23]
* [cite_start]**Sensitive Data Exposure** [cite: 24]

### OWASP ZAP (Zed Attack Proxy)
[cite_start]**OWASP ZAP** is one of the world's most popular and powerful open-source tools for DAST. [cite: 25] [cite_start]It works as a **man-in-the-middle proxy**, which means it sits between your web browser and the target web application. [cite: 26] [cite_start]This position allows ZAP to intercept, inspect, and modify all the traffic (requests and responses) passing between them. [cite: 27] [cite_start]By doing this, ZAP can automatically launch a battery of known attack techniques to discover and report security weaknesses. [cite: 27]

---

## 🛠️ Tools & Requirements
* **OWASP ZAP:** An open-source web application security scanner. [cite_start]You can download it from the [official website](https://www.zaproxy.org/download/). [cite: 11, 40]
* **Target Web Application:** A test application running on your local machine.
    * **Recommended:** DVWA (Damn Vulnerable Web Application) or OWASP Juice Shop.
* **Web Browser:** Firefox, Chrome, or any modern browser.
* **Local Server Environment:** XAMPP, WAMP, or Docker to host the target application.

---

## ⚠️ Important Disclaimer
This experiment is for **educational purposes only**. [cite_start]You must only perform security scanning on web applications that you **own** or have **explicit, written permission** to test. [cite: 13] Conducting these tests on live websites or systems without authorization is illegal and unethical.

---

## 👣 Procedure

[cite_start]This procedure will guide you through performing a basic automated vulnerability scan using OWASP ZAP. [cite: 37]

### 1. Installation and Setup
1.  [cite_start]**Install ZAP:** Download and install the appropriate version of OWASP ZAP for your operating system. [cite: 39]
2.  [cite_start]**Run Target Application:** Ensure your target web application (e.g., DVWA) is running and accessible in your browser (e.g., `http://localhost/dvwa/login.php`). [cite: 41]
3.  **Launch ZAP:** Open OWASP ZAP. You may be asked about session persistence; for this basic scan, you can choose not to persist the session.

### 2. Performing an Automated Scan
[cite_start]This is the quickest way to get started with ZAP. [cite: 42]
1.  In the main ZAP window, you will see a **Quick Start** tab.
2.  [cite_start]Locate the **Automated Scan** section. [cite: 44]
3.  [cite_start]In the **URL to attack** field, enter the full URL of your target application (e.g., `http://localhost/dvwa`). [cite: 45, 46]
4.  [cite_start]Click the **Attack** button to begin the scan. [cite: 47]
5.  **Observe the Process:** ZAP will now perform two main phases:
    * [cite_start]**Spidering:** It first crawls (or "spiders") the website to discover all pages, links, and forms. [cite: 48] You can monitor its progress in the "Spider" tab at the bottom.
    * [cite_start]**Active Scan:** After discovery, it launches an "active scan" to attack all the discovered pages, parameters, and inputs to find vulnerabilities. [cite: 49]

### 3. Analyzing the Results
1.  [cite_start]Once the scan is complete, look at the bottom-left pane and click on the **Alerts** tab. [cite: 51]
2.  [cite_start]Here, you will find a tree-view of all potential vulnerabilities discovered, categorized by risk level: **High, Medium, Low, and Informational**. [cite: 52]
3.  [cite_start]Click on any alert to view detailed information in the right-hand panel. [cite: 53] This panel will show:
    * A full **description** of the vulnerability and its potential impact.
    * The exact **URL and parameter** that is vulnerable.
    * A recommended **solution** to fix the issue.

### 4. Generating a Report
[cite_start]A formal report is essential for documenting your findings. [cite: 54]
1.  [cite_start]From the top menu bar, navigate to **Report > Generate Report...**. [cite: 55]
2.  A dialog box will appear. You can customize the title and add your name.
3.  Choose a template (the **HTML Report** is comprehensive and easy to read).
4.  [cite_start]Select a location to save the file and click **Generate**. [cite: 56]
5.  [cite_start]Open the saved HTML file in your browser to view a professional, detailed security report of all the findings. [cite: 65]

---

## 👀 Observations / Expected Output
During the scan, the ZAP interface will be actively populated. The **History** tab will show all the requests being made, while the **Active Scan** tab shows the progress of different attack vectors.

After the scan, the **Alerts** tab will display a list of issues. For a vulnerable application like DVWA, you should expect to see several alerts, such as:
* **High Risk:** SQL Injection, Cross-Site Scripting (Stored and Reflected).
* [cite_start]**Medium Risk:** X-Frame-Options Header Not Set, Cross-Domain Misconfiguration. [cite: 127]
* **Low Risk:** Absence of Anti-CSRF Tokens, Password Autocomplete.

[cite_start]The final HTML report will summarize all these alerts with detailed descriptions, evidence, and remediation advice, making it easy to understand and act upon the security posture of the application. [cite: 111]

---

## ✅ Conclusion
[cite_start]This experiment provided hands-on experience with Dynamic Application Security Testing (DAST) using the industry-standard OWASP ZAP tool. [cite: 142] [cite_start]By executing an automated scan, we successfully identified multiple security vulnerabilities in a running web application, analyzed the detailed alerts, and generated a professional security report. [cite: 143] [cite_start]This practical exercise highlights the critical role of DAST in a comprehensive security strategy, demonstrating its effectiveness in simulating real-world attacks to uncover critical flaws that static code analysis alone cannot find. [cite: 144]