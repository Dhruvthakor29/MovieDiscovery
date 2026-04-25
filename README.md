# 🎬 MyMovie — Upgraded

A full-stack React movie app with MongoDB auth, watchlist, favourites, trending, popular, and top-rated sections.

## Stack
- **Frontend**: React 18, Vite, TailwindCSS v4, React Router v7
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **API**: TMDB (The Movie Database)

---

## 📁 Project Structure

```
myMovie-upgraded/
├── backend/          ← Express + MongoDB API
│   ├── src/
│   │   ├── index.js
│   │   ├── config/db.js
│   │   ├── middleware/auth.js
│   │   ├── models/User.js
│   │   ├── models/SearchCount.js
│   │   └── routes/
│   │       ├── auth.js      ← /register, /login, /me
│   │       ├── movies.js    ← trending search count
│   │       └── user.js      ← watchlist & favourites
│   ├── .env.example
│   └── package.json
│
└── frontend/         ← React app (drop-in replacement for myMovie/src)
    ├── src/
    │   ├── context/AuthContext.jsx   ← global auth + watchlist/fav state
    │   ├── components/
    │   │   ├── Navbar.jsx            ← nav with auth dropdown
    │   │   ├── AuthModal.jsx         ← login/register modal
    │   │   ├── movieCard.jsx         ← card with 🔖❤️ actions
    │   │   ├── MovieDetail.jsx
    │   │   ├── search.jsx
    │   │   └── spinner.jsx
    │   └── pages/
    │       ├── Home.jsx              ← trending + all movies
    │       ├── MovieGridPage.jsx     ← reusable Popular/Top Rated
    │       ├── WatchlistPage.jsx
    │       └── FavouritesPage.jsx
    ├── .env.local
    └── package.json
```

---

## 🚀 Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mymovie
JWT_SECRET=your_random_secret_here
JWT_EXPIRES_IN=7d
```

> Make sure MongoDB is running locally (`mongod`) or use a MongoDB Atlas URI.

```bash
npm run dev   # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend   # (or your existing myMovie folder with replaced files)
npm install
```

Your `.env.local` already has the TMDB token. Then:

```bash
npm run dev   # starts on http://localhost:5173
```

---

## ✨ Features Added

| Feature | Details |
|---|---|
| **User Auth** | Register / Login / Logout with JWT + bcrypt |
| **Session Persistence** | Token stored in localStorage, restored on reload |
| **Navbar** | Responsive nav with auth dropdown, mobile hamburger |
| **Popular Movies** | `/popular` — paginated TMDB popular endpoint |
| **Top Rated Movies** | `/top-rated` — paginated TMDB top_rated endpoint |
| **Watchlist** | Add/remove movies, persisted in MongoDB |
| **Favourites** | Add/remove movies, persisted in MongoDB |
| **Trending Searches** | Search counts stored in MongoDB (replaced Appwrite) |
| **Protected Routes** | Watchlist/Favourites redirect to auth modal if not logged in |
| **MovieCard Actions** | Hover to reveal 🔖 Watch + ❤️ Like buttons |

---

## 🔌 API Endpoints

### Auth
| Method | Path | Body | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | `{username, email, password}` | No |
| POST | `/api/auth/login` | `{email, password}` | No |
| GET | `/api/auth/me` | — | Bearer |

### User
| Method | Path | Auth |
|---|---|---|
| GET | `/api/user/watchlist` | Bearer |
| POST | `/api/user/watchlist` | Bearer |
| DELETE | `/api/user/watchlist/:movieId` | Bearer |
| GET | `/api/user/favourites` | Bearer |
| POST | `/api/user/favourites` | Bearer |
| DELETE | `/api/user/favourites/:movieId` | Bearer |

### Movies
| Method | Path | Auth |
|---|---|---|
| POST | `/api/movies/search-count` | No |
| GET | `/api/movies/trending-searches` | No |
