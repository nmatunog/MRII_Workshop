from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from dotenv import load_dotenv
import os

# Initialize Flask app
app = Flask(__name__, template_folder='templates')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///community.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)

# Define User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

# Login manager configuration
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Initialize database
with app.app_context():
    db.create_all()
    
    # Create test user if it doesn't exist
    if not User.query.filter_by(username='admin').first():
        user = User(username='admin', password='password123')
        db.session.add(user)
        db.session.commit()
        print("Created admin user")
    else:
        print("Admin user already exists")

# Routes
@app.route('/')
def home():
    print("Rendering home page")
    try:
        return render_template('home.html')
    except Exception as e:
        print(f"Error rendering home page: {str(e)}")
        return "Error: Unable to render home page"

@app.route('/login', methods=['GET', 'POST'])
def login():
    print("Accessing login route")
    print(f"Current user state: {current_user.is_authenticated}")
    
    if current_user.is_authenticated:
        print("User already authenticated")
        return redirect(url_for('dashboard'))
    
    print("Creating form")
    from .forms import LoginForm
    form = LoginForm()
    print(f"Form created: {form}")
    
    if request.method == 'POST':
        print("Form submission detected")
        print(f"Form data: {request.form}")
    
    if form.validate_on_submit():
        print(f"Form submitted: username={form.username.data}")
        user = User.query.filter_by(username=form.username.data).first()
        print(f"User query result: {user}")
        
        if user and user.password == form.password.data:
            print(f"Login successful for user {user.username}")
            login_user(user)
            print(f"Current user after login: {current_user}")
            return redirect(url_for('dashboard'))
        print("Invalid credentials")
        flash('Invalid username or password')
    else:
        print("Form not submitted or validation failed")
    
    return render_template('login.html', form=form)
    
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/dashboard')
@login_required
def dashboard():
    print("Accessing dashboard")
    print(f"Current user: {current_user}")
    print(f"User ID: {current_user.id}")
    print(f"User username: {current_user.username}")
    return render_template('dashboard.html')

    # Add this at the bottom of app.py
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)