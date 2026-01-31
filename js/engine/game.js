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
        GAME_OVER: 'game_over',
        SETTINGS: 'settings'
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

        // Check for pending transitions
        this.checkTransition();

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
            case this.states.SETTINGS:
                this.updateSettings(dt);
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
            case this.states.SETTINGS:
                this.renderSettings();
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
            case this.states.SETTINGS:
                this.initSettings();
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
        // Play title music
        Audio.playMusic('music_title', true, 1.0);
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
                    Audio.playSFX('confirm');
                    this.menuReturnState = this.states.TITLE;
                    this.setState(this.states.SETTINGS);
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

        // Initialize stats based on equipment
        Inventory.updateStats();
        Inventory.updateMaxItems();

        // Reset overworld state for new game
        Overworld.enteredDialogues = {};

        // Transition to game
        Audio.playSFX('confirm');
        this.transitionTo(this.states.OVERWORLD, { roomId: 'intro_1' });
    },

    // ==================== MENU STATE ====================

    menuSelection: 0,
    menuOptions: ['ITEM', 'SETTINGS', 'SAVE', 'EXIT'],
    inItemMenu: false,
    itemMenuSelection: 0,
    showExitConfirm: false,
    exitConfirmSelection: 0,

    initMenu() {
        this.menuSelection = 0;
        this.inItemMenu = false;
        this.itemMenuSelection = 0;
        this.showExitConfirm = false;
        this.exitConfirmSelection = 0;
    },

    updateMenu(dt) {
        if (this.inItemMenu) {
            this.updateItemMenu(dt);
            return;
        }

        if (this.showExitConfirm) {
            this.updateExitConfirm(dt);
            return;
        }

        if (Input.isPressed('up')) {
            this.menuSelection--;
            if (this.menuSelection < 0) this.menuSelection = this.menuOptions.length - 1;
            Audio.playSFX('select');
        }

        if (Input.isPressed('down')) {
            this.menuSelection++;
            if (this.menuSelection >= this.menuOptions.length) this.menuSelection = 0;
            Audio.playSFX('select');
        }

        if (Input.isPressed('confirm')) {
            Audio.playSFX('confirm');

            switch (this.menuSelection) {
                case 0: // Item
                    this.inItemMenu = true;
                    this.itemMenuSelection = 0;
                    break;
                case 1: // Settings
                    this.menuReturnState = this.states.MENU;
                    this.setState(this.states.SETTINGS);
                    break;
                case 2: // Save
                    this.setState(this.states.SAVE_MENU, { mode: 'save' });
                    break;
                case 3: // Exit
                    this.showExitConfirm = true;
                    this.exitConfirmSelection = 0;
                    break;
            }
        }

        if (Input.isPressed('cancel') || Input.isPressed('menu')) {
            Audio.playSFX('cancel');
            this.setState(this.states.OVERWORLD);
        }
    },

    updateExitConfirm(dt) {
        // 0 = Save & Exit, 1 = Exit without saving, 2 = Cancel
        if (Input.isPressed('up')) {
            this.exitConfirmSelection--;
            if (this.exitConfirmSelection < 0) this.exitConfirmSelection = 2;
            Audio.playSFX('select');
        }

        if (Input.isPressed('down')) {
            this.exitConfirmSelection++;
            if (this.exitConfirmSelection > 2) this.exitConfirmSelection = 0;
            Audio.playSFX('select');
        }

        if (Input.isPressed('confirm')) {
            Audio.playSFX('confirm');
            if (this.exitConfirmSelection === 0) {
                // Save & Exit to title
                this.setState(this.states.SAVE_MENU, { mode: 'save_and_exit' });
            } else if (this.exitConfirmSelection === 1) {
                // Exit without saving
                this.transitionTo(this.states.TITLE);
            } else {
                // Cancel
                this.showExitConfirm = false;
            }
        }

        if (Input.isPressed('cancel')) {
            Audio.playSFX('cancel');
            this.showExitConfirm = false;
        }
    },

    updateItemMenu(dt) {
        const items = Inventory.getItems();

        if (Input.isPressed('up')) {
            this.itemMenuSelection--;
            if (this.itemMenuSelection < 0) this.itemMenuSelection = Math.max(0, items.length - 1);
            Audio.playSFX('select');
        }

        if (Input.isPressed('down')) {
            this.itemMenuSelection++;
            if (this.itemMenuSelection >= items.length) this.itemMenuSelection = 0;
            Audio.playSFX('select');
        }

        if (Input.isPressed('confirm') && items.length > 0) {
            const itemId = items[this.itemMenuSelection];
            const item = Items.get(itemId);
            if (item && item.type === 'consumable') {
                // Use the item
                const result = Inventory.useItem(this.itemMenuSelection);
                if (result && result.success) {
                    Audio.playSFX('heal');
                } else {
                    Audio.playSFX('cancel');
                }
                // Adjust selection after removal
                const newItems = Inventory.getItems();
                if (this.itemMenuSelection >= newItems.length) {
                    this.itemMenuSelection = Math.max(0, newItems.length - 1);
                }
            } else if (item && (item.type === 'weapon' || item.type === 'armor' || item.type === 'backpack')) {
                // Equip the item
                Audio.playSFX('confirm');
                Inventory.equipItem(this.itemMenuSelection);
            } else {
                Audio.playSFX('cancel');
            }
        }

        if (Input.isPressed('cancel')) {
            Audio.playSFX('cancel');
            this.inItemMenu = false;
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

        // Play time
        Renderer.drawText(`TIME: ${Save.formatPlayTime()}`, 200, 35, '#888');

        if (this.showExitConfirm) {
            // Exit confirmation dialog
            Renderer.drawBox(60, 80, 180, 80);
            Renderer.drawText('Exit to Title?', 150, 90, '#fff', 'center');

            const options = ['Save & Exit', 'Exit without saving', 'Cancel'];
            for (let i = 0; i < options.length; i++) {
                const y = 110 + i * 16;
                const isSelected = i === this.exitConfirmSelection;

                if (isSelected) {
                    Renderer.drawText('>', 75, y, '#ff0');
                }
                Renderer.drawText(options[i], 90, y, isSelected ? '#ff0' : '#fff');
            }
        } else if (this.inItemMenu) {
            // Show item list with scrolling
            const maxItems = Inventory.getMaxItems();
            const items = Inventory.getItems();
            Renderer.drawText(`ITEMS (${items.length}/${maxItems})`, 35, 115, '#ff0');
            if (items.length === 0) {
                Renderer.drawText('No items', 50, 135, '#888');
            } else {
                const maxVisible = 5;
                // Calculate scroll offset to keep selection visible
                let scrollOffset = 0;
                if (this.itemMenuSelection >= maxVisible) {
                    scrollOffset = this.itemMenuSelection - maxVisible + 1;
                }

                // Show scroll up indicator
                if (scrollOffset > 0) {
                    Renderer.drawText('^', 270, 135, '#888');
                }

                for (let i = 0; i < Math.min(items.length - scrollOffset, maxVisible); i++) {
                    const itemIndex = i + scrollOffset;
                    const y = 135 + i * 14;
                    const item = Items.get(items[itemIndex]);
                    const isSelected = itemIndex === this.itemMenuSelection;

                    if (isSelected) {
                        Renderer.drawText('>', 35, y, '#ff0');
                    }

                    const name = item ? item.name : items[itemIndex];
                    Renderer.drawText(name, 50, y, isSelected ? '#ff0' : '#fff');
                }

                // Show scroll down indicator
                if (scrollOffset + maxVisible < items.length) {
                    Renderer.drawText('v', 270, 135 + (maxVisible - 1) * 14, '#888');
                }

                // Show item count
                Renderer.drawText(`${this.itemMenuSelection + 1}/${items.length}`, 250, 115, '#888');
            }
            Renderer.drawText('X to go back', 35, 195, '#555');
        } else {
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
        }
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
            if (this.saveMenuMode === 'save' || this.saveMenuMode === 'save_and_exit') {
                Save.saveToSlot(this.saveMenuSelection);
                Audio.playSFX('save');
                if (this.saveMenuMode === 'save_and_exit') {
                    this.transitionTo(this.states.TITLE);
                } else {
                    this.setState(this.states.OVERWORLD);
                }
            } else {
                // Load
                if (Save.slotExists(this.saveMenuSelection)) {
                    const loadedSave = Save.loadFromSlot(this.saveMenuSelection);
                    if (loadedSave) {
                        Audio.playSFX('confirm');
                        // Update stats based on equipment
                        Inventory.updateStats();
                        Inventory.updateMaxItems();
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
            } else if (this.saveMenuMode === 'save_and_exit') {
                this.setState(this.states.MENU);
                this.showExitConfirm = true;
            } else {
                this.transitionTo(this.states.TITLE);
            }
        }
    },

    renderSaveMenu() {
        const centerX = Renderer.width / 2;

        Renderer.drawBox(40, 30, 240, 180);

        const saveTitle = this.saveMenuMode === 'load' ? 'LOAD' : 'SAVE';
        Renderer.drawText(saveTitle, centerX, 45, '#fff', 'center');

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
    gameOverShards: [],
    gameOverSelection: 0,

    initGameOver() {
        this.gameOverTimer = 0;
        this.gameOverSelection = 0;
        Audio.playSFX('cancel');

        // Create heart shard particles
        this.gameOverShards = [];
        const centerX = Renderer.width / 2;
        const centerY = Renderer.height / 2 - 40;
        for (let i = 0; i < 6; i++) {
            this.gameOverShards.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 80,
                vy: (Math.random() - 0.5) * 60 - 30,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 5,
                size: 4 + Math.random() * 4
            });
        }
    },

    updateGameOver(dt) {
        this.gameOverTimer += dt;

        // Update shards
        for (const shard of this.gameOverShards) {
            shard.x += shard.vx * dt;
            shard.y += shard.vy * dt;
            shard.vy += 120 * dt; // gravity
            shard.rotation += shard.rotSpeed * dt;
        }

        if (this.gameOverTimer > 2.5) {
            // Menu navigation
            if (Input.isPressed('up') || Input.isPressed('down')) {
                this.gameOverSelection = this.gameOverSelection === 0 ? 1 : 0;
                Audio.playSFX('select');
            }

            if (Input.isPressed('confirm')) {
                Audio.playSFX('confirm');
                if (this.gameOverSelection === 0) {
                    // Continue - go to load save menu
                    this.transitionTo(this.states.SAVE_MENU, { mode: 'load' });
                } else {
                    // Return to title
                    this.transitionTo(this.states.TITLE);
                }
            }
        }
    },

    renderGameOver() {
        Renderer.clear('#000');

        const centerX = Renderer.width / 2;
        const centerY = Renderer.height / 2;

        // Draw shattered heart pieces
        if (this.gameOverTimer < 2) {
            Renderer.ctx.save();
            for (const shard of this.gameOverShards) {
                Renderer.ctx.translate(shard.x, shard.y);
                Renderer.ctx.rotate(shard.rotation);
                Renderer.ctx.fillStyle = '#f00';
                Renderer.ctx.beginPath();
                Renderer.ctx.moveTo(0, -shard.size);
                Renderer.ctx.lineTo(shard.size * 0.6, 0);
                Renderer.ctx.lineTo(0, shard.size);
                Renderer.ctx.lineTo(-shard.size * 0.6, 0);
                Renderer.ctx.closePath();
                Renderer.ctx.fill();
                Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
            Renderer.ctx.restore();
        }

        // Fade in GAME OVER text
        if (this.gameOverTimer > 0.5) {
            const alpha = Math.min(1, (this.gameOverTimer - 0.5) / 1);
            const red = Math.floor(200 * alpha);
            Renderer.drawText('GAME OVER', centerX, centerY - 30, `rgb(${red}, 0, 0)`, 'center', 16);
        }

        // Show menu options
        if (this.gameOverTimer > 2.5) {
            const continueColor = this.gameOverSelection === 0 ? '#ff0' : '#888';
            const titleColor = this.gameOverSelection === 1 ? '#ff0' : '#888';

            // Draw soul cursor
            const cursorY = this.gameOverSelection === 0 ? centerY + 20 : centerY + 40;
            Renderer.ctx.fillStyle = '#f00';
            Renderer.ctx.beginPath();
            Renderer.ctx.moveTo(centerX - 50, cursorY + 4);
            Renderer.ctx.lineTo(centerX - 42, cursorY);
            Renderer.ctx.lineTo(centerX - 50, cursorY + 8);
            Renderer.ctx.lineTo(centerX - 46, cursorY + 4);
            Renderer.ctx.closePath();
            Renderer.ctx.fill();

            Renderer.drawText('Continue', centerX, centerY + 20, continueColor, 'center', 8);
            Renderer.drawText('Title Screen', centerX, centerY + 40, titleColor, 'center', 8);
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

    // ==================== SETTINGS STATE ====================

    settingsSelection: 0,
    settingsOptions: ['Sound Volume', 'Music Volume', 'Fullscreen', 'Help', 'Back'],
    soundVolume: 100,
    musicVolume: 100,
    menuReturnState: null,
    showingHelp: false,

    initSettings() {
        this.settingsSelection = 0;
        this.showingHelp = false;
        // If not set, default to title
        if (!this.menuReturnState) {
            this.menuReturnState = this.states.TITLE;
        }
    },

    updateSettings(dt) {
        // If showing help, just wait for any key to close
        if (this.showingHelp) {
            if (Input.isPressed('confirm') || Input.isPressed('cancel')) {
                Audio.playSFX('cancel');
                this.showingHelp = false;
            }
            return;
        }

        // Navigation
        if (Input.isPressed('up')) {
            this.settingsSelection = Math.max(0, this.settingsSelection - 1);
            Audio.playSFX('select');
        }
        if (Input.isPressed('down')) {
            this.settingsSelection = Math.min(this.settingsOptions.length - 1, this.settingsSelection + 1);
            Audio.playSFX('select');
        }

        // Adjust values
        if (Input.isPressed('left')) {
            if (this.settingsSelection === 0) {
                this.soundVolume = Math.max(0, this.soundVolume - 10);
                Audio.setSFXVolume(this.soundVolume / 100);
                Audio.playSFX('select');
            } else if (this.settingsSelection === 1) {
                this.musicVolume = Math.max(0, this.musicVolume - 10);
                Audio.setMusicVolume(this.musicVolume / 100);
            }
        }
        if (Input.isPressed('right')) {
            if (this.settingsSelection === 0) {
                this.soundVolume = Math.min(100, this.soundVolume + 10);
                Audio.setSFXVolume(this.soundVolume / 100);
                Audio.playSFX('select');
            } else if (this.settingsSelection === 1) {
                this.musicVolume = Math.min(100, this.musicVolume + 10);
                Audio.setMusicVolume(this.musicVolume / 100);
            }
        }

        // Confirm
        if (Input.isPressed('confirm')) {
            if (this.settingsSelection === 2) {
                // Toggle fullscreen
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
                Audio.playSFX('confirm');
            } else if (this.settingsSelection === 3) {
                // Help
                Audio.playSFX('confirm');
                this.showingHelp = true;
            } else if (this.settingsSelection === 4) {
                // Back
                Audio.playSFX('cancel');
                const returnTo = this.menuReturnState || this.states.TITLE;
                this.menuReturnState = null;
                this.setState(returnTo);
            }
        }

        // Cancel
        if (Input.isPressed('cancel')) {
            Audio.playSFX('cancel');
            const returnTo = this.menuReturnState || this.states.TITLE;
            this.menuReturnState = null;
            this.setState(returnTo);
        }
    },

    renderSettings() {
        Renderer.clear('#000');

        const centerX = Renderer.width / 2;

        // Show help screen if active
        if (this.showingHelp) {
            this.renderHelp();
            return;
        }

        Renderer.drawText('SETTINGS', centerX, 30, '#fff', 'center', 12);

        const startY = 70;
        const spacing = 25;

        for (let i = 0; i < this.settingsOptions.length; i++) {
            const y = startY + i * spacing;
            const isSelected = i === this.settingsSelection;
            const color = isSelected ? '#ff0' : '#888';

            // Draw cursor
            if (isSelected) {
                Renderer.ctx.fillStyle = '#f00';
                Renderer.ctx.beginPath();
                Renderer.ctx.moveTo(40, y + 4);
                Renderer.ctx.lineTo(48, y);
                Renderer.ctx.lineTo(40, y + 8);
                Renderer.ctx.lineTo(44, y + 4);
                Renderer.ctx.closePath();
                Renderer.ctx.fill();
            }

            Renderer.drawText(this.settingsOptions[i], 55, y, color, 'left', 8);

            // Draw values for volume options
            if (i === 0) {
                this.renderVolumeBar(180, y, this.soundVolume, isSelected);
            } else if (i === 1) {
                this.renderVolumeBar(180, y, this.musicVolume, isSelected);
            } else if (i === 2) {
                const fsText = document.fullscreenElement ? 'ON' : 'OFF';
                Renderer.drawText(fsText, 200, y, color, 'left', 8);
            }
        }

        Renderer.drawText('Use LEFT/RIGHT to adjust', centerX, 200, '#555', 'center', 6);
    },

    renderHelp() {
        const centerX = Renderer.width / 2;

        Renderer.drawText('CONTROLS', centerX, 25, '#fff', 'center', 12);

        // Draw a box for the controls
        Renderer.drawBox(30, 45, 260, 160);

        const controls = [
            ['ARROW KEYS', 'Move / Navigate menus'],
            ['Z or ENTER', 'Confirm / Interact'],
            ['X or ESC', 'Cancel / Go back'],
            ['C or SHIFT', 'Open menu (in game)'],
            ['', ''],
            ['BATTLE:', ''],
            ['ARROW KEYS', 'Move soul to dodge'],
            ['Z or ENTER', 'Confirm action'],
            ['', ''],
            ['F3', 'Toggle debug mode']
        ];

        let y = 55;
        for (const [key, desc] of controls) {
            if (key === '' && desc === '') {
                y += 6;
                continue;
            }
            if (desc === '') {
                // Section header
                Renderer.drawText(key, 45, y, '#ff0');
            } else {
                Renderer.drawText(key, 45, y, '#fff');
                Renderer.drawText(desc, 150, y, '#888');
            }
            y += 12;
        }

        Renderer.drawText('Press Z or X to close', centerX, 215, '#555', 'center', 6);
    },

    renderVolumeBar(x, y, value, isSelected) {
        const barWidth = 60;
        const barHeight = 8;
        const fillWidth = (value / 100) * barWidth;

        // Background
        Renderer.drawRect(x, y, barWidth, barHeight, '#333');
        // Fill
        Renderer.drawRect(x, y, fillWidth, barHeight, isSelected ? '#ff0' : '#888');
        // Value text
        Renderer.drawText(`${value}%`, x + barWidth + 10, y, isSelected ? '#ff0' : '#888', 'left', 7);
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
        // Direct state change without fade (battle already has dramatic effect)
        this.setState(this.states.GAME_OVER);
        Renderer.fadeEffect.alpha = 0; // Clear any fade
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
