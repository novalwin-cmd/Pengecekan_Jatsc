#!/bin/bash
echo "🚀 Starting JATSC Inspection System Frontend"
echo "============================================"
echo ""

cd "$(dirname "$0")/frontend"

echo "📦 Starting Vite dev server..."
echo ""
npm run dev
