import uuid
from flask import Flask, session, request, redirect, url_for, render_template_string

# --- APP SETUP ---
app = Flask(__name__)
# IMPORTANT: A secret key is required for session security in Flask.
app.secret_key = 'unsafe_secret_key_no_csrf_protection'

# --- MOCK DATA ---
# Mock Database for user data (in-memory simulation)
USER_SESSION_ID = str(uuid.uuid4())
USER_DATA = {
    USER_SESSION_ID: {
        'id': USER_SESSION_ID,
        'username': 'testuser',
        'email': 'original_vulnerable@example.com' # Email to be changed by the attack
    }
}

# --- ROUTES ---

@app.route('/', methods=['GET'])
def index_vulnerable():
    """Simple index to redirect unauthenticated users to login."""
    if 'user_id' in session:
        return redirect(url_for('profile_vulnerable'))
    return redirect(url_for('login_vulnerable'))


@app.route('/login', methods=['GET', 'POST'])
def login_vulnerable():
    """Handles login to set the session cookie."""
    if request.method == 'POST':
        # Mocking successful login by setting the user_id in the session
        session['user_id'] = USER_SESSION_ID
        print(f"[SERVER LOG] User logged in: {USER_SESSION_ID}")
        return redirect(url_for('profile_vulnerable'))
    
    # Simple login form HTML
    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Vulnerable Login</title>
        <style>body { font-family: sans-serif; padding: 20px; background-color: #ffe0e0;}</style>
    </head>
    <body>
        <h1>Vulnerable Application Login</h1>
        <p>Log in to establish a session cookie.</p>
        <form action="/login" method="post">
            <input type="text" name="username" value="testuser" readonly><br>
            <input type="password" name="password" value="password" readonly><br>
            <button type="submit">Log In</button>
        </form>
    </body>
    </html>
    """)


@app.route('/profile')
def profile_vulnerable():
    """Displays the current user profile state."""
    if 'user_id' not in session:
        return redirect(url_for('login_vulnerable'))
    
    user_data = USER_DATA.get(session['user_id'])
    
    # Display user profile and the vulnerable form for reference
    return render_template_string(f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Vulnerable Profile</title>
        <style>
            body {{ font-family: sans-serif; padding: 20px; background-color: #ffe0e0;}}
            h1 {{ color: #cc0000; }}
            #current-email {{ font-weight: bold; color: darkred; }}
            form {{ padding: 10px; border: 1px dashed red; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <h1>VULNERABLE APPLICATION</h1>
        <p>Logged in as: <b>{user_data['username']}</b></p>
        <p>Current Email: <span id="current-email">{user_data['email']}</span></p>
        <hr>
        
        <h2>Change Email Form (VULNERABLE)</h2>
        <form action="{url_for('change_email_vulnerable')}" method="post">
            <label for="email">New Email:</label>
            <input type="email" id="email" name="email" value="new_safe_email@test.com" required>
            <!-- NO CSRF TOKEN HERE -->
            <button type="submit">Update Email</button>
        </form>
    </body>
    </html>
    """)


@app.route('/change_email', methods=['POST'])
def change_email_vulnerable():
    """
    VULNERABLE ENDPOINT: This function relies ONLY on the session cookie to authorize the action.
    """
    if 'user_id' not in session:
        return "Error 401: Not authenticated.", 401
    
    # Vulnerable logic: No anti-CSRF token check is performed.
    new_email = request.form.get('email')
    
    if new_email:
        USER_DATA[session['user_id']]['email'] = new_email
        
        # Log the success of the request (whether legitimate or forged)
        print(f"\n[SERVER LOG] === !!! ATTACK SUCCESSFUL !!! ===")
        print(f"[SERVER LOG] Email changed to: {new_email}")
        print("[SERVER LOG] (Action succeeded because no CSRF token was required)")
        print("[SERVER LOG] =====================================\n")
        
        return redirect(url_for('profile_vulnerable'))
    
    return "Error: Missing email field.", 400

if __name__ == '__main__':
    # Running on localhost:5000, which is the target of attacker.html
    print("-------------------------------------------------------")
    print("Vulnerable App running at http://localhost:5000")
    print("-------------------------------------------------------")
    app.run(debug=False, port=5000)