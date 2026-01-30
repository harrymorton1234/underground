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

        // Change music if specified
        if (room.music) {
            // Audio.playMusic(room.music);
        }
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

        // Check for transitions
        this.checkTransitions();

        // Check for interactions
        if (Input.isPressed('confirm')) {
            this.checkInteraction();
        }

        // Check for save points
        this.checkSavePoints();

        // Check for random encounters
        if (Player.velX !== 0 || Player.velY !== 0) {
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
                    // Need specific item to pass
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
            for (const interactable of this.currentRoom.interactables) {
                const rect = {
                    x: interactable.x,
                    y: interactable.y,
                    width: interactable.width,
                    height: interactable.height
                };

                if (Utils.pointInRect(interactionPoint.x, interactionPoint.y, rect)) {
                    Game.setState(Game.states.DIALOGUE, {
                        dialogueId: interactable.dialogue
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
                // Heal player
                const save = Save.getCurrent();
                if (save) {
                    save.hp = save.maxHp;
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
     * Check for random encounter
     */
    checkEncounter(dt) {
        if (!this.currentRoom.encounterRate || this.currentRoom.encounterRate === 0) return;

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
        let enemies = this.currentRoom.encounterEnemies;

        // Default to dummy if no enemies defined (for testing)
        if (!enemies || enemies.length === 0) {
            enemies = ['dummy'];
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

        // Render interactables
        this.renderInteractables();

        // Render save points
        this.renderSavePoints();

        // Render NPCs
        NPCManager.render(this.camera.x, this.camera.y);

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
                }
            }
        }
    },

    /**
     * Render interactables
     */
    renderInteractables() {
        if (!this.currentRoom || !this.currentRoom.interactables) return;

        for (const interactable of this.currentRoom.interactables) {
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
