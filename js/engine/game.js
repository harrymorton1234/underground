/**
 * Main game loop and state management
 */
const Game = {
    // Game states
    states: {
        LOADING: 'loading',
        TITLE: 'title',
        NAME_ENTRY: 'name_entry',
        OVERWORLD: 'overworld',
        BATTLE: 'battle',
        DIALOGUE: 'dialogue',
        MENU: 'menu',
        SAVE_MENU: 'save_menu',
        SHOP: 'shop',
        ENDING: 'ending',
        GAME_OVER: 'game_over'
    },

    // Current state
    currentState: null,
    previousState: null,

    // State stack for overlays
    stateStack: [],

    // Timing
    lastTime: 0,
    deltaTime: 0,
    targetFPS: 60,
    frameTime: 1000 / 60,
    accumulator: 0,

    // Game running flag
    running: false,

    // Loading progress
    loadingProgress: 0,
    loadingText: 'Loading...',

    // Transition
    transitioning: false,
    transitionCallback: null,

    // Debug mode
    debug: false,

    /**
     * Initialize the game
     */
    async init() {
        console.log('Initializing game...');

        // Initialize systems
        Renderer.init();
        Input.init();
        Audio.init();
        Save.init();

        // Start loading
        this.setState(this.states.LOADING);
        await this.load();

        // Go to title screen
        this.setState(this.states.TITLE);

        // Start game loop
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));

        console.log('Game initialized!');
    },

    /**
     * Load game assets
     */
    async load() {
        this.loadingText = 'Loading assets...';
        this.loadingProgress = 0;

        // Initialize audio context (needs user interaction first)
        // Generate placeholder sounds
        if (Audio.context) {
            await Audio.preloadCommon();
        }

        this.loadingProgress = 50;
        this.loadingText = 'Preparing...';

        // Small delay to show loading screen
        await Utils.wait(200);

        this.loadingProgress = 100;
    },

    /**
     * Main game loop
     */
    loop(currentTime) {
        if (!this.running) return;

        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent spiral of death
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }

        // Fixed timestep with accumulator
        this.accumulator += this.deltaTime;

        while (this.accumulator >= this.frameTime / 1000) {
            this.update(this.frameTime / 1000);
            this.accumulator -= this.frameTime / 1000;
        }

        // Render
        this.render();

        // Clear input states at end of frame
        Input.endFrame();

        // Request next frame
        requestAnimationFrame((time) => this.loop(time));
    },

    /**
     * Update game state
     */
    update(dt) {
        // Update input
        Input.update();

        // Update renderer effects
        Renderer.update(dt);

        // Update current state
        switch (this.currentState) {
            case this.states.LOADING:
                this.updateLoading(dt);
                break;
            case this.states.TITLE:
                this.updateTitle(dt);
                break;
            case this.states.NAME_ENTRY:
                this.updateNameEntry(dt);
                break;
            case this.states.OVERWORLD:
                Overworld.update(dt);
                break;
            case this.states.BATTLE:
                Battle.update(dt);
                break;
            case this.states.DIALOGUE:
                Dialogue.update(dt);
                break;
            case this.states.MENU:
                this.updateMenu(dt);
                break;
            case this.states.SAVE_MENU:
                this.updateSaveMenu(dt);
                break;
            case this.states.SHOP:
                this.updateShop(dt);
                break;
            case this.states.GAME_OVER:
                this.updateGameOver(dt);
                break;
            case this.states.ENDING:
                this.updateEnding(dt);
                break;
        }

        // Update play time
        if (this.currentState === this.states.OVERWORLD ||
            this.currentState === this.states.BATTLE) {
            Save.addPlayTime(dt);
        }

        // Toggle debug with F3
        if (Input.keys['F3'] && !this._f3Pressed) {
            this.debug = !this.debug;
            this._f3Pressed = true;
        } else if (!Input.keys['F3']) {
            this._f3Pressed = false;
        }
    },

    /**
     * Render current state
     */
    render() {
        Renderer.clear('#000');
        Renderer.beginFrame();

        switch (this.currentState) {
            case this.states.LOADING:
                this.renderLoading();
                break;
            case this.states.TITLE:
                this.renderTitle();
                break;
            case this.states.NAME_ENTRY:
                this.renderNameEntry();
                break;
            case this.states.OVERWORLD:
                Overworld.render();
                break;
            case this.states.BATTLE:
                Battle.render();
                break;
            case this.states.DIALOGUE:
                // Render underlying state first
                if (this.previousState === this.states.OVERWORLD) {
                    Overworld.render();
                } else if (this.previousState === this.states.BATTLE) {
                    Battle.render();
                }
                Dialogue.render();
                break;
            case this.states.MENU:
                // Render underlying state
                if (this.previousState === this.states.OVERWORLD) {
                    Overworld.render();
                }
                this.renderMenu();
                break;
            case this.states.SAVE_MENU:
                this.renderSaveMenu();
                break;
            case this.states.SHOP:
                Overworld.render();
                Inventory.renderShop();
                break;
            case this.states.GAME_OVER:
                this.renderGameOver();
                break;
            case this.states.ENDING:
                this.renderEnding();
                break;
        }

        // Debug overlay
        if (this.debug) {
            this.renderDebug();
        }

        Renderer.endFrame();
    },

    /**
     * Set game state
     */
    setState(newState, params = {}) {
        this.previousState = this.currentState;
        this.currentState = newState;

        // State enter logic
        switch (newState) {
            case this.states.TITLE:
                this.initTitle();
                break;
            case this.states.NAME_ENTRY:
                this.initNameEntry();
                break;
            case this.states.OVERWORLD:
                // Make sure player can move when entering overworld
                Player.canMove = true;
                if (params.roomId) {
                    Overworld.loadRoom(params.roomId);
                }
                break;
            case this.states.BATTLE:
                Battle.start(params.enemy, params);
                break;
            case this.states.DIALOGUE:
                Dialogue.start(params.dialogueId, params.callback);
                break;
            case this.states.MENU:
                this.initMenu();
                break;
            case this.states.SAVE_MENU:
                this.initSaveMenu(params.mode || 'save');
                break;
            case this.states.SHOP:
                // Shop is already opened by callback
                break;
            case this.states.GAME_OVER:
                this.initGameOver();
                break;
        }
    },

    /**
     * Push state onto stack (for overlays)
     */
    pushState(newState, params = {}) {
        this.stateStack.push({
            state: this.currentState,
            params: {}
        });
        this.setState(newState, params);
    },

    /**
     * Pop state from stack
     */
    popState() {
        if (this.stateStack.length > 0) {
            const previous = this.stateStack.pop();
            this.setState(previous.state, previous.params);
        }
    },

    /**
     * Transition to new state with fade
     */
    transitionTo(newState, params = {}) {
        if (this.transitioning) return;

        this.transitioning = true;
        Renderer.fadeOut('#000', 3);

        this.transitionCallback = () => {
            this.setState(newState, params);
            Renderer.fadeIn(3);
            this.transitioning = false;
        };
    },

    /**
     * Check and execute transition callback
     */
    checkTransition() {
        if (this.transitioning && Renderer.isFadeComplete() && Renderer.fadeEffect.alpha === 1) {
            if (this.transitionCallback) {
                this.transitionCallback();
                this.transitionCallback = null;
            }
        }
    },

    // ==================== LOADING STATE ====================

    updateLoading(dt) {
        // Loading is handled in init
    },

    renderLoading() {
        const centerX = Renderer.width / 2;
        const centerY = Renderer.height / 2;

        Renderer.drawText(this.loadingText, centerX, centerY - 20, '#fff', 'center');

        // Progress bar
        const barWidth = 100;
        const barHeight = 10;
        const barX = centerX - barWidth / 2;
        const barY = centerY;

        Renderer.drawRect(barX, barY, barWidth, barHeight, '#333');
        Renderer.drawRect(barX, barY, barWidth * (this.loadingProgress / 100), barHeight, '#fff');
    },

    // ==================== TITLE STATE ====================

    titleSelection: 0,
    titleOptions: ['Start', 'Continue', 'Settings'],

    initTitle() {
        this.titleSelection = 0;
        // Check if any saves exist
        this.hasSaves = false;
        for (let i = 0; i < Save.numSlots; i++) {
            if (Save.slotExists(i)) {
                this.hasSaves = true;
                break;
            }
        }
    },

    updateTitle(dt) {
        this.checkTransition();

        if (this.transitioning) return;

        if (Input.isPressed('up')) {
            this.titleSelection--;
            if (this.titleSelection < 0) this.titleSelection = this.titleOptions.length - 1;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('down')) {
            this.titleSelection++;
            if (this.titleSelection >= this.titleOptions.length) this.titleSelection = 0;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('confirm')) {
            Audio.playSFX('confirm');

            switch (this.titleSelection) {
                case 0: // Start
                    this.transitionTo(this.states.NAME_ENTRY);
                    break;
                case 1: // Continue
                    if (this.hasSaves) {
                        this.transitionTo(this.states.SAVE_MENU, { mode: 'load' });
                    } else {
                        Audio.playSFX('cancel');
                    }
                    break;
                case 2: // Settings
                    // TODO: Settings menu
                    break;
            }
        }
    },

    renderTitle() {
        const centerX = Renderer.width / 2;

        // Title
        Renderer.drawText('UNDERGROUND', centerX, 50, '#fff', 'center', 16);

        // Subtitle
        if (Save.hasPlayedBefore()) {
            Renderer.drawText('...you returned.', centerX, 75, '#888', 'center');
        }

        // Menu options
        const startY = 120;
        for (let i = 0; i < this.titleOptions.length; i++) {
            const y = startY + i * 20;
            let color = '#fff';

            // Dim "Continue" if no saves
            if (i === 1 && !this.hasSaves) {
                color = '#555';
            }

            if (i === this.titleSelection) {
                Renderer.drawText('>', centerX - 50, y, '#ff0');
            }

            Renderer.drawText(this.titleOptions[i], centerX - 35, y, color);
        }

        // Controls hint
        Renderer.drawText('Z - Confirm   X - Cancel', centerX, 220, '#666', 'center');
    },

    // ==================== NAME ENTRY STATE ====================

    enteredName: '',
    nameMaxLength: 8,
    nameCursor: 0,
    nameKeyboard: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ '.split(''),
    nameRow: 0,
    nameCol: 0,
    nameRowSize: 9,

    initNameEntry() {
        this.enteredName = '';
        this.nameRow = 0;
        this.nameCol = 0;
    },

    updateNameEntry(dt) {
        this.checkTransition();

        if (this.transitioning) return;

        const numRows = Math.ceil(this.nameKeyboard.length / this.nameRowSize);

        if (Input.isPressed('left')) {
            this.nameCol--;
            if (this.nameCol < 0) this.nameCol = this.nameRowSize - 1;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('right')) {
            this.nameCol++;
            if (this.nameCol >= this.nameRowSize) this.nameCol = 0;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('up')) {
            this.nameRow--;
            if (this.nameRow < 0) this.nameRow = numRows;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('down')) {
            this.nameRow++;
            if (this.nameRow > numRows) this.nameRow = 0;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('confirm')) {
            if (this.nameRow === numRows) {
                // Done button
                if (this.enteredName.length > 0) {
                    this.startNewGame(this.enteredName);
                } else {
                    Audio.playSFX('cancel');
                }
            } else {
                // Add character
                const index = this.nameRow * this.nameRowSize + this.nameCol;
                if (index < this.nameKeyboard.length && this.enteredName.length < this.nameMaxLength) {
                    this.enteredName += this.nameKeyboard[index];
                    Audio.playSFX('text');
                }
            }
        }

        if (Input.isPressed('cancel')) {
            // Backspace
            if (this.enteredName.length > 0) {
                this.enteredName = this.enteredName.slice(0, -1);
                Audio.playSFX('cancel');
            } else {
                // Go back to title
                this.transitionTo(this.states.TITLE);
            }
        }
    },

    renderNameEntry() {
        const centerX = Renderer.width / 2;

        Renderer.drawText('Name the fallen human.', centerX, 30, '#fff', 'center');

        // Name display
        const nameBoxY = 55;
        Renderer.drawBox(centerX - 50, nameBoxY, 100, 20);
        Renderer.drawText(this.enteredName + '_', centerX, nameBoxY + 6, '#fff', 'center');

        // Keyboard
        const keyboardY = 90;
        const charWidth = 14;
        const startX = centerX - (this.nameRowSize * charWidth) / 2;

        for (let i = 0; i < this.nameKeyboard.length; i++) {
            const row = Math.floor(i / this.nameRowSize);
            const col = i % this.nameRowSize;
            const x = startX + col * charWidth;
            const y = keyboardY + row * 16;

            const isSelected = this.nameRow === row && this.nameCol === col;
            const color = isSelected ? '#ff0' : '#fff';

            if (isSelected) {
                Renderer.drawRect(x - 2, y - 2, charWidth, 14, '#333');
            }

            Renderer.drawText(this.nameKeyboard[i], x, y, color);
        }

        // Done button
        const doneY = keyboardY + Math.ceil(this.nameKeyboard.length / this.nameRowSize) * 16 + 10;
        const doneSelected = this.nameRow === Math.ceil(this.nameKeyboard.length / this.nameRowSize);

        Renderer.drawText(doneSelected ? '> Done' : '  Done', centerX - 20, doneY, doneSelected ? '#ff0' : '#fff');

        // Special name hints
        this.checkSpecialName();
    },

    checkSpecialName() {
        const name = this.enteredName.toUpperCase();
        let hint = null;

        // Easter egg names
        switch (name) {
            case 'CHARA':
                hint = 'The true name.';
                break;
            case 'FRISK':
                hint = 'A familiar feeling...';
                break;
            case 'ASRIEL':
                hint = "You can't choose that name.";
                break;
        }

        if (hint) {
            Renderer.drawText(hint, Renderer.width / 2, 200, '#f88', 'center');
        }
    },

    /**
     * Start a new game
     */
    startNewGame(name) {
        // Check for special names
        const upperName = name.toUpperCase();
        Save.recordSpecialName(upperName);

        // Create new save data
        const saveData = Save.createNewSave();
        saveData.name = name;
        Save.setCurrent(saveData);

        // Reset overworld state for new game
        Overworld.enteredDialogues = {};

        // Transition to game
        Audio.playSFX('confirm');
        this.transitionTo(this.states.OVERWORLD, { roomId: 'intro_1' });
    },

    // ==================== MENU STATE ====================

    menuSelection: 0,
    menuOptions: ['ITEM', 'STAT', 'SAVE', 'EXIT'],

    initMenu() {
        this.menuSelection = 0;
    },

    updateMenu(dt) {
        if (Input.isPressed('up')) {
            this.menuSelection--;
            if (this.menuSelection < 0) this.menuSelection = this.menuOptions.length - 1;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('down')) {
            this.menuSelection++;
            if (this.menuSelection >= this.menuOptions.length) this.menuSelection = 0;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('confirm')) {
            Audio.playSFX('confirm');

            switch (this.menuSelection) {
                case 0: // Item
                    Inventory.openMenu();
                    break;
                case 1: // Stat
                    // Show stats (could be separate state)
                    break;
                case 2: // Save
                    this.setState(this.states.SAVE_MENU, { mode: 'save' });
                    break;
                case 3: // Exit
                    this.setState(this.states.OVERWORLD);
                    break;
            }
        }

        if (Input.isPressed('cancel') || Input.isPressed('menu')) {
            Audio.playSFX('cancel');
            this.setState(this.states.OVERWORLD);
        }
    },

    renderMenu() {
        const save = Save.getCurrent();
        if (!save) return;

        // Menu box
        Renderer.drawBox(20, 20, 280, 200);

        // Player name and level
        Renderer.drawText(`${save.name}  LV ${save.level}`, 35, 35, '#fff');

        // HP bar
        const hpBarX = 35;
        const hpBarY = 55;
        Renderer.drawText('HP', hpBarX, hpBarY, '#fff');
        Renderer.drawRect(hpBarX + 25, hpBarY, 100, 10, '#600');
        Renderer.drawRect(hpBarX + 25, hpBarY, 100 * (save.hp / save.maxHp), 10, '#ff0');
        Renderer.drawText(`${save.hp} / ${save.maxHp}`, hpBarX + 130, hpBarY, '#fff');

        // Stats
        Renderer.drawText(`ATK: ${save.attack}  DEF: ${save.defense}`, 35, 80, '#fff');
        Renderer.drawText(`EXP: ${save.exp}  GOLD: ${save.gold}`, 35, 95, '#fff');

        // Menu options
        const optionStartY = 130;
        for (let i = 0; i < this.menuOptions.length; i++) {
            const y = optionStartY + i * 16;
            const isSelected = i === this.menuSelection;

            if (isSelected) {
                Renderer.drawText('>', 35, y, '#ff0');
            }

            Renderer.drawText(this.menuOptions[i], 50, y, isSelected ? '#ff0' : '#fff');
        }

        // Play time
        Renderer.drawText(`TIME: ${Save.formatPlayTime()}`, 200, 35, '#888');
    },

    // ==================== SAVE MENU STATE ====================

    saveMenuMode: 'save',
    saveMenuSelection: 0,

    initSaveMenu(mode) {
        this.saveMenuMode = mode;
        this.saveMenuSelection = 0;
    },

    updateSaveMenu(dt) {
        if (Input.isPressed('up')) {
            this.saveMenuSelection--;
            if (this.saveMenuSelection < 0) this.saveMenuSelection = Save.numSlots - 1;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('down')) {
            this.saveMenuSelection++;
            if (this.saveMenuSelection >= Save.numSlots) this.saveMenuSelection = 0;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('confirm')) {
            if (this.saveMenuMode === 'save') {
                Save.saveToSlot(this.saveMenuSelection);
                Audio.playSFX('save');
                this.setState(this.states.OVERWORLD);
            } else {
                // Load
                if (Save.slotExists(this.saveMenuSelection)) {
                    const loadedSave = Save.loadFromSlot(this.saveMenuSelection);
                    if (loadedSave) {
                        Audio.playSFX('confirm');
                        // Make sure roomId exists, default to intro_1 if not
                        const roomId = loadedSave.roomId || 'intro_1';
                        this.setState(this.states.OVERWORLD);
                        Overworld.loadRoom(roomId, loadedSave.x, loadedSave.y);
                        Renderer.fadeIn(2);
                    } else {
                        Audio.playSFX('cancel');
                    }
                } else {
                    Audio.playSFX('cancel');
                }
            }
        }

        if (Input.isPressed('cancel')) {
            Audio.playSFX('cancel');
            if (this.saveMenuMode === 'save') {
                this.setState(this.states.MENU);
            } else {
                this.transitionTo(this.states.TITLE);
            }
        }
    },

    renderSaveMenu() {
        const centerX = Renderer.width / 2;

        Renderer.drawBox(40, 30, 240, 180);

        Renderer.drawText(this.saveMenuMode === 'save' ? 'SAVE' : 'LOAD', centerX, 45, '#fff', 'center');

        for (let i = 0; i < Save.numSlots; i++) {
            const y = 70 + i * 45;
            const info = Save.getSlotInfo(i);
            const isSelected = i === this.saveMenuSelection;

            Renderer.drawRect(55, y, 210, 40, isSelected ? '#333' : '#111');

            if (info.exists) {
                Renderer.drawText(`${info.name}  LV ${info.level}`, 65, y + 5, '#fff');
                Renderer.drawText(`${info.roomId}`, 65, y + 18, '#888');
                Renderer.drawText(Utils.formatTime(info.playTime), 200, y + 5, '#888');
            } else {
                Renderer.drawText('Empty', 65, y + 12, '#555');
            }

            if (isSelected) {
                Renderer.drawText('>', 50, y + 12, '#ff0');
            }
        }
    },

    // ==================== SHOP STATE ====================

    updateShop(dt) {
        if (!Inventory.updateShop(dt)) {
            // Shop closed, return to overworld
            this.setState(this.states.OVERWORLD);
        }
    },

    // ==================== GAME OVER STATE ====================

    gameOverTimer: 0,

    initGameOver() {
        this.gameOverTimer = 0;
    },

    updateGameOver(dt) {
        this.gameOverTimer += dt;

        if (this.gameOverTimer > 2 && Input.isPressed('confirm')) {
            // Return to title or last save
            this.transitionTo(this.states.TITLE);
        }
    },

    renderGameOver() {
        // Clear to black first
        Renderer.clear('#000');

        const centerX = Renderer.width / 2;
        const centerY = Renderer.height / 2;

        Renderer.drawText('GAME OVER', centerX, centerY - 20, '#f00', 'center', 12);

        if (this.gameOverTimer > 2) {
            Renderer.drawText('Press Z to continue', centerX, centerY + 30, '#888', 'center', 8);
        }
    },

    // ==================== ENDING STATE ====================

    endingType: null,

    updateEnding(dt) {
        // Ending cutscene logic
    },

    renderEnding() {
        // Render ending
    },

    // ==================== DEBUG ====================

    renderDebug() {
        const save = Save.getCurrent();

        Renderer.drawRect(0, 0, 100, 50, 'rgba(0,0,0,0.7)');
        Renderer.drawText(`FPS: ${Math.round(1 / this.deltaTime)}`, 5, 5, '#0f0');
        Renderer.drawText(`State: ${this.currentState}`, 5, 15, '#0f0');

        if (save) {
            Renderer.drawText(`Room: ${save.roomId}`, 5, 25, '#0f0');
            Renderer.drawText(`Kills: ${save.kills}`, 5, 35, '#0f0');
        }
    },

    /**
     * Trigger game over
     */
    gameOver() {
        this.transitionTo(this.states.GAME_OVER);
    },

    /**
     * Show ending
     */
    showEnding(type) {
        this.endingType = type;
        Save.recordPlaythrough(type);
        this.transitionTo(this.states.ENDING);
    }
};

// Make it globally available
window.Game = Game;
