# Walrus & Seal Integration Guide

## 🔍 Walrus & Seal Overview

### 1. Walrus & Seal là gì?

**Walrus**: Nền tảng lưu trữ dữ liệu phi tập trung, đảm bảo tính sẵn sàng và toàn vẹn dữ liệu.

**Seal**: Lớp mã hóa và kiểm soát truy cập onchain, cho phép:
- Mã hóa dữ liệu (threshold encryption)
- Định nghĩa ai có quyền giải mã, khi nào và theo điều kiện nào
- Access policies: token-gated, time-locked, role-based, v.v.

### 2. Cách hoạt động

```
User Data
    ↓
Seal Encryption (Threshold Encryption + Access Policy)
    ↓
Walrus Storage (Decentralized)
    ↓
Only authorized users can decrypt (via Seal)
```

**Flow:**
1. Dữ liệu được mã hóa bằng **Seal** trước khi upload
2. Seal cho phép tạo **access policies** (token-gated, time-locked, role-based)
3. Dữ liệu sau khi mã hóa được lưu trữ trên **Walrus**
4. Chỉ người có quyền mới giải mã được (qua Seal onchain)

---

## 💰 Giá Lưu Trữ

### Walrus Storage Pricing

**Giá phụ thuộc vào:**
1. **Kích thước file** (blob size)
2. **Số epoch** (thời gian lưu trữ)
3. **Storage option**: Standard hoặc **Quilt** (rẻ hơn nhiều!)

### Pricing Examples (Testnet - Tham khảo)

| Kích thước blob | Giá Standard (WAL) | Giá Quilt (WAL) | Tiết kiệm |
|-----------------|---------------------|-----------------|-----------|
| 10KB | 2.088 WAL | **0.005 WAL** | **409x** |
| 100KB | 2.088 WAL | **0.020 WAL** | **104x** |
| 1MB | 2.208 WAL | **0.170 WAL** | **13x** |

**💡 Key Insight: Quilt option rẻ hơn rất nhiều!**

### Seal Encryption Costs

**Seal không tính phí lưu trữ**, chỉ phát sinh:
- **Gas fees** cho onchain operations:
  - Tạo access policy
  - Giải mã dữ liệu
  - Update policy
  - Revoke access

**Gas fees**: Thường rất nhỏ (~$0.001-0.01 per operation)

### Cost Breakdown cho Note-Taking App

**Per Page (Average 10-50KB):**
- **Storage (Quilt)**: 0.005-0.020 WAL (~$0.0001-0.0004)
- **Encryption (Seal gas)**: ~$0.001-0.01
- **Total per page**: ~$0.001-0.01

**Per User (1,000 pages = 10-50MB):**
- **Storage**: 0.5-2 WAL (~$0.01-0.04)
- **Encryption**: ~$1-10 (gas fees)
- **Total**: ~$1-10/year

**Comparison với Notion Pro:**
- Notion Pro: $10/month = $120/year per user
- Walrus + Seal: ~$1-10/year per user
- **Rẻ hơn 12-120x!**

### Kiểm Tra Giá Thực Tế

**CLI Commands:**
```bash
# Check pricing before upload
walrus store <FILENAME> --dry-run

# Xem giá hiện tại
walrus info
```

**Lưu ý**: Giá thực tế trên Mainnet có thể thay đổi. Nên kiểm tra trước khi upload.

---

## ⏰ Thời Gian Lưu Trữ

**Flexible Duration:**
- Chọn số epoch khi upload
- Giá tăng theo thời gian lưu trữ
- Có thể chọn ngắn hạn hoặc dài hạn
- **Auto-renewal**: Setup để tự động gia hạn

**Epoch**: 14 days

**Ví dụ:**
- 1 epoch (14 days): Giá thấp nhất
- 52 epochs (2 years): Giá cao hơn nhưng vẫn rẻ
- **Recommendation**: 1-2 years cho secure pages

---

## 🛠️ Integration Strategy

### Architecture

