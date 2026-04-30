import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "https://api.themoviedb.org/3";
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZGU4MWEwZjM1MzI5NWJiNmNhODM2OGMwM2JmZTVmNyIsIm5iZiI6MTczODMyNjA3NC40NDksInN1YiI6IjY3OWNjMDNhZDgwMTcwZWU1NTAxMWI3ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Rk6ES293ldV0OblY1WPdU_l3-mT9LNreKVsJMrMo0X4';

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isInWatchlist, isInFavourites, addToWatchlist, removeFromWatchlist, addToFavourites, removeFromFavourites } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast] = useState([]);
  const [imdbId, setImdbId] = useState(null);
  const [wlLoading, setWlLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [movieRes, creditsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/movie/${id}?append_to_response=videos`, options),
          fetch(`${API_BASE_URL}/movie/${id}/credits`, options),
        ]);
        const movieData = await movieRes.json();
        const creditsData = await creditsRes.json();

        setMovie(movieData);

        // IMDB id comes directly in movie details response
        // e.g. movieData.imdb_id = "tt14993250"
        if (movieData.imdb_id) {
          setImdbId(movieData.imdb_id);
        }

        const videos = movieData.videos?.results || [];
        const found =
          videos.find(v => v.type === "Trailer" && v.site === "YouTube" && v.official) ||
          videos.find(v => v.type === "Trailer" && v.site === "YouTube") ||
          videos.find(v => v.site === "YouTube");

        setTrailer(found || null);
        setCast(creditsData.cast?.slice(0, 8) || []);
      } catch (err) {
        console.error("Error fetching movie details:", err);
      }
    };

    fetchAll();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleWatchMovie = () => {
    if (!imdbId) return;
    // Build stream URL: https://streamimdb.ru/embed/movie/tt14993250
    const streamUrl = `https://streamimdb.ru/embed/movie/${imdbId}`;
    window.open(streamUrl, '_blank');
  };

  const openTrailer = () => {
    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
    } else {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`, '_blank');
    }
  };




  const handleClick = () => {
    if (!user) {
      setShowAuth(true); // open login modal
      return;
    }

    handleWatchMovie(); // only runs if logged in
  };


  const handleWatchlist = async () => {
    if (!user) return;
    setWlLoading(true);
    try {
      if (isInWatchlist(movie.id)) await removeFromWatchlist(movie.id);
      else await addToWatchlist({ id: movie.id, title: movie.title, poster_path: movie.poster_path, vote_average: movie.vote_average, release_date: movie.release_date });
    } finally { setWlLoading(false); }
  };

  const handleFavourite = async () => {
    if (!user) return;
    setFavLoading(true);
    try {
      if (isInFavourites(movie.id)) await removeFromFavourites(movie.id);
      else await addToFavourites({ id: movie.id, title: movie.title, poster_path: movie.poster_path, vote_average: movie.vote_average, release_date: movie.release_date });
    } finally { setFavLoading(false); }
  };

  if (!movie) return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Loading movie...</p>
      </div>
    </div>
  );

  const inWatchlist = isInWatchlist(movie.id);
  const inFavourites = isInFavourites(movie.id);

  return (
    <div className="min-h-screen bg-primary text-white pt-14">

      {/* Backdrop */}
      <div className="relative w-full h-[55vh] overflow-hidden">
        <img
          src={`https://image.tmdb.org/t/p/w1280/${movie.backdrop_path}`}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030014]/80 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white/80 hover:text-white text-sm transition-all backdrop-blur-sm border border-white/10"
        >
          ← Back
        </button>

        {/* Play trailer overlay */}
        <button
          onClick={openTrailer}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-500 group-hover:scale-110 transition-all duration-300 shadow-2xl">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-white/70 text-sm font-medium group-hover:text-white transition-all">
            {trailer ? 'Watch Trailer' : 'Search Trailer on YouTube'}
          </span>
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-5 -mt-36 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '/no-movie.png'}
              alt={movie.title}
              className="w-36 md:w-52 rounded-xl border border-white/10 shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-28 md:pt-20">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-1 text-left">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-sm text-white/50 italic mb-4">{movie.tagline}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-400 text-yellow-900">
                ⭐ {movie.vote_average?.toFixed(1)}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70">
                {movie.release_date?.slice(0, 4)}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70">
                {movie.runtime} min
              </span>
              {movie.genres?.map(g => (
                <span key={g.id} className="text-xs px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">

              {/* 🎬 Watch Movie — main CTA */}

              <button
                onClick={handleClick}
                disabled={!imdbId}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${imdbId
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 hover:scale-105 text-white shadow-purple-900/40'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {imdbId ? 'Watch Movie' : 'Not Available'}
              </button>






              {/* 🎞 Watch Trailer */}
              <button
                onClick={openTrailer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all hover:scale-105 shadow-lg shadow-red-900/30"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {trailer ? 'Watch Trailer' : 'Search Trailer'}
              </button>

              {/* 🔖 Watchlist */}
              {user && (
                <button
                  onClick={handleWatchlist}
                  disabled={wlLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border ${inWatchlist
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                    }`}
                >
                  {wlLoading ? '…' : inWatchlist ? '🔖 In Watchlist' : '🔖 Add to Watchlist'}
                </button>
              )}

              {/* ❤️ Favourite */}
              {user && (
                <button
                  onClick={handleFavourite}
                  disabled={favLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border ${inFavourites
                      ? 'bg-red-500 border-red-400 text-white'
                      : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                    }`}
                >
                  {favLoading ? '…' : inFavourites ? '❤️ Favourited' : '♡ Add to Favourites'}
                </button>
              )}
            </div>

            {/* IMDB id badge — small info */}
            {imdbId && (
              <p className="text-[11px] text-white/20">
                IMDB: <span className="font-mono">{imdbId}</span>
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: "Release Date", value: movie.release_date ? formatDate(movie.release_date) : 'N/A' },
            { label: "Runtime", value: `${movie.runtime} min` },
            { label: "Vote Count", value: movie.vote_count?.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/8">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-base font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Overview */}
        {movie.overview && (
          <div className="bg-white/5 rounded-xl p-5 border border-white/8 mt-3">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Overview</p>
            <p className="text-sm text-white/75 leading-relaxed">{movie.overview}</p>
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div className="mt-8 mb-12">
            <h3 className="text-lg font-bold mb-4">Cast</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {cast.map(person => (
                <div key={person.id} className="flex flex-col items-center text-center gap-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border border-white/10">
                    {person.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200/${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-white leading-tight">{person.name}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        )}
        
      </div>
         {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
    
  );
};

export default MovieDetails;
