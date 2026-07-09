# Optical Store Management System

## Video Demo

[Youtube Video](https://www.youtube.com/watch?v=M97MYsimmqI)

---

# Description

This project is a web-based management system designed for optical stores that sell frames, glasses, lenses, contact lenses, and accessories. The system was built using Django for the backend. The frontend is implemented as a **Single Page Application (SPA)** using Vanilla JavaScript ES Modules. After login, all pages including the dashboard, invoice creation, invoice search, and printable invoice view are rendered dynamically through JavaScript without navigating between multiple HTML pages.

The main purpose of this project is to simplify the workflow inside an optical store by combining customer management, prescription handling, invoice creation, printing, and dashboard analytics into one centralized application.

This application is designed as an **internal business management system** used by employees inside an optical store. Employees can create invoices, manage prescriptions, search customer records, print professional invoices, and monitor business statistics from a dashboard interface. There is no public storefront and no customer-facing interface.

---

# Distinctiveness and Complexity

This project is fundamentally different from all previous CS50W projects. It is an internal operational management system for an optical business, not a public-facing website.

The application is implemented as a **Single Page Application**. After authentication, all content is rendered dynamically through JavaScript modules. The browser never navigates to a new URL after login. Everything — dashboard, invoice creation, search, print view — renders inside a single container without page reloads. This is fundamentally different from the server-rendered template approach used in previous projects.

The project contains domain-specific logic related to optical stores including prescriptions, lens specifications, invoice generation, pickup dates, dynamic invoice items, supplier orders, and inventory-linked products.

One of the most complex parts of the project is the invoice creation system. Each invoice item can come from three different sources:

- **Inventory** — uses existing products from stock. Frame products automatically fill their stored category (Medical or Sunglasses) as a read-only field pulled directly from inventory. Inventory categories include frames (Medical and Sunglasses), optical lenses, contact lenses, and accessories.
- **Order** — allows special supplier orders not yet in inventory. Order items are tracked separately depending on type, with lens-based orders including sphere and cylinder specifications.
- **Custom** — allows free-text services, repairs, or manual entries without requiring inventory records.

Depending on the selected source and category, the frontend dynamically renders completely different input fields using JavaScript modules.

Another major complexity is the prescription system. Prescriptions support right and left eye measurements separately, including sphere, cylinder, axis, and IPD values. Both reading and distance prescriptions are supported.

The frontend architecture uses Vanilla JavaScript ES modules split across two files — `scripts.js` for page rendering and routing logic, and `helpers.js` for reusable helper functions shared across the application.

The dashboard is dynamically rendered from a single JSON endpoint and displays business analytics including total products, customers, sales, invoices, low stock warnings, and top-selling products.

The application also includes a custom user system with roles and account statuses. The models and backend logic for this system are already fully implemented. In the current submission, the login view checks for blocked account status and denies access. Registration creates accounts with an `on_hold` status by default, requiring admin approval before access is granted. Full role-based permission enforcement and account management UI are listed under future improvements.

Some fields in the models are pre-built for future improvements and are not yet exposed in the UI. These include order tracking details in `OrderItem` and `OrderLens`, lens color and usage in `LensDetails`, and activity notes and last access time in the `User` model.

Altogether this project combines backend architecture, frontend dynamic rendering, relational database design, business workflow management, and custom CSS responsive design into one integrated system.

---

# Features

## Authentication System

- Login
- Registration
- Logout
- Session validation

Newly registered accounts automatically start with an `on_hold` status and require admin approval. The login view checks for `blocked` status and denies access accordingly.

The custom user model is fully built with the following roles and statuses, ready for future enforcement:

**Roles:**
- super_admin
- admin
- viewer
- tester
- seller

**Account statuses:**
- working
- on_hold
- blocked

Failed login tracking is implemented in the model.

---

## Dashboard

Displays dynamically from a single JSON endpoint:

- Total products
- Total customers
- Total invoices
- Total sales
- Today's sales
- Low-stock warnings
- Top-selling products

---

## Invoice Creation System

Users can:

- Select existing customers or create new ones
- Add optional prescriptions (distance or reading)
- Add multiple invoice items dynamically

Each invoice item supports three sources:

### Inventory Source
Uses existing products from stock. Categories include:
- Frames (Medical or Sunglasses — category auto-fills as read-only from the stored product data)
- Optical lenses
- Contact lenses
- Accessories

### Order Source
Special supplier orders not in inventory. Lens orders include sphere and cylinder fields. Order details are stored in `OrderItem` and `OrderLens` models, which are pre-built with additional fields (supplier, color, receipt status) ready for future order tracking UI.

### Custom Source
Free-text services, repairs, or manual entries without inventory records.

---

## Payment Tracking

Each invoice tracks total amount, paid amount, and remaining amount. The total calculates automatically from item subtotals. The remaining amount updates automatically when the paid amount changes.

---

## Prescription Support

- Right and left eye measurements
- Sphere, cylinder, axis, IPD
- Reading and distance prescriptions
- Optionally linked to invoices
- Prescription section only prints when data exists

---

## Search Functionality

Invoices can be searched by:

- Invoice ID alone
- Customer name alone
- Customer phone number alone
- Customer name and phone number together

Results display as interactive cards. Clicking a card opens the full printable invoice view.

---

## Invoice Printing

Print-friendly A4 invoice layout containing:

- Customer information
- Itemized products
- Prescription details (only when a prescription exists)
- Totals, paid amount, remaining amount
- Payment method
- Pickup date

Printing is handled using `window.print()`.

---

# Technologies Used

## Backend
- Python
- Django
- Django ORM

## Frontend
- Vanilla JavaScript
- ES Modules
- Custom CSS
- Bootstrap

## Database
- SQLite (development)

## Additional Packages
- phonenumber_field

---

# Project Structure

## Main Backend Files

### `models.py` (accounts app)
Contains the custom `User` model with roles, statuses, and failed login tracking. Some fields are pre-built for future features including notes on activity and last access time.

### `models.py` (optics app)
Contains all store-related models:

- **Product** — inventory items with barcode, quantity, pricing, and frame category (Medical or Sunglasses).
- **LensDetails** — sphere, cylinder, usage, and color details linked to lens products. Usage and color fields are pre-built for future improvements.
- **Customer** — name, phone, email.
- **Prescription** — right and left eye data, reading and distance types.
- **Invoice** — customer reference, payment method, totals, pickup date, prescription link, seller, created by.
- **InvoiceItem** — line items supporting inventory, order, and custom sources.
- **OrderItem** — supplier order details for frame-type orders. Fields including color, supplier, and receipt status are pre-built for future order tracking UI.
- **OrderLens** — supplier order details for lens-type orders including sphere, cylinder, lens type, usage, and color. Pre-built for future order tracking UI.

### `views.py`
Handles backend logic and JSON responses.

### `urls.py`
Defines application routes.

---

## Frontend Templates

### `layout.html`
Main shared layout containing navigation, CSS imports, and JavaScript module imports.

### `index.html`
Main SPA container. All dynamic content renders here after login.

### `login.html`
Authentication form.

---

## Frontend Files

### `scripts.js`
Frontend page rendering and routing logic including dashboard, invoice creation, and search.

### `helpers.js`
Reusable helper functions shared across the application including invoice item row rendering, subtotal calculation, prescription data collection, and printable invoice display.

### `styles.css`
Custom styling for the application.

---

# Mobile Responsiveness

The application is responsive through custom CSS and Bootstrap. All layout adaptation is handled manually without relying on any CSS framework grid or utility system.

---

# Future Improvements

The following features are scaffolded in the backend models, but are intentionally hidden from navigation until completed:

- Full role-based permission enforcement (models and status checks already built)
- Account management UI (roles, statuses, and failed login tracking already in models)
- Order tracking UI (OrderItem and OrderLens models already pre-built with full field structure)
- Inventory management pages
- Accounting system
- Reports
- Customer management pages
- Settings page
- Supplier management
- Sales analytics
- PDF exports
- Excel exports
- Barcode scanning
- Notification system

---

# How to Run the Application

## 1. Clone the Repository

```bash
git clone https://github.com/ms228823/CS50W-Capstone
```

## 2. Navigate to the Project Directory

```bash
cd CS50W-Capstone
```

## 3. Create a Virtual Environment

```bash
python -m venv .venv
```

## 4. Activate the Virtual Environment

### Windows

```bash
.venv\Scripts\activate
```

### Linux/macOS

```bash
source .venv/bin/activate
```

## 5. Navigate to the Backend Directory

```bash
cd backend
```

## 6. Install Requirements

```bash
pip install -r requirements.txt
```

## 7. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## 8. Start the Server

```bash
python manage.py runserver
```

---

# Additional Notes

This project was developed as the CS50W Final Capstone Project.

The application focuses on solving real-world optical store workflow problems by providing an internal management system for store employees.

The project intentionally emphasizes:

- Dynamic Single Page Application frontend behavior
- Relational database design
- Business workflow management
- Modular JavaScript architecture using ES modules
- Practical usability for store employees

The core system — authentication, invoice creation, prescriptions, search, printing, and the dashboard — is complete and functional. Items listed under Future Improvements are optional extensions beyond the scope of this submission.
