

import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    // Owner of this email (SigmaMail user)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Which Gmail account this email belongs to
    gmailAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GmailAccount",
      required: true,
      index: true,
    },

    // Gmail-specific identifiers
    messageId: {
      type: String,
      required: true,
    },
    threadId: {
      type: String,
      required: true,
    },

    // Email metadata
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    subject: {
      type: String,
    },
    snippet: {
      type: String,
    },

    // Gmail internal timestamp
    internalDate: {
      type: Date,
    },

    // Flags
    isRead: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate emails for same account
emailSchema.index(
  { gmailAccount: 1, messageId: 1 },
  { unique: true }
);

const Email = mongoose.model("Email", emailSchema);
export default Email;