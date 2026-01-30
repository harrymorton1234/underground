/**
 * Secrets and easter eggs system
 */
const Secrets = {
    // Secret definitions
    definitions: {
        'descent_hidden_chamber': {
            name: 'Hidden Chamber',
            description: 'Found the secret room in The Descent',
            hint: 'Some walls are not what they seem...'
        },

        'piano_secret_song': {
            name: 'Familiar Melody',
            description: 'Played the secret song on the piano',
            hint: 'Do, Re, Mi, Fa... what comes next?'
        },

        'dev_room_found': {
            name: 'Behind the Curtain',
            description: 'Found the developer room',
            hint: "There's a crack in the wall somewhere..."
        },

        'all_spared': {
            name: 'Pacifist',
            description: 'Completed the game without killing anyone',
            hint: 'Violence is never the answer.'
        },

        'all_killed': {
            name: 'No Mercy',
            description: 'Killed everyone',
            hint: 'Some paths are darker than others.'
        },

        'speed_run': {
            name: 'Speed Demon',
            description: 'Completed the game in under 10 minutes',
            hint: 'Gotta go fast!'
        },

        'talk_to_everyone': {
            name: 'Social Butterfly',
            description: 'Talked to every NPC',
            hint: "Everyone has something to say."
        },

        'die_to_dummy': {
            name: 'How?',
            description: 'Died to the training dummy',
            hint: 'This should be impossible...'
        },

        'name_chara': {
            name: 'True Name',
            description: 'Named yourself CHARA',
            hint: 'The demon that comes when you call its name.'
        },

        'name_frisk': {
            name: 'Deja Vu',
            description: 'Named yourself FRISK',
            hint: 'A name that feels... familiar.'
        }
    },

    /**
     * Get all discovered secrets
     */
    getDiscovered() {
        const save = Save.getCurrent();
        if (!save) return [];

        return save.secrets.map(id => ({
            id,
            ...this.definitions[id]
        }));
    },

    /**
     * Get all secrets (discovered status)
     */
    getAll() {
        const save = Save.getCurrent();
        const discovered = save ? save.secrets : [];

        return Object.entries(this.definitions).map(([id, def]) => ({
            id,
            ...def,
            discovered: discovered.includes(id)
        }));
    },

    /**
     * Check if secret is discovered
     */
    isDiscovered(secretId) {
        return Save.hasSecret(secretId);
    },

    /**
     * Discover a secret
     */
    discover(secretId) {
        if (!this.definitions[secretId]) {
            console.warn(`Unknown secret: ${secretId}`);
            return false;
        }

        if (this.isDiscovered(secretId)) {
            return false; // Already discovered
        }

        Save.recordSecret(secretId);

        // Show notification
        this.showNotification(secretId);

        return true;
    },

    /**
     * Show secret discovery notification
     */
    showNotification(secretId) {
        const secret = this.definitions[secretId];
        if (!secret) return;

        // Could show a popup or notification
        console.log(`Secret discovered: ${secret.name}`);
        Audio.playSFX('confirm');
    },

    /**
     * Get discovery percentage
     */
    getPercentage() {
        const total = Object.keys(this.definitions).length;
        const discovered = this.getDiscovered().length;
        return Math.floor((discovered / total) * 100);
    },

    /**
     * Check for name-based secrets
     */
    checkNameSecrets(name) {
        const upperName = name.toUpperCase();

        switch (upperName) {
            case 'CHARA':
                this.discover('name_chara');
                break;
            case 'FRISK':
                this.discover('name_frisk');
                break;
        }
    },

    /**
     * Check for ending-based secrets
     */
    checkEndingSecrets() {
        const save = Save.getCurrent();
        if (!save) return;

        // Pacifist
        if (save.kills === 0) {
            this.discover('all_spared');
        }

        // Violence (if killed everyone possible)
        if (save.kills >= 10) { // Threshold for "all killed"
            this.discover('all_killed');
        }

        // Speed run
        if (save.playTime < 600) { // 10 minutes
            this.discover('speed_run');
        }
    },

    /**
     * Render secrets menu (if implemented)
     */
    renderMenu() {
        const secrets = this.getAll();
        const discovered = secrets.filter(s => s.discovered).length;
        const total = secrets.length;

        Renderer.drawBox(30, 30, 260, 180);
        Renderer.drawText('SECRETS', 160, 40, '#fff', 'center');
        Renderer.drawText(`${discovered}/${total} discovered`, 160, 55, '#888', 'center');

        const startY = 75;

        for (let i = 0; i < secrets.length; i++) {
            const y = startY + i * 14;
            const secret = secrets[i];

            if (secret.discovered) {
                Renderer.drawText(`[x] ${secret.name}`, 50, y, '#ff0');
            } else {
                Renderer.drawText(`[ ] ???`, 50, y, '#555');
            }
        }
    }
};

// Make it globally available
window.Secrets = Secrets;
