# ProductIQ — Next.js Admin Dashboard

A robust, enterprise-grade Product Management Admin Dashboard built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **Axios**. All data is powered by the public [DummyJSON API](https://dummyjson.com).

This dashboard was engineered completely by hand without any third-party table, pagination, or state fetching libraries (no React Query, SWR, TanStack Table, etc.).

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
> **Note on Environment:** The `npm run dev` script runs `next dev --webpack` to ensure rock-solid compatibility across native binary environments.

### 3. Access Application
Open your browser and navigate to:
```
http://localhost:3000
```
- The application automatically redirects unauthenticated sessions to `/login`.
- **Test Credentials** (prefilled with a single click via the "Autofill" button):
  - **Username:** `emilys`
  - **Password:** `emilyspass`

---

## 🛠️ Architecture & Project Structure

```
├── app/
│   ├── layout.tsx                     # Root layout with AuthProvider & ProductsProvider
│   ├── page.tsx                       # Root redirect router (/dashboard or /login)
│   ├── globals.css                    # Tailwind CSS v3 directives & custom scrollbars
│   ├── login/
│   │   └── page.tsx                   # Auth login view with double-submit guard & Suspense
│   └── dashboard/
│       ├── layout.tsx                 # Protected route guard & navigation shell
│       ├── page.tsx                   # Main product table, search, filters & pagination
│       └── products/
│           ├── new/page.tsx           # Create new product form
│           └── [id]/
│               ├── page.tsx           # Single product detail view (specs, reviews, gallery)
│               └── edit/page.tsx      # Edit product form with pre-populated data
├── components/
│   ├── common/
│   │   ├── Badge.tsx                  # StockBadge, RatingBadge, CategoryBadge, LocalBadge
│   │   ├── ConfirmDialog.tsx          # Accessible modal dialog with Esc key support
│   │   ├── EmptyState.tsx             # Friendly empty state with reset action
│   │   ├── ErrorAlert.tsx             # Error banner with retry mechanism
│   │   └── LoadingSpinner.tsx         # Spinners & table/card skeleton placeholders
│   ├── layout/
│   │   └── Navbar.tsx                 # Sticky navigation with user profile & logout
│   └── products/
│       ├── CategoryFilter.tsx         # Category dropdown populated via API
│       ├── Pagination.tsx             # Hand-crafted pagination & page-size selector
│       ├── ProductCard.tsx            # Responsive mobile card view (< md)
│       ├── ProductForm.tsx            # Unified create/edit form with live validation
│       ├── ProductTable.tsx           # Responsive desktop table with sorting indicators
│       ├── SearchBar.tsx              # Debounced search bar with clear button
│       └── SortSelect.tsx             # Sort field dropdown + Asc/Desc toggle
├── lib/
│   ├── api/
│   │   ├── client.ts                  # Central Axios instance, Bearer token interceptor, 401 redirect
│   │   ├── auth.ts                    # Authentication API calls & localStorage helpers
│   │   ├── products.ts                # Unified product endpoints (search, category, CRUD)
│   │   └── types.ts                   # Comprehensive TypeScript definitions
│   ├── context/
│   │   ├── AuthContext.tsx            # Global authentication state & hydration
│   │   └── ProductsContext.tsx        # Session persistence overlay for DummyJSON mutations
│   └── hooks/
│       └── useDebounce.ts             # Custom hand-crafted debounce hook with cleanup
├── NOTES.md                           # Deep-dive engineering decisions & tradeoffs
└── package.json
```

---

## ✨ Features Checklist

- [x] **Authentication & Protected Routes**
  - Bearer token attached on every request via Axios request interceptor (`lib/api/client.ts`).
  - Automatic 401 response interceptor clearing auth and redirecting to `/login?session_expired=true`.
  - Client-side route guarding in `dashboard/layout.tsx`.
  - Test credentials display with one-click autofill button.
- [x] **Product Listing & Responsive Views**
  - **Desktop (md+):** Dense, clean table displaying thumbnails, titles, SKUs, categories, prices, discounts, stock levels, ratings, and actions.
  - **Mobile (< md):** Interactive cards optimized for touch with collapsible meta details.
  - Table and card skeleton loading states during initial load and filter changes.
- [x] **Debounced Search**
  - Hand-crafted `useDebounce` hook (400ms delay) to prevent spamming the backend.
  - Immediate visual search spinner while typing.
  - Clear search (`×`) button.
- [x] **Category Filtering & Sorting**
  - Dynamically fetched category list from `https://dummyjson.com/products/categories`.
  - Sort by Price, Title, Rating, or Stock with one-click Ascending/Descending direction toggle.
- [x] **100% URL-Synchronized State**
  - All state parameters (`page`, `pageSize`, `q`, `category`, `sortBy`, `order`) are stored in the URL query string.
  - Deep linking and browser Back/Forward navigation work out of the box.
  - Guarded against malformed query parameters (e.g. `?page=-5`, `?page=abc`, `?pageSize=999`).
- [x] **Pagination Engine**
  - Written from scratch with smart windowing (shows first, last, ellipsis, and surrounding pages).
  - Configurable page size selector (10, 20, 50 items per page).
  - Dynamic "Showing X–Y of Z items" count.
- [x] **Product Detail View (`/dashboard/products/[id]`)**
  - Image gallery with interactive thumbnail switcher.
  - Full product specifications, discount calculation, stock status, and barcode.
  - Customer review cards with star ratings and reviewer info.
- [x] **Create & Edit Products (`/new`, `/[id]/edit`)**
  - Reusable `ProductForm` component with field validation (required title, price, stock, category, positive numbers).
  - Double-submit prevention via disabled states and loading spinners.
  - Visual feedback toast on success.
- [x] **Delete Confirmation Modal**
  - Accessible `ConfirmDialog` with backdrop blur, keyboard `Escape` handler, and asynchronous loading state.
- [x] **Robust Concurrency & Stale Response Guard**
  - `latestRequestIdRef` counter prevents slow network responses from overwriting newer user keystrokes/filters.

---

## 💡 Important Design Decisions

### 1. DummyJSON Simulated Persistence (Local Session Overlay)
The public [DummyJSON API](https://dummyjson.com) is a mock API. When you send `POST /products/add`, `PUT /products/:id`, or `DELETE /products/:id`, the server echoes back a simulated success payload, but does **not** persist changes to its underlying database.

**How We Solved It:**
We implemented a **Session Persistence Overlay** (`lib/context/ProductsContext.tsx`):
- Newly created products are assigned a synthetic ID and prepended to the active list.
- Updated products merge their modified fields over the remote API data.
- Deleted products are tracked in a set and excluded from all listing queries.
- Newly created/edited items are marked with a distinct **"Local"** badge so you can easily verify persistence.

### 2. Search vs. Category Mutual Exclusivity
The DummyJSON API provides separate endpoints:
- `GET /products/search?q={query}` (searches title/description across all products)
- `GET /products/category/{category}` (filters products in a specific category)

Because the API does not support combining `q` and `category` in a single query:
- Entering a search query automatically clears the selected category.
- Selecting a category automatically clears any active search query.
- Both controls clearly indicate this behavior with helpful contextual badges and info tooltips.

---

## 🧪 Production Verification

To verify the production build:
```bash
npm run build
```
All routes are verified for zero lint errors, 100% strict TypeScript compliance, and correct Next.js App Router Suspense boundaries.
