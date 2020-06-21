export function Notify () {
    const audio = new Audio(require('../assets/event_notification.mp3'))
    audio.play();
}