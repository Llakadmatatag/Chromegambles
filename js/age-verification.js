/**
 * Age Verification Script for ChromeGambles
 * Ensures users are at least 18 years old
 */

// Create age verification modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already verified age
    if (!localStorage.getItem('ageVerified')) {
        createAgeVerificationModal();
    }
});

/**
 * Creates and displays the age verification modal
 */
function createAgeVerificationModal() {
    // Create modal element
    const modal = document.createElement('div');
    modal.id = 'age-verification-modal';
    modal.className = 'age-verification-modal';

    // Set modal content
    modal.innerHTML = `
        <div class="age-verification-content">
            <div class="age-verification-header">
                <img src="assets/images-optimized/favicon.png" alt="ChromeGambles Logo">
                <h2><span class="chrome">CHROME</span><span class="gambles">GAMBLES</span></h2>
            </div>
            <div class="age-verification-body">
                <h3>Age Verification Required</h3>
                <p>This website contains content related to gambling and is only suitable for individuals who are at least 18 years of age or of legal gambling age in their jurisdiction, whichever is greater.</p>
                <p>By entering this site, you confirm that:</p>
                <ul>
                    <li>You are at least 18 years old or of legal gambling age in your jurisdiction</li>
                    <li>Gambling is legal in your jurisdiction</li>
                    <li>You agree to our <a href="terms.html" target="_blank">Terms of Service</a> and <a href="privacy-policy.html" target="_blank">Privacy Policy</a></li>
                </ul>
                <div class="age-verification-form">
                    <div class="age-verification-dob">
                        <label for="age-day">Date of Birth:</label>
                        <div class="dob-inputs">
                            <select id="age-day" required>
                                <option value="" disabled selected>Day</option>
                                ${generateDayOptions()}
                            </select>
                            <select id="age-month" required>
                                <option value="" disabled selected>Month</option>
                                ${generateMonthOptions()}
                            </select>
                            <select id="age-year" required>
                                <option value="" disabled selected>Year</option>
                                ${generateYearOptions()}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="age-verification-buttons">
                    <button id="age-verification-exit" class="age-btn exit-btn">Exit Site</button>
                    <button id="age-verification-enter" class="age-btn enter-btn" disabled>Enter Site</button>
                </div>
                <div class="age-verification-disclaimer">
                    <p>Please gamble responsibly. Gambling can be addictive. If you feel you may have a problem, please seek help from organizations like <a href="https://www.gambleaware.org" target="_blank" rel="noopener noreferrer">GambleAware</a>.</p>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .age-verification-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .age-verification-content {
            background-color: #121212;
            width: 90%;
            max-width: 600px;
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(0, 168, 107, 0.3);
            overflow: hidden;
            position: relative;
            max-height: 90vh; /* Limit height on small screens */
            display: flex;
            flex-direction: column;
        }

        .age-verification-header {
            background: linear-gradient(135deg, #121212, #1a1a1a);
            padding: 1.5rem;
            text-align: center;
            border-bottom: 2px solid var(--primary-color);
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
        }

        .age-verification-header img {
            width: 40px;
            height: 40px;
        }

        .age-verification-header h2 {
            margin: 0;
            font-size: 1.8rem;
        }

        .chrome {
            color: white;
        }

        .gambles {
            color: var(--primary-color);
        }

        .age-verification-body {
            padding: 2rem;
            color: white;
            overflow-y: auto; /* Enable scrolling if content is too long */
            flex: 1; /* Take remaining space */
        }

        .age-verification-body h3 {
            margin: 0 0 1rem;
            color: var(--primary-color);
            text-align: center;
            font-size: 1.5rem;
        }

        .age-verification-body p {
            margin-bottom: 1rem;
            line-height: 1.5;
        }

        .age-verification-body ul {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }

        .age-verification-body li {
            margin-bottom: 0.5rem;
        }

        .age-verification-body a {
            color: var(--primary-color);
            text-decoration: underline;
        }

        .age-verification-body a:hover {
            text-decoration: none;
        }

        .age-verification-form {
            margin: 1.5rem 0;
            padding: 1.5rem;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }

        .age-verification-dob {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .age-verification-dob label {
            font-weight: 600;
            color: var(--primary-color);
        }

        .dob-inputs {
            display: flex;
            gap: 0.5rem;
        }

        .dob-inputs select {
            flex: 1;
            padding: 0.8rem;
            border: 1px solid #333;
            background-color: #1a1a1a;
            color: white;
            border-radius: 4px;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ffffff' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: calc(100% - 10px) center;
            padding-right: 30px;
        }

        .dob-inputs select:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .age-verification-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .age-btn {
            flex: 1;
            padding: 1rem;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
            text-align: center;
            display: inline-block;
            min-height: 48px; /* Minimum touch target size */
            -webkit-tap-highlight-color: rgba(0,0,0,0); /* Remove tap highlight on mobile */
            -webkit-appearance: none; /* Fix for iOS */
            appearance: none;
        }

        .exit-btn {
            background-color: transparent;
            border: 1px solid #ff3b30;
            color: #ff3b30;
        }

        .exit-btn:hover, .exit-btn:active {
            background-color: rgba(255, 59, 48, 0.1);
        }

        .enter-btn {
            background-color: var(--primary-color);
            color: white;
            box-shadow: 0 2px 4px rgba(0, 168, 107, 0.2);
        }

        .enter-btn:hover:not(:disabled), .enter-btn:active:not(:disabled) {
            background-color: #008f5b;
            box-shadow: 0 4px 8px rgba(0, 168, 107, 0.3);
        }

        .enter-btn:disabled {
            background-color: #333;
            cursor: not-allowed;
            opacity: 0.7;
            box-shadow: none;
        }

        .age-verification-disclaimer {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.85rem;
            opacity: 0.8;
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        @media (max-width: 576px) {
            .age-verification-content {
                width: 95%;
                max-height: 90vh;
                overflow-y: auto;
            }

            .age-verification-body {
                padding: 1.5rem;
            }

            .age-verification-body h3 {
                font-size: 1.3rem;
            }

            .age-verification-body p,
            .age-verification-body li {
                font-size: 0.9rem;
            }

            .dob-inputs {
                flex-direction: column;
            }

            .dob-inputs select {
                width: 100%;
                margin-bottom: 0.5rem;
            }

            .age-verification-buttons {
                flex-direction: column;
                gap: 0.8rem;
                margin-top: 1rem;
            }

            .age-btn {
                width: 100%;
                padding: 0.8rem;
                font-size: 1rem;
                display: block;
                margin-bottom: 0.5rem;
                min-height: 50px; /* Larger touch target for mobile */
            }

            /* Make the enter button more prominent on mobile */
            .enter-btn {
                background-color: var(--primary-color);
                color: white;
                font-weight: 700;
                box-shadow: 0 2px 8px rgba(0, 168, 107, 0.4);
            }

            .age-verification-form {
                padding: 1rem;
                margin: 1rem 0;
            }
        }

        @media (max-width: 375px) {
            .age-verification-header h2 {
                font-size: 1.5rem;
            }

            .age-verification-header img {
                width: 30px;
                height: 30px;
            }
        }
    `;

    // Append style and modal to document
    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Add event listeners with better mobile support
    const exitButton = document.getElementById('age-verification-exit');

    // Add both click and touchend events for better mobile support
    exitButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'https://www.google.com';
    });

    exitButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        window.location.href = 'https://www.google.com';
    });

    // Enable/disable enter button based on age selection
    const daySelect = document.getElementById('age-day');
    const monthSelect = document.getElementById('age-month');
    const yearSelect = document.getElementById('age-year');
    const enterButton = document.getElementById('age-verification-enter');

    function checkAge() {
        if (daySelect.value && monthSelect.value && yearSelect.value) {
            const birthDate = new Date(yearSelect.value, monthSelect.value - 1, daySelect.value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            enterButton.disabled = age < 18;
        }
    }

    daySelect.addEventListener('change', checkAge);
    monthSelect.addEventListener('change', checkAge);
    yearSelect.addEventListener('change', checkAge);

    // Add both click and touchend events for better mobile support
    enterButton.addEventListener('click', function(e) {
        e.preventDefault();
        verifyAge();
    });

    enterButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        verifyAge();
    });
}

