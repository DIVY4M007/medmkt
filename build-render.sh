#!/bin/bash
set -e

echo "========================================="
echo "  MedMkt — Render Build Script"
echo "========================================="

echo ""
echo ">>> [1/7] Installing dependencies..."
npm install

echo ""
echo ">>> [2/7] Generating Prisma client..."
npx prisma generate

echo ""
echo ">>> [3/7] Ensuring database directory exists..."
mkdir -p ./db

echo ""
echo ">>> [4/7] Pushing database schema..."
DATABASE_URL="file:./db/production.db" npx prisma db push

echo ""
echo ">>> [5/7] Seeding database..."
DATABASE_URL="file:./db/production.db" npx prisma db seed || echo "⚠ Seed skipped (may already have data)"

echo ""
echo ">>> [6/7] Building Next.js..."
npx next build

echo ""
echo ">>> [7/7] Copying files for standalone output..."
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true

# Copy Prisma files so the DB client works at runtime
mkdir -p .next/standalone/node_modules/.prisma
cp -r node_modules/.prisma/client .next/standalone/node_modules/.prisma/client 2>/dev/null || true
mkdir -p .next/standalone/node_modules/@prisma
cp -r node_modules/@prisma/client .next/standalone/node_modules/@prisma/client 2>/dev/null || true

# Copy the database file into standalone output
mkdir -p .next/standalone/db
cp -r ./db/production.db .next/standalone/db/production.db 2>/dev/null || echo "⚠ No DB file to copy yet"

echo ""
echo "========================================="
echo "  ✅ Build complete!"
echo "========================================="
