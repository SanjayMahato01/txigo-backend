import jwt from 'jsonwebtoken'
import Token from '../models/token.model.js';

export async function generateAccessToken(userId) {
  
    const token = jwt.sign({id : userId}, process.env.ACCESS_TOKEN, {expiresIn : "15m"} )
    return token;
}

export async function generateRefreshToken(userId) {
    const token = jwt.sign({id : userId}, process.env.REFRESH_TOKEN, {expiresIn : "30d"} )
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30)

    const updateUser = await Token.updateOne(
        {userId : userId},
        {
        refreshToken : token,
        expiresAt : expiresAt
        },
        { upsert: true } 
    )
    return token
}