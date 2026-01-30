/**
 * NPC entity class
 */
class NPC {
    constructor(config) {
        this.id = config.id;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.sprite = config.sprite || 'npc';

        // Dimensions
        this.width = config.width || 16;
        this.height = config.height || 16;
        this.hitboxWidth = config.hitboxWidth || 14;
        this.hitboxHeight = config.hitboxHeight || 14;

        // Interaction
        this.interactionRadius = config.interactionRadius || 24;
        this.dialogue = config.dialogue;
        this.dialogueOnce = config.dialogueOnce || false;
        this.afterDialogue = config.afterDialogue || null;
        this.hasSpoken = false;

        // Flags
        this.requiresFlag = config.requiresFlag || null;
        this.setsFlag = config.setsFlag || null;

        // Shop
        this.isShop = config.isShop || false;
        this.shopItems = config.shopItems || [];

        // Boss
        this.isBoss = config.isBoss || false;
        this.enemyId = config.enemyId || null;
        this.blocksPath = config.blocksPath || false;
        this.removeOnSpare = config.removeOnSpare || false;
        this.removeOnKill = config.removeOnKill || false;

        // Animation
        this.direction = config.direction || 'down';
        this.frame = 0;
        this.frameTimer = 0;
        this.frameDelay = 0.3;
        this.animating = config.animating || false;

        // State
        this.active = true;
        this.visible = true;

        // Movement (for wandering NPCs)
        this.canMove = config.canMove || false;
        this.movePattern = config.movePattern || 'none';
        this.moveTimer = 0;
        this.moveInterval = config.moveInterval || 2;
    }

    /**
     * Update NPC
     */
    update(dt) {
        if (!this.active) return;

        // Animation
        if (this.animating) {
            this.frameTimer += dt;
            if (this.frameTimer >= this.frameDelay) {
                this.frameTimer = 0;
                this.frame = (this.frame + 1) % 4;
            }
        }

        // Simple wandering
        if (this.canMove && this.movePattern === 'wander') {
            this.moveTimer += dt;
            if (this.moveTimer >= this.moveInterval) {
                this.moveTimer = 0;
                // Random direction change
                const directions = ['up', 'down', 'left', 'right'];
                this.direction = Utils.randomChoice(directions);
            }
        }
    }

    /**
     * Render NPC
     */
    render(cameraX = 0, cameraY = 0) {
        if (!this.visible || !this.active) return;

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

        Renderer.drawSprite(
            this.sprite,
            screenX,
            screenY,
            this.frame,
            frameRow,
            this.width,
            this.height
        );

        // Debug: show interaction radius
        if (Game.debug) {
            Renderer.drawCircle(
                screenX + this.width / 2,
                screenY + this.height / 2,
                this.interactionRadius,
                'rgba(0,255,0,0.3)'
            );
        }
    }

    /**
     * Get hitbox for collision
     */
    getHitbox() {
        return {
            x: this.x + (this.width - this.hitboxWidth) / 2,
            y: this.y + (this.height - this.hitboxHeight) / 2,
            width: this.hitboxWidth,
            height: this.hitboxHeight
        };
    }

    /**
     * Get center position
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Check if player can interact
     */
    canInteract(playerX, playerY) {
        if (!this.active) return false;

        // Check flag requirements
        if (this.requiresFlag) {
            if (!this.checkFlagRequirement()) return false;
        }

        const center = this.getCenter();
        const dist = Utils.distance(playerX, playerY, center.x, center.y);

        return dist <= this.interactionRadius;
    }

    /**
     * Check flag requirement
     */
    checkFlagRequirement() {
        if (!this.requiresFlag) return true;

        // Support OR conditions with |
        const conditions = this.requiresFlag.split('|');

        for (const condition of conditions) {
            const trimmed = condition.trim();
            const isNegated = trimmed.startsWith('!');
            const flagName = isNegated ? trimmed.slice(1) : trimmed;
            const flagValue = Save.getFlag(flagName);

            if (isNegated) {
                if (!flagValue) return true;
            } else {
                if (flagValue) return true;
            }
        }

        return false;
    }

    /**
     * Handle interaction
     */
    interact() {
        if (!this.active) return null;

        // Determine which dialogue to use
        let dialogueId = this.dialogue;

        // Check for route-specific dialogue
        const save = Save.getCurrent();
        if (save && Flags.isViolenceRoute(save)) {
            const violenceDialogue = `${this.dialogue}_violence`;
            if (Dialogues.exists(violenceDialogue)) {
                dialogueId = violenceDialogue;
            }
        }

        // If already spoken and has after dialogue
        if (this.hasSpoken && this.afterDialogue) {
            dialogueId = this.afterDialogue;
        }

        // Mark as spoken if one-time
        if (this.dialogueOnce) {
            this.hasSpoken = true;
        }

        // Set flags if configured
        if (this.setsFlag) {
            Save.setFlag(this.setsFlag, true);
        }

        return {
            type: this.isBoss ? 'boss' : (this.isShop ? 'shop' : 'dialogue'),
            dialogueId,
            enemyId: this.enemyId,
            shopItems: this.shopItems,
            npc: this
        };
    }

    /**
     * Face towards a point
     */
    faceTowards(targetX, targetY) {
        const center = this.getCenter();
        const dx = targetX - center.x;
        const dy = targetY - center.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
        }
    }

    /**
     * Remove this NPC
     */
    remove() {
        this.active = false;
        this.visible = false;
    }
}

/**
 * NPC Manager
 */
const NPCManager = {
    npcs: [],

    /**
     * Clear all NPCs
     */
    clear() {
        this.npcs = [];
    },

    /**
     * Add NPC
     */
    add(config) {
        const npc = new NPC(config);
        this.npcs.push(npc);
        return npc;
    },

    /**
     * Get NPC by ID
     */
    get(id) {
        return this.npcs.find(npc => npc.id === id);
    },

    /**
     * Remove NPC by ID
     */
    remove(id) {
        const npc = this.get(id);
        if (npc) {
            npc.remove();
        }
    },

    /**
     * Update all NPCs
     */
    update(dt) {
        for (const npc of this.npcs) {
            npc.update(dt);
        }
    },

    /**
     * Render all NPCs
     */
    render(cameraX = 0, cameraY = 0) {
        for (const npc of this.npcs) {
            npc.render(cameraX, cameraY);
        }
    },

    /**
     * Check for interaction
     */
    checkInteraction(playerX, playerY) {
        for (const npc of this.npcs) {
            if (npc.canInteract(playerX, playerY)) {
                return npc;
            }
        }
        return null;
    },

    /**
     * Check collision with NPCs that block path
     */
    checkCollision(hitbox) {
        for (const npc of this.npcs) {
            if (!npc.active || !npc.blocksPath) continue;

            const npcHitbox = npc.getHitbox();
            if (Utils.rectCollision(hitbox, npcHitbox)) {
                return npc;
            }
        }
        return null;
    }
};

// Make globally available
window.NPC = NPC;
window.NPCManager = NPCManager;
