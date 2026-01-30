/**
 * Save system using LocalStorage
 */
const Save = {
    // Save key prefix
    prefix: 'underground_',

    // Number of save slots
    numSlots: 3,

    // Current save data in memory
    currentData: null,

    // Persistent data (survives true resets)
    persistentKey: 'underground_persistent',

    /**
     * Initialize save system
     */
    init() {
        this.loadPersistent();
    },

    /**
     * Create a new save data structure
     */
    createNewSave() {
        return {
            // Player info
            name: 'PLAYER',
            level: 1,
            hp: 20,
            maxHp: 20,
            attack: 10,
            defense: 10,
            exp: 0,
            gold: 0,

            // Position
            roomId: 'start',
            x: 160,
            y: 120,

            // Inventory
            items: [],
            maxItems: 8,
            weapon: null,
            armor: null,

            // Story progress
            flags: {},

            // Route tracking
            kills: 0,
            spares: 0,
            killsByArea: {},
            sparesByArea: {},

            // Character fates
            characterFates: {},

            // Secrets discovered
            secrets: [],

            // Play time (in seconds)
            playTime: 0,

            // Save metadata
            saveDate: null,
            chapter: 1
        };
    },

    /**
     * Load persistent data
     */
    loadPersistent() {
        try {
            const data = localStorage.getItem(this.persistentKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load persistent data:', e);
        }

        return {
            totalPlaythroughs: 0,
            trueResets: 0,
            discoveredSecrets: [],
            endingsSeen: [],
            specialNames: []
        };
    },

    /**
     * Save persistent data
     */
    savePersistent(data) {
        try {
            localStorage.setItem(this.persistentKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save persistent data:', e);
        }
    },

    /**
     * Record playthrough completion
     */
    recordPlaythrough(endingType) {
        const persistent = this.loadPersistent();
        persistent.totalPlaythroughs++;

        if (!persistent.endingsSeen.includes(endingType)) {
            persistent.endingsSeen.push(endingType);
        }

        this.savePersistent(persistent);
    },

    /**
     * Check if this is a repeat playthrough
     */
    hasPlayedBefore() {
        const persistent = this.loadPersistent();
        return persistent.totalPlaythroughs > 0;
    },

    /**
     * Check if specific ending has been seen
     */
    hasSeenEnding(endingType) {
        const persistent = this.loadPersistent();
        return persistent.endingsSeen.includes(endingType);
    },

    /**
     * Record special name entry
     */
    recordSpecialName(name) {
        const persistent = this.loadPersistent();
        if (!persistent.specialNames.includes(name)) {
            persistent.specialNames.push(name);
        }
        this.savePersistent(persistent);
    },

    /**
     * Get save slot key
     */
    getSlotKey(slot) {
        return `${this.prefix}save_${slot}`;
    },

    /**
     * Check if save slot exists
     */
    slotExists(slot) {
        return localStorage.getItem(this.getSlotKey(slot)) !== null;
    },

    /**
     * Get save slot info (for display)
     */
    getSlotInfo(slot) {
        try {
            const data = localStorage.getItem(this.getSlotKey(slot));
            if (data) {
                const save = JSON.parse(data);
                return {
                    exists: true,
                    name: save.name,
                    level: save.level,
                    roomId: save.roomId,
                    playTime: save.playTime,
                    saveDate: save.saveDate
                };
            }
        } catch (e) {
            console.warn('Failed to read save slot:', e);
        }

        return { exists: false };
    },

    /**
     * Save game to slot
     */
    saveToSlot(slot, data = null) {
        const saveData = data || this.currentData;
        if (!saveData) {
            console.warn('No data to save');
            return false;
        }

        try {
            saveData.saveDate = new Date().toISOString();
            localStorage.setItem(this.getSlotKey(slot), JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.warn('Failed to save:', e);
            return false;
        }
    },

    /**
     * Load game from slot
     */
    loadFromSlot(slot) {
        try {
            const data = localStorage.getItem(this.getSlotKey(slot));
            if (data) {
                this.currentData = JSON.parse(data);
                return this.currentData;
            }
        } catch (e) {
            console.warn('Failed to load save:', e);
        }
        return null;
    },

    /**
     * Delete save slot
     */
    deleteSlot(slot) {
        try {
            localStorage.removeItem(this.getSlotKey(slot));
            return true;
        } catch (e) {
            console.warn('Failed to delete save:', e);
            return false;
        }
    },

    /**
     * Delete all saves (but not persistent data)
     */
    deleteAllSaves() {
        for (let i = 0; i < this.numSlots; i++) {
            this.deleteSlot(i);
        }
    },

    /**
     * True reset (clears everything including persistent)
     */
    trueReset() {
        const persistent = this.loadPersistent();
        persistent.trueResets++;
        this.savePersistent(persistent);

        this.deleteAllSaves();
    },

    /**
     * Get current save data
     */
    getCurrent() {
        return this.currentData;
    },

    /**
     * Set current save data
     */
    setCurrent(data) {
        this.currentData = data;
    },

    /**
     * Update current save data
     */
    updateCurrent(updates) {
        if (this.currentData) {
            Object.assign(this.currentData, updates);
        }
    },

    /**
     * Get flag value
     */
    getFlag(key, defaultValue = false) {
        if (this.currentData && this.currentData.flags) {
            return this.currentData.flags[key] ?? defaultValue;
        }
        return defaultValue;
    },

    /**
     * Set flag value
     */
    setFlag(key, value) {
        if (this.currentData) {
            if (!this.currentData.flags) {
                this.currentData.flags = {};
            }
            this.currentData.flags[key] = value;
        }
    },

    /**
     * Increment kill count
     */
    recordKill(areaId = 'unknown') {
        if (this.currentData) {
            this.currentData.kills++;
            this.currentData.killsByArea[areaId] = (this.currentData.killsByArea[areaId] || 0) + 1;
        }
    },

    /**
     * Increment spare count
     */
    recordSpare(areaId = 'unknown') {
        if (this.currentData) {
            this.currentData.spares++;
            this.currentData.sparesByArea[areaId] = (this.currentData.sparesByArea[areaId] || 0) + 1;
        }
    },

    /**
     * Set character fate
     */
    setCharacterFate(characterId, fate) {
        if (this.currentData) {
            this.currentData.characterFates[characterId] = fate;
        }
    },

    /**
     * Get character fate
     */
    getCharacterFate(characterId) {
        if (this.currentData) {
            return this.currentData.characterFates[characterId];
        }
        return null;
    },

    /**
     * Check route type based on kills/spares
     */
    getRouteType() {
        if (!this.currentData) return 'neutral';

        const kills = this.currentData.kills;
        const spares = this.currentData.spares;

        if (kills === 0) return 'pacifist';
        if (kills >= 10) return 'violence';  // Threshold for violence route
        return 'neutral';
    },

    /**
     * Record discovered secret
     */
    recordSecret(secretId) {
        if (this.currentData && !this.currentData.secrets.includes(secretId)) {
            this.currentData.secrets.push(secretId);

            // Also record in persistent data
            const persistent = this.loadPersistent();
            if (!persistent.discoveredSecrets.includes(secretId)) {
                persistent.discoveredSecrets.push(secretId);
                this.savePersistent(persistent);
            }
        }
    },

    /**
     * Check if secret was discovered
     */
    hasSecret(secretId) {
        if (this.currentData) {
            return this.currentData.secrets.includes(secretId);
        }
        return false;
    },

    /**
     * Add play time
     */
    addPlayTime(seconds) {
        if (this.currentData) {
            this.currentData.playTime += seconds;
        }
    },

    /**
     * Format play time for display
     */
    formatPlayTime() {
        if (this.currentData) {
            return Utils.formatTime(this.currentData.playTime);
        }
        return '00:00';
    },

    /**
     * Export save as string (for sharing/backup)
     */
    exportSave(slot) {
        const data = localStorage.getItem(this.getSlotKey(slot));
        if (data) {
            return btoa(data);
        }
        return null;
    },

    /**
     * Import save from string
     */
    importSave(slot, encodedData) {
        try {
            const data = atob(encodedData);
            JSON.parse(data); // Validate JSON
            localStorage.setItem(this.getSlotKey(slot), data);
            return true;
        } catch (e) {
            console.warn('Failed to import save:', e);
            return false;
        }
    }
};

// Make it globally available
window.Save = Save;
