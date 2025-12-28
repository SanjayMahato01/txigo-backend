
import express from 'express'
import multer from 'multer'
import { applyForJob, getAllCareers } from '../controllers/career.controller.js'

const careerRouter = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

careerRouter.post('/apply', upload.single('resume'), applyForJob)
careerRouter.get('/getAll',  getAllCareers)

export default careerRouter
