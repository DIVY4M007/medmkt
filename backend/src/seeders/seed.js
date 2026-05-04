// Idempotent seeder. Runs at startup if DB is empty so the user has demo data immediately.
const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Product = require('../models/Product');

const HOSPITAL_BED = 'https://images.unsplash.com/photo-1710074213379-2a9c2653046a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxob3NwaXRhbCUyMGJlZHxlbnwwfHx8fDE3Nzc4NTE1MDh8MA&ixlib=rb-4.1.0&q=85';
const PILLS = 'https://images.unsplash.com/photo-1631980838946-755ba8443ab7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMG1lZGljaW5lc3xlbnwwfHx8fDE3Nzc4NTE1MDl8MA&ixlib=rb-4.1.0&q=85';
const EQUIPMENT = 'https://images.unsplash.com/photo-1664902265139-934219cee42f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwyfHxzdXJnZXJ5JTIwdG9vbHN8ZW58MHx8fHwxNzc3ODUxNTA4fDA&ixlib=rb-4.1.0&q=85';
const USED_BED = 'https://images.pexels.com/photos/8410647/pexels-photo-8410647.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
const SURGICAL = 'https://images.unsplash.com/photo-1746842421936-461e16dd8238?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxzdXJnZXJ5JTIwdG9vbHN8ZW58MHx8fHwxNzc3ODUxNTA4fDA&ixlib=rb-4.1.0&q=85';

async function autoSeedIfEmpty() {
  const orgCount = await Organization.countDocuments();
  if (orgCount > 0) {
    console.log('[seed] DB already has data — skipping');
    return;
  }
  await runSeed();
}

