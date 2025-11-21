/**
 * Character data for the Coin & Dice Clash system.
 * * Ability Properties:
 * - baseAttack: Flat damage added to the coin flip bonus for damage calculation.
 * - dice: The size of the die used for the Clash Roll (e.g., 6 for d6).
 * - coins: The base number of coin flips added to the Clash Roll.
 * - damageType: Force, Psychic, Physical, Necrotic (used for resistances/vulnerabilities).
 * * Combat Formulas (Logic implemented in main.js):
 * - Clash Value = Base Roll (5) + Dice Result + Sum of Coin Flips
 * - Damage Taken (if attack wins clash) = Base Attack + Sum of Coin Flips - Target Defense
 */

export const Characters = [
    // --- 1. Striker (Slow Start: Coin Scaler) ---
    {
        id: 'striker',
        name: 'Striker',
        description: 'A damage specialist who scales in power the longer a fight lasts.',
        baseStats: {
            maxHP: 110,
            defense: 2,
            level: 1,
            // Unique state tracking:
            consecutive_rounds: 0, 
        },
        uniquePassive: { 
            name: 'Slow Start', 
            effect: 'Each consecutive combat round, gains +1 Coin to all attacks.',
            type: 'CoinScaler'
        },
        abilities: [
            {
                name: 'Dragon Strike',
                type: 'ATTACK',
                damageType: 'Force',
                baseAttack: 4, 
                dice: 4, 
                coins: 2, 
            },
            {
                name: 'Focused Strike',
                type: 'ATTACK',
                damageType: 'Physical',
                baseAttack: 5, 
                dice: 6,
                coins: 1, 
            },
            {
                name: 'Brace',
                type: 'DEFENSE',
                effect: 'Negates the next incoming hit entirely.',
                damageType: 'None',
                baseAttack: 0,
                dice: 0,
                coins: 0,
            }
        ]
    },

    // --- 2. Juggernaut (Grapple Combo) ---
    {
        id: 'juggernaut',
        name: 'Juggernaut',
        description: 'A bruiser who uses control abilities to set up devastating combos.',
        baseStats: {
            maxHP: 130,
            defense: 4,
            level: 1,
            isGrappling: false, // Tracks if Juggernaut has grappled the enemy
        },
        uniquePassive: { 
            name: 'Immovable Object', 
            effect: 'Defense is increased by +2 whenever the enemy tries to Grapple Juggernaut.',
            type: 'DefenseConditional',
        },
        abilities: [
            {
                name: 'Grapple',
                type: 'CONTROL',
                effect: 'Locks the enemy into a Grapple, reducing their coin value by 2 for one round.',
                damageType: 'Physical',
                baseAttack: 0, 
                dice: 6,
                coins: 1,
            },
            {
                name: 'Piledriver',
                type: 'ATTACK',
                effect: 'Can only be used if the enemy is Grappled. Deals heavy damage and releases the Grapple.',
                damageType: 'Physical',
                baseAttack: 10, 
                dice: 8,
                coins: 2,
            },
            {
                name: 'Body Slam',
                type: 'ATTACK',
                damageType: 'Force',
                baseAttack: 5, 
                dice: 4,
                coins: 1,
            }
        ]
    },
    
    // --- 3. Shutenmaru (Chrono-Fist: Roll Trigger) ---
    {
        id: 'shutenmaru',
        name: 'Shutenmaru',
        description: 'A martial artist who heals on a critical dice roll.',
        baseStats: {
            maxHP: 100,
            defense: 1,
            level: 1,
            lastDamageTaken: 0, // Tracks damage taken by the last target of an attack
        },
        uniquePassive: { 
            name: 'Chrono-Fist', 
            effect: 'On a successful attack, if the dice roll is a 6, Shutenmaru heals HP equal to the damage dealt by the last hit.',
            type: 'RollTrigger',
            triggerValue: 6,
        },
        abilities: [
            {
                name: 'Temporal Strike',
                type: 'ATTACK',
                damageType: 'Psychic',
                baseAttack: 3, 
                dice: 6,
                coins: 3,
            },
            {
                name: 'Dimensional Kick',
                type: 'ATTACK',
                damageType: 'Physical',
                baseAttack: 6, 
                dice: 4,
                coins: 2,
            },
            {
                name: 'Phase',
                type: 'DEFENSE',
                effect: 'Negates the next incoming hit entirely.',
                damageType: 'None',
                baseAttack: 0,
                dice: 0,
                coins: 0,
            }
        ]
    },

    // --- 4. Zectus (Tri-Sword: Stance Switcher) ---
    {
        id: 'zectus',
        name: 'Zectus',
        description: 'A gender-neutral sentinel that switches weapons and excels against female opponents.',
        baseStats: {
            maxHP: 120,
            defense: 3,
            level: 1,
            gender: 'Non-Binary',
            weaponState: 'Scythe', // Tracks current weapon form
        },
        uniquePassive: { 
            name: 'Homogenous', 
            effect: 'Adds +2 Coins to Clashes against female opponents.',
            type: 'ConditionalCoin',
            condition: { target_gender: 'Female' },
            coinBonus: 2,
        },
        abilities: [
            {
                name: 'Cycle',
                type: 'SWITCH',
                effect: 'Cycles Tri-Sword: Scythe -> Trident -> Hammer. Deals 2 damage on activation.',
                baseAttack: 2, // Activation damage
                dice: 0,
                coins: 0,
            },
            {
                name: 'Tri-Sword: Scythe',
                type: 'ATTACK',
                damageType: 'Necrotic',
                baseAttack: 6, 
                dice: 8,
                coins: 1,
                weaponState: 'Scythe',
                isZectusMainAttack: true, // Flag to identify which attack button should be displayed as the main one
            },
            {
                name: 'Tri-Sword: Trident',
                type: 'ATTACK',
                damageType: 'Physical',
                baseAttack: 7, 
                dice: 10,
                coins: 1,
                weaponState: 'Trident',
                isHidden: true,
                isZectusMainAttack: true,
            },
            {
                name: 'Tri-Sword: Hammer',
                type: 'ATTACK',
                damageType: 'Force',
                baseAttack: 8, 
                dice: 12,
                coins: 1,
                weaponState: 'Hammer',
                isHidden: true,
                isZectusMainAttack: true,
            }
        ]
    },
];
