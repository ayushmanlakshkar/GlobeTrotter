#!/usr/bin/env node
/**
 * Simple script to run database seeding
 * Usage: npm run seed or ts-node src/scripts/seed.ts
 */

import seedDatabase from '../seeds/seedData';

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    await seedDatabase();
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
