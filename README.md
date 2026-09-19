# SplitPay — On-Device UPI Payment Splitter

[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-emerald.svg)](#offline-first--pwa)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20On--Device-blue.svg)](#privacy--security-guarantee)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

**SplitPay** is a private, secure, and offline-capable Progressive Web App (PWA) designed to split large Unified Payments Interface (UPI) payments into smaller, compliant installments. Built with a strict **100% on-device architecture**, SplitPay ensures that financial details, UPI Virtual Payment Addresses (VPAs), payee names, and amounts are never transmitted to external servers.

---

## Key Features

### 1. Flexible Input Methods
- **Camera QR Scanner**: Real-time camera viewfinder to scan printed or digital UPI QR codes instantly on mobile or desktop.
- **QR Image Upload**: Drag-and-drop or select any saved UPI QR screenshot or receipt image for local on-device decoding via `jsQR`.
- **UPI Deep Link / String Paste**: Paste raw `upi://pay?...` URLs directly from banking apps or messaging platforms.
- **Manual UPI Entry**: Enter the Payee UPI ID (`pa`), Payee Name (`pn`), Total Amount (`am`), and optional Transaction Note (`tn`) manually.

### 2. Intelligent Split Engine
- **Equal Splits**: Divide amounts into 2 to 10 equal parts with automated paise-precision rounding and remainder balancing.
- **Custom Splits**: Allocate custom installment amounts with live validation against the total bill.
- **NPCI Specification Compliance**: Generates standard `upi://pay` URI schemes retaining original transaction references (`tr`), merchant codes (`mc`), and payee parameters (`pa`, `pn`).

### 3. Interactive Payment Dashboard
- **Sequential QR Codes**: Live QR codes rendered for each split installment ready for scanning by any UPI app.
- **One-Tap App Launchers**: Direct deep links to open payments in **Google Pay**, **PhonePe**, **Paytm**, or the default UPI intent handler.
- **Live Payment Tracking**: Checkboxes to toggle installments as *Paid* or *Pending* with real-time remaining balance calculations.
- **Settlement Export & Print**: Generate a clean, printable settlement receipt or save it to PDF for offline accounting.

### 4. 100% Offline & PWA Support
- **Air-Gapped Operation**: Runs completely in offline mode without requiring internet connectivity.
- **Service Worker Caching**: Pre-caches application chunks, icons, web manifests, and Google Fonts using Workbox (`generateSW`).
- **Installable**: Adds to Home Screen on Android, iOS, Windows, and macOS with native app-like experience.

### 5. Desktop & Mobile Optimized UI
- **Fixed PC Sidebar**: Unmovable desktop navigation sidebar on PC displays for easy access to history, settings, and new splits.
- **Mobile Bottom Navigation**: Ergonomic bottom navigation bar with 44px+ touch targets on mobile devices.
- **Dark Mode & Privacy Mode**: Toggle between high-contrast dark and light themes, plus a quick privacy toggle to mask sensitive numbers on screen.

---

## Privacy & Security Guarantee

SplitPay operates entirely client-side inside the browser sandbox:
- **No Backend Database**: No user data, transaction histories, or payment details are stored on remote servers.
- **Local Storage Only**: Split history and active sessions are stored strictly in your browser's local sandbox (`localStorage`).
- **Zero Third-Party Tracking**: No telemetry, no ad trackers, and no external analytics scripts.

---

## Search Engine Optimization (SEO) & Google Verification

SplitPay is optimized for discovery across search engines:
- **Google Site Verification**: Configured in the `<head>` of the root `index.html`:
  ```html
  <meta name="google-site-verification" content="6uZW0WTASXd00HUE8F-DWCmhRtlbvjr_QqS8YmVjqY8" />
  ```
- **Robots & Sitemap**:
  - `/robots.txt`: Grants open access to all search crawlers (`User-agent: *`, `Allow: /`).
  - `/sitemap.xml`: XML sitemap pointing to the canonical application endpoints.
- **Structured Data (JSON-LD)**: Schema.org `WebApplication` and `FAQPage` metadata embedded in the root `index.html` for rich search results.
- **Social Cards**: Full OpenGraph (`og:*`) and Twitter card (`twitter:*`) tags for shareable links on WhatsApp, LinkedIn, X, and Facebook.

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI component architecture and state management |
| **TypeScript** | Strict compile-time type safety and data models |
| **Vite 6** | High-performance build tool and dev server |
| **Tailwind CSS** | Utility-first, responsive styling and theme variables |
| **Motion (`motion/react`)** | Fluid page transitions and micro-interactions |
| **vite-plugin-pwa** | Service worker generation and offline cache management |
| **jsQR** | High-speed browser QR code computer vision decoding |
| **qrcode** | High-resolution SVG and Canvas QR code generation |
| **Lucide React** | Accessible, clean UI iconography |

---

## Project Structure

```
├── index.html              # Main HTML entry point with Google SEO verification
├── metadata.json           # Application metadata and capabilities
├── package.json            # Dependencies and build scripts
├── vite.config.ts          # Vite & PWA Service Worker configuration
├── public/
│   ├── robots.txt          # Search engine crawler permissions
│   ├── sitemap.xml         # XML sitemap
│   ├── manifest.json       # Web App Manifest
│   ├── icon.svg            # Vector app icon
│   └── pwa-*.png           # High-resolution PWA icons
├── src/
│   ├── App.tsx             # Root application coordinator and view controller
│   ├── main.tsx            # React application bootstrap
│   ├── index.css           # Global Tailwind stylesheet
│   ├── components/         # Reusable UI components
│   │   ├── Header.tsx      # Top bar with theme & privacy toggles
│   │   ├── Sidebar.tsx     # Fixed desktop navigation sidebar
│   │   ├── BottomNavigation.tsx # Mobile navigation bar
│   │   ├── QRUploader.tsx  # Drag & drop QR scanner
│   │   ├── QRScanner.tsx   # Live camera QR scanner
│   │   ├── SplitResultsView.tsx # Sequential split QR generator
│   │   ├── HistoryPage.tsx # Local payment history viewer
│   │   └── OfflineIndicator.tsx # Offline status notification banner
│   ├── lib/
│   │   ├── splitEngine.ts  # Paise-precision math and split balancing
│   │   ├── upiParser.ts    # UPI URI validation and parameter extraction
│   │   ├── upiBuilder.ts   # RFC-compliant UPI URL generation
│   │   └── qrGenerator.ts  # Canvas QR generator
│   └── utils/
│       ├── currency.ts     # Currency formatting & paise math
│       ├── historyStorage.ts # LocalStorage history manager
│       └── activeSessionStorage.ts # Session persistence manager
└── README.md               # Project documentation
```

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/satyamrojhax/splitpay.git
cd splitpay
npm install
```

### Running Locally
Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
Create an optimized production bundle with pre-cached PWA service worker:
```bash
npm run build
```
The output will be placed in the `dist/` directory.

### Type-Checking & Linting
Validate the codebase against TypeScript rules:
```bash
npm run lint
```

---

## Author

**Satyam RojhaX**
- Email: satyamrojhax@gmail.com
- Application: [SplitPay Online](https://splittopay.vercel.app)

---

## License

This project is open-source and available under the [MIT License](LICENSE).
