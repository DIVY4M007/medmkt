#!/bin/bash
set -e

echo "========================================="
echo "  MedMkt — Render Build Script"
echo "========================================="

echo ""
echo ">>> [1/6] Installing dependencies..."
npm install

echo ""
echo ">>> [2/6] Generating Prisma client..."
npx prisma generate

echo ""
echo ">>> [3/6] Ensuring database directory exists..."
mkdir -p /opt/render/project/src/db

echo ""
echo ">>> [4/6] Pushing database schema..."
npx prisma db push

echo ""
echo ">>> [5/6] Seeding database (if empty)..."
npx prisma db seed || echo "⚠ Seed skipped (may already have data)"

echo ""
echo ">>> [6/6] Building Next.js..."
npx next build

echo ""
echo ">>> Copying static files to standalone output..."
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true

echo ""
echo "========================================="
echo "  ✅ Build complete!"
echo "========================================="
