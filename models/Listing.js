import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  images: [{
    type: String,
    required: true,
  }],
  amenities: [{
    type: String,
  }],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blockedDates: {
    type: [{
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      reason: { type: String, default: 'Blocked by host' },
      createdAt: { type: Date, default: Date.now },
    }],
    default: [], // Initialize as empty array
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);