
import express from 'express'
import { createSearch, getAllSearches } from '../controllers/search.controller.js'

const SearchRouter = express.Router()


SearchRouter.post('/create',  createSearch)
SearchRouter.get('/getAll',  getAllSearches)


export default SearchRouter
