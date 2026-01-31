/**
 * Battle system controller
 */
const Battle = {
    // Battle states
    states: {
        INTRO: 'intro',
        MENU: 'menu',
        FIGHT: 'fight',
        ACT: 'act',
        ITEM: 'item',
        MERCY: 'mercy',
        ENEMY_TURN: 'enemy_turn',
        DIALOGUE: 'dialogue',
        VICTORY: 'victory',
        SPARE: 'spare',
        GAME_OVER: 'game_over'
    },

    // Current state
    state: null,
    stateTimer: 0,

    // Enemy
    enemy: null,

    // Menu
    menuOptions: ['FIGHT', 'ACT', 'ITEM', 'MERCY'],
    menuIndex: 0,

    // Submenu (for ACT, ITEM)
    submenuOptions: [],
    submenuIndex: 0,
    showingSubmenu: false,

    // Fight minigame
    fightBar: {
        x: 50,
        y: 140,
        width: 220,
        height: 12,
        targetX: 160,
        targetWidth: 14,
        cursorX: 50,
        cursorSpeed: 250,
        cursorDirection: 1,
        active: false,
        result: null
    },

    // Battle box
    battleBox: {
        x: 32,
        y: 90,
        width: 256,
        height: 100
    },

    // Text display
    displayText: '',
    textQueue: [],

    // Callbacks
    onEnd: null,

    /**
     * Start battle
     */
    start(enemyId, options = {}) {
        // Ensure stats are up to date based on equipment
        Inventory.updateStats();

        // Get enemy data
        const save = Save.getCurrent();
        this.enemy = Enemies.getForRoute(enemyId, save);

        if (!this.enemy) {
            console.warn(`Enemy not found: ${enemyId}`);
            this.end();
            return;
        }

        this.enemy = new Enemy({ ...this.enemy, id: enemyId });

        // Initialize
        this.state = this.states.INTRO;
        this.stateTimer = 0;
        this.gameOverTriggered = false;
        this.menuIndex = 0;
        this.submenuIndex = 0;
        this.showingSubmenu = false;
        this.textQueue = [];
        this.onEnd = options.onEnd || null;

        // Initialize soul
        Soul.init();
        Soul.setBounds(this.battleBox.x, this.battleBox.y, this.battleBox.width, this.battleBox.height);

        // Initialize bullets
        Bullets.init();

        // Show encounter text
        this.showText(this.enemy.encounterText);

        // Play battle music (mega boss, boss, or normal)
        if (this.enemy.isMegaBoss) {
            Audio.playMusic('music_mega', true, 0.5);
        } else if (this.enemy.isBoss) {
            Audio.playMusic('music_boss', true, 0.5);
        } else {
            Audio.playMusic('music_battle', true, 0.5);
        }
    },

    /**
     * Update battle
     */
    update(dt) {
        this.stateTimer += dt;

        switch (this.state) {
            case this.states.INTRO:
                this.updateIntro(dt);
                break;
            case this.states.MENU:
                this.updateMenu(dt);
                break;
            case this.states.FIGHT:
                this.updateFight(dt);
                break;
            case this.states.ACT:
                this.updateAct(dt);
                break;
            case this.states.ITEM:
                this.updateItem(dt);
                break;
            case this.states.MERCY:
                this.updateMercy(dt);
                break;
            case this.states.ENEMY_TURN:
                this.updateEnemyTurn(dt);
                break;
            case this.states.DIALOGUE:
                this.updateDialogue(dt);
                break;
            case this.states.VICTORY:
                this.updateVictory(dt);
                break;
            case this.states.SPARE:
                this.updateSpare(dt);
                break;
            case this.states.GAME_OVER:
                this.updateGameOver(dt);
                break;
        }

        // Update enemy
        if (this.enemy) {
            this.enemy.update(dt);
        }
    },

    /**
     * Update intro state
     */
    updateIntro(dt) {
        if (Input.isPressed('confirm') && this.stateTimer > 0.5) {
            this.setState(this.states.MENU);
        }
    },

    /**
     * Update menu state
     */
    updateMenu(dt) {
        if (Input.isPressed('left')) {
            this.menuIndex = Math.max(0, this.menuIndex - 1);
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('right')) {
            this.menuIndex = Math.min(this.menuOptions.length - 1, this.menuIndex + 1);
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('confirm')) {
            Audio.playSFX('confirm');
            this.selectMenuOption();
        }
    },

    /**
     * Select menu option
     */
    selectMenuOption() {
        switch (this.menuOptions[this.menuIndex]) {
            case 'FIGHT':
                this.startFight();
                break;
            case 'ACT':
                this.openActMenu();
                break;
            case 'ITEM':
                this.openItemMenu();
                break;
            case 'MERCY':
                this.openMercyMenu();
                break;
        }
    },

    /**
     * Start fight minigame
     */
    startFight() {
        this.setState(this.states.FIGHT);
        this.fightBar.cursorX = this.fightBar.x;
        this.fightBar.targetX = this.fightBar.x + this.fightBar.width / 2;
        this.fightBar.cursorDirection = 1;
        this.fightBar.active = true;
        this.fightBar.result = null;
    },

    /**
     * Update fight minigame
     */
    updateFight(dt) {
        if (this.fightBar.active) {
            // Move cursor
            this.fightBar.cursorX += this.fightBar.cursorSpeed * this.fightBar.cursorDirection * dt;

            // Bounce at edges
            if (this.fightBar.cursorX >= this.fightBar.x + this.fightBar.width) {
                this.fightBar.cursorX = this.fightBar.x + this.fightBar.width;
                this.fightBar.cursorDirection = -1;
            } else if (this.fightBar.cursorX <= this.fightBar.x) {
                this.fightBar.cursorX = this.fightBar.x;
                this.fightBar.cursorDirection = 1;
            }

            // Stop on confirm
            if (Input.isPressed('confirm')) {
                this.fightBar.active = false;

                // Calculate damage based on accuracy
                const distance = Math.abs(this.fightBar.cursorX - this.fightBar.targetX);
                const accuracy = 1 - Math.min(distance / (this.fightBar.width / 2), 1);

                this.performAttack(accuracy);
            }
        } else {
            // Wait for text, then continue
            if (Input.isPressed('confirm') && this.stateTimer > 0.5) {
                if (this.enemy.defeated) {
                    this.setState(this.states.VICTORY);
                    this.showText(this.enemy.deathText);
                    Save.recordKill();
                } else {
                    this.startEnemyTurn();
                }
            }
        }
    },

    /**
     * Perform attack
     */
    performAttack(accuracy) {
        // Recalculate stats to ensure weapon bonus is applied
        Inventory.updateStats();

        const save = Save.getCurrent();
        const baseDamage = save.attack || 10;
        const damage = Math.floor(baseDamage * (0.5 + accuracy * 1.5));

        const actualDamage = this.enemy.takeDamage(damage);

        Audio.playSFX('hit');
        Renderer.shake(4, 0.2);

        this.showText(`* ${actualDamage} damage! (ATK: ${baseDamage})`);
    },

    /**
     * Open ACT menu
     */
    openActMenu() {
        this.submenuOptions = this.enemy.actOptions;
        this.submenuIndex = 0;
        this.showingSubmenu = true;
        this.setState(this.states.ACT);
    },

    /**
     * Update ACT state
     */
    updateAct(dt) {
        if (this.showingSubmenu) {
            if (Input.isPressed('up')) {
                this.submenuIndex = Math.max(0, this.submenuIndex - 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('down')) {
                this.submenuIndex = Math.min(this.submenuOptions.length - 1, this.submenuIndex + 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('confirm')) {
                Audio.playSFX('confirm');
                this.performAct(this.submenuOptions[this.submenuIndex]);
            }

            if (Input.isPressed('cancel')) {
                Audio.playSFX('cancel');
                this.showingSubmenu = false;
                this.setState(this.states.MENU);
            }
        } else {
            // Waiting for text
            if (Input.isPressed('confirm')) {
                this.startEnemyTurn();
            }
        }
    },

    /**
     * Perform ACT option
     */
    performAct(action) {
        this.showingSubmenu = false;
        const result = this.enemy.performAct(action);
        this.showText(result.text);

        if (result.spareable) {
            // Enemy can now be spared
        }
    },

    /**
     * Open ITEM menu
     */
    openItemMenu() {
        const items = Inventory.getItems();
        if (items.length === 0) {
            this.showText("* You don't have any items.");
            return;
        }

        this.submenuOptions = items.map((id, i) => {
            const item = Items.get(id);
            return item ? item.name : '???';
        });
        this.submenuIndex = 0;
        this.showingSubmenu = true;
        this.setState(this.states.ITEM);
    },

    /**
     * Update ITEM state
     */
    updateItem(dt) {
        if (this.showingSubmenu) {
            if (Input.isPressed('up')) {
                this.submenuIndex = Math.max(0, this.submenuIndex - 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('down')) {
                this.submenuIndex = Math.min(this.submenuOptions.length - 1, this.submenuIndex + 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('confirm')) {
                Audio.playSFX('confirm');
                this.useItem(this.submenuIndex);
            }

            if (Input.isPressed('cancel')) {
                Audio.playSFX('cancel');
                this.showingSubmenu = false;
                this.setState(this.states.MENU);
            }
        } else {
            // After using item, go back to menu (healing is free action)
            if (Input.isPressed('confirm')) {
                this.displayText = '';
                this.setState(this.states.MENU);
            }
        }
    },

    /**
     * Use item
     */
    useItem(index) {
        this.showingSubmenu = false;
        const result = Inventory.useItem(index);

        if (result && result.success) {
            Audio.playSFX('heal');
            this.showText(result.text);
        } else {
            this.showText(result ? result.text : "* That didn't work.");
        }
    },

    /**
     * Open MERCY menu
     */
    openMercyMenu() {
        this.submenuOptions = ['Spare', 'Flee'];
        this.submenuIndex = 0;
        this.showingSubmenu = true;
        this.setState(this.states.MERCY);
    },

    /**
     * Update MERCY state
     */
    updateMercy(dt) {
        if (this.showingSubmenu) {
            if (Input.isPressed('up')) {
                this.submenuIndex = Math.max(0, this.submenuIndex - 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('down')) {
                this.submenuIndex = Math.min(this.submenuOptions.length - 1, this.submenuIndex + 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('confirm')) {
                if (this.submenuIndex === 0) {
                    // Spare
                    if (this.enemy.canSpareNow()) {
                        Audio.playSFX('confirm');
                        this.performSpare();
                    } else {
                        Audio.playSFX('cancel');
                        this.showText("* You can't spare this enemy yet.");
                        this.showingSubmenu = false;
                    }
                } else {
                    // Flee
                    if (!this.enemy.isBoss) {
                        Audio.playSFX('confirm');
                        this.flee();
                    } else {
                        Audio.playSFX('cancel');
                        this.showText("* You can't flee from this battle!");
                        this.showingSubmenu = false;
                    }
                }
            }

            if (Input.isPressed('cancel')) {
                Audio.playSFX('cancel');
                this.showingSubmenu = false;
                this.setState(this.states.MENU);
            }
        } else {
            if (Input.isPressed('confirm')) {
                this.startEnemyTurn();
            }
        }
    },

    /**
     * Spare enemy
     */
    performSpare() {
        this.showingSubmenu = false;
        this.enemy.spare();
        this.setState(this.states.SPARE);
        this.showText(this.enemy.spareText);
        Save.recordSpare();
    },

    /**
     * Flee from battle
     */
    flee() {
        this.showingSubmenu = false;
        this.showText('* You fled.');
        // End battle without rewards
        setTimeout(() => this.end(), 500);
    },

    /**
     * Start enemy turn
     */
    startEnemyTurn() {
        this.setState(this.states.ENEMY_TURN);

        // Show flavor text
        this.showText(this.enemy.getFlavorText());

        // Get patterns for current phase
        const patterns = this.enemy.getPatterns();
        const pattern = Utils.randomChoice(patterns);

        // Start bullet pattern
        Bullets.startPattern(pattern);

        // Reset soul position
        Soul.centerInBounds();
    },

    /**
     * Update enemy turn
     */
    updateEnemyTurn(dt) {
        // Update soul
        Soul.update(dt);

        // Update bullets
        Bullets.update(dt, this.battleBox);

        // Check collision
        if (!Soul.invincible) {
            const hit = Bullets.checkCollision(Soul.getHitbox());
            if (hit) {
                this.playerHit();
            }
        }

        // Check if pattern is done
        if (!Bullets.isPatternRunning() && Bullets.bullets.length === 0) {
            // Small delay after pattern ends
            if (this.stateTimer > 1) {
                Bullets.clear();
                this.setState(this.states.MENU);
            }
        }
    },

    /**
     * Player hit by bullet
     */
    playerHit() {
        if (Soul.takeDamage()) {
            const save = Save.getCurrent();
            const damage = this.enemy.calculateDamage(save.defense);

            save.hp -= damage;

            Audio.playSFX('damage');
            Renderer.shake(6, 0.3);
            Renderer.flash('#f00', 0.1);

            if (save.hp <= 0) {
                save.hp = 0;
                this.setState(this.states.GAME_OVER);
                Save.setFlag('died_once', true);
            }
        }
    },

    /**
     * Update victory state
     */
    updateVictory(dt) {
        if (Input.isPressed('confirm') && this.stateTimer > 1) {
            // Give rewards
            const save = Save.getCurrent();
            save.exp += this.enemy.exp;
            save.gold += this.enemy.gold;

            // Process drops
            const drops = this.processDrops();
            let dropText = '';
            if (drops.length > 0) {
                dropText = '\n* You found: ' + drops.map(d => Items.get(d)?.name || d).join(', ');
            }

            this.showText(`* You earned ${this.enemy.exp} EXP and ${this.enemy.gold} gold.${dropText}`);

            // Check level up
            this.checkLevelUp();

            this.end();
        }
    },

    /**
     * Process enemy drops
     */
    processDrops() {
        const drops = [];
        const enemyData = Enemies.get(this.enemy.id);

        if (enemyData && enemyData.drops) {
            for (const drop of enemyData.drops) {
                if (Math.random() < drop.chance) {
                    if (Inventory.addItem(drop.item)) {
                        drops.push(drop.item);
                    }
                }
            }
        }

        return drops;
    },

    /**
     * Update spare state
     */
    updateSpare(dt) {
        if (Input.isPressed('confirm') && this.stateTimer > 1) {
            this.end();
        }
    },

    /**
     * Update game over state
     */
    updateGameOver(dt) {
        if (this.stateTimer > 2 && !this.gameOverTriggered) {
            this.gameOverTriggered = true;
            Game.gameOver();
        }
    },

    /**
     * Update dialogue state
     */
    updateDialogue(dt) {
        // Handle mid-battle dialogue
        if (Input.isPressed('confirm')) {
            this.setState(this.states.ENEMY_TURN);
        }
    },

    /**
     * Check for level up
     */
    checkLevelUp() {
        const save = Save.getCurrent();
        const expThresholds = [0, 10, 30, 70, 120, 200, 300, 450, 650, 900];

        while (save.level < expThresholds.length && save.exp >= expThresholds[save.level]) {
            save.level++;
            save.maxHp += 4;
            save.hp = save.maxHp;
            save.attack += 2;
            save.defense += 1;

            Audio.playSFX('heal');
            this.showText(`* LEVEL UP! LV ${save.level}`);
        }
    },

    /**
     * Show text
     */
    showText(text) {
        this.displayText = text;
    },

    /**
     * Set state
     */
    setState(state) {
        this.state = state;
        this.stateTimer = 0;
    },

    /**
     * End battle
     */
    end() {
        // Return to overworld
        Game.setState(Game.states.OVERWORLD);

        // Restore area music
        const save = Save.getCurrent();
        if (save && save.roomId) {
            Audio.playAreaMusic(save.roomId);
        }

        // Call callback
        if (this.onEnd) {
            this.onEnd(this.enemy.spared);
        }
    },

    /**
     * Render battle
     */
    render() {
        // Background
        Renderer.clear('#000');

        // Enemy
        if (this.enemy) {
            this.enemy.render();
        }

        // Battle box
        this.renderBattleBox();

        // State-specific rendering
        switch (this.state) {
            case this.states.MENU:
                this.renderMenu();
                break;
            case this.states.FIGHT:
                this.renderFight();
                break;
            case this.states.ACT:
            case this.states.ITEM:
            case this.states.MERCY:
                this.renderSubmenu();
                break;
            case this.states.ENEMY_TURN:
                this.renderEnemyTurn();
                break;
        }

        // Text display
        this.renderText();

        // HP display (below battle box, above menu)
        this.renderHP();
    },

    /**
     * Render battle box
     */
    renderBattleBox() {
        Renderer.drawBox(
            this.battleBox.x,
            this.battleBox.y,
            this.battleBox.width,
            this.battleBox.height,
            '#fff',
            '#000',
            3
        );
    },

    /**
     * Render menu
     */
    renderMenu() {
        const y = 215;
        const spacing = 72;
        const startX = 20;

        for (let i = 0; i < this.menuOptions.length; i++) {
            const x = startX + i * spacing;
            const isSelected = i === this.menuIndex;

            // Button background
            const color = isSelected ? '#ff8' : '#f80';
            Renderer.drawRect(x, y, 65, 20, color);
            Renderer.drawRect(x + 2, y + 2, 61, 16, '#000');

            // Button text
            Renderer.drawText(
                this.menuOptions[i],
                x + 32,
                y + 6,
                isSelected ? '#ff0' : '#f80',
                'center',
                7
            );
        }
    },

    /**
     * Render fight minigame
     */
    renderFight() {
        const bar = this.fightBar;

        // Bar background
        Renderer.drawRect(bar.x, bar.y, bar.width, bar.height, '#666');

        // Target zone (center = best damage)
        Renderer.drawRect(
            bar.targetX - bar.targetWidth / 2,
            bar.y,
            bar.targetWidth,
            bar.height,
            '#0f0'
        );

        // Cursor line
        if (bar.active) {
            Renderer.drawRect(bar.cursorX - 2, bar.y - 4, 4, bar.height + 8, '#fff');
        }

        // Instructions
        Renderer.drawText('Press Z to attack!', 160, bar.y + 20, '#fff', 'center');
    },

    /**
     * Render submenu
     */
    renderSubmenu() {
        if (!this.showingSubmenu) return;

        const startX = 40;
        const startY = 100;

        for (let i = 0; i < this.submenuOptions.length; i++) {
            const y = startY + i * 16;
            const isSelected = i === this.submenuIndex;

            // Highlight for spareable enemies in mercy menu
            let color = isSelected ? '#ff0' : '#fff';
            if (this.state === this.states.MERCY && i === 0) {
                color = this.enemy.canSpareNow() ? '#ff0' : (isSelected ? '#ff8' : '#888');
            }

            if (isSelected) {
                Renderer.drawText('>', startX, y, color);
            }

            Renderer.drawText(this.submenuOptions[i], startX + 16, y, color);
        }
    },

    /**
     * Render enemy turn
     */
    renderEnemyTurn() {
        // Render bullets
        Bullets.render();

        // Render soul
        Soul.render();
    },

    /**
     * Render HP
     */
    renderHP() {
        const save = Save.getCurrent();
        if (!save) return;

        const x = 32;
        const y = 195;

        // Player name and LV
        Renderer.drawText(`${save.name}  LV ${save.level}`, x, y, '#fff');

        // HP label
        Renderer.drawText('HP', x + 100, y, '#fff');

        // HP bar
        Renderer.drawRect(x + 120, y, 80, 12, '#600');
        Renderer.drawRect(x + 120, y, 80 * (save.hp / save.maxHp), 12, save.hp < save.maxHp * 0.25 ? '#f00' : '#ff0');

        // HP numbers
        Renderer.drawText(`${save.hp}/${save.maxHp}`, x + 205, y, '#fff');
    },

    /**
     * Word wrap text to fit within a given width
     */
    wrapText(text, maxWidth, fontSize) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        const charWidth = fontSize * 0.7; // Approximate character width

        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const testWidth = testLine.length * charWidth;

            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    },

    /**
     * Render text
     */
    renderText() {
        if (!this.displayText) return;

        const textX = 40;
        const textY = 95;
        const maxWidth = this.battleBox.width - 20; // Leave some padding
        const fontSize = 8;

        // Split by newlines first, then wrap each line
        const inputLines = this.displayText.split('\n');
        const wrappedLines = [];

        for (const line of inputLines) {
            const wrapped = this.wrapText(line, maxWidth, fontSize);
            wrappedLines.push(...wrapped);
        }

        for (let i = 0; i < wrappedLines.length; i++) {
            Renderer.drawText(wrappedLines[i], textX, textY + i * 14, '#fff');
        }
    }
};

// Make it globally available
window.Battle = Battle;
