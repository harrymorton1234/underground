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
            for (const interactable of this.currentRoom.interactables) {
                // Check flag requirements
                if (interactable.requiresFlag && !this.checkFlag(interactable.requiresFlag)) {
                    continue;
                }

                const rect = {
                    x: interactable.x,
                    y: interactable.y,
                    width: interactable.width,
                    height: interactable.height
                };

                if (Utils.pointInRect(interactionPoint.x, interactionPoint.y, rect)) {
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

        // Render decorations
        this.renderDecorations();

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
                    // Treasure chest
                    Renderer.drawRect(screenX, screenY, interactable.width, interactable.height, '#654');
                    Renderer.drawRect(screenX + 2, screenY + 2, interactable.width - 4, interactable.height - 4, '#876');
                    // Lock
                    Renderer.drawRect(screenX + interactable.width/2 - 4, screenY + interactable.height/2 - 2, 8, 8, '#ff0');
                    break;
                case 'hidden_key':
                    // Small glint to hint at something hidden
                    const glint = Math.sin(performance.now() / 400) * 0.3 + 0.5;
                    Renderer.drawRect(screenX + 8, screenY + 4, 4, 4, `rgba(150,200,255,${glint})`);
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
