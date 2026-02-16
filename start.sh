#!/bin/bash

# Build and start the full-stack application

echo "Building frontend..."
cd frontend
npm install
npm run build

echo "Building backend..."
cd ../backend
npm install
npm run build

echo "Starting backend server..."
npm start