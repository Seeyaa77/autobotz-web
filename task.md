# AUTOBOTZ Web Platform - Task List & Development Roadmap

**Project:** Sewa & Beli Script Bot Telegram Jual-Beli Akun Otomatis  
**Design System:** Neo-Brutalist Tech (Vibrant, Bold, High-Contrast)  
**Start Date:** 2026-11-04

---

## PHASE 1: PROJECT SETUP & INFRASTRUCTURE ✓

- [x] Initialize Vite + React project structure
- [x] Configure Tailwind CSS dengan brand color palette
- [x] Setup PostCSS & Autoprefixer
- [x] Create .gitignore & package.json
- [x] Setup vite.config.js
- [x] Create index.html template
- [ ] Initialize git repository
- [ ] Setup GitHub/GitLab remote

---

## PHASE 2: CORE COMPONENT LIBRARY (Priority: HIGH) ✓

### 2.1 - Base Components
- [x] **Button Component** (Primary, Secondary, Ghost variants)
  - Neo-brutalist shadows with smooth transitions
  - Active/hover states dengan animate translate
  - Sizes: sm, md, lg
  - Full width & block modes

- [x] **Card Component**
  - 2px solid dark border
  - Shadow dengan hover animation
  - Padding & spacing presets

- [x] **Badge / Sticker Component**
  - Color variants: success (mint), warning (amber), info (blue), pink
  - Space Grotesk font, uppercase, bold
  - Preset badges untuk categorization

- [x] **Input Component**
  - Text, email, password variants
  - Dark border styling
  - Focus state dengan pink ring effect

- [x] **Header / Navigation**
  - Logo "Autobotz" dengan Matcha Style font
  - Nav links: Features, Pricing, FAQ, Contact
  - CTA button: "Get Started"
  - Mobile hamburger menu responsive

- [x] **Footer**
  - Links: Terms, Privacy, GitHub, Contact
  - Social links: Telegram, Discord, Twitter, GitHub
  - Copyright & version info
  - Staggered fade-in animations

### 2.2 - Layout Components ✓

- [ ] **Container / Grid Layout**
  - max-w-6xl, responsive padding
  - 12-col grid system

---

## PHASE 3: PAGES & SECTIONS (Priority: HIGH) ✓

### 3.1 - Hero Section ✓
- [x] Headline: "Telegram Bot untuk Jual Akun Otomatis"
- [x] Subheadline & value proposition
- [x] CTA buttons: "Sewa Sekarang" + "Beli Script"
- [x] Hero illustration placeholder dengan floating animation
- [x] Responsive design dengan staggered animations
- [x] Stats section: Users, Accounts Sold, Uptime

### 3.2 - Features Section ✓
- [x] Grid layout (3 columns on desktop)
- [x] Feature cards dengan minimal emoji (hanya icon symbols)
- [x] Features:
  - Automated System
  - Instant Setup
  - Secure System
  - Open Source
  - User Friendly
  - Multi Channel
- [x] Each card: neo-brutalist border + smooth hover animation

### 3.3 - Pricing / Offerings Section ✓
- [x] **Tab Toggle:** "Sewa Bot" vs "Beli Script"
- [x] **Rental Plans:**
  - Starter ($99/month)
  - Professional ($299/month) - RECOMMENDED badge
  - Enterprise ($999/month)
  - Clean feature lists dengan checkmark icon
  
- [x] **Full Script Purchase:**
  - One-time price $4.999
  - Comprehensive feature list
  - "Beli Script" CTA button

### 3.4 - Bot Demo / Telegram Simulator ✓
- [x] Interactive chat simulator
- [x] Header dengan bot name & status
- [x] Avatar dengan float animation
- [x] Sample message flow dengan real interactions
- [x] Clickable buttons showing responses
- [x] Mobile-friendly layout

### 3.5 - How It Works Section ✓
- [x] Step-by-step process (5 steps)
  - Pilih Plan
  - Bayar
  - Setup Bot
  - Mulai Jual
  - Monitor Earnings
- [x] Timeline layout dengan step circles
- [x] Staggered fade-in animations

### 3.6 - FAQ Section ✓
- [x] Accordion component (collapsible Q&A)
- [x] 8 comprehensive questions & answers
- [x] Smooth open/close animations
- [x] Staggered entrance animations

### 3.7 - CTA Section (Before Footer) ✓
- [x] Big headline: "Mulai Jual Akun Sekarang"
- [x] Two action buttons: "Sewa Bot" + "Beli Script"
- [x] Trust badges dengan check icon
- [x] Dark background untuk contrast

---

