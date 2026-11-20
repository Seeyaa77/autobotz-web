# Autobotz - Product Requirements Document (PRD)

**Last Updated:** November 4, 2026  
**Version:** 1.0  
**Author:** Raffli  
**Status:** In Development (MVP Phase)

---

## 1. Executive Summary

**Autobotz** adalah platform SaaS yang menyediakan solusi otomasi bot Telegram untuk penjualan akun. Kami menawarkan 3 model bisnis yang fleksibel untuk memenuhi kebutuhan berbagai segmen pengguna: dari developer yang ingin ownership penuh, hingga entrepreneur yang ingin instant-ready solution.

### Key Value Propositions
- Instant bot deployment tanpa coding
- Secure account management system
- Built-in payment integration
- Analytics & reporting dashboard
- Multi-channel support

---

## 2. Product Overview

### Vision
Memberdayakan small-medium entrepreneurs untuk membangun bisnis jual akun otomatis dengan teknologi yang accessible dan terjangkau.

### Mission
Menyediakan platform bot automation yang powerful, user-friendly, dan profitable.

---

## 3. Target Market & Personas

### Primary Market
- **Digital entrepreneurs** (18-40 tahun)
- **Account resellers** (Instagram, TikTok, Telegram, dll)
- **E-commerce sellers** yang ingin automated fulfillment
- **Gamer accounts** traders
- **SMME** di Indonesia, Malaysia, Filipina

### Secondary Market
- **Software developers** yang ingin learn/experiment
- **Agencies** offering bot services to clients

### Market Size (Estimated)
- Indonesia: ~50K-100K potential users in reseller ecosystem
- SEA region: ~500K+ potential users

---

## 4. Product Offerings (3-Tier Model)

### Tier 1: SCRIPT ONLY (Developer-Focused)

**Target:** Developers, tech-savvy entrepreneurs, agencies

**What They Get:**
- Full source code (100% open)
- Lifetime updates
- Comprehensive API docs
- Setup guide & deployment guide
- Community support (Discord/Forum)
- License: Commercial use allowed

**Pricing:** 300,000 IDR (One-time)

**Delivery:** GitHub repo access + documentation

**Pros:**
- Maximum customization
- Full ownership & control
- No recurring costs
- Can white-label
- Affordable entry point

**Cons:**
- User handles deployment
- User responsible for infrastructure
- Need technical knowledge

**Use Case:**
```
Developer beli script (300K) → Deploy di server sendiri → 
Jalankan bot independently → Keep 100% revenue
```

---

### Tier 2: HOSTING + BOT (Managed Infrastructure)

**Target:** Non-technical entrepreneurs, small-medium businesses

**What They Get:**
- Pre-deployed bot (no code needed)
- Managed VPS infrastructure
- Uptime monitoring (99.9% SLA)
- Automatic backups & disaster recovery
- Analytics dashboard (basic → advanced tier)
- Email support (24h response)
- Auto-scaling (tier dependent)

**Pricing Tiers:**

| Tier | Price/Month | Accounts/Day | Features |
|------|------------|-------------|----------|
| **Starter** | 150,000 IDR | 100 | Basic bot, email support |
| **Professional** | 350,000 IDR | 1,000 | Advanced features, priority support |
| **Enterprise** | 999,000 IDR | Unlimited | Full features, dedicated support |

**Infrastructure Details:**
- Dedicated docker container per user
- Managed VPS (DigitalOcean/Linode)
- Load balancing (Enterprise tier)
- Automatic updates
- Free SSL/TLS

**Pros:**
- No tech knowledge needed
- Instant deployment
- Autobotz handles infrastructure
- Focus on sales, not ops
- Flexible (upgrade/downgrade anytime)

**Cons:**
- Monthly recurring cost
- Dependent on Autobotz infrastructure
- Less customization vs Tier 1

**Use Case:**
```
Entrepreneur rent bot (150K+/bulan) → Bot instantly live →
Focus on selling accounts → Pay only for what they use
```

---

### Tier 3: RENTAL BOT (Full SaaS Platform)

**Target:** Non-technical users, passive income seekers, first-time entrepreneurs

**What They Get:**
- Pre-built bot (fully hosted)
- Custom branding (name, welcome message)
- Dashboard untuk manage accounts
- Built-in payment integration
- Automated account delivery
- Sales analytics & reporting
- Commission-based revenue sharing

**Pricing Tiers:**

