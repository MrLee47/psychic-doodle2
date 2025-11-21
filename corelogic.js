/* -------------------------------------------------------
   Chronicles of Heroes: Modular Game & Combat Core
   -------------------------------------------------------
   Features:
   - Theme Switching
   - Character Selection
   - Coin & Dice Clash Combat
   - Modular, reusable functions for abilities, clash, and damage
------------------------------------------------------- */

// ----------------- GLOBAL STATE -----------------
const gameState = {
    isGameStarted: false,
    currentView: 'menu',
    player: null,
    enemy: null,
    currentTheme: 'default',
    turn: 1,
    playerAction: null,
    enemyAction: null,
};

// ----------------- DOM REFS -----------------
const $ = (id) => document.getElementById(id);
const body = document.body;
const menuScreen = $('menu-screen');
const gameContainer = $('game-container');
const charSelectScreen = $('character-select-screen');

const newGameBtn = $('new-game-btn');
const loadGameBtn = $('load-game-btn'); // RE-ADDED: For the reverted menu
const openSettingsBtn = $('open-settings-menu-btn');
const settingsPanel = $('settings-panel');
const closeSettingsBtn = $('close-settings-btn');
const themeOptionBtns = document.querySelectorAll('.theme-option-btn');

const dialogueText = $('dialogue-text');
const actionButtonsDiv = $('action-buttons');
const combatLog = $('combat-log');
const passTurnBtn = $('pass-turn-btn');

const playerStatus = {
    name: $('player-name'),
    hpBar: $('player-hp-bar'),
    hpText: $('player-hp-text'),
    statusText: $('player-status-text'),
    defenseText: $('player-defense-text'),
    passiveText: $('player-passive-text'),
};

const enemyStatus = {
    name: $('enemy-name'),
    hpBar: $('enemy-hp-bar'),
    hpText: $('enemy-hp-text'),
    statusText: $('enemy-status-text'),
    defenseText: $('enemy-defense-text'),
    passiveText: $('enemy-passive-text'),
};

const charListDiv = $('char-list');
const startCombatBtn = $('start-combat-btn');
const backToMenuBtn = $('back-to-menu-btn');
const backToMenuAfterCombatBtn = $('back-to-menu-after-combat-btn');
const turnIndicator = $('turn-indicator');


// ----------------- GAME UTILITIES -----------------

/**
 * Sets the current screen view.
 * @param {('menu'|'select'|'combat')} view 
 */
function setView(view) {
    gameState.currentView = view;
    // Hide all main sections
    menuScreen.classList.add('hidden');
    charSelectScreen.classList.add('hidden');
    $('combat-screen').classList.add('hidden');

    // Show the requested section
    if (view === 'menu') {
        menuScreen.classList.remove('hidden');
    } else if (view === 'select') {
        charSelectScreen.classList.remove('hidden');
        renderCharacterSelection();
    } else if (view === 'combat') {
        $('combat-screen').classList.remove('hidden');
        startGame();
    }
}

/**
 * Applies the selected theme to the body.
 * @param {string} themeName 
 */
function applyTheme(themeName) {
    // Remove all theme classes
    body.classList.remove('default-theme', 'retro-theme');
    
    // Add the selected theme class
    body.classList.add(`${themeName}-theme`);
    
    gameState.currentTheme = themeName;
    localStorage.setItem('gameTheme', themeName);
}

/**
 * Toggles the visibility of the settings panel.
 */
function toggleSettingsPanel() {
    settingsPanel.classList.toggle('open');
}

/**
 * Logs a message to the combat log with a specific styling class.
 * @param {string} message 
 * @param {string} className 
 */
function log(message, className = 'log-default') {
    const entry = document.createElement('p');
    entry.textContent = message;
    entry.classList.add(className, 'log-entry');
    combatLog.appendChild(entry);
    // Scroll to the bottom
    combatLog.scrollTop = combatLog.scrollHeight;
}

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
const rollDice = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


// ----------------- CHARACTER & SELECTION -----------------

import { Characters } from './characters.js';

