import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './components/MovieDetail';
import MovieGridPage from './pages/MovieGridPage';
import WatchlistPage from './pages/WatchlistPage';
import FavouritesPage from './pages/FavouritesPage';

// Route guard for protected pages
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route
          path="/popular"
          element={
            <MovieGridPage
              title="Popular Movies"
              endpoint="/movie/popular"
              icon="🔥"
            />
          }
        />
        <Route
          path="/top-rated"
          element={
            <MovieGridPage
              title="Top Rated Movies"
              endpoint="/movie/top_rated"
              icon="⭐"
            />
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <FavouritesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
