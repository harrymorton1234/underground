/**
 * Story flags and route tracking
 */
const Flags = {
    // Flag definitions with default values and descriptions
    definitions: {
        // Tutorial flags
        'intro_complete': { default: false, description: 'Completed intro sequence' },
        'met_guide': { default: false, description: 'Met the guide character' },
        'learned_battle': { default: false, description: 'Completed battle tutorial' },
        'learned_mercy': { default: false, description: 'Learned about MERCY option' },

        // Area 1 - The Descent
        'descent_entered': { default: false, description: 'Entered The Descent' },
        'descent_secret_found': { default: false, description: 'Found the secret lore tablet' },
        'first_enemy_spared': { default: false, description: 'Spared the first enemy' },
        'first_enemy_killed': { default: false, description: 'Killed the first enemy' },

        // Area 2 - Crystal Caverns
        'caverns_entered': { default: false, description: 'Entered Crystal Caverns' },
        'crystal_puzzle_solved': { default: false, description: 'Solved the crystal puzzle' },
        'piano_played': { default: false, description: 'Played the piano' },
        'piano_secret_song': { default: false, description: 'Played the secret song on piano' },
        'met_shopkeeper': { default: false, description: 'Met the shopkeeper' },
        'shopkeeper_befriended': { default: false, description: 'Befriended the shopkeeper' },

        // Crystal Guardian
        'guardian_fought': { default: false, description: 'Fought the Crystal Guardian' },
        'guardian_spared': { default: false, description: 'Spared the Crystal Guardian' },
        'guardian_killed': { default: false, description: 'Killed the Crystal Guardian' },

        // Area 3 - Ancient Hall
        'hall_entered': { default: false, description: 'Entered the Ancient Hall' },
        'mysterious_figure_met': { default: false, description: 'Met the mysterious figure' },
        'learned_history': { default: false, description: 'Learned the world history' },
        'moral_choice_made': { default: false, description: 'Made the moral choice' },
        'moral_choice_kind': { default: false, description: 'Chose the kind option' },
        'moral_choice_cruel': { default: false, description: 'Chose the cruel option' },

        // Final Boss
        'final_boss_fought': { default: false, description: 'Fought the final boss' },
        'final_boss_spared': { default: false, description: 'Spared the final boss' },
        'final_boss_killed': { default: false, description: 'Killed the final boss' },

        // Developer room
        'dev_room_found': { default: false, description: 'Found the developer room' },

        // Misc
        'died_once': { default: false, description: 'Died at least once' },
        'used_item': { default: false, description: 'Used an item in battle' }
    },

    /**
     * Get flag default value
     */
    getDefault(flagName) {
        const def = this.definitions[flagName];
        return def ? def.default : false;
    },

    /**
     * Check if flag is defined
     */
    isDefined(flagName) {
        return flagName in this.definitions;
    },

    /**
     * Get all flag names
     */
    getAllFlags() {
        return Object.keys(this.definitions);
    },

    /**
     * Check route conditions
     */
    checkRouteConditions(save) {
        const conditions = {
            pacifist: {
                kills: save.kills === 0,
                spares: save.spares >= 5,
                guardianSpared: save.flags['guardian_spared'] === true,
                finalBossSpared: save.flags['final_boss_spared'] === true
            },
            violence: {
                kills: save.kills >= 10,
                guardianKilled: save.flags['guardian_killed'] === true,
                finalBossKilled: save.flags['final_boss_killed'] === true
            }
        };

        return conditions;
    },

    /**
     * Determine current route
     */
    determineRoute(save) {
        if (!save) return 'neutral';

        const conditions = this.checkRouteConditions(save);

        // Check pacifist (all conditions must be met)
        if (Object.values(conditions.pacifist).every(c => c)) {
            return 'pacifist';
        }

        // Check violence (key conditions)
        if (conditions.violence.kills && conditions.violence.guardianKilled) {
            return 'violence';
        }

        return 'neutral';
    },

    /**
     * Get route-specific dialogue variant
     */
    getRouteDialogue(baseId, save) {
        const route = this.determineRoute(save);

        // Check for route-specific variant
        const variantId = `${baseId}_${route}`;

        // Return variant if exists, otherwise base
        if (Dialogues.data[variantId]) {
            return variantId;
        }

        return baseId;
    },

    /**
     * Check if on violence route (for harder encounters)
     */
    isViolenceRoute(save) {
        return save && save.kills >= 5;
    },

    /**
     * Check if eligible for true pacifist
     */
    canTruePacifist(save) {
        if (!save) return false;

        return save.kills === 0 &&
               save.flags['guardian_spared'] === true &&
               save.flags['shopkeeper_befriended'] === true;
    }
};

// Make it globally available
window.Flags = Flags;
