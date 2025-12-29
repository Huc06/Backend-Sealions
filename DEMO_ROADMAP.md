# 🚀 Demo & Pitching Roadmap

## 📊 Current Status

### ✅ Đã Hoàn Thành (100%)
- [x] **Core Features**: Pages, Blocks, Sharing, Collaboration
- [x] **Real-time Collaboration**: WebSocket với Socket.io
- [x] **Share by Email**: Share pages bằng email
- [x] **Dual-Mode Schema**: Database schema cho TRADITIONAL & SECURE modes
- [x] **Walrus Pricing Service**: Tính giá storage (API ready)
- [x] **Password Reminder**: Security best practices
- [x] **File Upload**: Cloudinary integration

### ⚠️ Cần Implement Cho Demo (Critical Path)

## 🎯 Milestones Cho Demo/Pitching

### **Milestone 1: Secure Mode Basic Flow** ⏱️ ~2-3 days
**Priority: 🔴 CRITICAL - Must have for demo**

#### 1.1 Walrus & Seal SDK Integration
- [ ] Install Walrus SDK: `@walrus-protocol/sdk`
- [ ] Install Seal SDK: `@seal-protocol/sdk`
- [ ] Setup environment variables (private keys, network)
- [ ] Create `walrus.service.ts` với basic upload/retrieve
- [ ] Create `seal.service.ts` với encrypt/decrypt

**Files to create:**
- `src/walrus/walrus-storage.service.ts`
- `src/seal/seal-encryption.service.ts`
- `src/seal/seal.module.ts`

#### 1.2 Page Mode Switching API
- [ ] `POST /pages/:id/convert-to-secure` - Convert TRADITIONAL → SECURE
  - Encrypt page content với Seal
  - Upload encrypted data to Walrus
  - Update page mode + metadata (CID, policyId, expiryDate, cost)
- [ ] `POST /pages/:id/convert-to-traditional` - Convert SECURE → TRADITIONAL
  - Download from Walrus
  - Decrypt với Seal
  - Save to PostgreSQL
  - Update page mode

**Files to modify:**
- `src/pages/pages.service.ts` - Add conversion methods
- `src/pages/pages.controller.ts` - Add conversion endpoints

#### 1.3 Secure Page CRUD
- [ ] **Create**: `POST /pages` với `mode: "SECURE"`
  - Encrypt blocks trước khi save
  - Upload to Walrus
  - Save metadata only to DB
- [ ] **Read**: `GET /pages/:id` (SECURE mode)
  - Check access permission (Seal)
  - Download from Walrus
  - Decrypt với Seal
  - Return decrypted content
- [ ] **Update**: `PATCH /pages/:id` (SECURE mode)
  - Encrypt updated content
  - Update on Walrus
- [ ] **Delete**: `DELETE /pages/:id` (SECURE mode)
  - Revoke access (Seal)
  - Optionally delete from Walrus

**Files to modify:**
- `src/pages/pages.service.ts` - Add secure mode logic
- `src/blocks/blocks.service.ts` - Handle encryption for blocks

---

### **Milestone 2: Pricing & Storage Management** ⏱️ ~1 day
**Priority: 🟡 HIGH - Important for pitching**

#### 2.1 Enhanced Pricing Display
- [ ] `GET /pages/:id/storage-info` - Get storage info cho secure page
  - Current cost
  - Expiry date
  - Remaining time
  - Renewal options
- [ ] `POST /pages/:id/renew-storage` - Renew storage
  - Calculate new cost
  - Extend expiry date
  - Update Walrus storage

#### 2.2 Storage Dashboard
- [ ] `GET /walrus/storage-summary` - User's total storage
  - Total pages in SECURE mode
  - Total cost
  - Total storage size
  - Expiring soon alerts

---

### **Milestone 3: Access Control & Policies** ⏱️ ~1-2 days
**Priority: 🟡 HIGH - Differentiator feature**

#### 3.1 Access Policy Management
- [ ] `POST /pages/:id/access-policy` - Set access policy
  - User-only access
  - Time-locked (expiry date)
  - Token-gated (optional)
- [ ] `GET /pages/:id/access-policy` - Get current policy
- [ ] `PATCH /pages/:id/access-policy` - Update policy
- [ ] `POST /pages/:id/grant-access` - Grant access to another user
- [ ] `POST /pages/:id/revoke-access` - Revoke access

**Files to create:**
- `src/seal/access-policy.service.ts`
- `src/seal/dto/access-policy.dto.ts`

---

### **Milestone 4: Demo Data & Scenarios** ⏱️ ~0.5 day
**Priority: 🟢 MEDIUM - Nice to have**

#### 4.1 Demo Scripts
- [ ] Create sample secure pages
- [ ] Create comparison demo (Traditional vs Secure)
- [ ] Create pricing comparison demo
- [ ] Create access control demo

