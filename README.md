# Find Me India 🔍
### Missing People Awareness Through E-commerce Parcels

---

## 🚀 Quick Start

### 1. Install MongoDB Community Edition
Download and install from: https://www.mongodb.com/try/download/community

After installing, start it:
```bash
# Windows
net start MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### 2. Start the Server
```bash
npm install          # Install dependencies (already done)
npm start            # Starts on http://localhost:5000
# or
npm run dev          # With auto-restart (nodemon)
```

### 3. Open the App
Visit: http://localhost:5000

---

## 👤 Default Accounts (create via Sign Up)

| Role    | How to sign up          | Admin Key      |
|---------|------------------------|----------------|
| User    | Normal signup           | —              |
| NGO     | Select NGO role         | —              |
| Police  | Select Police role      | —              |
| Company | Select Company role     | —              |
| Admin   | Select Admin + key      | `admin@2024`   |

---

## 📋 Feature Walkthrough

### Add a Missing Person
1. Login → Click "Add Case"
2. Fill form → Upload photo → Submit
3. Status starts as **Pending**

### Admin Approval (Admin login required)
1. Go to Admin Panel
2. Click ✅ on pending case → **Verified**
3. Assign a company via 🏢 button

### Company Label & PDF (Company login required)
1. Go to Company Panel
2. Click "Generate Label" on verified case
3. Preview the parcel label with photo + QR code
4. Click "Download PDF" → A6 size PDF
5. Click "Mark Printed" when done

### QR Code
- Auto-generated when case is added
- Opens detail page with full info

### Report Sighting
- On any detail page → "Report Sighting"
- Fill location + message + optional photo
- Admin can see all reports in Admin Panel

---

## 🗂️ Project Structure

```
📦 Finde me india/
├── server.js              # Express entry point
├── .env                   # MongoDB URI + JWT secret
├── models/                # Mongoose schemas
│   ├── User.js
│   ├── MissingPerson.js
│   └── Sighting.js
├── routes/                # API routes
│   ├── auth.js            # POST /api/auth/signup, /login
│   ├── persons.js         # CRUD for missing persons
│   ├── admin.js           # Admin management
│   ├── company.js         # Company panel API
│   └── sightings.js       # Sighting reports
├── middleware/
│   └── auth.js            # JWT + role guard
├── uploads/               # Uploaded photos (auto-created)
└── public/                # Frontend (HTML + CSS + JS)
    ├── index.html          # Home page
    ├── login.html          # Auth page
    ├── add-person.html     # Report missing person
    ├── detail.html         # Person details + map + QR
    ├── dashboard.html      # User's cases
    ├── admin.html          # Admin panel
    ├── company.html        # Company panel + label generator
    ├── report.html         # Report sighting
    ├── css/style.css       # Main stylesheet
    └── js/api.js           # Shared API + utilities
```

---

## 🛠️ Technologies Used

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | HTML5, CSS3, Vanilla JS     |
| Backend   | Node.js + Express           |
| Database  | MongoDB + Mongoose          |
| Auth      | JWT (jsonwebtoken)          |
| Uploads   | Multer                      |
| QR Codes  | qrcode (npm) — server-side  |
| PDF       | jsPDF — client-side         |
| Maps      | Leaflet.js + OpenStreetMap  |
| Fonts     | Google Fonts (Inter)        |

---

## 🆘 Helplines
- National Missing Persons: 1800-180-1234
- Police: 100
- Missing Child: 1098
