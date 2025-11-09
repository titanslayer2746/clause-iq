import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import contractsReducer from "./slices/contractsSlice";
import organizationReducer from "./slices/organizationSlice";
import aiReducer from "./slices/aiSlice";
import tasksReducer from "./slices/tasksSlice";
import notificationsReducer from "./slices/notificationsSlice";
import playbookReducer from "./slices/playbookSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contracts: contractsReducer,
    organization: organizationReducer,
    ai: aiReducer,
    tasks: tasksReducer,
    notifications: notificationsReducer,
    playbook: playbookReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["auth/login/fulfilled"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
