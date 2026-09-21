# Remix of Brand Builder Hub

Build a modern, professional, premium business website based **only on the information, products, services, images, and overall branding available from this Instagram profile:**

[Instagram — @fts88994](https://www.instagram.com/fts88994?utm_source=chatgpt.com)

Do not assume the business is a restaurant, hotel, real estate company, or any other specific industry unless it is clearly indicated by the Instagram profile.

The website should function as a flexible business website where the owner can showcase and manage their own products and services.

## MAIN REQUIREMENT

The website must include:

1. A professional public-facing website
2. A secure Admin Panel
3. A database connected to the website
4. Product management
5. Service management
6. Image management
7. Editable business information
8. WhatsApp/contact functionality
9. Mobile-responsive design

The owner must be able to manage the website without editing code.

---

## DESIGN DIRECTION

Study the branding and visual identity shown on the Instagram profile and create a website that feels consistent with it.

Use the Instagram profile as the primary reference for:

- Business identity
- Visual style
- Product/service presentation
- Images
- Brand personality
- Colors where appropriate
- Content structure
- Types of products/services shown

Do not invent a completely different business identity.

Do not use restaurant-specific layouts or terminology unless the Instagram profile clearly indicates that this is a restaurant.

Do not add unrelated demo content.

---

# PUBLIC WEBSITE

### Header

Create a clean responsive header containing:

- Business logo/name
- Home
- About
- Products
- Services
- Gallery
- Contact
- WhatsApp/contact CTA

Use a mobile hamburger menu.

---

### Hero Section

Create a premium hero section inspired by the Instagram profile.

Use appropriate imagery from the business identity.

Include:

- Strong business headline
- Short description
- Primary CTA
- Secondary CTA
- Contact/WhatsApp button

Keep the wording editable through the Admin Panel.

---

### About

Create an About section based on the business information available from Instagram.

Include:

- Business introduction
- What the business offers
- Key strengths
- Relevant images

All text and images should be editable from the Admin Panel.

---

# PRODUCTS

Create a dynamic product catalog.

Each product should support:

- Product name
- Category
- Main image
- Additional images
- Short description
- Full description
- Price, if applicable
- Availability/status
- Featured toggle
- WhatsApp enquiry button

Create attractive product cards.

Customers should be able to open a product to see its full details.

### Product Search & Filtering

If there are enough products, provide:

- Search
- Category filtering
- Featured products
- Sorting

---

# SERVICES

Create a separate dynamic Services section.

Each service should support:

- Service name
- Image
- Short description
- Detailed description
- Price, if applicable
- Featured toggle
- Contact/WhatsApp button

Services must be completely manageable from the Admin Panel.

---

# GALLERY

Create a professional image gallery based on the visual content of the Instagram profile.

Allow the owner to:

- Upload images
- Delete images
- Change image titles
- Add descriptions
- Reorder images

Images should open in a larger lightbox when clicked.

---

# CONTACT

Create a dedicated contact section containing editable:

- WhatsApp number
- Phone number
- Email
- Address/location, if applicable
- Business hours, if applicable
- Instagram
- Other social media links

Include prominent WhatsApp/contact buttons throughout the website.

---

# WHATSAPP

Add WhatsApp enquiry buttons to products and services.

The WhatsApp number must be editable from the Admin Panel.

When a customer clicks a product enquiry button, generate a message such as:

"Hello, I am interested in [PRODUCT NAME]. Could you please provide more information?"

For services:

"Hello, I am interested in [SERVICE NAME]. Could you please provide more information?"

---

# ADMIN PANEL

Create a secure Admin Panel for the business owner.

The dashboard should include:

- Overview
- Products
- Services
- Categories
- Gallery
- Website Content
- Contact Information
- Social Media
- Settings

---

## PRODUCT MANAGEMENT

Admin must be able to:

- Add products
- Edit products
- Delete products
- Upload product images
- Add multiple product images
- Change product name
- Change description
- Change price
- Change category
- Change availability
- Feature/unfeature products
- Reorder products

Changes must automatically appear on the public website.

---

## SERVICE MANAGEMENT

Admin must be able to:

- Add services
- Edit services
- Delete services
- Upload service images
- Change service descriptions
- Change pricing
- Feature/unfeature services
- Reorder services

---

## GALLERY MANAGEMENT

Admin must be able to:

- Upload images
- Delete images
- Edit image information
- Reorder images

---

## WEBSITE CONTENT MANAGEMENT

Allow the owner to edit:

- Hero heading
- Hero description
- Hero image
- About section
- Why choose us
- CTA sections
- Contact information
- Social media links
- Footer information

---

# DATABASE

Use Supabase or an equivalent proper backend/database.

Store dynamically:

- Products
- Product categories
- Services
- Gallery images
- Website content
- Contact information
- Social media information
- Admin users

Do not hard-code products and services into the frontend.

---

# AUTHENTICATION

Create a secure Admin login.

Requirements:

- Login
- Logout
- Protected dashboard
- Protected admin routes
- Only authorized users can modify website content

---

# RESPONSIVE DESIGN

The public website and Admin Panel must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

Use a clean responsive layout with professional spacing and typography.

---

# IMPORTANT

The website should be built as a **real editable business website**, not just a visual landing-page mockup.

The owner should be able to independently:

- Add a new product
- Edit a product
- Delete a product
- Change product images
- Add a new service
- Edit a service
- Delete a service
- Upload gallery images
- Change prices
- Update WhatsApp/contact details
- Update basic website content

No coding should be required for these tasks.

Use the Instagram profile as the source of the business's visual direction and available information, while keeping all business content editable through the Admin Panel.

Do not invent specific products, services, prices, claims, or business details that are not supported by the Instagram profile.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/542b558c-a840-4f8d-bdd5-bff81f6f457d).

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
