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

                // Generate sounds and music now that context exists
                this.generateBasicSounds();
                this.generateAreaMusic();

                // Try to play title music if on title screen
                if (Game.currentState === Game.states.TITLE) {
                    this.playMusic('music_title', true, 1.0);
                }
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
        // Generate area music
        this.generateAreaMusic();
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
    },

    /**
     * Generate all area music tracks
     */
    generateAreaMusic() {
        if (!this.context) return;

        // Intro/Tutorial - calm, simple melody
        this.musicCache['music_intro'] = this.generateMelody({
            tempo: 80,
            duration: 16,
            notes: [261, 293, 329, 293, 261, 246, 261, 293],
            waveform: 'sine',
            volume: 0.25,
            reverb: true
        });

        // Caverns - mysterious crystal sounds
        this.musicCache['music_caverns'] = this.generateMelody({
            tempo: 70,
            duration: 20,
            notes: [196, 233, 261, 293, 261, 233, 196, 174],
            waveform: 'triangle',
            volume: 0.2,
            reverb: true,
            arpeggio: true
        });

        // Descent - eerie, unsettling with multiple layers
        this.musicCache['music_descent'] = this.generateEerieMusic();

        // Ancient Halls - mysterious, echo-y
        this.musicCache['music_ancient'] = this.generateMelody({
            tempo: 60,
            duration: 20,
            notes: [220, 196, 174, 164, 174, 196, 220, 246],
            waveform: 'sine',
            volume: 0.2,
            reverb: true,
            pad: true
        });

        // Swamp - murky, slow, bubbling
        this.musicCache['music_swamp'] = this.generateMelody({
            tempo: 55,
            duration: 22,
            notes: [130, 146, 130, 116, 130, 146, 164, 146],
            waveform: 'triangle',
            volume: 0.18,
            reverb: true,
            bubbles: true
        });

        // Core - intense, mechanical
        this.musicCache['music_core'] = this.generateMelody({
            tempo: 100,
            duration: 16,
            notes: [174, 196, 220, 261, 220, 196, 174, 164],
            waveform: 'square',
            volume: 0.18,
            pulse: true
        });

        // Shop - upbeat, cheerful
        this.musicCache['music_shop'] = this.generateMelody({
            tempo: 120,
            duration: 12,
            notes: [329, 392, 440, 392, 329, 392, 523, 440],
            waveform: 'square',
            volume: 0.2,
            bounce: true
        });

        // Battle - intense, driving
        this.musicCache['music_battle'] = this.generateMelody({
            tempo: 140,
            duration: 8,
            notes: [196, 220, 261, 293, 261, 220, 196, 174],
            waveform: 'sawtooth',
            volume: 0.22,
            intense: true
        });

        // Boss battle - epic, dramatic
        this.musicCache['music_boss'] = this.generateMelody({
            tempo: 130,
            duration: 12,
            notes: [146, 174, 196, 220, 261, 220, 196, 146],
            waveform: 'sawtooth',
            volume: 0.25,
            intense: true,
            bass: true
        });

        // Title screen - sharp and dramatic
        this.musicCache['music_title'] = this.generateMelody({
            tempo: 75,
            duration: 32,
            notes: [196, 220, 261, 293, 261, 220, 196, 174, 196, 233, 293, 349, 293, 233, 196, 174],
            waveform: 'square',
            volume: 0.22,
            reverb: true,
            dramatic: true
        });
    },

    /**
     * Generate eerie music with multiple layers
     */
    generateEerieMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 30;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        // Initialize with silence
        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        // Layer 1: Deep drone bass
        const droneFreq = 55; // Low A
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const wobble = Math.sin(t * 0.3) * 0.2 + 1;
            const drone = Math.sin(2 * Math.PI * droneFreq * wobble * t) * 0.12;
            const drone2 = Math.sin(2 * Math.PI * droneFreq * 1.5 * t) * 0.06;
            leftData[i] += drone + drone2;
            rightData[i] += drone + drone2;
        }

        // Layer 2: Creepy high-pitched whispers/wind
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const windFreq = 800 + Math.sin(t * 0.5) * 200;
            const wind = Math.sin(2 * Math.PI * windFreq * t) * 0.02;
            const windEnv = (Math.sin(t * 0.7) + 1) * 0.5;
            // Pan left and right
            leftData[i] += wind * windEnv * (0.5 + Math.sin(t * 0.2) * 0.5);
            rightData[i] += wind * windEnv * (0.5 - Math.sin(t * 0.2) * 0.5);
        }

        // Layer 3: Dissonant melody notes (sparse, unsettling)
        const eerieNotes = [130, 138, 146, 155, 138, 123, 130, 116];
        const noteDuration = 2.5;
        for (let n = 0; n < Math.floor(duration / noteDuration); n++) {
            const noteFreq = eerieNotes[n % eerieNotes.length];
            const startSample = Math.floor(n * noteDuration * sampleRate);
            const noteLen = Math.floor(noteDuration * 0.9 * sampleRate);

            for (let i = 0; i < noteLen && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Detuned notes for creepy effect
                let sample = Math.sin(2 * Math.PI * noteFreq * t) * 0.08;
                sample += Math.sin(2 * Math.PI * noteFreq * 1.01 * t) * 0.06; // Slightly detuned
                sample += Math.sin(2 * Math.PI * noteFreq * 0.99 * t) * 0.06; // Slightly detuned other way

                // Slow attack, long release
                let env = 1;
                if (t < 0.3) env = t / 0.3;
                if (t > noteDuration * 0.9 - 0.5) env = (noteDuration * 0.9 - t) / 0.5;
                env = Math.max(0, env);

                const idx = startSample + i;
                leftData[idx] += sample * env;
                rightData[idx] += sample * env;
            }
        }

        // Layer 4: Random creepy sounds (occasional)
        for (let i = 0; i < 8; i++) {
            const startTime = Math.random() * (duration - 2);
            const startSample = Math.floor(startTime * sampleRate);
            const creepLen = Math.floor(1.5 * sampleRate);
            const creepFreq = 200 + Math.random() * 300;

            for (let j = 0; j < creepLen && (startSample + j) < length; j++) {
                const t = j / sampleRate;
                const creep = Math.sin(2 * Math.PI * creepFreq * (1 + t * 0.5) * t) * 0.04;
                const env = Math.sin(Math.PI * t / 1.5);
                const pan = Math.random() - 0.5;

                leftData[startSample + j] += creep * env * (0.5 - pan);
                rightData[startSample + j] += creep * env * (0.5 + pan);
            }
        }

        // Layer 5: Heartbeat-like pulse (very subtle)
        const beatInterval = 1.2;
        for (let beat = 0; beat < Math.floor(duration / beatInterval); beat++) {
            const startSample = Math.floor(beat * beatInterval * sampleRate);
            const pulseLen = Math.floor(0.15 * sampleRate);

            for (let i = 0; i < pulseLen && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const pulse = Math.sin(2 * Math.PI * 40 * t) * 0.1;
                const env = Math.exp(-t * 20);

                leftData[startSample + i] += pulse * env;
                rightData[startSample + i] += pulse * env;
            }
        }

        // Normalize
        let maxVal = 0;
        for (let i = 0; i < length; i++) {
            maxVal = Math.max(maxVal, Math.abs(leftData[i]), Math.abs(rightData[i]));
        }
        if (maxVal > 0.8) {
            const scale = 0.8 / maxVal;
            for (let i = 0; i < length; i++) {
                leftData[i] *= scale;
                rightData[i] *= scale;
            }
        }

        return buffer;
    },

    /**
     * Generate a melodic music track
     */
    generateMelody(config) {
        const sampleRate = this.context.sampleRate;
        const duration = config.duration;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        const tempo = config.tempo;
        const beatDuration = 60 / tempo;
        const notes = config.notes;
        const volume = config.volume || 0.2;

        // Fill with silence first
        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        // Generate melody
        for (let beat = 0; beat < Math.floor(duration / beatDuration); beat++) {
            const noteIndex = beat % notes.length;
            const freq = notes[noteIndex];
            const startSample = Math.floor(beat * beatDuration * sampleRate);
            const noteDuration = beatDuration * 0.8;
            const noteLength = Math.floor(noteDuration * sampleRate);

            for (let i = 0; i < noteLength && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                let sample = 0;

                // Main waveform
                switch (config.waveform) {
                    case 'sine':
                        sample = Math.sin(2 * Math.PI * freq * t);
                        break;
                    case 'square':
                        sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.7 : -0.7;
                        break;
                    case 'triangle':
                        sample = Math.abs((t * freq % 1) * 4 - 2) - 1;
                        break;
                    case 'sawtooth':
                        sample = ((t * freq % 1) * 2 - 1) * 0.7;
                        break;
                }

                // Add harmonics for richness
                sample += Math.sin(2 * Math.PI * freq * 2 * t) * 0.2;
                sample += Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.3;

                // Envelope (attack, sustain, release)
                let envelope = 1;
                const attackTime = 0.02;
                const releaseTime = 0.1;
                if (t < attackTime) {
                    envelope = t / attackTime;
                } else if (t > noteDuration - releaseTime) {
                    envelope = (noteDuration - t) / releaseTime;
                }

                sample *= envelope * volume;

                // Add arpeggio effect
                if (config.arpeggio) {
                    const arpFreq = freq * (1 + (Math.floor(t * 8) % 3) * 0.25);
                    sample += Math.sin(2 * Math.PI * arpFreq * t) * volume * 0.3 * envelope;
                }

                // Add pad/sustained background
                if (config.pad) {
                    sample += Math.sin(2 * Math.PI * freq * 0.25 * t) * volume * 0.4;
                }

                // Add bouncy bass for shop
                if (config.bounce && beat % 2 === 0) {
                    sample += Math.sin(2 * Math.PI * freq * 0.5 * t) * volume * 0.5 * envelope;
                }

                // Add intensity for battle
                if (config.intense) {
                    sample += Math.sin(2 * Math.PI * freq * 1.5 * t) * volume * 0.2;
                    sample *= 1 + Math.sin(t * 20) * 0.1;
                }

                // Add bass
                if (config.bass) {
                    sample += Math.sin(2 * Math.PI * freq * 0.25 * t) * volume * 0.6 * envelope;
                }

                // Add bubble sounds for swamp
                if (config.bubbles && Math.random() < 0.001) {
                    sample += (Math.random() - 0.5) * volume;
                }

                // Add dramatic sharp sound for title
                if (config.dramatic) {
                    sample += Math.sin(2 * Math.PI * freq * 1.5 * t) * volume * 0.3;
                    sample += Math.sin(2 * Math.PI * freq * 0.5 * t) * volume * 0.4 * envelope;
                }

                // Stereo spread
                const pan = Math.sin(t * 0.5) * 0.3;
                const idx = startSample + i;
                leftData[idx] += sample * (1 - pan);
                rightData[idx] += sample * (1 + pan);
            }
        }

        // Add ambient drone for reverb effect
        if (config.reverb) {
            const droneFreq = notes[0] * 0.25;
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                const drone = Math.sin(2 * Math.PI * droneFreq * t) * volume * 0.15;
                leftData[i] += drone;
                rightData[i] += drone;
            }
        }

        // Normalize to prevent clipping
        let maxVal = 0;
        for (let i = 0; i < length; i++) {
            maxVal = Math.max(maxVal, Math.abs(leftData[i]), Math.abs(rightData[i]));
        }
        if (maxVal > 0.9) {
            const scale = 0.9 / maxVal;
            for (let i = 0; i < length; i++) {
                leftData[i] *= scale;
                rightData[i] *= scale;
            }
        }

        return buffer;
    },

    /**
     * Get music name for a room
     */
    getMusicForRoom(roomId) {
        if (!roomId) return null;

        // Shop rooms
        if (roomId.includes('shop')) {
            return 'music_shop';
        }

        // Determine by area prefix
        if (roomId.startsWith('intro') || roomId.startsWith('tutorial')) {
            return 'music_intro';
        }
        if (roomId.startsWith('caverns') || roomId.startsWith('crystal')) {
            return 'music_caverns';
        }
        if (roomId.startsWith('descent')) {
            return 'music_descent';
        }
        if (roomId.startsWith('ancient')) {
            return 'music_ancient';
        }
        if (roomId.startsWith('swamp')) {
            return 'music_swamp';
        }
        if (roomId.startsWith('core') || roomId.startsWith('final')) {
            return 'music_core';
        }

        // Default to intro music
        return 'music_intro';
    },

    /**
     * Play area music based on room
     */
    playAreaMusic(roomId) {
        if (!this.context) return;

        // Make sure music is generated
        if (!this.musicCache['music_intro']) {
            this.generateAreaMusic();
        }

        const musicName = this.getMusicForRoom(roomId);
        if (musicName && this.musicCache[musicName]) {
            this.playMusic(musicName, true, 0.8);
        }
    },

    /**
     * Ensure audio is ready and play music
     */
    ensureReady() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
};

// Make it globally available
window.Audio = Audio;
