#!/bin/bash
set -e

echo ">>> Starting MedMkt server on port $PORT..."
cd .next/standalone
node server.js
