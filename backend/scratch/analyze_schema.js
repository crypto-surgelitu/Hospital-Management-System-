require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../src/config/db');

async function analyzeSchema() {
  try {
    console.log('--- TABLES ---');
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    for (const tableName of tableNames) {
      console.log(`\nTABLE: ${tableName}`);
      const [columns] = await pool.query(`DESCRIBE ${tableName}`);
      columns.forEach(c => {
        console.log(`  - ${c.Field} (${c.Type}) ${c.Key === 'PRI' ? '[PK]' : ''} ${c.Key === 'MUL' ? '[INDEX]' : ''}`);
      });
      
      // Check for foreign keys
      const [fks] = await pool.query(`
        SELECT 
          COLUMN_NAME, 
          REFERENCED_TABLE_NAME, 
          REFERENCED_COLUMN_NAME 
        FROM 
          INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE 
          TABLE_NAME = ? AND 
          TABLE_SCHEMA = ? AND 
          REFERENCED_TABLE_NAME IS NOT NULL
      `, [tableName, process.env.DB_NAME]);
      
      if (fks.length > 0) {
        console.log('  RELATIONS:');
        fks.forEach(fk => {
          console.log(`    - ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`);
        });
      }
    }
  } catch (error) {
    console.error('Analysis failed:', error.message);
  } finally {
    process.exit();
  }
}

analyzeSchema();
