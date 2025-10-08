#!/bin/bash

echo "🚀 Starting TutorsPool Development Server..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Check if vite is available
if ! command -v vite &> /dev/null; then
    echo "🔧 Installing vite..."
    npm install vite --save-dev
fi

echo "🌟 Starting development server..."
npm run dev
