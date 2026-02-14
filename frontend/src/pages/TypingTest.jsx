import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const TypingTest = () => {
    const [text, setText] = useState("Loading...");
    const [input, setInput] = useState('');
    const [timeElapsed, setTimeElapsed] = useState(0); 
    const [isActive, setIsActive] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);
    
    // --- NEW: Mistake Tracking State ---
    const [mistakes, setMistakes] = useState({}); 

    const [history, setHistory] = useState([]); 
    const [leaderboard, setLeaderboard] = useState([]); 
    const [stats, setStats] = useState({ average_wpm: 0, best_wpm: 0, total_tests: 0 });

    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => { fetchData(); fetchNewText(); }, []);

    const fetchData = async () => {
        try {
            const [historyRes, statsRes, leadRes] = await Promise.all([
                api.get('/history'),
                api.get('/analytics/stats'),
                api.get('/analytics/leaderboard')
            ]);
            setHistory(historyRes.data.reverse());
            setStats(statsRes.data);
            setLeaderboard(leadRes.data);
        } catch (error) { console.error("Failed to fetch data"); }
    };

    const fetchNewText = async () => {
        try {
            const response = await api.get('/generate-text');
            setText(response.data.text);
        } catch (error) { setText("Error loading text."); }
    };

    useEffect(() => {
        let interval = null;
        if (isActive && !isFinished) {
            interval = setInterval(() => setTimeElapsed(p => p + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isFinished]);

    const handleChange = (e) => {
        if (isFinished) return;
        const value = e.target.value;
        const lastCharIndex = value.length - 1;

        if (!isActive) setIsActive(true);
        
        // --- NEW: Identify specific missed keys ---
        if (value.length > input.length) { // User added a character
            const expectedChar = text[lastCharIndex];
            const typedChar = value[lastCharIndex];

            if (typedChar !== expectedChar) {
                setMistakes(prev => ({
                    ...prev,
                    [expectedChar]: (prev[expectedChar] || 0) + 1
                }));
            }
        }

        setInput(value);

        if (value.length > 0) {
            let correctSoFar = 0;
            const limit = Math.min(value.length, text.length);
            for (let i = 0; i < limit; i++) {
                if (value[i] === text[i]) correctSoFar++;
            }
            setAccuracy(((correctSoFar / value.length) * 100).toFixed(1));
        } else {
            setAccuracy(100);
        }

        if (value.length >= text.length) finishTest(value);
    };

    const finishTest = async (finalInput = input) => {
        setIsActive(false);
        setIsFinished(true);
        let correctChars = 0;
        const len = Math.min(finalInput.length, text.length);
        for (let i = 0; i < len; i++) if (finalInput[i] === text[i]) correctChars++;

        const finalAccuracy = (correctChars / text.length) * 100;
        const durationInMinutes = timeElapsed / 60 || 0.01;
        const finalWpm = (finalInput.length / 5) / durationInMinutes;

        setAccuracy(finalAccuracy.toFixed(2));
        setWpm(Math.round(finalWpm));

        try {
            await api.post('/submit-test', {
                wpm: Math.round(finalWpm),
                accuracy: finalAccuracy,
                error_rate: 100 - finalAccuracy,
                duration: timeElapsed
            });
            fetchData(); 
        } catch (error) { console.error("Failed to save result"); }
    };

    const resetTest = () => {
        setInput(''); setTimeElapsed(0); setIsActive(false); setIsFinished(false);
        setWpm(0); setAccuracy(100); setMistakes({}); // Reset mistakes too
        fetchNewText();
        setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Helper to get top 3 weakest keys
    const getWeakestKeys = () => {
        return Object.entries(mistakes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    };

    const renderTargetText = () => {
        return text.split('').map((char, index) => {
            let color = "text-slate-500"; 
            let bg = "bg-transparent";
            if (index < input.length) {
                if (input[index] === char) { 
                    color = "text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"; 
                } else { 
                    color = "text-red-400 font-bold"; 
                    bg = "bg-red-900/40"; 
                }
            }
            const isCurrent = index === input.length;
            return (
                <span key={index} className={`${color} ${bg} ${isCurrent ? 'border-b-2 border-cyan-400 animate-pulse' : ''} transition-colors duration-75 relative`}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="relative min-h-screen bg-slate-900 flex flex-col items-center overflow-hidden font-sans text-slate-200">
            
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
                    alt="Cyber Background" 
                    className="w-full h-full object-cover opacity-30 animate-pan"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/90"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 flex flex-col min-h-screen">
                
                <div className="flex flex-col md:flex-row justify-between items-center py-6 border-b border-slate-700/50 mb-8 space-y-4 md:space-y-0">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl animate-pulse">🌌</span>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight">
                            IntelliType<span className="text-white">.AI</span>
                        </h1>
                    </div>
                    <button onClick={handleLogout} className="px-5 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm font-semibold tracking-wide">
                        TERMINATE SESSION
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
                    <div className="glass-card-strong p-6 rounded-2xl border border-slate-700/50 transition group">
                        <div className="text-cyan-400/70 text-xs font-bold uppercase tracking-widest mb-2">Live Accuracy</div>
                        <div className="text-4xl font-black text-white group-hover:text-cyan-400 transition">{accuracy}%</div>
                    </div>

                    {/* --- NEW: Weakest Keys Display --- */}
                    <div className="glass-card-strong p-6 rounded-2xl border border-rose-500/30 transition group">
                        <div className="text-rose-400/70 text-xs font-bold uppercase tracking-widest mb-2">Keys to Practice</div>
                        <div className="flex gap-2 mt-2">
                            {getWeakestKeys().length > 0 ? getWeakestKeys().map(([key, count]) => (
                                <div key={key} className="bg-rose-900/40 border border-rose-500/50 px-3 py-1 rounded text-lg font-bold text-white">
                                    {key === " " ? "␣" : key}
                                </div>
                            )) : <span className="text-slate-500 text-sm">No mistakes yet!</span>}
                        </div>
                    </div>

                    <div className="relative p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-xl hover:scale-[1.02] transition">
                        <div className="text-emerald-400/70 text-xs font-bold uppercase tracking-widest mb-2">Personal Best</div>
                        <div className="text-4xl font-black text-white drop-shadow-lg">{stats.best_wpm} <span className="text-sm font-medium text-emerald-500/50">WPM</span></div>
                    </div>
                    <div className="glass-card-strong p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition group">
                        <div className="text-purple-400/70 text-xs font-bold uppercase tracking-widest mb-2">Total Tests</div>
                        <div className="text-4xl font-black text-white group-hover:text-purple-400 transition">{stats.total_tests}</div>
                    </div>
                </div>

                <div className="glass-card-strong rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl mb-12">
                    <div className="p-8 bg-black/20 h-48 overflow-y-auto font-mono text-lg md:text-xl leading-relaxed">
                        {renderTargetText()}
                    </div>
                    
                    <div className="relative border-t border-slate-700/50">
                        <textarea
                            ref={inputRef} disabled={isFinished} value={input} onChange={handleChange}
                            className="w-full h-32 p-8 bg-transparent text-white font-mono text-lg md:text-xl focus:outline-none placeholder-slate-600 resize-none"
                            placeholder="Initiate typing sequence..." spellCheck="false"
                        ></textarea>
                    </div>

                    <div className="px-8 py-4 bg-slate-900/50 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-bold">
                                <span>⏱️</span>
                                <span>{timeElapsed}s</span>
                            </div>
                        </div>
                        <button onClick={resetTest} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95">
                            {isFinished ? 'NEXT CHALLENGE ➔' : 'RESTART SYSTEM ↺'}
                        </button>
                    </div>
                </div>

                {/* Tables stay as they were */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                    <div className="glass-card-strong rounded-2xl overflow-hidden border border-slate-700/50">
                        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
                            <h3 className="font-bold text-slate-300">📜 Log History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-slate-500 text-xs uppercase font-bold bg-slate-800/50">
                                    <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Speed</th><th className="px-6 py-3">Acc</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 text-sm">
                                    {history.length === 0 ? <tr><td colSpan="3" className="p-6 text-center text-slate-500">No data found.</td></tr> :
                                    history.slice(0, 5).map(t => (
                                        <tr key={t.id} className="hover:bg-slate-700/30 transition">
                                            <td className="px-6 py-3 text-slate-400">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 font-bold text-cyan-400">{t.wpm}</td>
                                            <td className="px-6 py-3 text-emerald-400">{t.accuracy.toFixed(0)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass-card-strong rounded-2xl overflow-hidden border border-slate-700/50">
                        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
                            <h3 className="font-bold text-slate-300 flex items-center gap-2">🏆 Global Elite</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-amber-500/70 text-xs uppercase font-bold bg-slate-800/50">
                                    <tr><th className="px-6 py-3">#</th><th className="px-6 py-3">User</th><th className="px-6 py-3 text-right">Speed</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 text-sm">
                                    {leaderboard.length === 0 ? <tr><td colSpan="3" className="p-6 text-center text-slate-500">Loading network...</td></tr> :
                                    leaderboard.map((e, i) => (
                                        <tr key={i} className="hover:bg-amber-900/10 transition">
                                            <td className="px-6 py-3 font-bold text-slate-500">0{i + 1}</td>
                                            <td className="px-6 py-3 font-bold text-slate-200">
                                                <div className="w-[150px] overflow-x-auto scrollbar-hide whitespace-nowrap">
                                                    {e.username}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 font-bold text-amber-400 text-right">{e.wpm}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypingTest;