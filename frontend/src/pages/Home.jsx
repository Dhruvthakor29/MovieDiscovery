import { useEffect, useState, useCallback, useRef } from 'react';
import { useDebounce } from 'react-use';
import Search from '../components/search';
import Spinner from '../components/spinner';
import MovieCard from '../components/movieCard';
import AuthModal from '../components/AuthModal';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZGU4MWEwZjM1MzI5NWJiNmNhODM2OGMwM2JmZTVmNyIsIm5iZiI6MTczODMyNjA3NC40NDksInN1YiI6IjY3OWNjMDNhZDgwMTcwZWU1NTAxMWI3ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Rk6ES293ldV0OblY1WPdU_l3-mT9LNreKVsJMrMo0X4';
const BACKEND = 'https://movie-discovery-self.vercel.app';

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
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Sentinel div ref — IntersectionObserver watches this
  const sentinelRef = useRef(null);
  const isLoadingRef = useRef(false); // prevent duplicate fetches

  useDebounce(() => {
    setDebouncedSearch(searchTerm);
    setPage(1);          // reset to page 1 on new search
    setMovieList([]);    // clear old results
  }, 500, [searchTerm]);

  const fetchMovies = useCallback(async (query = '', pageNum = 1) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    if (pageNum === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?include_adult=false&with_original_language=hi&page=${pageNum}&sort_by=popularity.desc`;

      const res = await fetch(endpoint, options);
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (!data.results?.length && pageNum === 1) {
        setErrorMessage('No movies found.');
        setMovieList([]);
        return;
      }

      // Append new results (or replace on page 1)
      setMovieList(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
      setTotalPages(Math.min(data.total_pages, 50)); // cap at 50 pages

      // Track search count (only on first page, first result)
      if (query && data.results[0] && pageNum === 1) {
        fetch(`${BACKEND}/api/movies/search-count`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerm: query, movie: data.results[0] }),
        }).catch(() => {});
      }
    } catch {
      if (pageNum === 1) setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      isLoadingRef.current = false;
    }
  }, []);

  const loadTrendingSearches = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/movies/trending-searches`);
      const data = await res.json();
      setTrendingSearches(data.results || []);
    } catch {}
  };

  // Fetch when search or page changes
  useEffect(() => {
    fetchMovies(debouncedSearch, page);
  }, [debouncedSearch, page]);

  useEffect(() => { loadTrendingSearches(); }, []);

  // IntersectionObserver — watches sentinel div at bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // When sentinel is visible AND we have more pages AND not already loading
        if (entry.isIntersecting && page < totalPages && !isLoadingRef.current) {
          setPage(prev => prev + 1);
        }
      },
      {
        root: null,        // viewport
        rootMargin: '200px', // trigger 200px before hitting bottom
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages]);

  return (
    <main className="pt-14">
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Trending searches */}
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

        {/* Movie grid */}
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

              {/* Loading more spinner */}
              {isFetchingMore && (
                <div className="flex justify-center mt-8">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* End of results message */}
              {!isFetchingMore && movieList.length > 0 && page >= totalPages && (
                <p className="text-center text-white/30 text-sm mt-8 mb-4">
                  You've reached the end ✓
                </p>
              )}

              {/* Invisible sentinel — triggers load more when scrolled into view */}
              <div ref={sentinelRef} className="h-4 w-full" />
            </>
          )}
        </section>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  );
};

export default Home;
