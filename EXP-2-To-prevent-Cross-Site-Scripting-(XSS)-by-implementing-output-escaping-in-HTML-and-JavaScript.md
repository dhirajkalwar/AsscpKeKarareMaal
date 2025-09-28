# Experiment No. 2: Preventing Cross-Site Scripting (XSS)

## Aim

To prevent **Cross-Site Scripting (XSS)** by implementing **output escaping** (or encoding) in HTML and JavaScript to sanitize user-provided data.

## Learning Objective

To understand and demonstrate how **output escaping** mitigates XSS vulnerabilities in web applications by ensuring that user input is treated as data, not as executable code.

-----

## Theory: Understanding Cross-Site Scripting (XSS) and Output Escaping

### What is Cross-Site Scripting (XSS)?

Cross-Site Scripting (XSS) is a security vulnerability where an attacker injects malicious scripts into content from otherwise trusted websites. This typically happens when a web application takes untrusted user input (such as comments, forum posts, or profile names) and renders it directly onto a page without proper validation or sanitation.

These malicious scripts execute in the victim's browser and can be used to:

1.  **Session Hijacking:** Steal session tokens (cookies), allowing the attacker to impersonate the victim.
2.  **Data Theft:** Capture user input, passwords, or other sensitive information via keylogging or form manipulation.
3.  **Malware Delivery:** Redirect users to malicious sites or initiate unwanted actions on their behalf.

XSS attacks are generally categorized into three types:

  * **Stored XSS:** The malicious script is permanently stored on the target server (e.g., in a database) and is served to every user who accesses the content.
  * **Reflected XSS:** The malicious script is "reflected" off a web application, usually in an error message or search result, after being sent in a URL parameter.
  * **DOM-based XSS:** The vulnerability exists entirely in client-side code (JavaScript) that handles user data, meaning the server never processes the script.

### The Primary Defense: Output Escaping (Encoding)

The primary defense against XSS is **output escaping** (also known as encoding). Output escaping is the process of converting special characters in user-provided data into their non-executable, safe entity equivalents. This ensures the browser interprets the data as plain text to be displayed, rather than as executable code.

**Why it works:** When a character like `<` is escaped to `&lt;`, the browser sees `&lt;` and displays `<`. It *does not* interpret it as the start of a new HTML tag.

### Key Characters and Their HTML Entities

The following characters must be escaped when placing untrusted input into the HTML body:

| Special Character | HTML Entity Equivalent | Description |
| :--- | :--- | :--- |
| `<` (Less Than) | `&lt;` | Prevents the start of a new HTML tag (e.g., `<script>`). |
| `>` (Greater Than) | `&gt;` | Prevents the end of a new HTML tag. |
| `&` (Ampersand) | `&amp;` | Prevents the start of a new HTML entity (must be encoded first). |
| `"` (Double Quote) | `&quot;` | Essential for escaping input within HTML attribute values. |
| `'` (Single Quote) | `&#039;` | Essential for escaping input within single-quoted attribute values. |

### Contexts for Escaping

A proper defense strategy requires context-specific encoding:

1.  **Escaping in HTML Body (Text Content):** When placing user input inside an element like a `<div>`, `<p>`, or `<td>`. In JavaScript, using the `.textContent` property is the safest and simplest way to handle this context, as it automatically encodes the input.
2.  **Escaping in HTML Attributes (Data Attributes):** When placing user input inside an attribute like `value=""`, `href=""`, or `src=""`. This context requires specialized encoding (usually including quotes) to prevent the attacker from "breaking out" of the attribute value.
3.  **Escaping in JavaScript Data:** When inserting user data into JavaScript code, especially within strings that are later assigned to the DOM. This context requires JSON encoding to neutralize quotes and backslashes, ensuring the input cannot prematurely terminate the JavaScript string.

-----

## Procedure / Implementation

This experiment has two parts: first, demonstrating the XSS vulnerability using an unsafe method, and second, applying the fix using output escaping via a secure method.

### Disclaimers and Preparation

  * **Environment:** Use a simple text editor and a web browser (Chrome, Firefox, Edge).
  * **Security:** These files are for educational purposes only. Do not perform these attacks on live or external websites.
  * **Functionality:** We use the `alert()` function as a harmless proof-of-concept (PoC) payload to confirm script execution. In a real attack, this would be replaced with malicious code.

### Part 1: Demonstrating XSS Vulnerability (`vulnerable.html`)

We will use the **`.innerHTML`** property, which is insecure because it parses the input string as HTML, allowing the execution of injected script tags or event handlers.

**Steps:**

1.  Create a new HTML file named `vulnerable.html`.
2.  Add the following code. The malicious payload is an `<img>` tag with a non-existent source (`src=x`). When the image fails to load, the JavaScript inside the `onerror` event handler executes.

<!-- end list -->

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vulnerable Page</title>
</head>
<body>
    <h1>User Comment Section (Vulnerable)</h1>
    <div id="comment-output" style="border: 2px solid red; padding: 10px;"></div>
    
    <script>
        // Malicious input simulating an attacker's comment
        const userInput = '<img src="x" onerror="alert(\'XSS Attack!\')">';
     document.getElementById('comment-output').innerHTML = userInput;
    </script>
</body>
</html>
```

3.  **Observation:** Open `vulnerable.html` in your web browser. You will see an **alert box** pop up with the message "XSS Attack\!". This confirms the malicious code was executed.

### Part 2: Preventing XSS with Output Escaping (`secure.html`)

We will fix the vulnerability by using the safe property, **`.textContent`**, which automatically handles the necessary output escaping for HTML content.

**Steps:**

1.  Create a new HTML file named `secure.html`.
2.  Add the following code. The only change from Part 1 is replacing `.innerHTML` with **`.textContent`**.

<!-- end list -->

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Page</title>
</head>
<body>
    <h1>User Comment Section (Secure)</h1>
    <div id="comment-output" style="border: 2px solid green; padding: 10px;"></div>
    
    <script>
        // Malicious input remains the same
        const userInput = '<img src=x onerror=alert("XSS Attack!")>';
        
        // SECURE: Using textContent treats the input as plain text, escaping < and >.
        // The output displayed will be the literal string, not the executable tag.
        document.getElementById('comment-output').textContent = userInput;
    </script>
</body>
</html>
```

3.  **Observation:** Open `secure.html` in a web browser. **No alert box will appear.** Instead, the malicious string `<img src=x onerror=alert("XSS Attack!")>` will be safely displayed as harmless text inside the output box, confirming the input was treated as data and not as code.

-----

## Learning Outcome

Successfully performed an experiment to demonstrate how untrusted user input can cause a Cross-Site Scripting (XSS) vulnerability when rendered using an unsafe method (`.innerHTML`). We then successfully prevented the XSS attack by implementing output escaping using the secure `.textContent` property, which correctly treats user input as harmless text data.

## Conclusion

This experiment confirms that output escaping is a fundamental and critical security practice for developing secure web applications. By treating all user input as untrusted data and encoding it appropriately for the output context (in this case, the HTML body), we can effectively mitigate the risk of Cross-Site Scripting attacks. **Never trust user input and always escape output** are the key principles for preventing XSS.

