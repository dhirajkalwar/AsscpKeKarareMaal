import uuid
import random
import string
from flask import Flask, session, request, redirect, url_for, render_template_string

# --- APP SETUP ---
app = Flask(__name__)
# IMPORTANT: A secret key is required for session security in Flask.
app.secret_key = 'super_secret_unpredictable_key_for_session'

# --- MOCK DATA ---
# Mock Database for user data (in-memory simulation)
USER_SESSION_ID = str(uuid.uuid4())
USER_DATA = {
    USER_SESSION_ID: {
        'id': USER_SESSION_ID,
        'username': 'testuser',
        'email': 'original_protected@example.com' # Email to start with for protected test
    }
}

# --- CSRF DEFENSE FUNCTIONS ---

def generate_csrf_token():
    """Generates a random, secret 32-character token for CSRF protection."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

def require_csrf_token():
    """
    Validates the CSRF token included in the request form against the one stored in the session.
    Returns True if tokens match, False otherwise.
    """
    token_from_form = request.form.get('csrf_token')
    token_from_session = session.get('csrf_token')
    
    # 3. Validation Logic: Check if token exists and if it matches the session token
    if not token_from_form or token_from_form != token_from_session:
        # Log the failure for the experiment verification
        print("\n[SERVER LOG] === !!! ATTACK FAILED !!! ===")
        print("[SERVER LOG] CSRF Token missing or mismatched. Request Rejected.")
        print("[SERVER LOG] =====================================\n")
        return False
    
    # Optional: Regenerate token after successful use to prevent token reuse (Good Practice)
    session['csrf_token'] = generate_csrf_token()
    return True

# --- ROUTES ---

@app.route('/login', methods=['GET', 'POST'])
def login_protected():
    """Simulates a successful login and sets the session cookie."""
    session['user_id'] = USER_SESSION_ID
    return redirect(url_for('profile_protected'))

@app.route('/profile')
def profile_protected():
    """
    Displays the user profile and the SECURE action form.
    This function generates and embeds the anti-CSRF token.
    """
    if 'user_id' not in session:
        return redirect(url_for('login_protected'))
    
    user_data = USER_DATA.get(session['user_id'])
    
    # 1. Generate new token for the form and store it in the session
    csrf_token = generate_csrf_token()
    session['csrf_token'] = csrf_token
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Protected App Profile</title>
        <style>
            body {{ font-family: sans-serif; padding: 20px; }}
            h1 {{ color: #008000; }}
            #current-email {{ font-weight: bold; color: blue; }}
            form {{ padding: 10px; border: 1px solid #ccc; border-radius: 5px; }}
            button {{ background-color: #008000; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; }}
        </style>
    </head>
    <body>
        <h1>PROTECTED APPLICATION</h1>
        <p>Logged in as: <b>{user_data['username']}</b></p>
        <p>Current Email: <span id="current-email">{user_data['email']}</span></p>
        <hr>
        
        <h2>Change Email Form (SECURE)</h2>
        <form action="{url_for('change_email_protected')}" method="post">
            <label for="email">New Email:</label>
            <input type="email" id="email" name="email" value="new_safe_email@test.com" required>
            
            <input type="hidden" name="csrf_token" value="{csrf_token}">
            
            <button type="submit">Update Email</button>
        </form>
        
        <p style="margin-top: 20px;">*The anti-CSRF token is included in the form to prevent external forgery.</p>
    </body>
    </html>
    """
    return render_template_string(html_content)

@app.route('/change_email', methods=['POST'])
def change_email_protected():
    """
    PROTECTED ENDPOINT: This function requires a valid CSRF token to proceed.
    """
    # 3. Check for CSRF token validity FIRST
    if not require_csrf_token():
        return "Error 403: Forbidden - Invalid CSRF Token.", 403

    if 'user_id' not in session:
        return "Error: Not authenticated.", 401
    
    # If the token is valid, proceed with the state change
    new_email = request.form.get('email')
    
    if new_email:
        USER_DATA[session['user_id']]['email'] = new_email
        print(f"[SERVER LOG] SUCCESS: Legitimate email change to {new_email}")
        return redirect(url_for('profile_protected'))
    
    return "Error: Missing email field.", 400

if __name__ == '__main__':
    # Running on localhost:5000, which is the target of attacker.html
    print("-------------------------------------------------------")
    print("Protected App running at http://localhost:5000/login")
    print("-------------------------------------------------------")
    app.run(debug=True, port=5000)