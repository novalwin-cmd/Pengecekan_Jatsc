#!/bin/bash
echo "🚀 Starting JATSC Inspection System Backend"
echo "==========================================="
echo ""

# Kill any existing processes on port 5000
echo "🔴 Stopping old processes..."
lsof -i :5000 2>/dev/null | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null
sleep 1

# Navigate to backend
cd "$(dirname "$0")/backend"

# Activate venv
echo "📦 Activating virtual environment..."
source venv/bin/activate 2>/dev/null

# Start backend
echo "✅ Starting Flask server..."
echo ""
python3 app.py
