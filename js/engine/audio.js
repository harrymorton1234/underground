/**
 * Audio system for music and sound effects
 */
const Audio = {
    // Audio context
    context: null,
    masterGain: null,

    // Volume settings
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 1.0,

    // Currently playing music
    currentMusic: null,
    currentMusicName: null,
    musicSource: null,

    // Sound effects cache
    sfxCache: {},
    musicCache: {},

    // Active sound effects
    activeSounds: [],

    // Mute states
    muted: false,
    musicMuted: false,
    sfxMuted: false,

    /**
     * Initialize audio system
     */
    init() {
        // Create audio context on user interaction
        const initContext = () => {
            if (!this.context) {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.context.createGain();
                this.masterGain.connect(this.context.destination);
                this.updateVolume();
            }
            // Resume context if suspended
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
        };

        // Initialize on first user interaction
        ['click', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, initContext, { once: true });
        });
    },

    /**
     * Load a sound file
     */
    async load(name, path, isMusic = false) {
        try {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

            if (isMusic) {
                this.musicCache[name] = audioBuffer;
            } else {
                this.sfxCache[name] = audioBuffer;
            }

            return audioBuffer;
        } catch (error) {
            console.warn(`Failed to load audio: ${path}`, error);
            return null;
        }
    },

    /**
     * Play a sound effect
     */
    playSFX(name, volume = 1.0, pitch = 1.0) {
        if (!this.context || this.muted || this.sfxMuted) return null;

        const buffer = this.sfxCache[name];
        if (!buffer) {
            console.warn(`SFX not found: ${name}`);
            return null;
        }

        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();

        source.buffer = buffer;
        source.playbackRate.value = pitch;

        gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;

        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        source.start(0);

        // Track active sounds
        const sound = { source, gainNode, name };
        this.activeSounds.push(sound);

        source.onended = () => {
            const index = this.activeSounds.indexOf(sound);
            if (index > -1) {
                this.activeSounds.splice(index, 1);
            }
        };

        return sound;
    },

    /**
     * Play music with optional crossfade
     */
    playMusic(name, loop = true, fadeIn = 0.5) {
        if (!this.context) return;

        // Don't restart if same music
        if (this.currentMusicName === name && this.musicSource) {
            return;
        }

        const buffer = this.musicCache[name];
        if (!buffer) {
            console.warn(`Music not found: ${name}`);
            return;
        }

        // Fade out current music
        if (this.currentMusic) {
            this.fadeOutMusic(0.5);
        }

        // Create new music source
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();

        source.buffer = buffer;
        source.loop = loop;

        const targetVolume = this.musicMuted || this.muted ? 0 : this.musicVolume * this.masterVolume;

        // Fade in
        gainNode.gain.value = 0;
        gainNode.gain.linearRampToValueAtTime(targetVolume, this.context.currentTime + fadeIn);

        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        source.start(0);

        this.musicSource = source;
        this.currentMusic = gainNode;
        this.currentMusicName = name;
    },

    /**
     * Stop current music with fade out
     */
    stopMusic(fadeOut = 0.5) {
        this.fadeOutMusic(fadeOut);
        this.currentMusicName = null;
    },

    /**
     * Fade out current music
     */
    fadeOutMusic(duration = 0.5) {
        if (!this.currentMusic || !this.context) return;

        const gainNode = this.currentMusic;
        const source = this.musicSource;

        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + duration);

        setTimeout(() => {
            try {
                source.stop();
            } catch (e) {
                // Already stopped
            }
        }, duration * 1000);

        this.currentMusic = null;
        this.musicSource = null;
    },

    /**
     * Pause music
     */
    pauseMusic() {
        if (this.context && this.context.state === 'running') {
            this.context.suspend();
        }
    },

    /**
     * Resume music
     */
    resumeMusic() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },

    /**
     * Update volume levels
     */
    updateVolume() {
        if (this.currentMusic) {
            const targetVolume = this.musicMuted || this.muted ? 0 : this.musicVolume * this.masterVolume;
            this.currentMusic.gain.value = targetVolume;
        }
    },

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Utils.clamp(volume, 0, 1);
        this.updateVolume();
    },

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Utils.clamp(volume, 0, 1);
        this.updateVolume();
    },

    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Utils.clamp(volume, 0, 1);
    },

    /**
     * Toggle mute all
     */
    toggleMute() {
        this.muted = !this.muted;
        this.updateVolume();
        return this.muted;
    },

    /**
     * Toggle music mute
     */
    toggleMusicMute() {
        this.musicMuted = !this.musicMuted;
        this.updateVolume();
        return this.musicMuted;
    },

    /**
     * Toggle SFX mute
     */
    toggleSFXMute() {
        this.sfxMuted = !this.sfxMuted;
        return this.sfxMuted;
    },

    /**
     * Stop all sounds
     */
    stopAll() {
        this.stopMusic(0);
        for (const sound of this.activeSounds) {
            try {
                sound.source.stop();
            } catch (e) {
                // Already stopped
            }
        }
        this.activeSounds = [];
    },

    /**
     * Preload common sounds
     */
    async preloadCommon() {
        // These will be actual files later
        // For now, we'll generate simple sounds programmatically
        await this.generateBasicSounds();
    },

    /**
     * Generate basic placeholder sounds
     */
    async generateBasicSounds() {
        if (!this.context) return;

        // Text blip sound
        this.sfxCache['text'] = this.generateTone(0.05, 440, 'square', 0.3);

        // Confirm sound
        this.sfxCache['confirm'] = this.generateTone(0.1, 660, 'square', 0.4);

        // Cancel sound
        this.sfxCache['cancel'] = this.generateTone(0.1, 330, 'square', 0.4);

        // Menu move sound
        this.sfxCache['menu_move'] = this.generateTone(0.05, 220, 'square', 0.3);

        // Hit sound
        this.sfxCache['hit'] = this.generateNoise(0.1, 0.5);

        // Heal sound
        this.sfxCache['heal'] = this.generateTone(0.2, 523, 'sine', 0.4);

        // Save sound
        this.sfxCache['save'] = this.generateTone(0.3, 392, 'sine', 0.3);

        // Damage sound
        this.sfxCache['damage'] = this.generateNoise(0.15, 0.6);
    },

    /**
     * Generate a simple tone
     */
    generateTone(duration, frequency, type = 'square', volume = 0.5) {
        const sampleRate = this.context.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let sample = 0;

            switch (type) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                    break;
                case 'triangle':
                    sample = Math.abs((t * frequency % 1) * 4 - 2) - 1;
                    break;
                case 'sawtooth':
                    sample = ((t * frequency % 1) * 2 - 1);
                    break;
            }

            // Apply envelope
            const envelope = Math.min(1, (length - i) / (length * 0.3));
            data[i] = sample * volume * envelope;
        }

        return buffer;
    },

    /**
     * Generate noise
     */
    generateNoise(duration, volume = 0.5) {
        const sampleRate = this.context.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const envelope = Math.min(1, (length - i) / (length * 0.5));
            data[i] = (Math.random() * 2 - 1) * volume * envelope;
        }

        return buffer;
    }
};

// Make it globally available
window.Audio = Audio;
