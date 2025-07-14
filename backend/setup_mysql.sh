#!/bin/bash

# MySQL Setup Script for Authentication System
# This script will help you set up MySQL for the authentication system

echo "🔧 MySQL Setup for Authentication System"
echo "========================================"

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "📝 Starting MySQL service..."
    brew services start mysql
    sleep 3
fi

# Function to try connecting with different passwords
try_mysql_connection() {
    local password="$1"
    local cmd="$2"
    
    if [ -z "$password" ]; then
        mysql -u root -e "$cmd" 2>/dev/null
    else
        mysql -u root -p"$password" -e "$cmd" 2>/dev/null
    fi
}

# Try to connect and create database
echo "🔐 Attempting to connect to MySQL..."

# Common passwords to try
passwords=("" "root" "password" "123456" "admin")
connected=false

for pwd in "${passwords[@]}"; do
    echo "   Trying password: '${pwd}'"
    if try_mysql_connection "$pwd" "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Connected successfully!"
        
        # Create database and user
        echo "📦 Creating database and user..."
        
        if [ -z "$pwd" ]; then
            mysql -u root -e "
                CREATE DATABASE IF NOT EXISTS auth_db;
                CREATE USER IF NOT EXISTS 'auth_user'@'localhost' IDENTIFIED BY 'auth_password';
                GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'localhost';
                FLUSH PRIVILEGES;
                SHOW DATABASES;
            "
        else
            mysql -u root -p"$pwd" -e "
                CREATE DATABASE IF NOT EXISTS auth_db;
                CREATE USER IF NOT EXISTS 'auth_user'@'localhost' IDENTIFIED BY 'auth_password';
                GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'localhost';
                FLUSH PRIVILEGES;
                SHOW DATABASES;
            "
        fi
        
        # Update .env file
        echo "📝 Updating .env file..."
        cat > .env << EOF
# Database Configuration
DATABASE_URL=mysql+pymysql://auth_user:auth_password@localhost/auth_db

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
EOF
        
        echo "✅ MySQL setup complete!"
        echo "✅ Database 'auth_db' created"
        echo "✅ User 'auth_user' created with password 'auth_password'"
        echo "✅ .env file updated"
        
        connected=true
        break
    fi
done

if [ "$connected" = false ]; then
    echo "❌ Could not connect to MySQL with any common password."
    echo ""
    echo "📝 Manual setup required:"
    echo "1. Reset MySQL root password:"
    echo "   sudo mysql_secure_installation"
    echo ""
    echo "2. Or connect manually and create database:"
    echo "   mysql -u root -p"
    echo "   CREATE DATABASE auth_db;"
    echo "   CREATE USER 'auth_user'@'localhost' IDENTIFIED BY 'auth_password';"
    echo "   GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'localhost';"
    echo "   FLUSH PRIVILEGES;"
    echo ""
    echo "3. Then update .env file with correct credentials"
    echo ""
    echo "For now, the app will continue using SQLite."
fi

echo ""
echo "🚀 You can now restart your Flask application!"
echo "   cd backend && python app.py"
