import { diseasePredictor } from "../Info/app.js";
export const predict= async (req,res)=>{
    const { age, gender, labData}=req.body;
    const info=await diseasePredictor(age, gender, labData);
    res.status(200).json({message:"Disease prediction successful", data:info});

}

// module.exports={predict};