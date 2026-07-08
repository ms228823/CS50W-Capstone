# Optical Store Management System

## Video Demo

[Add your YouTube video link here — required before final submission]

---

# Description

This project is a web-based management system designed for optical stores that sell glasses, lenses, contact lenses, and accessories. The system was built using Django for the backend and Vanilla JavaScript with ES modules for the frontend. Bootstrap 5 and custom CSS were used for styling and responsive design.

The main purpose of this project is to simplify the workflow inside an optical store by combining customer management, prescription handling, invoice creation, printing, and dashboard analytics into one centralized application.

Unlike a traditional e-commerce website, this project focuses on internal business operations rather than public online shopping. Employees can create invoices, manage prescriptions, search customer records, print professional invoices, and monitor business statistics from a dashboard interface.

The application was designed to simulate a real optical store workflow where products may come from existing inventory, supplier orders, or custom services and repairs.

---

# Distinctiveness and Complexity

I believe this project satisfies the distinctiveness and complexity requirements because it is fundamentally different from the previous CS50W projects.

Although the project includes products and invoices, it is not an e-commerce website like Project 2 (Commerce). Users are not browsing products publicly, placing bids, or purchasing items through a storefront. Instead, this application is focused on internal operational management for an optical business.

The application contains domain-specific logic related to optical stores, including prescriptions, lens specifications, invoice generation, pickup dates, dynamic invoice items, supplier orders, and inventory-linked products. These workflows are significantly different from the auction-based system from Project 2.

The project is also substantially more complex than the earlier assignments because it combines multiple systems together into a single workflow-driven application.

One of the most complex parts of the project is the invoice creation system. Each invoice item can come from three different sources:

- Existing inventory products
- Supplier orders
- Custom services or repairs

Depending on the selected source and category, the frontend dynamically renders completely different input fields using JavaScript modules. For example:

- Inventory items automatically retrieve pricing information, and frame products auto-fill their stored category (Medical or Sunglasses) as a read-only field pulled directly from inventory.
- Order items include supplier information and lens specifications.
- Custom items allow free-text descriptions without requiring inventory records.

Another major complexity point is the prescription system. Prescriptions support right and left eye measurements separately, including sphere, cylinder, axis, and IPD values. The application also supports both reading and distance prescriptions.

The frontend architecture is also more advanced than previous projects. Instead of relying heavily on server-rendered templates for everything, much of the application logic is handled client-side using Vanilla JavaScript ES modules. The logic is split between rendering/routing functionality and reusable helper functions.

The dashboard is dynamically rendered from a single JSON endpoint and displays business analytics including:

- Total products
- Customers
- Sales
- Invoices
- Low stock warnings
- Top-selling products

The application additionally includes:

- Custom user roles
- Account status handling
- Failed login tracking
- Printable invoice layouts
- Dynamic invoice calculations, including automatic total, paid, and remaining amount tracking per invoice
- Search functionality
- Relational database modeling

Altogether, this project combines backend architecture, frontend dynamic rendering, relational database design, business workflow management, and responsive UI behavior into one integrated system.

---

# Features

## Authentication System

The application includes:

- Login
- Registration
- Logout
- Session validation

Newly registered accounts automatically start with an `on_hold` status until approved by an administrator.

The custom user model also supports:

- Roles:
  - super_admin
  - admin
  - viewer
  - tester
  - seller

- Account statuses:
  - working
  - on_hold
  - blocked

The system also tracks failed login attempts.

---

## Dashboard

The dashboard displays important business information dynamically, including:

- Total products
- Total customers
- Total invoices
- Total sales
- Today's sales
- Low-stock warnings
- Top-selling products

All dashboard data is rendered client-side from a single JSON endpoint.

---

## Invoice Creation System

The invoice creation page is the core feature of the application.

Users can:

- Select existing customers
- Create new customers
- Add optional prescriptions
- Add multiple invoice items dynamically

Each invoice item supports three sources:

### Inventory Source
Uses existing products from stock and automatically fills pricing information. Frame products additionally auto-fill their stored category (Medical or Sunglasses) as a read-only field.

### Order Source
Allows special supplier orders that are not yet in inventory. Order items are tracked separately depending on type (frame-based items vs. lens-based items with sphere/cylinder specifications).

### Custom Source
Allows custom services, repairs, or manual entries without requiring inventory records.