## PHASE 4: AUTHENTICATION & USER DASHBOARD (Priority: MEDIUM)

- [ ] **Login Page**
  - Email/password form
  - "Forget Password?" link
  - "Sign Up" CTA
  - OAuth options (Google, Telegram - optional)

- [ ] **Sign Up / Registration Page**
  - Email, password, confirm password
  - Business name input
  - Terms & privacy checkbox
  - Validation & error messages

- [ ] **Dashboard Layout**
  - Sidebar: Navigation (Home, Accounts, Analytics, Billing, Settings)
  - Top bar: User profile, notifications, logout
  - Content area: Dynamic based on selected tab

- [ ] **Dashboard - Home**
  - Overview cards: Total accounts, revenue, active days
  - Quick stats
  - Recent activities feed

- [ ] **Dashboard - Accounts**
  - Table/list of managed accounts
  - Columns: Account name, status, created date, sales count, actions
  - Add new account form/modal
  - Edit, delete, pause actions

- [ ] **Dashboard - Analytics**
  - Charts: Daily sales, revenue trend, top accounts
  - Filters: Date range, account filter
  - Export data option

- [ ] **Dashboard - Billing**
  - Subscription status
  - Invoice history
  - Payment method management
  - Upgrade/downgrade plan

- [ ] **Dashboard - Settings**
  - API key management
  - Webhook settings
  - Bot customization (branding, messages)
  - Account preferences

---

## PHASE 5: BACKEND API & INTEGRATION (Priority: HIGH)

- [ ] Setup Node.js/Express backend (or specify framework)
- [ ] Database schema design (user, subscription, accounts, transactions)
- [ ] Authentication (JWT / OAuth)
- [ ] API Endpoints:
  - POST /auth/register, /auth/login, /auth/logout
  - GET /user/profile, PUT /user/profile
  - GET /plans (rental & purchase options)
  - POST /subscription/start, /subscription/cancel
  - GET /accounts, POST /accounts, PATCH /accounts/:id, DELETE /accounts/:id
  - GET /analytics/dashboard
  - POST /billing/payment
  - GET /billing/invoices
- [ ] Telegram Bot API integration
- [ ] Payment gateway integration (Stripe, PayPal, or local methods)
- [ ] Error handling & validation

---

## PHASE 6: POLISH & OPTIMIZATION (Priority: MEDIUM)

- [ ] **Responsive Design**
  - Mobile breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
  - Test on devices
  - Fix layout issues

- [ ] **Accessibility (a11y)**
  - ARIA labels on buttons, inputs
  - Keyboard navigation
  - Color contrast verification

- [ ] **Performance**
  - Image optimization & lazy loading
  - Code splitting
  - Minification & bundle analysis
  - Lighthouse audit

- [ ] **SEO**
  - Meta tags (title, description, OG tags)
  - Semantic HTML
  - Robots.txt, sitemap.xml

- [ ] **Testing**
  - Unit tests (Jest)
  - Component tests (React Testing Library)
  - E2E tests (Cypress or Playwright)

- [ ] **Documentation**
  - README.md (setup, deployment)
  - Component storybook
  - API documentation

---

## PHASE 7: DEPLOYMENT & MONITORING (Priority: MEDIUM)

- [ ] Setup CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
- [ ] Staging environment
- [ ] Production deployment (Vercel, Netlify, AWS, or self-hosted)
- [ ] SSL certificate setup
- [ ] Domain configuration
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics, or custom)
- [ ] Monitoring & alerts

---

## NEXT STEPS (Priority Order)

1. **Testimonials Section** - Add social proof dengan reviews
2. **Login/Signup Pages** - Auth flow pages  
3. **Dashboard Pages** - User dashboard layout & pages
4. **Backend API** - Node.js/Express setup & endpoints
5. **Database** - PostgreSQL/MongoDB schema design
6. **Payment Integration** - Stripe/PayPal integration
7. **Testing** - Unit & E2E tests
8. **Deployment** - Vercel/Netlify setup

---

## BUILD INFO

**Build Status:** ✅ SUCCESS  
**Build Output:**
- dist/index.html: 0.74 kB (gzip: 0.43 kB)
- dist/assets/index.css: 24.94 kB (gzip: 4.43 kB)  
- dist/assets/index.js: 167.57 kB (gzip: 51.63 kB)
- Build time: 2.16s

**Run Dev Server:**
```bash
cd C:/Users/fakeg/Documents/Projects/autobotz/web
npm run dev
# Open http://localhost:5173
```

---

**Last Updated:** 2026-11-04 17:59 UTC+7  
**Status:** ✅ Landing Page Complete | Components Polished | Ready for Dev Server
