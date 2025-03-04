"use client"

import { TonConnectUIProvider } from '@tonconnect/ui-react';
export default function TonProvider({ children }) {
    const manifestUrl = 'https://amber-impressed-bovid-620.mypinata.cloud/ipfs/QmY9Ee2JpVdP7uHovGTHREEdxw2ErYiU8qtEcMD1M3dvGy';

    return (
        <TonConnectUIProvider manifestUrl={manifestUrl}>
            {children}
        </TonConnectUIProvider>
    )
}