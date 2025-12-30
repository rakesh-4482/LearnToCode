#!/bin/bash

# AlgoProject Environment Setup Script
# This script helps you manage the conda environment for the AlgoProject

ENV_NAME="compilerAlgo"

echo "🚀 AlgoProject Environment Manager"
echo "=================================="

case "$1" in
    "activate")
        echo "Activating conda environment: $ENV_NAME"
        conda activate $ENV_NAME
        echo "✅ Environment activated!"
        echo "📦 Node.js version: $(node --version)"
        echo "📦 npm version: $(npm --version)"
        ;;
    "deactivate")
        echo "Deactivating conda environment"
        conda deactivate
        echo "✅ Environment deactivated!"
        ;;
    "install")
        echo "Installing all project dependencies..."
        conda activate $ENV_NAME
        
        echo "📦 Installing root dependencies..."
        npm install
        
        echo "📦 Installing frontend dependencies..."
        cd frontend && npm install && cd ..
        
        echo "📦 Installing backend dependencies..."
        cd backend && npm install && cd ..
        
        echo "📦 Installing compiler dependencies..."
        cd compiler && npm install && cd ..
        
        echo "✅ All dependencies installed!"
        ;;
    "start")
        echo "Starting all services..."
        conda activate $ENV_NAME
        
        echo "🔧 Starting backend (Port 5555)..."
        cd backend && npm run dev &
        BACKEND_PID=$!
        cd ..
        
        echo "🔧 Starting compiler service..."
        cd compiler && node index.js &
        COMPILER_PID=$!
        cd ..
        
        echo "🔧 Starting frontend (Port 5173)..."
        cd frontend && npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        echo "✅ All services started!"
        echo "🌐 Frontend: http://localhost:5173"
        echo "🔌 Backend: http://localhost:5555"
        echo ""
        echo "Press Ctrl+C to stop all services"
        
        # Wait for user to stop
        wait
        ;;
    "stop")
        echo "Stopping all services..."
        pkill -f "npm run dev"
        pkill -f "node index.js"
        echo "✅ All services stopped!"
        ;;
    *)
        echo "Usage: $0 {activate|deactivate|install|start|stop}"
        echo ""
        echo "Commands:"
        echo "  activate   - Activate the conda environment"
        echo "  deactivate - Deactivate the conda environment"
        echo "  install    - Install all project dependencies"
        echo "  start      - Start all services (backend, compiler, frontend)"
        echo "  stop       - Stop all running services"
        echo ""
        echo "Example:"
        echo "  ./setup_env.sh activate"
        echo "  ./setup_env.sh install"
        echo "  ./setup_env.sh start"
        ;;
esac 