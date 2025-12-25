import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { HexGrid } from './HexGrid';
import useGameStore from '../../store/gameStore';

export default function WorldMap() {
    const { player, setGameState, startCombat, quests, uploadPDF, isUploading } = useGameStore();
    const [selectedNode, setSelectedNode] = useState(null);
    const fileInputRef = useRef(null);

    const handleNodeSelect = (node) => {
        if (selectedNode?.id === node.id) {
            setSelectedNode(null);
        } else {
            setSelectedNode(node);
        }
    };

    const handleStartQuest = () => {
        if (selectedNode) {
            // Transform node to combat question structure if needed, or pass directly
            // The refinery returns nodes, but for combat we usually need "questions".
            // Let's assume the node itself works as a "context" for generation or has embedded questions.
            // For Phase 2 Demo, we'll generate a mock question based on the Node Title/Description 
            // OR ideally the refinery should return questions inside the node.

            // Let's fabricate a mock question dynamically here to ensure combat works instantly
            // Real implementation would have questions in the Node or fetch them.
            const combatData = {
                prompt: `Complete the sentence related to ${selectedNode.title}:`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: "Option A", // Placeholder
                complexity: selectedNode.difficulty,
                explanation: `Focus on ${selectedNode.description}`
            };

            startCombat(combatData);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            await uploadPDF(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="w-full h-screen bg-[#050814] relative overflow-hidden">
            {/* 3D Scene */}
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 8, 8]} fov={50} />
                <OrbitControls
                    enablePan={true}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={5}
                    maxDistance={15}
                    makeDefault
                />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

                <Suspense fallback={null}>
                    {quests.length > 0 && (
                        <HexGrid
                            nodes={quests}
                            onNodeSelect={handleNodeSelect}
                            selectedNodeId={selectedNode?.id}
                        />
                    )}
                    <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
                    <Environment preset="city" />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 p-8 pointer-events-none z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl"
                >
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        THE WORLD MAP
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Exploring the Citadel of Knowledge</p>
                </motion.div>
            </div>

            {/* Upload Overlay (if no quests) */}
            <AnimatePresence>
                {quests.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md"
                    >
                        <div className="text-center p-8 border border-white/20 rounded-3xl bg-black/80 max-w-md">
                            <h2 className="text-3xl font-bold text-white mb-4">CONTENT REFINERY</h2>
                            <p className="text-gray-300 mb-8">
                                Upload IELTS study material (PDF) to procedurally generate the game world.
                            </p>

                            <input
                                type="file"
                                accept=".pdf"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            <button
                                onClick={triggerFileInput}
                                disabled={isUploading}
                                className="px-8 py-4 bg-gradient-to-r from-synapse-purple to-synapse-cyan rounded-xl font-bold text-white hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isUploading ? 'REFINING CONTENT...' : 'UPLOAD PDF MATERIAL'}
                            </button>

                            {isUploading && (
                                <motion.div
                                    className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden"
                                >
                                    <motion.div
                                        className="h-full bg-cyan-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quest Details Modal */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-[#0a0e27]/90 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-2xl z-20"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono uppercase tracking-widest text-purple-400 mb-2 inline-block">
                                    {selectedNode.type}
                                </span>
                                <h3 className="text-2xl font-bold text-white">{selectedNode.title}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase">Difficulty</p>
                                <p className="text-lg font-bold text-blue-400">Band {selectedNode.difficulty}</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6">{selectedNode.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                <p className="text-xs text-gray-500 uppercase mb-1">XP Reward</p>
                                <p className="text-xl font-bold text-yellow-500">+{selectedNode.rewards.xp}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                <p className="text-xs text-gray-500 uppercase mb-1">Sanity Restore</p>
                                <p className="text-xl font-bold text-green-500">+{selectedNode.rewards.sanity}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleStartQuest}
                            disabled={selectedNode.status === 'locked'}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${selectedNode.status === 'locked'
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.6)] active:scale-95'
                                }`}
                        >
                            {selectedNode.status === 'locked' ? 'Node Locked' : 'Engage Quest'}
                        </button>

                        {/* Debug Unlock */}
                        {selectedNode.status === 'locked' && (
                            <button
                                onClick={() => { selectedNode.status = 'unlocked'; setSelectedNode({ ...selectedNode }); }}
                                className="text-xs text-gray-600 mt-2 underline"
                            >
                                Hack: Unlock
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back to Landing */}
            <button
                onClick={() => setGameState('landing')}
                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all backdrop-blur-md z-20"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
