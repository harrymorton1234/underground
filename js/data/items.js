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

        // Key items (can be displayed in trophy case)
        'hero_crown': {
            name: "Hero's Crown",
            type: 'key',
            description: 'The crown of the Hero of the Underground. A symbol of your triumph.',
            price: 0,
            isTrophy: true,
            trophyValue: 5000
        },

        'crystal_key': {
            name: 'Crystal Key',
            type: 'key',
            description: 'A key made of pure crystal. Opens something...',
            price: 0,
            isTrophy: true,
            trophyValue: 100
        },

        'old_photo': {
            name: 'Old Photo',
            type: 'key',
            description: 'A faded photograph of... someone.',
            price: 0,
            isTrophy: true,
            trophyValue: 50
        },

        'music_box': {
            name: 'Music Box',
            type: 'key',
            description: 'Plays a hauntingly familiar tune.',
            price: 0,
            isTrophy: true,
            trophyValue: 75
        },

        'lore_tablet': {
            name: 'Lore Tablet',
            type: 'key',
            description: 'Contains ancient writings about this world.',
            price: 0,
            isTrophy: true,
            trophyValue: 60
        },

        'keeper_key': {
            name: 'Keeper\'s Key',
            type: 'key',
            description: 'An ancient key dropped by The Keeper. Opens the path to the core.',
            price: 0,
            isTrophy: true,
            trophyValue: 200
        },

        'freds_key': {
            name: "Fred's Key",
            type: 'key',
            description: 'A rusty old key given to you by Fred. Opens the mines.',
            price: 0
        },

        'ancient_heart': {
            name: 'Ancient Heart',
            type: 'key',
            description: 'The crystallized heart of THE ANCIENT ONE. Pulses with forgotten memories.',
            price: 0,
            isTrophy: true,
            trophyValue: 2000
        },

        // Mine enemy drops
        'crawler_shell': {
            name: 'Crawler Shell',
            type: 'material',
            description: 'A hard shell from a mine crawler.',
            price: 20,
            sellPrice: 10
        },

        'ore_chunk': {
            name: 'Ore Chunk',
            type: 'material',
            description: 'A chunk of unrefined ore from the mines.',
            price: 30,
            sellPrice: 15
        },

        'rat_tail': {
            name: 'Rat Tail',
            type: 'consumable',
            description: 'A shadow rat tail. Heals 8 HP. Creepy.',
            healAmount: 8,
            price: 12,
            sellPrice: 6,
            battleText: '* You ate the Rat Tail.\n* Chewy...'
        },

        'shadow_essence': {
            name: 'Shadow Essence',
            type: 'material',
            description: 'Pure darkness in solid form.',
            price: 60,
            sellPrice: 30
        },

        'worm_segment': {
            name: 'Worm Segment',
            type: 'consumable',
            description: 'A segment from a deep worm. Heals 20 HP.',
            healAmount: 20,
            price: 35,
            sellPrice: 17,
            battleText: '* You ate the Worm Segment.\n* Rubbery but nutritious!'
        },

        'nightmare_essence': {
            name: 'Nightmare Essence',
            type: 'material',
            description: 'The essence of fear itself.',
            price: 100,
            sellPrice: 50
        },

        'shadow_cloak': {
            name: 'Shadow Cloak',
            type: 'armor',
            description: 'A cloak woven from pure shadow. +45 HP',
            defense: 9,
            hpBonus: 45,
            price: 400,
            sellPrice: 200,
            equipText: 'You blend with the darkness! Max HP +45!'
        },

        'nightmare_blade': {
            name: 'Nightmare Blade',
            type: 'weapon',
            description: 'A blade forged from nightmares.',
            attack: 22,
            price: 550,
            sellPrice: 275,
            equipText: 'Fear itself bends to your will!'
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

        // Boss drops (trophy items)
        'guardian_crystal': {
            name: 'Guardian Crystal',
            type: 'key',
            description: 'A large crystal from the Crystal Guardian. Opens the path forward.',
            price: 0,
            isTrophy: true,
            trophyValue: 300
        },

        'destroyer_heart': {
            name: 'Destroyer Heart',
            type: 'key',
            description: 'The corrupted heart of The Destroyer. Pulses with dark energy.',
            price: 0,
            isTrophy: true,
            trophyValue: 500
        },

        'mega_core': {
            name: 'Mega Core',
            type: 'key',
            description: 'The core of the Mega Boss. Radiates immense power.',
            price: 0,
            isTrophy: true,
            trophyValue: 1000
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
        },

        // ==================== VILLAGE ITEMS ====================

        // Butcher Shop - Food items
        'raw_steak': {
            name: 'Raw Steak',
            type: 'consumable',
            description: 'Fresh cut of meat. Heals 25 HP.',
            healAmount: 25,
            price: 40,
            sellPrice: 20,
            battleText: '* You ate the Raw Steak.\n* Very filling!'
        },

        'cooked_roast': {
            name: 'Cooked Roast',
            type: 'consumable',
            description: 'A perfectly cooked roast. Heals 50 HP.',
            healAmount: 50,
            price: 80,
            sellPrice: 40,
            battleText: '* You ate the Cooked Roast.\n* Delicious!'
        },

        'meat_pie': {
            name: 'Meat Pie',
            type: 'consumable',
            description: 'A hearty meat pie. Heals 35 HP.',
            healAmount: 35,
            price: 55,
            sellPrice: 27,
            battleText: '* You ate the Meat Pie.\n* Savory and warm!'
        },

        'smoked_sausage': {
            name: 'Smoked Sausage',
            type: 'consumable',
            description: 'Hickory smoked sausage. Heals 20 HP.',
            healAmount: 20,
            price: 30,
            sellPrice: 15,
            battleText: '* You ate the Smoked Sausage.\n* Smoky goodness!'
        },

        'legendary_feast': {
            name: 'Legendary Feast',
            type: 'consumable',
            description: 'A feast fit for a hero. Heals 100 HP.',
            healAmount: 100,
            price: 200,
            sellPrice: 100,
            battleText: '* You consumed the Legendary Feast.\n* You feel like royalty!'
        },

        // Blacksmith Shop - Weapons
        'iron_sword': {
            name: 'Iron Sword',
            type: 'weapon',
            description: 'A sturdy iron sword.',
            attack: 10,
            price: 150,
            sellPrice: 75,
            equipText: 'Solid and reliable!'
        },

        'steel_blade': {
            name: 'Steel Blade',
            type: 'weapon',
            description: 'A finely crafted steel blade.',
            attack: 14,
            price: 250,
            sellPrice: 125,
            equipText: 'Sharp and deadly!'
        },

        'hero_sword': {
            name: "Hero's Sword",
            type: 'weapon',
            description: 'A legendary blade for a true hero.',
            attack: 20,
            price: 500,
            sellPrice: 250,
            equipText: '* You feel like a true hero!'
        },

        'dragonslayer': {
            name: 'Dragonslayer',
            type: 'weapon',
            description: 'A massive blade said to slay dragons.',
            attack: 25,
            price: 800,
            sellPrice: 400,
            equipText: '* The weight of destiny fills your hands!'
        },

        // Blacksmith - Armor
        'iron_armor': {
            name: 'Iron Armor',
            type: 'armor',
            description: 'Sturdy iron protection. +25 HP',
            defense: 8,
            hpBonus: 25,
            price: 180,
            sellPrice: 90,
            equipText: 'Heavy but protective! Max HP +25!'
        },

        'steel_plate': {
            name: 'Steel Plate',
            type: 'armor',
            description: 'Full steel plate armor. +40 HP',
            defense: 12,
            hpBonus: 40,
            price: 350,
            sellPrice: 175,
            equipText: 'Like a walking fortress! Max HP +40!'
        },

        'hero_armor': {
            name: "Hero's Armor",
            type: 'armor',
            description: 'Legendary armor for a true hero. +60 HP',
            defense: 15,
            hpBonus: 60,
            price: 600,
            sellPrice: 300,
            equipText: '* Legendary protection! Max HP +60!'
        },

        // Magic Shop - Enchanted items
        'mana_potion': {
            name: 'Mana Potion',
            type: 'consumable',
            description: 'A glowing blue potion. Heals 40 HP.',
            healAmount: 40,
            price: 60,
            sellPrice: 30,
            battleText: '* You drank the Mana Potion.\n* Magic flows through you!'
        },

        'elixir': {
            name: 'Elixir',
            type: 'consumable',
            description: 'A rare elixir. Heals 75 HP.',
            healAmount: 75,
            price: 150,
            sellPrice: 75,
            battleText: '* You drank the Elixir.\n* Pure healing energy!'
        },

        'phoenix_tear': {
            name: 'Phoenix Tear',
            type: 'consumable',
            description: 'A tear from a phoenix. Fully restores HP.',
            healAmount: 999,
            price: 500,
            sellPrice: 250,
            battleText: '* You used the Phoenix Tear.\n* You are fully restored!'
        },

        'enchanted_staff': {
            name: 'Enchanted Staff',
            type: 'weapon',
            description: 'A staff crackling with magic.',
            attack: 12,
            price: 200,
            sellPrice: 100,
            equipText: 'Magic surges through you!'
        },

        'arcane_wand': {
            name: 'Arcane Wand',
            type: 'weapon',
            description: 'A wand of pure arcane energy.',
            attack: 18,
            price: 400,
            sellPrice: 200,
            equipText: 'Reality bends to your will!'
        },

        'mage_robe': {
            name: 'Mage Robe',
            type: 'armor',
            description: 'Enchanted robes of protection. +35 HP',
            defense: 7,
            hpBonus: 35,
            price: 250,
            sellPrice: 125,
            equipText: 'Magic shields you! Max HP +35!'
        },

        'archmage_vestments': {
            name: 'Archmage Vestments',
            type: 'armor',
            description: 'Vestments of a legendary mage. +55 HP',
            defense: 11,
            hpBonus: 55,
            price: 500,
            sellPrice: 250,
            equipText: 'Supreme magical protection! Max HP +55!'
        },

        // Hero's house key
        'house_key': {
            name: "Hero's House Key",
            type: 'key',
            description: 'The key to your new home in the village.',
            price: 0
        },

        // Moderator items (debug/testing)
        'mod_sword': {
            name: 'Moderator Blade',
            type: 'weapon',
            description: 'A blade that exists outside the rules. Infinite damage.',
            attack: 9999,
            price: 0,
            sellPrice: 0,
            equipText: '* You feel the power of a god.'
        },

        'mod_cloak': {
            name: 'Moderator Cloak',
            type: 'armor',
            description: 'A shimmering cloak of pure authority. Infinite HP.',
            defense: 9999,
            hpBonus: 99999,
            price: 0,
            sellPrice: 0,
            equipText: '* Reality bends around you.',
            isMod: true
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
