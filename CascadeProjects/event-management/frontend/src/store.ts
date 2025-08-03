import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import eventReducer from './features/events/eventSlice';
import reportReducer from './features/reports/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    reports: reportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
