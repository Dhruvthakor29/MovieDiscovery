import { useEffect, useState } from 'react';
import MovieCard from '../components/movieCard';
import Spinner from '../components/spinner';
import AuthModal from '../components/AuthModal';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZGU4MWEwZjM1MzI5NWJiNmNhODM2OGMwM2JmZTVmNyIsIm5iZiI6MTczODMyNjA3NC40NDksInN1YiI6IjY3OWNjMDNhZDgwMTcwZWU1NTAxMWI3ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Rk6ES293ldV0OblY1WPdU_l3-mT9LNreKVsJMrMo0X4';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
};

const MovieGridPage = ({ title, endpoint, icon }) => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const url = `${API_BASE_URL}${endpoint}?language=en-US&page=${page}`;
        const res = await fetch(url, options);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMovies(prev => page === 1 ? data.results : [...prev, ...data.results]);
        setTotalPages(Math.min(data.total_pages, 20));
      } catch {
        setError('Failed to load movies.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [endpoint, page]);

  // Reset when endpoint changes (navigating between pages)
  useEffect(() => {
    setMovies([]);
    setPage(1);
  }, [endpoint]);

  return (
    <main className="pt-14 min-h-screen bg-primary">
      <div className="wrapper">
        <section className="all-movies pt-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">{icon}</span>
            <h2>{title}</h2>
          </div>

          {error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <>
              <ul>
                {movies.map(movie => (
                  <MovieCard key={`${movie.id}-${page}`} movie={movie} onAuthRequired={() => setShowAuth(true)} />
                ))}
              </ul>

              {isLoading && <div className="mt-8"><Spinner /></div>}

              {!isLoading && page < totalPages && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium hover:opacity-90 transition-all"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  );
};

export default MovieGridPage;
