# Image Hardening Demo - E-Learning Backend

## Muc dich
So sanh Dockerfile **KHONG AN TOAN** vs **DA HARDENING** cho project e-learning

## Cac van de trong Dockerfile.insecure

| # | Van de | Rui ro |
|---|--------|--------|
| 1 | Dung `node:20` (full image) | Image ~1GB, chua 50+ CVE |
| 2 | Khong tao non-root user | Attacker co quyen root |
| 3 | `COPY . .` copy tat ca | Lo .env, .git, secrets |
| 4 | `npm install` khong --omit=dev | Cai them devDependencies |
| 5 | Khong set NODE_ENV | Debug mode trong production |
| 6 | Khong co HEALTHCHECK | Khong detect container fail |
| 7 | Chay voi root user | Privilege escalation |

## Cach build va test

```bash
# Build insecure image
docker build -f Dockerfile.insecure -t elearning:insecure ../../elearning-backend

# Build secure image
docker build -f Dockerfile.secure -t elearning:secure ../../elearning-backend

# Kiem tra kich thuoc
docker images | findstr elearning

# Kiem tra user dang chay
docker run --rm elearning:insecure whoami   # root
docker run --rm elearning:secure whoami     # appuser

# Scan lo hong
trivy image --severity HIGH,CRITICAL elearning:insecure
trivy image --severity HIGH,CRITICAL elearning:secure
```

## Ket qua mong doi

| Metric | Insecure | Secure |
|--------|----------|--------|
| Image size | ~1.5GB | ~200MB |
| User | root | appuser |
| CVE | 50+ | 5-10 |
