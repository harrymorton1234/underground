/**
 * Dialogue system
 */
const Dialogue = {
    // State
    active: false,
    currentDialogue: null,
    currentLine: 0,
    currentChar: 0,

    // Display
    displayedText: '',
    fullText: '',
    textSpeed: 0.03, // seconds per character
    textTimer: 0,
    instantDisplay: false,

    // Text effects
    effects: {
        shake: false,
        wave: false,
        waveOffset: 0
    },

    // Callback when dialogue ends
    callback: null,

    // Choice system
    choices: null,
    choiceIndex: 0,

    // Box dimensions
    box: {
        x: 10,
        y: 170,
        width: 300,
        height: 60,
        padding: 10
    },

    // Portrait
    portrait: null,
    portraitX: 20,
    portraitY: 180,

    // Speaker name
    speaker: null,

    // Sound
    textSoundTimer: 0,
    textSoundInterval: 0.05,

    /**
     * Start dialogue
     */
    start(dialogueId, callback = null) {
        const dialogue = Dialogues.get(dialogueId);
        if (!dialogue) {
            console.warn(`Dialogue not found: ${dialogueId}`);
            if (callback) callback();
            return;
        }

        this.active = true;
        this.currentDialogue = dialogue;
        this.currentLine = 0;
        this.callback = callback;
        this.choices = null;

        // Set speaker and portrait
        this.speaker = dialogue.speaker || null;
        this.portrait = dialogue.portrait || null;

        // Start first line
        this.startLine();

        // Freeze player
        Player.freeze();
    },

    /**
     * Start current line
     */
    startLine() {
        const line = this.currentDialogue.lines[this.currentLine];
        if (!line) {
            this.end();
            return;
        }

        // Get text (could be string or object with text property)
        this.fullText = typeof line === 'string' ? line : line.text;
        this.displayedText = '';
        this.currentChar = 0;
        this.textTimer = 0;
        this.instantDisplay = false;

        // Check for text effects
        this.effects.shake = line.shake || false;
        this.effects.wave = line.wave || false;
        this.effects.waveOffset = 0;

        // Update portrait if line has one
        if (line.portrait) {
            this.portrait = line.portrait;
        }
    },

    /**
     * Update dialogue
     */
    update(dt) {
        if (!this.active) return;

        // Update wave effect
        this.effects.waveOffset += dt * 5;

        // If showing choices, handle choice input
        if (this.choices) {
            this.updateChoices(dt);
            return;
        }

        // Text typing
        if (this.currentChar < this.fullText.length) {
            if (this.instantDisplay) {
                // Show all text instantly
                this.displayedText = this.fullText;
                this.currentChar = this.fullText.length;
            } else {
                this.textTimer += dt;

                while (this.textTimer >= this.textSpeed && this.currentChar < this.fullText.length) {
                    this.textTimer -= this.textSpeed;
                    this.displayedText += this.fullText[this.currentChar];
                    this.currentChar++;

                    // Play text sound
                    this.textSoundTimer += dt;
                    if (this.textSoundTimer >= this.textSoundInterval) {
                        Audio.playSFX('text', 0.3);
                        this.textSoundTimer = 0;
                    }
                }
            }
        }

        // Input handling
        if (Input.isPressed('confirm')) {
            if (this.currentChar < this.fullText.length) {
                // Skip to end of current line
                this.instantDisplay = true;
            } else {
                // Advance to next line
                this.nextLine();
            }
        }

        if (Input.isPressed('cancel')) {
            // Fast text
            this.textSpeed = 0.01;
        } else {
            this.textSpeed = 0.03;
        }
    },

    /**
     * Go to next line
     */
    nextLine() {
        this.currentLine++;

        // Check if we've reached the end
        if (this.currentLine >= this.currentDialogue.lines.length) {
            // Check for choices
            if (this.currentDialogue.choices) {
                this.showChoices(this.currentDialogue.choices);
            } else {
                this.end();
            }
        } else {
            Audio.playSFX('confirm', 0.3);
            this.startLine();
        }
    },

    /**
     * Show choices
     */
    showChoices(choices) {
        this.choices = choices;
        this.choiceIndex = 0;
        this.displayedText = '';
        this.fullText = '';
    },

    /**
     * Update choice selection
     */
    updateChoices(dt) {
        if (Input.isPressed('up')) {
            this.choiceIndex--;
            if (this.choiceIndex < 0) this.choiceIndex = this.choices.length - 1;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('down')) {
            this.choiceIndex++;
            if (this.choiceIndex >= this.choices.length) this.choiceIndex = 0;
            Audio.playSFX('menu_move');
        }

        if (Input.isPressed('confirm')) {
            Audio.playSFX('confirm');
            this.selectChoice();
        }
    },

    /**
     * Select current choice
     */
    selectChoice() {
        const choice = this.choices[this.choiceIndex];

        // Set flags from choice
        if (choice.setFlags) {
            for (const [flag, value] of Object.entries(choice.setFlags)) {
                Save.setFlag(flag, value);
            }
        }

        // Go to next dialogue or end
        if (choice.next) {
            this.choices = null;
            this.start(choice.next, this.callback);
        } else {
            this.end();
        }
    },

    /**
     * End dialogue
     */
    end() {
        // Set flags from dialogue
        if (this.currentDialogue && this.currentDialogue.setFlags) {
            for (const [flag, value] of Object.entries(this.currentDialogue.setFlags)) {
                Save.setFlag(flag, value);
            }
        }

        // Give items
        if (this.currentDialogue && this.currentDialogue.giveItem) {
            Inventory.addItem(this.currentDialogue.giveItem);
        }

        // Give multiple items
        if (this.currentDialogue && this.currentDialogue.giveItems) {
            for (const itemId of this.currentDialogue.giveItems) {
                Inventory.addItem(itemId);
            }
        }

        // Give gold
        if (this.currentDialogue && this.currentDialogue.giveGold) {
            const save = Save.getCurrent();
            if (save) {
                save.gold += this.currentDialogue.giveGold;
            }
        }

        // Heal player if specified
        if (this.currentDialogue && this.currentDialogue.healPlayer) {
            const save = Save.getCurrent();
            if (save) {
                save.hp = save.maxHp;
                Save.save(save.slot);
                Audio.playSFX('heal');
            }
        }

        // Discover secrets for special dialogues
        if (this.currentDialogue && this.currentDialogue.setFlags) {
            if (this.currentDialogue.setFlags['fairy_ring_blessed']) {
                Secrets.discover('fairy_ring_blessed');
            }
            if (this.currentDialogue.setFlags['mystic_pool_vision_seen']) {
                Secrets.discover('mystic_pool_vision_seen');
            }
        }

        // Store callback and previous state before clearing
        const callback = this.callback;
        const previousState = Game.previousState;
        this.callback = null;

        this.active = false;
        this.currentDialogue = null;
        this.choices = null;

        // Unfreeze player ALWAYS
        Player.unfreeze();

        // Return to previous state FIRST
        if (previousState) {
            Game.setState(previousState);
        }

        // Then call callback (it may change state again, like opening shop)
        if (callback) {
            try {
                callback();
            } catch (e) {
                console.error('Callback error:', e);
            }
        }
    },

    /**
     * Render dialogue
     */
    render() {
        if (!this.active) return;

        // Draw dialogue box
        this.drawBox();

        // Draw speaker name
        if (this.speaker) {
            this.drawSpeaker();
        }

        // Draw text or choices
        if (this.choices) {
            this.drawChoices();
        } else {
            this.drawText();
        }

        // Draw continue indicator
        if (this.currentChar >= this.fullText.length && !this.choices) {
            this.drawContinueIndicator();
        }
    },

    /**
     * Draw dialogue box
     */
    drawBox() {
        Renderer.drawBox(
            this.box.x,
            this.box.y,
            this.box.width,
            this.box.height,
            '#fff',
            '#000',
            3
        );
    },

    /**
     * Draw speaker name
     */
    drawSpeaker() {
        const nameBoxWidth = Renderer.measureText(this.speaker) + 16;
        const nameBoxX = this.box.x + 10;
        const nameBoxY = this.box.y - 12;

        Renderer.drawBox(nameBoxX, nameBoxY, nameBoxWidth, 16, '#fff', '#000', 2);
        Renderer.drawText(this.speaker, nameBoxX + 8, nameBoxY + 4, '#fff');
    },

    /**
     * Draw dialogue text
     */
    drawText() {
        const textX = this.box.x + this.box.padding;
        const textY = this.box.y + this.box.padding;
        const maxWidth = this.box.width - this.box.padding * 2;

        // Word wrap and draw
        const lines = this.wrapText(this.displayedText, maxWidth);
        let y = textY;

        for (let i = 0; i < lines.length; i++) {
            let x = textX;

            // Apply effects per character if needed
            if (this.effects.shake || this.effects.wave) {
                for (let j = 0; j < lines[i].length; j++) {
                    let charX = x;
                    let charY = y;

                    if (this.effects.shake) {
                        charX += (Math.random() - 0.5) * 2;
                        charY += (Math.random() - 0.5) * 2;
                    }

                    if (this.effects.wave) {
                        charY += Math.sin(this.effects.waveOffset + j * 0.5) * 2;
                    }

                    Renderer.drawText(lines[i][j], charX, charY, '#fff');
                    x += 6; // Character width approximation
                }
            } else {
                Renderer.drawText(lines[i], x, y, '#fff');
            }

            y += 12;
        }
    },

    /**
     * Draw choices
     */
    drawChoices() {
        const startY = this.box.y + this.box.padding;

        for (let i = 0; i < this.choices.length; i++) {
            const y = startY + i * 16;
            const isSelected = i === this.choiceIndex;

            if (isSelected) {
                Renderer.drawText('>', this.box.x + this.box.padding, y, '#ff0');
            }

            Renderer.drawText(
                this.choices[i].text,
                this.box.x + this.box.padding + 12,
                y,
                isSelected ? '#ff0' : '#fff'
            );
        }
    },

    /**
     * Draw continue indicator
     */
    drawContinueIndicator() {
        const indicatorX = this.box.x + this.box.width - 20;
        const indicatorY = this.box.y + this.box.height - 15;
        const bounce = Math.sin(performance.now() / 200) * 2;

        Renderer.drawText('v', indicatorX, indicatorY + bounce, '#fff');
    },

    /**
     * Word wrap text
     */
    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = Renderer.measureText(testLine);

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
     * Check if dialogue is active
     */
    isActive() {
        return this.active;
    }
};

// Make it globally available
window.Dialogue = Dialogue;
