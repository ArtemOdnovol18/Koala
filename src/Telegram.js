import { getLaunchParams } from '@telegram-apps/sdk';
// ...existing code...

function init() {
  try {
    const launchParams = getLaunchParams();
    if (!launchParams) {
      throw new Error('Launch parameters are missing');
    }
    // ...existing code...
  } catch (error) {
    console.error('Unable to retrieve launch parameters:', error);
    // Handle the error appropriately, e.g., show a user-friendly message
  }
}

// ...existing code...