| Plan | Price/Month | Accounts/Day | Support | Commission |
|------|------------|-------------|---------|-----------|
| **Starter** | 250,000 IDR | 100 | Email | Autobotz 15% |
| **Professional** | 750,000 IDR | 1,000 | Priority Chat | Autobotz 15% |
| **Enterprise** | 2,500,000 IDR | Unlimited | 24/7 Dedicated | Autobotz 10% |

**Commission Model:**
- Autobotz keep 10-15% dari setiap transaksi penjualan akun
- User keep 85-90% profit
- Transparent, real-time settlement (weekly)

**Pros:**
- Zero technical setup
- Autobotz handles everything
- Lowest barrier to entry
- Fastest revenue start
- 30-day risk-free trial

**Cons:**
- Monthly recurring cost
- Revenue sharing dengan Autobotz
- Limited customization
- Dependent on platform availability

**Use Case:**
```
User rent bot (250K+/bulan) → Instantly operational → 
Start selling accounts → Autobotz take 10-15% commission → 
User keep 85-90% profit
```

---

## 5. Business Model & Monetization

### Revenue Streams

#### Stream 1: Script Sales (One-time)
- Tier 1 Script: **300,000 IDR**
- Expected: 100-200 sales/year → 30M-60M IDR

#### Stream 2: Managed Hosting (Monthly)
- Starter: **150,000 IDR/bulan**
- Professional: **350,000 IDR/bulan**
- Enterprise: **999,000 IDR/bulan**
- Expected: 100-300 users → 180M-1.1B IDR/year

#### Stream 3: Bot Rental (SaaS)
- Starter: **250,000 IDR/bulan**
- Professional: **750,000 IDR/bulan**
- Enterprise: **2,500,000 IDR/bulan**
- Commission: 10-15% per transaction
- Expected: 300-1000+ active users → 900M-36B IDR/year

### Commission Model (Tier 3 Only)
- Autobotz take **10-15% commission** dari setiap transaksi penjualan akun user
- User keep **85-90%** profit
- Transparent, real-time settlement (weekly)
- No hidden fees

---

## 6. Feature Set

### Core Features (All Tiers)
- Bot automation engine
- Account management system
- Payment processing gateway
- Webhook integration
- Rate limiting & anti-spam
- Admin dashboard

### Tier 1 Exclusive
- Full source code access
- API documentation
- Custom deployment guides

### Tier 2 Exclusive
- Managed hosting
- Automatic backups
- Uptime monitoring
- Infrastructure support
- Update management

### Tier 3 Exclusive (Rental)
- Automated account delivery
- Payment split system
- Revenue analytics
- Multi-tier user management
- API for integrations
- White-label capable

---

## 7. Technical Architecture

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (Free tier initially)
- **Pages:** Landing, Login, Register, Payment, Dashboard

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Bot SDK:** Telegraf.js
- **Deployment:** VPS (DigitalOcean/Linode)
- **Container:** Docker
- **API:** REST

### Database
- **Provider:** Supabase (PostgreSQL)
- **Tables:**
  - users
  - subscriptions
  - bot_tokens
  - accounts
  - transactions
  - analytics

### Infrastructure Costs (IDR)
- **Frontend Hosting:** Vercel (Free - 300K/mo pro)
- **Database:** Supabase (Free - 375K/mo pro)
- **Bot Server (VPS):**
  - Option A (Minimal): 2GB = 180K/bulan
  - Option B (Growth): 4GB = 360K/bulan
  - Option C (Scale): 8GB = 720K/bulan
  - Local Alternative: Hosting.co.id 2GB = 150K/bulan
