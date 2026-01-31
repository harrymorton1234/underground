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
        // Caverns - Crystal bells and chimes
        this.musicCache['music_caverns'] = this.generateCavernsMusic();

        // Descent - eerie, unsettling with multiple layers
        this.musicCache['music_descent'] = this.generateEerieMusic();

        // Ancient Halls - Organ and choir
        this.musicCache['music_ancient'] = this.generateAncientMusic();

        // Swamp - Tribal drums and deep bass
        this.musicCache['music_swamp'] = this.generateSwampMusic();

        // Core - Electronic synth
        this.musicCache['music_core'] = this.generateCoreMusic();

        // Shop - Cheerful piano
        this.musicCache['music_shop'] = this.generateShopMusic();

        // Battle - Aggressive drums and strings
        this.musicCache['music_battle'] = this.generateBattleMusic();

        // Boss battle - tense and intense
        this.musicCache['music_boss'] = this.generateBossMusic();

        // Mega boss - Techno like Pigstep
        this.musicCache['music_mega'] = this.generateMegaBossMusic();

        // Title screen - Orchestral
        this.musicCache['music_title'] = this.generateTitleMusic();
    },

    /**
     * Generate crystal caverns music - bells and chimes
     */
    generateCavernsMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 20;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        // Crystal bell melody
        const bellNotes = [523, 659, 784, 659, 523, 587, 698, 587, 523, 784, 880, 784, 659, 523, 587, 523];
        const bellInterval = 1.2;

        for (let n = 0; n < Math.floor(duration / bellInterval); n++) {
            const freq = bellNotes[n % bellNotes.length];
            const startSample = Math.floor(n * bellInterval * sampleRate);

            for (let i = 0; i < sampleRate * 1.5 && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Bell harmonics
                let bell = Math.sin(2 * Math.PI * freq * t) * 0.2;
                bell += Math.sin(2 * Math.PI * freq * 2.0 * t) * 0.1;
                bell += Math.sin(2 * Math.PI * freq * 3.0 * t) * 0.05;
                bell += Math.sin(2 * Math.PI * freq * 4.2 * t) * 0.03;

                const env = Math.exp(-t * 2);
                const pan = Math.sin(n * 0.7) * 0.4;

                leftData[startSample + i] += bell * env * (0.5 - pan);
                rightData[startSample + i] += bell * env * (0.5 + pan);
            }
        }

        // Shimmering background pad
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const shimmer = Math.sin(2 * Math.PI * 262 * t) * 0.05;
            const shimmer2 = Math.sin(2 * Math.PI * 330 * t) * 0.04;
            const shimmer3 = Math.sin(2 * Math.PI * 392 * t) * 0.03;
            const mod = (Math.sin(t * 0.5) + 1) * 0.5;

            leftData[i] += (shimmer + shimmer2 + shimmer3) * mod;
            rightData[i] += (shimmer + shimmer2 + shimmer3) * mod;
        }

        this.normalizeBuffer(leftData, rightData, length);
        return buffer;
    },

    /**
     * Generate ancient halls music - organ and choir
     */
    generateAncientMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 24;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        // Organ chords
        const chords = [
            [130, 164, 196],
            [146, 174, 220],
            [164, 196, 246],
            [130, 164, 196]
        ];

        for (let c = 0; c < 4; c++) {
            const chord = chords[c];
            const startSample = Math.floor(c * 6 * sampleRate);

            for (let i = 0; i < 6 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                let organ = 0;

                for (const freq of chord) {
                    // Organ drawbars simulation
                    organ += Math.sin(2 * Math.PI * freq * t) * 0.1;
                    organ += Math.sin(2 * Math.PI * freq * 2 * t) * 0.08;
                    organ += Math.sin(2 * Math.PI * freq * 3 * t) * 0.06;
                    organ += Math.sin(2 * Math.PI * freq * 4 * t) * 0.04;
                }

                let env = 1;
                if (t < 0.5) env = t / 0.5;
                if (t > 5.5) env = (6 - t) / 0.5;

                leftData[startSample + i] += organ * env * 0.4;
                rightData[startSample + i] += organ * env * 0.4;
            }
        }

        // Choir-like pad (vowel sounds)
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const choirFreq = 220 + Math.sin(t * 0.1) * 20;
            let choir = Math.sin(2 * Math.PI * choirFreq * t) * 0.06;
            choir += Math.sin(2 * Math.PI * choirFreq * 2 * t) * 0.03;
            const vibrato = Math.sin(t * 5) * 0.02;
            choir *= (1 + vibrato);

            leftData[i] += choir;
            rightData[i] += choir;
        }

        this.normalizeBuffer(leftData, rightData, length);
        return buffer;
    },

    /**
     * Generate swamp music - eerie but slightly upbeat
     */
    generateSwampMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 20;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        const tempo = 95; // Slightly upbeat tempo
        const beatDur = 60 / tempo;

        // Steady driving beat - sense of progress
        for (let beat = 0; beat < Math.floor(duration / beatDur); beat++) {
            const startSample = Math.floor(beat * beatDur * sampleRate);

            // Kick on 1 and 3
            if (beat % 4 === 0 || beat % 4 === 2) {
                for (let i = 0; i < 0.1 * sampleRate && (startSample + i) < length; i++) {
                    const t = i / sampleRate;
                    const kick = Math.sin(2 * Math.PI * 55 * Math.exp(-t * 20) * t) * 0.4;
                    leftData[startSample + i] += kick * Math.exp(-t * 12);
                    rightData[startSample + i] += kick * Math.exp(-t * 12);
                }
            }

            // Offbeat hi-hat for groove
            if (beat % 2 === 1) {
                for (let i = 0; i < 0.03 * sampleRate && (startSample + i) < length; i++) {
                    const t = i / sampleRate;
                    const hat = (Math.random() * 2 - 1) * 0.12;
                    leftData[startSample + i] += hat * Math.exp(-t * 40);
                    rightData[startSample + i] += hat * Math.exp(-t * 40);
                }
            }
        }

        // Eerie minor key melody with hopeful undertones
        const melody = [196, 220, 233, 262, 247, 220, 196, 175, 196, 233, 262, 294, 262, 233, 220, 196];
        const noteInterval = beatDur;

        for (let n = 0; n < Math.floor(duration / noteInterval); n++) {
            const freq = melody[n % melody.length];
            const startSample = Math.floor(n * noteInterval * sampleRate);

            for (let i = 0; i < noteInterval * 0.8 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Slightly detuned for eerie feel
                let note = Math.sin(2 * Math.PI * freq * t) * 0.18;
                note += Math.sin(2 * Math.PI * freq * 1.005 * t) * 0.1;
                note += Math.sin(2 * Math.PI * freq * 2 * t) * 0.06;

                let env = 1;
                if (t < 0.02) env = t / 0.02;
                env *= Math.exp(-t * 4);

                const pan = Math.sin(n * 0.4) * 0.2;
                leftData[startSample + i] += note * env * (0.5 - pan);
                rightData[startSample + i] += note * env * (0.5 + pan);
            }
        }

        // Mysterious low pad
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const pad = Math.sin(2 * Math.PI * 65 * t) * 0.1;
            const pad2 = Math.sin(2 * Math.PI * 98 * t) * 0.07;
            const mod = 0.7 + Math.sin(t * 0.3) * 0.3;

            leftData[i] += (pad + pad2) * mod;
            rightData[i] += (pad + pad2) * mod;
        }

        // Occasional eerie whistle/wind
        for (let w = 0; w < 6; w++) {
            const startTime = w * 3 + 1;
            const startSample = Math.floor(startTime * sampleRate);

            for (let i = 0; i < 1.5 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const whistleFreq = 600 + Math.sin(t * 3) * 100;
                const whistle = Math.sin(2 * Math.PI * whistleFreq * t) * 0.05;
                const env = Math.sin(Math.PI * t / 1.5);

                leftData[startSample + i] += whistle * env * (0.3 + Math.sin(t) * 0.2);
                rightData[startSample + i] += whistle * env * (0.3 - Math.sin(t) * 0.2);
            }
        }

        this.normalizeBuffer(leftData, rightData, length);
        return buffer;
    },

    /**
     * Generate core music - electronic synth
     */
    generateCoreMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 16;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        const tempo = 128;
        const beatDur = 60 / tempo;

        // Four on the floor kick
        for (let beat = 0; beat < Math.floor(duration / beatDur); beat++) {
            const startSample = Math.floor(beat * beatDur * sampleRate);
            for (let i = 0; i < 0.1 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const kick = Math.sin(2 * Math.PI * 60 * Math.exp(-t * 20) * t) * 0.3;
                leftData[startSample + i] += kick * Math.exp(-t * 15);
                rightData[startSample + i] += kick * Math.exp(-t * 15);
            }
        }

        // Synth arpeggio
        const arpNotes = [220, 277, 330, 440, 330, 277, 220, 165];
        const arpInterval = beatDur / 2;

        for (let n = 0; n < Math.floor(duration / arpInterval); n++) {
            const freq = arpNotes[n % arpNotes.length];
            const startSample = Math.floor(n * arpInterval * sampleRate);

            for (let i = 0; i < arpInterval * 0.8 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Saw wave synth
                let saw = ((t * freq % 1) * 2 - 1) * 0.12;
                // Filter sweep
                const filterMod = 0.5 + Math.sin(n * 0.3) * 0.3;
                saw *= filterMod;

                const env = Math.exp(-t * 6);
                const pan = (n % 2 === 0) ? -0.3 : 0.3;

                leftData[startSample + i] += saw * env * (0.5 - pan);
                rightData[startSample + i] += saw * env * (0.5 + pan);
            }
        }

        // Sub bass
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const sub = Math.sin(2 * Math.PI * 55 * t) * 0.1;
            leftData[i] += sub;
            rightData[i] += sub;
        }

        this.normalizeBuffer(leftData, rightData, length);
        return buffer;
    },

    /**
     * Generate shop music - cheerful piano
     */
    generateShopMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 16;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        const tempo = 120;
        const beatDur = 60 / tempo;

        // Piano melody
        const melody = [392, 440, 494, 523, 494, 440, 392, 330, 349, 392, 440, 392, 349, 330, 294, 330];

        for (let n = 0; n < melody.length * 2; n++) {
            const freq = melody[n % melody.length];
            const startSample = Math.floor(n * beatDur * sampleRate);

            for (let i = 0; i < beatDur * 1.5 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Piano-like tone (sine with harmonics and quick decay)
                let piano = Math.sin(2 * Math.PI * freq * t) * 0.2;
                piano += Math.sin(2 * Math.PI * freq * 2 * t) * 0.08;
                piano += Math.sin(2 * Math.PI * freq * 3 * t) * 0.04;
                piano += Math.sin(2 * Math.PI * freq * 4 * t) * 0.02;

                const env = Math.exp(-t * 3);
                leftData[startSample + i] += piano * env;
                rightData[startSample + i] += piano * env;
            }
        }

        // Bass notes
        const bassNotes = [196, 220, 247, 262, 247, 220, 196, 165];
        for (let n = 0; n < Math.floor(duration / (beatDur * 2)); n++) {
            const freq = bassNotes[n % bassNotes.length];
            const startSample = Math.floor(n * beatDur * 2 * sampleRate);

            for (let i = 0; i < beatDur * 1.8 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const bass = Math.sin(2 * Math.PI * freq * t) * 0.12;
                const env = Math.exp(-t * 2);
                leftData[startSample + i] += bass * env;
                rightData[startSample + i] += bass * env;
            }
        }

        this.normalizeBuffer(leftData, rightData, length);
        return buffer;
    },

    /**
     * Generate battle music - aggressive drums and strings
     */
    generateBattleMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 12;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        const tempo = 160;
        const beatDur = 60 / tempo;

        // Fast aggressive drums
        for (let beat = 0; beat < Math.floor(duration / beatDur); beat++) {
            const startSample = Math.floor(beat * beatDur * sampleRate);

            // Kick on 1 and 3
            if (beat % 4 === 0 || beat % 4 === 2) {
                for (let i = 0; i < 0.08 * sampleRate && (startSample + i) < length; i++) {
                    const t = i / sampleRate;
                    const kick = Math.sin(2 * Math.PI * 80 * Math.exp(-t * 25) * t) * 0.35;
                    leftData[startSample + i] += kick * Math.exp(-t * 12);
                    rightData[startSample + i] += kick * Math.exp(-t * 12);
                }
            }

            // Snare on 2 and 4
            if (beat % 4 === 1 || beat % 4 === 3) {
                for (let i = 0; i < 0.1 * sampleRate && (startSample + i) < length; i++) {
                    const t = i / sampleRate;
                    const snare = (Math.random() * 2 - 1) * 0.2 + Math.sin(2 * Math.PI * 200 * t) * 0.1;
                    leftData[startSample + i] += snare * Math.exp(-t * 15);
                    rightData[startSample + i] += snare * Math.exp(-t * 15);
                }
            }

            // Hi-hat
            for (let i = 0; i < 0.03 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const hat = (Math.random() * 2 - 1) * 0.08;
                leftData[startSample + i] += hat * Math.exp(-t * 50);
                rightData[startSample + i] += hat * Math.exp(-t * 50);
            }
        }

        // Aggressive string stabs
        const stringNotes = [220, 196, 185, 174, 196, 220, 247, 220];
        for (let n = 0; n < Math.floor(duration / (beatDur * 2)); n++) {
            const freq = stringNotes[n % stringNotes.length];
            const startSample = Math.floor(n * beatDur * 2 * sampleRate);

            for (let i = 0; i < beatDur * 1.5 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Saw strings
                let strings = ((t * freq % 1) * 2 - 1) * 0.12;
                strings += ((t * freq * 1.5 % 1) * 2 - 1) * 0.08;
                strings += ((t * freq * 2 % 1) * 2 - 1) * 0.05;

                let env = Math.exp(-t * 4);
                if (t < 0.02) env *= t / 0.02;

                leftData[startSample + i] += strings * env;
                rightData[startSample + i] += strings * env;
            }
        }

        this.normalizeBuffer(leftData, rightData, length);
        return buffer;
    },

    /**
     * Generate Mega Boss music - Techno like Pigstep
     */
    generateMegaBossMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 20;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        const tempo = 125; // Pigstep-like tempo
        const beatDur = 60 / tempo;

        // Heavy kick with sidechain feel
        for (let beat = 0; beat < Math.floor(duration / beatDur); beat++) {
            const startSample = Math.floor(beat * beatDur * sampleRate);

            for (let i = 0; i < 0.15 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const kickFreq = 55 + 100 * Math.exp(-t * 40);
                const kick = Math.sin(2 * Math.PI * kickFreq * t) * 0.45;
                const env = Math.exp(-t * 10);

                leftData[startSample + i] += kick * env;
                rightData[startSample + i] += kick * env;
            }
        }

        // Snappy snare on 2 and 4
        for (let beat = 0; beat < Math.floor(duration / beatDur); beat++) {
            if (beat % 4 !== 2) continue;
            const startSample = Math.floor(beat * beatDur * sampleRate);

            for (let i = 0; i < 0.12 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const snare = (Math.random() * 2 - 1) * 0.25;
                const tone = Math.sin(2 * Math.PI * 180 * t) * 0.15;
                leftData[startSample + i] += (snare + tone) * Math.exp(-t * 18);
                rightData[startSample + i] += (snare + tone) * Math.exp(-t * 18);
            }
        }

        // Syncopated hi-hats
        const hatPattern = [1, 0, 1, 1, 0, 1, 1, 0];
        for (let beat = 0; beat < Math.floor(duration / (beatDur / 2)); beat++) {
            if (hatPattern[beat % hatPattern.length] === 0) continue;
            const startSample = Math.floor(beat * (beatDur / 2) * sampleRate);

            for (let i = 0; i < 0.04 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const hat = (Math.random() * 2 - 1) * 0.12;
                leftData[startSample + i] += hat * Math.exp(-t * 60);
                rightData[startSample + i] += hat * Math.exp(-t * 60);
            }
        }

        // Growling bass synth (like Pigstep)
        const bassPattern = [55, 0, 55, 62, 0, 55, 0, 49, 55, 0, 62, 55, 0, 49, 0, 55];
        for (let n = 0; n < Math.floor(duration / (beatDur / 2)); n++) {
            const freq = bassPattern[n % bassPattern.length];
            if (freq === 0) continue;

            const startSample = Math.floor(n * (beatDur / 2) * sampleRate);
            const noteLen = Math.floor((beatDur / 2) * 0.9 * sampleRate);

            for (let i = 0; i < noteLen && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Distorted growling bass
                let bass = Math.sin(2 * Math.PI * freq * t);
                bass += Math.sin(2 * Math.PI * freq * 2 * t) * 0.5;
                bass = Math.tanh(bass * 3) * 0.2; // Heavy distortion

                let env = 1;
                if (t < 0.01) env = t / 0.01;
                if (t > (beatDur / 2) * 0.7) env = ((beatDur / 2) * 0.9 - t) / ((beatDur / 2) * 0.2);

                leftData[startSample + i] += bass * env;
                rightData[startSample + i] += bass * env;
            }
        }

        // Catchy synth melody
        const melody = [440, 0, 523, 440, 0, 392, 440, 0, 523, 587, 523, 440, 0, 392, 349, 392];
        for (let n = 0; n < Math.floor(duration / (beatDur / 2)); n++) {
            const freq = melody[n % melody.length];
            if (freq === 0) continue;

            const startSample = Math.floor(n * (beatDur / 2) * sampleRate);
            const noteLen = Math.floor((beatDur / 2) * 0.85 * sampleRate);

            for (let i = 0; i < noteLen && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Square lead with portamento feel
                let lead = (Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1) * 0.1;
                lead += (Math.sin(2 * Math.PI * freq * 2 * t) > 0 ? 1 : -1) * 0.05;

                let env = 1;
                if (t < 0.01) env = t / 0.01;
                env *= Math.exp(-t * 3);

                const pan = Math.sin(n * 0.5) * 0.3;
                leftData[startSample + i] += lead * env * (0.5 - pan);
                rightData[startSample + i] += lead * env * (0.5 + pan);
            }
        }

        // Rising FX sweeps
        for (let sweep = 0; sweep < 5; sweep++) {
            const startSample = Math.floor(sweep * 4 * sampleRate);
            for (let i = 0; i < 3.5 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const progress = t / 3.5;
                const sweepFreq = 100 + progress * progress * 2000;
                const sweepSound = Math.sin(2 * Math.PI * sweepFreq * t) * 0.04 * progress;

                leftData[startSample + i] += sweepSound;
                rightData[startSample + i] += sweepSound;
            }
        }

        this.normalizeBuffer(leftData, rightData, length);
        return buffer;
    },

    /**
     * Generate title music - Orchestral
     */
    generateTitleMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 24;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        // Epic string section
        const chordProg = [
            [196, 247, 294],
            [220, 277, 330],
            [185, 233, 277],
            [196, 247, 294]
        ];

        for (let c = 0; c < chordProg.length; c++) {
            const chord = chordProg[c];
            const startSample = Math.floor(c * 6 * sampleRate);

            for (let i = 0; i < 6 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                let strings = 0;

                for (const freq of chord) {
                    // Layered saw waves for strings
                    strings += ((t * freq % 1) * 2 - 1) * 0.08;
                    strings += ((t * freq * 1.002 % 1) * 2 - 1) * 0.06;
                    strings += ((t * freq * 0.998 % 1) * 2 - 1) * 0.06;
                }

                // Vibrato
                strings *= 1 + Math.sin(t * 5) * 0.02;

                let env = 1;
                if (t < 1) env = t;
                if (t > 5) env = 6 - t;

                leftData[startSample + i] += strings * env * 0.5;
                rightData[startSample + i] += strings * env * 0.5;
            }
        }

        // Timpani hits
        const timpaniBeats = [0, 6, 12, 18];
        for (const beat of timpaniBeats) {
            const startSample = Math.floor(beat * sampleRate);
            for (let i = 0; i < 1.5 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const timpani = Math.sin(2 * Math.PI * 65 * t) * 0.25;
                const env = Math.exp(-t * 3);

                leftData[startSample + i] += timpani * env;
                rightData[startSample + i] += timpani * env;
            }
        }

        // French horn melody
        const hornMelody = [294, 330, 392, 440, 392, 330, 294, 247];
        for (let n = 0; n < hornMelody.length; n++) {
            const freq = hornMelody[n];
            const startSample = Math.floor((n * 3 + 1.5) * sampleRate);

            for (let i = 0; i < 2.5 * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Warm horn sound
                let horn = Math.sin(2 * Math.PI * freq * t) * 0.12;
                horn += Math.sin(2 * Math.PI * freq * 2 * t) * 0.06;
                horn += Math.sin(2 * Math.PI * freq * 3 * t) * 0.03;
                horn *= 1 + Math.sin(t * 4) * 0.03; // Vibrato

                let env = 1;
                if (t < 0.1) env = t / 0.1;
                if (t > 2) env = (2.5 - t) / 0.5;

                leftData[startSample + i] += horn * env;
                rightData[startSample + i] += horn * env;
            }
        }

        this.normalizeBuffer(leftData, rightData, length);
        return buffer;
    },

    /**
     * Helper to normalize audio buffer
     */
    normalizeBuffer(leftData, rightData, length) {
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
    },

    /**
     * Generate tense boss battle music
     */
    generateBossMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 16;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        // Initialize
        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        const tempo = 150;
        const beatDuration = 60 / tempo;

        // Layer 1: Driving bass drum on every beat
        for (let beat = 0; beat < Math.floor(duration / beatDuration); beat++) {
            const startSample = Math.floor(beat * beatDuration * sampleRate);
            const kickLen = Math.floor(0.1 * sampleRate);

            for (let i = 0; i < kickLen && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Pitch dropping kick drum
                const kickFreq = 150 * Math.exp(-t * 30);
                const kick = Math.sin(2 * Math.PI * kickFreq * t) * 0.4;
                const env = Math.exp(-t * 15);

                leftData[startSample + i] += kick * env;
                rightData[startSample + i] += kick * env;
            }
        }

        // Layer 2: Aggressive bass line
        const bassNotes = [55, 55, 65, 55, 73, 55, 65, 49];
        const bassNoteDur = beatDuration * 2;

        for (let n = 0; n < Math.floor(duration / bassNoteDur); n++) {
            const freq = bassNotes[n % bassNotes.length];
            const startSample = Math.floor(n * bassNoteDur * sampleRate);
            const noteLen = Math.floor(bassNoteDur * 0.9 * sampleRate);

            for (let i = 0; i < noteLen && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Distorted bass
                let bass = Math.sin(2 * Math.PI * freq * t);
                bass = Math.tanh(bass * 2) * 0.2; // Soft clip for grit

                let env = 1;
                if (t < 0.02) env = t / 0.02;
                if (t > bassNoteDur * 0.9 - 0.1) env = (bassNoteDur * 0.9 - t) / 0.1;
                env = Math.max(0, env);

                leftData[startSample + i] += bass * env;
                rightData[startSample + i] += bass * env;
            }
        }

        // Layer 3: Tense staccato strings/synth
        const melodyNotes = [220, 207, 196, 185, 196, 207, 220, 261, 247, 220, 196, 185, 174, 185, 196, 220];
        const notePerBeat = beatDuration * 0.5;

        for (let n = 0; n < Math.floor(duration / notePerBeat); n++) {
            const freq = melodyNotes[n % melodyNotes.length];
            const startSample = Math.floor(n * notePerBeat * sampleRate);
            const noteLen = Math.floor(notePerBeat * 0.7 * sampleRate);

            for (let i = 0; i < noteLen && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Sharp sawtooth
                let saw = ((t * freq % 1) * 2 - 1) * 0.15;
                saw += ((t * freq * 1.002 % 1) * 2 - 1) * 0.1; // Slight detune

                // Quick attack and decay
                let env = 1;
                if (t < 0.01) env = t / 0.01;
                env *= Math.exp(-t * 8);

                const pan = Math.sin(n * 0.5) * 0.3;
                leftData[startSample + i] += saw * env * (0.5 - pan);
                rightData[startSample + i] += saw * env * (0.5 + pan);
            }
        }

        // Layer 4: Rising tension sweeps
        for (let sweep = 0; sweep < 4; sweep++) {
            const startTime = sweep * 4;
            const startSample = Math.floor(startTime * sampleRate);
            const sweepLen = Math.floor(3.5 * sampleRate);

            for (let i = 0; i < sweepLen && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                const progress = t / 3.5;
                // Rising frequency
                const sweepFreq = 200 + progress * 600;
                const sweepSound = Math.sin(2 * Math.PI * sweepFreq * t) * 0.08;
                const env = progress * 0.8; // Gets louder

                leftData[startSample + i] += sweepSound * env;
                rightData[startSample + i] += sweepSound * env;
            }
        }

        // Layer 5: Cymbal/hi-hat on off-beats
        for (let beat = 0; beat < Math.floor(duration / beatDuration); beat++) {
            const startSample = Math.floor((beat + 0.5) * beatDuration * sampleRate);
            const hatLen = Math.floor(0.05 * sampleRate);

            for (let i = 0; i < hatLen && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Noise-based hi-hat
                const hat = (Math.random() * 2 - 1) * 0.15;
                const env = Math.exp(-t * 40);

                leftData[startSample + i] += hat * env;
                rightData[startSample + i] += hat * env;
            }
        }

        // Normalize
        let maxVal = 0;
        for (let i = 0; i < length; i++) {
            maxVal = Math.max(maxVal, Math.abs(leftData[i]), Math.abs(rightData[i]));
        }
        if (maxVal > 0.85) {
            const scale = 0.85 / maxVal;
            for (let i = 0; i < length; i++) {
                leftData[i] *= scale;
                rightData[i] *= scale;
            }
        }

        return buffer;
    },

    /**
     * Generate eerie music - dark ambient style
     */
    generateEerieMusic() {
        const sampleRate = this.context.sampleRate;
        const duration = 24;
        const length = duration * sampleRate;
        const buffer = this.context.createBuffer(2, length, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        // Initialize with silence
        for (let i = 0; i < length; i++) {
            leftData[i] = 0;
            rightData[i] = 0;
        }

        // Dark pad - slow moving chords
        const chordNotes = [
            [82, 110, 146],   // Dark minor
            [77, 103, 138],   // Lower
            [73, 98, 130],    // Even lower
            [82, 103, 146]    // Back up, dissonant
        ];
        const chordDuration = 6;

        for (let c = 0; c < 4; c++) {
            const chord = chordNotes[c];
            const startSample = Math.floor(c * chordDuration * sampleRate);

            for (let i = 0; i < chordDuration * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                let sample = 0;

                // Each note in chord
                for (const freq of chord) {
                    // Soft sine with slight vibrato
                    const vibrato = 1 + Math.sin(t * 3) * 0.008;
                    sample += Math.sin(2 * Math.PI * freq * vibrato * t) * 0.1;
                }

                // Slow fade in/out
                let env = 1;
                if (t < 1.5) env = t / 1.5;
                if (t > chordDuration - 1.5) env = (chordDuration - t) / 1.5;
                env = Math.max(0, Math.min(1, env));

                const idx = startSample + i;
                leftData[idx] += sample * env * 0.5;
                rightData[idx] += sample * env * 0.5;
            }
        }

        // Sparse high notes - like distant bells
        const bellTimes = [2, 7, 11, 16, 21];
        const bellNotes = [523, 466, 392, 349, 523];

        for (let b = 0; b < bellTimes.length; b++) {
            const startSample = Math.floor(bellTimes[b] * sampleRate);
            const bellDuration = 3;
            const freq = bellNotes[b];

            for (let i = 0; i < bellDuration * sampleRate && (startSample + i) < length; i++) {
                const t = i / sampleRate;
                // Bell-like tone
                let bell = Math.sin(2 * Math.PI * freq * t) * 0.15;
                bell += Math.sin(2 * Math.PI * freq * 2 * t) * 0.05;
                bell += Math.sin(2 * Math.PI * freq * 3 * t) * 0.02;

                // Quick attack, long decay
                const env = Math.exp(-t * 1.2);

                const idx = startSample + i;
                // Slight stereo spread
                leftData[idx] += bell * env * (0.6 + Math.sin(t) * 0.2);
                rightData[idx] += bell * env * (0.6 - Math.sin(t) * 0.2);
            }
        }

        // Subtle low rumble
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const rumble = Math.sin(2 * Math.PI * 35 * t) * 0.06;
            const rumbleEnv = 0.5 + Math.sin(t * 0.2) * 0.3;
            leftData[i] += rumble * rumbleEnv;
            rightData[i] += rumble * rumbleEnv;
        }

        // Normalize
        let maxVal = 0;
        for (let i = 0; i < length; i++) {
            maxVal = Math.max(maxVal, Math.abs(leftData[i]), Math.abs(rightData[i]));
        }
        if (maxVal > 0.7) {
            const scale = 0.7 / maxVal;
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
        if (roomId.startsWith('core') || roomId.startsWith('final') || roomId.startsWith('hall')) {
            return 'music_core';
        }
        if (roomId.startsWith('mega')) {
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
