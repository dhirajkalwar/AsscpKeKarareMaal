# Experiment 4: Secure Password Storage using Slow Hashing (bcrypt) 🔐

## 1. Aim
To implement a **secure password storage and verification system** using a modern, slow, and cryptographically secure hashing algorithm, specifically **bcrypt**, in the Python programming language.

---

## 2. Theory and Concept Elaboration

### The Critical Flaw: Storing Plain-Text Passwords
Storing user passwords as **plain text is extremely dangerous**. If a single database breach occurs, every user's password would be exposed. The correct approach involves using a **one-way cryptographic hash function** with specific properties.

### What is Hashing?
**Hashing** is a process that converts an input of any size (like a password) into a fixed-size string of characters, known as a **hash**. This process is **one-way**, meaning it's computationally infeasible to reverse the process and get the original password from its hash. However, simple fast hashes like SHA-256 are not sufficient for passwords because attackers can use pre-computed lists of hashes (called **rainbow tables**) to find matches quickly.

### Defense 1: The Importance of Salting
To defeat rainbow table attacks, we use a **salt**.
* A salt is a unique, random string of data that is generated for each user and added to their password before it gets hashed.
* This salted password is then hashed and stored.
* Since every user has a different salt, two users with the same password will have completely different hashes, making pre-computation attacks useless.
* The salt is stored alongside the hash in the database.

### Defense 2: Slow Hashes (The "Work Factor")
Modern password security relies on algorithms that are **deliberately slow**. Attackers try to guess passwords by hashing billions of possibilities per second (a brute-force attack).

Algorithms like **bcrypt** or **PBKDF2** (Password-Based Key Derivation Function 2) introduce a **"work factor"** or **"cost"**. This factor makes the hashing process take a significant amount of time (e.g., 100 milliseconds), making brute-force attacks prohibitively expensive and slow for an attacker.

**Bcrypt** is often preferred for password storage because it has built-in salt generation and is designed to be resistant to hardware acceleration attacks (e.g., using GPUs).


---

## 3. Prerequisites and Tools
| Requirement | Description |
| :--- | :--- |
| **Programming Language** | Python 3.x |
| **Library** | The `bcrypt` Python library. |
| **Tool** | Terminal or Command Prompt for execution. |

### ❗ Detailed Setup Steps

1.  **Install Python:** Ensure Python 3 is installed on your system.
2.  **Install `bcrypt`:** Open your terminal or command prompt and install the `bcrypt` library:
    ```bash
    pip install bcrypt
    ```
3.  **Code Editor:** Save the code (Section 6) as `secure_storage.py` and run it from your terminal.

---

## 4. Disclaimers and Safety Precautions

1.  **Dependencies:** Ensure the `bcrypt` library is installed correctly before attempting to run the code.
2.  **Encoding:** The `bcrypt` library requires passwords to be handled as **byte strings** (using `.encode('utf-8')`) both during registration and login. Failure to encode will result in errors.
3.  **Cost Factor:** In production applications, the work factor (cost) used by `bcrypt.gensalt()` should be reviewed and potentially increased over time as computing power improves to maintain the target delay (e.g., 100ms).
4.  **No Custom Hashing:** For any real-world application, **never** implement your own hashing or salting logic; always rely on well-maintained, peer-reviewed libraries like `bcrypt`.

---

## 5. Detailed Steps and Implementation

This experiment creates a secure password storage and verification system using the `bcrypt` library in Python.

### Step 5.1: Set Up the Environment
1.  Ensure you have Python installed and install the `bcrypt` library using `pip`.
2.  Save the code from Section 6 as `secure_storage.py`.

### Step 5.2: Implement User Registration Logic
This step is implemented by the `register_user` function.
1.  Accept a plain-text password and **generate a salt** using `bcrypt`.
2.  **Hash the password** with the salt.
3.  Store the resulting full hash (which includes the salt and cost factor) in the simulated database.

### Step 5.3: Implement User Login Logic
This step is implemented by the `login_user` function.
1.  Accept a plain-text password from a login attempt.
2.  Retrieve the user's stored hash from the database.
3.  Use **`bcrypt`'s built-in `checkpw` function** to securely compare the input password against the stored hash.

### Step 5.4: Demonstrate and Verify the System
1.  Run the `secure_storage.py` file from the terminal.
2.  **Test 1: Registration.** Register a new user and password.
3.  **Test 2: Correct Login.** Attempt to log in with the correct password to see a successful verification.
4.  **Test 3: Incorrect Login.** Attempt to log in with an incorrect password to confirm that the login fails.

---

## 6. Complete Python Code (Without Comments)

```python
import bcrypt
import getpass

user_database = {}

def register_user():
    username = input("Enter a username to register: ")
    if username in user_database:
        print("❌ Username already exists. Please choose another.")
        return

    password = getpass.getpass("Enter a password: ")
    
    password_bytes = password.encode('utf-8')

    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    
    user_database[username] = hashed_password
    
    print(f"✅ User {username} registered successfully!")
    print(f"   Stored Hash: {hashed_password.decode()}")

def login_user():
    username = input("Enter your username to log in: ")
    if username not in user_database:
        print("❌ Login failed: User not found.")
        return

    password = getpass.getpass("Enter your password: ")
    
    password_bytes = password.encode('utf-8')
    
    stored_hash = user_database[username]

    if bcrypt.checkpw(password_bytes, stored_hash):
        print("✅ Login successful! Welcome.")
    else:
        print("❌ Login failed: Incorrect password.")

if __name__ == '__main__':
    print("--- Secure Password Storage Demo ---")
    
    register_user()
    
    print("\n--- Now, let's try to log in ---")
    login_user()

    print("\n--- Let's try to log in again with the wrong password ---")
    login_user()


    7. Learning Outcome and Conclusion
Learning Outcome:
Upon completing this experiment, you will understand why storing 

plain-text passwords is a critical security flaw and the importance of using salted hashing. You will be able to implement a secure user registration and login system using a modern, 

slow hashing algorithm like bcrypt to protect user credentials.

Conclusion:
This experiment demonstrates that the only secure way to store passwords is to 

never store them at all, but rather to store a strong, salted, and slow hash. By using a library like 

bcrypt, user credentials are protected even if the database is compromised, as reversing the hash to find the original password is computationally infeasible. The process of 

salting defeats pre-computed rainbow tables, and the slowness of the algorithm makes brute-force attacks impractical, providing a robust defense for modern applications.