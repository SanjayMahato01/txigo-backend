
import express from 'express'
import { createContact, getAllContacts } from '../controllers/contact.controller.js'

const ContacteRouter = express.Router()


ContacteRouter.post('/send',  createContact)
ContacteRouter.get('/getAll',  getAllContacts)

export default ContacteRouter
