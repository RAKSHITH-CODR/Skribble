import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../context/AuthContext";



interface ProtectedRoutesProps {
    children : React.ReactNode;
}

const ProtectedRoutes : React.FC<ProtectedRoutesProps> = ({ children }) => {
    const { token,user } = useAuthStore();
    if (!token || !user) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}


export default ProtectedRoutes;