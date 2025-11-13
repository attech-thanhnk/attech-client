# CI/CD Setup - Frontend ATTECH

## 🎯 Tổng quan

CI/CD cho **Frontend only**. Backend quản lý riêng.

**Quy trình:**
```
Sửa code → Git push → GitHub Actions tự động build & deploy
```

---

## 📋 Các bước Setup (LẦN ĐẦU)

### **Bước 1: Setup GitHub Secrets**

Vào: `https://github.com/attech-thanhnk/attech-client/settings/secrets/actions`

Thêm **3 secrets** bắt buộc:

| Secret Name | Giá trị | Ví dụ |
|-------------|---------|-------|
| `SERVER_HOST` | IP/domain server | `192.168.1.100` |
| `SERVER_USER` | Username SSH | `root` |
| `SSH_PRIVATE_KEY` | Private SSH key | Nội dung file `~/.ssh/id_rsa` |

**Cách lấy SSH Private Key:**
```bash
cat ~/.ssh/id_rsa
```
Copy TOÀN BỘ (từ `-----BEGIN` đến `-----END-----`)

---

### **Bước 2: Push code lên GitHub**

```bash
# Commit files mới
git add .
git commit -m "Setup CI/CD for frontend"

# Push lên repo mới
git push origin main
```

→ GitHub Actions sẽ **TỰ ĐỘNG** build & deploy!

---

## 🚀 Sử dụng hàng ngày

### **Development (Code thường ngày)**

```bash
npm start
```
→ Mở `http://localhost:3000`
→ Sửa code → Tự động reload

### **Test trước khi deploy**

```bash
npm run build
npx serve -s build -p 5000
```
→ Mở `http://localhost:5000`
→ Test giống production

### **Deploy lên server**

```bash
git add .
git commit -m "Update feature X"
git push origin main
```

→ **Xong!** GitHub Actions tự động làm phần còn lại.

---

## 📊 Xem tiến độ Deploy

### **Xem logs GitHub Actions:**
`https://github.com/attech-thanhnk/attech-client/actions`

### **Xem logs trên server:**
```bash
ssh user@server-ip
docker logs -f attechserver-frontend
```

---

## ⚙️ Development với Docker (Tùy chọn)

Nếu muốn dev giống production:

```bash
docker-compose -f docker-compose.dev.yml up frontend-dev
```

→ Mở `http://localhost:3000`

---

## 🔄 Rollback (Quay lại code cũ)

### **Cách 1: Rollback bằng Git**
```bash
git log --oneline              # Xem lịch sử
git revert <commit-hash>       # Rollback
git push origin main           # Deploy auto
```

### **Cách 2: Chạy image cũ trên server**
```bash
ssh user@server-ip

docker stop attechserver-frontend
docker rm attechserver-frontend

# Chạy image cũ (thay <commit-hash>)
docker run -d \
  --name attechserver-frontend \
  --network attechserver_attech-network \
  --restart unless-stopped \
  ghcr.io/attech-thanhnk/attech-client:<commit-hash>
```

---

## ❓ Troubleshooting

### **Lỗi: Build Docker quá lâu**
- Lần đầu: ~5-7 phút (cài dependencies)
- Lần sau: ~2-3 phút (có cache)

### **Lỗi: SSH connection failed**
```bash
# Kiểm tra SSH key
ssh user@server-ip

# Nếu lỗi, thêm key mới:
ssh-keygen -t rsa -b 4096
ssh-copy-id user@server-ip
```

### **Lỗi: Container không start**
```bash
# SSH vào server, xem logs
docker logs attechserver-frontend

# Kiểm tra network
docker network ls | grep attech
```

---

## 📁 Files đã tạo

- `.github/workflows/deploy-frontend.yml` - CI/CD workflow
- `docker-compose.dev.yml` - Development setup
- `README-CICD.md` - Tài liệu này

---

## ✅ Tóm tắt

### **Lần đầu:**
1. Setup GitHub Secrets (3 secrets)
2. Push code lên GitHub
3. Xong!

### **Hàng ngày:**
```bash
npm start           # Dev
git push            # Deploy
```

**Đơn giản vậy thôi!** 🎉
