import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  attendees: string[];
  is_active: boolean;
}

interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  attendance: {
    [eventId: string]: boolean;
  };
}

const initialState: EventsState = {
  events: [],
  selectedEvent: null,
  attendance: {},
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload);
    },
    updateEvent: (
      state,
      action: PayloadAction<{ id: string; event: Event }>
    ) => {
      state.events = state.events.map((event) =>
        event.id === action.payload.id ? action.payload.event : event
      );
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((event) => event.id !== action.payload);
    },
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload;
    },
    checkIn: (state, action: PayloadAction<string>) => {
      state.attendance[action.payload] = true;
    },
    checkOut: (state, action: PayloadAction<string>) => {
      state.attendance[action.payload] = false;
    },
  },
});

export const {
  setEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedEvent,
  checkIn,
  checkOut,
} = eventSlice.actions;

export default eventSlice.reducer;
