import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register', formData);
            alert('Registration Successful! Please Login.');
            navigate('/login');
        } catch (error) {
            alert('Registration Failed: ' + (error.response?.data?.detail || 'Unknown Error'));
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
            {/* --- CINEMATIC BACKGROUND IMAGE --- */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
                    alt="AI Background" 
                    className="w-full h-full object-cover opacity-60 animate-pan"
                />
                {/* Dark Overlay so text is readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10"></div>
            </div>

            {/* --- CONTENT CARD --- */}
            <div className="glass-card-strong p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 mx-4 transform transition-all hover:scale-[1.01] border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        IntelliType<span className="text-cyan-400">.</span>
                    </h1>
                    <p className="text-slate-300 text-sm font-medium tracking-wide uppercase">Join the Elite Typers</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Username</label>
                        <input type="text" name="username" onChange={handleChange} required 
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                            placeholder="Choose a handle"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Email</label>
                        <input type="email" name="email" onChange={handleChange} required 
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Password</label>
                        <input type="password" name="password" onChange={handleChange} required 
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="w-full py-4 mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all transform active:scale-95 uppercase tracking-wide text-sm">
                        Create Account
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-slate-400 text-sm">
                        Already a member?{' '}
                        <Link to="/login" className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline transition">
                            Access Terminal
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Register;