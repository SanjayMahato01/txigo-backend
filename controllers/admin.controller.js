import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import Token from "../models/token.model.js";
import jwt from "jsonwebtoken";

export const signup = async (req,res) => {
    try {
     
       const { name,username,password } = req.body;
       if(!name || !username || !password) {
         return res.status(400).json({
            message : "Please provide all credentials",
            error : true,
            success : false
         })
       }
       const admin =  await Admin.findOne({username})
       if(admin) {
        res.status(409).json({
          message : "admin already exists!",
          error : true,
          success : false
        })
       }

       const salt = bcrypt.genSaltSync(10);
       const hashPassword = bcrypt.hashSync(password, salt);

       const payload = {
        name,username, password : hashPassword
       }

       const newAdmin =  new Admin(payload);
       const save = await newAdmin.save();

       res.status(200).json({
        message : "new admin created",
        error : false,
        success : true
       })
    } catch (error) {
        console.log(error)
    }
}

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({
        message: 'Please provide all credentials',
        error: true,
        success: false
      });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({
        message: 'Admin not available',
        error: true,
        success: false
      });
    }

    const checkPassword = await bcrypt.compare(password, admin.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: 'Incorrect password',
        error: true,
        success: false
      });
    }

  

    // Return tokens to frontend (no cookies)
    res.status(200).json({
      message: 'Admin logged in successfully',
      error: false,
      success: true,
      isProtected: true  
    });
  } catch (error) {
    console.error('Error in login controller', error.message);
    res.status(500).json({
      message: `Internal server error - ${error.message}`,
      error: true,
      success: false
    });
  }
};


export const refreshAccessToken = async (req,res) => {
  
   try {
   const refreshToken = req.cookies?.refreshToken;

   if(!refreshToken) {
   return  res.status(401).json({
      message : "No Refresh Token",
      error : true,
      success : false
    })
  }

  const tokenDoc = await Token.findOne({refreshToken});
  if(!tokenDoc) {
   return res.status(403).json({message : "Invalid Refresh Token",error : true, success : false})
  }
    const payload = jwt.verify(refreshToken,process.env.REFRESH_TOKEN);
    const newAccessToken = await generateAccessToken(payload.id)
    
    return res.status(200).json({accessToken : newAccessToken})
   } catch (error) {
    return res.status(403).json({message : "refresh token expired or invalid"})
   }
}