---

## Payment Tracking

Each invoice tracks the total amount, paid amount, and remaining amount owed. The total is calculated automatically from invoice item subtotals, and the remaining amount updates automatically whenever the paid amount changes.

---

## Prescription Support

The system supports optical prescriptions including:

- Right eye and left eye measurements
- Sphere
- Cylinder
- Axis
- IPD
- Reading prescriptions
- Distance prescriptions

Prescriptions can optionally be linked to invoices, and the printed invoice only displays a prescription section when prescription data actually exists.

---

## Search Functionality

Invoices can be searched using:

- Invoice ID
- Customer name
- Customer phone number (either field alone, or both together)

Results are displayed as interactive cards.

---

## Invoice Printing

The application includes a print-friendly invoice page optimized for A4 paper.

The printable invoice contains:

- Customer information
- Itemized products
- Prescription details (only shown when a prescription exists)
- Totals, paid amount, and remaining amount
- Payment information
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
- Bootstrap 5
- Custom CSS

## Database
- SQLite (during development)
- Django ORM relationships

## Additional Packages
- phonenumber_field

---

# Project Structure

## Main Backend Files

### `models.py`
Contains all database models including:

- User
- Product
- Customer
- Prescription
- Invoice
- InvoiceItem
- OrderItem
- OrderLens

### `views.py`
Handles backend logic and JSON responses.

### `urls.py`
Defines application routes.

---

## Frontend Templates

### `layout.html`
Acts as the main shared layout template across the application.
It contains the common page structure, Bootstrap imports, navigation layout, CSS and JavaScript module imports, and shared UI elements rendered across multiple pages.

### `index.html`
Extends `layout.html` and contains the main application container where dashboard and dynamic frontend content are rendered using JavaScript.

### `login.html`
Extends `layout.html` and contains the authentication form used for user login, including CSRF protection and input fields for username and password.

---

## Frontend Files

### `scripts.js`
Contains frontend rendering and page logic.

### `helpers.js`
Contains reusable helper functions shared across the application.

### `styles.css`
Contains custom styling for the application.

---

# Database Models

## Product
Represents store inventory items including:

- Frames
- Lenses
- Contact lenses
- Accessories

Tracks:
- Barcode
- Quantity
- Purchase price
- Selling price
- Frame category (Medical or Sunglasses), used to auto-fill the invoice item form when a frame is selected

---

## Customer
Stores customer information including:

- Name
- Phone number
- Email

---

## Prescription
Stores optical prescription information for both eyes.

---

## Invoice
Represents customer invoices and payment tracking, including total price, paid amount, and remaining amount.

---

## InvoiceItem
Represents line items inside invoices.

Supports:
- Inventory items
- Order items
- Custom items

---

## OrderItem
Tracks supplier order details (item color, supplier, notes, receipt status) for invoice items that are frame-type special orders rather than existing inventory stock.

---

## OrderLens
Tracks supplier order details for lens-type special orders, including lens type (optical or contact), sphere, cylinder, lens usage, and lens color, in addition to supplier and receipt status.

---

# Frontend Architecture

The frontend uses Vanilla JavaScript ES modules instead of frontend frameworks.

The logic is separated into multiple files to improve maintainability and organization.

Dynamic rendering is heavily used throughout the application, especially in:

- Dashboard rendering
- Invoice item generation
- Search results
- Dynamic forms

---

# Mobile Responsiveness

The application was designed to be responsive using Bootstrap 5 and custom CSS.

Layouts adapt to smaller screens and mobile devices to ensure usability across different device sizes.

---

# Future Improvements

The following systems are scaffolded but intentionally hidden from navigation until completed:

- Inventory management UI
- Accounting system
- Reports
- Customer management pages
- Settings page

While the core system is complete and functional, the following areas are natural directions for future expansion:

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
````

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
 
````bash
cd backend
````

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

The application focuses on solving real-world optical store workflow problems rather than functioning as a traditional online store.

The project intentionally emphasizes:

* Dynamic frontend behavior
* Relational database design
* Business workflow management
* Modular JavaScript architecture
* Practical usability for store employees

The core system — authentication, invoice creation, prescriptions, search, printing, and the dashboard — is complete and functional. The items listed under Future Improvements are optional extensions beyond the scope of this submission.