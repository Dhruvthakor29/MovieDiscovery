import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FavouritesPage = () => {
  const { user, removeFromFavourites } = useAuth();
  const navigate = useNavigate();
  const favourites = user?.favourites ?? [];

  return (
    <main className="pt-14 min-h-screen bg-primary">
      <div className="wrapper pt-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">❤️</span>
          <h2>My Favourites</h2>
          <span className="ml-2 text-sm text-white/40 font-normal mt-1">
            {favourites.length} {favourites.length === 1 ? 'movie' : 'movies'}
          </span>
        </div>

        {favourites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-6xl opacity-30">❤️</span>
            <p className="text-white/50 text-lg">No favourites yet</p>
            <p className="text-white/30 text-sm">Like movies to save them here</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favourites.map(movie => (
              <div
                key={movie.movieId}
                className="group relative bg-white/3 border border-white/8 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-white/20 transition-all duration-200"
                onClick={() => navigate(`/movie/${movie.movieId}`)}
              >
                <div className="aspect-[2/3] overflow-hidden bg-zinc-800 relative">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '/no-movie.png'}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromFavourites(movie.movieId); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white/70 hover:text-white hover:bg-red-500/80 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ✕
                  </button>
                  {/* Liked indicator */}
                  <div className="absolute bottom-2 left-2 text-sm">❤️</div>
                </div>
                <div className="p-2.5">
                  <h3 className="text-xs font-medium text-white truncate">{movie.title}</h3>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}
                    {movie.vote_average > 0 && ` · ⭐ ${movie.vote_average.toFixed(1)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default FavouritesPage;
