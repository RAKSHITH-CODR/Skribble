import { useAuthStore } from "../context/AuthContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isLoading, error,setToken,setUser,token,user } = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleSubmit = async (e : React.FormEvent)=>{
      e.preventDefault();

      try{
        const response =await login(formData);
        console.log("Login response:", response);
        alert("Login Successful");
        navigate('/dashboard');

      }catch(err){
        console.error("Login error:", err);
        
      }
    }

    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    useEffect(()=>{
        if(token || user){
            setToken(token);
            setUser(user);
        }
    }, [token, user, setToken, setUser]);

    return (
        <div>

        <h2>Login Page</h2>

        <form  onSubmit={handleSubmit}>

            <div>
                <label>Username:</label>
                <input type="text" name="username" required value={formData.username} onChange={handleChange} />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} />
            </div>

            <div>
                <button type="submit" disabled={isLoading}>Login</button>
                {error && <p className="error">{error}</p>}
            </div>

        </form>

    </div>
  )
}

export default LoginPage