let selectedPlayer = null;
let selectedEnemy = null;

/**
 * Creates and displays character selection cards.
 */
function renderCharacterSelection() {
    charListDiv.innerHTML = '';
    
    Characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'char-card';
        card.dataset.id = char.id;
        card.innerHTML = `
            <h3 class="font-bold text-xl mb-2">${char.name}</h3>
            <p class="text-sm italic mb-2" style="color: var(--accent-color);">${char.uniquePassive.name}</p>
            <p class="text-xs mb-4">${char.description}</p>
            <div class="char-stats">
                <span>HP: ${char.baseStats.maxHP}</span>
                <span>DEF: ${char.baseStats.defense}</span>
            </div>
            <p class="text-xs mt-2">${char.uniquePassive.effect}</p>
        `;

        card.addEventListener('click', () => {
            // Deselect previous
            document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
            
            // Toggle selection logic
            if (selectedPlayer && selectedPlayer.id === char.id) {
                // If clicking the current player, deselect it
                selectedPlayer = null;
            } else {
                // Select new player
                card.classList.add('selected');
                // Deep copy the character object for independent state management
                selectedPlayer = JSON.parse(JSON.stringify(char));
            }

            // Simple Enemy Selection: Pick a random, different enemy
            selectedEnemy = null;
            if (selectedPlayer) {
                const availableEnemies = Characters.filter(c => c.id !== selectedPlayer.id);
                const randomIndex = rollDice(0, availableEnemies.length - 1);
                // Deep copy the enemy object
                selectedEnemy = JSON.parse(JSON.stringify(availableEnemies[randomIndex]));
                
                // Ensure enemy has currentHP property
                selectedEnemy.baseStats.currentHP = selectedEnemy.baseStats.maxHP;
            }

            // Update Start Combat button state
            startCombatBtn.disabled = !selectedPlayer;
            startCombatBtn.textContent = selectedPlayer 
                ? `Fight ${selectedEnemy.name}!` 
                : 'Select Hero';
        });

        charListDiv.appendChild(card);
    });
}

/**
 * Sets up the game state and combat screen.
 */
function startGame() {
    if (!selectedPlayer || !selectedEnemy) {
        log('Error: Player or Enemy not selected.', 'log-loss');
        setView('menu');
        return;
    }

    gameState.isGameStarted = true;
    gameState.turn = 1;
    gameState.playerAction = null;
    gameState.enemyAction = null;
    
    // Ensure both characters have currentHP set
    selectedPlayer.baseStats.currentHP = selectedPlayer.baseStats.maxHP;
    
    // Reset unique state properties for a fresh run if needed
    if (selectedPlayer.baseStats.consecutive_rounds !== undefined) selectedPlayer.baseStats.consecutive_rounds = 0;
    if (selectedPlayer.baseStats.isGrappling !== undefined) selectedPlayer.baseStats.isGrappling = false;
    // Enemy state
    if (selectedEnemy.baseStats.consecutive_rounds !== undefined) selectedEnemy.baseStats.consecutive_rounds = 0;
    if (selectedEnemy.baseStats.isGrappling !== undefined) selectedEnemy.baseStats.isGrappling = false;
    
    // Attach to global state
    gameState.player = selectedPlayer;
    gameState.enemy = selectedEnemy;
    
    // Initialize status display and log
    updateStatusDisplay(gameState.player, playerStatus);
    updateStatusDisplay(gameState.enemy, enemyStatus);
    
    combatLog.innerHTML = '';
    backToMenuAfterCombatBtn.classList.add('hidden');
    log('--- COMBAT START ---', 'log-special');
    log(`${gameState.player.name} enters combat with ${gameState.enemy.name}!`, 'log-default');
    
    startRound();
}


// ----------------- COMBAT CORE -----------------

/**
 * Updates the visual status bar for a character.
 * @param {Object} character 
 * @param {Object} statusDom 
 */
