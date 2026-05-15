import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // ─── Organizations ─────────────────────────────────────────────────
  const cityGeneral = await prisma.organization.create({
    data: {
      name: 'City General Hospital',
      type: 'hospital',
      accountType: 'buyer',
      address: '12 Marina Drive, Mumbai 400001',
    },
  });

  const medPlus = await prisma.organization.create({
    data: {
      name: 'MedPlus Pharmacy',
      type: 'pharmacy',
      accountType: 'buyer',
      address: '45 MG Road, Bengaluru 560001',
    },
  });

  const surgiKit = await prisma.organization.create({
    data: {
      name: 'SurgiKit Vendor',
      type: 'vendor',
      accountType: 'seller',
      address: '78 Industrial Estate, Delhi 110020',
    },
  });

  const healthLine = await prisma.organization.create({
    data: {
      name: 'HealthLine Distributors',
      type: 'distributor',
      accountType: 'seller',
      address: '23 Logistic Park, Hyderabad 500032',
    },
  });

  console.log('✅ Organizations created');

  // ─── Users ─────────────────────────────────────────────────────────
  const passwordHash = await hash('Password123!', 12);

  const users = [
    {
      name: 'Alice Sharma',
      email: 'alice@hospital.com',
      passwordHash,
      orgId: cityGeneral.id,
      accountType: 'buyer',
      role: 'approver',
    },
    {
      name: 'Bob Kumar',
      email: 'bob@hospital.com',
      passwordHash,
      orgId: cityGeneral.id,
      accountType: 'buyer',
      role: 'requestor',
    },
    {
      name: 'Carol Desai',
      email: 'carol@pharmacy.com',
      passwordHash,
      orgId: medPlus.id,
      accountType: 'buyer',
      role: 'approver',
    },
    {
      name: 'Dan Patel',
      email: 'dan@pharmacy.com',
      passwordHash,
      orgId: medPlus.id,
      accountType: 'buyer',
      role: 'requestor',
    },
    {
      name: 'Eve Singh',
      email: 'eve@vendor.com',
      passwordHash,
      orgId: surgiKit.id,
      accountType: 'seller',
      role: 'approver',
    },
    {
      name: 'Frank Joshi',
      email: 'frank@distributor.com',
      passwordHash,
      orgId: healthLine.id,
      accountType: 'seller',
      role: 'approver',
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  console.log('✅ Users created');

  // ─── Products ──────────────────────────────────────────────────────
  const products = [
    {
      name: 'Surgical Gloves (Latex-Free)',
      description:
        'Premium nitrile surgical gloves, latex-free, powder-free. Textured fingertips for superior grip. Ambidextrous design for easy donning.',
      category: 'gloves',
      imageUrl: '/products/gloves.png',
      stock: 500,
      unit: 'box',
      tierPricing: JSON.stringify([
        { minQty: 1, unitPrice: 450 },
        { minQty: 10, unitPrice: 420 },
        { minQty: 50, unitPrice: 380 },
      ]),
      sterility: 'sterile',
      disposable: true,
      packagingQty: 100,
      manufacturer: 'SurgiKit Medical Pvt. Ltd.',
      qualityMetadata: JSON.stringify({
        material: 'Nitrile',
        plasticGrade: 'Medical Grade',
        certifications: ['ISO 13485', 'CE 0123', 'FDA 510(k)'],
      }),
      discountPercent: 5,
      minOrderForDiscount: 50,
      sellerOrgId: surgiKit.id,
      isActive: true,
    },
    {
      name: 'Disposable Syringes 5ml',
      description:
        'Sterile single-use 5ml syringes with Luer lock tip. Clear barrel with graduated markings. Compatible with standard needles.',
      category: 'syringes',
      imageUrl: '/products/syringes.png',
      stock: 1000,
      unit: 'box',
      tierPricing: JSON.stringify([
        { minQty: 1, unitPrice: 280 },
        { minQty: 20, unitPrice: 260 },
        { minQty: 100, unitPrice: 230 },
      ]),
      sterility: 'sterile',
      disposable: true,
      packagingQty: 100,
      manufacturer: 'SurgiKit Medical Pvt. Ltd.',
      qualityMetadata: JSON.stringify({
        material: 'Polypropylene barrel, Rubber plunger',
        plasticGrade: 'Medical Grade PP',
        certifications: ['ISO 7886-1', 'CE 0123', 'BIS Certified'],
      }),
      discountPercent: 8,
      minOrderForDiscount: 100,
      sellerOrgId: surgiKit.id,
      isActive: true,
    },
    {
      name: 'Surgical Mask N95',
      description:
        'N95 respiratory mask with 5-layer filtration. Adjustable nose bridge, soft ear loops. ≥95% bacterial filtration efficiency.',
      category: 'surgical_masks',
      imageUrl: '/products/mask-n95.png',
      stock: 2000,
      unit: 'pack',
      tierPricing: JSON.stringify([
        { minQty: 1, unitPrice: 180 },
        { minQty: 25, unitPrice: 165 },
        { minQty: 100, unitPrice: 145 },
      ]),
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 50,
      manufacturer: 'SurgiKit Medical Pvt. Ltd.',
      qualityMetadata: JSON.stringify({
        material: 'Non-woven polypropylene, Melt-blown filter',
        certifications: ['NIOSH N95', 'ISO 13485', 'EN 149:2001+A1:2009'],
      }),
      discountPercent: 10,
      minOrderForDiscount: 100,
      sellerOrgId: surgiKit.id,
      isActive: true,
    },
    {
      name: 'IV Infusion Set',
      description:
        'Sterile IV infusion set with 20 drops/ml drip chamber. Flexible tube with roller clamp. Sharp piercing spike for easy bottle penetration.',
      category: 'iv_sets',
      imageUrl: '/products/iv-set.png',
      stock: 600,
      unit: 'box',
      tierPricing: JSON.stringify([
        { minQty: 1, unitPrice: 350 },
        { minQty: 10, unitPrice: 320 },
        { minQty: 50, unitPrice: 290 },
      ]),
      sterility: 'sterile',
      disposable: true,
      packagingQty: 50,
      manufacturer: 'SurgiKit Medical Pvt. Ltd.',
      qualityMetadata: JSON.stringify({
        material: 'PVC tubing, Polypropylene connector',
        plasticGrade: 'Medical Grade PVC',
        certifications: ['ISO 8536-4', 'CE 0123', 'WHO PQ'],
      }),
      sellerOrgId: surgiKit.id,
      isActive: true,
    },
    {
      name: 'Sterile Gauze Rolls',
      description:
        'Absorbent sterile cotton gauze rolls. Soft, lint-free, highly absorbent. Ideal for wound dressing and surgical procedures.',
      category: 'gauze',
      imageUrl: '/products/gauze.png',
      stock: 1500,
      unit: 'box',
      tierPricing: JSON.stringify([
        { minQty: 1, unitPrice: 120 },
        { minQty: 20, unitPrice: 110 },
        { minQty: 100, unitPrice: 95 },
      ]),
      sterility: 'sterile',
      disposable: true,
      packagingQty: 24,
      manufacturer: 'HealthLine Med Devices Ltd.',
      qualityMetadata: JSON.stringify({
        material: '100% Cotton',
        certifications: ['ISO 9001', 'BIS IS 4889', 'CE Certified'],
      }),
      discountPercent: 7,
      minOrderForDiscount: 20,
      sellerOrgId: healthLine.id,
      isActive: true,
    },
    {
      name: 'PPE Kit Full Body',
      description:
        'Complete PPE kit including coverall, shoe covers, head cover, face shield, and gloves. Waterproof and breathable fabric.',
      category: 'ppe_kits',
      imageUrl: '/products/ppe-kit.png',
      stock: 300,
      unit: 'kit',
      tierPricing: JSON.stringify([
        { minQty: 1, unitPrice: 850 },
        { minQty: 5, unitPrice: 800 },
        { minQty: 25, unitPrice: 720 },
      ]),
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 1,
      manufacturer: 'HealthLine Med Devices Ltd.',
      qualityMetadata: JSON.stringify({
        material: 'SMS Non-woven, Polyethylene coating',
        certifications: ['ISO 13688', 'EN 14126', 'WHO Compliant'],
      }),
      discountPercent: 12,
      minOrderForDiscount: 25,
      sellerOrgId: healthLine.id,
      isActive: true,
    },
    {
      name: 'Cotton Roll Absorbent',
      description:
        'Highly absorbent non-sterile cotton roll. Soft texture, low lint. Suitable for general medical use, padding, and wound care preparation.',
      category: 'cotton',
      imageUrl: '/products/cotton-roll.png',
      stock: 2000,
      unit: 'roll',
      tierPricing: JSON.stringify([
        { minQty: 1, unitPrice: 90 },
        { minQty: 10, unitPrice: 80 },
        { minQty: 50, unitPrice: 70 },
      ]),
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 1,
      manufacturer: 'HealthLine Med Devices Ltd.',
      qualityMetadata: JSON.stringify({
        material: '100% Absorbent Cotton',
        certifications: ['BIS IS 4985', 'ISO 9001', 'Pharma Grade'],
      }),
      discountPercent: 5,
      minOrderForDiscount: 50,
      sellerOrgId: healthLine.id,
      isActive: true,
    },
    {
      name: 'Hand Sanitizer 500ml',
      description:
        'Alcohol-based hand sanitizer (70% IPA). Fast-acting, broad-spectrum antimicrobial. With moisturizer to prevent skin dryness.',
      category: 'hand_sanitizers',
      imageUrl: '/products/sanitizer.png',
      stock: 800,
      unit: 'bottle',
      tierPricing: JSON.stringify([
        { minQty: 1, unitPrice: 150 },
        { minQty: 10, unitPrice: 135 },
        { minQty: 50, unitPrice: 120 },
      ]),
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 1,
      manufacturer: 'HealthLine Med Devices Ltd.',
      qualityMetadata: JSON.stringify({
        material: '70% Isopropyl Alcohol, Carbomer, Glycerin',
        certifications: ['WHO Formulation', 'ISO 9001', 'GMP Certified'],
      }),
      discountPercent: 6,
      minOrderForDiscount: 50,
      sellerOrgId: healthLine.id,
      isActive: true,
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log('✅ Products created');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
