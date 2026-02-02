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

        // Get equipped items
        const save = Save.getCurrent();
        const hasWeapon = save && save.weapon;
        const hasArmor = save && save.armor;

        // If wearing armor, draw custom robed character instead of sprite
        if (hasArmor) {
            // Draw glow effect for mod cloak
            if (save.armor === 'mod_cloak') {
                const time = performance.now() / 300;
                const glowSize = 20 + Math.sin(time) * 5;
                const r = Math.floor(Math.sin(time) * 127 + 128);
                const g = Math.floor(Math.sin(time + 2) * 127 + 128);
                const b = Math.floor(Math.sin(time + 4) * 127 + 128);

                Renderer.ctx.save();
                Renderer.ctx.globalAlpha = 0.3;
                Renderer.ctx.fillStyle = `rgb(${r},${g},${b})`;
                Renderer.ctx.beginPath();
                Renderer.ctx.arc(screenX + 8, screenY + 8, glowSize, 0, Math.PI * 2);
                Renderer.ctx.fill();
                Renderer.ctx.globalAlpha = 1;
                Renderer.ctx.restore();
            }
            this.renderRobedPlayer(screenX, screenY, save.armor);
        } else {
            // Draw base player sprite
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
        }

        // Draw weapon if equipped
        if (hasWeapon) {
            this.renderWeapon(screenX, screenY, save.weapon);
        }

        // Draw crown if player has crown in inventory (not in trophy case)
        if (Inventory.hasItem('hero_crown')) {
            this.renderCrown(screenX, screenY);
        }

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
     * Render hero crown
     */
    renderCrown(screenX, screenY) {
        // Golden crown base
        Renderer.drawRect(screenX + 2, screenY - 2, 12, 4, '#fc0');
        // Crown points
        Renderer.drawRect(screenX + 3, screenY - 5, 2, 3, '#fc0');
        Renderer.drawRect(screenX + 7, screenY - 6, 2, 4, '#fc0');
        Renderer.drawRect(screenX + 11, screenY - 5, 2, 3, '#fc0');
        // Jewels
        Renderer.drawRect(screenX + 4, screenY - 4, 1, 1, '#f44');
        Renderer.drawRect(screenX + 8, screenY - 5, 1, 1, '#4af');
        Renderer.drawRect(screenX + 11, screenY - 4, 1, 1, '#f44');
    },

    /**
     * Render player wearing a robe/armor
     */
    renderRobedPlayer(screenX, screenY, armorId) {
        const item = Items.get(armorId);

        // Get colors based on armor type
        let robeColor = '#654';
        let robeDark = '#432';
        let robeLight = '#876';
        let trimColor = '#987';
        let skinColor = '#fdb';
        let hairColor = '#654';

        if (armorId === 'mod_cloak') {
            // Moderator cloak - shifting rainbow colors
            const time = performance.now() / 500;
            const r = Math.floor(Math.sin(time) * 127 + 128);
            const g = Math.floor(Math.sin(time + 2) * 127 + 128);
            const b = Math.floor(Math.sin(time + 4) * 127 + 128);
            robeColor = `rgb(${r},${g},${b})`;
            robeDark = `rgb(${Math.floor(r*0.6)},${Math.floor(g*0.6)},${Math.floor(b*0.6)})`;
            robeLight = `rgb(${Math.min(255,r+50)},${Math.min(255,g+50)},${Math.min(255,b+50)})`;
            trimColor = '#fff';
            skinColor = '#ffd';
            hairColor = '#ff0';
        } else if (armorId.includes('crystal')) {
            robeColor = '#4ad';
            robeDark = '#28a';
            robeLight = '#6cf';
            trimColor = '#8ef';
        } else if (armorId.includes('ancient')) {
            robeColor = '#a86';
            robeDark = '#753';
            robeLight = '#cb8';
            trimColor = '#dc9';
        } else if (armorId.includes('spirit')) {
            robeColor = '#a6d';
            robeDark = '#749';
            robeLight = '#c8f';
            trimColor = '#daf';
        } else if (armorId.includes('mega')) {
            robeColor = '#da4';
            robeDark = '#a72';
            robeLight = '#fc6';
            trimColor = '#fe8';
        } else if (armorId.includes('torn') || armorId.includes('cloak')) {
            robeColor = '#543';
            robeDark = '#321';
            robeLight = '#654';
            trimColor = '#654';
        } else if (armorId.includes('wooden') || armorId.includes('shield')) {
            robeColor = '#654';
            robeDark = '#432';
            robeLight = '#876';
            trimColor = '#876';
        }

        const walkOffset = this.animating ? Math.sin(this.frame * Math.PI / 2) * 1 : 0;
        const bobOffset = this.animating ? Math.abs(Math.sin(this.frame * Math.PI / 2)) * -1 : 0;

        Renderer.ctx.save();

        if (this.direction === 'down') {
            // Facing down - front view
            // Robe body
            Renderer.ctx.fillStyle = robeColor;
            Renderer.ctx.fillRect(screenX + 4, screenY + 6 + bobOffset, 8, 10);

            // Robe sides (darker)
            Renderer.ctx.fillStyle = robeDark;
            Renderer.ctx.fillRect(screenX + 3, screenY + 7 + bobOffset, 2, 8);
            Renderer.ctx.fillRect(screenX + 11, screenY + 7 + bobOffset, 2, 8);

            // Robe trim/collar
            Renderer.ctx.fillStyle = trimColor;
            Renderer.ctx.fillRect(screenX + 5, screenY + 6 + bobOffset, 6, 2);

            // Hood/head
            Renderer.ctx.fillStyle = robeLight;
            Renderer.ctx.fillRect(screenX + 4, screenY + 1 + bobOffset, 8, 6);
            Renderer.ctx.fillStyle = robeDark;
            Renderer.ctx.fillRect(screenX + 4, screenY + 1 + bobOffset, 1, 5);
            Renderer.ctx.fillRect(screenX + 11, screenY + 1 + bobOffset, 1, 5);

            // Face
            Renderer.ctx.fillStyle = skinColor;
            Renderer.ctx.fillRect(screenX + 5, screenY + 2 + bobOffset, 6, 4);

            // Eyes
            Renderer.ctx.fillStyle = '#000';
            Renderer.ctx.fillRect(screenX + 6, screenY + 3 + bobOffset, 1, 2);
            Renderer.ctx.fillRect(screenX + 9, screenY + 3 + bobOffset, 1, 2);

            // Feet (walking animation)
            Renderer.ctx.fillStyle = robeDark;
            if (this.animating) {
                Renderer.ctx.fillRect(screenX + 5 + walkOffset, screenY + 14, 2, 2);
                Renderer.ctx.fillRect(screenX + 9 - walkOffset, screenY + 14, 2, 2);
            } else {
                Renderer.ctx.fillRect(screenX + 5, screenY + 14, 2, 2);
                Renderer.ctx.fillRect(screenX + 9, screenY + 14, 2, 2);
            }

        } else if (this.direction === 'up') {
            // Facing up - back view
            // Robe body
            Renderer.ctx.fillStyle = robeColor;
            Renderer.ctx.fillRect(screenX + 3, screenY + 6 + bobOffset, 10, 10);

            // Robe center fold
            Renderer.ctx.fillStyle = robeDark;
            Renderer.ctx.fillRect(screenX + 7, screenY + 6 + bobOffset, 2, 9);

            // Hood
            Renderer.ctx.fillStyle = robeLight;
            Renderer.ctx.fillRect(screenX + 4, screenY + 1 + bobOffset, 8, 6);
            Renderer.ctx.fillStyle = robeDark;
            Renderer.ctx.fillRect(screenX + 7, screenY + 1 + bobOffset, 2, 5);

            // Hood shadow
            Renderer.ctx.fillStyle = robeDark;
            Renderer.ctx.fillRect(screenX + 5, screenY + 5 + bobOffset, 6, 2);

            // Feet
            Renderer.ctx.fillStyle = robeDark;
            if (this.animating) {
                Renderer.ctx.fillRect(screenX + 5 + walkOffset, screenY + 14, 2, 2);
                Renderer.ctx.fillRect(screenX + 9 - walkOffset, screenY + 14, 2, 2);
            } else {
                Renderer.ctx.fillRect(screenX + 5, screenY + 14, 2, 2);
                Renderer.ctx.fillRect(screenX + 9, screenY + 14, 2, 2);
            }

        } else if (this.direction === 'left') {
            // Facing left - side view
            // Robe body
            Renderer.ctx.fillStyle = robeColor;
            Renderer.ctx.fillRect(screenX + 5, screenY + 6 + bobOffset, 7, 10);

            // Robe front
            Renderer.ctx.fillStyle = robeLight;
            Renderer.ctx.fillRect(screenX + 4, screenY + 7 + bobOffset, 2, 8);

            // Robe back fold
            Renderer.ctx.fillStyle = robeDark;
            Renderer.ctx.fillRect(screenX + 10, screenY + 8 + bobOffset, 2, 7);

            // Hood
            Renderer.ctx.fillStyle = robeLight;
            Renderer.ctx.fillRect(screenX + 4, screenY + 1 + bobOffset, 7, 6);
            Renderer.ctx.fillStyle = robeDark;
            Renderer.ctx.fillRect(screenX + 9, screenY + 2 + bobOffset, 2, 4);

            // Face
            Renderer.ctx.fillStyle = skinColor;
            Renderer.ctx.fillRect(screenX + 4, screenY + 2 + bobOffset, 4, 4);

            // Eye
            Renderer.ctx.fillStyle = '#000';
            Renderer.ctx.fillRect(screenX + 5, screenY + 3 + bobOffset, 1, 2);

            // Feet
            Renderer.ctx.fillStyle = robeDark;
            if (this.animating) {
                Renderer.ctx.fillRect(screenX + 5 - walkOffset, screenY + 14, 2, 2);
                Renderer.ctx.fillRect(screenX + 8 + walkOffset, screenY + 14, 2, 2);
            } else {
                Renderer.ctx.fillRect(screenX + 6, screenY + 14, 3, 2);
            }

        } else if (this.direction === 'right') {
            // Facing right - side view (mirrored)
            // Robe body
            Renderer.ctx.fillStyle = robeColor;
            Renderer.ctx.fillRect(screenX + 4, screenY + 6 + bobOffset, 7, 10);

            // Robe front
            Renderer.ctx.fillStyle = robeLight;
            Renderer.ctx.fillRect(screenX + 10, screenY + 7 + bobOffset, 2, 8);

            // Robe back fold
            Renderer.ctx.fillStyle = robeDark;
            Renderer.ctx.fillRect(screenX + 4, screenY + 8 + bobOffset, 2, 7);

            // Hood
            Renderer.ctx.fillStyle = robeLight;
            Renderer.ctx.fillRect(screenX + 5, screenY + 1 + bobOffset, 7, 6);
            Renderer.ctx.fillStyle = robeDark;
            Renderer.ctx.fillRect(screenX + 5, screenY + 2 + bobOffset, 2, 4);

            // Face
            Renderer.ctx.fillStyle = skinColor;
            Renderer.ctx.fillRect(screenX + 8, screenY + 2 + bobOffset, 4, 4);

            // Eye
            Renderer.ctx.fillStyle = '#000';
            Renderer.ctx.fillRect(screenX + 10, screenY + 3 + bobOffset, 1, 2);

            // Feet
            Renderer.ctx.fillStyle = robeDark;
            if (this.animating) {
                Renderer.ctx.fillRect(screenX + 6 - walkOffset, screenY + 14, 2, 2);
                Renderer.ctx.fillRect(screenX + 9 + walkOffset, screenY + 14, 2, 2);
            } else {
                Renderer.ctx.fillRect(screenX + 7, screenY + 14, 3, 2);
            }
        }

        Renderer.ctx.restore();
    },

    /**
     * Render equipped weapon
     */
    renderWeapon(screenX, screenY, weaponId) {
        const item = Items.get(weaponId);
        if (!item) return;

        // Get weapon color based on type
        let bladeColor = '#888';
        let handleColor = '#654';

        if (weaponId.includes('crystal')) {
            bladeColor = '#8ff';
            handleColor = '#456';
        } else if (weaponId.includes('ancient')) {
            bladeColor = '#fd8';
            handleColor = '#432';
        } else if (weaponId.includes('spirit')) {
            bladeColor = '#c8f';
            handleColor = '#424';
        } else if (weaponId.includes('mega')) {
            bladeColor = '#ff4';
            handleColor = '#844';
        } else if (weaponId.includes('spider')) {
            bladeColor = '#4a4';
            handleColor = '#232';
        }

        // Weapon position based on direction and animation
        const wobble = this.animating ? Math.sin(this.frame * 1.5) * 1 : 0;

        const weaponPositions = {
            'down': { x: screenX + 12, y: screenY + 6 + wobble, angle: 45 },
            'up': { x: screenX + 2, y: screenY + 4 + wobble, angle: -135 },
            'left': { x: screenX - 2, y: screenY + 6 + wobble, angle: -45 },
            'right': { x: screenX + 14, y: screenY + 6 + wobble, angle: 45 }
        };

        const pos = weaponPositions[this.direction];

        // Draw blade
        Renderer.ctx.save();
        Renderer.ctx.translate(pos.x, pos.y);
        Renderer.ctx.rotate(pos.angle * Math.PI / 180);

        // Handle
        Renderer.ctx.fillStyle = handleColor;
        Renderer.ctx.fillRect(-1, 0, 3, 5);

        // Blade
        Renderer.ctx.fillStyle = bladeColor;
        Renderer.ctx.fillRect(-1, -8, 3, 9);

        // Blade tip
        Renderer.ctx.fillRect(0, -10, 1, 2);

        Renderer.ctx.restore();
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
