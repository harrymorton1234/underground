/**
 * Overworld system - room navigation, NPCs, exploration
 */
const Overworld = {
    // Current room
    currentRoom: null,
    roomId: null,

    // Camera
    camera: {
        x: 0,
        y: 0,
        width: 320,
        height: 240
    },

    // Random encounter
    encounterSteps: 0,
    encounterThreshold: 0,

    // Transitions
    transitioning: false,
    transitionTarget: null,

    // Room-entered dialogues
    enteredDialogues: {},

    // Companion/follower system
    companion: null,
    companionHistory: [], // Position history for smooth following

    /**
     * Load a room
     */
    loadRoom(roomId, playerX = null, playerY = null) {
        const room = Rooms.get(roomId);
        if (!room) {
            console.warn(`Room not found: ${roomId}`);
            return;
        }

        this.currentRoom = room;
        this.roomId = roomId;

        // Clear NPCs
        NPCManager.clear();

        // Add NPCs from room data
        if (room.npcs) {
            for (const npcData of room.npcs) {
                // Check if NPC should appear based on flags
                if (npcData.requiresFlag && !this.checkFlag(npcData.requiresFlag)) {
                    continue;
                }

                // Check if NPC was removed (boss defeated, etc.)
                if (npcData.removeOnSpare && Save.getFlag(`${npcData.id}_spared`)) {
                    continue;
                }
                if (npcData.removeOnKill && Save.getFlag(`${npcData.id}_killed`)) {
                    continue;
                }

                NPCManager.add(npcData);
            }
        }

        // Position player
        if (playerX !== null && playerY !== null) {
            Player.init(playerX, playerY);
        } else if (room.playerStart) {
            Player.init(room.playerStart.x, room.playerStart.y);
        }

        // Handle companion for village journey
        if (roomId === 'next_level' && Save.getFlag('village_intro_seen')) {
            // Start companion after dialogue has been seen
            this.setCompanion({
                x: Player.x,
                y: Player.y + 24,
                appearance: { type: 'mysterious', skinColor: '#aac', bodyColor: '#446', hairColor: '#668' }
            });
        } else if (roomId === 'village_staircase') {
            // Always have companion in staircase leading the way
            if (!this.companion && Save.getFlag('village_intro_seen')) {
                this.setCompanion({
                    x: Player.x,
                    y: Player.y - 20,
                    appearance: { type: 'mysterious', skinColor: '#aac', bodyColor: '#446', hairColor: '#668' },
                    leading: true,
                    targetX: 48,
                    targetY: 370
                });
            } else if (this.companion) {
                // Reposition companion ahead of player when entering staircase
                this.companion.x = Player.x;
                this.companion.y = Player.y - 20;
                this.companion.leading = true;
                this.companion.targetX = 48;
                this.companion.targetY = 370;
                this.companion.waiting = false;
                this.companionHistory = [];
                for (let i = 0; i < 20; i++) {
                    this.companionHistory.push({ x: this.companion.x, y: this.companion.y });
                }
            }
        } else if (roomId === 'village_square') {
            // Remove companion when arriving at village (they become the elder NPC)
            this.removeCompanion();
        }

        // Update save data
        const save = Save.getCurrent();
        if (save) {
            save.roomId = roomId;
            save.x = Player.x;
            save.y = Player.y;
        }

        // Reset encounter counter
        this.resetEncounterCounter();

        // Check for room enter dialogue
        if (room.onEnter && !this.enteredDialogues[roomId]) {
            if (!room.onEnterOnce || !Save.getFlag(`entered_${roomId}`)) {
                Game.setState(Game.states.DIALOGUE, {
                    dialogueId: room.onEnter,
                    callback: () => {
                        if (room.onEnterOnce) {
                            Save.setFlag(`entered_${roomId}`, true);
                        }
                    }
                });
            }
            this.enteredDialogues[roomId] = true;
        }

        // Record secret discovery
        if (room.secret && room.secretId) {
            Save.recordSecret(room.secretId);
        }

        // Change music based on area
        Audio.playAreaMusic(roomId);
    },

    /**
     * Check flag (supports OR with |)
     */
    checkFlag(flagExpr) {
        const conditions = flagExpr.split('|');

        for (const condition of conditions) {
            const trimmed = condition.trim();
            const isNegated = trimmed.startsWith('!');
            const flagName = isNegated ? trimmed.slice(1) : trimmed;
            const flagValue = Save.getFlag(flagName);

            if (isNegated ? !flagValue : flagValue) {
                return true;
            }
        }

        return false;
    },

    /**
     * Reset encounter counter
     */
    resetEncounterCounter() {
        this.encounterSteps = 0;
        this.encounterThreshold = Utils.randomInt(20, 50);
    },

    /**
     * Update overworld
     */
    update(dt) {
        if (this.transitioning) {
            this.updateTransition(dt);
            return;
        }

        // Update player
        const prevX = Player.x;
        const prevY = Player.y;

        Player.update(dt, this.currentRoom);

        // Check NPC collision (blocking NPCs)
        const playerHitbox = Player.getHitbox();
        const blockingNPC = NPCManager.checkCollision(playerHitbox);
        if (blockingNPC) {
            Player.x = prevX;
            Player.y = prevY;
        }

        // Update camera
        this.updateCamera();

        // Update NPCs
        NPCManager.update(dt);

        // Update companion
        this.updateCompanion(dt);

        // Spawn companion after dialogue in next_level room
        if (this.roomId === 'next_level' && Save.getFlag('village_intro_seen')) {
            // Always remove the NPC version of ??? once flag is set
            const guideNpc = NPCManager.get('mysterious_guide');
            if (guideNpc) {
                guideNpc.visible = false;
                guideNpc.active = false;
            }

            // Create companion that leads the way - start near the exit
            if (!this.companion) {
                this.setCompanion({
                    x: 72,
                    y: 70,
                    appearance: { type: 'mysterious', skinColor: '#aac', bodyColor: '#446', hairColor: '#668' },
                    leading: true,
                    targetX: 72,
                    targetY: 90
                });
            }
        }

        // Check for transitions
        this.checkTransitions();

        // Check for interactions
        if (Input.isPressed('confirm')) {
            this.checkInteraction();
        }

        // Check for save points
        this.checkSavePoints();

        // Check for random encounters (but not during transitions)
        if (!this.transitioning && (Player.velX !== 0 || Player.velY !== 0)) {
            this.checkEncounter(dt);
        }

        // Open menu
        if (Input.isPressed('menu')) {
            Game.setState(Game.states.MENU);
        }


        // Update save position
        const save = Save.getCurrent();
        if (save) {
            save.x = Player.x;
            save.y = Player.y;
        }
    },

    /**
     * Update camera to follow player
     */
    updateCamera() {
        const room = this.currentRoom;
        const roomWidth = room.width * 16;
        const roomHeight = room.height * 16;

        // Center camera on player
        let targetX = Player.x + Player.spriteWidth / 2 - this.camera.width / 2;
        let targetY = Player.y + Player.spriteHeight / 2 - this.camera.height / 2;

        // Clamp to room bounds
        targetX = Utils.clamp(targetX, 0, Math.max(0, roomWidth - this.camera.width));
        targetY = Utils.clamp(targetY, 0, Math.max(0, roomHeight - this.camera.height));

        // Smooth follow
        this.camera.x = Utils.lerp(this.camera.x, targetX, 0.1);
        this.camera.y = Utils.lerp(this.camera.y, targetY, 0.1);
    },

    /**
     * Set up a companion to follow the player
     */
    setCompanion(config) {
        this.companion = {
            x: config.x || Player.x,
            y: config.y || Player.y + 24,
            appearance: config.appearance || null,
            direction: 'down',
            active: true,
            leading: config.leading || false,
            targetX: config.targetX || null,
            targetY: config.targetY || null,
            waiting: false
        };
        this.companionHistory = [];
        // Fill history with current position
        for (let i = 0; i < 20; i++) {
            this.companionHistory.push({ x: this.companion.x, y: this.companion.y });
        }
    },

    /**
     * Remove the companion
     */
    removeCompanion() {
        this.companion = null;
        this.companionHistory = [];
    },

    /**
     * Update companion position to follow player
     */
    updateCompanion(dt) {
        if (!this.companion || !this.companion.active) return;

        // Calculate distance to player
        const distToPlayer = Math.sqrt(
            Math.pow(Player.x - this.companion.x, 2) +
            Math.pow(Player.y - this.companion.y, 2)
        );

        if (this.companion.leading && this.companion.targetX !== null) {
            // Leading mode - move toward target, but wait if player is too far
            if (distToPlayer > 60) {
                // Player is too far behind, wait for them
                this.companion.waiting = true;
            } else if (distToPlayer < 40) {
                this.companion.waiting = false;
            }

            if (!this.companion.waiting) {
                const dx = this.companion.targetX - this.companion.x;
                const dy = this.companion.targetY - this.companion.y;
                const distToTarget = Math.sqrt(dx * dx + dy * dy);

                if (distToTarget > 4) {
                    const speed = 1.2;
                    this.companion.x += (dx / distToTarget) * speed;
                    this.companion.y += (dy / distToTarget) * speed;

                    // Update direction
                    if (Math.abs(dx) > Math.abs(dy)) {
                        this.companion.direction = dx > 0 ? 'right' : 'left';
                    } else {
                        this.companion.direction = dy > 0 ? 'down' : 'up';
                    }
                }
            } else {
                // Face the player while waiting
                const dx = Player.x - this.companion.x;
                const dy = Player.y - this.companion.y;
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.companion.direction = dx > 0 ? 'right' : 'left';
                } else {
                    this.companion.direction = dy > 0 ? 'down' : 'up';
                }
            }
        } else {
            // Following mode - stay behind player
            this.companionHistory.push({ x: Player.x, y: Player.y });

            if (this.companionHistory.length > 20) {
                this.companionHistory.shift();
            }

            const followIndex = Math.max(0, this.companionHistory.length - 15);
            const targetPos = this.companionHistory[followIndex];

            const dx = targetPos.x - this.companion.x;
            const dy = targetPos.y - this.companion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 4) {
                const speed = 2;
                this.companion.x += (dx / dist) * speed;
                this.companion.y += (dy / dist) * speed;

                if (Math.abs(dx) > Math.abs(dy)) {
                    this.companion.direction = dx > 0 ? 'right' : 'left';
                } else {
                    this.companion.direction = dy > 0 ? 'down' : 'up';
                }
            }
        }
    },

    /**
     * Render companion
     */
    renderCompanion() {
        if (!this.companion || !this.companion.active) return;

        const screenX = Math.floor(this.companion.x - this.camera.x);
        const screenY = Math.floor(this.companion.y - this.camera.y);
        const app = this.companion.appearance;
        const time = Date.now() / 1000;

        if (app) {
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

            // Cloak/robe for mysterious figure
            if (app.type === 'mysterious') {
                // Hooded cloak
                Renderer.drawRect(screenX + 2, screenY - 2, 12, 4, app.bodyColor || '#446');
                Renderer.drawRect(screenX + 1, screenY + 2, 14, 16, app.bodyColor || '#446');
                // Hood shadow
                Renderer.drawRect(screenX + 4, screenY + 1, 8, 4, '#223');
                // Glowing eyes in hood
                const eyeGlow = Math.sin(time * 2) * 0.3 + 0.7;
                Renderer.drawRect(screenX + 5, screenY + 3, 2, 2, `rgba(150,200,255,${eyeGlow})`);
                Renderer.drawRect(screenX + 9, screenY + 3, 2, 2, `rgba(150,200,255,${eyeGlow})`);
            }
        } else {
            // Default appearance
            Renderer.drawRect(screenX + 4, screenY, 8, 16, '#888');
        }
    },

    // Track which locked doors we've shown dialogue for this session
    lockedDoorsShown: {},

    /**
     * Check room transitions
     */
    checkTransitions() {
        if (!this.currentRoom.transitions) return;

        const playerHitbox = Player.getHitbox();

        for (const transition of this.currentRoom.transitions) {
            const transitionRect = {
                x: transition.x,
                y: transition.y,
                width: transition.width,
                height: transition.height
            };

            if (Utils.rectCollision(playerHitbox, transitionRect)) {
                // Check flag requirements
                if (transition.requiresFlag && !this.checkFlag(transition.requiresFlag)) {
                    // Can't use this transition yet
                    continue;
                }

                // Check item requirements
                if (transition.requiresItem && !Inventory.hasItem(transition.requiresItem)) {
                    // Show locked door dialogue if available and not shown recently
                    const doorKey = `${this.roomId}_${transition.to}`;
                    if (transition.lockedDialogue && !this.lockedDoorsShown[doorKey]) {
                        this.lockedDoorsShown[doorKey] = true;
                        Audio.playSFX('cancel');
                        Game.setState(Game.states.DIALOGUE, {
                            dialogueId: transition.lockedDialogue
                        });
                        // Reset after a short delay so it can show again later
                        setTimeout(() => {
                            this.lockedDoorsShown[doorKey] = false;
                        }, 3000);
                    }
                    continue;
                }

                this.startTransition(transition);
                break;
            }
        }
    },

    /**
     * Start room transition
     */
    startTransition(transition) {
        this.transitioning = true;
        this.transitionTarget = transition;

        Player.freeze();
        Renderer.fadeOut('#000', 4);
    },

    /**
     * Update transition
     */
    updateTransition(dt) {
        if (Renderer.isFadeComplete() && Renderer.fadeEffect.alpha === 1) {
            // Load new room
            this.loadRoom(
                this.transitionTarget.to,
                this.transitionTarget.playerX,
                this.transitionTarget.playerY
            );

            Renderer.fadeIn(4);
            this.transitioning = false;
            this.transitionTarget = null;

            Player.unfreeze();
        }
    },

    /**
     * Check for NPC interaction
     */
    checkInteraction() {
        const interactionPoint = Player.getInteractionPoint();

        // Check NPCs
        const npc = NPCManager.checkInteraction(interactionPoint.x, interactionPoint.y);
        if (npc) {
            const result = npc.interact();

            // Face each other
            npc.faceTowards(Player.x, Player.y);
            Player.faceTowards(npc.x, npc.y);

            if (result.type === 'boss') {
                // Start boss battle
                Game.setState(Game.states.DIALOGUE, {
                    dialogueId: result.dialogueId,
                    callback: () => {
                        Game.setState(Game.states.BATTLE, {
                            enemy: result.enemyId,
                            onEnd: (spared) => {
                                if (spared) {
                                    Save.setFlag(`${npc.id}_spared`, true);
                                    if (npc.removeOnSpare) {
                                        npc.remove();
                                    }
                                } else {
                                    Save.setFlag(`${npc.id}_killed`, true);
                                    if (npc.removeOnKill) {
                                        npc.remove();
                                    }
                                }
                            }
                        });
                    }
                });
            } else if (result.type === 'shop') {
                // Open shop - store shop items for callback
                const shopItems = result.shopItems;
                Game.setState(Game.states.DIALOGUE, {
                    dialogueId: result.dialogueId,
                    callback: () => {
                        // Open shop menu after dialogue
                        Inventory.openShop(shopItems);
                        Game.setState(Game.states.SHOP);
                    }
                });
            } else {
                // Normal dialogue
                Game.setState(Game.states.DIALOGUE, {
                    dialogueId: result.dialogueId
                });
            }

            return;
        }

        // Check interactables
        if (this.currentRoom.interactables) {
            const playerCenter = Player.getCenter();

            for (const interactable of this.currentRoom.interactables) {
                // Check flag requirements
                if (interactable.requiresFlag && !this.checkFlag(interactable.requiresFlag)) {
                    continue;
                }

                // Check distance to interactable center
                const interactableCenter = {
                    x: interactable.x + interactable.width / 2,
                    y: interactable.y + interactable.height / 2
                };

                const dist = Utils.distance(playerCenter.x, playerCenter.y, interactableCenter.x, interactableCenter.y);
                const interactionRange = Math.max(interactable.width, interactable.height) + 20;

                if (dist < interactionRange) {
                    // Handle dialogueOnce - track which interactables have been interacted with
                    let dialogueId = interactable.dialogue;
                    if (interactable.dialogueOnce) {
                        const interactedKey = `${this.roomId}_${interactable.type}_interacted`;
                        if (Save.getFlag(interactedKey)) {
                            // Use afterDialogue if available
                            dialogueId = interactable.afterDialogue || interactable.dialogue;
                        } else {
                            // Mark as interacted after dialogue
                            Game.setState(Game.states.DIALOGUE, {
                                dialogueId: dialogueId,
                                callback: () => {
                                    Save.setFlag(interactedKey, true);
                                }
                            });
                            return;
                        }
                    }
                    Game.setState(Game.states.DIALOGUE, {
                        dialogueId: dialogueId
                    });
                    return;
                }
            }
        }
    },

    /**
     * Check save points
     */
    checkSavePoints() {
        if (!this.currentRoom.savePoints) return;

        const playerCenter = Player.getCenter();

        for (const savePoint of this.currentRoom.savePoints) {
            const dist = Utils.distance(playerCenter.x, playerCenter.y, savePoint.x + 8, savePoint.y + 8);

            if (dist < 16 && Input.isPressed('confirm')) {
                // Heal player and store save location
                const save = Save.getCurrent();
                if (save) {
                    save.hp = save.maxHp;
                    save.lastSaveRoom = this.roomId;
                    save.lastSaveX = savePoint.x + 8;
                    save.lastSaveY = savePoint.y + 16;
                }

                // Show save dialogue
                Audio.playSFX('save');
                Game.setState(Game.states.DIALOGUE, {
                    dialogueId: savePoint.dialogue,
                    callback: () => {
                        // Open save menu
                        Game.setState(Game.states.SAVE_MENU, { mode: 'save' });
                    }
                });
            }
        }
    },

    /**
     * Check if player is near any door/transition
     * @param {number} safeRadius - Distance from door center to consider "safe"
     */
    isNearDoor(safeRadius = 32) {
        if (!this.currentRoom || !this.currentRoom.transitions) return false;

        const playerCenter = Player.getCenter();

        for (const transition of this.currentRoom.transitions) {
            // Get center of the transition zone
            const doorCenterX = transition.x + transition.width / 2;
            const doorCenterY = transition.y + transition.height / 2;

            // Check distance from player to door
            const dist = Utils.distance(playerCenter.x, playerCenter.y, doorCenterX, doorCenterY);

            // Also consider the size of the door itself
            const doorRadius = Math.max(transition.width, transition.height) / 2;

            if (dist < safeRadius + doorRadius) {
                return true;
            }
        }

        return false;
    },

    /**
     * Check for random encounter
     */
    checkEncounter(dt) {
        if (!this.currentRoom.encounterRate || this.currentRoom.encounterRate === 0) return;

        // Don't spawn encounters near doors
        if (this.isNearDoor(32)) return;

        // Increment steps
        this.encounterSteps++;

        if (this.encounterSteps >= this.encounterThreshold) {
            // Random chance based on encounter rate
            if (Math.random() < this.currentRoom.encounterRate) {
                this.triggerEncounter();
            }
            this.resetEncounterCounter();
        }
    },

    /**
     * Trigger random encounter
     */
    triggerEncounter() {
        const enemies = this.currentRoom.encounterEnemies;

        // No encounter if no enemies defined
        if (!enemies || enemies.length === 0) {
            return;
        }

        const enemyId = Utils.randomChoice(enemies);

        // Flash and start battle
        Renderer.flash('#fff', 0.2);
        Audio.playSFX('confirm');

        setTimeout(() => {
            Game.setState(Game.states.BATTLE, { enemy: enemyId });
        }, 300);
    },


    /**
     * Render overworld
     */
    render() {
        // Background
        Renderer.clear('#000');

        // Render room tiles
        this.renderTiles();

        // Render decorations
        this.renderDecorations();

        // Render interactables
        this.renderInteractables();

        // Render save points
        this.renderSavePoints();

        // Render NPCs
        NPCManager.render(this.camera.x, this.camera.y);

        // Render companion (before player so player appears in front)
        this.renderCompanion();

        // Render player
        Player.render(this.camera.x, this.camera.y);

        // Render room name (debug)
        if (Game.debug && this.currentRoom) {
            Renderer.drawText(this.currentRoom.name, 5, 5, '#fff');
        }
    },

    /**
     * Render room tiles
     */
    renderTiles() {
        if (!this.currentRoom) return;

        const tiles = Rooms.parseTileData(this.currentRoom);
        const tileSize = 16;

        // Calculate visible tile range
        const startCol = Math.floor(this.camera.x / tileSize);
        const endCol = Math.ceil((this.camera.x + this.camera.width) / tileSize);
        const startRow = Math.floor(this.camera.y / tileSize);
        const endRow = Math.ceil((this.camera.y + this.camera.height) / tileSize);

        for (let row = startRow; row < endRow && row < tiles.length; row++) {
            for (let col = startCol; col < endCol && col < tiles[row].length; col++) {
                const tile = tiles[row][col];
                const screenX = col * tileSize - this.camera.x;
                const screenY = row * tileSize - this.camera.y;

                // Draw tile based on type
                switch (tile) {
                    case 0: // Floor
                        Renderer.drawRect(screenX, screenY, tileSize, tileSize, '#222');
                        break;
                    case 1: // Wall
                        Renderer.drawRect(screenX, screenY, tileSize, tileSize, '#444');
                        Renderer.drawRect(screenX + 1, screenY + 1, tileSize - 2, tileSize - 2, '#333');
                        break;
                    case 2: // Save point
                        Renderer.drawRect(screenX, screenY, tileSize, tileSize, '#222');
                        // Draw save point glow
                        const glow = Math.sin(performance.now() / 500) * 0.3 + 0.7;
                        Renderer.drawRect(screenX + 2, screenY + 2, tileSize - 4, tileSize - 4, `rgba(255,255,0,${glow})`);
                        break;
                    case 3: // Door/transition
                        Renderer.drawRect(screenX, screenY, tileSize, tileSize, '#111');
                        break;
                    case 4: // Crystal tile
                        Renderer.drawRect(screenX, screenY, tileSize, tileSize, '#224');
                        // Crystal shimmer
                        const shimmer = Math.sin(performance.now() / 300 + col * 0.5) * 0.2 + 0.6;
                        Renderer.drawRect(screenX + 4, screenY + 4, 8, 8, `rgba(100,200,255,${shimmer})`);
                        break;
                    case 5: // Dark pillar tile (skull room)
                        Renderer.drawRect(screenX, screenY, tileSize, tileSize, '#111');
                        // Skull glow
                        const skullGlow = Math.sin(performance.now() / 600 + row * 0.3) * 0.15 + 0.3;
                        Renderer.drawRect(screenX + 3, screenY + 3, 10, 10, `rgba(100,0,0,${skullGlow})`);
                        break;
                    case 6: // Tech panel
                        Renderer.drawRect(screenX, screenY, tileSize, tileSize, '#112');
                        // Blinking light
                        const blink = Math.sin(performance.now() / 200 + col + row) > 0 ? 1 : 0.3;
                        Renderer.drawRect(screenX + 6, screenY + 6, 4, 4, `rgba(0,255,100,${blink})`);
                        break;
                    case 7: // Locked door
                        Renderer.drawRect(screenX, screenY, tileSize, tileSize, '#321');
                        // Lock symbol
                        Renderer.drawRect(screenX + 5, screenY + 4, 6, 8, '#543');
                        Renderer.drawRect(screenX + 6, screenY + 6, 4, 4, '#ff0');
                        break;
                    case 8: // Swamp water
                        Renderer.drawRect(screenX, screenY, tileSize, tileSize, '#243');
                        // Ripple effect
                        const ripple = Math.sin(performance.now() / 500 + col * 0.7 + row * 0.5) * 0.2 + 0.4;
                        Renderer.drawRect(screenX + 2, screenY + 6, 12, 4, `rgba(60,120,80,${ripple})`);
                        break;
                }
            }
        }
    },

    /**
     * Render decorations
     */
    renderDecorations() {
        if (!this.currentRoom || !this.currentRoom.decorations) return;

        const time = performance.now() / 1000;

        for (const deco of this.currentRoom.decorations) {
            const screenX = deco.x - this.camera.x;
            const screenY = deco.y - this.camera.y;

            switch (deco.type) {
                case 'crystal_pillar':
                    // Tall crystal pillar
                    Renderer.drawRect(screenX, screenY, 16, 48, '#226');
                    Renderer.drawRect(screenX + 2, screenY + 2, 12, 44, '#338');
                    const crystalGlow = Math.sin(time * 2 + deco.x * 0.1) * 0.3 + 0.7;
                    Renderer.drawRect(screenX + 4, screenY + 8, 8, 32, `rgba(100,180,255,${crystalGlow})`);
                    break;

                case 'crystal_cluster':
                    // Small crystal cluster
                    const cGlow = Math.sin(time * 3 + deco.x * 0.2) * 0.2 + 0.8;
                    Renderer.ctx.fillStyle = `rgba(100,200,255,${cGlow})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 8, screenY);
                    Renderer.ctx.lineTo(screenX + 16, screenY + 12);
                    Renderer.ctx.lineTo(screenX + 12, screenY + 16);
                    Renderer.ctx.lineTo(screenX + 4, screenY + 16);
                    Renderer.ctx.lineTo(screenX, screenY + 12);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    break;

                case 'skull':
                    // Skull decoration
                    Renderer.drawRect(screenX, screenY, 16, 16, '#888');
                    Renderer.drawRect(screenX + 2, screenY + 4, 4, 4, '#000'); // Left eye
                    Renderer.drawRect(screenX + 10, screenY + 4, 4, 4, '#000'); // Right eye
                    Renderer.drawRect(screenX + 6, screenY + 10, 4, 4, '#000'); // Nose
                    break;

                case 'bone_pile':
                    // Bone pile
                    Renderer.drawRect(screenX, screenY + 8, 16, 4, '#ccc');
                    Renderer.drawRect(screenX + 4, screenY + 4, 8, 4, '#ddd');
                    Renderer.drawRect(screenX + 2, screenY, 4, 8, '#bbb');
                    break;

                case 'dark_pillar':
                    // Dark stone pillar
                    Renderer.drawRect(screenX, screenY, 16, 64, '#222');
                    Renderer.drawRect(screenX + 2, screenY + 2, 12, 60, '#333');
                    // Red glow cracks
                    const dGlow = Math.sin(time * 1.5 + deco.y * 0.05) * 0.3 + 0.5;
                    Renderer.drawRect(screenX + 6, screenY + 16, 4, 32, `rgba(150,0,0,${dGlow})`);
                    break;

                case 'tech_pillar':
                    // Tech pillar with lights
                    Renderer.drawRect(screenX, screenY, 16, 64, '#223');
                    Renderer.drawRect(screenX + 2, screenY + 2, 12, 60, '#334');
                    // Blinking lights
                    for (let i = 0; i < 4; i++) {
                        const on = Math.sin(time * 4 + i * 1.5 + deco.x * 0.1) > 0;
                        Renderer.drawRect(screenX + 6, screenY + 8 + i * 14, 4, 4, on ? '#0f0' : '#030');
                    }
                    break;

                case 'energy_conduit':
                    // Energy conduit with flowing effect
                    Renderer.drawRect(screenX, screenY, 8, 32, '#334');
                    const flow = (time * 2 + deco.y * 0.1) % 1;
                    for (let i = 0; i < 4; i++) {
                        const yOffset = ((flow + i * 0.25) % 1) * 32;
                        const alpha = 1 - Math.abs(yOffset / 32 - 0.5) * 2;
                        Renderer.drawRect(screenX + 2, screenY + yOffset, 4, 4, `rgba(0,255,200,${alpha})`);
                    }
                    break;

                case 'core_terminal':
                    // Terminal/console
                    Renderer.drawRect(screenX, screenY, 32, 24, '#223');
                    Renderer.drawRect(screenX + 2, screenY + 2, 28, 16, '#000');
                    // Screen flicker
                    const flicker = Math.random() > 0.95 ? 0.3 : 1;
                    Renderer.drawRect(screenX + 4, screenY + 4, 24, 12, `rgba(0,100,50,${flicker})`);
                    // Text lines
                    for (let i = 0; i < 3; i++) {
                        Renderer.drawRect(screenX + 6, screenY + 6 + i * 3, 10 + Math.random() * 8, 2, '#0f0');
                    }
                    break;

                case 'swamp_tree':
                    // Gnarled swamp tree
                    Renderer.drawRect(screenX + 6, screenY + 20, 12, 28, '#432');
                    // Branches
                    Renderer.drawRect(screenX, screenY + 8, 24, 16, '#354');
                    Renderer.drawRect(screenX + 4, screenY, 16, 12, '#243');
                    // Moss/vines
                    const mossWave = Math.sin(time * 0.5 + deco.x * 0.1) * 2;
                    Renderer.drawRect(screenX + 2, screenY + 20 + mossWave, 3, 8, '#363');
                    Renderer.drawRect(screenX + 18, screenY + 18 + mossWave, 3, 10, '#363');
                    break;

                case 'lily_pad':
                    // Lily pad floating on water
                    const bobY = Math.sin(time * 2 + deco.x * 0.2) * 1;
                    Renderer.ctx.fillStyle = '#4a4';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 8, screenY + 8 + bobY, 8, 6, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Flower
                    Renderer.ctx.fillStyle = '#faf';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 8, screenY + 6 + bobY, 3, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'mushroom_cluster':
                    // Glowing mushrooms
                    const mushroomGlow = Math.sin(time * 3 + deco.y * 0.1) * 0.3 + 0.7;
                    // Stems
                    Renderer.drawRect(screenX + 2, screenY + 10, 4, 8, '#ddd');
                    Renderer.drawRect(screenX + 10, screenY + 12, 3, 6, '#ddd');
                    // Caps
                    Renderer.ctx.fillStyle = `rgba(200,100,255,${mushroomGlow})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 4, screenY + 8, 6, 4, 0, Math.PI, 0);
                    Renderer.ctx.fill();
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 11, screenY + 10, 4, 3, 0, Math.PI, 0);
                    Renderer.ctx.fill();
                    break;

                // ==================== VILLAGE DECORATIONS ====================
                case 'butcher_shop':
                    // Butcher shop front with hanging meat and sign
                    // Building
                    Renderer.drawRect(screenX, screenY, 48, 48, '#543');
                    Renderer.drawRect(screenX + 2, screenY + 2, 44, 44, '#654');
                    // Roof
                    Renderer.drawRect(screenX - 4, screenY - 8, 56, 12, '#432');
                    // Sign
                    Renderer.drawRect(screenX + 8, screenY - 4, 32, 10, '#765');
                    Renderer.drawText ? null : 0; // Text handled elsewhere
                    // Door
                    Renderer.drawRect(screenX + 16, screenY + 24, 16, 24, '#321');
                    Renderer.drawRect(screenX + 28, screenY + 34, 3, 3, '#ff0'); // Handle
                    // Hanging meat hooks
                    for (let i = 0; i < 3; i++) {
                        const hookX = screenX + 6 + i * 14;
                        const swing = Math.sin(time * 2 + i) * 2;
                        // Hook
                        Renderer.drawRect(hookX + 2, screenY + 8, 2, 6, '#888');
                        // Meat (swinging)
                        Renderer.drawRect(hookX + swing, screenY + 14, 8, 12, '#a55');
                        Renderer.drawRect(hookX + 2 + swing, screenY + 16, 4, 8, '#833');
                    }
                    // Window with warm light
                    const butcherLight = Math.sin(time * 0.5) * 0.1 + 0.8;
                    Renderer.drawRect(screenX + 6, screenY + 10, 8, 8, `rgba(255,200,100,${butcherLight})`);
                    Renderer.drawRect(screenX + 34, screenY + 10, 8, 8, `rgba(255,200,100,${butcherLight})`);
                    break;

                case 'blacksmith_shop':
                    // Blacksmith with forge glow and anvil
                    // Building
                    Renderer.drawRect(screenX, screenY, 48, 48, '#444');
                    Renderer.drawRect(screenX + 2, screenY + 2, 44, 44, '#555');
                    // Roof
                    Renderer.drawRect(screenX - 4, screenY - 8, 56, 12, '#333');
                    // Chimney with smoke
                    Renderer.drawRect(screenX + 36, screenY - 20, 8, 16, '#444');
                    // Smoke particles
                    for (let i = 0; i < 3; i++) {
                        const smokeY = screenY - 24 - i * 8 - (time * 20 % 24);
                        const smokeAlpha = 0.3 - i * 0.1;
                        if (smokeAlpha > 0) {
                            Renderer.ctx.fillStyle = `rgba(150,150,150,${smokeAlpha})`;
                            Renderer.ctx.beginPath();
                            Renderer.ctx.arc(screenX + 40 + Math.sin(time + i) * 3, smokeY, 4 + i, 0, Math.PI * 2);
                            Renderer.ctx.fill();
                        }
                    }
                    // Forge glow
                    const forgeGlow = Math.sin(time * 8) * 0.2 + 0.8;
                    Renderer.drawRect(screenX + 4, screenY + 20, 16, 16, '#222');
                    Renderer.drawRect(screenX + 6, screenY + 22, 12, 12, `rgba(255,100,0,${forgeGlow})`);
                    Renderer.drawRect(screenX + 8, screenY + 24, 8, 8, `rgba(255,200,0,${forgeGlow})`);
                    // Anvil
                    Renderer.drawRect(screenX + 24, screenY + 32, 12, 8, '#333');
                    Renderer.drawRect(screenX + 22, screenY + 28, 16, 6, '#444');
                    // Hanging tools
                    Renderer.drawRect(screenX + 6, screenY + 6, 2, 10, '#666'); // Hammer
                    Renderer.drawRect(screenX + 4, screenY + 4, 6, 4, '#888');
                    Renderer.drawRect(screenX + 14, screenY + 6, 1, 12, '#666'); // Tongs
                    // Door
                    Renderer.drawRect(screenX + 28, screenY + 24, 14, 24, '#432');
                    Renderer.drawRect(screenX + 38, screenY + 34, 3, 3, '#ff0');
                    break;

                case 'magic_shop':
                    // Magic shop with glowing crystals and mystical atmosphere
                    // Building
                    Renderer.drawRect(screenX, screenY, 48, 48, '#324');
                    Renderer.drawRect(screenX + 2, screenY + 2, 44, 44, '#435');
                    // Pointed roof
                    Renderer.ctx.fillStyle = '#213';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 24, screenY - 20);
                    Renderer.ctx.lineTo(screenX + 52, screenY - 4);
                    Renderer.ctx.lineTo(screenX - 4, screenY - 4);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    // Crystal ball in window
                    const crystalPulse = Math.sin(time * 3) * 0.3 + 0.7;
                    Renderer.drawRect(screenX + 6, screenY + 8, 14, 14, '#213');
                    Renderer.ctx.fillStyle = `rgba(150,100,255,${crystalPulse})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 13, screenY + 15, 5, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Mystical symbols
                    const symbolGlow = Math.sin(time * 2 + 1) * 0.3 + 0.5;
                    Renderer.drawRect(screenX + 34, screenY + 10, 8, 8, `rgba(100,200,255,${symbolGlow})`);
                    // Floating particles
                    for (let i = 0; i < 4; i++) {
                        const px = screenX + 10 + Math.sin(time * 2 + i * 1.5) * 15 + i * 8;
                        const py = screenY + 20 + Math.cos(time * 1.5 + i) * 8;
                        const pAlpha = Math.sin(time * 3 + i) * 0.3 + 0.4;
                        Renderer.drawRect(px, py, 2, 2, `rgba(200,150,255,${pAlpha})`);
                    }
                    // Door
                    Renderer.drawRect(screenX + 16, screenY + 24, 16, 24, '#213');
                    Renderer.drawRect(screenX + 28, screenY + 34, 3, 3, '#a8f');
                    // Stars on door
                    Renderer.drawRect(screenX + 22, screenY + 28, 2, 2, '#ff0');
                    Renderer.drawRect(screenX + 20, screenY + 36, 2, 2, '#ff0');
                    break;

                case 'village_house':
                    // Cozy village house
                    // Building
                    Renderer.drawRect(screenX, screenY, 40, 40, '#654');
                    Renderer.drawRect(screenX + 2, screenY + 2, 36, 36, '#765');
                    // Roof
                    Renderer.ctx.fillStyle = '#543';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 20, screenY - 12);
                    Renderer.ctx.lineTo(screenX + 44, screenY);
                    Renderer.ctx.lineTo(screenX - 4, screenY);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    // Chimney
                    Renderer.drawRect(screenX + 28, screenY - 16, 8, 10, '#543');
                    // Window with warm light
                    const houseLight = Math.sin(time * 0.3) * 0.1 + 0.7;
                    Renderer.drawRect(screenX + 6, screenY + 10, 10, 10, `rgba(255,220,150,${houseLight})`);
                    Renderer.drawRect(screenX + 10, screenY + 10, 2, 10, '#543'); // Window frame
                    Renderer.drawRect(screenX + 6, screenY + 14, 10, 2, '#543');
                    // Door
                    Renderer.drawRect(screenX + 22, screenY + 18, 12, 22, '#432');
                    Renderer.drawRect(screenX + 30, screenY + 28, 3, 3, '#ff0');
                    break;

                case 'fountain':
                    // Village fountain
                    // Base
                    Renderer.drawRect(screenX, screenY + 24, 48, 16, '#556');
                    Renderer.drawRect(screenX + 4, screenY + 20, 40, 8, '#667');
                    // Water basin
                    Renderer.ctx.fillStyle = '#48a';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 24, screenY + 28, 20, 8, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Center pillar
                    Renderer.drawRect(screenX + 20, screenY + 4, 8, 24, '#778');
                    // Water spout
                    Renderer.drawRect(screenX + 22, screenY, 4, 8, '#889');
                    // Water streams
                    const waterPhase = time * 4;
                    for (let i = 0; i < 4; i++) {
                        const angle = (i / 4) * Math.PI * 2 + waterPhase * 0.1;
                        const wx = screenX + 24 + Math.cos(angle) * 8;
                        const wy = screenY + 8 + Math.sin(waterPhase + i) * 2;
                        const wAlpha = 0.5 + Math.sin(waterPhase + i * 2) * 0.2;
                        Renderer.ctx.fillStyle = `rgba(100,180,255,${wAlpha})`;
                        Renderer.ctx.beginPath();
                        Renderer.ctx.moveTo(screenX + 24, screenY + 6);
                        Renderer.ctx.quadraticCurveTo(wx, wy + 8, wx + (Math.cos(angle) * 4), screenY + 24);
                        Renderer.ctx.stroke();
                    }
                    // Sparkles
                    if (Math.sin(time * 5) > 0.7) {
                        Renderer.drawRect(screenX + 12 + Math.random() * 24, screenY + 24 + Math.random() * 8, 2, 2, '#fff');
                    }
                    break;

                case 'lantern':
                    // Hanging lantern (warm underground lighting)
                    const lanternGlow = Math.sin(time * 4) * 0.15 + 0.85;
                    // Chain
                    Renderer.drawRect(screenX + 6, screenY, 2, 8, '#666');
                    // Lantern body
                    Renderer.drawRect(screenX + 2, screenY + 8, 12, 16, '#654');
                    Renderer.drawRect(screenX + 4, screenY + 10, 8, 12, `rgba(255,200,100,${lanternGlow})`);
                    // Glow effect
                    Renderer.ctx.fillStyle = `rgba(255,180,80,${lanternGlow * 0.3})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 8, screenY + 16, 16, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'banner':
                    // Decorative banner
                    const bannerWave = Math.sin(time * 2 + deco.x * 0.1) * 2;
                    // Pole
                    Renderer.drawRect(screenX + 6, screenY, 2, 32, '#654');
                    // Banner fabric
                    Renderer.ctx.fillStyle = deco.color || '#a44';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 8, screenY + 4);
                    Renderer.ctx.lineTo(screenX + 24 + bannerWave, screenY + 8);
                    Renderer.ctx.lineTo(screenX + 20 + bannerWave, screenY + 20);
                    Renderer.ctx.lineTo(screenX + 8, screenY + 16);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    // Trim
                    Renderer.ctx.strokeStyle = '#ff0';
                    Renderer.ctx.lineWidth = 1;
                    Renderer.ctx.stroke();
                    break;

                case 'cave_entrance':
                    // Decorated cave entrance/archway
                    // Stone arch
                    Renderer.drawRect(screenX, screenY, 12, 48, '#445');
                    Renderer.drawRect(screenX + 36, screenY, 12, 48, '#445');
                    Renderer.drawRect(screenX, screenY, 48, 12, '#556');
                    // Crystals on arch
                    const archGlow = Math.sin(time * 2) * 0.2 + 0.6;
                    Renderer.drawRect(screenX + 4, screenY + 2, 4, 8, `rgba(100,200,255,${archGlow})`);
                    Renderer.drawRect(screenX + 40, screenY + 2, 4, 8, `rgba(100,200,255,${archGlow})`);
                    Renderer.drawRect(screenX + 20, screenY + 2, 8, 6, `rgba(150,220,255,${archGlow})`);
                    // Darkness inside
                    Renderer.drawRect(screenX + 12, screenY + 12, 24, 36, '#111');
                    break;

                case 'sign':
                    // Themed wooden sign post with text and icon
                    const signColor = deco.color || '#876';
                    const signBorder = deco.borderColor || '#654';
                    const signWidth = 44;
                    const signHeight = 20;

                    // Post
                    Renderer.drawRect(screenX + signWidth/2 - 2, screenY + signHeight, 4, 16, '#543');

                    // Sign board with theme color
                    Renderer.drawRect(screenX, screenY, signWidth, signHeight, signBorder);
                    Renderer.drawRect(screenX + 2, screenY + 2, signWidth - 4, signHeight - 4, signColor);

                    // Icon based on theme
                    if (deco.icon === 'meat') {
                        // Meat/drumstick on top
                        Renderer.drawRect(screenX + signWidth/2 - 6, screenY - 10, 12, 8, '#c66');
                        Renderer.drawRect(screenX + signWidth/2 - 4, screenY - 12, 8, 4, '#a44');
                        Renderer.drawRect(screenX + signWidth/2 + 4, screenY - 8, 6, 3, '#ddd'); // bone
                    } else if (deco.icon === 'sword') {
                        // Sword on top
                        Renderer.drawRect(screenX + signWidth/2 - 1, screenY - 14, 2, 12, '#aaa');
                        Renderer.drawRect(screenX + signWidth/2 - 4, screenY - 4, 8, 2, '#888');
                        Renderer.drawRect(screenX + signWidth/2 - 1, screenY - 2, 2, 3, '#654');
                    } else if (deco.icon === 'star') {
                        // Magic star on top
                        const starGlow = Math.sin(time * 3) * 0.3 + 0.7;
                        Renderer.ctx.fillStyle = `rgba(200,150,255,${starGlow})`;
                        Renderer.ctx.beginPath();
                        const cx = screenX + signWidth/2;
                        const cy = screenY - 8;
                        for (let i = 0; i < 5; i++) {
                            const angle = (i * 4 * Math.PI / 5) - Math.PI/2;
                            const r = i === 0 ? 0 : 6;
                            const method = i === 0 ? 'moveTo' : 'lineTo';
                            Renderer.ctx[method](cx + Math.cos(angle) * 6, cy + Math.sin(angle) * 6);
                            const innerAngle = angle + Math.PI/5;
                            Renderer.ctx.lineTo(cx + Math.cos(innerAngle) * 3, cy + Math.sin(innerAngle) * 3);
                        }
                        Renderer.ctx.closePath();
                        Renderer.ctx.fill();
                    } else if (deco.icon === 'home') {
                        // Little house/roof on top
                        Renderer.ctx.fillStyle = '#a65';
                        Renderer.ctx.beginPath();
                        Renderer.ctx.moveTo(screenX + signWidth/2, screenY - 12);
                        Renderer.ctx.lineTo(screenX + signWidth/2 + 8, screenY - 2);
                        Renderer.ctx.lineTo(screenX + signWidth/2 - 8, screenY - 2);
                        Renderer.ctx.closePath();
                        Renderer.ctx.fill();
                        Renderer.drawRect(screenX + signWidth/2 - 1, screenY - 6, 2, 4, '#654');
                    }

                    // Text
                    if (deco.text) {
                        Renderer.ctx.fillStyle = deco.textColor || '#321';
                        Renderer.ctx.font = '7px monospace';
                        Renderer.ctx.textAlign = 'center';
                        Renderer.ctx.fillText(deco.text, screenX + signWidth/2, screenY + 14);
                        Renderer.ctx.textAlign = 'left';
                    }
                    break;
            }
        }
    },

    /**
     * Render interactables
     */
    renderInteractables() {
        if (!this.currentRoom || !this.currentRoom.interactables) return;

        for (const interactable of this.currentRoom.interactables) {
            // Check flag requirements - don't render if not visible
            if (interactable.requiresFlag && !this.checkFlag(interactable.requiresFlag)) {
                continue;
            }

            const screenX = interactable.x - this.camera.x;
            const screenY = interactable.y - this.camera.y;

            // Draw based on type
            switch (interactable.type) {
                case 'lore':
                    // Tablet/sign
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#666');
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4, '#444');
                    break;
                case 'piano':
                    // Piano
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#432');
                    // Keys
                    for (let i = 0; i < 4; i++) {
                        Renderer.drawRect(screenX + 4 + i * 7, screenY + interactable.height - 8, 6, 6, '#fff');
                    }
                    break;
                case 'treasure_chest':
                    // Closed treasure chest
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#654');
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4, '#876');
                    // Lock
                    Renderer.drawRect(screenX + interactable.width/2 - 4, screenY + interactable.height/2 - 2, 8, 8, '#ff0');
                    break;
                case 'opened_chest':
                    // Opened treasure chest (empty)
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#543');
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4, '#654');
                    // Open lid
                    Renderer.drawRect(screenX + 2, screenY - 6, interactable.width - 4, 8, '#654');
                    Renderer.drawRect(screenX + 4, screenY - 4, interactable.width - 8, 4, '#765');
                    // Empty inside (dark)
                    Renderer.drawRect(screenX + 4, screenY + 4, interactable.width - 8, interactable.height - 8, '#321');
                    break;
                case 'hidden_key':
                    // Floating crystal key
                    const keyFloat = Math.sin(performance.now() / 500) * 3;
                    const keyGlow = Math.sin(performance.now() / 300) * 0.3 + 0.7;
                    const keyX = screenX + interactable.width / 2;
                    const keyY = screenY + interactable.height / 2 + keyFloat;

                    // Glow effect behind key
                    Renderer.ctx.fillStyle = `rgba(100,200,255,${keyGlow * 0.4})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(keyX, keyY, 12, 0, Math.PI * 2);
                    Renderer.ctx.fill();

                    // Key handle (circle part)
                    Renderer.ctx.fillStyle = `rgba(150,220,255,${keyGlow})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(keyX, keyY - 4, 5, 0, Math.PI * 2);
                    Renderer.ctx.fill();

                    // Key handle hole
                    Renderer.ctx.fillStyle = `rgba(50,100,150,${keyGlow})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(keyX, keyY - 4, 2, 0, Math.PI * 2);
                    Renderer.ctx.fill();

                    // Key shaft
                    Renderer.ctx.fillStyle = `rgba(150,220,255,${keyGlow})`;
                    Renderer.ctx.fillRect(keyX - 2, keyY, 4, 10);

                    // Key teeth
                    Renderer.ctx.fillRect(keyX - 4, keyY + 6, 3, 2);
                    Renderer.ctx.fillRect(keyX - 4, keyY + 9, 4, 2);

                    // Sparkle effect
                    if (Math.sin(performance.now() / 150) > 0.6) {
                        const sparkX = keyX - 6 + Math.random() * 12;
                        const sparkY = keyY - 8 + Math.random() * 16;
                        Renderer.drawRect(sparkX, sparkY, 2, 2, '#fff');
                    }
                    break;
                case 'fairy_ring':
                    // Mushroom fairy ring - glowing circle of mushrooms
                    const ringPulse = Math.sin(performance.now() / 600) * 0.3 + 0.6;
                    const ringGlow = Math.sin(performance.now() / 300) * 0.2 + 0.4;
                    // Draw glowing ground circle
                    Renderer.ctx.fillStyle = `rgba(100,200,150,${ringGlow * 0.3})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 16, screenY + 16, 14, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Draw mushrooms in circle
                    for (let i = 0; i < 6; i++) {
                        const angle = (i / 6) * Math.PI * 2 + performance.now() / 3000;
                        const mx = screenX + 16 + Math.cos(angle) * 10;
                        const my = screenY + 16 + Math.sin(angle) * 10;
                        // Mushroom cap
                        Renderer.ctx.fillStyle = `rgba(200,100,150,${ringPulse})`;
                        Renderer.ctx.beginPath();
                        Renderer.ctx.arc(mx, my, 3, 0, Math.PI * 2);
                        Renderer.ctx.fill();
                        // Mushroom stem
                        Renderer.drawRect(mx - 1, my + 2, 2, 3, `rgba(220,200,180,${ringPulse})`);
                    }
                    // Center sparkle
                    if (Math.sin(performance.now() / 200) > 0.7) {
                        Renderer.drawRect(screenX + 15, screenY + 15, 2, 2, '#fff');
                    }
                    break;
                case 'mystic_pool':
                    // Mysterious glowing pool
                    const poolPulse = Math.sin(performance.now() / 800) * 0.3 + 0.5;
                    const poolRipple = Math.sin(performance.now() / 400);
                    // Pool base
                    Renderer.ctx.fillStyle = `rgba(40,80,100,0.9)`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 16, screenY + 12, 14, 10, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Water surface with ripples
                    Renderer.ctx.fillStyle = `rgba(80,150,180,${poolPulse})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 16, screenY + 12, 12 + poolRipple, 8 + poolRipple * 0.5, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Mysterious glow from center
                    Renderer.ctx.fillStyle = `rgba(150,220,255,${poolPulse * 0.6})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 16, screenY + 12, 6, 4, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Occasional sparkle
                    if (Math.sin(performance.now() / 150) > 0.8) {
                        const sparkX = screenX + 10 + Math.random() * 12;
                        const sparkY = screenY + 8 + Math.random() * 8;
                        Renderer.drawRect(sparkX, sparkY, 2, 2, '#aef');
                    }
                    break;
                case 'bed':
                    // Cozy bed
                    // Bed frame
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#543');
                    // Mattress
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 6, '#668');
                    // Pillow
                    Renderer.drawRect(screenX + 4, screenY + 4, 10, 6, '#fff');
                    // Blanket
                    Renderer.drawRect(screenX + 4, screenY + 12, interactable.width - 8, interactable.height - 16, '#448');
                    break;
                case 'bookshelf':
                    // Bookshelf with books
                    // Frame
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#432');
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4, '#321');
                    // Shelves
                    for (let i = 0; i < 3; i++) {
                        const shelfY = screenY + 8 + i * 14;
                        Renderer.drawRect(screenX + 2, shelfY, interactable.width - 4, 2, '#543');
                        // Books on shelf
                        const bookColors = ['#a44', '#44a', '#4a4', '#aa4', '#a4a'];
                        for (let b = 0; b < 4; b++) {
                            const bookX = screenX + 4 + b * 5;
                            const bookH = 8 + Math.sin(b * 2 + i) * 2;
                            Renderer.drawRect(bookX, shelfY - bookH, 4, bookH, bookColors[(b + i) % bookColors.length]);
                        }
                    }
                    break;
                case 'mirror':
                    // Wall mirror
                    // Frame
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#654');
                    // Mirror surface
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4, '#aac');
                    // Shine effect
                    const mirrorShine = Math.sin(performance.now() / 1000) * 0.2 + 0.6;
                    Renderer.drawRect(screenX + 4, screenY + 4, 3, interactable.height - 8, `rgba(255,255,255,${mirrorShine})`);
                    break;
                case 'kitchen':
                    // Cozy kitchen counter with stove
                    // Counter base
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#654');
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4, '#876');
                    // Stove top
                    Renderer.drawRect(screenX + 4, screenY + 4, 16, 12, '#333');
                    // Burners
                    Renderer.drawRect(screenX + 6, screenY + 6, 4, 4, '#555');
                    Renderer.drawRect(screenX + 14, screenY + 6, 4, 4, '#555');
                    // Pot on stove
                    Renderer.drawRect(screenX + 5, screenY + 4, 6, 4, '#444');
                    // Cabinet doors
                    Renderer.drawRect(screenX + 4, screenY + 18, 10, 10, '#765');
                    Renderer.drawRect(screenX + 16, screenY + 18, 10, 10, '#765');
                    // Knobs
                    Renderer.drawRect(screenX + 12, screenY + 22, 2, 2, '#fc0');
                    Renderer.drawRect(screenX + 24, screenY + 22, 2, 2, '#fc0');
                    // Food storage indicator
                    const storedFood = Inventory.items ? Inventory.items.filter(i => Items.get(i)?.type === 'consumable').length : 0;
                    if (storedFood > 0) {
                        Renderer.drawRect(screenX + interactable.width - 8, screenY + 4, 6, 6, '#4a4');
                    }
                    break;
                case 'trophy_case':
                    // Trophy display case
                    // Frame
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#543');
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4, '#432');
                    // Glass front
                    Renderer.drawRect(screenX + 3, screenY + 3, interactable.width - 6, interactable.height - 6, 'rgba(150,180,200,0.3)');
                    // Shelves
                    Renderer.drawRect(screenX + 2, screenY + 16, interactable.width - 4, 2, '#654');
                    Renderer.drawRect(screenX + 2, screenY + 32, interactable.width - 4, 2, '#654');
                    // Display trophies based on flags (items moved to case during crowning)
                    let trophyY = screenY + 6;
                    // Crown
                    if (Save.getFlag('crowned_hero')) {
                        Renderer.drawRect(screenX + 6, trophyY, 8, 3, '#fc0');
                        Renderer.drawRect(screenX + 7, trophyY - 2, 2, 2, '#fc0');
                        Renderer.drawRect(screenX + 11, trophyY - 2, 2, 2, '#fc0');
                    }
                    // Crystal Guardian trophy
                    if (Save.getFlag('crystal_guardian_killed') || Save.getFlag('crystal_guardian_spared')) {
                        const crystalGlow = Math.sin(performance.now() / 500) * 0.3 + 0.7;
                        Renderer.drawRect(screenX + 18, trophyY, 6, 8, `rgba(100,200,255,${crystalGlow})`);
                    }
                    trophyY = screenY + 20;
                    // Mega Core (now displayed from flag, not inventory)
                    if (Save.getFlag('trophy_mega_core')) {
                        const coreGlow = Math.sin(performance.now() / 300) * 0.3 + 0.7;
                        Renderer.drawRect(screenX + 6, trophyY, 8, 8, `rgba(255,100,100,${coreGlow})`);
                        Renderer.drawRect(screenX + 8, trophyY + 2, 4, 4, `rgba(255,200,100,${coreGlow})`);
                    }
                    // Keeper's Key (now displayed from flag, not inventory)
                    if (Save.getFlag('trophy_keepers_key')) {
                        Renderer.drawRect(screenX + 18, trophyY + 2, 3, 6, '#fc0');
                        Renderer.drawRect(screenX + 21, trophyY + 6, 4, 2, '#fc0');
                    }
                    break;
                default:
                    // Generic interactable
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#555');
            }
        }
    },

    /**
     * Render save points (special glow effect)
     */
    renderSavePoints() {
        if (!this.currentRoom || !this.currentRoom.savePoints) return;

        for (const savePoint of this.currentRoom.savePoints) {
            const screenX = savePoint.x - this.camera.x;
            const screenY = savePoint.y - this.camera.y;

            // Animated glow
            const time = performance.now() / 1000;
            const pulse = Math.sin(time * 3) * 0.3 + 0.7;

            // Draw star/sparkle
            Renderer.ctx.fillStyle = `rgba(255,255,100,${pulse})`;
            Renderer.ctx.beginPath();
            Renderer.ctx.moveTo(screenX + 8, screenY);
            Renderer.ctx.lineTo(screenX + 10, screenY + 6);
            Renderer.ctx.lineTo(screenX + 16, screenY + 8);
            Renderer.ctx.lineTo(screenX + 10, screenY + 10);
            Renderer.ctx.lineTo(screenX + 8, screenY + 16);
            Renderer.ctx.lineTo(screenX + 6, screenY + 10);
            Renderer.ctx.lineTo(screenX, screenY + 8);
            Renderer.ctx.lineTo(screenX + 6, screenY + 6);
            Renderer.ctx.closePath();
            Renderer.ctx.fill();
        }
    }
};

// Make it globally available
window.Overworld = Overworld;
