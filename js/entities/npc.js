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

        // Bank
        this.isBank = config.isBank || false;

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

        // Custom appearance for themed NPCs
        this.appearance = config.appearance || null;

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

        // If custom appearance, draw themed NPC
        if (this.appearance) {
            this.renderCustomAppearance(screenX, screenY);
        } else {
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
        }

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
     * Render custom themed appearance
     */
    renderCustomAppearance(screenX, screenY) {
        const app = this.appearance;
        const time = Date.now() / 1000;

        // Body/torso
        Renderer.drawRect(screenX + 4, screenY + 6, 8, 8, app.bodyColor || '#666');

        // Head
        Renderer.drawRect(screenX + 3, screenY, 10, 7, app.skinColor || '#fa6');

        // Hair
        if (app.hairColor) {
            Renderer.drawRect(screenX + 3, screenY, 10, 3, app.hairColor);
        }

        // Eyes
        Renderer.drawRect(screenX + 4, screenY + 3, 2, 2, '#222');
        Renderer.drawRect(screenX + 9, screenY + 3, 2, 2, '#222');

        // Legs
        Renderer.drawRect(screenX + 4, screenY + 14, 3, 4, app.legColor || '#444');
        Renderer.drawRect(screenX + 9, screenY + 14, 3, 4, app.legColor || '#444');

        // Custom details based on type
        if (app.type === 'butcher') {
            // White apron
            Renderer.drawRect(screenX + 4, screenY + 8, 8, 6, '#eee');
            // Blood stains
            Renderer.drawRect(screenX + 5, screenY + 9, 2, 2, '#a33');
            Renderer.drawRect(screenX + 9, screenY + 11, 2, 1, '#a33');
        } else if (app.type === 'blacksmith') {
            // Leather apron
            Renderer.drawRect(screenX + 4, screenY + 8, 8, 6, '#654');
            // Hammer in hand
            Renderer.drawRect(screenX + 13, screenY + 8, 3, 6, '#876');
            Renderer.drawRect(screenX + 12, screenY + 6, 5, 3, '#888');
        } else if (app.type === 'mage') {
            // Wizard hat
            Renderer.ctx.fillStyle = app.bodyColor || '#63c';
            Renderer.ctx.beginPath();
            Renderer.ctx.moveTo(screenX + 8, screenY - 6);
            Renderer.ctx.lineTo(screenX + 14, screenY + 2);
            Renderer.ctx.lineTo(screenX + 2, screenY + 2);
            Renderer.ctx.closePath();
            Renderer.ctx.fill();
            // Star on hat
            const starGlow = Math.sin(time * 3) * 0.3 + 0.7;
            Renderer.drawRect(screenX + 7, screenY - 3, 2, 2, `rgba(255,255,100,${starGlow})`);
            // Robe flows down
            Renderer.drawRect(screenX + 3, screenY + 14, 10, 4, app.bodyColor || '#63c');
        } else if (app.type === 'elder') {
            // Long beard
            Renderer.drawRect(screenX + 5, screenY + 5, 6, 5, '#ccc');
            // Crown/fancy hat
            Renderer.drawRect(screenX + 3, screenY - 2, 10, 3, '#fc0');
            Renderer.drawRect(screenX + 5, screenY - 4, 2, 2, '#fc0');
            Renderer.drawRect(screenX + 9, screenY - 4, 2, 2, '#fc0');
            // Robe
            Renderer.drawRect(screenX + 3, screenY + 14, 10, 4, app.bodyColor || '#a48');
        } else if (app.type === 'villager') {
            // Simple tunic detail
            Renderer.drawRect(screenX + 6, screenY + 7, 4, 1, app.accentColor || '#543');
        } else if (app.type === 'child') {
            // Smaller proportions already, just add a cute detail
            Renderer.drawRect(screenX + 6, screenY + 2, 3, 2, '#faa'); // rosy cheeks
        } else if (app.type === 'mysterious') {
            // Hooded cloak figure
            const time = Date.now() / 1000;
            // Hooded cloak covers everything
            Renderer.drawRect(screenX + 2, screenY - 2, 12, 4, app.bodyColor || '#446');
            Renderer.drawRect(screenX + 1, screenY + 2, 14, 16, app.bodyColor || '#446');
            // Hood shadow
            Renderer.drawRect(screenX + 4, screenY + 1, 8, 4, '#223');
            // Glowing eyes in hood
            const eyeGlow = Math.sin(time * 2) * 0.3 + 0.7;
            Renderer.drawRect(screenX + 5, screenY + 3, 2, 2, `rgba(150,200,255,${eyeGlow})`);
            Renderer.drawRect(screenX + 9, screenY + 3, 2, 2, `rgba(150,200,255,${eyeGlow})`);
        } else if (app.type === 'crazy_eye') {
            // Character with misaligned eyes (one higher than the other)
            const eyeOffset = app.eyeOffset || 2;
            // Messy hair
            Renderer.drawRect(screenX + 2, screenY - 1, 12, 4, app.hairColor || '#543');
            Renderer.drawRect(screenX + 3, screenY - 2, 3, 2, app.hairColor || '#543');
            Renderer.drawRect(screenX + 10, screenY - 2, 3, 2, app.hairColor || '#543');
            // Redraw eyes with offset - left eye higher
            Renderer.drawRect(screenX + 4, screenY + 3 - eyeOffset, 2, 2, '#222');
            // Right eye lower and slightly wider (crazy look)
            Renderer.drawRect(screenX + 9, screenY + 3 + 1, 3, 2, '#222');
            // Eyebrows at different angles
            Renderer.drawRect(screenX + 3, screenY + 1 - eyeOffset, 4, 1, app.hairColor || '#543');
            Renderer.drawRect(screenX + 9, screenY + 2, 4, 1, app.hairColor || '#543');
            // Slightly crooked mouth
            Renderer.drawRect(screenX + 5, screenY + 5, 4, 1, '#644');
            Renderer.drawRect(screenX + 8, screenY + 6, 2, 1, '#644');
            // Tattered clothes
            Renderer.drawRect(screenX + 3, screenY + 14, 4, 4, app.bodyColor || '#654');
            Renderer.drawRect(screenX + 9, screenY + 14, 4, 5, app.bodyColor || '#654');
        } else if (app.type === 'banker') {
            // Professional banker with monocle and fancy clothes
            // Top hat
            Renderer.drawRect(screenX + 4, screenY - 6, 8, 4, '#222');
            Renderer.drawRect(screenX + 2, screenY - 2, 12, 3, '#222');
            // Monocle on right eye
            Renderer.ctx.strokeStyle = '#fc0';
            Renderer.ctx.lineWidth = 1;
            Renderer.ctx.beginPath();
            Renderer.ctx.arc(screenX + 10, screenY + 4, 3, 0, Math.PI * 2);
            Renderer.ctx.stroke();
            // Monocle chain
            Renderer.drawRect(screenX + 12, screenY + 5, 3, 1, '#fc0');
            // Mustache
            Renderer.drawRect(screenX + 4, screenY + 5, 3, 2, app.hairColor || '#444');
            Renderer.drawRect(screenX + 9, screenY + 5, 3, 2, app.hairColor || '#444');
            // Bow tie
            Renderer.drawRect(screenX + 6, screenY + 7, 4, 2, '#a22');
            Renderer.drawRect(screenX + 5, screenY + 7, 2, 2, '#a22');
            Renderer.drawRect(screenX + 9, screenY + 7, 2, 2, '#a22');
            // Vest
            Renderer.drawRect(screenX + 5, screenY + 9, 6, 5, '#654');
            // Suit jacket
            Renderer.drawRect(screenX + 3, screenY + 9, 3, 5, app.bodyColor || '#224');
            Renderer.drawRect(screenX + 10, screenY + 9, 3, 5, app.bodyColor || '#224');
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

        // Determine interaction type
        let interactionType = 'dialogue';
        if (this.isBoss) {
            interactionType = 'boss';
        } else if (this.isBank) {
            interactionType = 'bank';
        } else if (this.isShop) {
            interactionType = 'shop';
        }

        return {
            type: interactionType,
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
