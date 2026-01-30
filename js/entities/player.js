/**
 * Player entity for overworld
 */
const Player = {
    // Position
    x: 160,
    y: 120,

    // Dimensions
    width: 12,
    height: 12,
    spriteWidth: 16,
    spriteHeight: 16,

    // Movement
    speed: 80,
    velX: 0,
    velY: 0,

    // Animation
    direction: 'down', // up, down, left, right
    frame: 0,
    frameTimer: 0,
    frameDelay: 0.15,
    animating: false,

    // State
    canMove: true,
    interacting: false,

    // Hitbox offset from sprite
    hitboxOffsetX: 2,
    hitboxOffsetY: 4,

    /**
     * Initialize player
     */
    init(x, y) {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.canMove = true;
        this.interacting = false;
    },

    /**
     * Update player
     */
    update(dt, room) {
        if (!this.canMove) {
            this.velX = 0;
            this.velY = 0;
            return;
        }

        // Get input
        const input = Input.getDirection();

        // Set velocity
        this.velX = input.x * this.speed;
        this.velY = input.y * this.speed;

        // Update direction based on input
        if (input.x < 0) this.direction = 'left';
        else if (input.x > 0) this.direction = 'right';
        else if (input.y < 0) this.direction = 'up';
        else if (input.y > 0) this.direction = 'down';

        // Calculate new position
        let newX = this.x + this.velX * dt;
        let newY = this.y + this.velY * dt;

        // Collision detection
        const hitboxX = newX + this.hitboxOffsetX;
        const hitboxY = newY + this.hitboxOffsetY;

        // Check X movement
        if (Rooms.isWalkable(room, hitboxX, this.y + this.hitboxOffsetY, this.width, this.height)) {
            this.x = newX;
        } else {
            this.velX = 0;
        }

        // Check Y movement
        if (Rooms.isWalkable(room, this.x + this.hitboxOffsetX, hitboxY, this.width, this.height)) {
            this.y = newY;
        } else {
            this.velY = 0;
        }

        // Keep in bounds
        this.x = Utils.clamp(this.x, 0, room.width * 16 - this.spriteWidth);
        this.y = Utils.clamp(this.y, 0, room.height * 16 - this.spriteHeight);

        // Update animation
        this.animating = this.velX !== 0 || this.velY !== 0;

        if (this.animating) {
            this.frameTimer += dt;
            if (this.frameTimer >= this.frameDelay) {
                this.frameTimer = 0;
                this.frame = (this.frame + 1) % 4;
            }
        } else {
            this.frame = 0;
            this.frameTimer = 0;
        }
    },

    /**
     * Render player
     */
    render(cameraX = 0, cameraY = 0) {
        const screenX = Math.floor(this.x - cameraX);
        const screenY = Math.floor(this.y - cameraY);

        // Direction to frame row
        const directionRows = {
            'down': 0,
            'left': 1,
            'up': 2,
            'right': 3
        };

        const frameRow = directionRows[this.direction] || 0;
        const flipX = false;

        Renderer.drawSprite(
            'player',
            screenX,
            screenY,
            this.frame,
            frameRow,
            this.spriteWidth,
            this.spriteHeight,
            flipX
        );

        // Debug: show hitbox
        if (Game.debug) {
            Renderer.drawRect(
                screenX + this.hitboxOffsetX,
                screenY + this.hitboxOffsetY,
                this.width,
                this.height,
                'rgba(255,0,0,0.5)'
            );
        }
    },

    /**
     * Get hitbox for collision
     */
    getHitbox() {
        return {
            x: this.x + this.hitboxOffsetX,
            y: this.y + this.hitboxOffsetY,
            width: this.width,
            height: this.height
        };
    },

    /**
     * Get interaction point (in front of player)
     */
    getInteractionPoint() {
        const offsets = {
            'up': { x: this.spriteWidth / 2, y: -4 },
            'down': { x: this.spriteWidth / 2, y: this.spriteHeight + 4 },
            'left': { x: -4, y: this.spriteHeight / 2 },
            'right': { x: this.spriteWidth + 4, y: this.spriteHeight / 2 }
        };

        const offset = offsets[this.direction];

        return {
            x: this.x + offset.x,
            y: this.y + offset.y
        };
    },

    /**
     * Get center position
     */
    getCenter() {
        return {
            x: this.x + this.spriteWidth / 2,
            y: this.y + this.spriteHeight / 2
        };
    },

    /**
     * Freeze player movement
     */
    freeze() {
        this.canMove = false;
        this.velX = 0;
        this.velY = 0;
    },

    /**
     * Unfreeze player movement
     */
    unfreeze() {
        this.canMove = true;
    },

    /**
     * Set position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    },

    /**
     * Face a direction
     */
    face(direction) {
        this.direction = direction;
    },

    /**
     * Face towards a point
     */
    faceTowards(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
        }
    }
};

// Make it globally available
window.Player = Player;
