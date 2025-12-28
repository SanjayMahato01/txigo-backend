import express from 'express';
import { createHistory, getHistoryByType } from '../controllers/history.controller.js';

const HistoryRouter = express.Router();

HistoryRouter.post('/createHistory', createHistory);
HistoryRouter.get('/getHistoryByType', getHistoryByType);

export default HistoryRouter;
