import { useUserStore } from "@/stores/userStore";
import { useSocket } from "@/providers/SocketProvider";

const CollectModal = ({ isOpen, onClose, coin }) => {
    if (!isOpen) return null;

    const socket = useSocket();
    const { collectPopup, setCollectPopup, setEarnSinceLastLogin } = useUserStore();

    const handleCollect = () => {
        socket.emit("collect", coin);
        setEarnSinceLastLogin(0);
        setCollectPopup(false);
        if (onClose) {
            onClose();
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[15px] p-6 flex flex-col items-center">

            <div className="flex flex-col items-center bg-[#262626] rounded-lg  w-full mb-2">

                {/* Token miktarı */}
                <div className="flex items-center gap-2">
                    <img
                        src="/images/leaf-popup.png"
                        alt="Token"

                    />
                    <span className="text-white text-[48px] font-semibold">{coin.toFixed(2)}</span>
                </div>

                {/* Açıklama metni */}
                <p className="text-gray-300 mb-2 text-[20px]">
                    Received for time away
                </p>
            </div>

            {/* Collect butonu */}
            <button
                className="w-full bg-primary text-white py-4 rounded-lg text-lg font-bold"
                onClick={handleCollect}
            >
                Collect
            </button>
        </div>
    );
};

export default CollectModal; 