import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";

const Protected = ({ children }) =>
  localStorage.getItem("token") ? children : <Navigate to="/" replace />;

const PublicOnly = ({ children }) =>
  localStorage.getItem("token") ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
