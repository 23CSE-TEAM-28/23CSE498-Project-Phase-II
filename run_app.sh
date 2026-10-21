#!/bin/bash

# FPDAF Clinical Decision Support System (CDSS) Workstation Startup Script
# Automatically boots the FastAPI database backend and starts the Vite React frontend.

# Capture clean exits to terminate both servers on Ctrl+C
trap 'echo -e "\n🛑 Terminating clinical servers..."; kill $(jobs -p); exit' INT TERM EXIT

echo "=================================================================="
echo "  🏥  LAUNCHING FPDAF CLINICAL ICU DECISION SUPPORT WORKSTATION "
echo "=================================================================="

# Get project root folder path
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if SQLite DB file exists
DB_FILE="$BASE_DIR/backend/clinical_warehouse.db"
if [ ! -f "$DB_FILE" ]; then
    echo "⚠️ Clinical database not found. Populating warehouse tables..."
    python3 "$BASE_DIR/backend/init_db.py"
fi

# Check if port 8000 is occupied and terminate conflicting process to avoid bind failure
PORT_8000_PID=$(lsof -t -i :8000)
if [ ! -z "$PORT_8000_PID" ]; then
    echo "⚠️ Port 8000 is occupied by process ID $PORT_8000_PID. Freeing port 8000..."
    kill -9 $PORT_8000_PID
    sleep 1
fi

# Check if port 5173 is occupied and terminate conflicting process to ensure port 5173 binding
PORT_5173_PID=$(lsof -t -i :5173)
if [ ! -z "$PORT_5173_PID" ]; then
    echo "⚠️ Port 5173 is occupied by process ID $PORT_5173_PID. Freeing port 5173..."
    kill -9 $PORT_5173_PID
    sleep 1
fi

# 1. Start FastAPI Backend in the background
echo "🚀 1. Booting FastAPI Clinical Warehouse Server on port 8000..."
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Bounded sleep to ensure uvicorn finishes startup sequence
sleep 2

# 2. Check if Vite Node modules exist
if [ ! -d "$BASE_DIR/dashboard/node_modules" ]; then
    echo "📦 Node modules not found. Running npm install..."
    cd "$BASE_DIR/dashboard" && npm install
fi

# 3. Start React Vite Frontend
echo "🚀 2. Launching React Vite Clinician Dashboard Interface..."
cd "$BASE_DIR/dashboard"
npm run dev

# Keep process open to clean up on interrupts
wait $BACKEND_PID