- **Domain:** 200K/tahun
- **SSL:** Free (Let's Encrypt)
- **Monitoring & Backup:** 0K (open source)

---

### Pricing Strategy & Margin Analysis (IDR)

### Development Phase (Current)
```
No VPS yet → Demo dengan landing page
Only showcase pricing tiers & payment flow
No actual bot deployment
Target: Pre-orders collection
```

### MVP Launch (When VPS Ready - Month 3+)
```
Tier 1 (Script Only): 300K
├─ COGS: ~50K (support, hosting script repo)
├─ Margin: ~83%
└─ Revenue/sale: ~250K

Tier 2 (Managed Hosting): 150-999K/mo
├─ COGS: 20-30% (VPS infrastructure cost)
├─ VPS Cost Breakdown:
│  ├─ 2GB VPS: 180K/bulan (20-30 instances)
│  ├─ 4GB VPS: 360K/bulan (50-100 instances)
│  └─ User ratio = 4-6K infrastructure per user
├─ Margin: ~70-80% per user
└─ Lifetime value per user: 1.8M-12M over 12 months

Tier 3 (Rental): 250K-2.5M/mo
├─ Base COGS: 20-30% VPS infrastructure
├─ Commission: 10-15% dari transaksi penjualan user
├─ Margin: ~40-60% per user (after commission)
└─ Lifetime value: 3M-30M per user
```

---

## 9. Go-to-Market Strategy

### Phase 1: MVP & Pre-Launch (Month 1-2)
- [x] Deploy landing page
- [x] Create pricing pages
- [ ] Setup payment integration (Stripe/PayPal/Midtrans)
- [ ] Pre-order collection for Tier 1 (Script)
- Target: 50+ pre-orders (Script sales)

### Phase 2: Soft Launch with Beta (Month 3-4)
- [ ] Deploy bot manager backend
- [ ] Setup VPS infrastructure
- [ ] Launch Tier 2 (Managed Hosting) for beta users
- [ ] Gather user feedback & iterate
- Target: 20-50 users (Tier 2 + Tier 3)

### Phase 3: Public Launch (Month 5+)
- [ ] All 3 tiers live
- [ ] Full marketing push
- [ ] Content marketing
- [ ] Influencer partnerships
- [ ] Affiliate program launch
- Target: 100-300+ active users

### Marketing Channels (Priority)
1. **Telegram Communities** (High conversion)
   - Reseller groups
   - Entrepreneur communities
   - Bot enthusiast communities
   
2. **TikTok/Instagram** (High reach)
   - Short-form tutorials
   - Success stories
   - "Earning potential" content
   
3. **YouTube** (Long-term)
   - Setup guides
   - Case studies
   - Interviews dengan successful users
   
4. **Organic** (Low cost, high value)
   - Reddit (r/passive_income, r/Indonesia, r/SEA)
   - Facebook groups
   - Discord servers
   
5. **Paid** (When validated)
   - Google Ads
   - Facebook Ads
   - Instagram Ads (retargeting)

### Affiliate Program
- Tier 1 (Script): 15% commission per sale
- Tier 2 (Hosting): 20% first month + 5% monthly recurring
- Tier 3 (Rental): 10% lifetime commission
- Expected: 200-500 affiliates → significant organic growth

---

## 10. Competitive Analysis

| Feature | Autobotz | Competitor A | Competitor B |
|---------|----------|--------------|--------------|
| **Entry Price** | 250K/mo (rental) | 500K/mo | 5M+ (no rental) |
| **Setup Time** | 5 minutes | 30 minutes | 2-3 hours |
| **Support** | Email + Chat (Tier 3) | Email only | Community |
| **Customization** | High (all tiers) | Medium | Very high (devs) |
| **Local Support** | Yes (Bahasa Indo) | No | No |
| **Best For** | Everyone | Small teams | Developers |

**Our Competitive Advantage:**
1. **Lowest barrier to entry** (250K/mo rental)
2. **Multiple pricing options** (Script, Hosting, Rental)
3. **Indonesian market focus** (Rupiah, local support)
4. **Fastest setup** (plug & play)
5. **Community-driven** (Discord, Telegram)
6. **Affiliate program** (viral growth potential)

**Market Positioning:**
- **vs Tier 1 Script:** We provide done-for-you alternative
- **vs Enterprise Solutions:** We're 10x cheaper
- **vs International:** Local support in Bahasa Indonesia

---

## 11. Revenue Projection (Year 1) - IDR

### Conservative Estimate
- Tier 1: 100 sales × 300K = 30M
- Tier 2: 50 users × 1.8M/year avg = 90M
- Tier 3: 100 users × 1.5M/year avg = 150M
- **Total Revenue: 270M IDR**

### Moderate Estimate
- Tier 1: 150 sales × 300K = 45M
- Tier 2: 150 users × 3M/year avg = 450M
- Tier 3: 300 users × 3M/year avg = 900M
- **Total Revenue: 1.395B IDR (~$87K USD)**

### Optimistic Estimate
- Tier 1: 200 sales × 300K = 60M
- Tier 2: 300 users × 4M/year avg = 1.2B
- Tier 3: 1000 users × 4M/year avg = 4B
- **Total Revenue: 5.26B IDR (~$330K USD)**

### Operating Costs (Year 1) - IDR
- VPS infrastructure (2GB): 2.16M (180K × 12)
- Supabase (Pro): 4.5M (375K × 12)
- Vercel (Pro): 3.6M (300K × 12)
- Domain & miscellaneous: 2M
- **Total OpEx: ~12.26M IDR**

### Net Profit & Margin
- Conservative: 257.74M IDR (95% margin)
- Moderate: 1.38B IDR (99% margin)
- Optimistic: 5.25B IDR (99.7% margin)

### Per-User Economics (Year 1)

**Tier 2 Starter (150K/bulan):**
- Revenue: 1.8M/user/year
- COGS: 600K/user/year
- Profit: 1.2M/user/year (67% margin)

**Tier 3 Starter (250K/bulan):**
- Revenue: 3M/user/year
- COGS: 1M/user/year (includes commission)
- Profit: 2M/user/year (67% margin)
- Break-even: Month 1-2

---

## 12. Success Metrics & KPIs

### Acquisition
- Monthly sign-ups (target: 50+/month by month 6)
- Cost per acquisition (target: <$10)
- Traffic to landing page (target: 10K+/month)

### Engagement
- Trial completion rate (target: 60%)
- Dashboard DAU (target: 80%+ of users)
- Feature adoption (target: 90%)

### Retention
- Monthly churn rate (target: <5%)
- 30-day retention (target: >90%)
- 90-day retention (target: >70%)

### Revenue
- ARR (Annual Recurring Revenue)
- MRR (Monthly Recurring Revenue)
- Average revenue per user (ARPU)
- Customer lifetime value (LTV)

### Product
- Uptime (target: 99.9%)
- Support response time (target: <4 hours)
- Net Promoter Score (NPS) (target: >50)

---

## 13. Development Roadmap

### MVP (Current - Month 2)
- [x] Landing page
- [x] Login/Register
- [x] Payment page
- [ ] Basic dashboard
- [ ] Bot manager (backend)
- [ ] Supabase integration

### Phase 1 (Month 3-4)
- [ ] User dashboard (full)
- [ ] Account management system
- [ ] Analytics page
- [ ] Payment automation
- [ ] Email notifications
- [ ] API documentation

### Phase 2 (Month 5-6)
- [ ] Advanced analytics
- [ ] Webhook system
- [ ] Custom branding
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Affiliate program

### Phase 3 (Month 7-9)
- [ ] White-label solution
- [ ] Enterprise features
- [ ] Advanced security (2FA, IP whitelist)
- [ ] Backup/restore system
- [ ] Premium support tiers

---

## 14. Risk Analysis & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|-----------|
| **VPS downtime** | High | Medium | Use managed VPS, auto-scaling, monitoring |
| **API rate limits** | High | Low | Cache implementation, queue system |
| **User churn** | High | Medium | Better onboarding, support, features |
| **Competition** | Medium | High | Differentiation, community, pricing |
| **Scaling issues** | High | Medium | Load balancing, database optimization |
| **Account bans** | High | Low | Clear TOS, user education, monitoring |

---

## 15. Call to Action & Next Steps

### For Development Team
1. Setup Supabase database schema
2. Create backend bot manager (Node.js)
3. Build dashboard UI
4. Integrate payment gateway (Stripe/PayPal)
5. Test with beta users

### For Marketing Team
1. Create content calendar
2. Setup social media profiles
3. Write blog posts
4. Create tutorial videos
5. Build landing page copy

### Timeline

**Current (Week 1-2):**
- [x] Landing page ✓
- [x] Auth system (login/register) ✓
- [x] Payment page UI ✓
- [ ] PRD finalization ← You are here

**Month 2 (Week 3-6):**
- [ ] Payment integration (Midtrans/Stripe)
- [ ] Supabase schema & setup
- [ ] Bot manager backend (Node.js)
- [ ] Docker configuration
- [ ] Pre-order system (Tier 1)

**Month 3-4 (Week 7-12):**
- [ ] Dashboard development
- [ ] VPS setup (DigitalOcean/Linode)
- [ ] Tier 2 beta launch (limited users)
- [ ] Testing & iteration
- [ ] Support system setup

**Month 5+ (Week 13+):**
- [ ] Full Tier 2 & Tier 3 launch
- [ ] Marketing campaign
- [ ] Affiliate program
- [ ] Community building
- [ ] Iteration based on feedback

---

## 16. Conclusion

Autobotz positioning diri sebagai **most affordable dan accessible bot automation platform** di Asia Tenggara dengan 3 tier yang memenuhi kebutuhan berbagai segmen. Dengan fokus pada user experience dan community building, kami yakin bisa capture significant market share dalam 12 bulan pertama.

**Success depends on:**
- Quick MVP launch
- Strong user feedback loop
- Community engagement
- Consistent product improvements
- Aggressive marketing (organic + paid)

---

**Document Created:** 4 November 2026  
**Next Review:** 11 November 2026  
**Status:** Ready for Development
