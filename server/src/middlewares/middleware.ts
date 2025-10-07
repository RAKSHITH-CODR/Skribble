import type { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken"

export function Middleware(req:Request,res:Response,next:NextFunction){

    try{

        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];
        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET?.toString() || "") as {id:string,username:string};

        req.body.userId = decoded.id;
        req.body.username = decoded.username;   
        next(); 



    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Internal middleware error"});

    }
}