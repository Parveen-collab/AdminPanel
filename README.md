# Admin Dashboard - Complete Structure

## 📁 Folder Structure

```
admin-dashboard/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/                          # All API calls centralized
│   │   ├── apiConfig.ts             # Axios configuration
│   │   ├── authApi.ts               # Authentication APIs
│   │   └── adminUserApi.ts          # Admin user APIs
│   │
│   ├── components/                   # Reusable components
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── Charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── PieChart.tsx
│   │   │
│   │   ├── Filters/
│   │   │   ├── DateFilter.tsx
│   │   │   ├── SearchFilter.tsx
│   │   │   └── FilterPanel.tsx
│   │   │
│   │   ├── UserManagement/
│   │   │   ├── UserTable.tsx
│   │   │   └── UserCard.tsx
│   │   │
│   │   └── common/
│   │       ├── Loading.tsx
│   │       ├── ErrorAlert.tsx
│   │       └── ThemeToggle.tsx
│   │
│   ├── context/                      # React Context
│   │   └── ThemeContext.tsx
│   │
│   ├── pages/                        # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── UserManagement.tsx
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useTable.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── dateUtils.ts
│   │   └── formatters.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   ├── constants/                    # Constants
│   │   ├── colors.ts
│   │   └── routes.ts
│   │
│   ├── App.tsx
│   └── index.tsx
│
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Features

### ✅ Implemented Features:
1. **Authentication** - Login with JWT
2. **Theme System** - Dark/Light/System mode
3. **Responsive Design** - Mobile, Tablet, Desktop
4. **User Management** - CRUD with filters
5. **Advanced Filtering** - Date, location, referral code
6. **Charts** - Monthly, distribution charts
7. **Statistics** - Dashboard stats
8. **Sidebar Navigation** - Collapsible sidebar
9. **API Service Layer** - Centralized API calls
10. **Clean Architecture** - Component-based

### 📊 Pages:
- Login
- Dashboard (Stats & Charts)
- User Management (Table with filters)

### 🎯 Technical Stack:
- React 18
- TypeScript
- Material-UI (MUI)
- Axios
- Recharts
- React Router
- React Context API

## 🚀 Getting Started

### Installation:
```bash
cd admin-dashboard
npm install
```

### Development:
```bash
npm start
```

### Build:
```bash
npm run build
```

## 📝 Environment Variables

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:8080
```

## 🔐 API Endpoints Used:
- POST /users/admin/users - Get all users with filters
- GET /users/admin/users/:id - Get user by ID
- GET /users/admin/users/stats - Get statistics
- GET /users/admin/users/stats/monthly - Monthly charts
- GET /users/admin/users/stats/distribution/state - State distribution
- GET /users/admin/users/stats/distribution/pincode - Pincode distribution
- GET /users/admin/users/stats/distribution/location - Location distribution

