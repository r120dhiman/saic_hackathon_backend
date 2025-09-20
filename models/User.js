import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    sex: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    latestHealthSummary: {
      reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HealthReport",
      },
      reportDate: Date,
      keyBiomarkers: [
        {
          name: String,
          value: Number,
          unit: String,
          status: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("User", userSchema)
