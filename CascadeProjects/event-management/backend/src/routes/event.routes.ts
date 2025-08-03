import express from 'express';
import { createEvent, getEvents, getEventById, registerForEvent } from '../controllers/event.controller';

const router = express.Router();

router.post('/', createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:id/register', registerForEvent);

export { router as eventRoutes };
