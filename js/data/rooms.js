/**
 * Room layouts and connections
 */
const Rooms = {
    data: {
        // ==================== INTRO AREA ====================
        'intro_1': {
            name: 'The Fall',
            area: 'descent',
            width: 20,
            height: 15,
            playerStart: { x: 160, y: 200 },
            tiles: [
                // Floor at bottom, walls on sides
                // 0 = floor, 1 = wall, 2 = save point, 3 = door/transition
            ],
            tileData: `
                11111111111111111111
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000003000000001
                11111111111111111111
            `,
            npcs: [
                {
                    id: 'sage',
                    sprite: 'npc',
                    x: 200,
                    y: 180,
                    dialogue: 'intro_guide_meet',
                    dialogueOnce: true,
                    afterDialogue: 'intro_guide_met'
                }
            ],
            transitions: [
                { x: 152, y: 208, width: 16, height: 8, to: 'intro_2', playerX: 160, playerY: 32 }
            ],
            onEnter: 'intro_wake',
            onEnterOnce: true,
            music: null,
            encounterRate: 0.1,
            encounterEnemies: ['dummy']
        },

        'intro_2': {
            name: 'Tutorial Corridor',
            area: 'descent',
            width: 20,
            height: 15,
            playerStart: { x: 160, y: 32 },
            tileData: `
                11111111131111111111
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000200000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000030000000001
                11111111111111111111
            `,
            npcs: [],
            transitions: [
                { x: 152, y: 0, width: 16, height: 8, to: 'intro_1', playerX: 160, playerY: 192 },
                { x: 152, y: 208, width: 16, height: 8, to: 'descent_1', playerX: 160, playerY: 32 }
            ],
            savePoints: [
                { x: 152, y: 104, dialogue: 'descent_save_point' }
            ],
            encounterRate: 0
        },

        // ==================== AREA 1: THE DESCENT ====================
        'descent_1': {
            name: 'The Descent - Entrance',
            area: 'descent',
            width: 25,
            height: 15,
            playerStart: { x: 160, y: 32 },
            tileData: `
                1111111111311111111111111
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                3000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000300000000001
                1111111111111111111111111
            `,
            npcs: [],
            transitions: [
                { x: 160, y: 0, width: 16, height: 16, to: 'intro_2', playerX: 160, playerY: 192 },
                { x: 208, y: 208, width: 16, height: 16, to: 'descent_2', playerX: 32, playerY: 48 },
                { x: 0, y: 96, width: 16, height: 16, to: 'descent_shop', playerX: 200, playerY: 120 }
            ],
            onEnter: 'descent_entrance',
            onEnterOnce: true,
            music: 'descent_theme',
            encounterRate: 0.15,
            encounterEnemies: ['dummy', 'cave_spider']
        },

        'descent_2': {
            name: 'The Descent - Path',
            area: 'descent',
            width: 20,
            height: 20,
            playerStart: { x: 64, y: 32 },
            tileData: `
                11111111111111111111
                13000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000031
                10000000020000000001
                11111111111111111111
            `,
            transitions: [
                { x: 16, y: 16, width: 16, height: 16, to: 'descent_1', playerX: 220, playerY: 192 },
                { x: 288, y: 272, width: 16, height: 16, to: 'descent_3', playerX: 32, playerY: 120 },
                { x: 288, y: 160, width: 16, height: 16, to: 'descent_secret', playerX: 60, playerY: 140 }
            ],
            savePoints: [
                { x: 136, y: 288, dialogue: 'descent_save_point' }
            ],
            encounterRate: 0.15,
            encounterEnemies: ['cave_spider', 'rock_critter']
        },

        'descent_secret': {
            name: 'Hidden Chamber',
            area: 'descent',
            width: 15,
            height: 12,
            playerStart: { x: 60, y: 140 },
            tileData: `
                111111111111111
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                130000000000001
                111111111111111
            `,
            interactables: [
                { x: 100, y: 60, width: 32, height: 32, type: 'lore', dialogue: 'descent_lore_tablet' },
                { x: 100, y: 100, width: 32, height: 24, type: 'hidden_key', dialogue: 'found_crystal_key', requiresFlag: '!got_crystal_key' }
            ],
            transitions: [
                { x: 16, y: 160, width: 16, height: 16, to: 'descent_2', playerX: 270, playerY: 170 }
            ],
            secret: true,
            secretId: 'descent_hidden_chamber',
            encounterRate: 0
        },

        'descent_3': {
            name: 'The Descent - Exit',
            area: 'descent',
            width: 20,
            height: 15,
            playerStart: { x: 32, y: 120 },
            tileData: `
                11111111111111111111
                10000000000000000031
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                13000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                11111111111111111111
            `,
            transitions: [
                { x: 16, y: 112, width: 16, height: 16, to: 'descent_2', playerX: 270, playerY: 260 },
                { x: 288, y: 16, width: 16, height: 16, to: 'caverns_1', playerX: 48, playerY: 120 }
            ],
            encounterRate: 0.15,
            encounterEnemies: ['cave_spider', 'rock_critter']
        },

        // ==================== AREA 2: CRYSTAL CAVERNS ====================
        'caverns_1': {
            name: 'Crystal Caverns - Entrance',
            area: 'caverns',
            width: 25,
            height: 15,
            playerStart: { x: 32, y: 120 },
            tileData: `
                1111111111111111711111111
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1300000000020000000000031
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000000000000000001
                1000000000300000000000001
                1111111111111111111111111
            `,
            transitions: [
                { x: 8, y: 112, width: 8, height: 16, to: 'descent_3', playerX: 288, playerY: 24 },
                { x: 368, y: 112, width: 16, height: 16, to: 'caverns_shop', playerX: 32, playerY: 120 },
                { x: 168, y: 208, width: 16, height: 8, to: 'caverns_2', playerX: 160, playerY: 32 },
                { x: 256, y: 0, width: 16, height: 8, to: 'caverns_treasure', playerX: 120, playerY: 160, requiresItem: 'crystal_key', lockedDialogue: 'locked_door_key' }
            ],
            savePoints: [
                { x: 168, y: 104, dialogue: 'descent_save_point' }
            ],
            onEnter: 'caverns_entrance',
            onEnterOnce: true,
            music: 'caverns_theme',
            encounterRate: 0.15,
            encounterEnemies: ['crystal_bat', 'mushroom_dancer']
        },

        'caverns_treasure': {
            name: 'Crystal Treasury',
            area: 'caverns',
            width: 15,
            height: 12,
            playerStart: { x: 120, y: 160 },
            tileData: `
                111111111111111
                140000000000041
                100000000000001
                140000000000041
                100000000000001
                140000000000041
                100000000000001
                140000000000041
                100000000000001
                140000000000041
                100000000000031
                111111111111111
            `,
            theme: 'crystal',
            decorations: [
                { type: 'crystal_cluster', x: 32, y: 32 },
                { type: 'crystal_cluster', x: 192, y: 32 },
                { type: 'crystal_cluster', x: 32, y: 128 },
                { type: 'crystal_cluster', x: 192, y: 128 }
            ],
            interactables: [
                { x: 96, y: 48, width: 48, height: 32, type: 'treasure_chest', dialogue: 'treasure_chest_crystal', requiresFlag: '!crystal_treasury_opened' },
                { x: 96, y: 48, width: 48, height: 32, type: 'opened_chest', dialogue: 'treasure_chest_opened', requiresFlag: 'crystal_treasury_opened' }
            ],
            transitions: [
                { x: 208, y: 160, width: 16, height: 16, to: 'caverns_1', playerX: 270, playerY: 32 }
            ],
            secret: true,
            secretId: 'crystal_treasury_found',
            encounterRate: 0
        },

        'caverns_shop': {
            name: 'Crystal Shop',
            area: 'caverns',
            width: 15,
            height: 12,
            playerStart: { x: 32, y: 120 },
            tileData: `
                111111111111111
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                130000000000001
                100000000000001
                100000000000001
                100000000000001
                111111111111111
            `,
            npcs: [
                {
                    id: 'glint',
                    sprite: 'npc',
                    x: 180,
                    y: 80,
                    dialogue: 'shopkeeper_intro',
                    dialogueOnce: true,
                    afterDialogue: 'shopkeeper_talk',
                    isShop: true,
                    shopItems: ['crystal_candy', 'moss_sandwich', 'glowing_mushroom', 'spider_cider', 'crystal_dagger', 'crystal_sword', 'torn_cloak', 'crystal_mail', 'travelers_bag']
                }
            ],
            transitions: [
                { x: 16, y: 112, width: 16, height: 16, to: 'caverns_1', playerX: 352, playerY: 120 }
            ],
            encounterRate: 0
        },

        'caverns_2': {
            name: 'Crystal Caverns - Depths',
            area: 'caverns',
            width: 20,
            height: 20,
            playerStart: { x: 160, y: 32 },
            tileData: `
                11111111131111111111
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000030000000001
                11111111111111111111
            `,
            interactables: [
                { x: 80, y: 160, width: 32, height: 32, type: 'piano', dialogue: 'piano_interact' }
            ],
            transitions: [
                { x: 136, y: 0, width: 16, height: 8, to: 'caverns_1', playerX: 168, playerY: 192 },
                { x: 136, y: 296, width: 16, height: 8, to: 'caverns_guardian', playerX: 160, playerY: 32 }
            ],
            encounterRate: 0.15,
            encounterEnemies: ['crystal_bat', 'mushroom_dancer']
        },

        'caverns_guardian': {
            name: 'Crystal Sanctum',
            area: 'caverns',
            width: 20,
            height: 15,
            playerStart: { x: 160, y: 32 },
            tileData: `
                11111111131111111111
                14000004000004000041
                10000000000000000001
                14000000000000000041
                10000000000000000001
                14000000000000000041
                10000000000000000001
                14000000000000000041
                10000000000000000001
                14000000000000000041
                10000000000000000001
                14000000000000000041
                10000000000000000001
                14000004030004000041
                11111111111111111111
            `,
            theme: 'crystal',
            decorations: [
                { type: 'crystal_pillar', x: 48, y: 32 },
                { type: 'crystal_pillar', x: 256, y: 32 },
                { type: 'crystal_pillar', x: 48, y: 160 },
                { type: 'crystal_pillar', x: 256, y: 160 },
                { type: 'crystal_cluster', x: 80, y: 80 },
                { type: 'crystal_cluster', x: 224, y: 80 },
                { type: 'crystal_cluster', x: 80, y: 144 },
                { type: 'crystal_cluster', x: 224, y: 144 }
            ],
            npcs: [
                {
                    id: 'crystal_guardian',
                    sprite: 'crystal_guardian',
                    x: 152,
                    y: 100,
                    dialogue: 'guardian_intro',
                    isBoss: true,
                    enemyId: 'crystal_guardian',
                    blocksPath: true,
                    removeOnSpare: true,
                    removeOnKill: true,
                    interactionRadius: 40
                }
            ],
            transitions: [
                { x: 136, y: 0, width: 16, height: 8, to: 'caverns_2', playerX: 160, playerY: 280 },
                { x: 136, y: 208, width: 16, height: 8, to: 'swamp_1', playerX: 160, playerY: 32, requiresFlag: 'crystal_guardian_spared|crystal_guardian_killed' }
            ],
            encounterRate: 0,
            music: 'boss_theme'
        },

        // ==================== AREA 3: THE MURKY DEPTHS (SWAMP) ====================
        'swamp_1': {
            name: 'The Murky Depths - Entrance',
            area: 'swamp',
            width: 25,
            height: 20,
            playerStart: { x: 160, y: 32 },
            tileData: `
                1111111111311111111111111
                1800000000000000000000081
                1000000000000000000000001
                1800000000000000000000081
                1000000000000000000000001
                1080000000000000000008001
                1000000000000000000000001
                1300000000020000000000031
                1000000000000000000000001
                1080000000000000000008001
                1000000000000000000000001
                1800000000000000000000081
                3000000000000000000000001
                1800000000000000000000081
                1000000000000000000000001
                1800000000000000000000081
                1000000000000000000000001
                1800000000000000000000081
                1000000000030000000000001
                1111111111111111111111111
            `,
            theme: 'swamp',
            decorations: [
                { type: 'swamp_tree', x: 48, y: 48 },
                { type: 'swamp_tree', x: 336, y: 48 },
                { type: 'swamp_tree', x: 336, y: 200 },
                { type: 'lily_pad', x: 120, y: 80 },
                { type: 'lily_pad', x: 264, y: 80 },
                { type: 'lily_pad', x: 120, y: 240 },
                { type: 'lily_pad', x: 264, y: 240 }
            ],
            npcs: [
                {
                    id: 'swamp_guide',
                    sprite: 'npc',
                    x: 280,
                    y: 100,
                    dialogue: 'swamp_guide_intro',
                    dialogueOnce: true,
                    afterDialogue: 'swamp_guide_hint'
                }
            ],
            transitions: [
                { x: 160, y: 0, width: 16, height: 16, to: 'caverns_guardian', playerX: 160, playerY: 192 },
                { x: 16, y: 112, width: 16, height: 16, to: 'swamp_2', playerX: 260, playerY: 120 },
                { x: 368, y: 112, width: 16, height: 16, to: 'swamp_3', playerX: 60, playerY: 120 },
                { x: 176, y: 288, width: 16, height: 16, to: 'swamp_4', playerX: 160, playerY: 48 },
                { x: 0, y: 192, width: 16, height: 16, to: 'swamp_shop', playerX: 200, playerY: 120 }
            ],
            savePoints: [
                { x: 168, y: 104, dialogue: 'swamp_save_point' }
            ],
            onEnter: 'swamp_entrance',
            onEnterOnce: true,
            music: 'swamp_theme',
            encounterRate: 0.15,
            encounterEnemies: ['swamp_creature', 'ancient_spirit']
        },

        'swamp_2': {
            name: 'Twisted Grotto',
            area: 'swamp',
            width: 20,
            height: 15,
            playerStart: { x: 288, y: 120 },
            tileData: `
                11111111111111111111
                18000000000000000081
                10000000000000000001
                18000000000000000081
                10000000000000000001
                18000000000000000081
                10000000000000000001
                10000000000000000031
                10000000000000000001
                18000000000000000081
                10000000000000000001
                18000000000000000081
                10000000000000000001
                18000000000000000081
                11111111111111111111
            `,
            theme: 'swamp',
            decorations: [
                { type: 'swamp_tree', x: 64, y: 32 },
                { type: 'swamp_tree', x: 64, y: 160 },
                { type: 'mushroom_cluster', x: 160, y: 80 },
                { type: 'mushroom_cluster', x: 160, y: 160 }
            ],
            interactables: [
                { x: 80, y: 100, width: 32, height: 32, type: 'lore', dialogue: 'swamp_lore_tablet' },
                { x: 200, y: 140, width: 32, height: 32, type: 'fairy_ring', dialogue: 'fairy_ring_interact', dialogueOnce: true, afterDialogue: 'fairy_ring_return' }
            ],
            transitions: [
                { x: 288, y: 112, width: 16, height: 16, to: 'swamp_1', playerX: 50, playerY: 120 }
            ],
            encounterRate: 0.2,
            encounterEnemies: ['swamp_creature', 'mushroom_dancer']
        },

        'swamp_3': {
            name: 'Foggy Marsh',
            area: 'swamp',
            width: 20,
            height: 15,
            playerStart: { x: 32, y: 120 },
            tileData: `
                11111111111111111111
                18000000000000000081
                10000000000000000001
                18000000000000000081
                10000000000000000001
                18000000000000000081
                10000000000000000001
                13000000002000000001
                10000000000000000001
                18000000000000000081
                10000000000000000001
                18000000000000000081
                10000000000000000001
                18000000000000000081
                11111111111111111111
            `,
            theme: 'swamp',
            decorations: [
                { type: 'swamp_tree', x: 240, y: 32 },
                { type: 'swamp_tree', x: 240, y: 160 },
                { type: 'lily_pad', x: 120, y: 60 },
                { type: 'lily_pad', x: 180, y: 140 }
            ],
            npcs: [
                {
                    id: 'lost_spirit',
                    sprite: 'npc',
                    x: 200,
                    y: 100,
                    dialogue: 'lost_spirit_talk',
                    dialogueOnce: true,
                    afterDialogue: 'lost_spirit_hint'
                }
            ],
            interactables: [
                { x: 260, y: 160, width: 32, height: 24, type: 'mystic_pool', dialogue: 'mystic_pool_interact', dialogueOnce: true, afterDialogue: 'mystic_pool_return' }
            ],
            transitions: [
                { x: 8, y: 104, width: 32, height: 32, to: 'swamp_1', playerX: 350, playerY: 120 }
            ],
            savePoints: [
                { x: 136, y: 104, dialogue: 'swamp_save_point' }
            ],
            encounterRate: 0.2,
            encounterEnemies: ['ancient_spirit', 'swamp_creature']
        },

        'swamp_4': {
            name: 'The Sunken Path',
            area: 'swamp',
            width: 25,
            height: 15,
            playerStart: { x: 160, y: 32 },
            tileData: `
                1111111111311111111111111
                1800000000000000000000081
                1000000000000000000000001
                1800000000000000000000081
                1000000000000000000000001
                1800000000000000000000081
                1000000000000000000000001
                1080000000000000000008001
                1000000000000000000000001
                1800000000000000000000081
                1000000000000000000000001
                1800000000000000000000081
                1000000000000000000000001
                1300000000030000000000071
                1111111111111111111111111
            `,
            theme: 'swamp',
            decorations: [
                { type: 'swamp_tree', x: 48, y: 48 },
                { type: 'swamp_tree', x: 336, y: 48 },
                { type: 'bone_pile', x: 180, y: 100 },
                { type: 'skull', x: 200, y: 100 }
            ],
            transitions: [
                { x: 160, y: 0, width: 16, height: 16, to: 'swamp_1', playerX: 184, playerY: 260 },
                { x: 16, y: 208, width: 16, height: 16, to: 'swamp_keeper', playerX: 260, playerY: 120 },
                { x: 176, y: 208, width: 16, height: 16, to: 'keeper_shrine', playerX: 120, playerY: 48 },
                { x: 368, y: 208, width: 16, height: 16, to: 'mega_chamber', playerX: 240, playerY: 48, requiresItem: 'keeper_key', lockedDialogue: 'locked_door_keeper' }
            ],
            encounterRate: 0.15,
            encounterEnemies: ['ancient_spirit', 'swamp_creature']
        },

        'swamp_keeper': {
            name: 'The Keeper\'s Lair',
            area: 'swamp',
            width: 20,
            height: 20,
            playerStart: { x: 288, y: 120 },
            tileData: `
                11111111111111111111
                15000000000000000051
                10000000000000000001
                15000000000000000051
                10000000000000000001
                15000000000000000051
                10000000000000000001
                10000000000000000031
                10000000000000000001
                15000000000000000051
                10000000000000000001
                15000000000000000051
                10000000000000000001
                15000000000000000051
                10000000000000000001
                15000000020000000051
                10000000000000000001
                15000000000000000051
                10000000000000000001
                11111111111111111111
            `,
            theme: 'dark',
            decorations: [
                { type: 'skull', x: 48, y: 48 },
                { type: 'skull', x: 256, y: 48 },
                { type: 'skull', x: 48, y: 240 },
                { type: 'skull', x: 256, y: 240 },
                { type: 'bone_pile', x: 80, y: 120 },
                { type: 'bone_pile', x: 224, y: 120 },
                { type: 'dark_pillar', x: 32, y: 80 },
                { type: 'dark_pillar', x: 272, y: 80 },
                { type: 'dark_pillar', x: 32, y: 200 },
                { type: 'dark_pillar', x: 272, y: 200 }
            ],
            npcs: [
                {
                    id: 'the_keeper',
                    sprite: 'the_keeper',
                    x: 152,
                    y: 100,
                    dialogue: 'keeper_intro',
                    isBoss: true,
                    enemyId: 'the_keeper',
                    blocksPath: true,
                    removeOnSpare: true,
                    removeOnKill: true,
                    interactionRadius: 40
                }
            ],
            transitions: [
                { x: 288, y: 112, width: 16, height: 16, to: 'swamp_4', playerX: 32, playerY: 200 }
            ],
            savePoints: [
                { x: 136, y: 240, dialogue: 'keeper_save_point' }
            ],
            onEnter: 'keeper_lair_enter',
            onEnterOnce: true,
            encounterRate: 0,
            music: 'boss_theme'
        },

        'keeper_shrine': {
            name: 'Shrine of Wisdom',
            area: 'swamp',
            width: 15,
            height: 10,
            playerStart: { x: 120, y: 32 },
            tileData: `
                111111131111111
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                111111111111111
            `,
            theme: 'dark',
            decorations: [
                { type: 'skull', x: 32, y: 48 },
                { type: 'skull', x: 192, y: 48 },
                { type: 'dark_pillar', x: 48, y: 80 },
                { type: 'dark_pillar', x: 176, y: 80 }
            ],
            npcs: [
                {
                    id: 'shrine_spirit',
                    sprite: 'npc',
                    x: 112,
                    y: 80,
                    dialogue: 'shrine_spirit_intro',
                    dialogueOnce: true,
                    afterDialogue: 'shrine_spirit_advice'
                }
            ],
            transitions: [
                { x: 104, y: 0, width: 16, height: 16, to: 'swamp_4', playerX: 168, playerY: 190 }
            ],
            encounterRate: 0
        },

        // ==================== MEGA BOSS ====================
        'mega_chamber': {
            name: 'The Core Chamber',
            area: 'mega',
            width: 30,
            height: 20,
            playerStart: { x: 240, y: 32 },
            tileData: `
                111111111111131111111111111111
                160000000000000000000000000061
                100000000000000000000000000001
                160000000000000000000000000061
                100000000000000000000000000001
                160000000000000000000000000061
                100000000000000000000000000001
                160000000000000000000000000061
                100000000000000000000000000001
                160000000000000000000000000061
                100000000000000000000000000001
                160000000000000000000000000061
                100000000000000000000000000001
                160000000000000000000000000061
                100000000000000000000000000001
                160000000000020000000000000061
                100000000000000000000000000001
                160000000000000000000000000061
                100000000000070000000000000001
                111111111111111111111111111111
            `,
            theme: 'tech',
            decorations: [
                { type: 'tech_pillar', x: 64, y: 48 },
                { type: 'tech_pillar', x: 416, y: 48 },
                { type: 'tech_pillar', x: 64, y: 160 },
                { type: 'tech_pillar', x: 416, y: 160 },
                { type: 'tech_pillar', x: 64, y: 272 },
                { type: 'tech_pillar', x: 416, y: 272 },
                { type: 'energy_conduit', x: 160, y: 80 },
                { type: 'energy_conduit', x: 320, y: 80 },
                { type: 'energy_conduit', x: 160, y: 200 },
                { type: 'energy_conduit', x: 320, y: 200 },
                { type: 'core_terminal', x: 224, y: 240 }
            ],
            npcs: [
                {
                    id: 'mega_destroyer',
                    sprite: 'mega_destroyer',
                    x: 208,
                    y: 120,
                    width: 64,
                    height: 64,
                    dialogue: 'mega_boss_intro',
                    isBoss: true,
                    isMegaBoss: true,
                    enemyId: 'mega_destroyer',
                    blocksPath: true,
                    removeOnSpare: true,
                    removeOnKill: true,
                    interactionRadius: 56
                }
            ],
            transitions: [
                { x: 232, y: 0, width: 16, height: 8, to: 'hall_final', playerX: 200, playerY: 280 },
                { x: 224, y: 296, width: 16, height: 8, to: 'next_level', playerX: 160, playerY: 32, requiresItem: 'mega_core', lockedDialogue: 'locked_door_core' }
            ],
            savePoints: [
                { x: 224, y: 240, dialogue: 'mega_save_point' }
            ],
            encounterRate: 0,
            music: 'mega_boss_theme'
        },

        'next_level': {
            name: 'Beyond...',
            area: 'next',
            width: 20,
            height: 15,
            playerStart: { x: 160, y: 32 },
            tileData: `
                11111111131111111111
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000020000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                10000000000000000001
                11111111111111111111
            `,
            npcs: [
                {
                    id: 'congratulations',
                    sprite: 'npc',
                    x: 160,
                    y: 160,
                    dialogue: 'next_level_intro'
                }
            ],
            transitions: [
                { x: 136, y: 0, width: 16, height: 8, to: 'mega_chamber', playerX: 200, playerY: 280 }
            ],
            savePoints: [
                { x: 136, y: 104, dialogue: 'descent_save_point' }
            ],
            encounterRate: 0,
            music: 'victory_theme'
        },

        // ==================== SHOP ROOMS ====================
        'descent_shop': {
            name: 'Dusty Hollow Shop',
            area: 'descent',
            width: 15,
            height: 12,
            playerStart: { x: 32, y: 120 },
            tileData: `
                111111111111111
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                130000000000001
                100000000000001
                100000000000001
                100000000000001
                111111111111111
            `,
            npcs: [
                {
                    id: 'dusty',
                    sprite: 'npc',
                    x: 180,
                    y: 80,
                    dialogue: 'descent_shopkeeper_intro',
                    dialogueOnce: true,
                    afterDialogue: 'descent_shopkeeper_talk',
                    isShop: true,
                    shopItems: ['cave_water', 'crystal_candy', 'moss_sandwich', 'worn_notebook', 'torn_cloak', 'small_pouch']
                }
            ],
            transitions: [
                { x: 16, y: 112, width: 16, height: 16, to: 'descent_1', playerX: 32, playerY: 104 }
            ],
            encounterRate: 0
        },

        'swamp_shop': {
            name: 'Murky Market',
            area: 'swamp',
            width: 15,
            height: 12,
            playerStart: { x: 32, y: 120 },
            tileData: `
                111111111111111
                180000000000081
                100000000000001
                180000000000081
                100000000000001
                180000000000081
                100000000000001
                130000000000001
                100000000000001
                180000000000081
                100000000000001
                111111111111111
            `,
            theme: 'swamp',
            npcs: [
                {
                    id: 'bogsworth',
                    sprite: 'npc',
                    x: 180,
                    y: 80,
                    dialogue: 'swamp_shopkeeper_intro',
                    dialogueOnce: true,
                    afterDialogue: 'swamp_shopkeeper_talk',
                    isShop: true,
                    shopItems: ['glowing_mushroom', 'spider_cider', 'ancient_fruit', 'ancient_blade', 'ancient_robe', 'explorers_pack', 'dimensional_satchel']
                }
            ],
            transitions: [
                { x: 16, y: 112, width: 16, height: 16, to: 'swamp_1', playerX: 32, playerY: 200 }
            ],
            encounterRate: 0
        },

        // Developer room (easter egg)
        'dev_room': {
            name: '???',
            area: 'secret',
            width: 15,
            height: 12,
            playerStart: { x: 120, y: 160 },
            tileData: `
                111111111111111
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000031
                111111111111111
            `,
            npcs: [
                {
                    id: 'developer',
                    sprite: 'npc',
                    x: 120,
                    y: 80,
                    dialogue: 'dev_room'
                }
            ],
            transitions: [
                { x: 224, y: 152, width: 8, height: 16, to: 'hall_1', playerX: 32, playerY: 32 }
            ],
            secret: true,
            secretId: 'dev_room_found',
            encounterRate: 0
        }
    },

    /**
     * Get room by ID
     */
    get(roomId) {
        return this.data[roomId] || null;
    },

    /**
     * Check if room exists
     */
    exists(roomId) {
        return roomId in this.data;
    },

    /**
     * Parse tile data string into 2D array
     */
    parseTileData(room) {
        if (!room.tileData) return [];

        const lines = room.tileData.trim().split('\n');
        const tiles = [];

        for (const line of lines) {
            const row = [];
            const trimmed = line.trim();
            for (const char of trimmed) {
                row.push(parseInt(char, 10));
            }
            tiles.push(row);
        }

        return tiles;
    },

    /**
     * Get tile at position
     */
    getTile(room, tileX, tileY) {
        const tiles = this.parseTileData(room);
        if (tileY < 0 || tileY >= tiles.length) return 1; // Wall
        if (tileX < 0 || tileX >= tiles[tileY].length) return 1; // Wall
        return tiles[tileY][tileX];
    },

    /**
     * Check if position is walkable
     */
    isWalkable(room, x, y, width = 12, height = 12) {
        const tileSize = 16;

        // Check all corners of the hitbox
        const corners = [
            { x: x, y: y },
            { x: x + width - 1, y: y },
            { x: x, y: y + height - 1 },
            { x: x + width - 1, y: y + height - 1 }
        ];

        for (const corner of corners) {
            const tileX = Math.floor(corner.x / tileSize);
            const tileY = Math.floor(corner.y / tileSize);
            const tile = this.getTile(room, tileX, tileY);

            if (tile === 1) return false; // Wall
        }

        return true;
    },

    /**
     * Get all rooms in an area
     */
    getRoomsInArea(areaId) {
        const rooms = [];
        for (const [id, room] of Object.entries(this.data)) {
            if (room.area === areaId) {
                rooms.push({ id, ...room });
            }
        }
        return rooms;
    }
};

// Make it globally available
window.Rooms = Rooms;
