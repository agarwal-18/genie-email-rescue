
#!/bin/bash

# Install Python dependencies
pip install -r requirements.txt

# Build frontend (this assumes npm is available)
npm ci
npm run build

# Copy static files to appropriate directory
mkdir -p dist
cp -r build/* dist/
