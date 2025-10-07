import { useAuthStore } from "../context/AuthContext"

export default function DashBoard(){
    const { user } = useAuthStore();
    console.log("User in Dashboard:", user?.username);
    return <div>DashBoard - Welcome {user?.username}</div>
}