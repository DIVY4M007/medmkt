#!/bin/bash
set -e

echo ">>> Starting MedMkt server on port ${PORT:-10000}..."
export HOSTNAME="0.0.0.0"
export PORT="${PORT:-10000}"
cd .next/standalone
node server.js
