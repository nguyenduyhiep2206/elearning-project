# 🔐 Secret Management Demo

## Mục đích
Demo sự khác biệt giữa cách quản lý secrets **KHÔNG AN TOÀN** vs **AN TOÀN**

## So sánh

| Aspect | Insecure | Secure |
|--------|----------|--------|
| Lưu trữ | Plain text trong compose | File riêng, mount vào RAM |
| `docker inspect` | ❌ Thấy secrets | ✅ Không thấy |
| Git history | ❌ Lộ nếu commit | ✅ File trong .gitignore |
| Logs | ❌ Có thể log ra | ✅ Không log |
| Rotation | ❌ Phải rebuild | ✅ Chỉ thay file |

## Demo Commands

### 1. Chạy version KHÔNG an toàn
```bash
cd 2-secret-management
docker-compose -f docker-compose.insecure.yml up -d

# Xem secrets bị lộ trong inspect
docker inspect insecure-backend | findstr "DB_PASSWORD"
# Output: DB_PASSWORD=super_secret_password_123 ❌
```

### 2. Chạy version AN TOÀN
```bash
docker-compose -f docker-compose.secure.yml up -d

# Xem - không có secret values trong inspect
docker inspect secure-backend | findstr "DB_PASSWORD"
# Output: DB_PASSWORD_FILE=/run/secrets/db-password ✅

# Secrets được mount vào container
docker exec secure-backend cat /run/secrets/db-password
# Output: MySecureDbPassword@2024!
```

### 3. Test API
```bash
# Insecure version
curl http://localhost:3001/secrets-check

# Secure version  
curl http://localhost:3002/secrets-check
```

## Kết luận

**Docker Secrets** cung cấp:
1. 🔒 Mã hóa secrets at rest
2. 📁 Mount vào RAM (tmpfs), không ghi disk
3. 🔑 Chỉ container được authorize mới đọc được
4. 🔄 Dễ dàng rotate không cần rebuild

