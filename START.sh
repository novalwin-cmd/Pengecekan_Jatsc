#!/bin/bash

# JATSC Inspection System - Start All Services
# Starts both Backend (Flask) and Frontend (Vite) with one command

set -e  # Exit on error

PROJECT_DIR="$(dirname "$0")"
cd "$PROJECT_DIR"

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║   🚀 JATSC Inspection System - Start All Services  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill any existing processes on ports 5000 and 5173
echo -e "${YELLOW}🔴 Cleaning up old processes...${NC}"
lsof -i :5000 2>/dev/null | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
lsof -i :5173 2>/dev/null | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 1

# Start Backend
echo ""
echo -e "${BLUE}📦 Starting Backend Server...${NC}"
echo -e "   Location: backend/"
echo -e "   Port: 5000"
echo ""

cd "$PROJECT_DIR/backend"

# Activate venv if not already active
if [[ -z "${VIRTUAL_ENV}" ]]; then
    if [[ ! -d "venv" ]]; then
        echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
        python3 -m venv venv
    fi
    source venv/bin/activate
fi

# Start backend in background
python3 app.py > /tmp/jatsc_backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
for i in {1..15}; do
    if curl -s http://127.0.0.1:5000/api/daily-checks > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready!${NC}"
        break
    fi
    if [[ $i -eq 15 ]]; then
        echo -e "${RED}✗ Backend failed to start${NC}"
        cat /tmp/jatsc_backend.log
        exit 1
    fi
    sleep 1
done

# Start Frontend
echo ""
echo -e "${BLUE}📦 Starting Frontend Server...${NC}"
echo -e "   Location: frontend/"
echo -e "   Port: 5173"
echo ""

cd "$PROJECT_DIR/frontend"

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Running npm install...${NC}"
    npm install
fi

# Start frontend in background
npm run dev > /tmp/jatsc_frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to be ready
echo -e "${YELLOW}⏳ Waiting for frontend to be ready...${NC}"
for i in {1..15}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend is ready!${NC}"
        break
    fi
    if [[ $i -eq 15 ]]; then
        echo -e "${RED}✗ Frontend failed to start${NC}"
        cat /tmp/jatsc_frontend.log
        exit 1
    fi
    sleep 1
done

# Success message
echo ""
echo "╔════════════════════════════════════════════════════╗"
echo -e "║${GREEN}   ✅ All Services Started Successfully!${NC}       ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}📋 Service Status:${NC}"
echo -e "   ${GREEN}✓${NC} Backend API    → http://127.0.0.1:5000"
echo -e "   ${GREEN}✓${NC} Frontend       → http://localhost:5173"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   Backend log:  tail -f /tmp/jatsc_backend.log"
echo -e "   Frontend log: tail -f /tmp/jatsc_frontend.log"
echo ""
echo -e "${YELLOW}🛑 To stop all services:${NC}"
echo -e "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${BLUE}🌐 Open browser and go to: http://localhost:5173${NC}"
echo ""

# Wait for user to stop services
wait
