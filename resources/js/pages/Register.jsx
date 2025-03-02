import { useState } from "react";
import axios from "axios";

export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await axios.post("/api/register", formData);
            setMessage(response.data.message);
            setFormData({ name: "", email: "", password: "" }); // Reset formularza
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
