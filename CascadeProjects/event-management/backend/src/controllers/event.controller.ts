import { Request, Response } from 'express';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent } from '../services/event.service';
import { checkInUser, checkOutUser } from '../services/checkIn.service';
import { verifyToken } from '../utils/jwt';
import { checkInStatus } from '../types/checkInStatus';

// Event CRUD operations
export const createEventController = async (req: Request, res: Response) => {
  try {
    const { user } = verifyToken(req.headers.authorization as string);
    if (!user.is_admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const event = await createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const getEventsController = async (req: Request, res: Response) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const updateEventController = async (req: Request, res: Response) => {
  try {
    const { user } = verifyToken(req.headers.authorization as string);
    if (!user.is_admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updatedEvent = await updateEvent(id, req.body);
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEventController = async (req: Request, res: Response) => {
  try {
    const { user } = verifyToken(req.headers.authorization as string);
    if (!user.is_admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const result = await deleteEvent(id);
    if (!result) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Check-in/out operations
export const checkInUserController = async (req: Request, res: Response) => {
  try {
    const { user } = verifyToken(req.headers.authorization as string);
    const { eventId } = req.params;

    const checkIn = await checkInUser(user.id, eventId);
    res.json(checkIn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in' });
  }
};

export const checkOutUserController = async (req: Request, res: Response) => {
  try {
    const { user } = verifyToken(req.headers.authorization as string);
    const { eventId } = req.params;

    const checkOut = await checkOutUser(user.id, eventId);
    res.json(checkOut);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check out' });
  }
};

// Get attendance status
export const getAttendanceStatusController = async (req: Request, res: Response) => {
  try {
    const { user } = verifyToken(req.headers.authorization as string);
    const { eventId } = req.params;

    const attendanceStatus = await checkInStatus(user.id, eventId);
    res.json(attendanceStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get attendance status' });
  }
};
