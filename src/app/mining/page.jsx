"use client"
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ReactConfetti from 'react-confetti';
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/userStore";
import { useSocket } from "@/providers/SocketProvider";

export default function Mining() {
    const { miningCards, loading } = useAppStore();
    const { telegramId, user } = useUserStore();
    const socket = useSocket();

    const [shuffledMiningCards, setShuffledMiningCards] = useState([]);

    const [gameState, setGameState] = useState({
        isSpinning: false,
        currentSlide: 0,
        remainingSpins: user?.spin,
        showConfetti: false
    });

    const sliderRef = useRef(null);


    const currentSlideRef = useRef(0);

    const [isLoading, setIsLoading] = useState(true);



    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 100);
    }, []);

    useEffect(() => {
        if (miningCards.length > 0) {
            const shuffled = [...miningCards];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setShuffledMiningCards(shuffled);
        }
    }, [miningCards]);

    const handleSpin = () => {
        if (gameState.isSpinning || user.spin <= 0) return;

        // Kartları karıştır
        const shuffledCards = [...miningCards];
        for (let i = shuffledCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
        }

        // Karıştırılmış kartlardan rastgele seçim
        const randomIndex = Math.floor(Math.random() * shuffledCards.length);
        const selectedCard = shuffledCards[randomIndex];
        const selectedIndex = miningCards.findIndex(card => card.id === selectedCard.id);

        // Calculate how many positions to move to reach the selected card
        const currentPosition = currentSlideRef.current % miningCards.length;
        const targetPosition = selectedIndex;
        const totalRotations = 5;
        const totalSlides = (totalRotations * miningCards.length) +
            ((targetPosition - currentPosition + miningCards.length) % miningCards.length);

        sliderRef.current?.slickGoTo(0);

        setGameState(prev => ({
            ...prev,
            isSpinning: true,
            showConfetti: false,
        }));

        // Rest of the animation logic
        const spinDuration = Math.random() * (7000 - 4000) + 4000;
        const slowdownDuration = 2000;
        const startTime = Date.now();
        let lastUpdateTime = startTime;
        const minInterval = 20;
        const maxInterval = 500;
        let slideCount = 0;

        const animate = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            const timeSinceLastUpdate = currentTime - lastUpdateTime;

            let currentInterval = minInterval;
            if (elapsedTime > spinDuration - slowdownDuration) {
                const slowdownProgress = (elapsedTime - (spinDuration - slowdownDuration)) / slowdownDuration;
                const easeOutQuart = 1 - Math.pow(1 - slowdownProgress, 4);
                currentInterval = minInterval + (maxInterval - minInterval) * easeOutQuart;
            }

            if (timeSinceLastUpdate >= currentInterval && slideCount < totalSlides) {
                sliderRef.current?.slickNext();
                slideCount++;
                lastUpdateTime = currentTime;
            }

            if (elapsedTime < spinDuration && slideCount < totalSlides) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    socket.emit("spinReward", {
                        id: selectedCard.id,
                        telegramId: telegramId,
                        reward: selectedCard.reward
                    });

                    setGameState(prev => ({ ...prev, showConfetti: true }));
                    setTimeout(() => {
                        setGameState(prev => ({ ...prev, isSpinning: false }));
                        setTimeout(() =>
                            setGameState(prev => ({ ...prev, showConfetti: false }))
                            , 5000);
                    }, 500);
                }, 100);
            }
        };

        requestAnimationFrame(animate);
    };

    const settings = {
        dots: false,
        infinite: true,
        slidesToShow: 2.3,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '0px',
        arrows: false,
        swipe: false,
        touchMove: false,
        speed: 100,
        cssEase: 'linear',
        beforeChange: (_, newIndex) => {
            currentSlideRef.current = newIndex;
            setGameState(prev => ({ ...prev, currentSlide: newIndex }));
        },
        afterChange: (currentIndex) => {
            currentSlideRef.current = currentIndex;
        }
    };

    if (loading) {
        return <Splash />
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black/75 to-black">
            {gameState.showConfetti && (
                <ReactConfetti

                    recycle={false}
                    numberOfPieces={1000}
                    gravity={0.2}
                    initialVelocityY={30}
                    tweenDuration={5000}
                    style={{
                        position: 'fixed',
                        zIndex: 9999,
                        top: 0,
                        left: 0
                    }}
                    colors={['#2A9D58', '#238C47', '#175128', '#FFFFFF', '#50C878']}
                />
            )}

            <div className="flex flex-col min-h-screen">
                <Header />

                <main className="flex-1 flex flex-col items-center p-0 mb-20">
                    <h1 className="text-white text-2xl font-semibold mb-4">Wheel of Fortune</h1>

                    <div className="flex items-center justify-between w-[226px] h-[60px] bg-gray-800/50 rounded-[15px] px-4 py-1 mb-8">
                        <span className="text-white font-bold text-xl">5 spins</span>
                        <div className="flex items-center justify-center bg-white rounded-full px-2 py-0.5">
                            <span className="text-black text-md">100</span>
                            <img src="/images/star.png" alt="star" className="w-[21px] h-[21px]" />
                        </div>
                    </div>

                    <div className="flex-1 w-full relative overflow-hidden px-4 max-w-3xl mx-auto">
                        <div className="flex flex-col items-center">
                            <div className="w-full mx-[-50%] mb-[120px] sm:mb-[130px] md:mb-[150px]">
                                <AnimatePresence>
                                    {isLoading ? (
                                        <motion.div
                                            className="w-full flex justify-center items-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <img
                                                src="/images/koala.png"
                                                alt="Loading..."
                                                className="w-[350px] h-[270px] object-contain"
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Slider ref={sliderRef} {...settings}>
                                                {shuffledMiningCards.map((card, index) => (
                                                    <div key={card._id} className="px-[5px]">
                                                        <motion.div
                                                            id="mining-card"
                                                            className="w-full h-[270px] rounded-[15px] relative flex items-start justify-center"
                                                            style={
                                                                index === gameState.currentSlide % miningCards.length
                                                                    ? {
                                                                        border: '2px solid transparent',
                                                                        backgroundImage: 'linear-gradient(#1A1B1A, #1A1B1A), linear-gradient(180deg, #2A9D58 0%, #175128 100%)',
                                                                        backgroundOrigin: 'border-box',
                                                                        backgroundClip: 'padding-box, border-box',
                                                                        boxShadow: gameState.showConfetti ? ['0 0 20px #2A9D58', '0 0 30px #2A9D58'].join(', ') : 'none',
                                                                        animation: gameState.showConfetti ? 'pulse 1.5s infinite' : 'none'
                                                                    }
                                                                    : {
                                                                        background: '#1A1B1A',
                                                                        border: 'none'
                                                                    }
                                                            }
                                                        >
                                                            <div className="w-[75px] h-[75px] bg-[#262626] rounded-full flex items-center justify-center mt-5">
                                                                <img src="/images/leaf-card.png" alt="star" className="w-[35px] h-[46px] opacity-30" />
                                                            </div>

                                                            {index === gameState.currentSlide % miningCards.length && (
                                                                <motion.div
                                                                    className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-start mt-5"
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    transition={{
                                                                        type: "spring",
                                                                        stiffness: 300,
                                                                        damping: 20
                                                                    }}
                                                                >
                                                                    <div className="w-[75px] h-[75px] bg-[#262626] rounded-full flex items-center justify-center">
                                                                        <img src="/images/leaf-card.png" alt="star" className="w-[35px] h-[46px]" />
                                                                    </div>

                                                                    <span className="text-white/50 text-lg">
                                                                        You got:
                                                                    </span>

                                                                    <span className="text-white text-5xl font-bold">
                                                                        {card.reward >= 1000000 ? `${(card.reward / 1000000).toFixed(1)}M` :
                                                                            card.reward >= 1000 ? `${(card.reward / 1000).toFixed(1)}K` :
                                                                                Math.floor(card.reward)}
                                                                    </span>
                                                                </motion.div>
                                                            )}
                                                        </motion.div>
                                                    </div>
                                                ))}
                                            </Slider>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="relative w-[124px] h-[132px] -mt-[120px] sm:-mt-[130px] md:-mt-[150px]">
                                <motion.div
                                    className="absolute w-[148px] h-[148px] left-[-12px] top-[-4px] bg-[#1A1B1A] rounded-full"
                                    animate={{
                                        boxShadow: gameState.isSpinning
                                            ? ['0 0 0px #238C47', '0 0 20px #238C47', '0 0 0px #238C47']
                                            : 'none'
                                    }}
                                    transition={{
                                        repeat: gameState.isSpinning ? Infinity : 0,
                                        duration: 1.5
                                    }}
                                />

                                <AnimatePresence>
                                    {!gameState.isSpinning && user.spin > 0 && (
                                        <motion.div
                                            className={`absolute w-[20px] h-[20px] left-[52px] top-[-4px] z-[7]`}
                                            style={{
                                                background: 'radial-gradient(circle at center, #2A9D58 0%, #238C47 100%)',
                                                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                            }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    onClick={handleSpin}
                                    disabled={gameState.isSpinning || user.spin <= 0}
                                    className={`absolute w-[124px] h-[124px] left-0 top-[8px] rounded-full flex flex-col items-center justify-center z-[10] 
                                        ${gameState.isSpinning || user.spin <= 0 ? 'opacity-75' : ''}`}
                                    style={{
                                        background: user.spin <= 0
                                            ? 'radial-gradient(circle at center, #666666 0%, #444444 100%)'
                                            : 'radial-gradient(circle at center, #2A9D58 0%, #238C47 100%)'
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    animate={{
                                        scale: gameState.isSpinning ? [1, 1.05, 1] : 1
                                    }}
                                    transition={{
                                        repeat: gameState.isSpinning ? Infinity : 0,
                                        duration: 1
                                    }}
                                >
                                    <span className="text-xl mb-1 text-white font-bold">
                                        {gameState.isSpinning ? 'Spinning...' : (user.spin <= 0 ? 'Buy More' : 'Spin')}
                                    </span>
                                    <span className="text-sm text-green-100">Remaining: {user.spin}</span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </main>

                <TabBar activeTab={"mining"} />
            </div>

        </div>
    );
}




