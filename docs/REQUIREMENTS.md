# FreshCart – Product Requirements (v1.0)

This document is the **source of truth** for how FreshCart must behave. Any behaviour that contradicts it is a defect. Unless a requirement says it applies to only one platform, it applies to the **API, the web app and the mobile app**. The web and mobile apps must behave the same way.

Requirement IDs (e.g. `AUTH-03`) should be referenced in bug reports and test cases.

---

## 1. General

| ID | Requirement |
|----|-------------|
| GEN-01 | All monetary amounts are shown in US dollars with exactly two decimal places, e.g. `$4.50`, `$25.00`. |
| GEN-02 | Web: every page is usable at viewport widths from **360 px** to 1920 px without horizontal scrolling. All content and actions stay reachable. |
| GEN-03 | Web: meets WCAG 2.1 AA basics. Informative images have text alternatives, every form field has a programmatically associated label, and icon/symbol-only buttons have an accessible name. |
| GEN-04 | Every error returned by the API is shown to the user in a human-readable form. The app never shows a success message for an action that failed. |
| GEN-05 | Unknown web URLs show a "Page not found" page with a link back to the shop. |
| GEN-06 | Web: every interactive element (links, buttons, chips, form controls) shows a clearly visible focus indicator when reached with the keyboard. |
| GEN-07 | Text has a contrast ratio of at least **4.5:1** against its background (3:1 for large text), on web and mobile. |
| GEN-08 | Feedback messages are styled consistently. Errors use the red error style, successes use the green success style, and an error must never look like a success. |
| GEN-09 | Mobile: screen content respects the device safe areas. Nothing is drawn under the status bar, notch/Dynamic Island or home indicator. |
| GEN-10 | Mobile: every tappable control has a touch target of at least **44 × 44 pt**. |

## 2. Authentication & Account

| ID | Requirement |
|----|-------------|
| AUTH-01 | Users register with full name (min 2 chars), email (valid format) and password. |
| AUTH-02 | Passwords must be **at least 8 characters and contain at least one number**. This rule is enforced by the API as well as the clients. |
| AUTH-03 | Email addresses are **case-insensitive**. `Jane@FreshCart.com` and `jane@freshcart.com` are the same account for registration (no duplicates) and for login. |
| AUTH-04 | Web registration has a "Confirm password" field. The form cannot be submitted unless both passwords match. |
| AUTH-05 | Password fields are always masked. |
| AUTH-06 | Mobile: email fields use the email keyboard and do not auto-capitalise or auto-correct. |
| AUTH-07 | Wrong credentials show "Invalid email or password". |
| AUTH-08 | A session lasts 24 hours. Logging out ends the session **immediately and completely**: the token is invalidated on the server and removed from the device/browser. Refreshing or reopening the app after logout must show the signed-out state. |
| AUTH-09 | The API must **never** return a user's password (in any form) in any response. |
| AUTH-10 | Profile: users can edit their name (min 2 chars) and phone (optional; 10–15 digits). Email is read-only. |

## 3. Product Catalogue

| ID | Requirement |
|----|-------------|
| CAT-01 | Products are listed **8 per page**. The web app uses Previous/Next pagination. The mobile app uses "Load more". |
| CAT-02 | Pagination (page count, Next/Load more availability) reflects the **currently filtered** result set. Users never land on an empty page when matching products exist. |
| CAT-03 | Search matches product names, case-insensitive. A new search always shows the **first page** of results. |
| CAT-04 | Users can filter by one category, or "All". |
| CAT-05 | Sort options: Newest (default), Price: Low to High, Price: High to Low, Top rated. Prices sort by numeric value. |
| CAT-06 | Search, category and sort **combine**. Changing one keeps the others. |
| CAT-07 | A product on sale shows its **sale price** (the price actually charged) as the main price, with the original price struck through. This must be consistent on every screen (list, detail, cart, checkout, orders). |
| CAT-08 | Products with stock 0 are labelled "Out of stock" and **cannot be added to the cart from any screen**. |
| CAT-09 | Products with 5 or fewer units show "Only N left". |
| CAT-10 | When no products match, an empty state ("No products found") is shown. |
| CAT-11 | Mobile: pull-to-refresh on the product list reloads the products, and the refresh indicator disappears when loading finishes. |

## 4. Cart

