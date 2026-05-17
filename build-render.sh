#!/bin/bash

echo "========================================="
echo "  MedMkt — Render Build Script"
echo "========================================="

echo ""
echo ">>> [1/6] Installing dependencies (including devDependencies for build)..."
npm install --include=dev

echo ""
echo ">>> [2/6] Generating Prisma client..."
npx prisma generate

echo ""
echo ">>> [3/6] Ensuring database directory exists..."
mkdir -p ./db

echo ""
echo ">>> [4/6] Pushing database schema..."
npx prisma db push --accept-data-loss 2>&1 || echo "⚠ DB push had issues, continuing..."

echo ""
echo ">>> [5/6] Seeding database..."
npx prisma db seed 2>&1 || echo "⚠ Seed skipped or failed, continuing..."

echo ""
echo ">>> [6/6] Building Next.js..."
npx next build

echo ""
echo "========================================="
echo "  ✅ Build complete!"
echo "========================================="
