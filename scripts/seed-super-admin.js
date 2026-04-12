// scripts/seed-super-admin.js
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// User Schema (copy from your models/User.js)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: { type: String, enum: ["user", "host", "admin", "super_admin"], default: "user" },
  IDmages: [{ type: String }],
  status: { type: String, enum: ["pending", "confirmed", "suspended"], default: "confirmed" },
  createdAt: { type: Date, default: Date.now },
  hostDetails: {
    rating: { type: Number, default: 0 },
    totalListings: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    joinedDate: { type: Date, default: Date.now },
  },
  userDetails: {
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    preferences: { type: Object, default: {} },
    memberSince: { type: Date, default: Date.now },
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Super admin data
    const superAdminData = {
      name: 'Abdurraouf Sadi',
      email: 'abdurraouf@marhaba.com',
      password: 'SuperAdmin123!',
      phoneNumber: '+1234567890',
      role: 'super_admin',
      status: 'confirmed',
      IDmages: [],
    };

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: superAdminData.email });
    
    if (existingAdmin) {
      console.log('⚠️ Super admin already exists!');
      console.log('Email:', superAdminData.email);
      
      // Optional: Update password if needed
      const updatePassword = process.argv.includes('--update-password');
      if (updatePassword) {
        const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log('✅ Password updated successfully!');
      }
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
      
      // Create super admin
      const superAdmin = new User({
        ...superAdminData,
        password: hashedPassword,
      });
      
      await superAdmin.save();
      console.log('✅ Super admin created successfully!');
    }

    console.log('\n📋 Super Admin Credentials:');
    console.log('Email:', superAdminData.email);
    console.log('Password:', superAdminData.password);
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedSuperAdmin();