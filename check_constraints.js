const postgres = require('postgres');
require('dotenv').config();
const sql = postgres(process.env.DATABASE_URL);
async function run() {
  const checks = await sql`
    SELECT constraint_name, table_name, check_clause
    FROM information_schema.check_constraints
    JOIN information_schema.table_constraints USING (constraint_name)
    WHERE table_schema = 'public';
  `;
  console.log(checks);
  process.exit(0);
}
run();
