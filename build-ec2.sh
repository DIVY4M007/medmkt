#!/bin/bash

echo "========================================="
echo "  MedMkt — EC2 Build Script"
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
npx prisma db seed 2>&1 || echo "⚠ Seed skipped or failed, continuing..."

echo ""
echo ">>> [5/5] Building Next.js..."
npx next build

echo ""
echo "========================================="
echo "  ✅ Build complete!"
echo "========================================="
