#!/bin/bash
# Quick fix for TutorsPool backend setup

echo "🔧 Fixing dependencies and starting backend..."
echo ""

# Install with legacy peer deps to bypass version conflicts
echo "📦 Installing @google/generative-ai..."
npm install @google/generative-ai --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Package installed successfully!"
    echo ""
    echo "🚀 Starting backend server..."
    npm run server:dev
else
    echo "❌ Installation failed. Trying alternative method..."
    npm install @google/generative-ai --force
    
    if [ $? -eq 0 ]; then
        echo "✅ Package installed with force flag!"
        echo ""
        echo "🚀 Starting backend server..."
        npm run server:dev
    else
        echo "❌ Could not install package. Please check your npm configuration."
        exit 1
    fi
fi

