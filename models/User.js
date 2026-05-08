import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    phoneNumber: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "host", "admin", "super_admin"],
      default: "user",
    },

    IDmages: [
      {
        type: String,
        required: true,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "confirmed", "suspended"],
      default: function () {
        if (
          this.role === "user" ||
          this.role === "admin" ||
          this.role === "super_admin"
        ) {
          return "confirmed";
        }
        return "pending";
      },
      required: function () {
        return this.role === "host";
      },
    },

    hostExpiryDate: {
      type: Date,
      default: null,
    },
    statusReason: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    // Email confirmation fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // Password reset fields
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    hostDetails: {
      rating: { type: Number, default: 0 },
      totalListings: { type: Number, default: 0 },
      verified: { type: Boolean, default: false },
      joinedDate: { type: Date, default: Date.now },
      confirmedAt: { type: Date },
      expiresAt: { type: Date },
      notificationSent: {
        oneWeek: { type: Boolean, default: false },
        twoDays: { type: Boolean, default: false },
      },
    },

    userDetails: {
      bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
      preferences: { type: Object, default: {} },
      memberSince: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
);

// 🔥 FIXED: Single pre-save middleware without using 'next'
UserSchema.pre("save", function () {
  // If host is confirmed → set expiry
  if (this.role === "host" && this.status === "confirmed") {
    if (!this.hostExpiryDate) {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 6);
      this.hostExpiryDate = expiry;
    }
  }

  // If host goes back to pending → clear expiry
  if (this.status === "pending") {
    this.hostExpiryDate = null;
  }

  // No need to call next() - just return
});

// Password hashing middleware - also without 'next'
// UserSchema.pre("save", async function() {
//   // Only hash the password if it's modified (or new)
//   if (!this.isModified("password")) {
//     return;
//   }

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// // Add method to compare passwords
// UserSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

export default mongoose.models.User || mongoose.model("User", UserSchema);