function updateStatusDisplay(character, statusDom) {
    if (!character) return;

    statusDom.name.textContent = character.name;
    statusDom.defenseText.textContent = character.baseStats.defense;
    statusDom.passiveText.textContent = character.uniquePassive.effect;

    const currentHP = character.baseStats.currentHP;
    const maxHP = character.baseStats.maxHP;
    const percent = (currentHP / maxHP) * 100;
    
    statusDom.hpBar.style.width = `${percent}%`;
    statusDom.hpText.textContent = `${currentHP}/${maxHP}`;
}

/**
 * Starts a new combat round.
 */
function startRound() {
    if (!gameState.isGameStarted) return;
    
    // Check for game over condition
    if (gameState.player.baseStats.currentHP <= 0) {
        endGame(gameState.enemy.name);
        return;
    }
    if (gameState.enemy.baseStats.currentHP <= 0) {
        endGame(gameState.player.name);
        return;
    }
    
    // Reset actions for the new turn
    gameState.playerAction = null;
    gameState.enemyAction = null;

    // Update round counter and display
    turnIndicator.textContent = `Round ${gameState.turn}`;
    dialogueText.textContent = `Choose your next action, ${gameState.player.name}.`;
    
    // Handle passive effects that trigger at the start of a round
    handleTurnStartPassives(gameState.player);
    
    // Enable/Render action buttons
    renderActionButtons();
    actionButtonsDiv.classList.remove('hidden');
    passTurnBtn.classList.remove('hidden');
}

/**
 * Ends the game and displays the winner.
 * @param {string} winnerName 
 */
function endGame(winnerName) {
    gameState.isGameStarted = false;
    log(`--- GAME OVER ---`, 'log-special');
    if (winnerName === gameState.player.name) {
        log(`${winnerName} is victorious!`, 'log-win');
    } else {
        log(`${winnerName} has defeated you.`, 'log-loss');
    }
    
    dialogueText.textContent = `The battle is over. ${winnerName} won in Round ${gameState.turn}.`;
    actionButtonsDiv.innerHTML = ''; // Clear action buttons
    actionButtonsDiv.classList.add('hidden');
    passTurnBtn.classList.add('hidden');
    backToMenuAfterCombatBtn.classList.remove('hidden');
}


/**
 * Handles passive effects that occur at the start of a turn.
 * @param {Object} character 
 */
function handleTurnStartPassives(character) {
    const passive = character.uniquePassive;
    
    // 1. Striker's Slow Start: Track consecutive rounds (must be incremented regardless of action type)
    if (character.id === 'striker' && passive.type === 'CoinScaler') {
        character.baseStats.consecutive_rounds = (character.baseStats.consecutive_rounds || 0) + 1;
        log(`${character.name}'s Slow Start: Coin bonus increases to +${character.baseStats.consecutive_rounds}!`);
    }
}

/**
 * The core battle resolution function.
 */
function resolveCombat() {
    if (!gameState.playerAction || !gameState.enemyAction) {
        // Should not happen if everything is properly guarded
        log('Error: Actions missing in resolveCombat', 'log-loss');
        return;
    }

    log(`--- Round ${gameState.turn} Clash ---`, 'log-special');
    
    // Player vs Enemy Clash
    const playerClash = calculateClashValue(gameState.player, gameState.playerAction, gameState.enemy);
    const enemyClash = calculateClashValue(gameState.enemy, gameState.enemyAction, gameState.player);
    
    log(`${gameState.player.name} Clash Value: ${playerClash}`, 'log-default');
    log(`${gameState.enemy.name} Clash Value: ${enemyClash}`, 'log-default');

    if (playerClash > enemyClash) {
        // Player wins clash
        executeAbilityEffect(gameState.player, gameState.playerAction, gameState.enemy);
        // Execute opponent's ability if it's defensive or utility
        executeUtilityEffect(gameState.enemy, gameState.enemyAction, gameState.player);

    } else if (enemyClash > playerClash) {
        // Enemy wins clash
        executeAbilityEffect(gameState.enemy, gameState.enemyAction, gameState.player);
        // Execute opponent's ability if it's defensive or utility
        executeUtilityEffect(gameState.player, gameState.playerAction, gameState.enemy);

    } else {
        // Tie
        log('Clash Tie! No damage dealt.', 'log-default');
        // Still execute utility actions
        executeUtilityEffect(gameState.player, gameState.playerAction, gameState.enemy);
        executeUtilityEffect(gameState.enemy, gameState.enemyAction, gameState.player);
    }
    
    // Update HP displays
    updateStatusDisplay(gameState.player, playerStatus);
    updateStatusDisplay(gameState.enemy, enemyStatus);

    // Advance to next round or end game
    if (gameState.player.baseStats.currentHP > 0 && gameState.enemy.baseStats.currentHP > 0) {
        gameState.turn++;
        setTimeout(startRound, 2000); // Wait 2 seconds before next round
    } else {
        endGame(gameState.player.baseStats.currentHP > 0 ? gameState.player.name : gameState.enemy.name);
    }
}

