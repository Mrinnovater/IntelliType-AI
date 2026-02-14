import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // --- THE FIX: Use URLSearchParams ---
        // This forces the content-type to 'application/x-www-form-urlencoded'
        // which is exactly what FastAPI requires for OAuth2 login.
        const params = new URLSearchParams();
        params.append('username', formData.email); // Mapping email to username
        params.append('password', formData.password);

        try {
            const response = await api.post('/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            // Store token and redirect
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard'); 
        } catch (error) {
            console.error("Login Error Details:", error);
            const errorMessage = error.response?.data?.detail || 'Invalid Credentials';
            alert(`Login Failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                    src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop" 
                    alt="Cyber Security Background" 
                    className="w-full h-full object-cover opacity-50 animate-pan"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/60 to-emerald-900/20"></div>
            </div>

            <div className="glass-card-strong p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 mx-4 transform transition-all hover:scale-[1.01] border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-emerald-400/80 text-sm font-medium tracking-wide uppercase">Authenticate to Continue</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-400 transition-colors">Email Address</label>
                        <input type="email" name="email" onChange={handleChange} required 
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-400 transition-colors">Password</label>
                        <input type="password" name="password" onChange={handleChange} required 
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                            placeholder="••••••••"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 mt-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform active:scale-95 uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'Authenticating...' : 'Initiate Session'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-slate-400 text-sm">
                        New User?{' '}
                        <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition">
                            Register System ID
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Login;