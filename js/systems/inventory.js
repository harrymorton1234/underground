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
     * Get the priority value of an item (higher = more important, harder to discard)
     * Key items: 10000+
     * Boss drops (equipment from bosses): 5000+
     * Weapons/Armor: 1000 + price
     * Consumables/Materials: price
     */
    getItemPriority(itemId) {
        const item = Items.get(itemId);
        if (!item) return 0;

        // Key items are never discarded
        if (item.type === 'key') {
            return 10000;
        }

        // Equipment has higher base priority
        if (item.type === 'weapon' || item.type === 'armor' || item.type === 'backpack') {
            return 1000 + (item.price || 0);
        }

        // Consumables and materials by price
        return item.price || item.sellPrice || 1;
    },

    /**
     * Add item with priority - will remove lowest value item if needed for important drops
     * @param {string} itemId - The item to add
     * @param {boolean} isBossDrop - If true, this is a boss drop and should always be added
     * @returns {object} { success: boolean, removedItem: string|null }
     */
    addItemWithPriority(itemId, isBossDrop = false) {
        const save = Save.getCurrent();
        if (!save) return { success: false, removedItem: null };

        if (!Items.exists(itemId)) {
            console.warn(`Item not found: ${itemId}`);
            return { success: false, removedItem: null };
        }

        const maxItems = this.getMaxItems();

        // If there's room, just add it
        if (save.items.length < maxItems) {
            save.items.push(itemId);
            return { success: true, removedItem: null };
        }

        // Inventory is full - check if we should make room
        const newItemPriority = this.getItemPriority(itemId);
        const newItem = Items.get(itemId);

        // For boss drops or key items, always try to make room
        const shouldForceAdd = isBossDrop || newItem.type === 'key';

        if (!shouldForceAdd) {
            // Regular item, don't replace anything
            return { success: false, removedItem: null };
        }

        // Find the lowest priority item that can be removed (not key items)
        let lowestPriorityIndex = -1;
        let lowestPriority = Infinity;

        for (let i = 0; i < save.items.length; i++) {
            const existingItem = Items.get(save.items[i]);
            // Never remove key items
            if (existingItem && existingItem.type === 'key') {
                continue;
            }

            const priority = this.getItemPriority(save.items[i]);
            if (priority < lowestPriority) {
                lowestPriority = priority;
                lowestPriorityIndex = i;
            }
        }

        // If we found an item to remove (and it has lower priority than our new item)
        if (lowestPriorityIndex >= 0 && (shouldForceAdd || lowestPriority < newItemPriority)) {
            const removedItemId = save.items[lowestPriorityIndex];
            save.items.splice(lowestPriorityIndex, 1);
            save.items.push(itemId);
            return { success: true, removedItem: removedItemId };
        }

        // Couldn't make room (all items are key items or higher priority)
        return { success: false, removedItem: null };
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
     * Unequip item (weapon, armor, or backpack)
     */
    unequipItem(slot) {
        const save = Save.getCurrent();
        if (!save) return { success: false, text: '* Error!' };

        let itemId = null;
        let result = { success: false, text: '' };

        if (slot === 'weapon' && save.weapon) {
            itemId = save.weapon;
            const item = Items.get(itemId);

            // Check if inventory has space
            if (save.items.length >= this.maxItems) {
                return { success: false, text: '* Inventory is full!' };
            }

            save.items.push(itemId);
            save.weapon = null;

            result = {
                success: true,
                text: `* You unequipped ${item.name}.`
            };
        } else if (slot === 'armor' && save.armor) {
            itemId = save.armor;
            const item = Items.get(itemId);

            // Check if inventory has space
            if (save.items.length >= this.maxItems) {
                return { success: false, text: '* Inventory is full!' };
            }

            save.items.push(itemId);
            save.armor = null;

            result = {
                success: true,
                text: `* You unequipped ${item.name}.`
            };
        } else if (slot === 'backpack' && save.backpack) {
            itemId = save.backpack;
            const item = Items.get(itemId);

            // Check if removing backpack would cause items to exceed new limit
            const newMaxItems = 8; // Base inventory size without backpack
            if (save.items.length >= newMaxItems) {
                return { success: false, text: '* Too many items to remove backpack!' };
            }

            save.items.push(itemId);
            save.backpack = null;
            this.updateMaxItems();

            result = {
                success: true,
                text: `* You unequipped ${item.name}.`
            };
        } else {
            return { success: false, text: '* Nothing to unequip!' };
        }

        // Update stats
        this.updateStats();

        return result;
    },

    /**
     * Get equipped item for a slot
     */
    getEquipped(slot) {
        const save = Save.getCurrent();
        if (!save) return null;

        switch (slot) {
            case 'weapon': return save.weapon;
            case 'armor': return save.armor;
            case 'backpack': return save.backpack;
            default: return null;
        }
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
    },

    // ==================== BANK SYSTEM ====================

    // Bank state
    bankOpen: false,
    bankMode: 'deposit', // 'deposit', 'withdraw', 'exit'
    bankModeIndex: 0,
    bankAmount: 0,
    bankMessage: '',
    bankMessageTimer: 0,

    /**
     * Get bank balance
     */
    getBankBalance() {
        return Save.getFlag('bank_balance') || 0;
    },

    /**
     * Set bank balance
     */
    setBankBalance(amount) {
        Save.setFlag('bank_balance', Math.max(0, amount));
    },

    /**
     * Open bank
     */
    openBank() {
        this.bankOpen = true;
        this.bankMode = 'deposit';
        this.bankModeIndex = 0;
        this.bankAmount = 0;
        this.bankMessage = '';
        this.bankMessageTimer = 0;
    },

    /**
     * Close bank
     */
    closeBank() {
        this.bankOpen = false;
        this.bankAmount = 0;
    },

    /**
     * Deposit gold
     */
    depositGold(amount) {
        const save = Save.getCurrent();
        if (!save) return { success: false, text: '* Error!' };

        if (amount <= 0) {
            return { success: false, text: '* Enter an amount!' };
        }

        if (save.gold < amount) {
            return { success: false, text: "* You don't have that much gold!" };
        }

        save.gold -= amount;
        this.setBankBalance(this.getBankBalance() + amount);

        return { success: true, text: `* Deposited ${amount}G!` };
    },

    /**
     * Withdraw gold
     */
    withdrawGold(amount) {
        const save = Save.getCurrent();
        if (!save) return { success: false, text: '* Error!' };

        if (amount <= 0) {
            return { success: false, text: '* Enter an amount!' };
        }

        const balance = this.getBankBalance();
        if (balance < amount) {
            return { success: false, text: "* Insufficient funds in account!" };
        }

        this.setBankBalance(balance - amount);
        save.gold += amount;

        return { success: true, text: `* Withdrew ${amount}G!` };
    },

    /**
     * Update bank
     */
    updateBank(dt) {
        if (!this.bankOpen) return false;

        const save = Save.getCurrent();
        const balance = this.getBankBalance();

        // Mode selection (deposit/withdraw/exit)
        if (Input.isPressed('left')) {
            this.bankModeIndex = (this.bankModeIndex - 1 + 3) % 3;
            this.bankMode = ['deposit', 'withdraw', 'exit'][this.bankModeIndex];
            this.bankAmount = 0;
            Audio.playSFX('menu_move');
        }
        if (Input.isPressed('right')) {
            this.bankModeIndex = (this.bankModeIndex + 1) % 3;
            this.bankMode = ['deposit', 'withdraw', 'exit'][this.bankModeIndex];
            this.bankAmount = 0;
            Audio.playSFX('menu_move');
        }

        if (this.bankMode === 'exit') {
            if (Input.isPressed('confirm')) {
                this.closeBank();
                Audio.playSFX('cancel');
                return false;
            }
        } else {
            // Adjust amount with up/down
            if (Input.isPressed('up')) {
                const max = this.bankMode === 'deposit' ? (save ? save.gold : 0) : balance;
                this.bankAmount = Math.min(max, this.bankAmount + 10);
                Audio.playSFX('menu_move');
            }
            if (Input.isPressed('down')) {
                this.bankAmount = Math.max(0, this.bankAmount - 10);
                Audio.playSFX('menu_move');
            }

            // Quick amounts with confirm
            if (Input.isPressed('confirm')) {
                let result;
                if (this.bankMode === 'deposit') {
                    result = this.depositGold(this.bankAmount);
                } else {
                    result = this.withdrawGold(this.bankAmount);
                }

                if (result.success) {
                    Audio.playSFX('confirm');
                    this.bankAmount = 0;
                } else {
                    Audio.playSFX('cancel');
                }
                this.bankMessage = result.text;
                this.bankMessageTimer = 2;
            }
        }

        if (Input.isPressed('cancel')) {
            this.closeBank();
            Audio.playSFX('cancel');
            return false;
        }

        // Update message timer
        if (this.bankMessageTimer > 0) {
            this.bankMessageTimer -= dt;
        }

        return true;
    },

    /**
     * Render bank
     */
    renderBank() {
        if (!this.bankOpen) return;

        const save = Save.getCurrent();
        const balance = this.getBankBalance();

        // Main bank box
        Renderer.drawBox(20, 20, 280, 200);

        // Title
        Renderer.drawText('HAVEN VAULT & TRUST', 160, 30, '#fc0', 'center');

        // Account info
        Renderer.drawText(`Your Gold: ${save ? save.gold : 0}G`, 50, 50, '#fff');
        Renderer.drawText(`Bank Balance: ${balance}G`, 50, 65, '#fc0');

        // Mode tabs
        const modes = ['DEPOSIT', 'WITHDRAW', 'EXIT'];
        for (let i = 0; i < modes.length; i++) {
            const x = 60 + i * 80;
            const isSelected = i === this.bankModeIndex;
            Renderer.drawRect(x - 30, 85, 70, 16, isSelected ? '#fc0' : '#444');
            Renderer.drawText(modes[i], x, 88, isSelected ? '#000' : '#fff', 'center', 7);
        }

        // Content based on mode
        const startY = 115;

        if (this.bankMode === 'deposit') {
            Renderer.drawText('Amount to deposit:', 160, startY, '#fff', 'center');
            Renderer.drawText(`${this.bankAmount}G`, 160, startY + 20, '#fc0', 'center');
            Renderer.drawText('UP/DOWN to adjust (+/- 10)', 160, startY + 45, '#888', 'center', 6);
            Renderer.drawText('Z to confirm deposit', 160, startY + 60, '#888', 'center', 6);
        } else if (this.bankMode === 'withdraw') {
            Renderer.drawText('Amount to withdraw:', 160, startY, '#fff', 'center');
            Renderer.drawText(`${this.bankAmount}G`, 160, startY + 20, '#fc0', 'center');
            Renderer.drawText('UP/DOWN to adjust (+/- 10)', 160, startY + 45, '#888', 'center', 6);
            Renderer.drawText('Z to confirm withdrawal', 160, startY + 60, '#888', 'center', 6);
        } else if (this.bankMode === 'exit') {
            Renderer.drawText('Press Z to leave bank', 160, startY + 30, '#fff', 'center');
        }

        // Message
        if (this.bankMessageTimer > 0 && this.bankMessage) {
            Renderer.drawBox(60, 180, 200, 25);
            Renderer.drawText(this.bankMessage, 160, 188, '#fff', 'center', 7);
        }
    },

    // ==================== STORAGE SYSTEM ====================

    // Storage state
    storageOpen: false,
    storageMode: 'view', // 'view', 'store', 'take', 'exit'
    storageModeIndex: 0,
    storageIndex: 0,
    storageMessage: '',
    storageMessageTimer: 0,
    storageScrollOffset: 0,

    /**
     * Get stored items (sorted by value, highest first)
     */
    getStoredItems() {
        const stored = Save.getFlag('stored_items') || [];
        // Sort by value (price) from highest to lowest
        return stored.slice().sort((a, b) => {
            const itemA = Items.get(a);
            const itemB = Items.get(b);
            const priceA = itemA ? (itemA.price || itemA.sellPrice || 0) : 0;
            const priceB = itemB ? (itemB.price || itemB.sellPrice || 0) : 0;
            return priceB - priceA;
        });
    },

    /**
     * Get raw stored items (unsorted, for modification)
     */
    getRawStoredItems() {
        return Save.getFlag('stored_items') || [];
    },

    /**
     * Set stored items
     */
    setStoredItems(items) {
        Save.setFlag('stored_items', items);
    },

    /**
     * Store item in chest
     */
    storeItem(inventoryIndex) {
        const save = Save.getCurrent();
        if (!save) return { success: false, text: '* Error!' };

        const items = this.getItems();
        if (inventoryIndex < 0 || inventoryIndex >= items.length) {
            return { success: false, text: '* No item selected!' };
        }

        const itemId = items[inventoryIndex];
        const item = Items.get(itemId);

        if (!item) {
            return { success: false, text: '* Invalid item!' };
        }

        // Can't store key items
        if (item.type === 'key') {
            return { success: false, text: "* You can't store that!" };
        }

        // Remove from inventory and add to storage
        this.removeItem(inventoryIndex);
        const stored = this.getRawStoredItems();
        stored.push(itemId);
        this.setStoredItems(stored);

        return { success: true, text: `* Stored ${item.name}!` };
    },

    /**
     * Take item from chest
     */
    takeItem(storageIndex) {
        const save = Save.getCurrent();
        if (!save) return { success: false, text: '* Error!' };

        const stored = this.getStoredItems();
        if (storageIndex < 0 || storageIndex >= stored.length) {
            return { success: false, text: '* No item selected!' };
        }

        if (this.isFull()) {
            return { success: false, text: '* Inventory is full!' };
        }

        const itemId = stored[storageIndex];
        const item = Items.get(itemId);

        // Remove from storage
        const rawStored = this.getRawStoredItems();
        const rawIndex = rawStored.indexOf(itemId);
        if (rawIndex >= 0) {
            rawStored.splice(rawIndex, 1);
            this.setStoredItems(rawStored);
        }

        // Add to inventory
        this.addItem(itemId);

        return { success: true, text: `* Took ${item ? item.name : itemId}!` };
    },

    /**
     * Open storage
     */
    openStorage() {
        this.storageOpen = true;
        this.storageMode = 'view';
        this.storageModeIndex = 0;
        this.storageIndex = 0;
        this.storageMessage = '';
        this.storageMessageTimer = 0;
        this.storageScrollOffset = 0;
    },

    /**
     * Close storage
     */
    closeStorage() {
        this.storageOpen = false;
    },

    /**
     * Update storage
     */
    updateStorage(dt) {
        if (!this.storageOpen) return false;

        const stored = this.getStoredItems();
        const items = this.getItems();

        // Mode selection
        if (Input.isPressed('left')) {
            this.storageModeIndex = (this.storageModeIndex - 1 + 4) % 4;
            this.storageMode = ['view', 'store', 'take', 'exit'][this.storageModeIndex];
            this.storageIndex = 0;
            this.storageScrollOffset = 0;
            Audio.playSFX('menu_move');
        }
        if (Input.isPressed('right')) {
            this.storageModeIndex = (this.storageModeIndex + 1) % 4;
            this.storageMode = ['view', 'store', 'take', 'exit'][this.storageModeIndex];
            this.storageIndex = 0;
            this.storageScrollOffset = 0;
            Audio.playSFX('menu_move');
        }

        if (this.storageMode === 'exit') {
            if (Input.isPressed('confirm')) {
                this.closeStorage();
                Audio.playSFX('cancel');
                return false;
            }
        } else if (this.storageMode === 'view' || this.storageMode === 'take') {
            // Navigate stored items
            const maxVisible = 6;
            if (Input.isPressed('up')) {
                this.storageIndex = Math.max(0, this.storageIndex - 1);
                if (this.storageIndex < this.storageScrollOffset) {
                    this.storageScrollOffset = this.storageIndex;
                }
                Audio.playSFX('menu_move');
            }
            if (Input.isPressed('down')) {
                this.storageIndex = Math.min(stored.length - 1, this.storageIndex + 1);
                if (this.storageIndex >= this.storageScrollOffset + maxVisible) {
                    this.storageScrollOffset = this.storageIndex - maxVisible + 1;
                }
                Audio.playSFX('menu_move');
            }

            if (this.storageMode === 'take' && Input.isPressed('confirm') && stored.length > 0) {
                const result = this.takeItem(this.storageIndex);
                if (result.success) {
                    Audio.playSFX('confirm');
                    // Adjust index if needed
                    const newStored = this.getStoredItems();
                    if (this.storageIndex >= newStored.length) {
                        this.storageIndex = Math.max(0, newStored.length - 1);
                    }
                } else {
                    Audio.playSFX('cancel');
                }
                this.storageMessage = result.text;
                this.storageMessageTimer = 2;
            }
        } else if (this.storageMode === 'store') {
            // Navigate inventory items
            const maxVisible = 6;
            if (Input.isPressed('up')) {
                this.storageIndex = Math.max(0, this.storageIndex - 1);
                if (this.storageIndex < this.storageScrollOffset) {
                    this.storageScrollOffset = this.storageIndex;
                }
                Audio.playSFX('menu_move');
            }
            if (Input.isPressed('down')) {
                this.storageIndex = Math.min(items.length - 1, this.storageIndex + 1);
                if (this.storageIndex >= this.storageScrollOffset + maxVisible) {
                    this.storageScrollOffset = this.storageIndex - maxVisible + 1;
                }
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('confirm') && items.length > 0) {
                const result = this.storeItem(this.storageIndex);
                if (result.success) {
                    Audio.playSFX('confirm');
                    // Adjust index if needed
                    const newItems = this.getItems();
                    if (this.storageIndex >= newItems.length) {
                        this.storageIndex = Math.max(0, newItems.length - 1);
                    }
                } else {
                    Audio.playSFX('cancel');
                }
                this.storageMessage = result.text;
                this.storageMessageTimer = 2;
            }
        }

        if (Input.isPressed('cancel')) {
            this.closeStorage();
            Audio.playSFX('cancel');
            return false;
        }

        // Update message timer
        if (this.storageMessageTimer > 0) {
            this.storageMessageTimer -= dt;
        }

        return true;
    },

    /**
     * Render storage
     */
    renderStorage() {
        if (!this.storageOpen) return;

        const save = Save.getCurrent();
        const stored = this.getStoredItems();
        const items = this.getItems();

        // Main storage box
        Renderer.drawBox(20, 20, 280, 200);

        // Title
        Renderer.drawText('STORAGE CHEST', 160, 30, '#a86', 'center');

        // Stats
        Renderer.drawText(`Stored: ${stored.length} items`, 50, 45, '#888');
        Renderer.drawText(`Inventory: ${items.length}/${this.getMaxItems()}`, 180, 45, '#888');

        // Mode tabs
        const modes = ['VIEW', 'STORE', 'TAKE', 'EXIT'];
        for (let i = 0; i < modes.length; i++) {
            const x = 45 + i * 60;
            const isSelected = i === this.storageModeIndex;
            Renderer.drawRect(x - 22, 58, 50, 14, isSelected ? '#a86' : '#444');
            Renderer.drawText(modes[i], x, 60, isSelected ? '#000' : '#fff', 'center', 6);
        }

        const startY = 80;
        const maxVisible = 6;

        if (this.storageMode === 'view') {
            // Show stored items sorted by value
            Renderer.drawText('Stored Items (by value):', 50, startY, '#fff');
            if (stored.length === 0) {
                Renderer.drawText('(empty)', 160, startY + 25, '#888', 'center');
            } else {
                for (let i = 0; i < Math.min(stored.length, maxVisible); i++) {
                    const idx = i + this.storageScrollOffset;
                    if (idx >= stored.length) break;
                    const y = startY + 15 + i * 14;
                    const item = Items.get(stored[idx]);
                    const isSelected = idx === this.storageIndex;
                    const price = item ? (item.price || item.sellPrice || 0) : 0;

                    if (isSelected) {
                        Renderer.drawText('>', 35, y, '#ff0');
                    }
                    Renderer.drawText(item ? item.name : stored[idx], 50, y, isSelected ? '#ff0' : '#fff');
                    Renderer.drawText(`${price}G`, 250, y, '#888', 'right');
                }
                // Scroll indicators
                if (this.storageScrollOffset > 0) {
                    Renderer.drawText('^', 270, startY + 15, '#888');
                }
                if (this.storageScrollOffset + maxVisible < stored.length) {
                    Renderer.drawText('v', 270, startY + 15 + (maxVisible - 1) * 14, '#888');
                }
            }
        } else if (this.storageMode === 'store') {
            // Show inventory items to store
            Renderer.drawText('Select item to store:', 50, startY, '#fff');
            if (items.length === 0) {
                Renderer.drawText('(no items)', 160, startY + 25, '#888', 'center');
            } else {
                for (let i = 0; i < Math.min(items.length, maxVisible); i++) {
                    const idx = i + this.storageScrollOffset;
                    if (idx >= items.length) break;
                    const y = startY + 15 + i * 14;
                    const item = Items.get(items[idx]);
                    const isSelected = idx === this.storageIndex;
                    const canStore = item && item.type !== 'key';
                    const price = item ? (item.price || item.sellPrice || 0) : 0;

                    if (isSelected) {
                        Renderer.drawText('>', 35, y, '#ff0');
                    }
                    const color = isSelected ? '#ff0' : (canStore ? '#fff' : '#666');
                    Renderer.drawText(item ? item.name : items[idx], 50, y, color);
                    Renderer.drawText(`${price}G`, 250, y, '#888', 'right');
                }
                // Scroll indicators
                if (this.storageScrollOffset > 0) {
                    Renderer.drawText('^', 270, startY + 15, '#888');
                }
                if (this.storageScrollOffset + maxVisible < items.length) {
                    Renderer.drawText('v', 270, startY + 15 + (maxVisible - 1) * 14, '#888');
                }
            }
        } else if (this.storageMode === 'take') {
            // Show stored items to take
            Renderer.drawText('Select item to take:', 50, startY, '#fff');
            if (stored.length === 0) {
                Renderer.drawText('(empty)', 160, startY + 25, '#888', 'center');
            } else {
                for (let i = 0; i < Math.min(stored.length, maxVisible); i++) {
                    const idx = i + this.storageScrollOffset;
                    if (idx >= stored.length) break;
                    const y = startY + 15 + i * 14;
                    const item = Items.get(stored[idx]);
                    const isSelected = idx === this.storageIndex;
                    const price = item ? (item.price || item.sellPrice || 0) : 0;

                    if (isSelected) {
                        Renderer.drawText('>', 35, y, '#ff0');
                    }
                    Renderer.drawText(item ? item.name : stored[idx], 50, y, isSelected ? '#ff0' : '#fff');
                    Renderer.drawText(`${price}G`, 250, y, '#888', 'right');
                }
                // Scroll indicators
                if (this.storageScrollOffset > 0) {
                    Renderer.drawText('^', 270, startY + 15, '#888');
                }
                if (this.storageScrollOffset + maxVisible < stored.length) {
                    Renderer.drawText('v', 270, startY + 15 + (maxVisible - 1) * 14, '#888');
                }
            }
        } else if (this.storageMode === 'exit') {
            Renderer.drawText('Press Z to close chest', 160, startY + 40, '#fff', 'center');
        }

        // Message
        if (this.storageMessageTimer > 0 && this.storageMessage) {
            Renderer.drawBox(60, 180, 200, 25);
            Renderer.drawText(this.storageMessage, 160, 188, '#fff', 'center', 7);
        }
    }
    ,

    // ==================== TROPHY CASE SYSTEM ====================

    // Trophy state
    trophyOpen: false,
    trophyMode: 'view', // 'view', 'place', 'take', 'exit'
    trophyModeIndex: 0,
    trophyIndex: 0,
    trophyMessage: '',
    trophyMessageTimer: 0,
    trophyScrollOffset: 0,

    /**
     * Check if item can be placed in trophy case
     */
    isTrophyItem(itemId) {
        const item = Items.get(itemId);
        if (!item) return false;
        // Can be a trophy if explicitly marked OR is a key item
        return item.isTrophy === true || item.type === 'key';
    },

    /**
     * Get trophy value for sorting
     */
    getTrophyValue(itemId) {
        const item = Items.get(itemId);
        if (!item) return 0;
        return item.trophyValue || item.price || 0;
    },

    /**
     * Get displayed trophies (sorted by trophy value, highest first)
     */
    getDisplayedTrophies() {
        const trophies = Save.getFlag('displayed_trophies') || [];
        // Sort by trophy value from highest to lowest
        return trophies.slice().sort((a, b) => {
            return this.getTrophyValue(b) - this.getTrophyValue(a);
        });
    },

    /**
     * Get raw displayed trophies (unsorted)
     */
    getRawDisplayedTrophies() {
        return Save.getFlag('displayed_trophies') || [];
    },

    /**
     * Set displayed trophies
     */
    setDisplayedTrophies(trophies) {
        Save.setFlag('displayed_trophies', trophies);
    },

    /**
     * Get trophy-eligible items from inventory
     */
    getTrophyEligibleItems() {
        const items = this.getItems();
        const eligible = [];
        for (let i = 0; i < items.length; i++) {
            if (this.isTrophyItem(items[i])) {
                eligible.push({ index: i, itemId: items[i] });
            }
        }
        // Sort by trophy value
        return eligible.sort((a, b) => {
            return this.getTrophyValue(b.itemId) - this.getTrophyValue(a.itemId);
        });
    },

    /**
     * Place trophy in case
     */
    placeTrophy(inventoryIndex) {
        const save = Save.getCurrent();
        if (!save) return { success: false, text: '* Error!' };

        const items = this.getItems();
        if (inventoryIndex < 0 || inventoryIndex >= items.length) {
            return { success: false, text: '* No item selected!' };
        }

        const itemId = items[inventoryIndex];
        const item = Items.get(itemId);

        if (!item) {
            return { success: false, text: '* Invalid item!' };
        }

        if (!this.isTrophyItem(itemId)) {
            return { success: false, text: "* That's not a trophy item!" };
        }

        // Remove from inventory and add to trophy case
        this.removeItem(inventoryIndex);
        const trophies = this.getRawDisplayedTrophies();
        trophies.push(itemId);
        this.setDisplayedTrophies(trophies);

        return { success: true, text: `* Displayed ${item.name}!` };
    },

    /**
     * Take trophy from case
     */
    takeTrophy(trophyIndex) {
        const save = Save.getCurrent();
        if (!save) return { success: false, text: '* Error!' };

        const trophies = this.getDisplayedTrophies();
        if (trophyIndex < 0 || trophyIndex >= trophies.length) {
            return { success: false, text: '* No trophy selected!' };
        }

        if (this.isFull()) {
            return { success: false, text: '* Inventory is full!' };
        }

        const itemId = trophies[trophyIndex];
        const item = Items.get(itemId);

        // Remove from trophy case
        const rawTrophies = this.getRawDisplayedTrophies();
        const rawIndex = rawTrophies.indexOf(itemId);
        if (rawIndex >= 0) {
            rawTrophies.splice(rawIndex, 1);
            this.setDisplayedTrophies(rawTrophies);
        }

        // Add to inventory
        this.addItem(itemId);

        return { success: true, text: `* Took ${item ? item.name : itemId}!` };
    },

    /**
     * Open trophy case
     */
    openTrophyCase() {
        this.trophyOpen = true;
        this.trophyMode = 'view';
        this.trophyModeIndex = 0;
        this.trophyIndex = 0;
        this.trophyMessage = '';
        this.trophyMessageTimer = 0;
        this.trophyScrollOffset = 0;
    },

    /**
     * Close trophy case
     */
    closeTrophyCase() {
        this.trophyOpen = false;
    },

    /**
     * Update trophy case
     */
    updateTrophyCase(dt) {
        if (!this.trophyOpen) return false;

        const trophies = this.getDisplayedTrophies();
        const eligible = this.getTrophyEligibleItems();

        // Mode selection
        if (Input.isPressed('left')) {
            this.trophyModeIndex = (this.trophyModeIndex - 1 + 4) % 4;
            this.trophyMode = ['view', 'place', 'take', 'exit'][this.trophyModeIndex];
            this.trophyIndex = 0;
            this.trophyScrollOffset = 0;
            Audio.playSFX('menu_move');
        }
        if (Input.isPressed('right')) {
            this.trophyModeIndex = (this.trophyModeIndex + 1) % 4;
            this.trophyMode = ['view', 'place', 'take', 'exit'][this.trophyModeIndex];
            this.trophyIndex = 0;
            this.trophyScrollOffset = 0;
            Audio.playSFX('menu_move');
        }

        const maxVisible = 5;

        if (this.trophyMode === 'exit') {
            if (Input.isPressed('confirm')) {
                this.closeTrophyCase();
                Audio.playSFX('cancel');
                return false;
            }
        } else if (this.trophyMode === 'view' || this.trophyMode === 'take') {
            // Navigate trophies
            if (Input.isPressed('up')) {
                this.trophyIndex = Math.max(0, this.trophyIndex - 1);
                if (this.trophyIndex < this.trophyScrollOffset) {
                    this.trophyScrollOffset = this.trophyIndex;
                }
                Audio.playSFX('menu_move');
            }
            if (Input.isPressed('down')) {
                this.trophyIndex = Math.min(trophies.length - 1, this.trophyIndex + 1);
                if (this.trophyIndex >= this.trophyScrollOffset + maxVisible) {
                    this.trophyScrollOffset = this.trophyIndex - maxVisible + 1;
                }
                Audio.playSFX('menu_move');
            }

            if (this.trophyMode === 'take' && Input.isPressed('confirm') && trophies.length > 0) {
                const result = this.takeTrophy(this.trophyIndex);
                if (result.success) {
                    Audio.playSFX('confirm');
                    const newTrophies = this.getDisplayedTrophies();
                    if (this.trophyIndex >= newTrophies.length) {
                        this.trophyIndex = Math.max(0, newTrophies.length - 1);
                    }
                } else {
                    Audio.playSFX('cancel');
                }
                this.trophyMessage = result.text;
                this.trophyMessageTimer = 2;
            }
        } else if (this.trophyMode === 'place') {
            // Navigate eligible items
            if (Input.isPressed('up')) {
                this.trophyIndex = Math.max(0, this.trophyIndex - 1);
                if (this.trophyIndex < this.trophyScrollOffset) {
                    this.trophyScrollOffset = this.trophyIndex;
                }
                Audio.playSFX('menu_move');
            }
            if (Input.isPressed('down')) {
                this.trophyIndex = Math.min(eligible.length - 1, this.trophyIndex + 1);
                if (this.trophyIndex >= this.trophyScrollOffset + maxVisible) {
                    this.trophyScrollOffset = this.trophyIndex - maxVisible + 1;
                }
                Audio.playSFX('menu_move');
            }

            if (Input.isPressed('confirm') && eligible.length > 0) {
                const selectedItem = eligible[this.trophyIndex];
                const result = this.placeTrophy(selectedItem.index);
                if (result.success) {
                    Audio.playSFX('confirm');
                    const newEligible = this.getTrophyEligibleItems();
                    if (this.trophyIndex >= newEligible.length) {
                        this.trophyIndex = Math.max(0, newEligible.length - 1);
                    }
                } else {
                    Audio.playSFX('cancel');
                }
                this.trophyMessage = result.text;
                this.trophyMessageTimer = 2;
            }
        }

        if (Input.isPressed('cancel')) {
            this.closeTrophyCase();
            Audio.playSFX('cancel');
            return false;
        }

        // Update message timer
        if (this.trophyMessageTimer > 0) {
            this.trophyMessageTimer -= dt;
        }

        return true;
    },

    /**
     * Render trophy case
     */
    renderTrophyCase() {
        if (!this.trophyOpen) return;

        const trophies = this.getDisplayedTrophies();
        const eligible = this.getTrophyEligibleItems();

        // Main trophy box
        Renderer.drawBox(20, 20, 280, 200);

        // Title
        Renderer.drawText('TROPHY CASE', 160, 30, '#fc0', 'center');

        // Stats
        Renderer.drawText(`Displayed: ${trophies.length} trophies`, 160, 45, '#888', 'center');

        // Mode tabs
        const modes = ['VIEW', 'PLACE', 'TAKE', 'EXIT'];
        for (let i = 0; i < modes.length; i++) {
            const x = 45 + i * 60;
            const isSelected = i === this.trophyModeIndex;
            Renderer.drawRect(x - 22, 55, 50, 14, isSelected ? '#fc0' : '#444');
            Renderer.drawText(modes[i], x, 57, isSelected ? '#000' : '#fff', 'center', 6);
        }

        const startY = 78;
        const maxVisible = 5;

        if (this.trophyMode === 'view') {
            Renderer.drawText('Your Trophies:', 50, startY, '#fff');
            if (trophies.length === 0) {
                Renderer.drawText('(no trophies displayed)', 160, startY + 30, '#888', 'center');
                Renderer.drawText('Place boss drops and special', 160, startY + 50, '#666', 'center', 6);
                Renderer.drawText('items to show them off!', 160, startY + 62, '#666', 'center', 6);
            } else {
                for (let i = 0; i < Math.min(trophies.length, maxVisible); i++) {
                    const idx = i + this.trophyScrollOffset;
                    if (idx >= trophies.length) break;
                    const y = startY + 15 + i * 16;
                    const item = Items.get(trophies[idx]);
                    const isSelected = idx === this.trophyIndex;
                    const value = this.getTrophyValue(trophies[idx]);

                    if (isSelected) {
                        Renderer.drawText('>', 35, y, '#ff0');
                    }
                    Renderer.drawText(item ? item.name : trophies[idx], 50, y, isSelected ? '#ff0' : '#fff');
                    Renderer.drawText(`*${value}`, 250, y, '#fc0', 'right');
                }
                // Scroll indicators
                if (this.trophyScrollOffset > 0) {
                    Renderer.drawText('^', 270, startY + 15, '#888');
                }
                if (this.trophyScrollOffset + maxVisible < trophies.length) {
                    Renderer.drawText('v', 270, startY + 15 + (maxVisible - 1) * 16, '#888');
                }
                // Description
                if (trophies.length > 0 && this.trophyIndex < trophies.length) {
                    const selectedItem = Items.get(trophies[this.trophyIndex]);
                    if (selectedItem) {
                        Renderer.drawText(selectedItem.description || '', 160, 185, '#888', 'center', 6);
                    }
                }
            }
        } else if (this.trophyMode === 'place') {
            Renderer.drawText('Select trophy to display:', 50, startY, '#fff');
            if (eligible.length === 0) {
                Renderer.drawText('(no trophy items in inventory)', 160, startY + 30, '#888', 'center');
            } else {
                for (let i = 0; i < Math.min(eligible.length, maxVisible); i++) {
                    const idx = i + this.trophyScrollOffset;
                    if (idx >= eligible.length) break;
                    const y = startY + 15 + i * 16;
                    const itemData = eligible[idx];
                    const item = Items.get(itemData.itemId);
                    const isSelected = idx === this.trophyIndex;
                    const value = this.getTrophyValue(itemData.itemId);

                    if (isSelected) {
                        Renderer.drawText('>', 35, y, '#ff0');
                    }
                    Renderer.drawText(item ? item.name : itemData.itemId, 50, y, isSelected ? '#ff0' : '#fff');
                    Renderer.drawText(`*${value}`, 250, y, '#fc0', 'right');
                }
                // Scroll indicators
                if (this.trophyScrollOffset > 0) {
                    Renderer.drawText('^', 270, startY + 15, '#888');
                }
                if (this.trophyScrollOffset + maxVisible < eligible.length) {
                    Renderer.drawText('v', 270, startY + 15 + (maxVisible - 1) * 16, '#888');
                }
            }
        } else if (this.trophyMode === 'take') {
            Renderer.drawText('Select trophy to take:', 50, startY, '#fff');
            if (trophies.length === 0) {
                Renderer.drawText('(no trophies to take)', 160, startY + 30, '#888', 'center');
            } else {
                for (let i = 0; i < Math.min(trophies.length, maxVisible); i++) {
                    const idx = i + this.trophyScrollOffset;
                    if (idx >= trophies.length) break;
                    const y = startY + 15 + i * 16;
                    const item = Items.get(trophies[idx]);
                    const isSelected = idx === this.trophyIndex;
                    const value = this.getTrophyValue(trophies[idx]);

                    if (isSelected) {
                        Renderer.drawText('>', 35, y, '#ff0');
                    }
                    Renderer.drawText(item ? item.name : trophies[idx], 50, y, isSelected ? '#ff0' : '#fff');
                    Renderer.drawText(`*${value}`, 250, y, '#fc0', 'right');
                }
                // Scroll indicators
                if (this.trophyScrollOffset > 0) {
                    Renderer.drawText('^', 270, startY + 15, '#888');
                }
                if (this.trophyScrollOffset + maxVisible < trophies.length) {
                    Renderer.drawText('v', 270, startY + 15 + (maxVisible - 1) * 16, '#888');
                }
            }
        } else if (this.trophyMode === 'exit') {
            Renderer.drawText('Press Z to close trophy case', 160, startY + 40, '#fff', 'center');
        }

        // Message
        if (this.trophyMessageTimer > 0 && this.trophyMessage) {
            Renderer.drawBox(60, 175, 200, 25);
            Renderer.drawText(this.trophyMessage, 160, 183, '#fff', 'center', 7);
        }
    }
};

// Make it globally available
window.Inventory = Inventory;
