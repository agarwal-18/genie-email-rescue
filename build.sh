#!/bin/bash

# Install Python dependencies
pip install -r requirements.txt

# Build frontend
npm ci
npm run build

# Copy frontend build to the dist directory
mkdir -p dist
cp -r build/* dist/