/**
 * Calculates the total Clash Value for an action.
 * @param {Object} character 
 * @param {Object} ability 
 * @param {Object} target 
 * @returns {number}
 */
function calculateClashValue(character, ability, target) {
    if (ability.type === 'DEFENSE' || ability.type === 'SWITCH') {
        // Defense/Switch actions don't clash, but if they must, they just rely on the roll
        return rollDice(1, 100); // Ensure they get a value but not one based on coins/dice
    }

    const baseRoll = 5;
    const diceRoll = ability.dice > 0 ? rollDice(1, ability.dice) : 0;
    let coinBonus = ability.coins || 0;
    
    // 1. Apply Passive: Striker (Coin Scaler)
    if (character.id === 'striker' && character.uniquePassive.type === 'CoinScaler') {
        coinBonus += character.baseStats.consecutive_rounds;
    }
    
    // 2. Apply Passive: Zectus (ConditionalCoin)
    if (character.id === 'zectus' && character.uniquePassive.type === 'ConditionalCoin') {
        if (target.baseStats.gender === character.uniquePassive.condition.target_gender) {
            coinBonus += character.uniquePassive.coinBonus;
            log(`${character.name} activates ${character.uniquePassive.name}! (+${character.uniquePassive.coinBonus} Coins)`, 'log-special');
        }
    }
    
    // 3. Apply Grapple Debuff
    if (target.baseStats.isGrappling) {
        coinBonus = Math.max(0, coinBonus - 2); // Apply debuff
        log(`${character.name} is Grappled! -2 Coins.`, 'log-loss');
    }
    
    // Calculate coin flip results
    let coinFlipTotal = 0;
    for (let i = 0; i < coinBonus; i++) {
        coinFlipTotal += rollDice(0, 1); // 0 or 1
    }
    
    log(`${character.name} rolls d${ability.dice} (${diceRoll}) and flips ${coinBonus} coins (${coinFlipTotal} wins).`, 'log-default');

    return baseRoll + diceRoll + coinFlipTotal;
}

/**
 * Executes the offensive/damage part of an ability.
 * @param {Object} attacker 
 * @param {Object} ability 
 * @param {Object} target 
 */
