import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PublicRoute({ children }) {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
