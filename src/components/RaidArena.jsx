import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Wifi, WifiOff, Volume2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const RaidArena = () => {
    // Mock user for prototype; in real app this comes from auth context
    const [username, setUsername] = useState(`Player_${Math.floor(Math.random() * 100)}`);
    const [clanId, setClanId] = useState(1);
    const ws = useRef(null);
    const [status, setStatus] = useState('connecting'); // connecting, connected, disconnected
    const [raidState, setRaidState] = useState(null);
    const [message, setMessage] = useState('');
    const [notifications, setNotifications] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Connect to WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/raid/${clanId}/${username}`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            setStatus('connected');
            addNotification("Connected to The British Council Mainframe.");
        };

        ws.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'state_update') {
                setRaidState(msg.data);
            } else if (msg.type === 'notification') {
                addNotification(msg.message);
            }
        };

        ws.current.onclose = () => setStatus('disconnected');

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [username, clanId]);

    const addNotification = (txt) => {
        setNotifications(prev => [...prev.slice(-4), txt]);
    };

    const startRaid = () => {
        if (ws.current) ws.current.send(JSON.stringify({ type: 'start_raid' }));
    };

    const submitResponse = () => {
        if (ws.current && message.trim()) {
            ws.current.send(JSON.stringify({ type: 'submit_part', content: message }));
            setMessage('');
        }
    };

    const isMyTurn = raidState?.active_player === username;

    return (
        <div className="min-h-screen bg-black text-cyan-50 flex flex-col items-center p-4">

            {/* Header / Boss Status */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 border-b border-red-900/50 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center border-2 border-red-600 animate-pulse">
                        <span className="text-3xl">👹</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-red-500 font-mono">THE EXAMINER</h1>
                        {raidState && (
                            <div className="w-48 h-2 bg-gray-800 rounded-full mt-1">
                                <div
                                    className="h-full bg-red-600 transition-all duration-500"
                                    style={{ width: `${(raidState.boss_hp / 1000) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-400 font-mono mb-1">{username}</div>
                    <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${status === 'connected' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {status === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {status.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Raid Arena */}
            {!raidState || raidState.status === 'waiting' ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                        SUNDAY RAID
                    </h2>
                    <p className="text-gray-400 max-w-md text-center">
                        Wait for your Triad. Only true synchronization can defeat the British Council Boss.
                    </p>
                    <button
                        onClick={startRaid}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
                    >
                        INITIATE SEQUENCE
                    </button>
                    <div className="mt-8 space-y-2 w-full max-w-md">
                        {notifications.map((n, i) => (
                            <div key={i} className="text-xs text-gray-500 font-mono text-center">{n}</div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-4xl flex-1 flex flex-col pb-20">

                    {/* The Prompt */}
                    <div className="bg-gray-900/80 border border-cyan-500/30 p-6 rounded-lg mb-8 text-center shadow-lg">
                        <h3 className="text-sm text-cyan-400 font-bold mb-2 uppercase tracking-widest">Examiner's Question</h3>
                        <p className="text-xl italic text-white">"{raidState.question}"</p>
                    </div>

                    {/* The Response Chain */}
                    <div className="flex-1 space-y-4 mb-8 overflow-y-auto">
                        <div className="flex justify-center space-x-2 mb-4">
                            {['Member A', 'Member B', 'Member C'].map((role, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1/3 p-2 text-center rounded border ${raidState.active_player === raidState.members[idx]
                                            ? 'bg-cyan-900/40 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                                            : raidState.active_player && raidState.members.indexOf(raidState.active_player) > idx
                                                ? 'bg-green-900/20 border-green-800 text-green-700'
                                                : 'bg-gray-900/40 border-gray-700 text-gray-600'
                                        }`}
                                >
                                    <div className="text-xs font-bold uppercase mb-1">{role}</div>
                                    <div className="text-sm truncate">{raidState.members[idx] || 'Waiting...'}</div>
                                </div>
                            ))}
                        </div>

                        {/* Speech Bubbles */}
                        {raidState.responses.map((resp, idx) => (
                            resp && (
                                <div key={idx} className="bg-gray-800/60 p-4 rounded-r-xl rounded-bl-xl border-l-4 border-purple-500 ml-4 max-w-[80%]">
                                    <div className="text-xs text-purple-400 font-mono mb-1">
                                        {raidState.members[idx] || `Player ${idx + 1}`}
                                    </div>
                                    <p className="text-gray-200">{resp}</p>
                                </div>
                            )
                        ))}

                        {/* Notifications Overlay */}
                        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 items-center pointer-events-none">
                            {notifications.map((n, i) => (
                                <div key={i} className="bg-black/80 px-4 py-2 rounded text-xs text-yellow-400 border border-yellow-500/30 animate-fade-in-up">
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-gray-800 p-4">
                        <div className="max-w-4xl mx-auto flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={!isMyTurn}
                                placeholder={isMyTurn ? "Speak now! Your Clan depends on you..." : `Waiting for ${raidState.active_player}...`}
                                className={`flex-1 bg-gray-900 border ${isMyTurn ? 'border-cyan-500 text-white' : 'border-gray-700 text-gray-500'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all`}
                                onKeyPress={(e) => e.key === 'Enter' && submitResponse()}
                            />
                            <button
                                onClick={submitResponse}
                                disabled={!isMyTurn || !message.trim()}
                                className={`px-6 rounded-lg flex items-center justify-center transition-all ${isMyTurn && message.trim()
                                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
                                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-gray-800 rounded-lg text-gray-400 hover:text-white border border-gray-700">
                                <Mic className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RaidArena;
