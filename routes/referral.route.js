
import express from 'express'
import { createReferral, getAllReferrals } from '../controllers/referral.controller.js'

const ReferralRouter = express.Router()


ReferralRouter.post('/create', createReferral)
ReferralRouter.get('/getAll',  getAllReferrals)


export default ReferralRouter
