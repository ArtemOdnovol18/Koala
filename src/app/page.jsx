"use client"

import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import MineButton from "@/components/Main/MineButton";
import CollectModal from "@/components/Main/CollectModal";
import Splash from "@/components/Splash";
import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/userStore";

export default function Home() {
  //const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading } = useAppStore();
  const { collectPopup, setCollectPopup, earnSinceLastLogin } = useUserStore();



  if (loading) {
    return <Splash />
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black/75 to-black">
      <Header />


      <MineButton />
      <CollectModal isOpen={collectPopup} onClose={() => setCollectPopup(false)} coin={earnSinceLastLogin} />


      {!collectPopup && <TabBar activeTab={"main"} />}
    </div>
  );
}




