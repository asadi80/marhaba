// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
    idImages: [{ type: String, required: true }],
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
    hostExpiryDate: { type: Date, default: null },
    statusReason: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    
    // Email confirmation fields
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    
    // Password reset fields
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    
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
  { timestamps: true }
);

// Pre-save middleware
// Pre-save middleware
// Pre-save middleware
UserSchema.pre("save", function () {
  if (this.role === "host" && this.status === "confirmed") {
    if (!this.hostExpiryDate) {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 6);
      this.hostExpiryDate = expiry;
    }
  }

  if (this.status === "pending") {
    this.hostExpiryDate = null;
  }

  this.lastActive = new Date();
});


// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
UserSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

// Method to generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000;
  return token;
};

// Method to check if host is expired
UserSchema.methods.isHostExpired = function() {
  if (this.role !== "host") return false;
  if (!this.hostExpiryDate) return false;
  return new Date() > this.hostExpiryDate;
};

// Method to get days until expiry
UserSchema.methods.getDaysUntilExpiry = function() {
  if (!this.hostExpiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.hostExpiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default mongoose.models.User || mongoose.model("User", UserSchema);