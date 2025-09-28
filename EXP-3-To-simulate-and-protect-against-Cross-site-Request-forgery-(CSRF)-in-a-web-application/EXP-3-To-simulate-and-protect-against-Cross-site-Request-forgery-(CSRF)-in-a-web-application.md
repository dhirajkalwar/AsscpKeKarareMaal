## Experiment No. 3: Simulating and Protecting Against Cross-Site Request Forgery (CSRF)

-----

## Aim

To simulate and protect against **Cross-Site Request Forgery (CSRF)** in a web application.

## Learning Objective

To understand the mechanics of a CSRF attack, simulate an unauthorized, state-changing action (like changing a user's email), and implement the **Synchronizer Token Pattern** to defend the application.

-----

## Theory: Cross-Site Request Forgery (CSRF)

### What is Cross-Site Request Forgery (CSRF)?

Cross-Site Request Forgery (CSRF), often called "session riding" or a "one-click attack," is a type of vulnerability that tricks an authenticated user's browser into submitting an unintended and malicious request to a web application they trust.

The attack exploits the trust a web application places in the user's browser. When the user's browser sends the forged request to the vulnerable application, it automatically includes all relevant credentials—such as the session cookie. Since the request appears to originate from an authenticated user, the application processes the state-changing action (e.g., money transfer, password change) as legitimate.

### How a CSRF Attack Works

The attack requires three main conditions:

1.  **Vulnerability:** The target application relies solely on session cookies for authentication and performs sensitive actions using standard HTTP methods (like `GET` or `POST`) without checking for secondary proof of user intent.
2.  **Authentication:** The victim must be logged into the target application (e.g., their bank or social media site) in their browser.
3.  **Lure:** The attacker must lure the victim to a malicious, third-party website while their session with the target application is active.

**Typical Attack Flow:**

1.  **User Logs In:** The user logs into `trusted-app.com`. The server sets a session cookie.
2.  **User Visits Evil Site:** The user, while authenticated, visits the attacker's site, `evil-site.com`.
3.  **Forged Request:** `evil-site.com` contains a hidden element (like a zero-pixel image, a hidden form, or a forced script execution) that automatically triggers an HTTP request targeting the vulnerable endpoint on `trusted-app.com`.
4.  **Browser Includes Cookies:** The browser, following its standard protocol, automatically attaches the session cookie for `trusted-app.com` to the forged request.
5.  **Successful Attack:** `trusted-app.com` receives the request, sees the valid cookie, and executes the malicious action (e.g., changing the email address) without the user's knowledge.

### The Defense: Anti-CSRF Tokens (Synchronizer Token Pattern)

The most common and effective defense against CSRF is the **Synchronizer Token Pattern**  using anti-CSRF tokens.

**Mechanism:**

1.  **Token Generation:** When the server serves a form for a sensitive action, it generates a unique, cryptographically random, and secret value—the anti-CSRF token.
2.  **Token Embedding:** This token is embedded in two places:
      * As a hidden field within the HTML form (`<input type="hidden" name="csrf_token" value="[token]">`).
      * Stored securely in the user's session data on the server.
3.  **Token Validation:** When the form is submitted:
      * The user's browser sends the token from the hidden field along with the request.
      * The server compares the submitted token with the token stored in the user's session.
4.  **Security Decision:**
      * **Match:** The request is legitimate and processed.
      * **Mismatch/Missing:** The request is rejected (e.g., with a **403 Forbidden** status) as it is likely a forged request.

Since the attacker's site operates under a different origin (due to the **Same-Origin Policy**), it cannot read the original application's HTML source to steal the unique, secret token, making the forged request fail the validation check.

-----

## Procedure / Implementation

This experiment requires setting up a simple client-server environment to simulate the interaction between a vulnerable application and an attacker's site. We will use a conceptual procedure, as a full Python/Flask environment cannot be executed directly here.

### Disclaimers and Preparation

  * **Conceptual Steps:** The following steps assume you are running a local development environment (e.g., Python/Flask, Node/Express, etc.) capable of handling sessions and cookies.
  * **Localhost Simulation:** The "vulnerable" and "protected" applications should run on the same server/port (`localhost:5000`), while the "attacker's site" will be a standalone HTML file opened in the browser.

### Part 1: Simulating the CSRF Attack (Vulnerability)

**1. Set Up the Vulnerable Application (Conceptual `vulnerable_app.py`)**
This conceptual application simulates a user logged in with a session cookie and an endpoint that changes the user's email via a simple `POST` request, with **no token validation**.


**2. Create the Attacker's Webpage (`attacker.html`)**
This HTML file simulates the malicious site. It contains a hidden form targeting the vulnerable application's change-email endpoint and uses JavaScript to automatically submit the form when the page loads.


**3. Execute the Attack and Verify**

  * **Step A (Authentication):** Start the vulnerable server (`vulnerable_app.py`). Open a browser tab and **log into** the vulnerable application `/login` (establish a session/cookie).
  * **Step B (The Lure):** Open a **new tab** and load the local `attacker.html` file. The form will submit immediately.
  * **Step C (Verification):** Return to the server's terminal or log output. You will see the message: `ATTACK SUCCESSFUL: Email changed to attacker@evil.com`. This confirms the CSRF attack successfully hijacked the authenticated session.

### Part 2: Implementing CSRF Protection (Defense)

We now modify the server application to use the Synchronizer Token Pattern.

**1. Implement CSRF Protection (Conceptual `protected_app.py`)**
The server must now generate a token, include it in the form, and validate it on submission.




**2. Modify the Attacker's Webpage (`attacker.html`)**
The attacker's page is not changed, as they have no way to obtain the secret token to include it in the hidden form.



**3. Verify the Protection**

  * **Step A (Authentication):** Start the **protected** server (`protected_app.py`). Open a browser tab and **log into** the protected application `/login` (establish a session/cookie). This step generates the correct token on the server.
  * **Step B (The Lure):** Open a **new tab** and load the local `attacker.html` file. The form submits automatically, but it *fails* to include the required `csrf_token`.
  * **Step C (Verification):** Return to the server's terminal or log output. You will see the message: `ATTACK FAILED: CSRF Token mismatch or missing.` The server successfully rejected the request, confirming the defense is working.

-----

## Learning Outcome

Upon completing this experiment, you will understand how Cross-Site Request Forgery (CSRF) attacks exploit browser trust to perform unauthorized actions on behalf of a user. You will also be able to implement the **Synchronizer Token Pattern** using anti-CSRF tokens to effectively defend a web application against this common vulnerability.

## Conclusion

This experiment proves that CSRF is a significant threat, capable of hijacking a user's authenticated session to perform unwanted, state-changing actions. The simulation confirmed that an application relying only on session cookies is vulnerable. The most effective defense is the use of **anti-CSRF tokens**, which act as a unique, secret, and unguessable password for each form submission. Because an attacker's site cannot obtain this secret token (due to the Same-Origin Policy), the protected application can easily distinguish a legitimate request from a forged one and block the attack, demonstrating that this token-based defense is essential for web security.

-----

