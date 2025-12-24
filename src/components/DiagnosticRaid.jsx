import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';

const DiagnosticRaid = () => {
    const {
        isRecording,
        recordingTime,
        maxRecordingTime,
        startRecording,
        stopRecording,
        updateRecordingTime,
    } = useGameStore();

    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stopRecording(blob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            startRecording();

            // Start timer
            timerRef.current = setInterval(() => {
                updateRecordingTime((prev) => {
                    const newTime = prev + 0.1;
                    if (newTime >= maxRecordingTime) {
                        handleStopRecording();
                        return maxRecordingTime;
                    }
                    return newTime;
                });
            }, 100);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Please allow microphone access to begin the diagnostic raid.');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            clearInterval(timerRef.current);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const progress = (recordingTime / maxRecordingTime) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-synapse-darker via-synapse-dark to-synapse-darker flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-7xl font-black glow-text mb-4">
                        DIAGNOSTIC RAID
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Speak for 30 seconds. The AI will analyze your neural gaps.
                    </p>
                </motion.div>

                {/* Recording Interface */}
                <motion.div
                    className="rpg-border bg-synapse-dark/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Waveform Visualization */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center h-32 gap-1">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 bg-gradient-to-t from-synapse-purple to-synapse-cyan rounded-full"
                                    animate={
                                        isRecording
                                            ? {
                                                height: [
                                                    Math.random() * 100 + 20,
                                                    Math.random() * 100 + 20,
                                                    Math.random() * 100 + 20,
                                                ],
                                            }
                                            : { height: 20 }
                                    }
                                    transition={{
                                        duration: 0.3,
                                        repeat: isRecording ? Infinity : 0,
                                        delay: i * 0.02,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Timer Display */}
                    <div className="text-center mb-8">
                        <div className="text-6xl font-['Orbitron'] font-bold text-synapse-cyan">
                            {Math.floor(recordingTime)}s
                        </div>
                        <div className="text-gray-400 mt-2">
                            {maxRecordingTime - Math.floor(recordingTime)}s remaining
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8 bg-gray-800/50 rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-synapse-purple via-synapse-cyan to-synapse-blue"
                            style={{ width: `${progress}%` }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-4 justify-center">
                        {!isRecording ? (
                            <motion.button
                                onClick={handleStartRecording}
                                className="px-8 py-4 bg-synapse-purple hover:bg-synapse-purple/80 rounded-lg font-bold text-lg transition-all flex items-center gap-3"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                START RECORDING
                            </motion.button>
                        ) : (
                            <motion.button
                                onClick={handleStopRecording}
                                className="px-8 py-4 bg-synapse-red hover:bg-synapse-red/80 rounded-lg font-bold text-lg transition-all flex items-center gap-3"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{ boxShadow: ['0 0 20px rgba(239, 68, 68, 0.5)', '0 0 40px rgba(239, 68, 68, 0.8)'] }}
                                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                </svg>
                                STOP RECORDING
                            </motion.button>
                        )}
                    </div>

                    {/* Instructions */}
                    <motion.div
                        className="mt-8 p-4 bg-synapse-purple/10 border border-synapse-purple/30 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h3 className="text-synapse-cyan font-bold mb-2">💡 Pro Tips:</h3>
                        <ul className="text-gray-300 text-sm space-y-1">
                            <li>• Speak naturally about any topic</li>
                            <li>• The AI detects grammar, vocabulary, & fluency gaps</li>
                            <li>• Each error spawns a unique "Syntax Demon" enemy</li>
                            <li>• Your performance generates your starting band level</li>
                        </ul>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default DiagnosticRaid;
