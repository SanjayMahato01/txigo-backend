
import express from 'express'
import { createCorporate, getAllCorporates } from '../controllers/corporateRequirement.controller.js'

const CorporateRouter = express.Router()


CorporateRouter.post('/apply',  createCorporate)
CorporateRouter.get('/getAll',  getAllCorporates)

export default CorporateRouter
