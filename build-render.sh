#!/bin/bash
set -e

echo "========================================="
echo "  MedMkt — Render Build Script"
echo "========================================="

echo ""
echo ">>> [1/5] Installing dependencies..."
npm install

echo ""
echo ">>> [2/5] Generating Prisma client..."
npx prisma generate

echo ""
echo ">>> [3/5] Pushing database schema..."
npx prisma db push

echo ""
echo ">>> [4/5] Seeding database..."
npx prisma db seed || echo "⚠ Seed skipped (may already have data)"

echo ""
echo ">>> [5/5] Building Next.js..."
npx next build

echo ""
echo "========================================="
echo "  ✅ Build complete!"
echo "========================================="
