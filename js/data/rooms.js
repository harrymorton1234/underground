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
            encounterEnemies: ['cave_spider']
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
            encounterEnemies: ['cave_spider']
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
                { x: 16, y: 112, width: 16, height: 16, to: 'descent_3', playerX: 270, playerY: 32 },
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
                { x: 80, y: 160, width: 32, height: 32, type: 'piano', dialogue: 'piano_interact' },
                { x: 0, y: 144, width: 16, height: 24, type: 'secret_door', dialogue: null, requiresFlag: 'piano_secret_complete' }
            ],
            transitions: [
                { x: 136, y: 0, width: 16, height: 8, to: 'caverns_1', playerX: 168, playerY: 192 },
                { x: 136, y: 296, width: 16, height: 8, to: 'caverns_guardian', playerX: 160, playerY: 32 },
                { x: 0, y: 144, width: 8, height: 24, to: 'caverns_secret', playerX: 168, playerY: 80, requiresFlag: 'piano_secret_complete' }
            ],
            encounterRate: 0.15,
            encounterEnemies: ['crystal_bat', 'mushroom_dancer']
        },

        'caverns_secret': {
            name: 'Hidden Chamber',
            area: 'caverns',
            width: 12,
            height: 10,
            playerStart: { x: 168, y: 80 },
            tileData: `
                111111111111
                100000000001
                100000000001
                100000000001
                100000000001
                100000000031
                100000000001
                100000000001
                100000000001
                111111111111
            `,
            decorations: [
                { x: 16, y: 16, type: 'crystal_formation' },
                { x: 160, y: 16, type: 'crystal_formation' },
                { x: 80, y: 24, type: 'ancient_plaque' }
            ],
            interactables: [
                { x: 64, y: 32, width: 48, height: 32, type: 'lore_plaque', dialogue: 'secret_chamber_lore', dialogueOnce: true, afterDialogue: 'secret_chamber_lore_read' }
            ],
            transitions: [
                { x: 184, y: 80, width: 8, height: 24, to: 'caverns_2', playerX: 24, playerY: 152 }
            ],
            encounterRate: 0
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
                { x: 368, y: 208, width: 16, height: 16, to: 'mega_chamber', playerX: 200, playerY: 48, requiresItem: 'keeper_key', lockedDialogue: 'locked_door_keeper' }
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
                { x: 208, y: 0, width: 16, height: 16, to: 'swamp_4', playerX: 352, playerY: 190 },
                { x: 224, y: 296, width: 16, height: 8, to: 'next_level', playerX: 72, playerY: 32, requiresItem: 'mega_core', lockedDialogue: 'locked_door_core' }
            ],
            savePoints: [
                { x: 224, y: 240, dialogue: 'mega_save_point' }
            ],
            encounterRate: 0,
            music: 'mega_boss_theme'
        },

        'next_level': {
            name: 'Small Chamber',
            area: 'next',
            width: 10,
            height: 8,
            playerStart: { x: 80, y: 32 },
            tileData: `
                1111311111
                1000000001
                1000000001
                1000000001
                1000000001
                1000000001
                1000030001
                1111111111
            `,
            npcs: [
                {
                    id: 'mysterious_guide',
                    sprite: 'npc',
                    x: 80,
                    y: 64,
                    dialogue: 'village_intro',
                    dialogueOnce: true,
                    afterDialogue: 'guide_follow',
                    appearance: { type: 'mysterious', skinColor: '#aac', bodyColor: '#446', hairColor: '#668' },
                    requiresFlag: '!village_intro_seen'
                }
            ],
            decorations: [
                { type: 'lantern', x: 32, y: 40 },
                { type: 'lantern', x: 128, y: 40 }
            ],
            transitions: [
                { x: 64, y: 0, width: 16, height: 8, to: 'mega_chamber', playerX: 200, playerY: 280 },
                { x: 64, y: 96, width: 16, height: 16, to: 'village_staircase', playerX: 48, playerY: 32 }
            ],
            encounterRate: 0,
            music: null
        },

        // ==================== HAVEN VILLAGE ====================
        'village_staircase': {
            name: 'Dark Passage',
            area: 'village',
            width: 6,
            height: 25,
            playerStart: { x: 48, y: 32 },
            tileData: `
                113111
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100001
                100031
                111111
            `,
            npcs: [],
            decorations: [
                // Just a few dim lanterns - keep it mysterious
                { type: 'lantern', x: 16, y: 80 },
                { type: 'lantern', x: 64, y: 180 },
                { type: 'lantern', x: 16, y: 280 }
            ],
            transitions: [
                { x: 32, y: 0, width: 16, height: 8, to: 'next_level', playerX: 80, playerY: 80 },
                { x: 48, y: 384, width: 16, height: 16, to: 'village_square', playerX: 80, playerY: 32 }
            ],
            encounterRate: 0,
            music: null
        },

        'village_square': {
            name: 'Haven Market Street',
            area: 'village',
            width: 10,
            height: 28,
            playerStart: { x: 80, y: 32 },
            tileData: `
                1111311111
                1000000001
                1000000001
                3000000003
                1000000001
                1000000001
                1000000001
                3000000003
                1000000001
                1000000001
                1000000001
                1000000001
                1000020001
                1000000001
                1000000001
                1000000001
                3000000003
                1000000001
                1000000001
                1000000001
                3000000003
                1000000001
                1000000001
                1000000001
                1000000001
                1000000001
                1000030001
                1111111111
            `,
            decorations: [
                // Signs along the path showing shop/house names with themed colors and icons
                { type: 'sign', x: 18, y: 36, text: 'Butcher', color: '#a66', borderColor: '#744', icon: 'meat' },
                { type: 'sign', x: 18, y: 100, text: 'Blacksmith', color: '#777', borderColor: '#555', icon: 'sword' },
                { type: 'sign', x: 18, y: 308, text: 'Your Home', color: '#a86', borderColor: '#754', icon: 'home' },
                { type: 'sign', x: 98, y: 100, text: 'Magic Shop', color: '#86a', borderColor: '#547', textColor: '#edf', icon: 'star' },
                { type: 'sign', x: 98, y: 244, text: 'Bank', color: '#aa8', borderColor: '#886', textColor: '#432', icon: 'coin' },

                // Lanterns on walls - alternating sides for cozy lighting
                { type: 'lantern', x: 16, y: 8 },
                { type: 'lantern', x: 128, y: 8 },
                { type: 'lantern', x: 16, y: 72 },
                { type: 'lantern', x: 128, y: 72 },
                { type: 'lantern', x: 16, y: 152 },
                { type: 'lantern', x: 128, y: 152 },
                { type: 'lantern', x: 16, y: 232 },
                { type: 'lantern', x: 128, y: 232 },
                { type: 'lantern', x: 16, y: 312 },
                { type: 'lantern', x: 128, y: 312 },
                { type: 'lantern', x: 16, y: 392 },
                { type: 'lantern', x: 128, y: 392 },

                // Entrance archway
                { type: 'cave_entrance', x: 56, y: -24 }
            ],
            npcs: [
                {
                    id: 'village_elder',
                    sprite: 'npc',
                    x: 80,
                    y: 180,
                    dialogue: 'village_crowning',
                    dialogueOnce: true,
                    afterDialogue: 'village_elder_talk',
                    appearance: { type: 'elder', skinColor: '#e9c', bodyColor: '#a48', hairColor: '#ccc' }
                },
                {
                    id: 'villager_1',
                    sprite: 'npc',
                    x: 48,
                    y: 260,
                    dialogue: 'village_citizen_1',
                    appearance: { type: 'villager', skinColor: '#fa8', bodyColor: '#5a5', hairColor: '#532', accentColor: '#484' }
                },
                {
                    id: 'villager_2',
                    sprite: 'npc',
                    x: 112,
                    y: 340,
                    dialogue: 'village_citizen_2',
                    appearance: { type: 'villager', skinColor: '#ec9', bodyColor: '#68a', hairColor: '#421', accentColor: '#457' }
                },
                {
                    id: 'village_child',
                    sprite: 'npc',
                    x: 80,
                    y: 400,
                    dialogue: 'village_child',
                    appearance: { type: 'child', skinColor: '#fb9', bodyColor: '#e94', hairColor: '#741' }
                },
                {
                    id: 'fred',
                    sprite: 'npc',
                    x: 48,
                    y: 140,
                    dialogue: 'fred_talk',
                    appearance: { type: 'crazy_eye', skinColor: '#da9', bodyColor: '#486', hairColor: '#732', eyeOffset: 2 }
                }
            ],
            transitions: [
                // Top - back to staircase
                { x: 64, y: 0, width: 16, height: 8, to: 'village_staircase', playerX: 48, playerY: 368 },
                // Left doors - Butcher (row 3), Blacksmith (row 7), House (row 20)
                { x: 0, y: 48, width: 8, height: 16, to: 'village_butcher', playerX: 200, playerY: 100 },
                { x: 0, y: 112, width: 8, height: 16, to: 'village_blacksmith', playerX: 200, playerY: 100 },
                { x: 0, y: 320, width: 8, height: 16, to: 'village_house', playerX: 120, playerY: 32, requiresFlag: 'has_house', lockedDialogue: 'house_not_yours' },
                // Right doors - Magic shop (row 7), Bank (row 16)
                { x: 152, y: 112, width: 8, height: 16, to: 'village_magic', playerX: 32, playerY: 100 },
                { x: 152, y: 256, width: 8, height: 16, to: 'village_bank', playerX: 32, playerY: 100 }
            ],
            interactables: [],
            savePoints: [
                { x: 64, y: 196, dialogue: 'village_save_point' }
            ],
            encounterRate: 0,
            music: 'music_village'
        },

        'village_butcher': {
            name: 'Gristles Meats',
            area: 'village',
            width: 15,
            height: 12,
            playerStart: { x: 200, y: 120 },
            tileData: `
                111111111111111
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000031
                100000000000001
                100000000000001
                100000000000001
                111111111111111
            `,
            decorations: [
                // Hanging meats from ceiling
                { type: 'meat_hook', x: 30, y: 16 },
                { type: 'meat_hook', x: 70, y: 16 },
                { type: 'ham_leg', x: 110, y: 16 },
                { type: 'sausage_string', x: 140, y: 20 },

                // Butcher counter with display
                { type: 'meat_counter', x: 24, y: 70 },

                // Cleaver rack on back wall
                { type: 'cleaver_rack', x: 100, y: 24 },

                // Chopping block
                { type: 'chopping_block', x: 140, y: 50 },

                // Barrel for salt/brine
                { type: 'barrel', x: 180, y: 40 },

                // Shelf with wrapped meats
                { type: 'meat_shelf', x: 24, y: 110 },

                // Blood stains on floor (it's a butcher shop after all)
                { type: 'blood_stain', x: 80, y: 90 },
                { type: 'blood_stain', x: 150, y: 70, size: 2 },
                { type: 'blood_stain', x: 50, y: 140, size: 1 },

                // Warm lantern lighting
                { type: 'lantern', x: 16, y: 50 },
                { type: 'lantern', x: 200, y: 80 }
            ],
            npcs: [
                {
                    id: 'butcher',
                    sprite: 'npc',
                    x: 60,
                    y: 80,
                    dialogue: 'butcher_intro',
                    dialogueOnce: true,
                    afterDialogue: 'butcher_talk',
                    isShop: true,
                    shopItems: ['smoked_sausage', 'raw_steak', 'meat_pie', 'cooked_roast', 'legendary_feast'],
                    appearance: { type: 'butcher', skinColor: '#fa8', bodyColor: '#833', hairColor: '#421' }
                }
            ],
            transitions: [
                { x: 224, y: 104, width: 16, height: 16, to: 'village_square', playerX: 24, playerY: 56 }
            ],
            encounterRate: 0,
            music: 'music_village'
        },

        'village_blacksmith': {
            name: 'Hammerstones Forge',
            area: 'village',
            width: 15,
            height: 12,
            playerStart: { x: 200, y: 100 },
            tileData: `
                111111111111111
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000001
                100000000000031
                100000000000001
                100000000000001
                100000000000001
                111111111111111
            `,
            decorations: [
                // Main forge with flames and chimney (left side)
                { type: 'forge', x: 24, y: 30 },

                // Bellows next to forge
                { type: 'bellows', x: 70, y: 50 },

                // Coal pile near forge
                { type: 'coal_pile', x: 24, y: 70 },

                // Anvil in center workspace
                { type: 'anvil', x: 110, y: 70 },

                // Hot metal on the anvil
                { type: 'hot_metal', x: 114, y: 68 },

                // Quench barrel near anvil
                { type: 'quench_barrel', x: 150, y: 50 },

                // Tool rack on back wall
                { type: 'tool_rack', x: 40, y: 20 },

                // Weapon display rack on back wall
                { type: 'weapon_rack', x: 90, y: 20 },

                // Armor stand on back wall (moved from corner)
                { type: 'armor_stand', x: 145, y: 20 },

                // Sword being worked on near forge
                { type: 'sword_in_progress', x: 60, y: 100 },

                // Warm lighting
                { type: 'lantern', x: 16, y: 100 },
                { type: 'lantern', x: 180, y: 40 }
            ],
            npcs: [
                {
                    id: 'blacksmith',
                    sprite: 'npc',
                    x: 80,
                    y: 90,
                    dialogue: 'blacksmith_intro',
                    dialogueOnce: true,
                    afterDialogue: 'blacksmith_talk',
                    isShop: true,
                    shopItems: ['iron_sword', 'steel_blade', 'hero_sword', 'dragonslayer', 'iron_armor', 'steel_plate', 'hero_armor'],
                    appearance: { type: 'blacksmith', skinColor: '#c96', bodyColor: '#555', hairColor: '#a64' }
                }
            ],
            transitions: [
                { x: 224, y: 104, width: 16, height: 16, to: 'village_square', playerX: 24, playerY: 120 }
            ],
            encounterRate: 0,
            music: 'music_village'
        },

        'village_magic': {
            name: 'Mystaras Arcana',
            area: 'village',
            width: 15,
            height: 12,
            playerStart: { x: 32, y: 100 },
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
            decorations: [
                // Crystal ball on pedestal - centerpiece
                { type: 'crystal_ball', x: 100, y: 60 },

                // Potion shelf on back wall
                { type: 'potion_shelf', x: 40, y: 20 },

                // Spellbook on stand
                { type: 'spellbook_stand', x: 150, y: 40 },

                // Magic circle on floor
                { type: 'magic_circle', x: 60, y: 100 },

                // Wand display case
                { type: 'wand_display', x: 180, y: 20 },

                // Bubbling cauldron
                { type: 'cauldron', x: 140, y: 100 },

                // Floating candles
                { type: 'floating_candles', x: 80, y: 30 },
                { type: 'floating_candles', x: 160, y: 70 },

                // Star chart on wall
                { type: 'star_chart', x: 100, y: 20 },

                // Rune stones
                { type: 'rune_stone', x: 30, y: 70 },
                { type: 'rune_stone', x: 200, y: 90 },

                // Crystal clusters in corners
                { type: 'crystal_cluster', x: 20, y: 140 },
                { type: 'crystal_cluster', x: 200, y: 140 }
            ],
            npcs: [
                {
                    id: 'mage',
                    sprite: 'npc',
                    x: 120,
                    y: 100,
                    dialogue: 'magic_intro',
                    dialogueOnce: true,
                    afterDialogue: 'magic_talk',
                    isShop: true,
                    shopItems: ['mana_potion', 'elixir', 'phoenix_tear', 'enchanted_staff', 'arcane_wand', 'mage_robe', 'archmage_vestments'],
                    appearance: { type: 'mage', skinColor: '#e9d', bodyColor: '#63c', hairColor: '#a7f' }
                }
            ],
            transitions: [
                { x: 16, y: 112, width: 16, height: 16, to: 'village_square', playerX: 120, playerY: 120 }
            ],
            encounterRate: 0,
            music: 'music_village'
        },

        'village_house': {
            name: 'Your Home',
            area: 'village',
            width: 15,
            height: 12,
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
                100000000000001
                100000000000001
                111111111111111
            `,
            onEnter: 'house_enter',
            onEnterOnce: true,
            decorations: [
                // Warm cozy lighting
                { type: 'lantern', x: 40, y: 20 },
                { type: 'lantern', x: 120, y: 20 },
                { type: 'lantern', x: 200, y: 20 },
                // Fireplace glow (using lantern for warm light)
                { type: 'lantern', x: 110, y: 140 },
                // Small rug (decorative)
                { type: 'crystal_cluster', x: 100, y: 100 }
            ],
            interactables: [
                // Cozy bed in corner
                { x: 20, y: 40, width: 32, height: 24, type: 'bed', dialogue: 'house_bed' },
                // Trophy case for awards
                { x: 20, y: 100, width: 28, height: 48, type: 'trophy_case', dialogue: 'house_trophy' },
                // Kitchen area with food storage
                { x: 180, y: 40, width: 32, height: 32, type: 'kitchen', dialogue: 'house_kitchen' },
                // Armor chest
                { x: 60, y: 100, width: 24, height: 20, type: 'armor_chest', dialogue: 'house_armor_chest' },
                // Weapon chest
                { x: 100, y: 100, width: 24, height: 20, type: 'weapon_chest', dialogue: 'house_weapon_chest' },
                // Mirror
                { x: 80, y: 30, width: 16, height: 24, type: 'mirror', dialogue: 'house_mirror' }
            ],
            transitions: [
                { x: 112, y: 0, width: 16, height: 8, to: 'village_square', playerX: 24, playerY: 328 }
            ],
            savePoints: [
                { x: 120, y: 150, dialogue: 'house_save' }
            ],
            encounterRate: 0,
            music: 'music_village'
        },

        'village_bank': {
            name: 'Haven Vault & Trust',
            area: 'village',
            width: 15,
            height: 12,
            playerStart: { x: 32, y: 100 },
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
            decorations: [
                // Bank counter
                { type: 'bank_counter', x: 80, y: 40 },

                // Ornate pillars
                { type: 'bank_pillar', x: 24, y: 30 },
                { type: 'bank_pillar', x: 180, y: 30 },

                // Vault door in back
                { type: 'vault_door', x: 90, y: 100 },

                // Gold piles and money bags
                { type: 'gold_pile', x: 40, y: 100 },
                { type: 'gold_pile', x: 170, y: 110 },
                { type: 'money_bag', x: 60, y: 120 },
                { type: 'money_bag', x: 150, y: 105 },

                // Coin stacks on counter
                { type: 'coin_stack', x: 90, y: 35 },
                { type: 'coin_stack', x: 110, y: 35 },

                // Ledger book
                { type: 'ledger_book', x: 130, y: 38 },

                // Warm lighting
                { type: 'lantern', x: 16, y: 20 },
                { type: 'lantern', x: 200, y: 20 }
            ],
            npcs: [
                {
                    id: 'banker',
                    sprite: 'npc',
                    x: 100,
                    y: 60,
                    dialogue: 'banker_intro',
                    dialogueOnce: true,
                    afterDialogue: 'banker_talk',
                    isBank: true,
                    appearance: { type: 'banker', skinColor: '#eca', bodyColor: '#224', hairColor: '#444' }
                }
            ],
            transitions: [
                { x: 16, y: 112, width: 16, height: 16, to: 'village_square', playerX: 120, playerY: 264 }
            ],
            encounterRate: 0,
            music: 'music_village'
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
