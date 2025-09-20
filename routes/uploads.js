import {Router} from "express"
import { predict } from "../controller/uploads.js";

const router=Router();

router.get("/",(req,res)=>{
    res.send("This is upload route");
})
router.post("/",predict)

export default router