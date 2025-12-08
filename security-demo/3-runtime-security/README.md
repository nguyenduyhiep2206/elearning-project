# 🛡️ Runtime Security Demo

## Mục đích
Demo các kỹ thuật bảo mật container khi chạy (runtime)

## Các kỹ thuật được demo

### 1. Network Isolation (Phân tách mạng)

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     frontend-net                             │
│  ┌─────────────┐       ┌─────────────┐                      │
│  │  Frontend   │◄─────►│   Backend   │                      │
│  │  (nginx)    │       │  (node.js)  │                      │
│  └─────────────┘       └──────┬──────┘                      │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  backend-net (INTERNAL)                      │
│                  ❌ NO INTERNET ACCESS                       │
│  ┌─────────────┐       ┌─────────────┐                      │
│  │   Backend   │◄─────►│  Database   │                      │
│  │  (node.js)  │       │ (postgres)  │                      │
│  └─────────────┘       └─────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

**Lợi ích:**
- Database không thể bị truy cập từ internet
- Nếu frontend bị hack, không thể trực tiếp access database
- Giảm attack surface

### 2. Resource Limits (Giới hạn tài nguyên)

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'      # Max 50% CPU
      memory: 512M     # Max 512MB RAM
```

**Lợi ích:**
- Ngăn DoS attacks (resource exhaustion)
- Container không thể chiếm hết tài nguyên host
- Đảm bảo fair sharing giữa các containers

### 3. Read-only Filesystem

```yaml
read_only: true
tmpfs:
  - /tmp:size=64M
```

**Lợi ích:**
- Attacker không thể ghi malware vào filesystem
- Không thể modify application code
- Chỉ /tmp được ghi (và giới hạn 64MB)

### 4. Drop Capabilities

```yaml
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE
```

**Lợi ích:**
- Giảm quyền của container xuống tối thiểu
- Ngay cả khi escape container, quyền hạn rất ít
- Principle of Least Privilege

### 5. No New Privileges

```yaml
security_opt:
  - no-new-privileges:true
```

**Lợi ích:**
- Ngăn privilege escalation
- Processes không thể gain thêm quyền
- Block setuid/setgid binaries

## Demo Commands

```bash
# 1. Start all services
docker-compose -f docker-compose.full-security.yml up -d

# 2. Verify network isolation
# Database không có port mapping - không thể access từ ngoài
docker port secure-database
# Output: (empty) ✅

# 3. Verify resource limits
docker stats --no-stream
# Output: Thấy giới hạn CPU/Memory

# 4. Test read-only filesystem
docker exec secure-backend-full touch /app/test.txt
# Output: Read-only file system ✅

docker exec secure-backend-full touch /tmp/test.txt
# Output: (success - /tmp is writable) ✅

# 5. Check security options
docker inspect secure-backend-full | findstr "no-new-privileges"
# Output: "no-new-privileges": true ✅

# 6. Test internal network
docker exec secure-database ping google.com
# Output: Timeout (no internet access) ✅
```

## Bảng so sánh

| Security Feature | Không có | Có |
|-----------------|----------|-----|
| Network Isolation | DB exposed | DB internal only |
| Resource Limits | Unlimited | CPU 0.5, RAM 512M |
| Read-only FS | Writable | Read-only + tmpfs |
| Capabilities | All | Only NET_BIND |
| Privilege Escalation | Possible | Blocked |

