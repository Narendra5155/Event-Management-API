import mongoose from 'mongoose';

export const EVENT_CATEGORIES = Object.freeze([
  'conference',
  'workshop',
  'meetup',
  'concert',
  'sports',
  'festival',
  'other',
]);
export const EVENT_STATUSES = Object.freeze(['draft', 'published', 'cancelled']);

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    address: { type: String, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 80 },
  },
  { _id: false },
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    category: { type: String, enum: EVENT_CATEGORIES, required: true },
    venue: { type: venueSchema, default: () => ({}) },
    isOnline: { type: Boolean, default: false },
    onlineUrl: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.startDate || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    capacity: { type: Number, required: true, min: 1, max: 100_000 },
    registeredCount: { type: Number, default: 0, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    coverImage: { type: String, trim: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: EVENT_STATUSES, default: 'published' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

eventSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 1 }, name: 'event_text_search' },
);
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ status: 1, category: 1, startDate: 1 });
eventSchema.index({ organizer: 1, createdAt: -1 });

export const Event = mongoose.model('Event', eventSchema);
