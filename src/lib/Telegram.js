import {
    backButton,
    viewport,
    themeParams,
    miniApp,
    initData,
    $debug,
    init as initSDK,
    setMiniAppHeaderColor,
    miniAppHeaderColor,

} from '@telegram-apps/sdk-react';




export async function init() {

    initSDK();

    if (!backButton.isSupported() || !miniApp.isSupported()) {
        throw new Error('ERR_NOT_SUPPORTED');
    }






    backButton.mount();
    miniApp.mount();
    miniApp.setHeaderColor('#000000');
    miniApp.headerColor(); // 'bg_color'
    const headerColor = miniApp.headerColor();

    initData.restore();
}

