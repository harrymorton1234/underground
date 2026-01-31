/**
 * Item definitions
 */
const Items = {
    data: {
        // Healing items
        'crystal_candy': {
            name: 'Crystal Candy',
            type: 'consumable',
            description: 'A sparkling candy. Heals 10 HP.',
            healAmount: 10,
            price: 15,
            battleText: '* You ate the Crystal Candy.\n* Sweet and crunchy!'
        },

        'moss_sandwich': {
            name: 'Moss Sandwich',
            type: 'consumable',
            description: 'A sandwich made with cave moss. Heals 20 HP.',
            healAmount: 20,
            price: 30,
            battleText: '* You ate the Moss Sandwich.\n* Surprisingly tasty!'
        },

        'glowing_mushroom': {
            name: 'Glowing Mushroom',
            type: 'consumable',
            description: 'A bioluminescent mushroom. Heals 15 HP.',
            healAmount: 15,
            price: 25,
            battleText: '* You ate the Glowing Mushroom.\n* It tingles on your tongue!'
        },

        'cave_water': {
            name: 'Cave Water',
            type: 'consumable',
            description: 'Pure underground spring water. Heals 8 HP.',
            healAmount: 8,
            price: 5,
            battleText: '* You drank the Cave Water.\n* Refreshing!'
        },

        'ancient_fruit': {
            name: 'Ancient Fruit',
            type: 'consumable',
            description: 'A fruit that grew in darkness for centuries. Heals 30 HP.',
            healAmount: 30,
            price: 50,
            battleText: '* You ate the Ancient Fruit.\n* It fills you with determination.'
        },

        'spider_cider': {
            name: 'Spider Cider',
            type: 'consumable',
            description: 'Made by spiders, for spiders, of spiders. Heals 24 HP.',
            healAmount: 24,
            price: 18,
            battleText: '* You drank the Spider Cider.\n* ...try not to think about it.'
        },

        // Weapons
        'stick': {
            name: 'Stick',
            type: 'weapon',
            description: 'A simple wooden stick.',
            attack: 0,
            price: 0,
            equipText: 'Its bark is worse than its bite.'
        },

        'crystal_dagger': {
            name: 'Crystal Dagger',
            type: 'weapon',
            description: 'A sharp blade made of crystal.',
            attack: 3,
            price: 50,
            equipText: 'It sparkles in the dim light.'
        },

        'ancient_blade': {
            name: 'Ancient Blade',
            type: 'weapon',
            description: 'A sword from a forgotten era.',
            attack: 5,
            price: 100,
            equipText: 'You feel its history in your hands.'
        },

        'worn_notebook': {
            name: 'Worn Notebook',
            type: 'weapon',
            description: 'Contains words of power... or something.',
            attack: 2,
            price: 25,
            equipText: 'The pen is mightier than the sword!'
        },

        // Armor
        'bandage': {
            name: 'Bandage',
            type: 'armor',
            description: 'A simple cloth bandage.',
            defense: 0,
            hpBonus: 0,
            price: 0,
            equipText: 'It has already been used.'
        },

        'crystal_mail': {
            name: 'Crystal Mail',
            type: 'armor',
            description: 'Armor made of interlocking crystals. +10 HP',
            defense: 3,
            hpBonus: 10,
            price: 60,
            equipText: 'Fashionable AND protective! Max HP +10!'
        },

        'ancient_robe': {
            name: 'Ancient Robe',
            type: 'armor',
            description: 'A robe from a bygone age. +15 HP',
            defense: 5,
            hpBonus: 15,
            price: 100,
            equipText: 'Ancient power flows through you! Max HP +15!'
        },

        'torn_cloak': {
            name: 'Torn Cloak',
            type: 'armor',
            description: 'A damaged but still useful cloak. +5 HP',
            defense: 2,
            hpBonus: 5,
            price: 20,
            equipText: 'Better than nothing! Max HP +5!'
        },

        // Key items
        'crystal_key': {
            name: 'Crystal Key',
            type: 'key',
            description: 'A key made of pure crystal. Opens something...',
            price: 0
        },

        'old_photo': {
            name: 'Old Photo',
            type: 'key',
            description: 'A faded photograph of... someone.',
            price: 0
        },

        'music_box': {
            name: 'Music Box',
            type: 'key',
            description: 'Plays a hauntingly familiar tune.',
            price: 0
        },

        'lore_tablet': {
            name: 'Lore Tablet',
            type: 'key',
            description: 'Contains ancient writings about this world.',
            price: 0
        },

        'keeper_key': {
            name: 'Keeper\'s Key',
            type: 'key',
            description: 'An ancient key dropped by The Keeper. Opens the path to the core.',
            price: 0
        },

        // Enemy drops
        'spider_leg': {
            name: 'Spider Leg',
            type: 'consumable',
            description: 'A crunchy spider leg. Heals 5 HP. Gross but effective.',
            healAmount: 5,
            price: 8,
            sellPrice: 3,
            battleText: '* You ate the Spider Leg.\n* Crunchy...'
        },

        'spider_silk': {
            name: 'Spider Silk',
            type: 'material',
            description: 'Strong sticky silk from a cave spider.',
            price: 25,
            sellPrice: 12
        },

        'cotton_ball': {
            name: 'Cotton Ball',
            type: 'consumable',
            description: 'Soft cotton from a training dummy. Heals 3 HP.',
            healAmount: 3,
            price: 5,
            sellPrice: 2,
            battleText: '* You ate the Cotton Ball.\n* Fluffy!'
        },

        'button_eye': {
            name: 'Button Eye',
            type: 'material',
            description: 'A button eye from a dummy. Looks like it\'s watching you.',
            price: 15,
            sellPrice: 7
        },

        'rock_chunk': {
            name: 'Rock Chunk',
            type: 'material',
            description: 'A piece of rock critter. Very hard.',
            price: 20,
            sellPrice: 10
        },

        'crystal_shard': {
            name: 'Crystal Shard',
            type: 'material',
            description: 'A glowing crystal fragment. Beautiful.',
            price: 35,
            sellPrice: 18
        },

        'bat_wing': {
            name: 'Bat Wing',
            type: 'consumable',
            description: 'A crystal bat wing. Heals 12 HP.',
            healAmount: 12,
            price: 20,
            sellPrice: 10,
            battleText: '* You ate the Bat Wing.\n* Leathery but nutritious!'
        },

        'mushroom_cap': {
            name: 'Mushroom Cap',
            type: 'consumable',
            description: 'A colorful mushroom cap. Heals 18 HP.',
            healAmount: 18,
            price: 30,
            sellPrice: 15,
            battleText: '* You ate the Mushroom Cap.\n* Tastes like dancing!'
        },

        'spirit_essence': {
            name: 'Spirit Essence',
            type: 'material',
            description: 'Ethereal essence from an ancient spirit.',
            price: 50,
            sellPrice: 25
        },

        'swamp_moss': {
            name: 'Swamp Moss',
            type: 'consumable',
            description: 'Slimy but nutritious moss. Heals 15 HP.',
            healAmount: 15,
            price: 20,
            sellPrice: 10,
            battleText: '* You ate the Swamp Moss.\n* Slimy... but filling!'
        },

        // Boss drops
        'guardian_crystal': {
            name: 'Guardian Crystal',
            type: 'key',
            description: 'A large crystal from the Crystal Guardian. Opens the path forward.',
            price: 0
        },

        'keeper_key': {
            name: 'Keeper\'s Key',
            type: 'key',
            description: 'The key held by The Keeper. Unlocks the way to the next level.',
            price: 0
        },

        'mega_core': {
            name: 'Mega Core',
            type: 'key',
            description: 'The core of the Mega Boss. Radiates immense power.',
            price: 0
        },

        // Shields and armor
        'wooden_shield': {
            name: 'Wooden Shield',
            type: 'armor',
            description: 'A simple wooden shield. +3 HP',
            defense: 1,
            hpBonus: 3,
            price: 30,
            sellPrice: 15,
            equipText: 'You feel slightly safer. Max HP +3!'
        },

        'crystal_shield': {
            name: 'Crystal Shield',
            type: 'armor',
            description: 'A shield made of crystal. +12 HP',
            defense: 4,
            hpBonus: 12,
            price: 80,
            sellPrice: 40,
            equipText: 'It shimmers with protection! Max HP +12!'
        },

        'spirit_cloak': {
            name: 'Spirit Cloak',
            type: 'armor',
            description: 'A cloak infused with spirit essence. +20 HP',
            defense: 6,
            hpBonus: 20,
            price: 120,
            sellPrice: 60,
            equipText: 'You feel ethereal... Max HP +20!'
        },

        'mega_armor': {
            name: 'Mega Armor',
            type: 'armor',
            description: 'Armor forged from Mega Core energy. +50 HP',
            defense: 10,
            hpBonus: 50,
            price: 500,
            sellPrice: 250,
            equipText: 'ULTIMATE POWER! Max HP +50!'
        },

        // More weapons
        'spider_fang': {
            name: 'Spider Fang',
            type: 'weapon',
            description: 'A sharp fang from a cave spider.',
            attack: 2,
            price: 35,
            sellPrice: 17,
            equipText: 'Pointy and venomous-looking!'
        },

        'crystal_sword': {
            name: 'Crystal Sword',
            type: 'weapon',
            description: 'A sword made of pure crystal.',
            attack: 6,
            price: 100,
            sellPrice: 50,
            equipText: 'It gleams with power!'
        },

        'spirit_blade': {
            name: 'Spirit Blade',
            type: 'weapon',
            description: 'A blade infused with spirit energy.',
            attack: 8,
            price: 150,
            sellPrice: 75,
            equipText: 'The spirits guide your strikes!'
        },

        'mega_sword': {
            name: 'Mega Sword',
            type: 'weapon',
            description: 'The ultimate weapon. Forged from Mega Core.',
            attack: 15,
            price: 600,
            sellPrice: 300,
            equipText: 'UNLIMITED POWER!'
        },

        // Backpacks - increase inventory size
        'small_pouch': {
            name: 'Small Pouch',
            type: 'backpack',
            description: 'A small leather pouch. Holds 2 extra items.',
            inventoryBonus: 2,
            price: 50,
            sellPrice: 25,
            equipText: 'You can carry a bit more now!'
        },

        'travelers_bag': {
            name: "Traveler's Bag",
            type: 'backpack',
            description: 'A sturdy bag for adventurers. Holds 4 extra items.',
            inventoryBonus: 4,
            price: 120,
            sellPrice: 60,
            equipText: 'Much more room for stuff!'
        },

        'explorers_pack': {
            name: "Explorer's Pack",
            type: 'backpack',
            description: 'A large pack with many pockets. Holds 6 extra items.',
            inventoryBonus: 6,
            price: 250,
            sellPrice: 125,
            equipText: 'You feel like a true explorer!'
        },

        'dimensional_satchel': {
            name: 'Dimensional Satchel',
            type: 'backpack',
            description: 'A magical bag that holds way more than it should. Holds 10 extra items.',
            inventoryBonus: 10,
            price: 500,
            sellPrice: 250,
            equipText: 'It seems bigger on the inside...'
        }
    },

    /**
     * Get item by ID
     */
    get(itemId) {
        return this.data[itemId] || null;
    },

    /**
     * Check if item exists
     */
    exists(itemId) {
        return itemId in this.data;
    },

    /**
     * Get all items of type
     */
    getByType(type) {
        const items = [];
        for (const [id, item] of Object.entries(this.data)) {
            if (item.type === type) {
                items.push({ id, ...item });
            }
        }
        return items;
    },

    /**
     * Get all consumables
     */
    getConsumables() {
        return this.getByType('consumable');
    },

    /**
     * Get all weapons
     */
    getWeapons() {
        return this.getByType('weapon');
    },

    /**
     * Get all armor
     */
    getArmor() {
        return this.getByType('armor');
    },

    /**
     * Get item heal amount (0 if not consumable)
     */
    getHealAmount(itemId) {
        const item = this.get(itemId);
        return item?.healAmount || 0;
    },

    /**
     * Get item attack bonus (0 if not weapon)
     */
    getAttack(itemId) {
        const item = this.get(itemId);
        return item?.attack || 0;
    },

    /**
     * Get item defense bonus (0 if not armor)
     */
    getDefense(itemId) {
        const item = this.get(itemId);
        return item?.defense || 0;
    },

    /**
     * Get item HP bonus (0 if no bonus)
     */
    getHpBonus(itemId) {
        const item = this.get(itemId);
        return item?.hpBonus || 0;
    },

    /**
     * Check if item is usable in battle
     */
    isUsableInBattle(itemId) {
        const item = this.get(itemId);
        return item?.type === 'consumable';
    },

    /**
     * Check if item is equippable
     */
    isEquippable(itemId) {
        const item = this.get(itemId);
        return item?.type === 'weapon' || item?.type === 'armor' || item?.type === 'backpack';
    },

    /**
     * Get inventory bonus from backpack
     */
    getInventoryBonus(itemId) {
        const item = this.get(itemId);
        return item?.inventoryBonus || 0;
    }
};

// Make it globally available
window.Items = Items;
