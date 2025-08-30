import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";

const RoleRoute = ({ children, allowed }) => {
  const role = getUserRole();

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;