#### 4.2 Documentation
- [ ] Update README với Secure Mode instructions
- [ ] Create demo guide
- [ ] Create pitching deck outline

---

## 📈 Timeline Estimate

### **Fast Track (MVP for Demo):** 4-5 days
- ✅ Milestone 1: Secure Mode Basic Flow (2-3 days)
- ✅ Milestone 2: Pricing & Storage (1 day)
- ✅ Milestone 4: Demo Data (0.5 day)

**Total: ~4-5 days để có working demo**

### **Full Feature (Complete Pitching):** 6-7 days
- ✅ All milestones above
- ✅ Milestone 3: Access Control (1-2 days)

**Total: ~6-7 days để có complete feature set**

---

## 🎯 Demo Scenarios

### Scenario 1: Traditional → Secure Conversion
1. User creates page in Traditional mode
2. User adds sensitive content
3. User clicks "Upgrade to Secure Mode"
4. System shows pricing (e.g., "0.005 WAL for 2 years")
5. User confirms
6. Page encrypted & uploaded to Walrus
7. Page now shows "🔒 Secure Mode" badge

### Scenario 2: Secure Page Creation
1. User creates new page
2. User selects "Secure Mode" toggle
3. User sees pricing preview
4. User creates page
5. All content encrypted before save
6. Only metadata stored in DB

### Scenario 3: Access Control Demo
1. User creates secure page
2. User sets time-locked policy (1 year)
3. User grants access to collaborator
4. Collaborator can decrypt & view
5. After 1 year, access automatically revoked

### Scenario 4: Cost Comparison
1. Show: "Notion Pro: $10/month"
2. Show: "Our Secure Mode: $0.01/year"
3. Show: "99% cheaper!"

---

## 🔧 Technical Implementation Order

### Phase 1: Foundation (Day 1-2)
1. Install & configure Walrus SDK
2. Install & configure Seal SDK
3. Create basic services (upload, encrypt, decrypt)
4. Test với simple data

### Phase 2: Integration (Day 2-3)
1. Integrate vào Pages service
2. Add mode switching endpoints
3. Update CRUD operations for secure mode
4. Test end-to-end flow

### Phase 3: Polish (Day 3-4)
1. Add pricing integration
2. Add storage management
3. Add error handling
4. Add logging

### Phase 4: Demo Prep (Day 4-5)
1. Create demo data
2. Create demo scripts
3. Test all scenarios
4. Prepare documentation

---

## 📝 Key Files to Create/Modify

### New Files:
```
src/walrus/
  ├── walrus-storage.service.ts    # Walrus upload/retrieve
  └── walrus.module.ts             # Update existing

src/seal/
  ├── seal-encryption.service.ts   # Seal encrypt/decrypt
  ├── access-policy.service.ts     # Access policy management
  ├── dto/
  │   └── access-policy.dto.ts
  └── seal.module.ts

src/pages/
  ├── dto/
  │   ├── convert-page-mode.dto.ts
  │   └── storage-info.dto.ts
```

### Files to Modify:
```
src/pages/
  ├── pages.service.ts             # Add secure mode logic
  └── pages.controller.ts          # Add conversion endpoints

src/blocks/
  └── blocks.service.ts            # Handle encryption

src/app.module.ts                  # Import Seal module
```

---

## 🚨 Risks & Mitigations

### Risk 1: Walrus/Seal SDK Complexity
- **Mitigation**: Start với simple test, then integrate
- **Fallback**: Mock implementation for demo

### Risk 2: Encryption Performance
- **Mitigation**: Client-side encryption (faster)
- **Fallback**: Show pricing/flow without actual encryption

### Risk 3: Network Issues
- **Mitigation**: Add retry logic, error handling
- **Fallback**: Demo với mock data

---

## ✅ Success Criteria for Demo

1. ✅ User can create page in Secure Mode
2. ✅ User can convert Traditional → Secure
3. ✅ Pricing is displayed correctly
4. ✅ Secure pages can be read (decrypted)
5. ✅ Access control works (basic)
6. ✅ Cost comparison shows (vs Notion)

---

## 🎤 Pitching Points

1. **"99% Cheaper than Notion Pro"**
   - Notion: $10/month = $120/year
   - Our Secure Mode: ~$1-10/year

2. **"End-to-End Encryption"**
   - Seal threshold encryption
   - Your data, your control

3. **"Flexible Access Control"**
   - Time-locked, token-gated, role-based
   - Onchain access policies

4. **"Best of Both Worlds"**
   - Traditional mode: Fast, free, collaborative
   - Secure mode: Encrypted, decentralized, cheap

---

## 📞 Next Steps

1. **Decide on timeline**: Fast track (4-5 days) or Full (6-7 days)
2. **Start with Milestone 1**: Secure Mode Basic Flow
3. **Test incrementally**: Each feature before moving on
4. **Prepare demo data**: Once basic flow works

**Ready to start? Let's begin with Milestone 1! 🚀**

