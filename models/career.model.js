import mongoose from 'mongoose'

const careerApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    jobId: { type: Number, required: true },
    jobTitle: { type: String, required: true },
  },
  { timestamps: true }
)

const CareerApplication = mongoose.model('CareerApplication', careerApplicationSchema)
export default CareerApplication
