/**
 * Bullet patterns and spawning system
 */
const Bullets = {
    // Active bullets
    bullets: [],

    // Pattern queue
    patternQueue: [],
    currentPattern: null,
    patternTimer: 0,

    // Pattern definitions
    patterns: {},

    /**
     * Initialize bullet system
     */
    init() {
        this.bullets = [];
        this.patternQueue = [];
        this.currentPattern = null;
        this.patternTimer = 0;
        this.definePatterns();
    },

    /**
     * Define all bullet patterns
     */
    definePatterns() {
        // ==================== BASIC PATTERNS ====================

        this.patterns['dummy_basic'] = {
            duration: 3,
            spawners: [
                {
                    type: 'single',
                    delay: 0.5,
                    interval: 0.8,
                    bullet: { type: 'circle', speed: 40, size: 6, color: '#fff' },
                    position: 'random_top'
                }
            ]
        };

        this.patterns['spider_basic'] = {
            duration: 4,
            spawners: [
                {
                    type: 'spread',
                    delay: 0,
                    interval: 1,
                    count: 3,
                    angle: 90,
                    spread: 30,
                    bullet: { type: 'circle', speed: 60, size: 5, color: '#fff' },
                    position: 'top_center'
                }
            ]
        };

        this.patterns['spider_web'] = {
            duration: 5,
            spawners: [
                {
                    type: 'line',
                    delay: 0,
                    interval: 0.3,
                    bullet: { type: 'circle', speed: 0, size: 4, color: '#fff', lifetime: 2 },
                    startX: 90, startY: 130,
                    endX: 230, endY: 130,
                    count: 8
                },
                {
                    type: 'line',
                    delay: 1.5,
                    interval: 0.3,
                    bullet: { type: 'circle', speed: 0, size: 4, color: '#fff', lifetime: 2 },
                    startX: 90, startY: 200,
                    endX: 230, endY: 200,
                    count: 8
                }
            ]
        };

        this.patterns['rock_basic'] = {
            duration: 4,
            spawners: [
                {
                    type: 'aimed',
                    delay: 0.5,
                    interval: 1.2,
                    bullet: { type: 'circle', speed: 50, size: 8, color: '#888' },
                    position: 'random_edge'
                }
            ]
        };

        this.patterns['rock_roll'] = {
            duration: 5,
            spawners: [
                {
                    type: 'custom',
                    delay: 0,
                    action: (bullets, time) => {
                        // Rolling rocks from sides
                        if (Math.floor(time * 2) % 2 === 0 && time > 0.5) {
                            const fromLeft = Math.random() > 0.5;
                            bullets.spawn({
                                x: fromLeft ? 90 : 230,
                                y: 200,
                                vx: fromLeft ? 60 : -60,
                                vy: 0,
                                type: 'circle',
                                size: 10,
                                color: '#666'
                            });
                        }
                    }
                }
            ]
        };

        // ==================== CRYSTAL CAVERN PATTERNS ====================

        this.patterns['bat_swoop'] = {
            duration: 4,
            spawners: [
                {
                    type: 'wave',
                    delay: 0,
                    interval: 0.15,
                    count: 20,
                    bullet: { type: 'circle', speed: 80, size: 4, color: '#88f' },
                    startAngle: 180,
                    endAngle: 360,
                    position: 'top_center'
                }
            ]
        };

        this.patterns['bat_crystals'] = {
            duration: 5,
            spawners: [
                {
                    type: 'ring',
                    delay: 0.5,
                    interval: 1.5,
                    count: 8,
                    bullet: { type: 'diamond', speed: 45, size: 6, color: '#aaf' },
                    position: 'center'
                }
            ]
        };

        this.patterns['mushroom_spores'] = {
            duration: 5,
            spawners: [
                {
                    type: 'rain',
                    delay: 0,
                    interval: 0.2,
                    bullet: { type: 'circle', speed: 30, size: 3, color: '#8f8', gravity: 20 },
                    variance: 0.5
                }
            ]
        };

        this.patterns['mushroom_bounce'] = {
            duration: 4,
            spawners: [
                {
                    type: 'bouncy',
                    delay: 0,
                    interval: 0.8,
                    bullet: { type: 'circle', speed: 70, size: 5, color: '#8f8', bounces: 2 },
                    position: 'random_edge'
                }
            ]
        };

        // ==================== SWAMP CREATURE PATTERNS ====================

        this.patterns['swamp_bubbles'] = {
            duration: 4,
            spawners: [
                {
                    type: 'burst',
                    delay: 0.5,
                    interval: 0.6,
                    count: 5,
                    bullet: { type: 'circle', speed: 45, size: 8, color: '#4a6' },
                    position: 'random_bottom'
                }
            ]
        };

        this.patterns['swamp_tentacles'] = {
            duration: 5,
            spawners: [
                {
                    type: 'wave',
                    delay: 0.3,
                    interval: 0.4,
                    bullet: { type: 'rectangle', speed: 50, width: 8, height: 20, color: '#363' },
                    position: 'bottom_sweep',
                    amplitude: 30
                }
            ]
        };

        // ==================== CRYSTAL GUARDIAN PATTERNS ====================

        this.patterns['guardian_crystals'] = {
            duration: 5,
            spawners: [
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.1,
                    bullet: { type: 'diamond', speed: 55, size: 6, color: '#f8f' },
                    rotationSpeed: 120,
                    position: 'center'
                }
            ]
        };

        this.patterns['guardian_beam'] = {
            duration: 4,
            spawners: [
                {
                    type: 'laser',
                    delay: 1,
                    duration: 2,
                    width: 20,
                    color: '#f0f',
                    position: 'vertical_sweep'
                }
            ]
        };

        this.patterns['guardian_storm'] = {
            duration: 6,
            spawners: [
                {
                    type: 'ring',
                    delay: 0,
                    interval: 0.8,
                    count: 12,
                    bullet: { type: 'diamond', speed: 60, size: 5, color: '#faf' },
                    position: 'center'
                },
                {
                    type: 'ring',
                    delay: 0.4,
                    interval: 0.8,
                    count: 12,
                    bullet: { type: 'diamond', speed: 60, size: 5, color: '#faf' },
                    position: 'center',
                    angleOffset: 15
                }
            ]
        };

        this.patterns['guardian_ultimate'] = {
            duration: 8,
            spawners: [
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.05,
                    bullet: { type: 'diamond', speed: 50, size: 5, color: '#f0f' },
                    rotationSpeed: 200,
                    position: 'center'
                },
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.05,
                    bullet: { type: 'diamond', speed: 50, size: 5, color: '#f0f' },
                    rotationSpeed: -200,
                    position: 'center'
                }
            ]
        };

        // ==================== ANCIENT HALL PATTERNS ====================

        this.patterns['spirit_wisps'] = {
            duration: 3,
            spawners: [
                {
                    type: 'homing',
                    delay: 0.1,
                    interval: 0.4,
                    bullet: { type: 'circle', speed: 80, size: 5, color: '#8ff', homing: 0.8 },
                    position: 'random_edge'
                },
                {
                    type: 'spread',
                    delay: 0.2,
                    interval: 0.5,
                    count: 3,
                    angle: 90,
                    spread: 40,
                    bullet: { type: 'circle', speed: 70, size: 4, color: '#aff' },
                    position: 'random_top'
                }
            ]
        };

        this.patterns['spirit_wail'] = {
            duration: 3,
            spawners: [
                {
                    type: 'ring',
                    delay: 0,
                    interval: 0.6,
                    count: 8,
                    bullet: { type: 'circle', speed: 65, size: 5, color: '#8ff' },
                    position: 'center'
                },
                {
                    type: 'aimed',
                    delay: 0.3,
                    interval: 0.4,
                    bullet: { type: 'circle', speed: 75, size: 5, color: '#aff' },
                    position: 'random_edge'
                }
            ]
        };

        // ==================== FINAL BOSS PATTERNS ====================

        this.patterns['keeper_orbs'] = {
            duration: 5,
            spawners: [
                {
                    type: 'aimed',
                    delay: 0,
                    interval: 0.4,
                    bullet: { type: 'circle', speed: 70, size: 8, color: '#ff8' },
                    position: 'top_center'
                },
                {
                    type: 'spread',
                    delay: 2,
                    interval: 1.5,
                    count: 5,
                    angle: 90,
                    spread: 60,
                    bullet: { type: 'circle', speed: 55, size: 6, color: '#ff8' },
                    position: 'top_center'
                }
            ]
        };

        this.patterns['keeper_sweep'] = {
            duration: 6,
            spawners: [
                {
                    type: 'laser',
                    delay: 0.5,
                    duration: 2,
                    width: 15,
                    color: '#ff0',
                    position: 'horizontal_sweep'
                },
                {
                    type: 'laser',
                    delay: 3,
                    duration: 2,
                    width: 15,
                    color: '#ff0',
                    position: 'vertical_sweep'
                }
            ]
        };

        this.patterns['keeper_storm'] = {
            duration: 7,
            spawners: [
                {
                    type: 'ring',
                    delay: 2,
                    interval: 1,
                    count: 16,
                    bullet: { type: 'circle', speed: 50, size: 5, color: '#fa0' },
                    position: 'center'
                }
            ]
        };

        this.patterns['keeper_ultimate'] = {
            duration: 10,
            spawners: [
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.08,
                    bullet: { type: 'circle', speed: 45, size: 5, color: '#ff0' },
                    rotationSpeed: 150,
                    position: 'center'
                },
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.08,
                    bullet: { type: 'circle', speed: 45, size: 5, color: '#fa0' },
                    rotationSpeed: -150,
                    position: 'center'
                },
                {
                    type: 'aimed',
                    delay: 2,
                    interval: 0.6,
                    bullet: { type: 'circle', speed: 60, size: 8, color: '#f00' },
                    position: 'random_edge'
                }
            ]
        };

        this.patterns['keeper_desperation'] = {
            duration: 8,
            spawners: [
                {
                    type: 'ring',
                    delay: 0,
                    interval: 0.5,
                    count: 20,
                    bullet: { type: 'circle', speed: 60, size: 4, color: '#f00' },
                    position: 'center'
                }
            ]
        };

        // ==================== MEGA BOSS PATTERNS ====================

        this.patterns['mega_laser'] = {
            duration: 5,
            spawners: [
                {
                    type: 'spread',
                    delay: 0,
                    interval: 0.3,
                    count: 7,
                    angle: 90,
                    spread: 90,
                    bullet: { type: 'circle', speed: 100, size: 6, color: '#f00' },
                    position: 'top_center'
                },
                {
                    type: 'spread',
                    delay: 1.5,
                    interval: 0.3,
                    count: 7,
                    angle: 90,
                    spread: 90,
                    bullet: { type: 'circle', speed: 100, size: 6, color: '#0ff' },
                    position: 'top_center'
                }
            ]
        };

        this.patterns['mega_missiles'] = {
            duration: 6,
            spawners: [
                {
                    type: 'spread',
                    delay: 0,
                    interval: 0.4,
                    count: 5,
                    angle: 90,
                    spread: 60,
                    bullet: { type: 'diamond', speed: 120, size: 6, color: '#f80' },
                    position: 'top_center'
                },
                {
                    type: 'spread',
                    delay: 0.2,
                    interval: 0.4,
                    count: 5,
                    angle: 90,
                    spread: 60,
                    bullet: { type: 'diamond', speed: 120, size: 6, color: '#08f' },
                    position: 'top_center'
                }
            ]
        };

        this.patterns['mega_storm'] = {
            duration: 7,
            spawners: [
                {
                    type: 'ring',
                    delay: 0,
                    interval: 0.4,
                    count: 24,
                    bullet: { type: 'circle', speed: 70, size: 5, color: '#f0f' },
                    position: 'center'
                },
                {
                    type: 'ring',
                    delay: 0.2,
                    interval: 0.4,
                    count: 24,
                    bullet: { type: 'circle', speed: 70, size: 5, color: '#0ff' },
                    position: 'center',
                    angleOffset: 7.5
                },
                {
                    type: 'rain',
                    delay: 3,
                    interval: 0.08,
                    bullet: { type: 'circle', speed: 90, size: 4, color: '#ff0' },
                    variance: 0.4
                }
            ]
        };

        this.patterns['mega_ultimate'] = {
            duration: 10,
            spawners: [
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.04,
                    bullet: { type: 'diamond', speed: 55, size: 6, color: '#f00' },
                    rotationSpeed: 250,
                    position: 'center'
                },
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.04,
                    bullet: { type: 'diamond', speed: 55, size: 6, color: '#0f0' },
                    rotationSpeed: -250,
                    position: 'center'
                },
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.06,
                    bullet: { type: 'circle', speed: 45, size: 5, color: '#00f' },
                    rotationSpeed: 180,
                    position: 'center'
                },
                {
                    type: 'aimed',
                    delay: 3,
                    interval: 0.4,
                    bullet: { type: 'circle', speed: 80, size: 10, color: '#fff' },
                    position: 'random_edge'
                }
            ]
        };

        this.patterns['mega_desperation'] = {
            duration: 8,
            spawners: [
                {
                    type: 'ring',
                    delay: 0,
                    interval: 0.25,
                    count: 32,
                    bullet: { type: 'circle', speed: 80, size: 4, color: '#f00' },
                    position: 'center'
                },
                {
                    type: 'homing',
                    delay: 0.5,
                    interval: 0.6,
                    bullet: { type: 'diamond', speed: 45, size: 8, color: '#ff0', homing: 1.2 },
                    position: 'random_edge'
                },
                {
                    type: 'spread',
                    delay: 2,
                    interval: 0.8,
                    count: 9,
                    angle: 90,
                    spread: 120,
                    bullet: { type: 'circle', speed: 90, size: 5, color: '#f0f' },
                    position: 'top_center'
                }
            ]
        };

        this.patterns['mega_final'] = {
            duration: 12,
            spawners: [
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.03,
                    bullet: { type: 'diamond', speed: 60, size: 5, color: '#f00' },
                    rotationSpeed: 300,
                    position: 'center'
                },
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.03,
                    bullet: { type: 'diamond', speed: 60, size: 5, color: '#0ff' },
                    rotationSpeed: -300,
                    position: 'center'
                },
                {
                    type: 'ring',
                    delay: 2,
                    interval: 0.6,
                    count: 16,
                    bullet: { type: 'circle', speed: 50, size: 8, color: '#fff' },
                    position: 'center'
                },
                {
                    type: 'homing',
                    delay: 4,
                    interval: 0.4,
                    bullet: { type: 'diamond', speed: 50, size: 10, color: '#f80', homing: 1.5 },
                    position: 'random_edge'
                },
                {
                    type: 'rain',
                    delay: 6,
                    interval: 0.05,
                    bullet: { type: 'circle', speed: 100, size: 3, color: '#ff0' },
                    variance: 0.5
                }
            ]
        };

        this.patterns['mega_rage'] = {
            duration: 10,
            spawners: [
                {
                    type: 'ring',
                    delay: 0,
                    interval: 0.2,
                    count: 36,
                    bullet: { type: 'circle', speed: 90, size: 5, color: '#f00' },
                    position: 'center'
                },
                {
                    type: 'spiral',
                    delay: 0,
                    interval: 0.02,
                    bullet: { type: 'diamond', speed: 70, size: 4, color: '#ff0' },
                    rotationSpeed: 400,
                    position: 'center'
                },
                {
                    type: 'homing',
                    delay: 1,
                    interval: 0.3,
                    bullet: { type: 'circle', speed: 55, size: 12, color: '#f0f', homing: 2.0 },
                    position: 'random_edge'
                }
            ]
        };
    },

    /**
     * Clear all bullets
     */
    clear() {
        this.bullets = [];
        this.patternQueue = [];
        this.currentPattern = null;
    },

    /**
     * Start a pattern
     */
    startPattern(patternName) {
        const pattern = this.patterns[patternName];
        if (!pattern) {
            console.warn(`Pattern not found: ${patternName}`);
            return;
        }

        this.currentPattern = {
            ...pattern,
            name: patternName,
            elapsed: 0,
            spawnerStates: pattern.spawners.map(() => ({ lastSpawn: -999, count: 0, angle: 0 }))
        };
    },

    /**
     * Queue patterns
     */
    queuePatterns(patternNames) {
        this.patternQueue = [...patternNames];
        if (!this.currentPattern && this.patternQueue.length > 0) {
            this.startPattern(this.patternQueue.shift());
        }
    },

    /**
     * Update bullets
     */
    update(dt, bounds) {
        // Update current pattern
        if (this.currentPattern) {
            this.updatePattern(dt, bounds);
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            this.updateBullet(bullet, dt, bounds);

            // Remove dead bullets
            if (bullet.dead) {
                this.bullets.splice(i, 1);
            }
        }
    },

    /**
     * Update pattern spawning
     */
    updatePattern(dt, bounds) {
        const pattern = this.currentPattern;
        pattern.elapsed += dt;

        // Process spawners
        for (let i = 0; i < pattern.spawners.length; i++) {
            const spawner = pattern.spawners[i];
            const state = pattern.spawnerStates[i];

            if (pattern.elapsed < spawner.delay) continue;

            const spawnerTime = pattern.elapsed - spawner.delay;

            // Handle different spawner types
            this.processSpawner(spawner, state, spawnerTime, dt, bounds);
        }

        // Check if pattern is done
        if (pattern.elapsed >= pattern.duration) {
            this.currentPattern = null;

            // Start next pattern in queue
            if (this.patternQueue.length > 0) {
                this.startPattern(this.patternQueue.shift());
            }
        }
    },

    /**
     * Process spawner
     */
    processSpawner(spawner, state, time, dt, bounds) {
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;

        switch (spawner.type) {
            case 'single':
            case 'aimed':
                if (time - state.lastSpawn >= spawner.interval) {
                    state.lastSpawn = time;
                    const pos = this.getSpawnPosition(spawner.position, bounds);
                    const angle = spawner.type === 'aimed' ?
                        Utils.angle(pos.x, pos.y, Soul.x + Soul.width/2, Soul.y + Soul.height/2) :
                        Math.random() * Math.PI * 2;

                    this.spawn({
                        ...spawner.bullet,
                        x: pos.x,
                        y: pos.y,
                        vx: Math.cos(angle) * spawner.bullet.speed,
                        vy: Math.sin(angle) * spawner.bullet.speed
                    });
                }
                break;

            case 'spread':
                if (time - state.lastSpawn >= spawner.interval) {
                    state.lastSpawn = time;
                    const pos = this.getSpawnPosition(spawner.position, bounds);
                    const baseAngle = Utils.degToRad(spawner.angle);
                    const spreadRad = Utils.degToRad(spawner.spread);

                    for (let i = 0; i < spawner.count; i++) {
                        const t = spawner.count > 1 ? i / (spawner.count - 1) : 0.5;
                        const angle = baseAngle + (t - 0.5) * spreadRad;

                        this.spawn({
                            ...spawner.bullet,
                            x: pos.x,
                            y: pos.y,
                            vx: Math.cos(angle) * spawner.bullet.speed,
                            vy: Math.sin(angle) * spawner.bullet.speed
                        });
                    }
                }
                break;

            case 'ring':
                if (time - state.lastSpawn >= spawner.interval) {
                    state.lastSpawn = time;
                    const pos = this.getSpawnPosition(spawner.position, bounds);
                    const angleOffset = Utils.degToRad(spawner.angleOffset || 0);

                    for (let i = 0; i < spawner.count; i++) {
                        const angle = (i / spawner.count) * Math.PI * 2 + angleOffset;

                        this.spawn({
                            ...spawner.bullet,
                            x: pos.x,
                            y: pos.y,
                            vx: Math.cos(angle) * spawner.bullet.speed,
                            vy: Math.sin(angle) * spawner.bullet.speed
                        });
                    }
                }
                break;

            case 'spiral':
                if (time - state.lastSpawn >= spawner.interval) {
                    state.lastSpawn = time;
                    const pos = this.getSpawnPosition(spawner.position, bounds);
                    state.angle += Utils.degToRad(spawner.rotationSpeed * spawner.interval);

                    this.spawn({
                        ...spawner.bullet,
                        x: pos.x,
                        y: pos.y,
                        vx: Math.cos(state.angle) * spawner.bullet.speed,
                        vy: Math.sin(state.angle) * spawner.bullet.speed
                    });
                }
                break;

            case 'rain':
                if (time - state.lastSpawn >= spawner.interval) {
                    state.lastSpawn = time;
                    const x = bounds.x + Math.random() * bounds.width;

                    this.spawn({
                        ...spawner.bullet,
                        x: x,
                        y: bounds.y,
                        vx: (Math.random() - 0.5) * spawner.bullet.speed * (spawner.variance || 0),
                        vy: spawner.bullet.speed,
                        gravity: spawner.bullet.gravity || 0
                    });
                }
                break;

            case 'homing':
                if (time - state.lastSpawn >= spawner.interval) {
                    state.lastSpawn = time;
                    const pos = this.getSpawnPosition(spawner.position, bounds);

                    this.spawn({
                        ...spawner.bullet,
                        x: pos.x,
                        y: pos.y,
                        vx: 0,
                        vy: 0,
                        homing: spawner.bullet.homing || 0.5
                    });
                }
                break;

            case 'line':
                if (state.count < spawner.count && time - state.lastSpawn >= spawner.interval) {
                    state.lastSpawn = time;
                    const t = state.count / (spawner.count - 1);
                    const x = spawner.startX + (spawner.endX - spawner.startX) * t;
                    const y = spawner.startY + (spawner.endY - spawner.startY) * t;

                    this.spawn({
                        ...spawner.bullet,
                        x, y,
                        vx: 0,
                        vy: 0,
                        lifetime: spawner.bullet.lifetime || 999
                    });

                    state.count++;
                }
                break;
        }
    },

    /**
     * Get spawn position
     */
    getSpawnPosition(position, bounds) {
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;

        switch (position) {
            case 'center':
                return { x: centerX, y: centerY };
            case 'top_center':
                return { x: centerX, y: bounds.y };
            case 'random_top':
                return { x: bounds.x + Math.random() * bounds.width, y: bounds.y };
            case 'random_edge':
                const side = Math.floor(Math.random() * 4);
                switch (side) {
                    case 0: return { x: bounds.x + Math.random() * bounds.width, y: bounds.y };
                    case 1: return { x: bounds.x + Math.random() * bounds.width, y: bounds.y + bounds.height };
                    case 2: return { x: bounds.x, y: bounds.y + Math.random() * bounds.height };
                    case 3: return { x: bounds.x + bounds.width, y: bounds.y + Math.random() * bounds.height };
                }
            default:
                return { x: centerX, y: centerY };
        }
    },

    /**
     * Spawn a bullet
     */
    spawn(config) {
        this.bullets.push({
            x: config.x,
            y: config.y,
            vx: config.vx || 0,
            vy: config.vy || 0,
            type: config.type || 'circle',
            size: config.size || 5,
            color: config.color || '#fff',
            gravity: config.gravity || 0,
            homing: config.homing || 0,
            bounces: config.bounces || 0,
            lifetime: config.lifetime || 999,
            age: 0,
            dead: false
        });
    },

    /**
     * Update single bullet
     */
    updateBullet(bullet, dt, bounds) {
        // Apply gravity
        if (bullet.gravity) {
            bullet.vy += bullet.gravity * dt;
        }

        // Apply homing
        if (bullet.homing) {
            const targetX = Soul.x + Soul.width / 2;
            const targetY = Soul.y + Soul.height / 2;
            const angle = Utils.angle(bullet.x, bullet.y, targetX, targetY);
            const speed = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy) || 50;

            bullet.vx = Utils.lerp(bullet.vx, Math.cos(angle) * speed, bullet.homing * dt);
            bullet.vy = Utils.lerp(bullet.vy, Math.sin(angle) * speed, bullet.homing * dt);
        }

        // Move
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;

        // Age
        bullet.age += dt;
        if (bullet.age >= bullet.lifetime) {
            bullet.dead = true;
            return;
        }

        // Bounce off bounds
        if (bullet.bounces > 0) {
            if (bullet.x < bounds.x || bullet.x > bounds.x + bounds.width) {
                bullet.vx *= -1;
                bullet.bounces--;
            }
            if (bullet.y < bounds.y || bullet.y > bounds.y + bounds.height) {
                bullet.vy *= -1;
                bullet.bounces--;
            }
        }

        // Remove if out of bounds (with padding)
        const padding = 20;
        if (bullet.x < bounds.x - padding || bullet.x > bounds.x + bounds.width + padding ||
            bullet.y < bounds.y - padding || bullet.y > bounds.y + bounds.height + padding) {
            bullet.dead = true;
        }
    },

    /**
     * Check collision with soul
     */
    checkCollision(soulHitbox) {
        for (const bullet of this.bullets) {
            if (bullet.dead) continue;

            const bulletHitbox = {
                x: bullet.x - bullet.size / 2,
                y: bullet.y - bullet.size / 2,
                width: bullet.size,
                height: bullet.size
            };

            if (Utils.rectCollision(soulHitbox, bulletHitbox)) {
                return bullet;
            }
        }
        return null;
    },

    /**
     * Render bullets
     */
    render() {
        for (const bullet of this.bullets) {
            if (bullet.dead) continue;

            switch (bullet.type) {
                case 'circle':
                    Renderer.drawCircle(bullet.x, bullet.y, bullet.size / 2, bullet.color);
                    break;
                case 'diamond':
                    this.drawDiamond(bullet.x, bullet.y, bullet.size, bullet.color);
                    break;
                default:
                    Renderer.drawCircle(bullet.x, bullet.y, bullet.size / 2, bullet.color);
            }
        }
    },

    /**
     * Draw diamond shape
     */
    drawDiamond(x, y, size, color) {
        const ctx = Renderer.ctx;
        const half = size / 2;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - half);
        ctx.lineTo(x + half, y);
        ctx.lineTo(x, y + half);
        ctx.lineTo(x - half, y);
        ctx.closePath();
        ctx.fill();
    },

    /**
     * Check if pattern is running
     */
    isPatternRunning() {
        return this.currentPattern !== null || this.patternQueue.length > 0;
    }
};

// Make it globally available
window.Bullets = Bullets;
