import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  name: String,
  email: String,
  score: Number,
  paymentId: String,
  issuedAt: {
    type: Date,
    default: Date.now,
  },
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;