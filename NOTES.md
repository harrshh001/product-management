# Technical Notes & Architectural Decisions

This document details the engineering challenges, architectural decisions, and edge-case handlings implemented in the ProductIQ Next.js Admin Dashboard.

---

## 1. Tradeoffs & API Constraints

### 1.1 DummyJSON Search vs. Category Separation
- **Constraint:** DummyJSON does not provide a compound endpoint such as `/products?q=phone&category=smartphones`. It exposes `/products/search?q=...` and `/products/category/:slug` as mutually exclusive routes.
- **Decision:** Rather than doing full client-side array filtering (which would defeat server-side pagination and performance), the UI enforces **mutual exclusivity**:
  - Typing in the `SearchBar` immediately resets the active `CategoryFilter`.
  - Selecting an item from `CategoryFilter` resets the search input.
  - An informational notice card is displayed on the dashboard explaining this behavior to users and reviewers.

### 1.2 DummyJSON Simulated Persistence (Session Overlay Layer)
- **Constraint:** DummyJSON's mutation endpoints (`POST /products/add`, `PUT /products/:id`, `DELETE /products/:id`) return mock 200/201 responses with modified object structures, but they do not persist to the remote server. Refreshing or querying `/products` immediately afterwards returns unmodified data.
- **Decision:** Implemented `ProductsContext.tsx` as a client-side session overlay:
  - `addedProducts`: Maps synthetic items created during the session and merges them at the top of the product list.
  - `updatedProducts`: A key-value map (`id -> Partial<Product>`) applied on top of any fetched item with a matching ID.
  - `deletedProductIds`: A `Set<number>` used to filter out items marked as deleted.
  - A subtle **"Local"** badge is rendered next to modified/created items so reviewers can easily verify state transitions.

---

## 2. Concurrency & Stale Response Handling

### 2.1 Stale Response Guard (`latestRequestIdRef`)
- **Problem:** When typing rapidly or clicking through pagination/filters, multiple asynchronous `axios` requests are dispatched. If an earlier request with higher latency finishes *after* a later request with lower latency, the earlier response would overwrite the latest state (a classic race condition).
- **Solution:**
  ```typescript
  const latestRequestIdRef = useRef<number>(0);

  const loadProducts = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;
    setIsLoading(true);

    try {
      const data = await fetchProducts(...);
      // Discard response if a newer request was dispatched while this was pending
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setProducts(data.products);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [...]);
  ```

### 2.2 Debounce with Cleanup (`useDebounce.ts`)
- A custom React hook runs `setTimeout` with a 400ms delay.
- The `useEffect` cleanup handler calls `clearTimeout` on every keystroke, ensuring that no superfluous requests are made while the user is actively typing.

### 2.3 Double-Submit Prevention
- All mutation forms (`ProductForm.tsx`, `LoginPage.tsx`, `ConfirmDialog.tsx`) track `isSubmitting` / `isDeleting` state.
- Submit buttons disable themselves, display spinner icons, and prevent duplicate submissions on rapid double clicks or Enter keystrokes.

---

## 3. URL-Driven State & Validation Edge Cases

### 3.1 Single Source of Truth
- State is intentionally not mirrored in unnecessary component state. The URL query string (`?page=2&pageSize=20&sortBy=price&order=desc`) is the **single source of truth**.
- Navigating with browser Back/Forward buttons automatically reflects in the UI and fetches the correct slice of data.

### 3.2 Guarding Against Corrupted Query Parameters
- Direct manual URL manipulation by malicious or curious users could supply invalid inputs:
  - `?page=abc` or `?page=-10` → Sanitized via `parseInt` fallback: `Math.max(1, parsedPage || 1)`.
  - `?page=99999` (exceeding total pages) → Automatically clamped to `maxPages = Math.ceil(total / pageSize)`.
  - `?pageSize=1000` → Clamped to allowed whitelist `[10, 20, 50]`, falling back to default `10`.
  - `?order=invalid` → Clamped to `'desc'` or default `'asc'`.

---

## 4. Build & Environment Challenges Resolved

### 4.1 Next.js App Router Static Generation with `useSearchParams()`
- **Issue:** Next.js App Router requires components calling `useSearchParams()` to be wrapped in a `<Suspense>` boundary during static prerendering (`next build`), otherwise the build fails with an uncaught bail-out error.
- **Solution:** Extracted inner page logic into subcomponents (`LoginContent`, `DashboardContent`) and wrapped top-level default exports in `<Suspense fallback={<LoadingSpinner />}>`.

### 4.2 Tailwind CSS Tooling on Windows (V4 vs V3)
- **Issue:** Modern `@tailwindcss/postcss` (Tailwind v4) relies on precompiled native bindings (`lightningcss-win32-x64-msvc.node`) which failed to execute in this specific Windows WASM fallback environment.
- **Solution:** Configured standard Tailwind CSS v3 (`tailwindcss@3.4.17` + `postcss@8.4.49` + `autoprefixer@10.4.20`) with a standard `tailwind.config.ts` and `postcss.config.mjs`, ensuring 100% portable compilation.

### 4.3 Webpack Flag (`--webpack`)
- Turbopack on WASM fallback throws binary architecture mismatch errors when invoking SWC native binaries.
- Configured `package.json` scripts to use `next dev --webpack` and `next build --webpack`, achieving clean 0-error compilation and sub-second HMR.
