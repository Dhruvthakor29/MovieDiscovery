import mongoose from 'mongoose';

const searchCountSchema = new mongoose.Schema({
  searchTerm: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
  movie_id: Number,
  poster_url: String,
  title: String,
}, { timestamps: true });

export default mongoose.model('SearchCount', searchCountSchema);
