import type React from "react";
import { useAuthStore } from "../context/AuthContext"
import { useState } from "react";

const RegisterPage = () => {

    const { register, isLoading, error } = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleRegister = async (e : React.FormEvent)=>{
       e.preventDefault();
    try{
        await register(formData);
    }catch(err){
        console.error("Registration error:", err);
    }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Register Page</h2>

        <form onSubmit={handleRegister}>
            <div className="mb-4 border-amber-700 ">
                <label>Username:</label>
                <input type="text" name="username" required value={formData.username} onChange={handleChange}/>
            </div>

            <div>
                <label>Email:</label>
                <input type="text" name="email" required value={formData.email} onChange={handleChange}/>
            </div>

            <div>
                <label>Password:</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange}/>
            </div>

            <div>
                <button type="submit" disabled={isLoading}>Register</button>
                {error && <p className="error">{error}</p>}

            </div>
        </form>
        
      
    </div>
  )
}

export default RegisterPage
