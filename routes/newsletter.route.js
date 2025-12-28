
import express from 'express'
import { getAllNewsletter, subscribeNewsletter } from '../controllers/newsletter.controller.js'

const newsletterRouter = express.Router()

newsletterRouter.post('/apply',  subscribeNewsletter)
newsletterRouter.get('/getAll',  getAllNewsletter)

export default newsletterRouter
