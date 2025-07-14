from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@localhost/auth_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to tickets
    tickets = db.relationship('Ticket', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

# Ticket model
class Ticket(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), nullable=False, default='medium')  # low, medium, high
    status = db.Column(db.String(20), nullable=False, default='todo')  # todo, in-progress, done
    labels = db.Column(db.Text, nullable=True)  # JSON string of labels
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        import json
        labels = []
        if self.labels:
            try:
                labels = json.loads(self.labels)
            except:
                labels = []
        
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'labels': labels,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }

# Database initialization with fallback
def init_database():
    try:
        with app.app_context():
            db.create_all()
            print("✅ Database tables created successfully!")
            return True
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        print("📝 To fix this, please:")
        print("1. Make sure MySQL is running: brew services start mysql")
        print("2. Create the database: mysql -u root -e 'CREATE DATABASE auth_db;'")
        print("3. Or set a password in .env file: DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/auth_db")
        print("4. Alternatively, the app will fall back to SQLite for now.")
        
        # Fallback to SQLite
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///auth.db'
        
        # Need to recreate db object with new config
        db.init_app(app)
        
        try:
            with app.app_context():
                db.create_all()
            print("✅ Fallback: Using SQLite database instead.")
            return True
        except Exception as fallback_error:
            print(f"❌ Even SQLite fallback failed: {fallback_error}")
            return False

# Initialize database
init_database()

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 409
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 409
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == data['username']) | (User.email == data['username'])
        ).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Create access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running'}), 200

# Ticket endpoints
@app.route('/api/tickets', methods=['GET'])
@jwt_required()
def get_tickets():
    try:
        current_user_id = int(get_jwt_identity())
        tickets = Ticket.query.filter_by(user_id=current_user_id).all()
        
        return jsonify({
            'tickets': [ticket.to_dict() for ticket in tickets]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('title') or not data.get('description'):
            return jsonify({'error': 'Title and description are required'}), 400
        
        # Validate priority
        valid_priorities = ['low', 'medium', 'high']
        priority = data.get('priority', 'medium')
        if priority not in valid_priorities:
            return jsonify({'error': 'Priority must be low, medium, or high'}), 400
        
        # Handle labels
        import json
        labels = data.get('labels', [])
        labels_json = json.dumps(labels) if labels else None
        
        # Create new ticket
        ticket = Ticket(
            title=data['title'],
            description=data['description'],
            priority=priority,
            status='todo',  # New tickets always start in todo
            labels=labels_json,
            user_id=current_user_id
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        return jsonify({
            'message': 'Ticket created successfully',
            'ticket': ticket.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tickets/<ticket_id>', methods=['PUT'])
@jwt_required()
def update_ticket(ticket_id):
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Find ticket belonging to current user
        ticket = Ticket.query.filter_by(id=ticket_id, user_id=current_user_id).first()
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        # Update fields if provided
        if 'title' in data:
            ticket.title = data['title']
        if 'description' in data:
            ticket.description = data['description']
        if 'priority' in data:
            valid_priorities = ['low', 'medium', 'high']
            if data['priority'] in valid_priorities:
                ticket.priority = data['priority']
        if 'status' in data:
            valid_statuses = ['todo', 'in-progress', 'done']
            if data['status'] in valid_statuses:
                ticket.status = data['status']
        if 'labels' in data:
            import json
            ticket.labels = json.dumps(data['labels']) if data['labels'] else None
        
        ticket.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Ticket updated successfully',
            'ticket': ticket.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tickets/<ticket_id>', methods=['DELETE'])
@jwt_required()
def delete_ticket(ticket_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        # Find ticket belonging to current user
        ticket = Ticket.query.filter_by(id=ticket_id, user_id=current_user_id).first()
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        db.session.delete(ticket)
        db.session.commit()
        
        return jsonify({'message': 'Ticket deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
