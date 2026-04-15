# ESP32 LDR Monitor – Web Application

A complete, modern web application to monitor LDR (Light Dependent Resistor) sensor data from an ESP32 microcontroller.

## Features


- **Authentication** – Secure login/register with JWT and bcrypt password hashing
- **Real-time Dashboard** – Live chart updated every few seconds with sensor readings
- **Historical Chart** – 24-hour history visualization
- **Alert System** – Configurable light thresholds with visual notifications
- **Configuration Panel** – Adjustable light ranges and alert thresholds per user
- **Reports** – Export data as CSV or PDF, send reports via email
- **Data Cleanup** – Automatic deletion of data older than configurable retention period
- **ESP32 Status** – Connected/Disconnected indicator based on last reading timestamp
- **Credits Page** – Project info, technology stack, hardware details, API reference

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Backend    | Node.js + Express.js |
| Database   | MySQL |
| Auth       | JWT + bcrypt |
| Frontend   | HTML5, CSS3, Vanilla JavaScript |
| Charts     | Chart.js |
| Email      | Nodemailer |
| PDF        | PDFKit |
| Security   | Helmet, express-rate-limit |

## Project Structure

```
.
├── backend/
│   ├── server.js              # Main Express server
│   ├── package.json
│   ├── config/
│   │   └── database.js        # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── configController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── config.js
│   │   ├── reports.js
│   │   └── data.js            # ESP32 data ingestion + simulate
│   └── utils/
│       ├── emailSender.js
│       └── dataCleanup.js     # Automatic & manual data cleanup
├── frontend/
│   ├── index.html             # Login page
│   ├── register.html
│   ├── dashboard.html
│   ├── config.html
│   ├── reports.html
│   ├── credits.html
│   ├── css/
│   │   ├── style.css          # Global / Auth styles
│   │   ├── dashboard.css      # Dashboard-specific styles
│   │   └── responsive.css     # Mobile breakpoints
│   └── js/
│       ├── main.js            # Shared utilities (Auth, API, Toast)
│       ├── auth.js            # Login/Register logic
│       ├── dashboard.js       # Dashboard polling and rendering
│       ├── charts.js          # Chart.js helpers
│       ├── config.js          # Configuration page
│       └── reports.js         # Reports download/email
├── sql/
│   └── schema.sql             # Full database schema
├── .env.example               # Environment variable template
└── README.md
```

## Quick Start

### Prerequisites

- Node.js ≥ 18
- MySQL 5.7 / 8.x
- npm

### 1. Database Setup

```bash
mysql -u root -p < sql/schema.sql
```

### 2. Environment Configuration

```bash
cp .env.example backend/.env
# Edit backend/.env with your MySQL credentials and SMTP settings
```

### 3. Install Dependencies & Run

```bash
cd backend
npm install
npm start
# Development: npm run dev (uses nodemon)
```

### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000)

Default admin credentials:
- **Username:** `admin`
- **Password:** `Admin1234!` *(change immediately!)*

## ESP32 Integration

Send sensor data from the ESP32 using a simple HTTP POST:

```cpp
// Arduino/ESP32 sketch snippet
#include <WiFi.h>
#include <HTTPClient.h>

const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/data";
const char* jwtToken  = "YOUR_JWT_TOKEN"; // obtained from /api/auth/login

void sendLDRData(int lightValue) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + jwtToken);

  String body = "{\"light_value\":" + String(lightValue) + "}";
  int code = http.POST(body);
  http.end();
}

void loop() {
  int rawValue = analogRead(34); // GPIO34 – ADC pin
  sendLDRData(rawValue);
  delay(5000); // Send every 5 seconds
}
```

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET  | `/api/auth/me` | JWT | Current user info |
| POST | `/api/data` | JWT | Submit sensor reading |
| POST | `/api/data/simulate` | JWT | Generate random readings (demo) |
| DELETE | `/api/data/cleanup` | JWT | Manual data cleanup |
| GET  | `/api/dashboard/latest` | JWT | Latest reading |
| GET  | `/api/dashboard/realtime` | JWT | Last N readings |
| GET  | `/api/dashboard/historical` | JWT | Last 24h data |
| GET  | `/api/dashboard/stats` | JWT | 24h statistics |
| GET  | `/api/dashboard/alerts` | JWT | Alert list |
| PATCH | `/api/dashboard/alerts/:id/read` | JWT | Mark alert as read |
| GET  | `/api/config` | JWT | Get user config |
| PUT  | `/api/config` | JWT | Update user config |
| GET  | `/api/reports/csv?days=N` | JWT | Download CSV |
| GET  | `/api/reports/pdf?days=N` | JWT | Download PDF |
| POST | `/api/reports/send-email` | JWT | Email report |

## Light States

| Estado    | Range (ADC) | Description |
|-----------|-------------|-------------|
| 🌑 Oscuro  | 0 – 1000   | Very low light |
| 🌤️ Medio   | 1001 – 3000 | Medium light |
| ☀️ Brillante | 3001 – 4095 | Bright light |

*Ranges are configurable per user in the Configuration page.*

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT authentication with configurable expiry
- Rate limiting on auth endpoints (20 req/15 min) and API (200 req/15 min)
- Helmet.js security headers
- Input validation on both client and server side

## License

MIT
