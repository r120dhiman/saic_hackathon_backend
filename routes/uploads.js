import { Router } from "express";
import { predict, predictFromCSV, upload } from "../controller/uploads.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("This is upload route");
});

router.post("/:id", predict);

router.post("/csv", upload.single("csvFile"), predictFromCSV);

export default router;