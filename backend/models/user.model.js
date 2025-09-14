import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
		gameScores: {
  type: Map,
  of: Number,
  default: new Map(),
},
 role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }

	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);
