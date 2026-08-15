# AR Menu Magic

Build a polished, production-quality WebAR Smart Restaurant Menu platform with a public customer-facing website and a secure admin panel.

The concept is:

Admin adds a food product → uploads product image + 3D GLB model → system automatically creates an AR product page → generates a QR code → admin can download a professionally designed printable menu card containing the product information + QR code.

This is an interview/MVP demo, so keep the system focused and polished. Do not add unnecessary restaurant ordering features.

---

1. PUBLIC CUSTOMER WEBSITE

Create a premium restaurant website for a fictional restaurant:

Restaurant Name: La Piazza

Create:

Home Page

Include:

- Restaurant logo/name

- Hero section

- Short restaurant introduction

- "Explore Our AR Menu" CTA

- Featured products

- Explanation of how AR menu works

Use a premium Italian restaurant visual style:

- elegant

- modern

- warm

- food-focused

- mobile-first

- professional animations

- clean typography

- rounded cards

---

2. PUBLIC MENU PAGE

Create:

"/menu"

Display all published products as cards.

Each product card should show:

- Product image

- Product name

- Short description

- Price

- "View in AR" button

Clicking a product opens:

"/menu/:productSlug"

---

3. AR PRODUCT PAGE

Each product must have its own public page.

Example:

"/menu/margherita-pizza"

Display:

- Product image

- Product name

- Description

- Price

- Product details

- 3D viewer

- Large "View in AR" button

Use Google's "<model-viewer>" Web Component.

Each product must load its own uploaded ".glb" model dynamically.

Example:

<model-viewer

  src="/models/product.glb"

  ar

  ar-modes="webxr scene-viewer quick-look"

  camera-controls

  auto-rotate

  shadow-intensity="1"

  alt="3D food product">

</model-viewer>

The user should be able to:

- rotate the 3D model

- zoom

- inspect the product

- use AR on supported mobile devices

- place the product on a real-world surface

If AR isn't supported, automatically provide a 3D fallback.

Show an appropriate message such as:

"AR isn't supported on this device. You can still explore this product in 3D."

Do not fake AR functionality.

---

4. QR CODE SYSTEM

Every published product must automatically receive a unique QR code.

The QR code must point to that product's public AR page.

Example:

Product:

Margherita Pizza

URL:

"/menu/margherita-pizza"

QR code:

Scanning it should open the exact product AR page.

The QR code should be generated automatically when the product is published.

Use a reliable client-side QR-code library.

Allow the admin to:

- view QR code

- download QR code as PNG

- download QR code as SVG

- copy product URL

---

5. ADMIN PANEL

Create a secure-looking admin dashboard.

Route:

"/admin"

Create a login screen:

- Email

- Password

- Login button

For this MVP, authentication can use a simple demo authentication system, but structure the code so it can later be connected to Supabase/Firebase or another backend.

After login, show:

Dashboard

Statistics:

- Total Products

- Published Products

- Draft Products

- Total QR Codes

Recent products list.

---

6. ADMIN — ADD PRODUCT

Create:

"/admin/products/new"

Form fields:

Basic Information

- Product Name

- Product Slug

- Description

- Price

- Category

- Ingredients

- Featured toggle

- Published toggle

Product Image

Allow admin to upload:

"JPG / JPEG / PNG / WEBP"

Show image preview.

3D Model

Allow admin to upload:

".GLB"

Show:

- file name

- file size

- upload status

- 3D preview

The uploaded GLB must be associated with that specific product.

The AR viewer on the public product page must dynamically use this GLB.

---

7. PRODUCT MANAGEMENT

Create:

"/admin/products"

Show a professional table/grid containing:

- Product image

- Product name

- Price

- Category

- Status

- 3D model status

- QR code

- Created date

Actions:

View

Edit

Duplicate

Download QR

Download Menu

Delete

---

8. EDIT PRODUCT

Admin should be able to edit:

- Name

- Description

- Price

- Category

- Ingredients

- Product image

- GLB model

- Published status

If the GLB model is replaced, the public AR page should automatically use the new model.

---

9. AUTOMATIC MENU CARD DESIGN

This is a VERY IMPORTANT feature.

For every product, automatically generate a beautiful printable AR menu card.

Example design:

---

LA PIAZZA

[PRODUCT IMAGE]

🍕 MARGHERITA PIZZA

Fresh mozzarella, tomato sauce,

basil and crispy golden crust.

₹299

   [ QR CODE ]

SCAN TO VIEW

THIS PIZZA IN AR

"See it before you order"

---

The menu card should look like a real premium restaurant menu/standee.

The QR code must be unique to that product.

The product image, product name, description, price and QR code should be dynamically inserted.

---

10. DOWNLOAD MENU DESIGN

For every product in the admin panel, provide:

"Download Menu"

When clicked, generate a downloadable printable menu design.

Preferred format:

PDF

Also provide:

Download PNG

The generated design should:

- contain the product image

- contain product name

- contain description

- contain price

- contain QR code

- contain restaurant name

- contain "Scan to View in AR"

- have professional spacing

- be print-ready

- look good as a tabletop card or restaurant menu insert

The PDF should be generated dynamically for the selected product.

Do not create a screenshot of the webpage.

Generate a proper printable document/card.

---

11. MENU CARD PREVIEW

Before downloading, allow admin to click:

Preview Menu

Open a preview modal/page showing exactly how the printed card will look.

Buttons:

Download PDF

Download PNG

Download QR

Close Preview

---

12. QR DESIGN

The QR code should be visually integrated into the menu design.

Include a small label underneath:

SCAN TO VIEW IN AR

Optionally include a small phone/AR icon.

Make sure the QR code has sufficient white space around it so it remains reliably scannable.

Do not distort the QR code.

---

13. SAMPLE PRODUCT

Pre-populate the demo with one sample product:

Margherita Pizza

Price:

₹299

Description:

"Classic Italian-style pizza with fresh mozzarella, tomato sauce, basil and a crispy golden crust."

3D model:

Use this placeholder:

"/models/margherita-pizza.glb"

The code must make it easy to replace this placeholder with a real uploaded GLB model.

---

14. DATABASE / DATA STRUCTURE

Structure the application around products.

Product object should contain approximately:

id

name

slug

description

price

category

ingredients

imageUrl

model3dUrl

qrCodeUrl

published

featured

createdAt

updatedAt

Keep the architecture ready for Supabase integration.

If Supabase is available, use it for:

- authentication

- product database

- image storage

- GLB storage

Otherwise implement a clean demo/local data layer that can easily be replaced by Supabase later.

---

15. STORAGE

Uploaded product images and GLB models must be associated with the correct product.

Do not hardcode one GLB for every product.

For example:

Product A:

"pizza.glb"

Product B:

"burger.glb"

Product C:

"pasta.glb"

Each public page must load its own model.

---

16. RESPONSIVE DESIGN

The customer experience must be optimized primarily for mobile.

Test the design concept for:

- Android

- iPhone

- Chrome

- Safari

- Desktop

Admin panel should work well on desktop and tablet.

---

17. TECHNOLOGY

Use:

- React

- TypeScript

- Tailwind CSS

- "<model-viewer>"

- QR code generation library

- PDF generation library

- PNG export

- clean reusable components

Create reusable components:

- Navbar

- ProductCard

- ProductGrid

- ProductViewer

- ARButton

- QRCode

- AdminSidebar

- ProductForm

- ProductTable

- MenuCardPreview

- MenuCardGenerator

- DashboardStats

---

18. IMPORTANT UX FLOW

The complete experience should be:

Restaurant Owner

Admin Login

↓

Add Product

↓

Upload Product Image

↓

Upload 3D GLB Model

↓

Enter Name / Price / Description

↓

Publish

↓

System automatically creates:

Public Product Page

+ 

Unique QR Code

+ 

Printable Menu Design

↓

Admin clicks:

Download Menu

↓

Receives printable PDF/PNG containing:

Product + Price + Image + QR

---

Customer

Customer sees printed menu card.

↓

Scans QR code.

↓

Product AR page opens.

↓

Customer taps:

View in AR

↓

Phone camera/AR experience opens.

↓

Customer places the 3D pizza on the table.

↓

Customer can rotate and inspect it.

---

19. DEMO QUALITY

This is for a developer interview.

Make the result look like a real startup MVP rather than a basic template.

Prioritize:

1. Working product management

2. Working GLB upload/storage architecture

3. Working dynamic 3D viewer

4. Working AR button

5. Unique QR for every product

6. Professional menu-card generator

7. PDF/PNG download

8. Excellent mobile UI

Do NOT add:

- shopping cart

- checkout

- payment gateway

- customer accounts

- delivery system

- order management

- complicated analytics

- unnecessary restaurant ERP features

The core product is:

"Create an AR menu for any food product in a few clicks."

Make the admin workflow extremely simple and make the customer-facing AR experience visually impressive.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c89b0cca-e8f6-436a-93be-e6900b01f649).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
