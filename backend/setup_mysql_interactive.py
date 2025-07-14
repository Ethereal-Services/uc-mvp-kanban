#!/usr/bin/env python3
"""
Interactive MySQL setup script for the authentication system.
This script will help you set up the MySQL database and user for the auth system.
"""

import mysql.connector
import getpass
import os
import sys

def get_mysql_connection():
    """Try to connect to MySQL with various methods."""
    print("Setting up MySQL database for authentication system...")
    print("=" * 50)
    
    # Try different connection methods
    methods = [
        {"user": "root", "password": ""},
        {"user": "root", "password": None},
    ]
    
    for method in methods:
        try:
            print(f"Trying to connect as {method['user']}...")
            if method['password'] is None:
                password = getpass.getpass("Enter MySQL root password (press Enter if no password): ")
                method['password'] = password
            
            conn = mysql.connector.connect(
                host="localhost",
                user=method['user'],
                password=method['password']
            )
            print(f"✓ Successfully connected as {method['user']}")
            return conn, method['password']
        except mysql.connector.Error as e:
            print(f"✗ Failed to connect as {method['user']}: {e}")
            continue
    
    print("Could not connect to MySQL. Please check your MySQL installation.")
    sys.exit(1)

def setup_database_and_user(conn, root_password):
    """Set up the database and user for the auth system."""
    cursor = conn.cursor()
    
    try:
        # Create database
        print("\nCreating database 'auth_db'...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS auth_db;")
        print("✓ Database 'auth_db' created successfully")
        
        # Create user with a strong password
        print("\nCreating user 'auth_user'...")
        try:
            cursor.execute("CREATE USER IF NOT EXISTS 'auth_user'@'localhost' IDENTIFIED BY 'AuthPassword123!';")
            auth_password = 'AuthPassword123!'
            print("✓ User 'auth_user' created with strong password")
        except mysql.connector.Error as e:
            if "password does not satisfy" in str(e):
                print("Strong password policy detected. Trying with a simpler password...")
                cursor.execute("CREATE USER IF NOT EXISTS 'auth_user'@'localhost' IDENTIFIED BY 'authpass';")
                auth_password = 'authpass'
                print("✓ User 'auth_user' created with simple password")
            else:
                raise e
        
        # Grant privileges
        print("\nGranting privileges to 'auth_user'...")
        cursor.execute("GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'localhost';")
        cursor.execute("FLUSH PRIVILEGES;")
        print("✓ Privileges granted successfully")
        
        # Test the new user connection
        print("\nTesting new user connection...")
        test_conn = mysql.connector.connect(
            host="localhost",
            user="auth_user",
            password=auth_password,
            database="auth_db"
        )
        test_conn.close()
        print("✓ New user connection test successful")
        
        return auth_password
        
    except mysql.connector.Error as e:
        print(f"✗ Error setting up database: {e}")
        sys.exit(1)
    finally:
        cursor.close()

def update_env_file(auth_password):
    """Update the .env file with MySQL configuration."""
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    
    print(f"\nUpdating .env file at {env_file}...")
    
    # Read current .env file
    env_content = []
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            env_content = f.readlines()
    
    # Update DATABASE_URL
    mysql_url = f"mysql+pymysql://auth_user:{auth_password}@localhost/auth_db"
    
    # Find and replace DATABASE_URL line
    updated = False
    for i, line in enumerate(env_content):
        if line.startswith('DATABASE_URL='):
            env_content[i] = f'DATABASE_URL={mysql_url}\n'
            updated = True
            break
    
    if not updated:
        env_content.append(f'DATABASE_URL={mysql_url}\n')
    
    # Write updated .env file
    with open(env_file, 'w') as f:
        f.writelines(env_content)
    
    print("✓ .env file updated successfully")
    print(f"  DATABASE_URL={mysql_url}")

def main():
    """Main function to set up MySQL for the auth system."""
    try:
        # Connect to MySQL
        conn, root_password = get_mysql_connection()
        
        # Set up database and user
        auth_password = setup_database_and_user(conn, root_password)
        
        # Update .env file
        update_env_file(auth_password)
        
        # Close connection
        conn.close()
        
        print("\n" + "=" * 50)
        print("✓ MySQL setup completed successfully!")
        print("✓ Database 'auth_db' created")
        print("✓ User 'auth_user' created")
        print("✓ .env file updated")
        print("\nYou can now restart your Flask application to use MySQL.")
        
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
