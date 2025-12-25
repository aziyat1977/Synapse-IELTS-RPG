import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PaymentModal = ({ product, onSuccess, onCancel }) => {
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);

    useEffect(() => {
        if (paymentMethod && !isProcessing && !paymentComplete) {
            // Simulate payment processing
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                setPaymentComplete(true);
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }, 2000);
        }
    }, [paymentMethod, isProcessing, paymentComplete, onSuccess]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    {!paymentComplete ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">{product.icon}</div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {product.name}
                                </h2>
                                <div className="text-3xl font-bold text-cyan-400">
                                    {product.price.toLocaleString()} UZS
                                </div>
                            </div>

                            {!paymentMethod ? (
                                <>
                                    <p className="text-gray-400 text-center mb-6">
                                        Choose your payment method:
                                    </p>

                                    {/* Payment Methods */}
                                    <div className="space-y-3">
                                        <motion.button
                                            onClick={() => setPaymentMethod('click')}
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-between transition-all shadow-lg shadow-blue-500/30"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                    <span className="text-2xl">💳</span>
                                                </div>
                                                <span>Click</span>
                                            </div>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </motion.button>

                                        <motion.button
                                            onClick={() => setPaymentMethod('payme')}
                                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-between transition-all shadow-lg shadow-green-500/30"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                    <span className="text-2xl">🏦</span>
                                                </div>
                                                <span>Payme</span>
                                            </div>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </motion.button>

                                        <motion.button
                                            onClick={() => setPaymentMethod('uzum')}
                                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-between transition-all shadow-lg shadow-purple-500/30"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                    <span className="text-2xl">🛍️</span>
                                                </div>
                                                <span>Uzum Nasiya</span>
                                            </div>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </motion.button>
                                    </div>

                                    <button
                                        onClick={onCancel}
                                        className="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    {/* Processing Animation */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
                                    />
                                    <p className="text-gray-300 text-lg mb-2">Processing Payment...</p>
                                    <p className="text-sm text-gray-500">
                                        Connecting to {paymentMethod.toUpperCase()}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Success State */
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="text-8xl mb-4"
                            >
                                ✅
                            </motion.div>
                            <h3 className="text-2xl font-bold text-green-400 mb-2">
                                Payment Successful!
                            </h3>
                            <p className="text-gray-400">
                                {product.name} has been added to your inventory
                            </p>
                        </motion.div>
                    )}

                    {/* Development Note */}
                    <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-xs text-yellow-400 text-center">
                            🔧 Development Mode: Auto-approving payments
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PaymentModal;
