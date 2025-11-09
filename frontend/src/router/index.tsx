import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import Layout from "../components/Layout";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyOTP from "../pages/VerifyOTP";
import Dashboard from "../pages/Dashboard";
import ContractDetail from "../pages/ContractDetail";
import UploadContract from "../pages/UploadContract";
import OrganizationSettings from "../pages/OrganizationSettings";
import Tasks from "../pages/Tasks";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-otp",
    element: (
      <PublicRoute>
        <VerifyOTP />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "contracts/:contractId",
        element: <ContractDetail />,
      },
      {
        path: "contracts/upload",
        element: <UploadContract />,
      },
      {
        path: "organization/settings",
        element: <OrganizationSettings />,
      },
      {
        path: "tasks",
        element: <Tasks />,
      },
    ],
  },
]);
