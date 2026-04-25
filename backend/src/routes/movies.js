import express from 'express';
import SearchCount from '../models/SearchCount.js';

const router = express.Router();

// POST /api/movies/search-count  – track a search
router.post('/search-count', async (req, res) => {
  try {
    const { searchTerm, movie } = req.body;
    if (!searchTerm || !movie) return res.status(400).json({ message: 'Missing data.' });

    const existing = await SearchCount.findOne({ searchTerm });

    if (existing) {
      existing.count += 1;
      await existing.save();
    } else {
      await SearchCount.create({
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        title: movie.title,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('search-count error:', error);
    res.status(500).json({ message: 'Failed to update search count.' });
  }
});

// GET /api/movies/trending-searches – top 10 most searched
router.get('/trending-searches', async (req, res) => {
  try {
    const results = await SearchCount.find()
      .sort({ count: -1 })
      .limit(10);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trending searches.' });
  }
});

export default router;
