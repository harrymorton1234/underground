/**
 * Soul entity for battle (the heart you control)
 */
const Soul = {
    // Position
    x: 160,
    y: 160,

    // Dimensions
    width: 8,
    height: 8,

    // Movement
    speed: 120,
    velX: 0,
    velY: 0,

    // Soul types
    types: {
        RED: 'red',      // Normal movement
        BLUE: 'blue',    // Gravity-affected
        ORANGE: 'orange', // Must keep moving
        CYAN: 'cyan'     // Must stay still
    },

    // Current soul type
    type: 'red',

    // Blue soul physics
    gravity: 400,
    jumpStrength: -180,
    grounded: false,
    maxFallSpeed: 200,

    // Battle box bounds
    bounds: {
        x: 90,
        y: 130,
        width: 140,
        height: 140
    },

    // State
    active: true,
    invincible: false,
    invincibleTimer: 0,
    invincibleDuration: 1.0,

    // Visual
    visible: true,
    flashTimer: 0,

    /**
     * Initialize soul
     */
    init(x, y, type = 'red') {
        this.x = x || this.bounds.x + this.bounds.width / 2;
        this.y = y || this.bounds.y + this.bounds.height / 2;
        this.type = type;
        this.velX = 0;
        this.velY = 0;
        this.grounded = false;
        this.active = true;
        this.invincible = false;
        this.invincibleTimer = 0;
    },

    /**
     * Set battle box bounds
     */
    setBounds(x, y, width, height) {
        this.bounds = { x, y, width, height };
    },

    /**
     * Update soul
     */
    update(dt) {
        if (!this.active) return;

        // Update invincibility
        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
            // Flicker effect
            this.visible = Math.floor(this.invincibleTimer * 20) % 2 === 0;
        } else {
            this.visible = true;
        }

        // Get input
        const input = Input.getDirection();

        // Movement based on soul type
        switch (this.type) {
            case this.types.RED:
                this.updateRedSoul(dt, input);
                break;
            case this.types.BLUE:
                this.updateBlueSoul(dt, input);
                break;
            case this.types.ORANGE:
                this.updateOrangeSoul(dt, input);
                break;
            case this.types.CYAN:
                this.updateCyanSoul(dt, input);
                break;
            default:
                this.updateRedSoul(dt, input);
        }

        // Keep in bounds
        this.constrainToBounds();
    },

    /**
     * Red soul - free movement
     */
    updateRedSoul(dt, input) {
        this.velX = input.x * this.speed;
        this.velY = input.y * this.speed;

        this.x += this.velX * dt;
        this.y += this.velY * dt;
    },

    /**
     * Blue soul - gravity-affected
     */
    updateBlueSoul(dt, input) {
        // Horizontal movement
        this.velX = input.x * this.speed;
        this.x += this.velX * dt;

        // Apply gravity
        if (!this.grounded) {
            this.velY += this.gravity * dt;
            this.velY = Math.min(this.velY, this.maxFallSpeed);
        }

        // Jump if grounded
        if (this.grounded && input.y < 0) {
            this.velY = this.jumpStrength;
            this.grounded = false;
        }

        this.y += this.velY * dt;

        // Check ground collision
        const groundY = this.bounds.y + this.bounds.height - this.height;
        if (this.y >= groundY) {
            this.y = groundY;
            this.velY = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }
    },

    /**
     * Orange soul - must keep moving
     */
    updateOrangeSoul(dt, input) {
        this.velX = input.x * this.speed;
        this.velY = input.y * this.speed;

        this.x += this.velX * dt;
        this.y += this.velY * dt;

        // Damage if not moving (handled in battle system)
    },

    /**
     * Cyan soul - must stay still
     */
    updateCyanSoul(dt, input) {
        this.velX = input.x * this.speed;
        this.velY = input.y * this.speed;

        this.x += this.velX * dt;
        this.y += this.velY * dt;

        // Damage if moving (handled in battle system)
    },

    /**
     * Keep soul within battle box
     */
    constrainToBounds() {
        const minX = this.bounds.x;
        const maxX = this.bounds.x + this.bounds.width - this.width;
        const minY = this.bounds.y;
        const maxY = this.bounds.y + this.bounds.height - this.height;

        this.x = Utils.clamp(this.x, minX, maxX);
        this.y = Utils.clamp(this.y, minY, maxY);

        // Stop velocity at bounds
        if (this.x === minX || this.x === maxX) this.velX = 0;
        if (this.y === minY || this.y === maxY) this.velY = 0;
    },

    /**
     * Render soul
     */
    render() {
        if (!this.visible) return;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Soul color based on type
        const colors = {
            red: '#f00',
            blue: '#00f',
            orange: '#f80',
            cyan: '#0ff'
        };

        const color = colors[this.type] || '#f00';

        // Draw heart shape
        this.drawHeart(centerX, centerY, this.width, color);
    },

    /**
     * Draw heart shape
     */
    drawHeart(x, y, size, color) {
        // Simple heart using a rotated square and circle
        const ctx = Renderer.ctx;
        const halfSize = size / 2;

        ctx.fillStyle = color;
        ctx.beginPath();

        // Heart using bezier curves
        ctx.moveTo(x, y + halfSize * 0.7);
        ctx.bezierCurveTo(x, y, x - halfSize, y, x - halfSize, y + halfSize * 0.3);
        ctx.bezierCurveTo(x - halfSize, y + halfSize * 0.6, x, y + halfSize, x, y + halfSize);
        ctx.bezierCurveTo(x, y + halfSize, x + halfSize, y + halfSize * 0.6, x + halfSize, y + halfSize * 0.3);
        ctx.bezierCurveTo(x + halfSize, y, x, y, x, y + halfSize * 0.7);

        ctx.fill();
    },

    /**
     * Get hitbox for collision
     */
    getHitbox() {
        // Smaller hitbox for more forgiving gameplay
        const padding = 1;
        return {
            x: this.x + padding,
            y: this.y + padding,
            width: this.width - padding * 2,
            height: this.height - padding * 2
        };
    },

    /**
     * Get center position
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    },

    /**
     * Take damage
     */
    takeDamage() {
        if (this.invincible) return false;

        this.invincible = true;
        this.invincibleTimer = this.invincibleDuration;

        return true;
    },

    /**
     * Change soul type
     */
    setType(type) {
        this.type = type;

        // Reset physics for blue soul
        if (type === this.types.BLUE) {
            this.velY = 0;
            this.grounded = false;
        }
    },

    /**
     * Check if soul is moving
     */
    isMoving() {
        return Math.abs(this.velX) > 10 || Math.abs(this.velY) > 10;
    },

    /**
     * Center soul in bounds
     */
    centerInBounds() {
        this.x = this.bounds.x + (this.bounds.width - this.width) / 2;
        this.y = this.bounds.y + (this.bounds.height - this.height) / 2;
    }
};

// Make it globally available
window.Soul = Soul;
