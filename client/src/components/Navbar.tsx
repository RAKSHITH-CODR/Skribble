import { Link,useNavigate } from "react-router-dom";
import { useAuthStore } from "../context/AuthContext";


export default function Navbar() {
    const { user,logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <nav>
            <div>
                <Link to="/dashboard">Scribble Clone</Link>

                {
                    user ? (
                        <div>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/rooms">Rooms</Link>
                            <span>Hello {user.username}</span>

                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <div>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </div>
                    )
                }
            </div>
        </nav>
    )
}