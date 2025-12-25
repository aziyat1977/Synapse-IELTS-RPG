import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Map, Crown, TrendingUp } from 'lucide-react';

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('regional'); // 'regional' | 'national'
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const MOCK_REGIONAL = [
        { region: "Tashkent", score: 15400, army_size: 42 },
        { region: "Samarkand", score: 12300, army_size: 35 },
        { region: "Bukhara", score: 9800, army_size: 20 },
        { region: "Namangan", score: 8500, army_size: 18 },
    ];

    const MOCK_NATIONAL = [
        { rank: 1, username: "LexicalKing", region: "Tashkent", xp: 5200, credits: 120.5 },
        { rank: 2, username: "GrammarKhan", region: "Samarkand", xp: 4900, credits: 98.0 },
        { rank: 3, username: "FluencyNinja", region: "Tashkent", xp: 4850, credits: 85.5 },
        { rank: 4, username: "VocabViper", region: "Bukhara", xp: 4600, credits: 72.0 },
        { rank: 5, username: "SyntaxSage", region: "Namangan", xp: 4100, credits: 50.0 },
    ];

    useEffect(() => {
        // Fetch from /api/leaderboard?by={activeTab}
        // Simulating API call
        setLoading(true);
        setTimeout(() => {
            if (activeTab === 'regional') setLeaderboardData(MOCK_REGIONAL);
            else setLeaderboardData(MOCK_NATIONAL);
            setLoading(false);
        }, 800);
    }, [activeTab]);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-black/80 border border-yellow-500/30 rounded-xl backdrop-blur-md text-yellow-50">

            <div className="flex justify-between items-center mb-8 border-b border-yellow-500/30 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        National Rankings
                    </h1>
                    <p className="text-sm text-yellow-400/60">The Macro-System War</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('regional')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'regional' ? 'bg-yellow-600 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        <Map className="w-4 h-4" /> Turf War
                    </button>
                    <button
                        onClick={() => setActiveTab('national')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'national' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        <Trophy className="w-4 h-4" /> Top Elites
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 animate-pulse text-yellow-500">Syncing with Central Server...</div>
            ) : (
                <div className="min-h-[400px]">
                    {activeTab === 'regional' ? (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-center mb-4">Linguistic Turf Wars: XP by Region</h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={leaderboardData} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="region" type="category" width={80} stroke="#ca8a04" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #ca8a04' }}
                                            cursor={{ fill: '#374151' }}
                                        />
                                        <Bar dataKey="score" fill="#eab308" radius={[0, 4, 4, 0]} barSize={20}>
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                {leaderboardData.map((city, idx) => (
                                    <div key={idx} className="bg-gray-900/50 p-4 rounded border border-yellow-500/20 text-center">
                                        <h3 className="font-bold text-lg text-yellow-400">{city.region}</h3>
                                        <p className="text-2xl font-mono">{city.score.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">{city.army_size} Active Soldiers</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-yellow-400/60 border-b border-yellow-500/20">
                                        <th className="p-3">Rank</th>
                                        <th className="p-3">Gladiator</th>
                                        <th className="p-3">Region</th>
                                        <th className="p-3">Total XP</th>
                                        <th className="p-3 text-right">Digital Credits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((user, idx) => (
                                        <tr key={idx} className="hover:bg-yellow-500/5 transition-colors border-b border-gray-800">
                                            <td className="p-3 font-mono text-yellow-500">
                                                {user.rank === 1 && <Crown className="w-4 h-4 inline mr-1 text-yellow-400" />}
                                                #{user.rank}
                                            </td>
                                            <td className="p-3 font-bold">{user.username}</td>
                                            <td className="p-3 text-gray-400">{user.region}</td>
                                            <td className="p-3 font-mono text-orange-400">{user.xp.toLocaleString()}</td>
                                            <td className="p-3 text-right font-mono text-green-400 flex items-center justify-end gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                {user.credits.toFixed(1)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8 text-center text-xs text-gray-500">
                * Top rankings qualify for Government Digital Credits (GDC) usable for university exams.
            </div>
        </div>
    );
};

export default Leaderboard;
