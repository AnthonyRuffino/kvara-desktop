#!/bin/bash

# Start Vite dev server in background
echo "Starting Vite dev server..."
npm run dev &
VITE_PID=$!

# Wait for server to be ready
echo "Waiting for server to be ready..."
sleep 3

# Check if server is running
if curl -s http://localhost:5173 > /dev/null; then
    echo "Server is ready! Starting Electron..."
    npx electron . --no-sandbox
else
    echo "Server failed to start"
    kill $VITE_PID
    exit 1
fi 