function executeAbilityEffect(attacker, ability, target) {
    if (ability.type === 'ATTACK') {
        const coinBonus = ability.coins || 0;
        let dmg = Math.max(0, (ability.baseAttack || 0) + coinBonus - target.baseStats.defense);
        
        // Handle NegateNextHit defense effect (e.g., from Brace/Phase)
        if (target.baseStats.effects && target.baseStats.effects.includes('NegateNextHit')) {
            log(`${target.name} Phases/Braces! The attack is negated.`, 'log-win');
            dmg = 0;
            // Remove the effect
            target.baseStats.effects = target.baseStats.effects.filter(e => e !== 'NegateNextHit');
        }
        
        target.baseStats.currentHP = Math.max(0, target.baseStats.currentHP - dmg);
        log(`${attacker.name}'s ${ability.name} hits for ${dmg} (${ability.damageType})`, 'log-damage');

        // Shutenmaru Passive: Track damage taken by target
        if (target.id === 'shutenmaru') target.baseStats.lastDamageTaken = dmg;
        
        // Juggernaut's Piledriver: Release grapple
        if (ability.name === 'Piledriver') {
            target.baseStats.isGrappling = false; 
            log(`${target.name} released from Grapple`, 'log-special');
        }

        // Shutenmaru's RollTrigger heal (This logic is usually better placed after clash, but since we don't track the *clash* dice roll, we use the ability's dice roll for simplicity here)
        // If we assume a d6 for the passive trigger (Shutenmaru's primary attack uses a d6), we can re-roll a d6 here for a chance.
        
        if (attacker.id === 'shutenmaru' && attacker.uniquePassive.type === 'RollTrigger') {
            const diceRoll = rollDice(1, 6); // Re-roll a d6 specifically for the passive check
            if (diceRoll === attacker.uniquePassive.triggerValue) {
                let heal = target.baseStats.lastDamageTaken;
                attacker.baseStats.currentHP = Math.min(attacker.baseStats.maxHP, attacker.baseStats.currentHP + heal);
                log(`Chrono-Fist (d6:${diceRoll}) heals ${heal} HP!`, 'log-win');
            }
        }
        
    } else if (ability.type === 'CONTROL' && ability.name === 'Grapple') {
        // Grapple is a successful hit, now apply the effect
        target.baseStats.isGrappling = true;
        log(`${target.name} is Grappled! Coin Clash value reduced.`, 'log-special');
        
    } else if (ability.type === 'SWITCH' && ability.name === 'Cycle') {
        // Zectus's Cycle: Deals 2 damage on activation (regardless of clash win)
        let dmg = ability.baseAttack || 0;
        target.baseStats.currentHP = Math.max(0, target.baseStats.currentHP - dmg);
        log(`${attacker.name}'s Cycle deals ${dmg} activation damage.`, 'log-damage');
        
        // Switch the weapon state
        const weapons = ['Scythe', 'Trident', 'Hammer'];
        const currentState = attacker.baseStats.weaponState;
        const nextIndex = (weapons.indexOf(currentState) + 1) % weapons.length;
        attacker.baseStats.weaponState = weapons[nextIndex];
        log(`${attacker.name} cycles to Tri-Sword: ${attacker.baseStats.weaponState}`, 'log-special');
        
        // Re-render buttons to show the new main attack
        renderActionButtons();
    }
}

/**
 * Executes defensive or utility ability effects regardless of clash win.
 * Only runs if the ability type is DEFENSE or a UTILITY that resolves outside of the main clash logic.
 * @param {Object} character 
 * @param {Object} ability 
 * @param {Object} target 
 */
function executeUtilityEffect(character, ability, target) {
    if (ability.type === 'DEFENSE') {
        // Brace/Phase: Add the effect flag
        character.baseStats.effects = character.baseStats.effects || [];
        if (!character.baseStats.effects.includes('NegateNextHit')) {
            character.baseStats.effects.push('NegateNextHit');
            log(`${character.name} is preparing to Negate the next hit.`, 'log-win');
        }
    }
}

/**
 * Enemy AI selects a random action.
 * @param {Object} enemy 
 * @returns {Object} The chosen ability
 */
function enemyAiAction(enemy) {
    const availableAbilities = enemy.abilities.filter(ab => !ab.isHidden);
    
    // Juggernaut AI: Prioritize Piledriver if enemy is grappled
    if (enemy.id === 'juggernaut' && gameState.player.baseStats.isGrappling) {
        const piledriver = availableAbilities.find(ab => ab.name === 'Piledriver');
        if (piledriver) return piledriver;
    }

    // Default: Choose a random available ability
    const randomIndex = rollDice(0, availableAbilities.length - 1);
    return availableAbilities[randomIndex];
}

/**
 * Executes a chosen ability (triggered by button click).
 * @param {Object} ability 
 */
