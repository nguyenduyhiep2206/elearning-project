# 🔐 Secrets Directory

## ⚠️ CẢNH BÁO
Thư mục này chứa các file secrets. **KHÔNG BAO GIỜ** commit lên Git!

## Cách tạo secrets

Tạo các file sau với nội dung thực của bạn:

```bash
# 1. Database password
echo "YourSecurePassword123!" > db-password.txt

# 2. JWT Secret (tạo random)
openssl rand -base64 64 > jwt-secret.txt

# 3. API Key
echo "your-api-key-here" > api-key.txt
```

## Cách sử dụng trong code

```javascript
const fs = require('fs');

function getSecret(name) {
  const path = `/run/secrets/${name}`;
  return fs.readFileSync(path, 'utf8').trim();
}

const dbPassword = getSecret('db-password');
```

## Best Practices

1. ✅ Luôn thêm vào `.gitignore`
2. ✅ Sử dụng permissions 600 (chỉ owner đọc được)
3. ✅ Rotate secrets định kỳ
4. ✅ Sử dụng secrets manager cho production (Vault, AWS Secrets Manager)

