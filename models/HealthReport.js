import mongoose from "mongoose";

const simplifiedHealthReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    analysis: {
      type: Object,
      required: true,
    },
    labData: {
      type: Object,
      required: true,
    },
    diseases: {
      type: Object,
    }
  },
  {
    timestamps: true, 
  }
);

// simplifiedHealthReportSchema.index({ userId: 1, date: -1 });

export default mongoose.model("SimplifiedHealthReport", simplifiedHealthReportSchema);