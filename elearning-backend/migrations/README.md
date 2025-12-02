# Database Migrations

## Cách chạy migrations

### 1. Enable Extensions cho Advanced Search

Chạy file SQL để enable các extensions cần thiết:

```bash
# Kết nối vào PostgreSQL database
psql -h <host> -U <user> -d <database>

# Hoặc sử dụng connection string từ .env
psql $DATABASE_URL

# Chạy migration
\i migrations/001_enable_search_extensions.sql
```

### 2. Hoặc chạy từ Node.js

Tạo script để chạy migration tự động:

```javascript
// run-migration.js
const sequelize = require('./src/config/db.config');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations/001_enable_search_extensions.sql'),
      'utf8'
    );
    
    await sequelize.query(migrationSQL);
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
```

Chạy: `node run-migration.js`

## Extensions được enable

1. **pg_trgm**: Extension cho Trigram Matching (fuzzy search)
2. **unaccent**: Extension cho Text Normalization (bỏ dấu tiếng Việt)

## Indexes được tạo

1. `idx_courses_coursename_trgm`: GIN index cho tìm kiếm tên khóa học
2. `idx_courses_description_trgm`: GIN index cho tìm kiếm mô tả
3. `idx_courses_search_composite`: Composite index cho tối ưu tìm kiếm

