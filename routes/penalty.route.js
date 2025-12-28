
import express from 'express'
import { createPenalty, getAllPenalties, getPenaltiesByVendor } from '../controllers/penalties.controller.js'

const PenaltyRouter = express.Router()


PenaltyRouter.post('/create',  createPenalty)
PenaltyRouter.get('/getAll/:vendorId',  getPenaltiesByVendor)
PenaltyRouter.get('/getAllPenalties',  getAllPenalties)


export default PenaltyRouter
