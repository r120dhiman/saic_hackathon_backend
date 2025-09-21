import {Router} from "express";
import simplifiedHealthReportSchema from "../models/HealthReport.js";

const router = Router();

router.get("/:id", async(req, res) => {
  try {
    const id=req.params.id;
    const useranalysis=await simplifiedHealthReportSchema.find({userId:id}).sort({date:-1}).limit(5);
    res.status(200).json({message:"User analysis fetched successfully",data:useranalysis});
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({error:"Failed to fetch dashboard data"});
  }
});

export default router;