| ID | Requirement |
|----|-------------|
| CART-01 | Only signed-in users have a cart. Adding to the cart while signed out prompts sign in. |
| CART-02 | The quantity of each line item is between **1 and 10**, and never more than the available stock. This is enforced by the API on **every** endpoint that changes quantity. |
| CART-03 | The "−" control is disabled at quantity 1. Items are removed with the Remove/trash action. |
| CART-04 | The cart badge (web header and mobile tab) shows the **total number of units** in the cart. For example, 2 × Cake + 1 × Milk = **3**. |
| CART-05 | Coupons: only one coupon at a time. Invalid codes show "This coupon code is not valid". |
| CART-06 | `SAVE10` gives 10% off the subtotal when the subtotal is **$50.00 or more** (inclusive). |
| CART-07 | Expired coupons are rejected with "This coupon has expired". |
| CART-08 | If the cart changes so that an applied coupon no longer qualifies, the coupon is removed and the user is told why. |
| CART-09 | **Price calculation:** <br>• Subtotal = Σ (unit price × quantity) <br>• Discount = coupon discount on the subtotal <br>• Delivery = $5.00, or **free** when the subtotal is ≥ $75.00 or `FREESHIP` is applied <br>• Tax = **8% of (Subtotal − Discount)** <br>• Total = Subtotal − Discount + Delivery + Tax <br>Each value is rounded to the nearest cent. |

## 5. Checkout & Orders

| ID | Requirement |
|----|-------------|
| CHK-01 | Checkout requires full name, street address (min 5 chars), city, 5-digit ZIP code, phone (10–15 digits) and a payment method (Cash on delivery / Card on delivery). Name and phone are pre-filled from the profile. |
| CHK-02 | Invalid fields show an inline message next to the field. |
| CHK-03 | Checkout is not available with an empty cart. |
| CHK-04 | Placing an order takes about 1–2 seconds (payment authorisation). While it is processing, the Place order button is disabled and shows a progress state. **One checkout action creates exactly one order**, however many times the button is clicked or tapped. |
| CHK-05 | On success the cart is emptied, stock is reduced and a confirmation screen shows the order number and total. |
| CHK-06 | After an order is placed, the user cannot navigate "back" into the checkout form, by browser back, header back, swipe-back or the Android back button. Back from the confirmation screen leads to the shop or cart. |
| CHK-07 | Mobile: when the keyboard is open, the focused input and the Place order button stay visible, or can be scrolled into view. |
| ORD-01 | Order history lists the user's orders **newest first**, showing number, date, item count, status and total. |
| ORD-02 | Order history is up to date whenever it is opened, including orders just placed or cancelled. |
| ORD-03 | Users can only view **their own** orders. Requesting another user's order returns "Order not found" (HTTP 404). |
| ORD-04 | Orders with status **Placed** can be cancelled after a confirmation prompt. Shipped, Delivered and Cancelled orders cannot. Cancelling restores stock. |
| ORD-05 | Order statuses: Placed → Shipped → Delivered, or Placed → Cancelled. |

---

## 6. API Reference

Base URL: `http://localhost:4000`. JSON in/out. Authenticated endpoints need `Authorization: Bearer <token>`. Errors return `{ "error": "message", "field"?: "fieldName" }` with an appropriate 4xx status.

| Method | Path | Auth | Body / Query | Notes |
|--------|------|------|--------------|-------|
| GET | `/api/health` | – | – | Health check |
| POST | `/api/auth/register` | – | `{ name, email, password }` | 201 → `{ token, user }` |
| POST | `/api/auth/login` | – | `{ email, password }` | 200 → `{ token, user }` |
| POST | `/api/auth/logout` | ✔ | – | 204, invalidates token |
| GET | `/api/me` | ✔ | – | Current user |
| PUT | `/api/me` | ✔ | `{ name?, phone? }` | Update profile |
| GET | `/api/categories` | – | – | Categories with product counts |
| GET | `/api/products` | – | `search, category, sort (newest\|price_asc\|price_desc\|rating), page` | `{ items, page, pageSize, total, totalPages }` |
| GET | `/api/products/:id` | – | – | Single product |
| GET | `/api/cart` | ✔ | – | `{ items, coupon, couponMessage, summary }` |
| POST | `/api/cart/items` | ✔ | `{ productId, qty }` | Adds qty (default 1) |
| PATCH | `/api/cart/items/:productId` | ✔ | `{ qty }` | Sets the quantity |
| DELETE | `/api/cart/items/:productId` | ✔ | – | Removes line |
| POST | `/api/cart/coupon` | ✔ | `{ code }` | Applies coupon |
| DELETE | `/api/cart/coupon` | ✔ | – | Removes coupon |
| GET | `/api/orders` | ✔ | – | Current user's orders |
| GET | `/api/orders/:id` | ✔ | – | One order |
| POST | `/api/orders` | ✔ | `{ fullName, address, city, zip, phone, paymentMethod: "cod"\|"card" }` | 201 → order |
| POST | `/api/orders/:id/cancel` | ✔ | – | Cancels a Placed order |

## 7. Out of scope (not defects)

- Real payment processing. "Card on delivery" intentionally has no card fields.
- Data persistence across API restarts. Data is intentionally in-memory.
- Password reset, social login, email verification, product reviews, wishlist.
- Visual polish preferences that don't break a requirement, usability or accessibility. You may still log these as suggestions.
