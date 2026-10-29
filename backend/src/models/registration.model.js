import mongoose from 'mongoose';

export const REGISTRATION_STATUSES = Object.freeze(['confirmed', 'cancelled']);

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: REGISTRATION_STATUSES, default: 'confirmed' },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

// One registration per user per event; also serves attendee lookups by event.
registrationSchema.index({ event: 1, user: 1 }, { unique: true });
registrationSchema.index({ user: 1, status: 1, createdAt: -1 });

export const Registration = mongoose.model('Registration', registrationSchema);