```typescript
// Install SDKs
npm install @walrus-protocol/sdk @seal-protocol/sdk

// Initialize clients
import { WalrusClient } from '@walrus-protocol/sdk';
import { SealClient } from '@seal-protocol/sdk';

const walrus = new WalrusClient({
  network: 'mainnet', // or 'testnet'
  privateKey: process.env.WALRUS_PRIVATE_KEY,
});

const seal = new SealClient({
  network: 'mainnet',
  privateKey: process.env.SEAL_PRIVATE_KEY,
});
```

### Upload Secure Page

```typescript
async function uploadSecurePage(
  content: string,
  userId: string,
  accessPolicy: AccessPolicy,
) {
  // 1. Encrypt với Seal (threshold encryption)
  const encrypted = await seal.encrypt({
    data: content,
    policy: accessPolicy,
  });
  
  // 2. Upload encrypted data to Walrus (Quilt option)
  const result = await walrus.upload({
    data: encrypted,
    duration: 52, // epochs (2 years)
    storage: 'quilt', // Use Quilt for cheaper storage
    autoRenew: true,
  });
  
  // 3. Store metadata in database
  return {
    cid: result.cid,
    policyId: encrypted.policyId,
    expiryDate: result.expiryDate,
  };
}
```

### Retrieve Secure Page

```typescript
async function retrieveSecurePage(
  cid: string,
  policyId: string,
  userId: string,
) {
  // 1. Check access permission (Seal onchain)
  const hasAccess = await seal.checkAccess({
    policyId,
    userId,
  });
  
  if (!hasAccess) {
    throw new Error('Access denied');
  }
  
  // 2. Retrieve from Walrus
  const encrypted = await walrus.retrieve(cid);
  
  // 3. Decrypt với Seal (onchain operation)
  const content = await seal.decrypt({
    encrypted,
    policyId,
    userId,
  });
  
  return content;
}
```

### Access Policy Examples

```typescript
// User-only access
const userOnlyPolicy = {
  type: 'role-based',
  roles: [userId],
};

// Time-locked (chỉ access trong 1 năm)
const timeLockedPolicy = {
  type: 'time-locked',
  startTime: Date.now(),
  endTime: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  roles: [userId],
};

// Token-gated (cần token để access)
const tokenGatedPolicy = {
  type: 'token-gated',
  token: 'WAL',
  amount: 100,
  roles: [userId],
};
```

---

## 📊 Competitive Advantage

### vs Notion Pro:

| Feature | Notion Pro | Our App (Walrus + Seal) |
|---------|------------|-------------------------|
| **Price** | $10/month | $5-8/month |
| **Storage Cost** | Included | ~$1-10/user/year |
| **E2E Encryption** | ❌ No | ✅ Seal threshold encryption |
| **Access Control** | ❌ Basic | ✅ Flexible policies |
| **Decentralized** | ❌ No | ✅ Yes |
| **Data Ownership** | ❌ No | ✅ Yes |

### Key Messages:

1. **"99% cheaper storage than Notion"**
2. **"More secure with Seal encryption"**
3. **"Flexible access control"**
4. **"Your data, your control"**

---

## 📚 Resources

### Official Documentation
- **Walrus Docs**: [Data Security](https://docs.walrus.xyz/data-security)
- **Seal SDK**: [Seal SDK Documentation](https://docs.seal.xyz)
- **Blog**: [Seal Brings Data Access Control to Walrus](https://blog.walrus.xyz/seal-access-control)

### CLI Commands

**Check pricing:**
```bash
walrus store <FILENAME> --dry-run
walrus info  # Xem giá hiện tại
```

**Upload với Seal:**
```bash
seal encrypt <FILE> --policy <POLICY>
walrus store <ENCRYPTED_FILE> --storage quilt
```

---

## 🎯 Conclusion

**Walrus + Seal là lựa chọn tốt nhất cho Secure Mode:**

1. ✅ **Cost**: Quilt option rẻ hơn 409x cho 10KB
2. ✅ **Security**: Seal threshold encryption + access policies
3. ✅ **Flexibility**: Time-locked, token-gated, role-based access
4. ✅ **Competitive**: Rẻ hơn Notion Pro 12-120x

**Recommendation**: 
- **Seal**: Encryption layer với access policies
- **Walrus (Quilt)**: Storage layer (cheapest option)
- **Traditional Mode**: PostgreSQL (free, fast)
- **Hybrid approach**: Best of both worlds

