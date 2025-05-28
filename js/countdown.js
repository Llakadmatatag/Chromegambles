// Import security utilities
const { escapeHtml, safeTextContent } = window.SecurityUtils || {
    escapeHtml: str => str,
    safeTextContent: (el, text) => { if (el) el.textContent = text; }
};

function updateCountdown(timerId, endDate) {
    // Update the countdown every 1 second
    return setInterval(function() {
        // Get current date and time
        const now = new Date().getTime();

        // Find the distance between now and the countdown date
        const distance = endDate - now;

        // Time calculations for days, hours, minutes and seconds
        const days = Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24)));
        const hours = Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const minutes = Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        const seconds = Math.max(0, Math.floor((distance % (1000 * 60)) / 1000));

        // Get the timer element
        const timerElement = document.getElementById(timerId);
        if (!timerElement) return;

        // Update the timer display
        const daysElement = timerElement.querySelector(".days");
        const hoursElement = timerElement.querySelector(".hours");
        const minutesElement = timerElement.querySelector(".minutes");
        const secondsElement = timerElement.querySelector(".seconds");

        if (daysElement) safeTextContent(daysElement, days.toString().padStart(3, '0'));
        if (hoursElement) safeTextContent(hoursElement, hours.toString().padStart(2, '0'));
        if (minutesElement) safeTextContent(minutesElement, minutes.toString().padStart(2, '0'));
        if (secondsElement) safeTextContent(secondsElement, seconds.toString().padStart(2, '0'));

        // If the countdown is finished, display expired message
        if (distance < 0) {
            const timerContainer = timerElement.closest('.countdown-timer');
            if (timerContainer) {
                const endMessage = document.createElement('div');
                endMessage.className = 'timer-label';
                safeTextContent(endMessage, 'COMPETITION HAS ENDED');
                timerContainer.innerHTML = ''; // Clear existing content
                timerContainer.appendChild(endMessage);
            }
            return null;
        }

        
        return true;
    }, 1000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize countdown timers
    const timers = [
        {
            id: 'diceblox-timer',
            endDate: new Date("May 31, 2025 23:59:59 UTC").getTime()
        },
        {
            id: 'betbolt-timer',
            endDate: new Date("June 12, 2025 23:59:59 UTC").getTime()
        }
    ];

    // Start all timers
    timers.forEach(timer => {
        updateCountdown(timer.id, timer.endDate);
    });
});