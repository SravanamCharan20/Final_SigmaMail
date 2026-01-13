import mongoose from "mongoose";

const gmailAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    emailAddress: {
      type: String,
      required: true,
    },

    accessToken: {
      iv: String,
      content: String,
      tag: String,
    },

    refreshToken: {
      iv: String,
      content: String,
      tag: String,
    },

    tokenExpiry: {
      type: Date,
    },

    lastSyncedAt: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isInitialSynced: {
      type: Boolean,
      default: false,
    },

    // Gmail pagination cursor (for incremental sync)
    syncPageToken: {
      type: String,
      default: null,
    },

    // Marks when all Gmail messages are fully synced
    syncComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GmailAccount", gmailAccountSchema);
