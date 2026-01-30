/**
 * Rendering system with pixel-perfect scaling
 */
const Renderer = {
    // Canvas elements
    canvas: null,
    ctx: null,

    // Native resolution
    width: 320,
    height: 240,

    // Current scale
    scale: 1,

    // Screen effects
    screenShake: { x: 0, y: 0, intensity: 0, duration: 0 },
    screenFlash: { color: null, alpha: 0, duration: 0 },
    fadeEffect: { alpha: 0, targetAlpha: 0, speed: 0, color: '#000' },

    // Layers for rendering order
    layers: {
        background: [],
        entities: [],
        foreground: [],
        ui: []
    },

    // Sprite cache
    sprites: {},
    loadingSprites: {},

    // Font settings
    font: '8px monospace',
    textColor: '#fff',

    /**
     * Initialize renderer
     */
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set native resolution
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        // Handle window resize
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Generate placeholder sprites
        this.generatePlaceholderSprites();
    },

    /**
     * Resize canvas to fit window while maintaining aspect ratio
     */
    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate scale to fit window
        const scaleX = Math.floor(windowWidth / this.width);
        const scaleY = Math.floor(windowHeight / this.height);
        this.scale = Math.max(1, Math.min(scaleX, scaleY));

        // Apply CSS scaling
        this.canvas.style.width = (this.width * this.scale) + 'px';
        this.canvas.style.height = (this.height * this.scale) + 'px';
    },

    /**
     * Clear the screen
     */
    clear(color = '#000') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    },

    /**
     * Begin frame rendering
     */
    beginFrame() {
        // Clear all layers
        for (const layer in this.layers) {
            this.layers[layer] = [];
        }

        // Apply screen shake offset
        this.ctx.save();
        if (this.screenShake.intensity > 0) {
            this.ctx.translate(this.screenShake.x, this.screenShake.y);
        }
    },

    /**
     * End frame rendering
     */
    endFrame() {
        this.ctx.restore();

        // Draw screen flash
        if (this.screenFlash.alpha > 0) {
            this.ctx.fillStyle = this.screenFlash.color;
            this.ctx.globalAlpha = this.screenFlash.alpha;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.globalAlpha = 1;
        }

        // Draw fade effect
        if (this.fadeEffect.alpha > 0) {
            this.ctx.fillStyle = this.fadeEffect.color;
            this.ctx.globalAlpha = this.fadeEffect.alpha;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.globalAlpha = 1;
        }
    },

    /**
     * Update screen effects
     */
    update(dt) {
        // Update screen shake
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= dt;
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * 2;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * 2;

            if (this.screenShake.duration <= 0) {
                this.screenShake.intensity = 0;
                this.screenShake.x = 0;
                this.screenShake.y = 0;
            }
        }

        // Update screen flash
        if (this.screenFlash.duration > 0) {
            this.screenFlash.duration -= dt;
            if (this.screenFlash.duration <= 0) {
                this.screenFlash.alpha = 0;
            }
        }

        // Update fade effect
        if (this.fadeEffect.alpha !== this.fadeEffect.targetAlpha) {
            const diff = this.fadeEffect.targetAlpha - this.fadeEffect.alpha;
            const change = this.fadeEffect.speed * dt;

            if (Math.abs(diff) <= change) {
                this.fadeEffect.alpha = this.fadeEffect.targetAlpha;
            } else {
                this.fadeEffect.alpha += Math.sign(diff) * change;
            }
        }
    },

    /**
     * Start screen shake
     */
    shake(intensity = 4, duration = 0.3) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    },

    /**
     * Flash the screen
     */
    flash(color = '#fff', duration = 0.1) {
        this.screenFlash.color = color;
        this.screenFlash.alpha = 1;
        this.screenFlash.duration = duration;
    },

    /**
     * Fade to color
     */
    fadeOut(color = '#000', speed = 2) {
        this.fadeEffect.color = color;
        this.fadeEffect.targetAlpha = 1;
        this.fadeEffect.speed = speed;
    },

    /**
     * Fade from color
     */
    fadeIn(speed = 2) {
        this.fadeEffect.targetAlpha = 0;
        this.fadeEffect.speed = speed;
    },

    /**
     * Check if fade is complete
     */
    isFadeComplete() {
        return this.fadeEffect.alpha === this.fadeEffect.targetAlpha;
    },

    /**
     * Load a sprite image
     */
    loadSprite(name, path) {
        if (this.sprites[name] || this.loadingSprites[name]) {
            return Promise.resolve(this.sprites[name]);
        }

        this.loadingSprites[name] = true;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites[name] = img;
                delete this.loadingSprites[name];
                resolve(img);
            };
            img.onerror = () => {
                delete this.loadingSprites[name];
                console.warn(`Failed to load sprite: ${path}`);
                resolve(null);
            };
            img.src = path;
        });
    },

    /**
     * Draw a sprite
     */
    drawSprite(name, x, y, frameX = 0, frameY = 0, frameWidth = 16, frameHeight = 16, flipX = false, flipY = false) {
        const sprite = this.sprites[name];
        if (!sprite) return;

        x = Math.floor(x);
        y = Math.floor(y);

        this.ctx.save();

        if (flipX || flipY) {
            this.ctx.translate(
                flipX ? x + frameWidth : x,
                flipY ? y + frameHeight : y
            );
            this.ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
            x = 0;
            y = 0;
        }

        this.ctx.drawImage(
            sprite,
            frameX * frameWidth, frameY * frameHeight,
            frameWidth, frameHeight,
            x, y,
            frameWidth, frameHeight
        );

        this.ctx.restore();
    },

    /**
     * Draw a rectangle
     */
    drawRect(x, y, width, height, color, filled = true) {
        x = Math.floor(x);
        y = Math.floor(y);
        width = Math.floor(width);
        height = Math.floor(height);

        if (filled) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
        }
    },

    /**
     * Draw a circle
     */
    drawCircle(x, y, radius, color, filled = true) {
        x = Math.floor(x);
        y = Math.floor(y);

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (filled) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    },

    /**
     * Draw a line
     */
    drawLine(x1, y1, x2, y2, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(Math.floor(x1) + 0.5, Math.floor(y1) + 0.5);
        this.ctx.lineTo(Math.floor(x2) + 0.5, Math.floor(y2) + 0.5);
        this.ctx.stroke();
    },

    /**
     * Draw text
     */
    drawText(text, x, y, color = '#fff', align = 'left', fontSize = 8) {
        x = Math.floor(x);
        y = Math.floor(y);

        // Use a pixel-friendly font stack
        this.ctx.font = `bold ${fontSize}px "Press Start 2P", "Courier New", monospace`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'top';

        // Disable smoothing for crisp text
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.fillText(text, x, y);
    },

    /**
     * Measure text width
     */
    measureText(text, fontSize = 8) {
        this.ctx.font = `bold ${fontSize}px "Press Start 2P", "Courier New", monospace`;
        return this.ctx.measureText(text).width;
    },

    /**
     * Draw text with shadow
     */
    drawTextWithShadow(text, x, y, color = '#fff', shadowColor = '#000', align = 'left', fontSize = 8) {
        this.drawText(text, x + 1, y + 1, shadowColor, align, fontSize);
        this.drawText(text, x, y, color, align, fontSize);
    },

    /**
     * Generate placeholder sprites
     */
    generatePlaceholderSprites() {
        // Create a canvas for generating sprites
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Player placeholder (16x16) - 4 frames x 4 directions
        tempCanvas.width = 64;
        tempCanvas.height = 64;

        // Generate for each direction (row) and frame (column)
        for (let dir = 0; dir < 4; dir++) {
            for (let frame = 0; frame < 4; frame++) {
                const x = frame * 16;
                const y = dir * 16;

                // Body
                tempCtx.fillStyle = '#22f';
                tempCtx.fillRect(x + 2, y + 6, 12, 10);

                // Head
                tempCtx.fillStyle = '#fda';
                tempCtx.fillRect(x + 4, y + 2, 8, 6);

                // Eyes based on direction
                tempCtx.fillStyle = '#000';
                if (dir === 0) { // Down
                    tempCtx.fillRect(x + 5, y + 4, 2, 2);
                    tempCtx.fillRect(x + 9, y + 4, 2, 2);
                } else if (dir === 1) { // Left
                    tempCtx.fillRect(x + 4, y + 4, 2, 2);
                } else if (dir === 2) { // Up
                    // No eyes visible from behind
                } else if (dir === 3) { // Right
                    tempCtx.fillRect(x + 10, y + 4, 2, 2);
                }

                // Walking animation - bob up and down
                if (frame === 1 || frame === 3) {
                    // Slightly shift for walking effect
                    tempCtx.fillStyle = '#22f';
                    tempCtx.fillRect(x + 2, y + 5, 12, 1);
                }
            }
        }
        this.sprites['player'] = this.canvasToImage(tempCanvas);

        // NPC placeholder (16x16) - 4 frames x 4 directions
        tempCtx.clearRect(0, 0, 64, 64);

        for (let dir = 0; dir < 4; dir++) {
            for (let frame = 0; frame < 4; frame++) {
                const x = frame * 16;
                const y = dir * 16;

                // Body (green)
                tempCtx.fillStyle = '#2a2';
                tempCtx.fillRect(x + 2, y + 6, 12, 10);

                // Head
                tempCtx.fillStyle = '#fda';
                tempCtx.fillRect(x + 4, y + 2, 8, 6);

                // Eyes based on direction
                tempCtx.fillStyle = '#000';
                if (dir === 0) {
                    tempCtx.fillRect(x + 5, y + 4, 2, 2);
                    tempCtx.fillRect(x + 9, y + 4, 2, 2);
                } else if (dir === 1) {
                    tempCtx.fillRect(x + 4, y + 4, 2, 2);
                } else if (dir === 3) {
                    tempCtx.fillRect(x + 10, y + 4, 2, 2);
                }
            }
        }
        this.sprites['npc'] = this.canvasToImage(tempCanvas);

        // Soul (heart) placeholder (16x16)
        tempCanvas.width = 16;
        tempCanvas.height = 16;
        tempCtx.clearRect(0, 0, 16, 16);
        tempCtx.fillStyle = '#f00';
        // Draw heart shape
        tempCtx.beginPath();
        tempCtx.moveTo(8, 14);
        tempCtx.lineTo(2, 8);
        tempCtx.lineTo(2, 5);
        tempCtx.lineTo(4, 3);
        tempCtx.lineTo(8, 6);
        tempCtx.lineTo(12, 3);
        tempCtx.lineTo(14, 5);
        tempCtx.lineTo(14, 8);
        tempCtx.closePath();
        tempCtx.fill();
        this.sprites['soul'] = this.canvasToImage(tempCanvas);

        // Tileset placeholder (16x16 tiles)
        tempCanvas.width = 64;
        tempCanvas.height = 64;
        tempCtx.clearRect(0, 0, 64, 64);

        // Tile 0: Empty/floor
        tempCtx.fillStyle = '#222';
        tempCtx.fillRect(0, 0, 16, 16);

        // Tile 1: Wall
        tempCtx.fillStyle = '#666';
        tempCtx.fillRect(16, 0, 16, 16);
        tempCtx.fillStyle = '#555';
        tempCtx.fillRect(17, 1, 14, 14);

        // Tile 2: Save point
        tempCtx.fillStyle = '#ff0';
        tempCtx.fillRect(32, 0, 16, 16);
        tempCtx.fillStyle = '#fa0';
        tempCtx.fillRect(36, 4, 8, 8);

        // Tile 3: Door/transition
        tempCtx.fillStyle = '#333';
        tempCtx.fillRect(48, 0, 16, 16);
        tempCtx.fillStyle = '#111';
        tempCtx.fillRect(52, 2, 8, 12);

        this.sprites['tileset'] = this.canvasToImage(tempCanvas);

        // Generate enemy sprites
        this.generateEnemySprites(tempCanvas, tempCtx);

        // Battle box
        tempCanvas.width = 140;
        tempCanvas.height = 140;
        tempCtx.clearRect(0, 0, 140, 140);
        tempCtx.fillStyle = '#000';
        tempCtx.fillRect(0, 0, 140, 140);
        tempCtx.strokeStyle = '#fff';
        tempCtx.lineWidth = 3;
        tempCtx.strokeRect(2, 2, 136, 136);
        this.sprites['battle_box'] = this.canvasToImage(tempCanvas);
    },

    /**
     * Generate enemy sprites for battle
     */
    generateEnemySprites(tempCanvas, tempCtx) {
        // Training Dummy (32x32)
        tempCanvas.width = 32;
        tempCanvas.height = 32;
        tempCtx.clearRect(0, 0, 32, 32);
        // Body
        tempCtx.fillStyle = '#8B4513';
        tempCtx.fillRect(10, 12, 12, 18);
        // Head
        tempCtx.fillStyle = '#DEB887';
        tempCtx.fillRect(8, 4, 16, 12);
        // Eyes (X's)
        tempCtx.strokeStyle = '#000';
        tempCtx.lineWidth = 2;
        tempCtx.beginPath();
        tempCtx.moveTo(11, 8); tempCtx.lineTo(14, 11);
        tempCtx.moveTo(14, 8); tempCtx.lineTo(11, 11);
        tempCtx.moveTo(18, 8); tempCtx.lineTo(21, 11);
        tempCtx.moveTo(21, 8); tempCtx.lineTo(18, 11);
        tempCtx.stroke();
        // Straw sticking out
        tempCtx.strokeStyle = '#FFD700';
        tempCtx.lineWidth = 1;
        tempCtx.beginPath();
        tempCtx.moveTo(8, 6); tempCtx.lineTo(4, 2);
        tempCtx.moveTo(24, 6); tempCtx.lineTo(28, 2);
        tempCtx.stroke();
        this.sprites['enemy_dummy'] = this.canvasToImage(tempCanvas);

        // Cave Spider (40x32)
        tempCanvas.width = 40;
        tempCanvas.height = 32;
        tempCtx.clearRect(0, 0, 40, 32);
        // Body
        tempCtx.fillStyle = '#2a2a2a';
        tempCtx.beginPath();
        tempCtx.ellipse(20, 20, 10, 8, 0, 0, Math.PI * 2);
        tempCtx.fill();
        // Head
        tempCtx.beginPath();
        tempCtx.ellipse(20, 10, 6, 5, 0, 0, Math.PI * 2);
        tempCtx.fill();
        // Eyes (8 of them)
        tempCtx.fillStyle = '#f00';
        tempCtx.fillRect(15, 8, 3, 2);
        tempCtx.fillRect(22, 8, 3, 2);
        tempCtx.fillRect(17, 11, 2, 2);
        tempCtx.fillRect(21, 11, 2, 2);
        // Legs
        tempCtx.strokeStyle = '#2a2a2a';
        tempCtx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const y = 16 + i * 3;
            tempCtx.beginPath();
            tempCtx.moveTo(10, y); tempCtx.lineTo(2, y + 6);
            tempCtx.moveTo(30, y); tempCtx.lineTo(38, y + 6);
            tempCtx.stroke();
        }
        this.sprites['enemy_cave_spider'] = this.canvasToImage(tempCanvas);

        // Rock Critter (32x32)
        tempCanvas.width = 32;
        tempCanvas.height = 32;
        tempCtx.clearRect(0, 0, 32, 32);
        // Rocky body
        tempCtx.fillStyle = '#666';
        tempCtx.beginPath();
        tempCtx.moveTo(16, 4);
        tempCtx.lineTo(28, 12);
        tempCtx.lineTo(26, 28);
        tempCtx.lineTo(6, 28);
        tempCtx.lineTo(4, 12);
        tempCtx.closePath();
        tempCtx.fill();
        // Cracks
        tempCtx.strokeStyle = '#444';
        tempCtx.lineWidth = 1;
        tempCtx.beginPath();
        tempCtx.moveTo(12, 10); tempCtx.lineTo(18, 16);
        tempCtx.moveTo(20, 14); tempCtx.lineTo(22, 22);
        tempCtx.stroke();
        // Eyes
        tempCtx.fillStyle = '#fff';
        tempCtx.fillRect(10, 14, 4, 4);
        tempCtx.fillRect(18, 14, 4, 4);
        tempCtx.fillStyle = '#000';
        tempCtx.fillRect(12, 15, 2, 2);
        tempCtx.fillRect(20, 15, 2, 2);
        this.sprites['enemy_rock_critter'] = this.canvasToImage(tempCanvas);

        // Crystal Bat (40x32)
        tempCanvas.width = 40;
        tempCanvas.height = 32;
        tempCtx.clearRect(0, 0, 40, 32);
        // Body
        tempCtx.fillStyle = '#446';
        tempCtx.beginPath();
        tempCtx.ellipse(20, 18, 6, 8, 0, 0, Math.PI * 2);
        tempCtx.fill();
        // Wings
        tempCtx.fillStyle = '#668';
        tempCtx.beginPath();
        tempCtx.moveTo(14, 14);
        tempCtx.lineTo(2, 8);
        tempCtx.lineTo(4, 20);
        tempCtx.lineTo(14, 18);
        tempCtx.closePath();
        tempCtx.fill();
        tempCtx.beginPath();
        tempCtx.moveTo(26, 14);
        tempCtx.lineTo(38, 8);
        tempCtx.lineTo(36, 20);
        tempCtx.lineTo(26, 18);
        tempCtx.closePath();
        tempCtx.fill();
        // Crystal on forehead
        tempCtx.fillStyle = '#f0f';
        tempCtx.beginPath();
        tempCtx.moveTo(20, 6);
        tempCtx.lineTo(23, 12);
        tempCtx.lineTo(17, 12);
        tempCtx.closePath();
        tempCtx.fill();
        // Eyes
        tempCtx.fillStyle = '#ff0';
        tempCtx.fillRect(16, 14, 3, 3);
        tempCtx.fillRect(21, 14, 3, 3);
        this.sprites['enemy_crystal_bat'] = this.canvasToImage(tempCanvas);

        // Crystal Guardian (48x48) - Boss
        tempCanvas.width = 48;
        tempCanvas.height = 48;
        tempCtx.clearRect(0, 0, 48, 48);
        // Body - large crystal golem
        tempCtx.fillStyle = '#808';
        tempCtx.beginPath();
        tempCtx.moveTo(24, 4);
        tempCtx.lineTo(40, 16);
        tempCtx.lineTo(38, 44);
        tempCtx.lineTo(10, 44);
        tempCtx.lineTo(8, 16);
        tempCtx.closePath();
        tempCtx.fill();
        // Crystal formations
        tempCtx.fillStyle = '#f0f';
        tempCtx.beginPath();
        tempCtx.moveTo(24, 0); tempCtx.lineTo(28, 10); tempCtx.lineTo(20, 10);
        tempCtx.closePath();
        tempCtx.fill();
        tempCtx.beginPath();
        tempCtx.moveTo(10, 12); tempCtx.lineTo(6, 20); tempCtx.lineTo(14, 18);
        tempCtx.closePath();
        tempCtx.fill();
        tempCtx.beginPath();
        tempCtx.moveTo(38, 12); tempCtx.lineTo(42, 20); tempCtx.lineTo(34, 18);
        tempCtx.closePath();
        tempCtx.fill();
        // Eyes
        tempCtx.fillStyle = '#fff';
        tempCtx.fillRect(16, 20, 6, 6);
        tempCtx.fillRect(26, 20, 6, 6);
        tempCtx.fillStyle = '#f0f';
        tempCtx.fillRect(18, 22, 3, 3);
        tempCtx.fillRect(28, 22, 3, 3);
        this.sprites['enemy_crystal_guardian'] = this.canvasToImage(tempCanvas);

        // The Keeper (56x56) - Final Boss
        tempCanvas.width = 56;
        tempCanvas.height = 56;
        tempCtx.clearRect(0, 0, 56, 56);
        // Hooded robe body
        tempCtx.fillStyle = '#222';
        tempCtx.beginPath();
        tempCtx.moveTo(28, 8);
        tempCtx.lineTo(48, 20);
        tempCtx.lineTo(46, 52);
        tempCtx.lineTo(10, 52);
        tempCtx.lineTo(8, 20);
        tempCtx.closePath();
        tempCtx.fill();
        // Hood
        tempCtx.beginPath();
        tempCtx.arc(28, 16, 12, Math.PI, 0);
        tempCtx.fill();
        // Glowing eyes in shadow
        tempCtx.fillStyle = '#ff0';
        tempCtx.fillRect(22, 18, 4, 4);
        tempCtx.fillRect(30, 18, 4, 4);
        // Staff
        tempCtx.strokeStyle = '#a80';
        tempCtx.lineWidth = 3;
        tempCtx.beginPath();
        tempCtx.moveTo(46, 16);
        tempCtx.lineTo(46, 52);
        tempCtx.stroke();
        // Staff orb
        tempCtx.fillStyle = '#ff0';
        tempCtx.beginPath();
        tempCtx.arc(46, 12, 5, 0, Math.PI * 2);
        tempCtx.fill();
        this.sprites['enemy_the_keeper'] = this.canvasToImage(tempCanvas);

        // Mushroom Dancer (32x36)
        tempCanvas.width = 32;
        tempCanvas.height = 36;
        tempCtx.clearRect(0, 0, 32, 36);
        // Stem
        tempCtx.fillStyle = '#ddd';
        tempCtx.fillRect(12, 18, 8, 18);
        // Cap
        tempCtx.fillStyle = '#f44';
        tempCtx.beginPath();
        tempCtx.ellipse(16, 12, 14, 10, 0, Math.PI, 0);
        tempCtx.fill();
        // Spots on cap
        tempCtx.fillStyle = '#fff';
        tempCtx.beginPath();
        tempCtx.arc(10, 8, 3, 0, Math.PI * 2);
        tempCtx.arc(20, 6, 2, 0, Math.PI * 2);
        tempCtx.arc(24, 10, 2, 0, Math.PI * 2);
        tempCtx.fill();
        // Happy face
        tempCtx.fillStyle = '#000';
        tempCtx.fillRect(12, 22, 2, 2);
        tempCtx.fillRect(18, 22, 2, 2);
        // Smile
        tempCtx.beginPath();
        tempCtx.arc(16, 26, 4, 0.1, Math.PI - 0.1);
        tempCtx.stroke();
        this.sprites['enemy_mushroom_dancer'] = this.canvasToImage(tempCanvas);

        // Ancient Spirit (36x40)
        tempCanvas.width = 36;
        tempCanvas.height = 40;
        tempCtx.clearRect(0, 0, 36, 40);
        // Ghostly body (semi-transparent effect)
        tempCtx.fillStyle = 'rgba(150, 200, 255, 0.8)';
        tempCtx.beginPath();
        tempCtx.moveTo(18, 4);
        tempCtx.bezierCurveTo(32, 4, 34, 20, 32, 32);
        tempCtx.lineTo(28, 38);
        tempCtx.lineTo(22, 34);
        tempCtx.lineTo(18, 40);
        tempCtx.lineTo(14, 34);
        tempCtx.lineTo(8, 38);
        tempCtx.lineTo(4, 32);
        tempCtx.bezierCurveTo(2, 20, 4, 4, 18, 4);
        tempCtx.fill();
        // Hollow eyes
        tempCtx.fillStyle = '#000';
        tempCtx.beginPath();
        tempCtx.ellipse(12, 16, 4, 5, 0, 0, Math.PI * 2);
        tempCtx.ellipse(24, 16, 4, 5, 0, 0, Math.PI * 2);
        tempCtx.fill();
        // Eye glow
        tempCtx.fillStyle = '#8ff';
        tempCtx.beginPath();
        tempCtx.arc(12, 16, 2, 0, Math.PI * 2);
        tempCtx.arc(24, 16, 2, 0, Math.PI * 2);
        tempCtx.fill();
        this.sprites['enemy_ancient_spirit'] = this.canvasToImage(tempCanvas);

        // MEGA DESTROYER (64x64) - Mega Boss
        tempCanvas.width = 64;
        tempCanvas.height = 64;
        tempCtx.clearRect(0, 0, 64, 64);
        // Main body - mechanical construct
        tempCtx.fillStyle = '#333';
        tempCtx.fillRect(12, 20, 40, 40);
        // Head/sensor array
        tempCtx.fillStyle = '#444';
        tempCtx.fillRect(18, 8, 28, 16);
        // Core (glowing)
        tempCtx.fillStyle = '#f00';
        tempCtx.beginPath();
        tempCtx.arc(32, 40, 10, 0, Math.PI * 2);
        tempCtx.fill();
        tempCtx.fillStyle = '#ff0';
        tempCtx.beginPath();
        tempCtx.arc(32, 40, 6, 0, Math.PI * 2);
        tempCtx.fill();
        tempCtx.fillStyle = '#fff';
        tempCtx.beginPath();
        tempCtx.arc(32, 40, 3, 0, Math.PI * 2);
        tempCtx.fill();
        // Eyes (3 of them)
        tempCtx.fillStyle = '#f00';
        tempCtx.fillRect(22, 12, 6, 6);
        tempCtx.fillRect(36, 12, 6, 6);
        tempCtx.fillRect(29, 10, 6, 4);
        // Eye pupils
        tempCtx.fillStyle = '#ff0';
        tempCtx.fillRect(24, 14, 2, 2);
        tempCtx.fillRect(38, 14, 2, 2);
        tempCtx.fillRect(31, 11, 2, 2);
        // Arms/weapons
        tempCtx.fillStyle = '#555';
        tempCtx.fillRect(4, 24, 10, 6);
        tempCtx.fillRect(50, 24, 10, 6);
        tempCtx.fillRect(2, 28, 6, 20);
        tempCtx.fillRect(56, 28, 6, 20);
        // Weapon tips
        tempCtx.fillStyle = '#0ff';
        tempCtx.fillRect(2, 44, 6, 4);
        tempCtx.fillRect(56, 44, 6, 4);
        // Legs/treads
        tempCtx.fillStyle = '#222';
        tempCtx.fillRect(14, 56, 12, 8);
        tempCtx.fillRect(38, 56, 12, 8);
        // Detail lines
        tempCtx.strokeStyle = '#666';
        tempCtx.lineWidth = 1;
        tempCtx.beginPath();
        tempCtx.moveTo(12, 30); tempCtx.lineTo(52, 30);
        tempCtx.moveTo(12, 50); tempCtx.lineTo(52, 50);
        tempCtx.moveTo(22, 20); tempCtx.lineTo(22, 56);
        tempCtx.moveTo(42, 20); tempCtx.lineTo(42, 56);
        tempCtx.stroke();
        // Warning stripes
        tempCtx.fillStyle = '#ff0';
        for (let i = 0; i < 4; i++) {
            tempCtx.fillRect(14 + i * 10, 58, 4, 4);
        }
        this.sprites['enemy_mega_destroyer'] = this.canvasToImage(tempCanvas);
    },

    /**
     * Convert canvas to image
     */
    canvasToImage(canvas) {
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    },

    /**
     * Draw a 9-slice box
     */
    drawBox(x, y, width, height, borderColor = '#fff', fillColor = '#000', borderWidth = 2) {
        x = Math.floor(x);
        y = Math.floor(y);
        width = Math.floor(width);
        height = Math.floor(height);

        // Fill
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(x, y, width, height);

        // Border
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = borderWidth;
        this.ctx.strokeRect(x + borderWidth/2, y + borderWidth/2, width - borderWidth, height - borderWidth);
    },

    /**
     * Set clipping region
     */
    setClip(x, y, width, height) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
    },

    /**
     * Clear clipping region
     */
    clearClip() {
        this.ctx.restore();
    }
};

// Make it globally available
window.Renderer = Renderer;
