import { useEffect, useState, useCallback } from 'react';
import { useDebounce } from 'react-use';
import Search from '../components/search';
import Spinner from '../components/spinner';
import MovieCard from '../components/movieCard';
import AuthModal from '../components/AuthModal';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZGU4MWEwZjM1MzI5NWJiNmNhODM2OGMwM2JmZTVmNyIsIm5iZiI6MTczODMyNjA3NC40NDksInN1YiI6IjY3OWNjMDNhZDgwMTcwZWU1NTAxMWI3ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Rk6ES293ldV0OblY1WPdU_l3-mT9LNreKVsJMrMo0X4';
const BACKEND = 'https://cloudtv-s74y.onrender.com';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useDebounce(() => {
    setDebouncedSearch(searchTerm);
    setPage(1);
    setMovieList([]);
  }, 500, [searchTerm]);

  const fetchMovies = useCallback(async (query = '', pageNum = 1) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?include_adult=false&with_original_language=hi&page=${pageNum}&sort_by=popularity.desc`;

      const res = await fetch(endpoint, options);
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (!data.results?.length) {
        setErrorMessage('No movies found.');
        setMovieList([]);
        return;
      }

      setMovieList(data.results);
      setTotalPages(Math.min(data.total_pages, 50));

      if (query && data.results[0] && pageNum === 1) {
        fetch(`${BACKEND}/api/movies/search-count`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerm: query, movie: data.results[0] }),
        }).catch(() => {});
      }
    } catch {
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTrendingSearches = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/movies/trending-searches`);
      const data = await res.json();
      setTrendingSearches(data.results || []);
    } catch {}
  };

  useEffect(() => {
    fetchMovies(debouncedSearch, page);
  }, [debouncedSearch, page]);

  useEffect(() => { loadTrendingSearches(); }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="pt-14">
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingSearches.length > 0 && (
          <section className="trending mt-16">
            <h2>🔥 Trending Searches</h2>
            <div>
              <ul>
                {trendingSearches.map((item, index) => (
                  <li key={item._id || index}>
                    <p>{index + 1}</p>
                    <img
                      src={item.poster_url}
                      alt={item.title}
                      className="hover:scale-110 transition"
                      onClick={() => setSearchTerm(item.searchTerm)}
                      style={{ cursor: 'pointer' }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="all-movies mt-16">
          <h2>{searchTerm ? `Results for "${searchTerm}"` : '🎬 All Movies'}</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-400 text-sm">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList.map((movie, i) => (
                  <MovieCard
                    key={`${movie.id}-${i}`}
                    movie={movie}
                    onAuthRequired={() => setShowAuth(true)}
                  />
                ))}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10 mb-6">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm disabled:opacity-30 hover:bg-white/20 transition"
                  >
                    ← Prev
                  </button>

                  <span className="text-white/60 text-sm">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm disabled:opacity-30 hover:bg-white/20 transition"
                  >
                    Next →
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

export default Home;