
import express from 'express'
import { getAllPlans, getPlanById } from '../controllers/pricingFleet.controller.js'


const pricingFleet = express.Router()

pricingFleet.get('/getAll',  getAllPlans)
pricingFleet.get('/getOnePlan/:id',  getPlanById)


export default pricingFleet
