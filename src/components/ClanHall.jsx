import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Users, Shield, Sword, Scroll, Share2, AlertTriangle } from 'lucide-react';
import useGameStore from '../store/gameStore';

const ClanHall = () => {
    const [clanData, setClanData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteLink, setInviteLink] = useState('');

    // Mock data for initial render if backend isn't ready
    const MOCK_DATA = {
        name: "Triad of Vertex",
        sanity_meter: 85,
        sync_level: [
            { subject: 'Vocabulary', A: 80, fullMark: 100 },
            { subject: 'Syntax', A: 65, fullMark: 100 },
            { subject: 'Fluency', A: 90, fullMark: 100 },
        ],
        members: [
            { username: "PlayerOne", role: "Lexical Berserker", status: "Online" },
            { username: "GrammarGuardian", role: "Syntax Guardian", status: "Offline" },
            { username: "OracleSpeak", role: "Phonetic Oracle", status: "Training" }
        ]
    };

    useEffect(() => {
        // Fetch clan data here in real impl
        setTimeout(() => {
            setClanData(MOCK_DATA);
            setLoading(false);
        }, 1000);
    }, []);

    const generateInvite = () => {
        const link = `https://t.me/SynapseBot?start=clan_invite_${Math.random().toString(36).substring(7)}`;
        setInviteLink(link);
    };

    if (loading) return <div className="text-white">Accessing Clan Archives...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-black/80 border border-cyan-500/30 rounded-xl backdrop-blur-md text-cyan-50">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-cyan-500/30 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        {clanData.name}
                    </h1>
                    <p className="text-sm text-cyan-400/60">The Triad of Power</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-32 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-yellow-500"
                            style={{ width: `${clanData.sanity_meter}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono text-red-400">SANITY: {clanData.sanity_meter}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Radar Chart - Sync Level */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-cyan-500/20">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        Triad Sync Level
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={clanData.sync_level}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Sync"
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="#8b5cf6"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Member List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-cyan-400" />
                        Clan Members
                    </h3>
                    {clanData.members.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${member.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`} />
                                <div>
                                    <p className="font-bold text-gray-200">{member.username}</p>
                                    <p className="text-xs text-cyan-400/80">{member.role}</p>
                                </div>
                            </div>
                            {idx === 0 && <Sword className="w-4 h-4 text-yellow-500" />}
                        </div>
                    ))}

                    {/* Summoning Interface */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-lg border border-purple-500/30">
                        <h4 className="text-sm font-semibold text-purple-300 mb-2">Summon Allies</h4>
                        <p className="text-xs text-gray-400 mb-4">Ranked Mode is locked until your Triad is complete.</p>
                        {inviteLink ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={inviteLink}
                                    className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-xs w-full text-gray-300"
                                />
                                <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="p-1 hover:text-cyan-400">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={generateInvite}
                                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                            >
                                Generate Summoning Link
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ClanHall;