function executeAbility(ability) {
    if (gameState.playerAction !== null || gameState.player.baseStats.currentHP <= 0 || gameState.enemy.baseStats.currentHP <= 0) {
        return; // Prevent multiple actions or actions when dead
    }

    gameState.playerAction = ability;
    log(`${gameState.player.name} chooses ${ability.name}.`, 'log-default');
    
    // Enemy chooses action
    gameState.enemyAction = enemyAiAction(gameState.enemy);
    log(`${gameState.enemy.name} chooses ${gameState.enemyAction.name}.`, 'log-default');

    dialogueText.textContent = `${gameState.player.name} chose ${ability.name}. Waiting for resolution...`;
    
    // Disable buttons until resolution
    document.querySelectorAll('.combat-btn').forEach(btn => btn.disabled = true);
    passTurnBtn.disabled = true;

    // Resolve combat after a small delay to read the log
    setTimeout(resolveCombat, 1000);
}

/**
 * Renders the combat action buttons for the player.
 */
function renderActionButtons() {
    actionButtonsDiv.innerHTML = '';
    const abilities = gameState.player.abilities;
    
    // Check grapple status for conditional abilities like Piledriver
    const isEnemyGrappled = gameState.enemy.baseStats.isGrappling || false;
    // Get current weapon state for Zectus
    const currentWeapon = gameState.player.baseStats.weaponState;

    abilities.forEach(ability => {
        // Skip hidden abilities unless they are the currently active weapon for Zectus
        if (ability.isHidden && !(ability.isZectusMainAttack && ability.weaponState === currentWeapon)) {
            return;
        }

        const btn = document.createElement('button');
        btn.classList.add('combat-btn');
        let displayName = ability.name;

        // Custom logic for Piledriver (Juggernaut)
        if (ability.name === 'Piledriver') {
            // Disable if enemy is not grappled, or if action is already chosen
            btn.disabled = !isEnemyGrappled || gameState.playerAction !== null;
            if (isEnemyGrappled) {
                btn.classList.add('combo-ready');
            } else {
                btn.classList.remove('combo-ready');
            }
        }
        
        // Custom logic for Zectus's Tri-Sword attacks
        if (gameState.player.id === 'zectus' && ability.isZectusMainAttack) {
            // Only show the active weapon's button
            if (ability.weaponState === currentWeapon) {
                displayName = `Tri-Sword: ${currentWeapon}`;
                btn.classList.add('active-weapon-btn'); 
            } else {
                return; // Hide inactive weapon attacks
            }
        }
        
        // Disable all buttons if action already chosen
        if (gameState.playerAction !== null) {
            btn.disabled = true;
        }

        btn.textContent = displayName;
        btn.onclick = () => executeAbility(ability);
        actionButtonsDiv.appendChild(btn);
    });
}


// --- INITIALIZATION ---

function init() {
    // Since themes were disabled, enforce default theme
    applyTheme(localStorage.getItem('gameTheme') || 'default'); 

    setView('menu'); 

    newGameBtn.addEventListener('click', () => setView('select'));
    backToMenuBtn.addEventListener('click', () => setView('menu'));
    startCombatBtn.addEventListener('click', () => setView('combat'));
    backToMenuAfterCombatBtn.addEventListener('click', () => setView('menu'));
    
    // Load Game button logic (placeholder, since we don't have persistence yet)
    loadGameBtn.addEventListener('click', () => log('Load Game clicked. Persistence is not yet implemented.', 'log-loss'));


    openSettingsBtn.addEventListener('click', toggleSettingsPanel);
    closeSettingsBtn.addEventListener('click', toggleSettingsPanel);
    
    // Theme selection logic (currently disabled for simplicity)
    themeOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });
    
    // Pass Turn button logic (for starting the combat resolution)
    passTurnBtn.addEventListener('click', () => {
        // Only allow if an action has been chosen (e.g., a SWITCH or DEFENSE)
        if (gameState.playerAction) {
            resolveCombat();
        } else {
            // Treat as a "Defend" action if nothing is chosen
            const defendAbility = { name: 'Pass/Defend', type: 'DEFENSE', baseAttack: 0, dice: 0, coins: 0 };
            executeAbility(defendAbility);
        }
    });
}

window.onload = init;