/**
 * Generates options for day select
 * @returns {string} HTML options
 */
function generateDayOptions() {
    let options = '';
    for (let i = 1; i <= 31; i++) {
        options += `<option value="${i}">${i}</option>`;
    }
    return options;
}

/**
 * Generates options for month select
 * @returns {string} HTML options
 */
function generateMonthOptions() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    let options = '';
    for (let i = 0; i < months.length; i++) {
        options += `<option value="${i + 1}">${months[i]}</option>`;
    }
    return options;
}

/**
 * Generates options for year select
 * @returns {string} HTML options
 */
function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    let options = '';
    for (let i = currentYear - 100; i <= currentYear; i++) {
        options += `<option value="${i}">${i}</option>`;
    }
    return options;
}

/**
 * Verifies user's age and stores in localStorage
 */
function verifyAge() {
    const day = document.getElementById('age-day').value;
    const month = document.getElementById('age-month').value;
    const year = document.getElementById('age-year').value;

    if (day && month && year) {
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age >= 18) {
            localStorage.setItem('ageVerified', 'true');
            localStorage.setItem('ageVerifiedDate', new Date().toISOString());
            hideModal();
        }
    }
}

/**
 * Hides the age verification modal
 */
function hideModal() {
    const modal = document.getElementById('age-verification-modal');

    // Add the fadeOut animation
    modal.style.animation = 'fadeOut 0.5s ease forwards';

    // Remove the modal after animation completes
    setTimeout(function() {
        if (modal && modal.parentNode) {
            modal.remove();
        }
    }, 500);

    // Log verification success
    console.log('Age verification successful');
}

// Export functions for external use
window.AgeVerification = {
    showModal: createAgeVerificationModal,
    isVerified: function() {
        return localStorage.getItem('ageVerified') === 'true';
    }
};
