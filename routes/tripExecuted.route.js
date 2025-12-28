
import express from 'express'
import { addTripExecuted, getAllTripExecuted, getCompletedTripsByVendor } from '../controllers/tripExecuted.controller.js'

const TripExecutedRouter = express.Router()


TripExecutedRouter.post('/create',  addTripExecuted)
TripExecutedRouter.get('/getTripExecutedData/:vendorId',  getCompletedTripsByVendor)
TripExecutedRouter.get('/getAllTripExecuted',  getAllTripExecuted)


export default TripExecutedRouter
