#!/bin/bash

# Install Python dependencies
pip install -r requirements.txt

# Build frontend
npm ci
npm run build

# Copy frontend build to the dist directory
mkdir -p dist
cp -r build/* dist/

# Verify Frontend Build
if [ "$(ls -A dist)" ]; then
    echo "Frontend build copied successfully."
else
    echo "Failed to copy frontend build."
    exit 1
fi
