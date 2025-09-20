const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');

const app=express();
dotenv.config();

const PORT=process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin:'*',
    methods:['GET','POST','PUT','DELETE'],
}));
app.use(express.json());

// Sample route
app.get('/',(req,res)=>{
    res.json({message:'API is working'});
});

// Start server
app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
});