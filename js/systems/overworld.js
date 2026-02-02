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

                // Check if NPC should NOT appear based on flags
                if (npcData.requiresNotFlag && this.checkFlag(npcData.requiresNotFlag)) {
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

        // Handle companion for village journey (only on first visit)
        // Once guide_journey_complete is set, the ??? companion never appears again
        if (!Save.getFlag('guide_journey_complete')) {
            if (roomId === 'next_level' && Save.getFlag('village_intro_seen')) {
                // Start companion after dialogue has been seen
                this.setCompanion({
                    x: Player.x,
                    y: Player.y + 24,
                    appearance: { type: 'mysterious', skinColor: '#aac', bodyColor: '#446', hairColor: '#668' }
                });
            } else if (roomId === 'village_staircase') {
                // Have companion in staircase leading the way
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
                // Remove companion when arriving at village and mark journey complete
                this.removeCompanion();
                Save.setFlag('guide_journey_complete', true);
            }
        } else {
            // Journey already complete - make sure no companion lingers
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

        // Spawn companion after dialogue in next_level room (only if journey not complete)
        if (this.roomId === 'next_level' && Save.getFlag('village_intro_seen') && !Save.getFlag('guide_journey_complete')) {
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
                    // Show locked door dialogue if available and not shown recently
                    const doorKey = `${this.roomId}_${transition.to}_flag`;
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
            } else if (result.type === 'bank') {
                // Open bank after dialogue
                Game.setState(Game.states.DIALOGUE, {
                    dialogueId: result.dialogueId,
                    callback: () => {
                        // Open bank menu after dialogue
                        Inventory.openBank();
                        Game.setState(Game.states.BANK);
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
                    // Special handling for storage chests
                    if (interactable.type === 'armor_chest' || interactable.type === 'weapon_chest') {
                        Inventory.openStorage();
                        Game.setState(Game.states.STORAGE);
                        return;
                    }

                    // Special handling for trophy case
                    if (interactable.type === 'trophy_case') {
                        Inventory.openTrophyCase();
                        Game.setState(Game.states.TROPHY);
                        return;
                    }

                    // Special handling for piano after defeating mega boss
                    if (interactable.type === 'piano') {
                        // Check if mega boss is defeated and secret hasn't been triggered yet
                        if (Save.getFlag('mega_boss_killed') && !Save.getFlag('piano_secret_complete')) {
                            // Play the piano song in the background
                            Audio.playMusicOnce('music_piano_song');
                            // Show dialogue that reveals the secret door
                            Game.setState(Game.states.DIALOGUE, {
                                dialogueId: 'piano_song_complete'
                            });
                            return;
                        }
                        // If secret already complete, show reminder
                        if (Save.getFlag('piano_secret_complete')) {
                            Game.setState(Game.states.DIALOGUE, {
                                dialogueId: 'piano_after_secret'
                            });
                            return;
                        }
                        // Normal piano interaction (mega boss not killed yet)
                        Game.setState(Game.states.DIALOGUE, {
                            dialogueId: 'piano_interact'
                        });
                        return;
                    }

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

                // ==================== FRED'S HOUSE ====================
                case 'paper_pile':
                    // Stack of messy papers
                    Renderer.drawRect(screenX, screenY + 4, 16, 12, '#e8e4d4');
                    Renderer.drawRect(screenX + 2, screenY + 2, 14, 10, '#f5f0e0');
                    Renderer.drawRect(screenX + 1, screenY, 12, 8, '#ebe6d6');
                    // Ink marks
                    Renderer.drawRect(screenX + 4, screenY + 3, 6, 1, '#333');
                    Renderer.drawRect(screenX + 3, screenY + 5, 8, 1, '#333');
                    Renderer.drawRect(screenX + 5, screenY + 7, 4, 1, '#333');
                    break;

                case 'scattered_paper':
                    // Single scattered paper on floor
                    const paperAngle = (deco.x * 0.3) % 0.5 - 0.25;
                    Renderer.ctx.save();
                    Renderer.ctx.translate(screenX + 6, screenY + 6);
                    Renderer.ctx.rotate(paperAngle);
                    Renderer.ctx.fillStyle = '#f0ebe0';
                    Renderer.ctx.fillRect(-6, -5, 12, 10);
                    // Text lines
                    Renderer.ctx.fillStyle = '#444';
                    Renderer.ctx.fillRect(-4, -3, 6, 1);
                    Renderer.ctx.fillRect(-4, -1, 7, 1);
                    Renderer.ctx.fillRect(-4, 1, 5, 1);
                    Renderer.ctx.restore();
                    break;

                case 'crumpled_paper':
                    // Crumpled paper ball
                    Renderer.ctx.fillStyle = '#e5e0d0';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 5, screenY + 5, 5, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Crumple shadows
                    Renderer.ctx.fillStyle = '#c5c0b0';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 6, screenY + 6, 3, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'strange_drawing':
                    // Creepy drawing pinned to wall
                    Renderer.drawRect(screenX, screenY, 20, 16, '#f0ebe0');
                    // Red scribbles (eyes, symbols)
                    Renderer.drawRect(screenX + 4, screenY + 4, 3, 3, '#a33');
                    Renderer.drawRect(screenX + 12, screenY + 4, 3, 3, '#a33');
                    Renderer.drawRect(screenX + 6, screenY + 10, 8, 2, '#a33');
                    // Pin
                    Renderer.drawRect(screenX + 9, screenY - 2, 3, 4, '#c44');
                    break;

                case 'pinned_note':
                    // Small note pinned to wall
                    Renderer.drawRect(screenX, screenY, 12, 10, '#ffffa0');
                    // Text
                    Renderer.drawRect(screenX + 2, screenY + 2, 6, 1, '#333');
                    Renderer.drawRect(screenX + 2, screenY + 4, 8, 1, '#333');
                    Renderer.drawRect(screenX + 2, screenY + 6, 5, 1, '#333');
                    // Pin
                    Renderer.drawRect(screenX + 5, screenY - 2, 2, 3, '#c44');
                    break;

                case 'string_web':
                    // Red string connecting things (conspiracy board style)
                    Renderer.ctx.strokeStyle = '#a33';
                    Renderer.ctx.lineWidth = 1;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX, screenY + 5);
                    Renderer.ctx.lineTo(screenX + 40, screenY + 10);
                    Renderer.ctx.moveTo(screenX + 10, screenY);
                    Renderer.ctx.lineTo(screenX + 50, screenY + 15);
                    Renderer.ctx.moveTo(screenX + 20, screenY + 8);
                    Renderer.ctx.lineTo(screenX + 60, screenY + 3);
                    Renderer.ctx.stroke();
                    break;

                case 'messy_bed':
                    // Unmade bed with sheets everywhere
                    // Bed frame
                    Renderer.drawRect(screenX, screenY + 20, 40, 24, '#654');
                    // Mattress
                    Renderer.drawRect(screenX + 2, screenY + 12, 36, 18, '#a98');
                    // Messy blanket
                    Renderer.drawRect(screenX + 4, screenY + 8, 28, 16, '#668');
                    Renderer.drawRect(screenX + 8, screenY + 6, 20, 10, '#779');
                    // Pillow (askew)
                    Renderer.drawRect(screenX + 4, screenY + 4, 14, 8, '#ddd');
                    // Papers on bed
                    Renderer.drawRect(screenX + 24, screenY + 10, 8, 6, '#f0ebe0');
                    break;

                case 'research_desk':
                    // Desk covered in research materials
                    // Desk
                    Renderer.drawRect(screenX, screenY + 16, 48, 20, '#654');
                    Renderer.drawRect(screenX + 2, screenY + 8, 44, 12, '#765');
                    // Papers everywhere
                    Renderer.drawRect(screenX + 4, screenY + 4, 12, 8, '#f0ebe0');
                    Renderer.drawRect(screenX + 14, screenY + 6, 10, 6, '#e8e4d4');
                    Renderer.drawRect(screenX + 28, screenY + 4, 14, 10, '#f5f0e0');
                    // Candle on desk
                    Renderer.drawRect(screenX + 40, screenY + 2, 4, 8, '#eee');
                    const deskCandleGlow = Math.sin(time * 6) * 0.2 + 0.8;
                    Renderer.drawRect(screenX + 41, screenY - 2, 2, 4, `rgba(255,200,100,${deskCandleGlow})`);
                    break;

                case 'ink_bottle':
                    // Small ink bottle
                    Renderer.drawRect(screenX + 2, screenY + 4, 6, 8, '#223');
                    Renderer.drawRect(screenX + 3, screenY + 2, 4, 4, '#334');
                    break;

                case 'quill':
                    // Feather quill
                    Renderer.ctx.strokeStyle = '#eee';
                    Renderer.ctx.lineWidth = 2;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX, screenY + 12);
                    Renderer.ctx.lineTo(screenX + 10, screenY);
                    Renderer.ctx.stroke();
                    // Tip
                    Renderer.drawRect(screenX, screenY + 10, 2, 4, '#333');
                    break;

                case 'open_book':
                    // Open book
                    Renderer.drawRect(screenX, screenY, 16, 12, '#654');
                    Renderer.drawRect(screenX + 1, screenY + 1, 6, 10, '#f5f0e0');
                    Renderer.drawRect(screenX + 9, screenY + 1, 6, 10, '#f5f0e0');
                    // Text lines
                    Renderer.drawRect(screenX + 2, screenY + 3, 4, 1, '#333');
                    Renderer.drawRect(screenX + 2, screenY + 5, 4, 1, '#333');
                    Renderer.drawRect(screenX + 10, screenY + 3, 4, 1, '#333');
                    Renderer.drawRect(screenX + 10, screenY + 5, 4, 1, '#333');
                    break;

                case 'mine_map':
                    // Old map on wall showing mine levels
                    Renderer.drawRect(screenX, screenY, 32, 24, '#d4c8a8');
                    Renderer.drawRect(screenX + 2, screenY + 2, 28, 20, '#e8dcc0');
                    // Map lines (tunnels)
                    Renderer.ctx.strokeStyle = '#654';
                    Renderer.ctx.lineWidth = 1;
                    Renderer.ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        Renderer.ctx.moveTo(screenX + 4, screenY + 4 + i * 4);
                        Renderer.ctx.lineTo(screenX + 28, screenY + 4 + i * 4);
                    }
                    Renderer.ctx.stroke();
                    // Red X at bottom
                    Renderer.drawRect(screenX + 14, screenY + 18, 4, 4, '#a33');
                    break;

                case 'candle':
                    // Lit candle
                    Renderer.drawRect(screenX + 3, screenY + 6, 4, 10, '#eee');
                    const candleFlicker = Math.sin(time * 8 + deco.x) * 0.2 + 0.8;
                    Renderer.ctx.fillStyle = `rgba(255,200,100,${candleFlicker})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 5, screenY + 4, 3, 5, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Glow
                    Renderer.ctx.fillStyle = `rgba(255,180,80,${candleFlicker * 0.2})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 5, screenY + 6, 10, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'candle_burnt':
                    // Burnt out candle
                    Renderer.drawRect(screenX + 3, screenY + 10, 4, 6, '#ccc');
                    Renderer.drawRect(screenX + 4, screenY + 8, 2, 3, '#333');
                    // Melted wax puddle
                    Renderer.ctx.fillStyle = '#ddd';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 5, screenY + 14, 5, 2, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'empty_bottle':
                    // Empty glass bottle
                    Renderer.ctx.fillStyle = 'rgba(150,180,150,0.5)';
                    Renderer.ctx.fillRect(screenX + 2, screenY + 4, 6, 10);
                    Renderer.ctx.fillRect(screenX + 3, screenY, 4, 6);
                    break;

                case 'dirty_cup':
                    // Dirty cup/mug
                    Renderer.drawRect(screenX + 1, screenY + 4, 8, 8, '#876');
                    Renderer.drawRect(screenX + 2, screenY + 5, 6, 6, '#654');
                    // Handle
                    Renderer.drawRect(screenX + 8, screenY + 5, 3, 6, '#876');
                    break;

                case 'old_chest':
                    // Old wooden chest
                    Renderer.drawRect(screenX, screenY + 8, 24, 16, '#543');
                    Renderer.drawRect(screenX + 2, screenY + 10, 20, 12, '#654');
                    // Lid
                    Renderer.drawRect(screenX, screenY + 4, 24, 6, '#654');
                    // Metal bands
                    Renderer.drawRect(screenX + 4, screenY + 4, 2, 18, '#888');
                    Renderer.drawRect(screenX + 18, screenY + 4, 2, 18, '#888');
                    // Lock
                    Renderer.drawRect(screenX + 10, screenY + 12, 4, 4, '#aa8');
                    break;

                case 'messy_bookshelf':
                    // Bookshelf with books falling out
                    // Shelf frame
                    Renderer.drawRect(screenX, screenY, 24, 40, '#543');
                    Renderer.drawRect(screenX + 2, screenY + 2, 20, 8, '#654');
                    Renderer.drawRect(screenX + 2, screenY + 14, 20, 8, '#654');
                    Renderer.drawRect(screenX + 2, screenY + 26, 20, 12, '#654');
                    // Books (various colors, some tilted)
                    Renderer.drawRect(screenX + 3, screenY + 3, 3, 6, '#833');
                    Renderer.drawRect(screenX + 7, screenY + 2, 4, 7, '#383');
                    Renderer.drawRect(screenX + 12, screenY + 4, 3, 5, '#338');
                    Renderer.drawRect(screenX + 16, screenY + 3, 4, 6, '#883');
                    // Second shelf
                    Renderer.drawRect(screenX + 4, screenY + 15, 3, 6, '#448');
                    Renderer.drawRect(screenX + 8, screenY + 16, 4, 5, '#844');
                    Renderer.drawRect(screenX + 14, screenY + 15, 5, 6, '#484');
                    // Bottom - books fallen over
                    Renderer.drawRect(screenX + 3, screenY + 32, 8, 3, '#633');
                    Renderer.drawRect(screenX + 12, screenY + 28, 3, 8, '#363');
                    break;

                case 'dust_motes':
                    // Floating dust particles
                    for (let i = 0; i < 5; i++) {
                        const dustX = screenX + Math.sin(time * 0.5 + i * 2) * 20 + i * 10;
                        const dustY = screenY + Math.cos(time * 0.3 + i * 1.5) * 15 + i * 8;
                        const dustAlpha = Math.sin(time + i) * 0.2 + 0.3;
                        Renderer.ctx.fillStyle = `rgba(200,190,170,${dustAlpha})`;
                        Renderer.ctx.beginPath();
                        Renderer.ctx.arc(dustX, dustY, 1, 0, Math.PI * 2);
                        Renderer.ctx.fill();
                    }
                    break;

                // ==================== BUTCHER SHOP INTERIOR ====================
                case 'meat_hook':
                    // Hanging meat on a hook
                    const meatSwing = Math.sin(time * 1.5 + deco.x * 0.1) * 2;
                    // Hook and chain
                    Renderer.drawRect(screenX + 6, screenY, 2, 10, '#666');
                    Renderer.drawRect(screenX + 4, screenY + 8, 6, 4, '#888');
                    // Meat slab (swinging slightly)
                    Renderer.drawRect(screenX + 2 + meatSwing, screenY + 12, 10, 20, '#a55');
                    Renderer.drawRect(screenX + 4 + meatSwing, screenY + 14, 6, 16, '#833');
                    // Fat marbling
                    Renderer.drawRect(screenX + 3 + meatSwing, screenY + 18, 2, 4, '#daa');
                    Renderer.drawRect(screenX + 8 + meatSwing, screenY + 22, 2, 6, '#daa');
                    // Bone showing at top
                    Renderer.drawRect(screenX + 5 + meatSwing, screenY + 12, 4, 3, '#eee');
                    break;

                case 'sausage_string':
                    // String of hanging sausages
                    const sausageSwing = Math.sin(time * 2 + deco.x * 0.2) * 1.5;
                    // String/rope
                    Renderer.drawRect(screenX, screenY, 32, 2, '#654');
                    // Sausages hanging down
                    for (let i = 0; i < 4; i++) {
                        const sx = screenX + 4 + i * 8;
                        const sSwing = Math.sin(time * 2 + i * 0.5) * 1;
                        Renderer.drawRect(sx + sSwing, screenY + 2, 4, 12, '#944');
                        Renderer.drawRect(sx + 1 + sSwing, screenY + 4, 2, 8, '#722');
                        // String tie
                        Renderer.drawRect(sx + 1 + sSwing, screenY + 2, 2, 2, '#654');
                    }
                    break;

                case 'meat_counter':
                    // Butcher's display counter with meat
                    // Counter base
                    Renderer.drawRect(screenX, screenY, 48, 24, '#543');
                    Renderer.drawRect(screenX + 2, screenY + 2, 44, 20, '#654');
                    // Glass display top
                    Renderer.drawRect(screenX + 2, screenY, 44, 4, 'rgba(200,220,240,0.4)');
                    // Meat on display
                    Renderer.drawRect(screenX + 6, screenY + 6, 12, 8, '#a44'); // Steak
                    Renderer.drawRect(screenX + 8, screenY + 8, 8, 4, '#822');
                    Renderer.drawRect(screenX + 22, screenY + 6, 8, 10, '#955'); // Roast
                    Renderer.drawRect(screenX + 34, screenY + 8, 10, 6, '#b66'); // Chops
                    // Price tags
                    Renderer.drawRect(screenX + 6, screenY + 16, 8, 4, '#ffc');
                    Renderer.drawRect(screenX + 22, screenY + 16, 8, 4, '#ffc');
                    break;

                case 'cleaver_rack':
                    // Rack of butcher tools on wall
                    // Wooden rack
                    Renderer.drawRect(screenX, screenY, 32, 6, '#543');
                    Renderer.drawRect(screenX + 2, screenY + 4, 2, 8, '#543');
                    Renderer.drawRect(screenX + 28, screenY + 4, 2, 8, '#543');
                    // Cleaver
                    Renderer.drawRect(screenX + 4, screenY + 6, 8, 2, '#888'); // Handle
                    Renderer.drawRect(screenX + 4, screenY + 2, 6, 6, '#aaa'); // Blade
                    // Knife
                    Renderer.drawRect(screenX + 14, screenY + 6, 6, 2, '#654'); // Handle
                    Renderer.drawRect(screenX + 14, screenY + 4, 8, 2, '#bbb'); // Blade
                    // Meat tenderizer
                    Renderer.drawRect(screenX + 24, screenY + 4, 2, 8, '#765'); // Handle
                    Renderer.drawRect(screenX + 22, screenY + 2, 6, 4, '#999'); // Head
                    break;

                case 'blood_stain':
                    // Decorative blood stain on floor
                    const stainAlpha = 0.6;
                    Renderer.ctx.fillStyle = `rgba(80,20,20,${stainAlpha})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 8, screenY + 6, 8 + (deco.size || 0), 5 + (deco.size || 0) * 0.5, 0.2, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Darker center
                    Renderer.ctx.fillStyle = `rgba(60,10,10,${stainAlpha})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 8, screenY + 6, 4, 3, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'chopping_block':
                    // Wooden chopping block with cleaver
                    // Block
                    Renderer.drawRect(screenX, screenY + 8, 24, 16, '#654');
                    Renderer.drawRect(screenX + 2, screenY + 10, 20, 12, '#876');
                    // Wood grain lines
                    Renderer.drawRect(screenX + 6, screenY + 10, 1, 12, '#765');
                    Renderer.drawRect(screenX + 12, screenY + 10, 1, 12, '#765');
                    Renderer.drawRect(screenX + 18, screenY + 10, 1, 12, '#765');
                    // Embedded cleaver
                    Renderer.drawRect(screenX + 8, screenY + 4, 2, 10, '#665'); // Handle
                    Renderer.drawRect(screenX + 6, screenY, 6, 6, '#aaa'); // Blade
                    // Blood on block
                    Renderer.drawRect(screenX + 14, screenY + 12, 6, 4, 'rgba(100,30,30,0.5)');
                    break;

                case 'ham_leg':
                    // Hanging ham/leg
                    const hamSwing = Math.sin(time * 1.2 + deco.x * 0.15) * 1.5;
                    // Hook
                    Renderer.drawRect(screenX + 8, screenY, 2, 6, '#888');
                    // Ham
                    Renderer.ctx.fillStyle = '#b66';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 9 + hamSwing, screenY + 16, 7, 12, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Darker shading
                    Renderer.ctx.fillStyle = '#944';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 11 + hamSwing, screenY + 18, 4, 8, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Bone at top
                    Renderer.drawRect(screenX + 7 + hamSwing, screenY + 4, 4, 4, '#eee');
                    break;

                case 'barrel':
                    // Wooden barrel (for salt/brine)
                    // Barrel body
                    Renderer.ctx.fillStyle = '#654';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 10, screenY + 20, 10, 6, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    Renderer.drawRect(screenX + 2, screenY + 4, 16, 16, '#765');
                    // Metal bands
                    Renderer.drawRect(screenX + 2, screenY + 6, 16, 2, '#555');
                    Renderer.drawRect(screenX + 2, screenY + 14, 16, 2, '#555');
                    // Top
                    Renderer.ctx.fillStyle = '#876';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 10, screenY + 4, 8, 4, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'meat_shelf':
                    // Shelf with wrapped meats
                    // Shelf
                    Renderer.drawRect(screenX, screenY + 16, 40, 4, '#543');
                    // Brackets
                    Renderer.drawRect(screenX + 4, screenY + 16, 2, 8, '#654');
                    Renderer.drawRect(screenX + 34, screenY + 16, 2, 8, '#654');
                    // Wrapped meat packages
                    Renderer.drawRect(screenX + 2, screenY + 6, 10, 10, '#ddc'); // Paper wrapped
                    Renderer.drawRect(screenX + 4, screenY + 8, 6, 6, '#a55'); // Meat showing
                    Renderer.drawRect(screenX + 14, screenY + 8, 12, 8, '#eed');
                    Renderer.drawRect(screenX + 28, screenY + 4, 8, 12, '#ddc');
                    // Strings
                    Renderer.drawRect(screenX + 6, screenY + 10, 1, 4, '#876');
                    Renderer.drawRect(screenX + 19, screenY + 11, 1, 3, '#876');
                    break;

                // ==================== BLACKSMITH INTERIOR ====================
                case 'forge':
                    // Large forge with animated flames
                    const forgeFlicker = Math.sin(time * 10) * 0.15 + 0.85;
                    const flameOffset = Math.sin(time * 8) * 2;
                    // Stone forge base
                    Renderer.drawRect(screenX, screenY + 16, 40, 24, '#444');
                    Renderer.drawRect(screenX + 2, screenY + 18, 36, 20, '#333');
                    // Fire pit
                    Renderer.drawRect(screenX + 6, screenY + 20, 28, 14, '#222');
                    // Coals
                    Renderer.drawRect(screenX + 8, screenY + 28, 24, 6, `rgba(180,60,20,${forgeFlicker})`);
                    Renderer.drawRect(screenX + 10, screenY + 30, 20, 4, `rgba(255,100,30,${forgeFlicker})`);
                    // Flames
                    Renderer.ctx.fillStyle = `rgba(255,200,50,${forgeFlicker})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 12, screenY + 28);
                    Renderer.ctx.lineTo(screenX + 16 + flameOffset, screenY + 16);
                    Renderer.ctx.lineTo(screenX + 20, screenY + 28);
                    Renderer.ctx.fill();
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 20, screenY + 28);
                    Renderer.ctx.lineTo(screenX + 24 - flameOffset, screenY + 18);
                    Renderer.ctx.lineTo(screenX + 28, screenY + 28);
                    Renderer.ctx.fill();
                    // Chimney/hood
                    Renderer.drawRect(screenX + 8, screenY, 24, 18, '#555');
                    Renderer.drawRect(screenX + 10, screenY + 2, 20, 14, '#444');
                    // Glow effect
                    Renderer.ctx.fillStyle = `rgba(255,150,50,${forgeFlicker * 0.4})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 20, screenY + 26, 24, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Sparks
                    if (Math.random() > 0.7) {
                        for (let i = 0; i < 3; i++) {
                            const sparkX = screenX + 14 + Math.random() * 12;
                            const sparkY = screenY + 10 + Math.random() * 16;
                            Renderer.drawRect(sparkX, sparkY, 2, 2, '#ff0');
                        }
                    }
                    break;

                case 'anvil':
                    // Blacksmith's anvil
                    // Base
                    Renderer.drawRect(screenX + 4, screenY + 16, 16, 8, '#333');
                    // Body
                    Renderer.drawRect(screenX + 2, screenY + 8, 20, 10, '#444');
                    // Top/face
                    Renderer.drawRect(screenX, screenY + 4, 24, 6, '#555');
                    Renderer.drawRect(screenX + 2, screenY + 2, 20, 4, '#666');
                    // Horn
                    Renderer.ctx.fillStyle = '#555';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 24, screenY + 6);
                    Renderer.ctx.lineTo(screenX + 32, screenY + 8);
                    Renderer.ctx.lineTo(screenX + 24, screenY + 10);
                    Renderer.ctx.fill();
                    // Highlight
                    Renderer.drawRect(screenX + 4, screenY + 3, 16, 1, '#777');
                    break;

                case 'weapon_rack':
                    // Wall-mounted weapon display rack
                    // Back board
                    Renderer.drawRect(screenX, screenY, 40, 32, '#543');
                    Renderer.drawRect(screenX + 2, screenY + 2, 36, 28, '#654');
                    // Sword 1
                    Renderer.drawRect(screenX + 6, screenY + 4, 2, 20, '#888'); // Blade
                    Renderer.drawRect(screenX + 4, screenY + 22, 6, 2, '#654'); // Guard
                    Renderer.drawRect(screenX + 5, screenY + 24, 4, 6, '#432'); // Handle
                    // Sword 2 (larger)
                    Renderer.drawRect(screenX + 16, screenY + 2, 3, 24, '#999'); // Blade
                    Renderer.drawRect(screenX + 13, screenY + 24, 9, 2, '#654'); // Guard
                    Renderer.drawRect(screenX + 15, screenY + 26, 5, 6, '#543'); // Handle
                    // Axe
                    Renderer.drawRect(screenX + 30, screenY + 6, 2, 18, '#654'); // Handle
                    Renderer.drawRect(screenX + 28, screenY + 4, 8, 8, '#777'); // Head
                    Renderer.drawRect(screenX + 26, screenY + 6, 4, 4, '#888'); // Blade edge
                    // Hooks
                    Renderer.drawRect(screenX + 6, screenY + 2, 2, 2, '#888');
                    Renderer.drawRect(screenX + 16, screenY, 3, 2, '#888');
                    Renderer.drawRect(screenX + 30, screenY + 4, 2, 2, '#888');
                    break;

                case 'armor_stand':
                    // Armor display stand
                    // Stand base
                    Renderer.drawRect(screenX + 6, screenY + 28, 12, 4, '#543');
                    Renderer.drawRect(screenX + 10, screenY + 16, 4, 12, '#654');
                    // Torso form
                    Renderer.drawRect(screenX + 4, screenY + 4, 16, 14, '#765');
                    // Armor on stand
                    Renderer.drawRect(screenX + 4, screenY + 4, 16, 14, '#666');
                    Renderer.drawRect(screenX + 6, screenY + 6, 12, 10, '#777');
                    // Shoulder plates
                    Renderer.drawRect(screenX + 2, screenY + 4, 4, 6, '#666');
                    Renderer.drawRect(screenX + 18, screenY + 4, 4, 6, '#666');
                    // Helmet on top
                    Renderer.drawRect(screenX + 6, screenY - 2, 12, 8, '#666');
                    Renderer.drawRect(screenX + 8, screenY + 2, 8, 4, '#222'); // Visor
                    break;

                case 'bellows':
                    // Forge bellows
                    const bellowsCompress = Math.sin(time * 3) * 3;
                    // Handle
                    Renderer.drawRect(screenX + 20, screenY, 4, 10, '#654');
                    // Body
                    Renderer.drawRect(screenX, screenY + 8, 24, 8 + bellowsCompress, '#876');
                    Renderer.drawRect(screenX + 2, screenY + 10, 20, 4 + bellowsCompress, '#654');
                    // Nozzle
                    Renderer.drawRect(screenX + 22, screenY + 10, 10, 4, '#888');
                    Renderer.drawRect(screenX + 30, screenY + 11, 4, 2, '#999');
                    // Air puff when compressed
                    if (bellowsCompress < -1) {
                        Renderer.ctx.fillStyle = 'rgba(200,200,200,0.3)';
                        Renderer.ctx.beginPath();
                        Renderer.ctx.arc(screenX + 38, screenY + 12, 4, 0, Math.PI * 2);
                        Renderer.ctx.fill();
                    }
                    break;

                case 'tool_rack':
                    // Rack of blacksmith tools
                    // Board
                    Renderer.drawRect(screenX, screenY, 32, 4, '#543');
                    // Hooks
                    for (let i = 0; i < 4; i++) {
                        Renderer.drawRect(screenX + 4 + i * 8, screenY + 4, 2, 4, '#888');
                    }
                    // Hammer
                    Renderer.drawRect(screenX + 3, screenY + 8, 4, 12, '#654');
                    Renderer.drawRect(screenX + 1, screenY + 6, 8, 4, '#777');
                    // Tongs
                    Renderer.drawRect(screenX + 11, screenY + 8, 2, 14, '#666');
                    Renderer.drawRect(screenX + 13, screenY + 8, 2, 14, '#666');
                    Renderer.drawRect(screenX + 10, screenY + 20, 6, 2, '#666');
                    // Chisel
                    Renderer.drawRect(screenX + 19, screenY + 8, 2, 10, '#654');
                    Renderer.drawRect(screenX + 18, screenY + 16, 4, 4, '#999');
                    // File
                    Renderer.drawRect(screenX + 27, screenY + 8, 3, 14, '#888');
                    break;

                case 'quench_barrel':
                    // Water barrel for quenching hot metal
                    // Barrel body
                    Renderer.ctx.fillStyle = '#654';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 12, screenY + 28, 12, 6, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    Renderer.drawRect(screenX + 2, screenY + 8, 20, 20, '#765');
                    // Metal bands
                    Renderer.drawRect(screenX + 2, screenY + 10, 20, 2, '#555');
                    Renderer.drawRect(screenX + 2, screenY + 20, 20, 2, '#555');
                    // Water surface
                    Renderer.ctx.fillStyle = '#468';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 12, screenY + 8, 9, 4, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Steam wisps occasionally
                    if (Math.sin(time * 2) > 0.5) {
                        Renderer.ctx.fillStyle = 'rgba(200,200,200,0.4)';
                        Renderer.ctx.beginPath();
                        Renderer.ctx.arc(screenX + 10 + Math.sin(time * 3) * 4, screenY + 2, 3, 0, Math.PI * 2);
                        Renderer.ctx.fill();
                    }
                    break;

                case 'hot_metal':
                    // Glowing hot metal piece on anvil
                    const metalGlow = Math.sin(time * 4) * 0.2 + 0.8;
                    // Metal bar
                    Renderer.drawRect(screenX, screenY, 16, 4, `rgba(255,150,50,${metalGlow})`);
                    Renderer.drawRect(screenX + 2, screenY + 1, 12, 2, `rgba(255,200,100,${metalGlow})`);
                    // Glow
                    Renderer.ctx.fillStyle = `rgba(255,100,0,${metalGlow * 0.3})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 8, screenY + 2, 10, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'coal_pile':
                    // Pile of coal near the forge
                    Renderer.ctx.fillStyle = '#222';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX, screenY + 12);
                    Renderer.ctx.lineTo(screenX + 8, screenY);
                    Renderer.ctx.lineTo(screenX + 16, screenY + 4);
                    Renderer.ctx.lineTo(screenX + 20, screenY + 12);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    // Individual coals
                    Renderer.drawRect(screenX + 4, screenY + 8, 4, 3, '#333');
                    Renderer.drawRect(screenX + 10, screenY + 6, 3, 4, '#2a2a2a');
                    Renderer.drawRect(screenX + 14, screenY + 9, 4, 3, '#333');
                    break;

                case 'sword_in_progress':
                    // Partially forged sword
                    // Blade (rough)
                    Renderer.drawRect(screenX + 4, screenY, 3, 18, '#777');
                    Renderer.drawRect(screenX + 5, screenY + 2, 1, 14, '#888');
                    // Unfinished tip
                    Renderer.drawRect(screenX + 4, screenY, 3, 4, '#666');
                    // Tang (handle part, no grip yet)
                    Renderer.drawRect(screenX + 5, screenY + 18, 1, 6, '#666');
                    break;

                // ==================== MAGIC SHOP INTERIOR ====================
                case 'crystal_ball':
                    // Glowing crystal ball on pedestal
                    const ballPulse = Math.sin(time * 2) * 0.3 + 0.7;
                    const ballSwirl = time * 2;
                    // Pedestal
                    Renderer.drawRect(screenX + 4, screenY + 16, 16, 8, '#436');
                    Renderer.drawRect(screenX + 6, screenY + 12, 12, 6, '#547');
                    // Ball
                    Renderer.ctx.fillStyle = `rgba(150,100,200,${ballPulse})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 12, screenY + 6, 8, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Inner glow
                    Renderer.ctx.fillStyle = `rgba(200,150,255,${ballPulse})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 12, screenY + 6, 5, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Swirling mist inside
                    Renderer.ctx.fillStyle = `rgba(255,200,255,${ballPulse * 0.5})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 12 + Math.cos(ballSwirl) * 3, screenY + 6 + Math.sin(ballSwirl) * 2, 2, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Highlight
                    Renderer.drawRect(screenX + 8, screenY + 2, 2, 2, 'rgba(255,255,255,0.6)');
                    break;

                case 'potion_shelf':
                    // Shelf with colorful potions
                    // Shelf board
                    Renderer.drawRect(screenX, screenY + 20, 48, 4, '#436');
                    // Brackets
                    Renderer.drawRect(screenX + 4, screenY + 20, 2, 8, '#325');
                    Renderer.drawRect(screenX + 42, screenY + 20, 2, 8, '#325');
                    // Potions with different colors
                    const potionColors = ['#f44', '#4f4', '#44f', '#ff4', '#f4f', '#4ff'];
                    for (let i = 0; i < 6; i++) {
                        const px = screenX + 4 + i * 7;
                        const potionGlow = Math.sin(time * 3 + i) * 0.2 + 0.8;
                        // Bottle
                        Renderer.drawRect(px, screenY + 8, 6, 12, 'rgba(200,200,220,0.5)');
                        // Liquid
                        Renderer.ctx.fillStyle = potionColors[i];
                        Renderer.ctx.globalAlpha = potionGlow;
                        Renderer.ctx.fillRect(px + 1, screenY + 12, 4, 7);
                        Renderer.ctx.globalAlpha = 1;
                        // Cork
                        Renderer.drawRect(px + 1, screenY + 6, 4, 3, '#a86');
                    }
                    break;

                case 'spellbook_stand':
                    // Open spellbook on a stand
                    const pageGlow = Math.sin(time * 1.5) * 0.2 + 0.6;
                    // Stand
                    Renderer.drawRect(screenX + 8, screenY + 20, 8, 12, '#325');
                    Renderer.drawRect(screenX + 6, screenY + 28, 12, 4, '#436');
                    // Book base
                    Renderer.drawRect(screenX, screenY + 8, 24, 14, '#214');
                    // Open pages
                    Renderer.drawRect(screenX + 2, screenY + 10, 9, 10, '#eee');
                    Renderer.drawRect(screenX + 13, screenY + 10, 9, 10, '#eee');
                    // Text lines
                    for (let i = 0; i < 4; i++) {
                        Renderer.drawRect(screenX + 3, screenY + 12 + i * 2, 7, 1, '#436');
                        Renderer.drawRect(screenX + 14, screenY + 12 + i * 2, 7, 1, '#436');
                    }
                    // Magical glow from pages
                    Renderer.ctx.fillStyle = `rgba(150,100,255,${pageGlow})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 12, screenY + 14, 8, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Floating runes
                    if (Math.sin(time * 2) > 0.3) {
                        Renderer.drawRect(screenX + 8 + Math.sin(time * 3) * 4, screenY + 4, 3, 3, `rgba(200,150,255,${pageGlow})`);
                    }
                    break;

                case 'magic_circle':
                    // Glowing magic circle on floor
                    const circleGlow = Math.sin(time * 2) * 0.3 + 0.5;
                    const runeRotation = time * 0.5;
                    // Outer circle
                    Renderer.ctx.strokeStyle = `rgba(150,100,255,${circleGlow})`;
                    Renderer.ctx.lineWidth = 2;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 16, screenY + 16, 14, 0, Math.PI * 2);
                    Renderer.ctx.stroke();
                    // Inner circle
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 16, screenY + 16, 10, 0, Math.PI * 2);
                    Renderer.ctx.stroke();
                    // Runes around circle
                    for (let i = 0; i < 6; i++) {
                        const angle = (i / 6) * Math.PI * 2 + runeRotation;
                        const rx = screenX + 16 + Math.cos(angle) * 12;
                        const ry = screenY + 16 + Math.sin(angle) * 12;
                        Renderer.drawRect(rx - 1, ry - 1, 3, 3, `rgba(200,150,255,${circleGlow})`);
                    }
                    // Center glow
                    Renderer.ctx.fillStyle = `rgba(150,100,255,${circleGlow * 0.3})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 16, screenY + 16, 8, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'wand_display':
                    // Display case with magical wands
                    // Case back
                    Renderer.drawRect(screenX, screenY, 20, 32, '#325');
                    Renderer.drawRect(screenX + 2, screenY + 2, 16, 28, '#436');
                    // Glass front
                    Renderer.drawRect(screenX + 2, screenY + 2, 16, 28, 'rgba(200,200,220,0.3)');
                    // Wands
                    const wandGlow = Math.sin(time * 3) * 0.3 + 0.7;
                    // Wand 1
                    Renderer.drawRect(screenX + 4, screenY + 6, 2, 12, '#654');
                    Renderer.drawRect(screenX + 4, screenY + 4, 2, 3, `rgba(100,200,255,${wandGlow})`);
                    // Wand 2
                    Renderer.drawRect(screenX + 9, screenY + 8, 2, 10, '#543');
                    Renderer.drawRect(screenX + 9, screenY + 6, 2, 3, `rgba(255,100,150,${wandGlow})`);
                    // Wand 3
                    Renderer.drawRect(screenX + 14, screenY + 5, 2, 14, '#432');
                    Renderer.drawRect(screenX + 14, screenY + 3, 2, 3, `rgba(150,255,100,${wandGlow})`);
                    break;

                case 'cauldron':
                    // Bubbling cauldron
                    const bubbleTime = time * 4;
                    // Cauldron body
                    Renderer.ctx.fillStyle = '#333';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 12, screenY + 20, 12, 6, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    Renderer.drawRect(screenX + 2, screenY + 8, 20, 14, '#444');
                    // Rim
                    Renderer.ctx.fillStyle = '#555';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 12, screenY + 8, 10, 4, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Liquid
                    Renderer.ctx.fillStyle = '#639';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 12, screenY + 10, 8, 3, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Bubbles
                    for (let i = 0; i < 3; i++) {
                        const bx = screenX + 8 + (i * 4) + Math.sin(bubbleTime + i * 2) * 2;
                        const by = screenY + 6 - Math.abs(Math.sin(bubbleTime + i)) * 4;
                        const bAlpha = 0.5 - Math.abs(Math.sin(bubbleTime + i)) * 0.3;
                        Renderer.ctx.fillStyle = `rgba(180,140,220,${bAlpha})`;
                        Renderer.ctx.beginPath();
                        Renderer.ctx.arc(bx, by, 2, 0, Math.PI * 2);
                        Renderer.ctx.fill();
                    }
                    // Steam/mist
                    const steamAlpha = Math.sin(time * 2) * 0.2 + 0.3;
                    Renderer.ctx.fillStyle = `rgba(180,160,200,${steamAlpha})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 10 + Math.sin(time) * 3, screenY + 2, 4, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    break;

                case 'floating_candles':
                    // Magically floating candles
                    for (let i = 0; i < 3; i++) {
                        const floatY = Math.sin(time * 2 + i * 1.5) * 4;
                        const candleX = screenX + i * 10;
                        const candleY = screenY + 8 + floatY;
                        // Candle
                        Renderer.drawRect(candleX + 2, candleY, 4, 10, '#eee');
                        // Flame
                        const flameFlicker = Math.sin(time * 8 + i) * 0.2 + 0.8;
                        Renderer.ctx.fillStyle = `rgba(255,200,50,${flameFlicker})`;
                        Renderer.ctx.beginPath();
                        Renderer.ctx.moveTo(candleX + 4, candleY - 6);
                        Renderer.ctx.lineTo(candleX + 6, candleY);
                        Renderer.ctx.lineTo(candleX + 2, candleY);
                        Renderer.ctx.fill();
                        // Glow
                        Renderer.ctx.fillStyle = `rgba(255,180,50,${flameFlicker * 0.3})`;
                        Renderer.ctx.beginPath();
                        Renderer.ctx.arc(candleX + 4, candleY - 2, 6, 0, Math.PI * 2);
                        Renderer.ctx.fill();
                    }
                    break;

                case 'star_chart':
                    // Mystical star chart on wall
                    // Parchment
                    Renderer.drawRect(screenX, screenY, 32, 24, '#d9c9a9');
                    Renderer.drawRect(screenX + 2, screenY + 2, 28, 20, '#e9d9b9');
                    // Stars and constellations
                    const starTwinkle = time * 3;
                    const starPositions = [[6, 6], [14, 4], [24, 8], [8, 14], [18, 12], [26, 16], [12, 18]];
                    starPositions.forEach((pos, i) => {
                        const twinkle = Math.sin(starTwinkle + i * 1.2) * 0.3 + 0.7;
                        Renderer.drawRect(screenX + pos[0], screenY + pos[1], 2, 2, `rgba(80,60,120,${twinkle})`);
                    });
                    // Constellation lines
                    Renderer.ctx.strokeStyle = 'rgba(80,60,120,0.4)';
                    Renderer.ctx.lineWidth = 1;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 7, screenY + 7);
                    Renderer.ctx.lineTo(screenX + 15, screenY + 5);
                    Renderer.ctx.lineTo(screenX + 19, screenY + 13);
                    Renderer.ctx.lineTo(screenX + 9, screenY + 15);
                    Renderer.ctx.closePath();
                    Renderer.ctx.stroke();
                    break;

                case 'rune_stone':
                    // Glowing rune stone
                    const runeGlow = Math.sin(time * 2) * 0.3 + 0.6;
                    // Stone
                    Renderer.ctx.fillStyle = '#445';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 8, screenY);
                    Renderer.ctx.lineTo(screenX + 16, screenY + 4);
                    Renderer.ctx.lineTo(screenX + 16, screenY + 20);
                    Renderer.ctx.lineTo(screenX, screenY + 20);
                    Renderer.ctx.lineTo(screenX, screenY + 4);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    // Carved rune (glowing)
                    Renderer.ctx.strokeStyle = `rgba(150,100,255,${runeGlow})`;
                    Renderer.ctx.lineWidth = 2;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 8, screenY + 4);
                    Renderer.ctx.lineTo(screenX + 8, screenY + 16);
                    Renderer.ctx.moveTo(screenX + 4, screenY + 8);
                    Renderer.ctx.lineTo(screenX + 12, screenY + 8);
                    Renderer.ctx.moveTo(screenX + 4, screenY + 12);
                    Renderer.ctx.lineTo(screenX + 12, screenY + 16);
                    Renderer.ctx.stroke();
                    break;

                // ==================== BANK INTERIOR ====================
                case 'bank_counter':
                    // Fancy bank teller counter
                    // Main counter
                    Renderer.drawRect(screenX, screenY + 12, 56, 20, '#543');
                    Renderer.drawRect(screenX + 2, screenY + 14, 52, 16, '#654');
                    // Counter top (marble look)
                    Renderer.drawRect(screenX, screenY + 8, 56, 6, '#889');
                    Renderer.drawRect(screenX + 2, screenY + 10, 52, 2, '#99a');
                    // Teller windows
                    Renderer.drawRect(screenX + 6, screenY, 18, 10, '#432');
                    Renderer.drawRect(screenX + 8, screenY + 2, 14, 6, '#221');
                    Renderer.drawRect(screenX + 32, screenY, 18, 10, '#432');
                    Renderer.drawRect(screenX + 34, screenY + 2, 14, 6, '#221');
                    // Bars on windows
                    for (let i = 0; i < 3; i++) {
                        Renderer.drawRect(screenX + 10 + i * 4, screenY + 2, 1, 6, '#aa8');
                        Renderer.drawRect(screenX + 36 + i * 4, screenY + 2, 1, 6, '#aa8');
                    }
                    break;

                case 'gold_pile':
                    // Pile of gold coins
                    const goldShine = Math.sin(time * 4 + deco.x * 0.1) * 0.2 + 0.8;
                    // Base pile
                    Renderer.ctx.fillStyle = '#da0';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX, screenY + 16);
                    Renderer.ctx.lineTo(screenX + 8, screenY + 4);
                    Renderer.ctx.lineTo(screenX + 16, screenY + 8);
                    Renderer.ctx.lineTo(screenX + 20, screenY + 16);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    // Individual coins
                    Renderer.drawRect(screenX + 4, screenY + 10, 4, 2, '#fc0');
                    Renderer.drawRect(screenX + 10, screenY + 8, 4, 2, '#fc0');
                    Renderer.drawRect(screenX + 6, screenY + 6, 4, 2, '#fc0');
                    // Sparkle
                    if (Math.sin(time * 5 + deco.x) > 0.7) {
                        Renderer.drawRect(screenX + 8, screenY + 4, 2, 2, `rgba(255,255,200,${goldShine})`);
                    }
                    break;

                case 'vault_door':
                    // Large vault door
                    // Door frame
                    Renderer.drawRect(screenX, screenY, 40, 48, '#444');
                    // Door
                    Renderer.drawRect(screenX + 4, screenY + 4, 32, 40, '#666');
                    Renderer.drawRect(screenX + 6, screenY + 6, 28, 36, '#555');
                    // Vault wheel
                    const wheelRotation = time * 0.2;
                    Renderer.ctx.strokeStyle = '#888';
                    Renderer.ctx.lineWidth = 3;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.arc(screenX + 20, screenY + 24, 10, 0, Math.PI * 2);
                    Renderer.ctx.stroke();
                    // Wheel spokes
                    for (let i = 0; i < 4; i++) {
                        const angle = (i / 4) * Math.PI * 2 + wheelRotation;
                        Renderer.ctx.beginPath();
                        Renderer.ctx.moveTo(screenX + 20, screenY + 24);
                        Renderer.ctx.lineTo(screenX + 20 + Math.cos(angle) * 8, screenY + 24 + Math.sin(angle) * 8);
                        Renderer.ctx.stroke();
                    }
                    // Locking bolts
                    Renderer.drawRect(screenX + 4, screenY + 12, 4, 4, '#777');
                    Renderer.drawRect(screenX + 4, screenY + 32, 4, 4, '#777');
                    Renderer.drawRect(screenX + 32, screenY + 12, 4, 4, '#777');
                    Renderer.drawRect(screenX + 32, screenY + 32, 4, 4, '#777');
                    break;

                case 'money_bag':
                    // Bag of gold
                    // Bag body
                    Renderer.ctx.fillStyle = '#864';
                    Renderer.ctx.beginPath();
                    Renderer.ctx.ellipse(screenX + 10, screenY + 14, 8, 10, 0, 0, Math.PI * 2);
                    Renderer.ctx.fill();
                    // Bag top/tie
                    Renderer.drawRect(screenX + 6, screenY + 2, 8, 6, '#864');
                    Renderer.drawRect(screenX + 8, screenY + 6, 4, 2, '#642');
                    // Dollar/gold symbol
                    Renderer.ctx.fillStyle = '#fc0';
                    Renderer.ctx.font = '10px monospace';
                    Renderer.ctx.fillText('$', screenX + 6, screenY + 18);
                    break;

                case 'bank_pillar':
                    // Ornate bank pillar
                    // Base
                    Renderer.drawRect(screenX, screenY + 44, 20, 8, '#776');
                    // Shaft
                    Renderer.drawRect(screenX + 4, screenY + 8, 12, 36, '#887');
                    Renderer.drawRect(screenX + 6, screenY + 10, 8, 32, '#998');
                    // Capital (top)
                    Renderer.drawRect(screenX, screenY, 20, 10, '#887');
                    Renderer.drawRect(screenX + 2, screenY + 2, 16, 6, '#998');
                    break;

                case 'ledger_book':
                    // Bank ledger on desk
                    // Book
                    Renderer.drawRect(screenX, screenY, 16, 20, '#432');
                    Renderer.drawRect(screenX + 2, screenY + 2, 12, 16, '#eec');
                    // Lines (records)
                    for (let i = 0; i < 5; i++) {
                        Renderer.drawRect(screenX + 4, screenY + 4 + i * 3, 8, 1, '#666');
                    }
                    // Quill
                    Renderer.drawRect(screenX + 14, screenY - 4, 2, 10, '#543');
                    Renderer.drawRect(screenX + 13, screenY - 6, 4, 3, '#fff');
                    break;

                case 'coin_stack':
                    // Neat stack of coins
                    const stackShine = Math.sin(time * 3 + deco.y * 0.1) * 0.15 + 0.85;
                    for (let i = 0; i < 5; i++) {
                        Renderer.drawRect(screenX + 1, screenY + 12 - i * 3, 10, 4, '#ca0');
                        Renderer.drawRect(screenX + 2, screenY + 13 - i * 3, 8, 2, `rgba(255,220,100,${stackShine})`);
                    }
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
                    } else if (deco.icon === 'coin') {
                        // Gold coin on top
                        const coinShine = Math.sin(time * 3) * 0.2 + 0.8;
                        Renderer.ctx.fillStyle = '#da0';
                        Renderer.ctx.beginPath();
                        Renderer.ctx.arc(screenX + signWidth/2, screenY - 6, 6, 0, Math.PI * 2);
                        Renderer.ctx.fill();
                        Renderer.ctx.fillStyle = `rgba(255,230,100,${coinShine})`;
                        Renderer.ctx.beginPath();
                        Renderer.ctx.arc(screenX + signWidth/2, screenY - 6, 4, 0, Math.PI * 2);
                        Renderer.ctx.fill();
                        // $ symbol
                        Renderer.ctx.fillStyle = '#a80';
                        Renderer.ctx.font = '8px monospace';
                        Renderer.ctx.textAlign = 'center';
                        Renderer.ctx.fillText('$', screenX + signWidth/2, screenY - 3);
                        Renderer.ctx.textAlign = 'left';
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

                case 'crystal_formation':
                    // Large crystal formation
                    const formGlow = Math.sin(time * 2 + deco.x * 0.1) * 0.2 + 0.8;
                    // Multiple crystals
                    Renderer.ctx.fillStyle = `rgba(100,180,255,${formGlow})`;
                    // Main crystal
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 8, screenY);
                    Renderer.ctx.lineTo(screenX + 14, screenY + 24);
                    Renderer.ctx.lineTo(screenX + 2, screenY + 24);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    // Side crystal left
                    Renderer.ctx.fillStyle = `rgba(80,160,240,${formGlow})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX, screenY + 8);
                    Renderer.ctx.lineTo(screenX + 4, screenY + 24);
                    Renderer.ctx.lineTo(screenX - 4, screenY + 24);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    // Side crystal right
                    Renderer.ctx.fillStyle = `rgba(120,200,255,${formGlow})`;
                    Renderer.ctx.beginPath();
                    Renderer.ctx.moveTo(screenX + 14, screenY + 6);
                    Renderer.ctx.lineTo(screenX + 18, screenY + 24);
                    Renderer.ctx.lineTo(screenX + 10, screenY + 24);
                    Renderer.ctx.closePath();
                    Renderer.ctx.fill();
                    // Sparkle
                    if (Math.sin(time * 4 + deco.x) > 0.8) {
                        Renderer.drawRect(screenX + 7, screenY + 2, 2, 2, '#fff');
                    }
                    break;

                case 'ancient_plaque':
                    // Ancient stone plaque with glowing runes
                    const plaqueGlow = Math.sin(time * 1.5) * 0.3 + 0.7;
                    // Stone slab
                    Renderer.drawRect(screenX, screenY, 32, 24, '#555');
                    Renderer.drawRect(screenX + 2, screenY + 2, 28, 20, '#444');
                    // Border ornament
                    Renderer.drawRect(screenX + 1, screenY + 1, 30, 1, '#666');
                    Renderer.drawRect(screenX + 1, screenY + 22, 30, 1, '#666');
                    // Glowing runes
                    Renderer.ctx.fillStyle = `rgba(100,200,255,${plaqueGlow})`;
                    // Rune symbols
                    Renderer.drawRect(screenX + 6, screenY + 6, 3, 1, `rgba(100,200,255,${plaqueGlow})`);
                    Renderer.drawRect(screenX + 6, screenY + 6, 1, 4, `rgba(100,200,255,${plaqueGlow})`);
                    Renderer.drawRect(screenX + 12, screenY + 8, 4, 1, `rgba(150,220,255,${plaqueGlow})`);
                    Renderer.drawRect(screenX + 14, screenY + 6, 1, 6, `rgba(150,220,255,${plaqueGlow})`);
                    Renderer.drawRect(screenX + 20, screenY + 6, 3, 3, `rgba(100,180,255,${plaqueGlow})`);
                    Renderer.drawRect(screenX + 8, screenY + 14, 5, 1, `rgba(120,200,255,${plaqueGlow})`);
                    Renderer.drawRect(screenX + 16, screenY + 14, 4, 1, `rgba(100,200,255,${plaqueGlow})`);
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
                case 'secret_door':
                    // Secret door revealed in wall
                    const doorGlow = Math.sin(performance.now() / 1000) * 0.2 + 0.8;
                    // Dark doorway
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#111');
                    // Glowing frame
                    Renderer.drawRect(screenX, screenY, 2, interactable.height, `rgba(100,180,255,${doorGlow})`);
                    Renderer.drawRect(screenX + interactable.width - 2, screenY, 2, interactable.height, `rgba(100,180,255,${doorGlow})`);
                    Renderer.drawRect(screenX, screenY, interactable.width, 2, `rgba(100,180,255,${doorGlow})`);
                    Renderer.drawRect(screenX, screenY + interactable.height - 2, interactable.width, 2, `rgba(100,180,255,${doorGlow})`);
                    // Mysterious glow inside
                    Renderer.ctx.fillStyle = `rgba(80,150,200,${doorGlow * 0.3})`;
                    Renderer.ctx.fillRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4);
                    break;
                case 'lore_plaque':
                    // Interactive ancient plaque
                    const plaqueGlow = Math.sin(performance.now() / 1000) * 0.2 + 0.7;
                    // Stone slab
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#555');
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4, '#444');
                    // Glowing border
                    Renderer.drawRect(screenX, screenY, interactable.width, 2, `rgba(100,200,255,${plaqueGlow})`);
                    Renderer.drawRect(screenX, screenY + interactable.height - 2, interactable.width, 2, `rgba(100,200,255,${plaqueGlow})`);
                    // Runes
                    for (let i = 0; i < 3; i++) {
                        Renderer.drawRect(screenX + 8 + i * 12, screenY + 10, 6, 2, `rgba(150,220,255,${plaqueGlow})`);
                        Renderer.drawRect(screenX + 10 + i * 12, screenY + 14, 2, 6, `rgba(100,180,255,${plaqueGlow})`);
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
                    // Cabinet doors (food storage)
                    Renderer.drawRect(screenX + 4, screenY + 18, 10, 10, '#765');
                    Renderer.drawRect(screenX + 16, screenY + 18, 10, 10, '#765');
                    // Knobs
                    Renderer.drawRect(screenX + 12, screenY + 22, 2, 2, '#fc0');
                    Renderer.drawRect(screenX + 24, screenY + 22, 2, 2, '#fc0');
                    // Food storage indicator - show if food is stored
                    const storedFoodCount = Save.getFlag('stored_food_count') || 0;
                    if (storedFoodCount > 0) {
                        Renderer.drawRect(screenX + interactable.width - 10, screenY + 4, 8, 8, '#4a4');
                        Renderer.ctx.fillStyle = '#fff';
                        Renderer.ctx.font = '6px monospace';
                        Renderer.ctx.fillText(storedFoodCount.toString(), screenX + interactable.width - 8, screenY + 10);
                    }
                    break;
                case 'armor_chest':
                case 'weapon_chest':
                    // Storage chest (shared storage for all items)
                    const isArmor = interactable.type === 'armor_chest';
                    // Chest body
                    Renderer.drawRect(screenX, screenY + 6, interactable.width, interactable.height - 6, isArmor ? '#654' : '#543');
                    Renderer.drawRect(screenX + 2, screenY + 8, interactable.width - 4, interactable.height - 10, isArmor ? '#876' : '#765');
                    // Lid
                    Renderer.drawRect(screenX, screenY, interactable.width, 8, isArmor ? '#765' : '#654');
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, 4, isArmor ? '#987' : '#876');
                    // Metal bands
                    Renderer.drawRect(screenX, screenY + 4, interactable.width, 2, '#555');
                    Renderer.drawRect(screenX, screenY + interactable.height - 4, interactable.width, 2, '#555');
                    // Lock/clasp
                    Renderer.drawRect(screenX + interactable.width/2 - 3, screenY + 6, 6, 6, isArmor ? '#fc0' : '#aaa');
                    // Item count indicator (uses shared storage)
                    const storedItems = Save.getFlag('stored_items') || [];
                    if (storedItems.length > 0) {
                        // Show count badge
                        Renderer.drawRect(screenX + interactable.width - 10, screenY + 2, 10, 10, '#a44');
                        Renderer.ctx.fillStyle = '#fff';
                        Renderer.ctx.font = '7px monospace';
                        Renderer.ctx.textAlign = 'center';
                        Renderer.ctx.fillText(storedItems.length.toString(), screenX + interactable.width - 5, screenY + 10);
                        Renderer.ctx.textAlign = 'left';
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

                    // Display trophies from displayed_trophies array
                    const displayedTrophies = Save.getFlag('displayed_trophies') || [];
                    const trophyPositions = [
                        { x: screenX + 6, y: screenY + 6 },
                        { x: screenX + 18, y: screenY + 6 },
                        { x: screenX + 6, y: screenY + 20 },
                        { x: screenX + 18, y: screenY + 20 },
                        { x: screenX + 6, y: screenY + 36 },
                        { x: screenX + 18, y: screenY + 36 }
                    ];

                    for (let i = 0; i < Math.min(displayedTrophies.length, trophyPositions.length); i++) {
                        const itemId = displayedTrophies[i];
                        const pos = trophyPositions[i];
                        const glow = Math.sin(performance.now() / 500 + i) * 0.3 + 0.7;

                        switch(itemId) {
                            case 'crystal_key':
                                // Crystal key - sparkly crystal
                                Renderer.drawRect(pos.x, pos.y + 2, 3, 6, `rgba(180,220,255,${glow})`);
                                Renderer.drawRect(pos.x + 3, pos.y + 6, 5, 2, `rgba(180,220,255,${glow})`);
                                break;
                            case 'keeper_key':
                                // Golden keeper's key
                                Renderer.drawRect(pos.x, pos.y + 2, 3, 6, '#fc0');
                                Renderer.drawRect(pos.x + 3, pos.y + 6, 4, 2, '#fc0');
                                break;
                            case 'guardian_crystal':
                                // Large glowing crystal
                                Renderer.drawRect(pos.x, pos.y, 6, 10, `rgba(100,200,255,${glow})`);
                                Renderer.drawRect(pos.x + 2, pos.y + 2, 2, 6, `rgba(150,230,255,${glow})`);
                                break;
                            case 'destroyer_heart':
                                // Dark pulsing heart
                                const heartGlow = Math.sin(performance.now() / 200) * 0.3 + 0.7;
                                Renderer.drawRect(pos.x, pos.y + 2, 8, 6, `rgba(100,20,60,${heartGlow})`);
                                Renderer.drawRect(pos.x + 2, pos.y, 4, 2, `rgba(100,20,60,${heartGlow})`);
                                Renderer.drawRect(pos.x + 3, pos.y + 4, 2, 2, `rgba(200,50,80,${heartGlow})`);
                                break;
                            case 'mega_core':
                                // Glowing core with inner light
                                const coreGlow = Math.sin(performance.now() / 300) * 0.3 + 0.7;
                                Renderer.drawRect(pos.x, pos.y, 8, 8, `rgba(255,100,100,${coreGlow})`);
                                Renderer.drawRect(pos.x + 2, pos.y + 2, 4, 4, `rgba(255,200,100,${coreGlow})`);
                                break;
                            case 'old_photo':
                                // Faded photo frame
                                Renderer.drawRect(pos.x, pos.y, 8, 10, '#654');
                                Renderer.drawRect(pos.x + 1, pos.y + 1, 6, 8, '#876');
                                Renderer.drawRect(pos.x + 2, pos.y + 3, 2, 2, '#543');
                                break;
                            case 'music_box':
                                // Small music box
                                Renderer.drawRect(pos.x, pos.y + 2, 8, 6, '#a86');
                                Renderer.drawRect(pos.x + 1, pos.y + 3, 6, 4, '#c97');
                                Renderer.drawRect(pos.x + 3, pos.y, 2, 3, '#fc0');
                                break;
                            case 'lore_tablet':
                                // Stone tablet with runes
                                Renderer.drawRect(pos.x, pos.y, 7, 10, '#666');
                                Renderer.drawRect(pos.x + 1, pos.y + 2, 2, 1, '#8af');
                                Renderer.drawRect(pos.x + 4, pos.y + 4, 2, 1, '#8af');
                                Renderer.drawRect(pos.x + 1, pos.y + 6, 2, 1, '#8af');
                                break;
                            default:
                                // Generic trophy - glowing orb
                                Renderer.drawRect(pos.x + 1, pos.y + 1, 6, 6, `rgba(200,180,100,${glow})`);
                                break;
                        }
                    }

                    // Backwards compatibility: show crown if crowned_hero flag set
                    if (Save.getFlag('crowned_hero') && displayedTrophies.length === 0) {
                        Renderer.drawRect(screenX + 6, screenY + 6, 8, 3, '#fc0');
                        Renderer.drawRect(screenX + 7, screenY + 4, 2, 2, '#fc0');
                        Renderer.drawRect(screenX + 11, screenY + 4, 2, 2, '#fc0');
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
