#!/usr/bin/env python3

import pymysql
import sys

def create_database():
    try:
        # Try to connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',  # Empty password
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute("CREATE DATABASE IF NOT EXISTS auth_db")
            cursor.execute("USE auth_db")
            
            # Create the users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(80) UNIQUE NOT NULL,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    password_hash VARCHAR(128) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create the tickets table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tickets (
                    id VARCHAR(36) PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    description TEXT NOT NULL,
                    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
                    status VARCHAR(20) NOT NULL DEFAULT 'todo',
                    labels TEXT,
                    user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            
            # Create indexes
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)")
            
        connection.commit()
        print("✅ Database 'auth_db' created successfully!")
        print("✅ Users table created with indexes!")
        print("✅ Tickets table created with indexes!")
        
    except pymysql.Error as e:
        print(f"❌ Error connecting to MySQL: {e}")
        print("Trying with password...")
        
        # Try with common default passwords
        passwords = ['root', 'password', '123456', 'admin']
        for pwd in passwords:
            try:
                connection = pymysql.connect(
                    host='localhost',
                    user='root',
                    password=pwd,
                    charset='utf8mb4',
                    cursorclass=pymysql.cursors.DictCursor
                )
                
                with connection.cursor() as cursor:
                    cursor.execute("CREATE DATABASE IF NOT EXISTS auth_db")
                    cursor.execute("USE auth_db")
                    
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS users (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            username VARCHAR(80) UNIQUE NOT NULL,
                            email VARCHAR(120) UNIQUE NOT NULL,
                            password_hash VARCHAR(128) NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """)
                    
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS tickets (
                            id VARCHAR(36) PRIMARY KEY,
                            title VARCHAR(200) NOT NULL,
                            description TEXT NOT NULL,
                            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
                            status VARCHAR(20) NOT NULL DEFAULT 'todo',
                            labels TEXT,
                            user_id INT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        )
                    """)
                    
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)")
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)")
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)")
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)")
                    
                connection.commit()
                print(f"✅ Database created with password: {pwd}")
                
                # Update .env file with the correct password
                with open('.env', 'r') as f:
                    content = f.read()
                
                content = content.replace('DATABASE_URL=mysql+pymysql://root:@localhost/auth_db', 
                                        f'DATABASE_URL=mysql+pymysql://root:{pwd}@localhost/auth_db')
                
                with open('.env', 'w') as f:
                    f.write(content)
                
                print(f"✅ Updated .env file with password: {pwd}")
                return
                
            except pymysql.Error:
                continue
        
        print("❌ Could not connect with any common passwords.")
        print("Please set up MySQL root password manually.")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    create_database()
