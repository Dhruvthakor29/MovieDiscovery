import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require auth
router.use(protect);

// Helper: build movie ref from body
const buildMovieRef = (body) => ({
  movieId: body.movieId,
  title: body.title,
  poster_path: body.poster_path,
  vote_average: body.vote_average,
  release_date: body.release_date,
});

/* ─── WATCHLIST ─────────────────────────────────────────── */

// GET /api/user/watchlist
router.get('/watchlist', async (req, res) => {
  res.json({ watchlist: req.user.watchlist });
});

// POST /api/user/watchlist
router.post('/watchlist', async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = req.user;

    const alreadyAdded = user.watchlist.some((m) => m.movieId === movieId);
    if (alreadyAdded) {
      return res.status(409).json({ message: 'Already in watchlist.' });
    }

    user.watchlist.push(buildMovieRef(req.body));
    await user.save();
    res.json({ watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to watchlist.' });
  }
});

// DELETE /api/user/watchlist/:movieId
router.delete('/watchlist/:movieId', async (req, res) => {
  try {
    const user = req.user;
    user.watchlist = user.watchlist.filter(
      (m) => m.movieId !== Number(req.params.movieId)
    );
    await user.save();
    res.json({ watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from watchlist.' });
  }
});

/* ─── FAVOURITES ────────────────────────────────────────── */

// GET /api/user/favourites
router.get('/favourites', async (req, res) => {
  res.json({ favourites: req.user.favourites });
});

// POST /api/user/favourites
router.post('/favourites', async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = req.user;

    const alreadyAdded = user.favourites.some((m) => m.movieId === movieId);
    if (alreadyAdded) {
      return res.status(409).json({ message: 'Already in favourites.' });
    }

    user.favourites.push(buildMovieRef(req.body));
    await user.save();
    res.json({ favourites: user.favourites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to favourites.' });
  }
});

// DELETE /api/user/favourites/:movieId
router.delete('/favourites/:movieId', async (req, res) => {
  try {
    const user = req.user;
    user.favourites = user.favourites.filter(
      (m) => m.movieId !== Number(req.params.movieId)
    );
    await user.save();
    res.json({ favourites: user.favourites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from favourites.' });
  }
});

export default router;