async function runSeed() {
  console.log('[seed] populating demo data...');
  const password = await bcrypt.hash('Password123!', 10);

  const [hospital, pharmacy, vendor, distributor] = await Organization.insertMany([
    { name: 'Northwind General Hospital', type: 'hospital', address: 'Boston, MA', isBuyer: true, isSeller: false },
    { name: 'BlueCross Pharmacy', type: 'pharmacy', address: 'New York, NY', isBuyer: true, isSeller: true },
    { name: 'MedSupply Vendors Inc.', type: 'vendor', address: 'Chicago, IL', isBuyer: false, isSeller: true },
    { name: 'PrimeHealth Distributors', type: 'distributor', address: 'San Francisco, CA', isBuyer: true, isSeller: true },
  ]);

  await User.insertMany([
    // Hospital — buyer flow
    { name: 'Alice Approver', email: 'alice@hospital.com', passwordHash: password, organization: hospital._id, role: 'approver' },
    { name: 'Bob Requestor', email: 'bob@hospital.com', passwordHash: password, organization: hospital._id, role: 'requestor' },
    // Pharmacy — both
    { name: 'Carol Approver', email: 'carol@pharmacy.com', passwordHash: password, organization: pharmacy._id, role: 'approver' },
    { name: 'Dan Requestor', email: 'dan@pharmacy.com', passwordHash: password, organization: pharmacy._id, role: 'requestor' },
    // Vendor — seller
    { name: 'Eve Vendor', email: 'eve@vendor.com', passwordHash: password, organization: vendor._id, role: 'approver' },
    // Distributor — seller + buyer
    { name: 'Frank Distributor', email: 'frank@distributor.com', passwordHash: password, organization: distributor._id, role: 'approver' },
  ]);

  await Product.insertMany([
    {
      name: 'Paracetamol 500mg (100 tablets)',
      description: 'Analgesic and antipyretic. Box of 100 tablets, blister-packed.',
      category: 'medicines',
      sellerOrg: pharmacy._id,
      imageUrl: PILLS,
      stock: 5000,
      unit: 'box',
      tierPricing: [
        { minQty: 1, unitPrice: 4.5 },
        { minQty: 50, unitPrice: 3.9 },
        { minQty: 200, unitPrice: 3.2 },
      ],
      qualityMetadata: { certifications: ['FDA', 'ISO-13485'] },
    },
    {
      name: 'Amoxicillin 250mg (Bottle of 60)',
      description: 'Broad-spectrum antibiotic, suspension form.',
      category: 'medicines',
      sellerOrg: pharmacy._id,
      imageUrl: PILLS,
      stock: 1200,
      unit: 'bottle',
      tierPricing: [
        { minQty: 1, unitPrice: 12.0 },
        { minQty: 25, unitPrice: 10.5 },
        { minQty: 100, unitPrice: 9.0 },
      ],
      qualityMetadata: { certifications: ['FDA'] },
    },
    {
      name: 'Disposable Nitrile Gloves (Box 100)',
      description: 'Powder-free, latex-free examination gloves, medical grade.',
      category: 'consumables',
      sellerOrg: vendor._id,
      imageUrl: SURGICAL,
      stock: 3000,
      unit: 'box',
      tierPricing: [
        { minQty: 1, unitPrice: 8.0 },
        { minQty: 100, unitPrice: 6.5 },
        { minQty: 500, unitPrice: 5.5 },
      ],
      qualityMetadata: { material: 'Nitrile rubber', plasticGrade: 'Medical Grade A', certifications: ['ASTM D6319', 'CE'] },
    },
    {
      name: 'Sterile Syringes 10ml (Pack of 100)',
      description: 'Luer-lock disposable syringes, individually packed.',
      category: 'consumables',
      sellerOrg: vendor._id,
      imageUrl: SURGICAL,
      stock: 5000,
      unit: 'pack',
      tierPricing: [
        { minQty: 1, unitPrice: 14.0 },
        { minQty: 50, unitPrice: 12.0 },
        { minQty: 250, unitPrice: 10.5 },
      ],
      qualityMetadata: { material: 'Polypropylene', plasticGrade: 'Pharma Grade PP', certifications: ['ISO-7886', 'CE'] },
    },
    {
      name: 'Patient Vital Signs Monitor',
      description: 'Multi-parameter monitor: ECG, SpO2, NIBP, Temp.',
      category: 'equipment',
      sellerOrg: distributor._id,
      imageUrl: EQUIPMENT,
      stock: 25,
      unit: 'unit',
      tierPricing: [
        { minQty: 1, unitPrice: 2400 },
        { minQty: 5, unitPrice: 2200 },
        { minQty: 20, unitPrice: 2000 },
      ],
      qualityMetadata: { certifications: ['CE', 'FDA-510k'] },
    },
    {
      name: 'Infusion Pump (Volumetric)',
      description: 'Single-channel volumetric infusion pump, hospital-grade.',
      category: 'equipment',
      sellerOrg: vendor._id,
      imageUrl: EQUIPMENT,
      stock: 15,
      unit: 'unit',
      tierPricing: [
        { minQty: 1, unitPrice: 1700 },
        { minQty: 5, unitPrice: 1550 },
      ],
      qualityMetadata: { certifications: ['CE', 'IEC-60601'] },
    },
    {
      name: 'Refurbished Hospital Bed (Electric)',
      description: 'Three-function electric hospital bed, fully refurbished.',
      category: 'used_equipment',
      sellerOrg: distributor._id,
      imageUrl: USED_BED,
      stock: 4,
      unit: 'unit',
      tierPricing: [{ minQty: 1, unitPrice: 950 }, { minQty: 3, unitPrice: 880 }],
      qualityMetadata: { certifications: ['CE'] },
      isUsed: true,
      condition: 'refurbished',
      yearOfManufacture: 2019,
      usageDetails: '~3,200 operating hours. New mattress, replaced motors, 6-month warranty.',
    },
    {
      name: 'Used Ultrasound Scanner',
      description: 'Portable 2D ultrasound, 3 probes included.',
      category: 'used_equipment',
      sellerOrg: distributor._id,
      imageUrl: EQUIPMENT,
      stock: 2,
      unit: 'unit',
      tierPricing: [{ minQty: 1, unitPrice: 4200 }],
      qualityMetadata: { certifications: ['CE'] },
      isUsed: true,
      condition: 'good',
      yearOfManufacture: 2017,
      usageDetails: 'Approx. 6,500 scans. Cosmetic wear only. 90-day warranty.',
    },
  ]);

  console.log('[seed] done.');
}

module.exports = { autoSeedIfEmpty, runSeed };
