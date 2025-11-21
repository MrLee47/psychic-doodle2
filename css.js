/* -------------------------------------------------------------------------- */
/* BASE STYLES                                 */
/* -------------------------------------------------------------------------- */
* {
    box-sizing: border-box;
    transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

body {
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
    font-size: 16px;
    font-family: 'Inter', sans-serif;
    color: var(--text-color);
    background-color: var(--bg-color);
}

/* --- Utility Class --- */
.hidden {
    display: none !important;
}

/* -------------------------------------------------------------------------- */
/* THEME DEFINITIONS (Reverted to prior colors and scheme) */
/* -------------------------------------------------------------------------- */

/* Default (Fantasy/Cream) Theme */
.default-theme {
    --bg-color: #f7f3e8; /* Cream background */
    --primary-color: #4a2d1e; /* Dark earth tone */
    --text-color: #333;
    --border-color: #8c735d;
    --button-bg: #8c735d; /* Brown/Tan */
    --button-hover-bg: #b1937e;
    --section-bg: #fdfdfd; /* White for sections */
    --status-bar-bg: #e2eaf0; /* Light blue/grey for status bars */
    --accent-color: #d97706; /* Amber/Orange */
    --hp-color: #d13d3d; /* Red */
    --hp-bg: #f5caca; /* Light red for HP bar background */
    --log-win: #10b981; /* Green */
    --log-loss: #ef4444; /* Red */
    --log-special: #3b82f6; /* Blue */
    --log-damage: #f59e0b; /* Amber */
}

/* Retro (Green/Terminal) Theme */
.retro-theme {
    --bg-color: #1a1a1a;
    --primary-color: #38a169; /* Green text/accents */
    --text-color: #f0fff4;
    --border-color: #38a169;
    --button-bg: #38a169;
    --button-hover-bg: #48bb78;
    --section-bg: #2d3748; /* Dark grey for sections */
    --status-bar-bg: #1a202c;
    --accent-color: #38a169;
    --hp-color: #e53e3e;
    --hp-bg: #7f1d1d; /* Darker red for retro HP bar background */
    --log-win: #38a169;
    --log-loss: #e53e3e;
    --log-special: #3182ce;
    --log-damage: #f6ad55;
}


/* -------------------------------------------------------------------------- */
/* CONTAINERS & LAYOUT                         */
/* -------------------------------------------------------------------------- */

#game-container {
    height: 90vh;
    border-radius: 1rem;
    overflow: hidden; /* Important for scrollable content */
}

/* Status Bars */
.status-box {
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    background-color: var(--status-bar-bg); /* Use theme variable */
}

.stats-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 10px;
    align-items: center;
}

.stats-grid-rtl {
    grid-template-columns: 1fr auto;
    text-align: right;
}

.stat-label {
    font-weight: 600;
    font-size: 0.85em;
    color: var(--primary-color);
}

.hp-mp-container {
    height: 18px;
    /* Use var(--hp-bg) for background color, set inline in HTML */
    border-radius: 9px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}

.hp-bar {
    height: 100%;
    background-color: var(--hp-color);
    transition: width 0.5s ease-out;
}

.enemy-hp-bar {
    /* If necessary, align the bar to the right */
}

.hp-mp-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.75em;
    font-weight: bold;
    color: white; /* White text over HP bar */
    text-shadow: 0 0 2px black;
}

/* Combat Log */
#combat-log-container {
    /* flex-grow handles the height */
    min-height: 150px;
    max-height: 300px;
    background-color: var(--section-bg);
}

.log-entry {
    font-family: monospace;
    line-height: 1.3;
    margin: 0;
}

.log-special { color: var(--log-special); font-weight: bold; }
.log-win { color: var(--log-win); font-weight: bold; }
.log-loss { color: var(--log-loss); font-weight: bold; }
.log-damage { color: var(--log-damage); font-weight: bold; }
.log-default { color: var(--text-color); }

/* -------------------------------------------------------------------------- */
/* BUTTONS                                     */
/* -------------------------------------------------------------------------- */

.menu-btn, .combat-btn, .standard-btn {
    width: 100%;
    padding: 12px 20px;
    border-radius: 8px;
    border: none;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
}

.menu-btn:hover, .combat-btn:hover, .standard-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0,0,0,0.15);
}

.menu-btn:disabled, .combat-btn:disabled, .standard-btn:disabled {
    background-color: #ccc !important;
    color: #888;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

/* Specific Menu/Standard Button Colors */
.menu-btn {
    color: white;
}

.standard-btn {
    padding: 8px 15px;
    width: auto;
    color: white;
}

/* Combat Buttons */
.combat-btn {
    padding: 8px 10px;
    font-size: 0.9em;
    background-color: var(--primary-color);
    color: white;
}

.combo-ready {
    background-color: var(--hp-color) !important;
    animation: pulse-red 1s infinite;
}

.active-weapon-btn {
    background-color: var(--log-special) !important;
}

@keyframes pulse-red {
    0% { box-shadow: 0 0 0 0 rgba(209, 61, 61, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(209, 61, 61, 0); }
    100% { box-shadow: 0 0 0 0 rgba(209, 61, 61, 0); }
}

/* -------------------------------------------------------------------------- */
/* CHARACTER SELECTION                         */
/* -------------------------------------------------------------------------- */

.char-card {
    background-color: var(--status-bar-bg);
    padding: 15px;
    border-radius: 8px;
    border: 2px solid var(--border-color);
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.char-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.char-stats span {
    display: inline-block;
    background-color: var(--primary-color);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: bold;
    margin-right: 5px;
    margin-bottom: 5px;
}

.char-card.selected {
    border: 3px solid var(--hp-color);
    transform: scale(1.05);
}

/* -------------------------------------------------------------------------- */
/* SETTINGS PANEL                                */
/* -------------------------------------------------------------------------- */

.settings-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    background-color: var(--section-bg);
    border-left: 2px solid var(--border-color);
    padding: 20px;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    box-shadow: -5px 0 15px rgba(0,0,0,0.1);
}

.settings-panel.open {
    transform: translateX(0);
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5em;
    color: var(--text-color);
    padding: 0;
    cursor: pointer;
    box-shadow: none;
    transition: color 0.2s;
}

.close-btn:hover {
    color: var(--hp-color);
}

.theme-selector h3 {
    margin-top: 20px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 5px;
    font-weight: bold;
    color: var(--primary-color);
}

.theme-selector button {
    display: block;
    width: 100%;
    margin: 5px 0;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background-color: var(--button-bg);
    color: white;
    font-weight: 500;
    cursor: pointer;
}

.theme-selector button:hover {
    background-color: var(--button-hover-bg);
}

.default-theme-btn {
    /* Style for the default theme button */
}

.retro-theme-btn {
    /* Style for the retro theme button */
}

/* Media Queries for Responsiveness */
@media (max-width: 768px) {
    #game-container {
        max-width: 100%;
        max-height: 100vh;
        padding: 10px;
    }

    .status-box {
        padding: 8px;
    }

    .stats-grid, .stats-grid-rtl {
        gap: 2px 5px;
        font-size: 0.9em;
    }
    
    .stats-grid-rtl {
        grid-template-columns: 1fr auto;
    }
    
    .menu-btn {
        padding: 10px 15px;
    }
    
    .combat-btn {
        padding: 6px;
        font-size: 0.8em;
    }
    
    .settings-panel {
        width: 100%;
        box-shadow: none;
    }
}
