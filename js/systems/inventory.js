/**
 * Inventory system
 */
const Inventory = {
    // Max items player can carry
    maxItems: 8,

    // State for inventory menu
    menuOpen: false,
    selectedIndex: 0,
    actionIndex: 0,
    showingActions: false,

    /**
     * Get current inventory
     */
    getItems() {
        const save = Save.getCurrent();
        if (!save) return [];
        // Ensure items array exists
        if (!save.items) {
            save.items = [];
        }
        return save.items;
    },

    /**
     * Add item to inventory
     */
    addItem(itemId) {
        const save = Save.getCurrent();
        if (!save) return false;

        const maxItems = this.getMaxItems();
        if (save.items.length >= maxItems) {
            return false; // Inventory full
        }

        if (!Items.exists(itemId)) {
            console.warn(`Item not found: ${itemId}`);
            return false;
        }

        save.items.push(itemId);
        return true;
    },

    /**
     * Remove item from inventory
     */
    removeItem(index) {
        const save = Save.getCurrent();
        if (!save) return null;

        if (index < 0 || index >= save.items.length) {
            return null;
        }

        return save.items.splice(index, 1)[0];
    },

    /**
     * Get item at index
     */
    getItem(index) {
        const items = this.getItems();
        if (index < 0 || index >= items.length) {
            return null;
        }
        return Items.get(items[index]);
    },

    /**
     * Check if player has a specific item
     */
    hasItem(itemId) {
        const items = this.getItems();
        return items.includes(itemId);
    },

    /**
     * Remove specific item by ID
     */
    removeItemById(itemId) {
        const save = Save.getCurrent();
        if (!save) return false;

        const index = save.items.indexOf(itemId);
        if (index >= 0) {
            save.items.splice(index, 1);
            return true;
        }
        return false;
    },

    /**
     * Check if inventory is full
     */
    isFull() {
        return this.getItems().length >= this.getMaxItems();
    },

    /**
     * Check if inventory is empty
     */
    isEmpty() {
        return this.getItems().length === 0;
    },

    /**
     * Get number of items
     */
    count() {
        return this.getItems().length;
    },

    /**
     * Use item (consumable)
     */
    useItem(index) {
        const save = Save.getCurrent();
        if (!save) return null;

        const itemId = save.items[index];
        const item = Items.get(itemId);

        if (!item) return null;

        if (item.type === 'consumable') {
            // Heal player
            const healAmount = item.healAmount || 0;
            save.hp = Math.min(save.maxHp, save.hp + healAmount);

            // Remove item
            this.removeItem(index);

            // Set flag
            Save.setFlag('used_item', true);

            return {
                success: true,
                healAmount,
                text: item.battleText || `* You used ${item.name}.\n* Healed ${healAmount} HP!`
            };
        }

        return { success: false, text: "* You can't use that here." };
    },

    /**
     * Equip item
     */
    equipItem(index) {
        const save = Save.getCurrent();
        if (!save) return null;

        const itemId = save.items[index];
        const item = Items.get(itemId);

        if (!item) return null;

        let result = { success: false, text: '' };

        if (item.type === 'weapon') {
            // Unequip current weapon
            const oldWeapon = save.weapon;
            if (oldWeapon) {
                save.items.push(oldWeapon);
            }

            // Equip new weapon
            save.weapon = itemId;
            this.removeItem(index);

            result = {
                success: true,
                text: item.equipText || `* You equipped ${item.name}.`
            };
        } else if (item.type === 'armor') {
            // Unequip current armor
            const oldArmor = save.armor;
            if (oldArmor) {
                save.items.push(oldArmor);
            }

            // Equip new armor
            save.armor = itemId;
            this.removeItem(index);

            result = {
                success: true,
                text: item.equipText || `* You equipped ${item.name}.`
            };
        } else if (item.type === 'backpack') {
            // Unequip current backpack
            const oldBackpack = save.backpack;
            if (oldBackpack) {
                save.items.push(oldBackpack);
            }

            // Equip new backpack
            save.backpack = itemId;
            this.removeItem(index);

            // Update max items
            this.updateMaxItems();

            result = {
                success: true,
                text: item.equipText || `* You equipped ${item.name}.`
            };
        }

        // Update stats
        this.updateStats();

        return result;
    },

    /**
     * Update max inventory size based on backpack
     */
    updateMaxItems() {
        const save = Save.getCurrent();
        if (!save) return;

        // Base inventory size
        let maxItems = 8;

        // Add backpack bonus
        if (save.backpack) {
            const backpack = Items.get(save.backpack);
            if (backpack && backpack.inventoryBonus) {
                maxItems += backpack.inventoryBonus;
            }
        }

        save.maxItems = maxItems;
        this.maxItems = maxItems;
    },

    /**
     * Get current max items (considering backpack)
     */
    getMaxItems() {
        const save = Save.getCurrent();
        if (!save) return 8;

        // Ensure maxItems is set
        if (!save.maxItems) {
            this.updateMaxItems();
        }

        return save.maxItems || 8;
    },

    /**
     * Update player stats based on equipment
     */
    updateStats() {
        const save = Save.getCurrent();
        if (!save) return;

        // Base stats (could be level-based)
        let attack = 10;
        let defense = 10;
        let baseMaxHp = 20 + (save.level - 1) * 4; // Base HP scales with level

        // Add weapon bonus
        if (save.weapon) {
            attack += Items.getAttack(save.weapon);
        }

        // Add armor bonus
        if (save.armor) {
            defense += Items.getDefense(save.armor);
            baseMaxHp += Items.getHpBonus(save.armor);
        }

        save.attack = attack;
        save.defense = defense;

        // Update max HP (keep current HP ratio)
        const oldMaxHp = save.maxHp || 20;
        const hpRatio = save.hp / oldMaxHp;
        save.maxHp = baseMaxHp;

        // If HP was at max, keep it at max
        if (save.hp >= oldMaxHp) {
            save.hp = save.maxHp;
        } else {
            // Otherwise maintain the ratio
            save.hp = Math.ceil(hpRatio * save.maxHp);
        }
    },

    /**
     * Get equipped weapon
     */
    getWeapon() {
        const save = Save.getCurrent();
        if (!save || !save.weapon) return null;
        return Items.get(save.weapon);
    },

    /**
     * Get equipped armor
     */
    getArmor() {
        const save = Save.getCurrent();
        if (!save || !save.armor) return null;
        return Items.get(save.armor);
    },

    /**
     * Open inventory menu
     */
    openMenu() {
        this.menuOpen = true;
        this.selectedIndex = 0;
        this.actionIndex = 0;
        this.showingActions = false;
    },

    /**
     * Close inventory menu
     */
    closeMenu() {
        this.menuOpen = false;
        this.showingActions = false;
    },

    /**
     * Update inventory menu
     */
    update(dt) {
        if (!this.menuOpen) return;

        const items = this.getItems();

        if (this.showingActions) {
            // Action selection
            if (Input.isPressed('up')) {
                this.actionIndex = Math.max(0, this.actionIndex - 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('down')) {
                this.actionIndex = Math.min(2, this.actionIndex + 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('confirm')) {
                this.executeAction();
            }

            if (Input.isPressed('cancel')) {
                this.showingActions = false;
                Audio.playSFX('cancel');
            }
        } else {
            // Item selection
            if (Input.isPressed('up')) {
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('down')) {
                this.selectedIndex = Math.min(items.length - 1, this.selectedIndex + 1);
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('confirm')) {
                if (items.length > 0) {
                    this.showingActions = true;
                    this.actionIndex = 0;
                    Audio.playSFX('confirm');
                }
            }

            if (Input.isPressed('cancel')) {
                this.closeMenu();
                Audio.playSFX('cancel');
                Game.setState(Game.states.MENU);
            }
        }
    },

    /**
     * Execute selected action
     */
    executeAction() {
        const item = this.getItem(this.selectedIndex);
        if (!item) return;

        switch (this.actionIndex) {
            case 0: // Use
                if (item.type === 'consumable') {
                    const result = this.useItem(this.selectedIndex);
                    Audio.playSFX('heal');
                    // Could show result message
                } else {
                    Audio.playSFX('cancel');
                }
                break;

            case 1: // Info
                // Could show item info
                Audio.playSFX('confirm');
                break;

            case 2: // Drop
                this.removeItem(this.selectedIndex);
                Audio.playSFX('cancel');
                break;
        }

        this.showingActions = false;

        // Adjust selection if we removed an item
        const items = this.getItems();
        if (this.selectedIndex >= items.length) {
            this.selectedIndex = Math.max(0, items.length - 1);
        }
    },

    /**
     * Render inventory menu
     */
    render() {
        if (!this.menuOpen) return;

        const items = this.getItems();

        // Background box
        Renderer.drawBox(40, 40, 240, 160);

        // Title
        Renderer.drawText('INVENTORY', 160, 50, '#fff', 'center');

        // Items list
        const startY = 70;

        if (items.length === 0) {
            Renderer.drawText('(empty)', 160, startY + 20, '#888', 'center');
        } else {
            for (let i = 0; i < items.length; i++) {
                const y = startY + i * 14;
                const item = Items.get(items[i]);
                const isSelected = i === this.selectedIndex;

                if (isSelected) {
                    Renderer.drawText('>', 55, y, '#ff0');
                }

                const color = isSelected ? '#ff0' : '#fff';
                Renderer.drawText(item ? item.name : '???', 70, y, color);
            }
        }

        // Show actions if selecting
        if (this.showingActions && items.length > 0) {
            const item = this.getItem(this.selectedIndex);
            const actions = ['USE', 'INFO', 'DROP'];

            Renderer.drawBox(180, 80, 80, 60);

            for (let i = 0; i < actions.length; i++) {
                const y = 90 + i * 16;
                const isSelected = i === this.actionIndex;

                if (isSelected) {
                    Renderer.drawText('>', 190, y, '#ff0');
                }

                let color = '#fff';
                // Dim USE for non-consumables
                if (i === 0 && item && item.type !== 'consumable') {
                    color = '#555';
                }
                if (isSelected) color = '#ff0';

                Renderer.drawText(actions[i], 205, y, color);
            }
        }

        // Item description
        if (items.length > 0) {
            const item = this.getItem(this.selectedIndex);
            if (item) {
                Renderer.drawText(item.description || '', 160, 180, '#888', 'center', 6);
            }
        }
    },

    // ==================== SHOP SYSTEM ====================

    // Shop state
    shopOpen: false,
    shopItems: [],
    shopIndex: 0,
    shopMode: 'buy', // 'buy' or 'sell'
    shopModeIndex: 0,
    shopMessage: '',
    shopMessageTimer: 0,

    /**
     * Open shop
     */
    openShop(shopItems) {
        this.shopOpen = true;
        this.shopItems = shopItems || [];
        this.shopIndex = 0;
        this.shopMode = 'buy';
        this.shopModeIndex = 0;
        this.shopMessage = '';
        this.shopMessageTimer = 0;
    },

    /**
     * Close shop
     */
    closeShop() {
        this.shopOpen = false;
        this.shopItems = [];
    },

    /**
     * Buy item
     */
    buyItem(itemId) {
        const save = Save.getCurrent();
        if (!save) return { success: false, text: '* Error!' };

        const item = Items.get(itemId);
        if (!item) return { success: false, text: '* Item not found!' };

        if (this.isFull()) {
            return { success: false, text: "* Your inventory is full!" };
        }

        if (save.gold < item.price) {
            return { success: false, text: "* You don't have enough gold!" };
        }

        save.gold -= item.price;
        this.addItem(itemId);

        return { success: true, text: `* You bought ${item.name}!` };
    },

    /**
     * Sell item
     */
    sellItem(index) {
        const save = Save.getCurrent();
        if (!save) return { success: false, text: '* Error!' };

        const itemId = save.items[index];
        const item = Items.get(itemId);
        if (!item) return { success: false, text: '* Item not found!' };

        // Can't sell key items
        if (item.type === 'key') {
            return { success: false, text: "* You can't sell that!" };
        }

        const sellPrice = item.sellPrice || Math.floor(item.price / 2) || 1;
        save.gold += sellPrice;
        this.removeItem(index);

        return { success: true, text: `* You sold ${item.name} for ${sellPrice}G!` };
    },

    /**
     * Update shop
     */
    updateShop(dt) {
        if (!this.shopOpen) return false;

        const save = Save.getCurrent();

        // Mode selection (buy/sell/exit)
        if (Input.isPressed('left') || Input.isPressed('right')) {
            this.shopModeIndex = (this.shopModeIndex + 1) % 3;
            this.shopMode = ['buy', 'sell', 'exit'][this.shopModeIndex];
            this.shopIndex = 0;
            Audio.playSFX('menu_move');
        }

        if (this.shopMode === 'exit') {
            if (Input.isPressed('confirm')) {
                this.closeShop();
                Audio.playSFX('cancel');
                return false; // Shop closed, exit state
            }
        } else if (this.shopMode === 'buy') {
            // Navigate shop items
            if (Input.isPressed('up')) {
                this.shopIndex = Math.max(0, this.shopIndex - 1);
                Audio.playSFX('menu_move');
            }
            if (Input.isPressed('down')) {
                this.shopIndex = Math.min(this.shopItems.length - 1, this.shopIndex + 1);
                Audio.playSFX('menu_move');
            }
            if (Input.isPressed('confirm') && this.shopItems.length > 0) {
                const result = this.buyItem(this.shopItems[this.shopIndex]);
                if (result.success) {
                    Audio.playSFX('confirm');
                } else {
                    Audio.playSFX('cancel');
                }
                this.shopMessage = result.text;
                this.shopMessageTimer = 2;
            }
        } else if (this.shopMode === 'sell') {
            const items = this.getItems();
            // Navigate inventory
            if (Input.isPressed('up')) {
                this.shopIndex = Math.max(0, this.shopIndex - 1);
                Audio.playSFX('menu_move');
            }
            if (Input.isPressed('down')) {
                this.shopIndex = Math.min(items.length - 1, this.shopIndex + 1);
                Audio.playSFX('menu_move');
            }
            if (Input.isPressed('confirm') && items.length > 0) {
                const result = this.sellItem(this.shopIndex);
                if (result.success) {
                    Audio.playSFX('confirm');
                    // Adjust index if needed
                    if (this.shopIndex >= this.getItems().length) {
                        this.shopIndex = Math.max(0, this.getItems().length - 1);
                    }
                } else {
                    Audio.playSFX('cancel');
                }
                this.shopMessage = result.text;
                this.shopMessageTimer = 2;
            }
        }

        if (Input.isPressed('cancel')) {
            this.closeShop();
            Audio.playSFX('cancel');
            return false; // Shop closed, exit state
        }

        // Update message timer
        if (this.shopMessageTimer > 0) {
            this.shopMessageTimer -= dt;
        }

        return true;
    },

    /**
     * Render shop
     */
    renderShop() {
        if (!this.shopOpen) return;

        const save = Save.getCurrent();

        // Main shop box
        Renderer.drawBox(20, 20, 280, 200);

        // Title and gold
        Renderer.drawText('SHOP', 160, 30, '#ff0', 'center');
        Renderer.drawText(`Gold: ${save ? save.gold : 0}G`, 260, 30, '#ff0', 'right');

        // Mode tabs
        const modes = ['BUY', 'SELL', 'EXIT'];
        for (let i = 0; i < modes.length; i++) {
            const x = 60 + i * 80;
            const isSelected = i === this.shopModeIndex;
            Renderer.drawRect(x - 25, 45, 60, 16, isSelected ? '#ff8' : '#444');
            Renderer.drawText(modes[i], x, 48, isSelected ? '#000' : '#fff', 'center', 7);
        }

        // Content based on mode
        const startY = 70;

        if (this.shopMode === 'buy') {
            if (this.shopItems.length === 0) {
                Renderer.drawText('(nothing for sale)', 160, startY + 20, '#888', 'center');
            } else {
                for (let i = 0; i < this.shopItems.length; i++) {
                    const y = startY + i * 16;
                    const item = Items.get(this.shopItems[i]);
                    const isSelected = i === this.shopIndex;

                    if (isSelected) {
                        Renderer.drawText('>', 35, y, '#ff0');
                    }

                    const canAfford = save && save.gold >= (item?.price || 0);
                    const color = isSelected ? '#ff0' : (canAfford ? '#fff' : '#888');

                    Renderer.drawText(item ? item.name : '???', 50, y, color);
                    Renderer.drawText(`${item?.price || 0}G`, 250, y, color, 'right');
                }

                // Description
                const selectedItem = Items.get(this.shopItems[this.shopIndex]);
                if (selectedItem) {
                    Renderer.drawText(selectedItem.description || '', 160, 190, '#888', 'center', 6);
                }
            }
        } else if (this.shopMode === 'sell') {
            const items = this.getItems();
            if (items.length === 0) {
                Renderer.drawText('(nothing to sell)', 160, startY + 20, '#888', 'center');
            } else {
                for (let i = 0; i < items.length; i++) {
                    const y = startY + i * 16;
                    const item = Items.get(items[i]);
                    const isSelected = i === this.shopIndex;

                    if (isSelected) {
                        Renderer.drawText('>', 35, y, '#ff0');
                    }

                    const canSell = item?.type !== 'key';
                    const sellPrice = item?.sellPrice || Math.floor((item?.price || 0) / 2) || 1;
                    const color = isSelected ? '#ff0' : (canSell ? '#fff' : '#888');

                    Renderer.drawText(item ? item.name : '???', 50, y, color);
                    Renderer.drawText(canSell ? `${sellPrice}G` : '-', 250, y, color, 'right');
                }

                // Description
                const selectedItem = Items.get(items[this.shopIndex]);
                if (selectedItem) {
                    Renderer.drawText(selectedItem.description || '', 160, 190, '#888', 'center', 6);
                }
            }
        } else if (this.shopMode === 'exit') {
            Renderer.drawText('Press Z to leave shop', 160, startY + 40, '#fff', 'center');
        }

        // Message
        if (this.shopMessageTimer > 0 && this.shopMessage) {
            Renderer.drawBox(60, 150, 200, 30);
            Renderer.drawText(this.shopMessage, 160, 160, '#fff', 'center', 7);
        }
    }
};

// Make it globally available
window.Inventory = Inventory;
