# TransitOps — Smart Transport Operations Platform

TransitOps is a modern, high-fidelity enterprise transport management suite designed to replace fragile spreadsheets and manual logbooks. It provides real-time fleet analytics, enforces strict cargo capacity limits, monitors driver safety scores, schedules proactive vehicle maintenance, logs fuel consumption, tracks operational expenses, and offers secure Role-Based Access Control (RBAC).

---

## 🏗️ Project Architecture

This application is built with a decoupled Client-Server architecture:

```
Transitops-HackathonADi/
├── client/                  # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/      # Shared modular UI components
│   │   ├── pages/           # View modules (Dashboard, Registry, Roster, Planner, Shop, Ledger)
│   │   ├── services/        # HTTP API library integration
│   │   ├── assets/          # Global styles, fonts, variables
│   │   ├── App.jsx          # Auth routing wrapper and top level state
│   │   └── main.jsx         # React application bootstrap
│   └── package.json
│
├── server/                  # Node.js + Express API Backend Server
│   ├── config/              # Local database file seeding configuration
│   ├── controllers/         # Business logic layer (validation and routing controllers)
│   ├── middleware/          # Security (JWT) and RBAC verification rules
│   ├── models/              # JSON database transactional helper models
│   ├── server.js            # Express bootstrap and listener
│   └── verify.js            # Programmatic test validation suite
│
├── README.md                # System documentation
└── .gitignore               # Ignored build configurations
```

### Tech Stack
- **Frontend**: React (Vite), ES6 JavaScript, HTML5 Semantics, Vanilla CSS Custom Properties (Dark mode, glassmorphic layout, micro-animations, SVG graphing engine).
- **Backend**: Node.js, Express.js, JWT (JSON Web Tokens), BcryptJS.
- **Storage**: JSON-based file storage synced to disk via transactional I/O operations (`server/config/db.json`).

---

## 🔒 Security & Role-Based Access Control (RBAC)

Authentication is handled securely using JWT bearer headers. The platform segregates actions based on corporate profiles:

| System Module | Fleet Manager | Driver | Safety Officer | Financial Analyst |
| :--- | :---: | :---: | :---: | :---: |
| **KPI Dashboard & Visual Charts** | Read | Read | Read | Read |
| **Vehicle Registry & ROI Statistics** | CRUD | Read | - | Read |
| **Driver Roster & Safety Scores** | CRUD | Read | CRUD | - |
| **Trip Dispatch & Lifecycle** | CRUD | CRUD | Read | - |
| **Maintenance Shop Logs** | CRUD | - | - | - |
| **Expense & Fuel Ledger** | CRUD | Log Fuel | - | CRUD |

---

## 🔄 Automated Business Rules Engine

The backend enforces strict constraints on database state transitions:
1. **Capacity Validation**: Rejects any trip if cargo weight exceeds the assigned vehicle's load capacity.
2. **Compliance Verification**: Locks drivers from dispatching if they have suspended licenses or if the license expiry date is past the current local date.
3. **Dispatch Locking**: Changes both vehicle and driver statuses to `On Trip` on dispatch, removing them from subsequent selector pools to prevent double-booking.
4. **Restoration States**: Completing or cancelling trips instantly returns the driver and vehicle statuses to `Available`.
5. **Shop Sequestration**: Putting a vehicle in active maintenance automatically switches its registry status to `In Shop` (removing it from trip planners). Resolving maintenance restores it to `Available` (unless retired).
6. **Ledger Syncing**: Completing trips automatically prompts for final odometer and fuel consumed, which generates real-time Fuel Logs and corresponding Expense Ledger rows.

---

## 🚀 Setting Up the Application

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or above recommended)
- `npm` (packaged with Node.js)

### 1. Backend Server Setup
Navigate to the `server/` directory, install packages, and start the node process on port **5001**:
```bash
cd server
npm install
PORT=5001 npm start
```
*The server will boot up and pre-seed `/server/config/db.json` with initial mock records for vehicles, drivers, trips, maintenance, and expense ledgers.*

### 2. Frontend Client Setup
In a new terminal window, navigate to the `client/` directory, install packages, and start the dev server:
```bash
cd client
npm install
npm run dev
```
*Open **[http://localhost:5173/](http://localhost:5173/)** in your browser to view the application.*

---

## 🧪 Verification & Programmatic Testing

We have built a dedicated programmatic testing pipeline to verify all business rules logic.

To run the test assertions, navigate to the `server` directory and execute the verification test runner:
```bash
cd server
node verify.js
```

This runner asserts:
- Creation of draft trips with over-capacity cargo fails (400 validation error).
- Dispatching a trip locks vehicle/driver status to `On Trip`.
- Completing a trip updates the vehicle's odometer, registers fuel consumption, writes fuel logs/expenses, and restores status.
- Adding a vehicle to maintenance locks it to `In Shop` and prevents dispatch planner selection.
- Completing maintenance returns the vehicle to `Available`.

---

## ⚡ Interactive Workflow Walkthrough (1-Click Demo)

We have embedded a single-click simulation directly in the UI dashboard for easy evaluation:
1. Log in as a **Fleet Manager** (`manager@transitops.com` / `manager123`).
2. At the top of the **Dashboard**, click the green button labeled **`⚡ Run Demo Workflow (Steps 1-9)`**.
3. A modal will pop up, demonstrating the step-by-step transaction logs as they complete in the database.
4. When you close the modal, the dashboard KPIs, operational cost ledgers, fuel efficiency stats, and SVG charts will refresh to display the newly simulated outcomes.

