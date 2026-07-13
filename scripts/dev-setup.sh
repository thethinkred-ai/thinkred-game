#!/bin/bash

# ThinkRed Game Development Setup Script
# This script sets up the development environment for the ThinkRed Economic Simulator

echo "🎮 Setting up ThinkRed Economic Simulator Development Environment"
echo "================================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 14+ for full functionality."
    echo "   You can continue without PostgreSQL, but database features will be limited."
fi

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
if [ -f "package.json" ]; then
    npm install
    echo "✅ Client dependencies installed"
else
    echo "❌ package.json not found in client directory"
    exit 1
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd ../server
if [ -f "package.json" ]; then
    npm install
    echo "✅ Server dependencies installed"
else
    echo "❌ package.json not found in server directory"
    exit 1
fi

# Create environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ .env file created from template"
    echo "⚠️  Please edit .env file with your configuration:"
    echo "   - Stepik API credentials"
    echo "   - Database connection string"
    echo "   - JWT secret key"
else
    echo "✅ .env file already exists"
fi

# Go back to root directory
cd ..

# Create development database setup script
echo "🗄️  Creating database setup script..."
cat > scripts/setup-db.sql << 'EOF'
-- ThinkRed Game Database Setup
-- Run this script in PostgreSQL to set up the database

-- Create database (run as postgres user)
-- CREATE DATABASE thinkred_game;

-- Connect to the database and create tables
\c thinkred_game;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    stepik_id INTEGER UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enterprises table
CREATE TABLE IF NOT EXISTS enterprises (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1,
    workers INTEGER DEFAULT 0,
    wage_rate DECIMAL(10,2) DEFAULT 100.00,
    production INTEGER DEFAULT 0,
    costs_labor DECIMAL(12,2) DEFAULT 0,
    costs_materials DECIMAL(12,2) DEFAULT 0,
    costs_overhead DECIMAL(12,2) DEFAULT 0,
    costs_depreciation DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    surplus_value DECIMAL(12,2) DEFAULT 0,
    technology DECIMAL(5,2) DEFAULT 1.0,
    location VARCHAR(255),
    established INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game events table
CREATE TABLE IF NOT EXISTS game_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Event responses table
CREATE TABLE IF NOT EXISTS event_responses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES game_events(id) ON DELETE CASCADE,
    choice_id VARCHAR(255) NOT NULL,
    consequences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game progress table
CREATE TABLE IF NOT EXISTS game_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    current_period VARCHAR(50) DEFAULT 'early_capitalism',
    unlocked_features TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Economic snapshots table
CREATE TABLE IF NOT EXISTS economic_snapshots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    gdp DECIMAL(15,2),
    unemployment_rate DECIMAL(5,4),
    inflation_rate DECIMAL(5,4),
    profit_rate DECIMAL(5,4),
    surplus_value_rate DECIMAL(5,4),
    concentration_index DECIMAL(5,4),
    crisis_phase VARCHAR(50),
    crisis_severity DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enterprises_user_id ON enterprises(user_id);
CREATE INDEX IF NOT EXISTS idx_game_events_user_id ON game_events(user_id);
CREATE INDEX IF NOT EXISTS idx_event_responses_user_id ON event_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_economic_snapshots_user_id ON economic_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_economic_snapshots_created_at ON economic_snapshots(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enterprises_updated_at BEFORE UPDATE ON enterprises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_progress_updated_at BEFORE UPDATE ON game_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

EOF

echo "✅ Database setup script created at scripts/setup-db.sql"

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your configuration"
echo "2. Set up PostgreSQL database (optional):"
echo "   - createdb thinkred_game"
echo "   - psql -d thinkred_game -f scripts/setup-db.sql"
echo "3. Start development servers:"
echo "   - Terminal 1: cd server && npm run dev"
echo "   - Terminal 2: cd client && npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🚀"
