# ChromeGambles Website

## Overview
This is the official website for ChromeGambles, featuring leaderboards for various gambling platforms including X.FUN, RAIN.GG, DICEBLOX, and HYPE.BET. The site provides information about giveaways, exclusive promotions, and real-time leaderboard rankings.

## Features

- **Leaderboard Display**: Shows player rankings based on their wagering amounts
- **Sponsor Information**: Details about sponsored gambling platforms and referral codes
- **Bonuses & Giveaways**: Information about ongoing bonuses, giveaways, and events
- **Community**: Links to Discord community and live stream

## Project Structure

```
ChromeGambles/
├── assets/
│   └── images/         # Images and icons
├── css/
│   ├── animations.css  # Animations
│   ├── base.css        # Base styles and CSS variables
│   ├── community.css   # Styles for community section
│   ├── content.css     # Styles for content
│   ├── footer.css      # Styles for footer
│   ├── header.css      # Styles for header
│   ├── leaderboard.css # Styles for leaderboard
│   ├── responsive.css  # Responsive styles
│   ├── rewards.css     # Styles for rewards section
│   └── style.css       # Main styles
├── js/
│   ├── navigation.js       # Navigation functionality
│   ├── sanitize.js         # Security utilities
│   └── simple-leaderboard.js # Leaderboard implementation
├── index.html          # Main page
└── README.md           # Project documentation
```

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Font Awesome for icons
- Particles.js for background effects

## How to Run the Project

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/ChromeGambles.git
   ```

2. Open the `index.html` file in your web browser.

Alternatively, you can use a local server like Live Server in VSCode to run the project.

## Development

### CSS Structure

This project uses a modular approach for CSS:

- `base.css`: CSS variables and base styles
- Separate CSS files for each major component
- `responsive.css`: Media queries for responsive design

### Accessibility

This project includes the following accessibility features:

- Skip link for keyboard navigation
- ARIA attributes for interactive elements
- Adequate color contrast for text
- Semantic HTML structure

### Security

Security features implemented:

- Content Security Policy (CSP)
- Input sanitization to prevent XSS
- rel="noopener noreferrer" attributes for external links
- Secure handling of user data

## License

© 2025 ChromeGambles. All rights reserved.

## Credits

Designed by [@Llakadmatatag](https://x.com/Llakadmatatag)