import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Abhi ke liye dummy authentication
  const isAuthenticated = true;

  // Baad me login hone par token check karenge
  // const token = localStorage.getItem("token");
  // const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}