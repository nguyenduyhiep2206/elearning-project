/**
 * Script để chạy database migrations
 * Usage: node run-migration.js
 */

const sequelize = require('./src/config/db.config');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Đang chạy migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations/001_enable_search_extensions.sql'),
      'utf8'
    );
    
    // Chạy từng câu lệnh SQL
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sequelize.query(statement);
        console.log('✅ Đã chạy:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📝 Extensions đã được enable:');
    console.log('   - pg_trgm (Trigram Matching)');
    console.log('   - unaccent (Text Normalization)');
    console.log('📊 Indexes đã được tạo để tối ưu tìm kiếm');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Kiểm tra xem extensions đã được enable chưa
    if (error.message.includes('already exists')) {
      console.log('⚠️  Extensions có thể đã được enable trước đó');
    }
    
    await sequelize.close();
    process.exit(1);
  }
}

runMigration();

