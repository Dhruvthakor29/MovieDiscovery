import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#f5c518">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const MovieCard = ({ movie, onAuthRequired }) => {
  const { title, vote_average, poster_path, release_date, original_language, id } = movie;
  const navigate = useNavigate();
  const { user, isInWatchlist, isInFavourites, addToWatchlist, removeFromWatchlist, addToFavourites, removeFromFavourites } = useAuth();

  const [wlLoading, setWlLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const inWatchlist = isInWatchlist(id);
  const inFavourites = isInFavourites(id);

  const handleWatchlist = async (e) => {
    e.stopPropagation();
    if (!user) { onAuthRequired?.(); return; }
    setWlLoading(true);
    try {
      if (inWatchlist) await removeFromWatchlist(id);
      else await addToWatchlist(movie);
    } catch (err) { console.error(err); }
    finally { setWlLoading(false); }
  };

  const handleFavourite = async (e) => {
    e.stopPropagation();
    if (!user) { onAuthRequired?.(); return; }
    setFavLoading(true);
    try {
      if (inFavourites) await removeFromFavourites(id);
      else await addToFavourites(movie);
    } catch (err) { console.error(err); }
    finally { setFavLoading(false); }
  };

  return (
    <div
      onClick={() => navigate(`/movie/${id}`)}
      className="group bg-white/3 border border-white/8 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-purple-900/20"
    >
      {/* Poster */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-800">
        <img
          src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Rating badge */}
        {vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-yellow-400 text-[11px] font-medium px-2 py-1 rounded-full">
            <StarIcon />
            {vote_average.toFixed(1)}
          </div>
        )}

        {/* Language badge */}
        {original_language && (
          <div className="absolute top-2 left-2 bg-black/60 text-white/85 text-[10px] font-medium px-2 py-1 rounded-full uppercase tracking-wide">
            {original_language}
          </div>
        )}

        {/* Action overlay — visible on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3 gap-2">
          {/* Watchlist button */}
          <button
            onClick={handleWatchlist}
            disabled={wlLoading}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              inWatchlist
                ? 'bg-purple-600 text-white'
                : 'bg-white/15 hover:bg-purple-600/80 text-white'
            }`}
          >
            {wlLoading ? '…' : inWatchlist ? '🔖 Saved' : '🔖 Watch'}
          </button>

          {/* Favourite button */}
          <button
            onClick={handleFavourite}
            disabled={favLoading}
            title={inFavourites ? 'Remove from Favourites' : 'Add to Favourites'}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              inFavourites
                ? 'bg-red-500 text-white'
                : 'bg-white/15 hover:bg-red-500/80 text-white'
            }`}
          >
            {favLoading ? '…' : inFavourites ? '❤️ Liked' : '♡ Like'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white leading-snug mb-1 truncate">{title}</h3>
        <p className="text-xs text-white/40">{release_date ? release_date.slice(0, 4) : 'N/A'}</p>
      </div>
    </div>
  );
};

export default MovieCard;
