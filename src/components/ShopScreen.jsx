import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameStore';
import { useState } from 'react';

const ShopScreen = () => {
    const { currency, inventory, purchaseItem, player } = useGameStore();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Silk Road Product Catalog
    const products = [
        {
            id: 'freeze_streak',
            name: 'Freeze Streak',
            description: 'Protect your daily streak for 24h. "The Fear of Loss."',
            price: 5000,
            icon: '❄️',
            category: 'psychology',
            effect: () => console.log('Streak Frozen')
        },
        {
            id: 'sanity_potion',
            name: 'Sanity Potion',
            description: 'Instantly restore full sanity. "The Impulse Buy."',
            price: 15000,
            icon: '🧪',
            category: 'impulse',
            effect: () => useGameStore.getState().restoreSanityFull()
        },
        {
            id: 'battle_pass',
            name: 'Battle Pass (S1)',
            description: 'Unlock Gladiator Tier & Community Access.',
            price: 150000,
            icon: '⚔️',
            category: 'gladiator',
            effect: () => console.log('Battle Pass Unlocked'),
            isTierUpgrade: true
        },
        {
            id: 'ielts_insurance',
            name: 'IELTS Insurance',
            description: 'Band 6.0 Guarantee via Uzum Nasiya (12x).',
            price: 1200000,
            icon: '🛡️',
            category: 'investment',
            isExternal: true,
            effect: () => console.log('Redirecting to Uzum...')
        }
    ];

    const handlePurchase = async (product) => {
        if (product.isExternal) {
            // Uzum Nasiya Flow
            setIsProcessing(true);
            setTimeout(() => {
                alert("Redirecting to Uzum Nasiya for credit check...");
                setIsProcessing(false);
            }, 1000);
            return;
        }

        if (currency >= product.price) {
            setSelectedProduct(product);
            // Simulate Telegram Invoice Flow
            setIsProcessing(true);

            // Mock API Delay
            setTimeout(() => {
                setIsProcessing(false);
                const confirmed = window.confirm(`Confirm payment of ${product.price.toLocaleString()} UZS via Click/Payme?`);

                if (confirmed) {
                    const success = purchaseItem(product);
                    if (success) {
                        alert(`Successfully purchased ${product.name}!`);
                        setSelectedProduct(null);
                    }
                }
            }, 1500);
        } else {
            alert('Insufficient funds! Go study to earn more UZS.');
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'psychology': return 'from-blue-600 to-indigo-600';
            case 'impulse': return 'from-purple-600 to-pink-600';
            case 'gladiator': return 'from-amber-500 to-yellow-600';
            case 'investment': return 'from-emerald-600 to-green-700';
            default: return 'from-gray-600 to-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-synapse-darker p-8 pb-32">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent font-['Orbitron']">
                    THE SILK ROAD
                </h1>
                <p className="text-gray-400 text-lg mb-6">
                    Invest in your cognitive supremacy
                </p>

                {/* Currency Display */}
                <div className="inline-flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-gray-800/50 px-6 py-3 rounded-full border border-yellow-500/30">
                        <span className="text-2xl">💰</span>
                        <div>
                            <div className="text-xs text-gray-400">Balance</div>
                            <div className="text-xl font-bold text-yellow-400">
                                {currency.toLocaleString()} UZS
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-800/50 px-6 py-3 rounded-full border border-purple-500/30">
                        <span className="text-2xl">🎖️</span>
                        <div>
                            <div className="text-xs text-gray-400">Tier</div>
                            <div className="text-xl font-bold text-purple-400">
                                {player.tier}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {products.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 group relative"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

                        {/* Product Header */}
                        <div className={`bg-gradient-to-br ${getCategoryColor(product.category)} p-6 text-center h-40 flex flex-col justify-center items-center`}>
                            <div className="text-6xl mb-2 filter drop-shadow-lg transform group-hover:scale-110 transition-transform">{product.icon}</div>
                        </div>

                        {/* Product Body */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                            <p className="text-gray-400 text-sm mb-6 h-12 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Price */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-2xl font-bold text-white">
                                    {product.price.toLocaleString()}
                                    <span className="text-xs text-gray-400 ml-1">UZS</span>
                                </div>
                            </div>

                            {/* Purchase Button */}
                            <motion.button
                                onClick={() => handlePurchase(product)}
                                disabled={(currency < product.price && !product.isExternal) || (product.isTierUpgrade && player.tier === 'Gladiator')}
                                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg ${(currency >= product.price || product.isExternal)
                                        ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white hover:from-yellow-500 hover:to-amber-500 shadow-amber-900/40'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {product.isTierUpgrade && player.tier === 'Gladiator'
                                    ? 'ALREADY OWNED'
                                    : isProcessing && selectedProduct?.id === product.id
                                        ? 'PROCESSING...'
                                        : product.isExternal ? 'APPLY NOW' : 'PURCHASE'}
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-12 text-gray-500 text-sm"
            >
                <p>🔒 Secure Payments via CLICK / PayMe / Uzum</p>
            </motion.div>
        </div>
    );
};

export default ShopScreen;
