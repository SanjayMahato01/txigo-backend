
import express from 'express'
import { getAllTripReviews, getTripReviewsByVendorId, submitCustomerReview, updateTripReview } from '../controllers/tripReviews.controller.js'

const TripReviewsRouter = express.Router()


TripReviewsRouter.post('/submit',  submitCustomerReview)
TripReviewsRouter.get('/getAllReviews',  getAllTripReviews)
TripReviewsRouter.patch('/checkReview/:id', updateTripReview)
TripReviewsRouter.get('/getByVendor/:vendorId', getTripReviewsByVendorId)

export default TripReviewsRouter
