import { seedDatabase, checkDatabaseConnection } from '../src/db.js';

async function main() {
  console.log('🚀 Starting GenericMed PostgreSQL & Prisma Database Seeder...');
  console.log('Checking database connection...');
  const status = await checkDatabaseConnection(true);
  console.log(`Database Status: [${status.provider}] Connected: ${status.isConnected} (Latency: ${status.latencyMs}ms)`);

  const result = await seedDatabase();
  console.log(result.message);
  console.log('Database entity counts:', JSON.stringify(result.counts, null, 2));

  if (!result.success) {
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Fatal seeder exception:', e);
    process.exit(1);
  });
