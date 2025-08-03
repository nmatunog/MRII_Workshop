import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string | null;
    email: string | null;
    name: string | null;
    is_admin: boolean;
  };
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: {
    id: null,
    email: null,
    name: null,
    is_admin: false,
  },
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        userId: string;
        email: string;
        name: string;
        is_admin: boolean;
        token: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user.id = action.payload.userId;
      state.user.email = action.payload.email;
      state.user.name = action.payload.name;
      state.user.is_admin = action.payload.is_admin;
      state.token = action.payload.token;
    },
    register: (
      state,
      action: PayloadAction<{
        userId: string;
        email: string;
        name: string;
        is_admin: boolean;
        token: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user.id = action.payload.userId;
      state.user.email = action.payload.email;
      state.user.name = action.payload.name;
      state.user.is_admin = action.payload.is_admin;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user.id = null;
      state.user.email = null;
      state.user.name = null;
      state.user.is_admin = false;
      state.token = null;
    },
  },
});

export const selectAuth = createSelector(
  (state: { auth: AuthState }) => state.auth,
  (auth) => auth
);

export const { login, register, logout } = authSlice.actions;
export default authSlice.reducer;
