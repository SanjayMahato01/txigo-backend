import express from 'express';
import { getCities,addCity } from '../controllers/onwWayCabs.controller.js';

const oneWayCabsRouter = express.Router();

oneWayCabsRouter.post('/add-city', addCity);
oneWayCabsRouter.get('/get-city', getCities);

export default oneWayCabsRouter;
