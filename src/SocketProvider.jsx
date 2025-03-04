import { init } from './Telegram';

function start() {
  try {
    init();
    // ...existing code...
  } catch (error) {
    console.error(error);
  }
}
