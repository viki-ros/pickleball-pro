#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "=========================================================="
echo "      🎾 PICKLEBALL PRO - FULL-STACK DEV RUNNER 🎾       "
echo "=========================================================="
echo "Backend:  FastAPI + SQLite (Port 8001)"
echo "Frontend: React + TypeScript + Tailwind (Port 5174)"
echo "=========================================================="

# 1. Start Backend in background
cd "$DIR/backend"
export PYTHONPATH=.
"$DIR/backend/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# 2. Cleanup handler
cleanup() {
    echo ""
    echo "Shutting down Pickleball Pro servers..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Give backend a moment to bind
sleep 1.5

# 3. Start Frontend
cd "$DIR/frontend"
echo ""
echo "🚀 Web App:      http://localhost:5174"
echo "📖 Swagger Docs: http://localhost:8001/docs"
echo "=========================================================="
npm run dev -- --host 0.0.0.0 --port 5174

