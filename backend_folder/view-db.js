// view-db.js (Postgres version)
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/whattodo' });

async function main() {
    console.log('=== DATABASE TABLES ===');
    const { rows: tables } = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    tables.forEach(table => {
        console.log('Table:', table.tablename);
    });

    console.log('\n=== USERS ===');
    const { rows: users } = await pool.query('SELECT * FROM users ORDER BY id');
    users.forEach(user => {
        console.log(`ID: ${user.id}, Username: "${user.username}", Email: ${user.email || 'N/A'}`);
    });

    console.log('\n=== ITINERARIES ===');
    const { rows: itineraries } = await pool.query('SELECT i.*, u.username FROM itineraries i LEFT JOIN users u ON i.authorid = u.id');
    itineraries.forEach(itinerary => {
        console.log(`ID: ${itinerary.id}, Title: "${itinerary.title}", AuthorID: ${itinerary.authorid}, Author: "${itinerary.username || 'UNKNOWN'}"`);
    });

    console.log('\n=== SUMMARY ===');
    console.log('Total users:', users.length);
    console.log('Total itineraries:', itineraries.length);

    // Check specifically for unknown authors
    const unknownAuthors = itineraries.filter(it => !it.username);
    console.log('Itineraries with unknown authors:', unknownAuthors.length);
    unknownAuthors.forEach(it => {
        console.log(`  - ID: ${it.id}, Title: "${it.title}", AuthorID: ${it.authorid}`);
    });

    await pool.end();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});