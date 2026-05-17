#!/bin/bash
set -e

echo ">>> Starting MedMkt server on port ${PORT:-10000}..."
npx next start -p ${PORT:-10000} -H 0.0.0.0
