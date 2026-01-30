/**
 * Enemy definitions and battle data
 */
const Enemies = {
    data: {
        // ==================== AREA 1 ENEMIES ====================
        'dummy': {
            name: 'Training Dummy',
            hp: 10,
            maxHp: 10,
            attack: 0,
            defense: 0,
            exp: 0,
            gold: 0,
            flavorText: '* A cotton heart and button eyes.',
            checkText: '* TRAINING DUMMY - ATK 0 DEF 0\n* A practice target. It stands motionless.',
            canSpare: true,
            spareCondition: 'always',
            actOptions: ['Check', 'Talk', 'Hit'],
            actResponses: {
                'Talk': {
                    text: "* You tried talking.\n* It doesn't seem much for conversation.",
                    spareable: false
                },
                'Hit': {
                    text: "* You hit the dummy!\n* It doesn't react.",
                    damage: 0,
                    spareable: false
                }
            },
            patterns: ['dummy_basic'],
            encounterText: '* A training dummy approaches!\n* Wait, no, it just stands there.',
            spareText: "* You spared the Training Dummy.\n* It doesn't seem to care.",
            deathText: '* The dummy falls over.\n* Cotton spills everywhere.',
            drops: [
                { item: 'cotton_ball', chance: 0.6 },
                { item: 'button_eye', chance: 0.2 },
                { item: 'stick', chance: 0.1 }
            ]
        },

        'cave_spider': {
            name: 'Cave Spider',
            hp: 18,
            maxHp: 18,
            attack: 6,
            defense: 2,
            exp: 5,
            gold: 4,
            flavorText: '* Scuttles in the shadows.',
            checkText: '* CAVE SPIDER - ATK 6 DEF 2\n* Prefers dark corners. Easily startled.',
            canSpare: false,
            spareCondition: 'talk_twice',
            talkCount: 0,
            spareTalkThreshold: 2,
            actOptions: ['Check', 'Talk', 'Threaten'],
            actResponses: {
                'Talk': {
                    text: "* You spoke softly.\n* The spider seems less aggressive.",
                    effect: 'incrementTalk',
                    spareable: 'checkTalkCount'
                },
                'Threaten': {
                    text: '* You stomped your foot!\n* The spider backed away... and attacks harder!',
                    effect: 'enrage'
                }
            },
            patterns: ['spider_basic', 'spider_web'],
            encounterText: '* Cave Spider crawls out of the darkness!',
            spareText: '* The spider skitters away.\n* It seems relieved.',
            deathText: '* The spider curls up.\n* It stops moving.',
            drops: [
                { item: 'spider_leg', chance: 0.5 },
                { item: 'spider_silk', chance: 0.3 },
                { item: 'spider_fang', chance: 0.1 }
            ]
        },

        'rock_critter': {
            name: 'Rock Critter',
            hp: 24,
            maxHp: 24,
            attack: 5,
            defense: 5,
            exp: 8,
            gold: 6,
            flavorText: '* Blends in with the cave walls.',
            checkText: '* ROCK CRITTER - ATK 5 DEF 5\n* Hard exterior, soft interior.',
            canSpare: false,
            spareCondition: 'compliment',
            complimented: false,
            actOptions: ['Check', 'Pet', 'Compliment'],
            actResponses: {
                'Pet': {
                    text: "* You tried to pet the Rock Critter.\n* It's very rough.",
                    spareable: false
                },
                'Compliment': {
                    text: '* You told it that it has nice... rocks.\n* It seems flattered!',
                    effect: 'compliment',
                    spareable: true
                }
            },
            patterns: ['rock_basic', 'rock_roll'],
            encounterText: '* What you thought was a rock is actually alive!',
            spareText: "* You spared Rock Critter.\n* It waves a tiny pebble goodbye.",
            deathText: '* The Rock Critter crumbles to dust.',
            drops: [
                { item: 'rock_chunk', chance: 0.6 },
                { item: 'crystal_shard', chance: 0.2 },
                { item: 'cave_water', chance: 0.15 }
            ]
        },

        // ==================== AREA 2 ENEMIES ====================
        'crystal_bat': {
            name: 'Crystal Bat',
            hp: 22,
            maxHp: 22,
            attack: 8,
            defense: 3,
            exp: 10,
            gold: 8,
            flavorText: '* Its wings shimmer with crystal fragments.',
            checkText: '* CRYSTAL BAT - ATK 8 DEF 3\n* Collects shiny things. Very vain.',
            canSpare: false,
            spareCondition: 'admire',
            admireCount: 0,
            spareTalkThreshold: 2,
            actOptions: ['Check', 'Admire', 'Ignore'],
            actResponses: {
                'Admire': {
                    text: '* You admired its beautiful crystals!\n* It preens happily.',
                    effect: 'incrementAdmire',
                    spareable: 'checkAdmireCount'
                },
                'Ignore': {
                    text: '* You looked away.\n* The Crystal Bat is offended!',
                    effect: 'enrage'
                }
            },
            patterns: ['bat_swoop', 'bat_crystals'],
            encounterText: '* Crystal Bat swoops down from the ceiling!',
            spareText: '* Crystal Bat flies away, leaving a shiny crystal behind.',
            deathText: '* The Crystal Bat shatters into fragments.',
            drops: [
                { item: 'bat_wing', chance: 0.5 },
                { item: 'crystal_shard', chance: 0.4 },
                { item: 'crystal_dagger', chance: 0.05 }
            ]
        },

        'mushroom_dancer': {
            name: 'Mushroom Dancer',
            hp: 20,
            maxHp: 20,
            attack: 6,
            defense: 4,
            exp: 12,
            gold: 10,
            flavorText: '* Sways rhythmically back and forth.',
            checkText: '* MUSHROOM DANCER - ATK 6 DEF 4\n* Loves to dance. Looking for a partner.',
            canSpare: false,
            spareCondition: 'dance',
            danced: false,
            actOptions: ['Check', 'Dance', 'Stomp'],
            actResponses: {
                'Dance': {
                    text: '* You danced with the Mushroom!\n* It spins with joy!',
                    effect: 'dance',
                    spareable: true
                },
                'Stomp': {
                    text: "* You stomped your feet!\n* The Mushroom doesn't appreciate the rhythm.",
                    spareable: false
                }
            },
            patterns: ['mushroom_spores', 'mushroom_bounce'],
            encounterText: '* Mushroom Dancer shimmies into battle!',
            spareText: '* Mushroom Dancer bows gracefully and leaves.',
            deathText: '* The Mushroom Dancer wilts...',
            drops: [
                { item: 'mushroom_cap', chance: 0.6 },
                { item: 'glowing_mushroom', chance: 0.3 },
                { item: 'ancient_fruit', chance: 0.05 }
            ]
        },

        // ==================== MINI-BOSS ====================
        'crystal_guardian': {
            name: 'Crystal Guardian',
            hp: 80,
            maxHp: 80,
            attack: 12,
            defense: 8,
            exp: 50,
            gold: 40,
            isBoss: true,
            flavorText: '* Protector of the Crystal Caverns.',
            checkText: '* CRYSTAL GUARDIAN - ATK 12 DEF 8\n* Ancient defender. Values beauty above all.',
            canSpare: false,
            spareCondition: 'admire_three',
            admireCount: 0,
            spareTalkThreshold: 3,
            actOptions: ['Check', 'Admire', 'Reason', 'Challenge'],
            actResponses: {
                'Admire': {
                    text: "* You expressed admiration for the crystals.\n* The Guardian's stance softens slightly.",
                    effect: 'incrementAdmire',
                    spareable: 'checkAdmireCount'
                },
                'Reason': {
                    text: "* You tried to reason with the Guardian.\n* It shakes its head. Words alone won't work.",
                    spareable: false
                },
                'Challenge': {
                    text: "* You challenged the Guardian's authority!\n* It does not take this well.",
                    effect: 'enrage'
                }
            },
            phases: [
                { hpThreshold: 80, patterns: ['guardian_crystals', 'guardian_beam'] },
                { hpThreshold: 50, patterns: ['guardian_storm', 'guardian_beam', 'guardian_crystals'] },
                { hpThreshold: 25, patterns: ['guardian_ultimate', 'guardian_storm'] }
            ],
            encounterText: '* The Crystal Guardian blocks your path!',
            spareText: '* The Guardian steps aside.\n* "You may pass, kind one."',
            deathText: '* The Guardian shatters into a million pieces.\n* The cavern feels empty.',
            violenceBoost: {
                attack: 15,
                defense: 10,
                patterns: ['guardian_ultimate', 'guardian_storm', 'guardian_rage']
            },
            drops: [
                { item: 'guardian_crystal', chance: 1.0 },
                { item: 'crystal_shard', chance: 0.8 },
                { item: 'crystal_sword', chance: 0.3 },
                { item: 'crystal_shield', chance: 0.2 }
            ]
        },

        // ==================== AREA 3 ENEMIES ====================
        'ancient_spirit': {
            name: 'Ancient Spirit',
            hp: 30,
            maxHp: 30,
            attack: 10,
            defense: 2,
            exp: 15,
            gold: 12,
            flavorText: '* A remnant of those who came before.',
            checkText: '* ANCIENT SPIRIT - ATK 10 DEF 2\n* Lonely. Just wants someone to remember.',
            canSpare: false,
            spareCondition: 'remember',
            remembered: false,
            actOptions: ['Check', 'Remember', 'Banish'],
            actResponses: {
                'Remember': {
                    text: '* You acknowledged its existence.\n* The spirit seems... grateful.',
                    effect: 'remember',
                    spareable: true
                },
                'Banish': {
                    text: '* You commanded it to leave!\n* The spirit is enraged by your disrespect!',
                    effect: 'enrage'
                }
            },
            patterns: ['spirit_wisps', 'spirit_wail'],
            encounterText: '* An Ancient Spirit materializes!',
            spareText: '* The spirit fades peacefully.\n* "Thank you... for remembering..."',
            deathText: '* The spirit dissipates with a sorrowful cry.',
            drops: [
                { item: 'spirit_essence', chance: 0.6 },
                { item: 'ancient_fruit', chance: 0.3 },
                { item: 'spirit_blade', chance: 0.08 },
                { item: 'spirit_cloak', chance: 0.08 }
            ]
        },

        // ==================== FINAL BOSS ====================
        'the_keeper': {
            name: 'The Keeper',
            hp: 150,
            maxHp: 150,
            attack: 15,
            defense: 10,
            exp: 100,
            gold: 0,
            isBoss: true,
            isFinalBoss: true,
            flavorText: '* The final guardian of the underground.',
            checkText: '* THE KEEPER - ATK 15 DEF 10\n* Has protected this place for centuries.\n* Fights to protect everyone.',
            canSpare: false,
            spareCondition: 'mercy_many',
            mercyCount: 0,
            spareTalkThreshold: 5,
            actOptions: ['Check', 'Talk', 'Plead', 'Comfort'],
            actResponses: {
                'Talk': {
                    text: "* You tried to explain you mean no harm.\n* The Keeper listens, but doesn't yield.",
                    effect: 'incrementMercy',
                    spareable: 'checkMercyCount'
                },
                'Plead': {
                    text: '* You begged for peace.\n* The Keeper hesitates...',
                    effect: 'incrementMercy',
                    spareable: 'checkMercyCount'
                },
                'Comfort': {
                    text: "* You told the Keeper it's okay to rest.\n* Its attacks grow weaker...",
                    effect: 'comfort',
                    spareable: 'checkMercyCount'
                }
            },
            phases: [
                { hpThreshold: 150, patterns: ['keeper_orbs', 'keeper_sweep'], dialogue: null },
                { hpThreshold: 100, patterns: ['keeper_storm', 'keeper_orbs', 'keeper_sweep'], dialogue: 'final_boss_phase2' },
                { hpThreshold: 50, patterns: ['keeper_ultimate', 'keeper_storm', 'keeper_orbs'], dialogue: null },
                { hpThreshold: 25, patterns: ['keeper_desperation'], dialogue: null }
            ],
            encounterText: '* The Keeper stands before you.\n* "This is as far as you go."',
            spareText: '* The Keeper lowers its guard.\n* "Perhaps... you are different."',
            deathText: '* The Keeper falls.\n* "I... failed them..."',
            violenceBoost: {
                hp: 200,
                attack: 20,
                defense: 12,
                patterns: ['keeper_rage', 'keeper_ultimate', 'keeper_desperation']
            },
            drops: [
                { item: 'keeper_key', chance: 1.0 },
                { item: 'spirit_essence', chance: 0.8 },
                { item: 'ancient_blade', chance: 0.4 },
                { item: 'ancient_robe', chance: 0.4 }
            ]
        },

        // ==================== MEGA BOSS ====================
        'mega_destroyer': {
            name: 'MEGA DESTROYER',
            hp: 300,
            maxHp: 300,
            attack: 25,
            defense: 15,
            exp: 500,
            gold: 200,
            isBoss: true,
            isFinalBoss: true,
            isMegaBoss: true,
            flavorText: '* An ancient machine of destruction awakens.',
            checkText: '* MEGA DESTROYER - ATK 25 DEF 15\n* Built in a forgotten era to protect something precious.\n* Its core pulses with unstable energy.',
            canSpare: false,
            spareCondition: 'mercy_many',
            mercyCount: 0,
            spareTalkThreshold: 8,
            actOptions: ['Check', 'Analyze', 'Override', 'Comfort', 'Shutdown'],
            actResponses: {
                'Analyze': {
                    text: '* You analyzed its systems.\n* Found a weakness... but also pain.',
                    effect: 'incrementMercy',
                    spareable: 'checkMercyCount'
                },
                'Override': {
                    text: '* You tried to override its programming!\n* ERROR: ACCESS DENIED. It attacks harder!',
                    effect: 'enrage'
                },
                'Comfort': {
                    text: '* You told it that its duty is complete.\n* Something flickered in its core...',
                    effect: 'comfort',
                    spareable: 'checkMercyCount'
                },
                'Shutdown': {
                    text: '* You requested a peaceful shutdown.\n* "SHUTDOWN... PROTOCOL... CONSIDERING..."',
                    effect: 'incrementMercy',
                    spareable: 'checkMercyCount'
                }
            },
            phases: [
                { hpThreshold: 300, patterns: ['mega_laser', 'mega_missiles'], dialogue: null },
                { hpThreshold: 225, patterns: ['mega_storm', 'mega_laser', 'mega_missiles'], dialogue: 'mega_phase2' },
                { hpThreshold: 150, patterns: ['mega_ultimate', 'mega_storm', 'mega_laser'], dialogue: 'mega_phase3' },
                { hpThreshold: 75, patterns: ['mega_desperation', 'mega_ultimate'], dialogue: 'mega_phase4' },
                { hpThreshold: 25, patterns: ['mega_final'], dialogue: 'mega_final' }
            ],
            encounterText: '* The ground shakes.\n* MEGA DESTROYER rises from the depths!\n* "INTRUDER DETECTED. INITIATING ELIMINATION."',
            spareText: '* The MEGA DESTROYER powers down.\n* "THANK... YOU... FOR... FREEING... ME..."',
            deathText: '* MEGA DESTROYER explodes!\n* "FINALLY... PEACE..."',
            violenceBoost: {
                hp: 500,
                attack: 35,
                defense: 20,
                patterns: ['mega_rage', 'mega_final', 'mega_desperation', 'mega_ultimate']
            },
            drops: [
                { item: 'mega_core', chance: 1.0 },
                { item: 'mega_sword', chance: 0.5 },
                { item: 'mega_armor', chance: 0.5 },
                { item: 'spirit_essence', chance: 1.0 },
                { item: 'crystal_shard', chance: 1.0 }
            ]
        }
    },

    /**
     * Get enemy by ID
     */
    get(enemyId) {
        const enemy = this.data[enemyId];
        if (!enemy) return null;

        // Return a deep copy to avoid modifying the original
        return Utils.deepClone(enemy);
    },

    /**
     * Check if enemy exists
     */
    exists(enemyId) {
        return enemyId in this.data;
    },

    /**
     * Get enemy with violence route modifications
     */
    getForRoute(enemyId, save) {
        const enemy = this.get(enemyId);
        if (!enemy) return null;

        // Apply violence route boost if applicable
        if (Flags.isViolenceRoute(save) && enemy.violenceBoost) {
            const boost = enemy.violenceBoost;
            if (boost.hp) enemy.maxHp = boost.hp;
            if (boost.hp) enemy.hp = boost.hp;
            if (boost.attack) enemy.attack = boost.attack;
            if (boost.defense) enemy.defense = boost.defense;
            if (boost.patterns) enemy.patterns = boost.patterns;
        }

        return enemy;
    },

    /**
     * Get random encounter for area
     */
    getRandomEncounter(areaId) {
        const areaEnemies = {
            'descent': ['cave_spider', 'rock_critter'],
            'caverns': ['crystal_bat', 'mushroom_dancer'],
            'hall': ['ancient_spirit']
        };

        const enemies = areaEnemies[areaId];
        if (!enemies || enemies.length === 0) return null;

        return Utils.randomChoice(enemies);
    },

    /**
     * Check if enemy can be spared
     */
    checkSpareCondition(enemy) {
        switch (enemy.spareCondition) {
            case 'always':
                return true;

            case 'talk_twice':
                return (enemy.talkCount || 0) >= (enemy.spareTalkThreshold || 2);

            case 'compliment':
                return enemy.complimented === true;

            case 'admire':
            case 'admire_three':
                return (enemy.admireCount || 0) >= (enemy.spareTalkThreshold || 2);

            case 'dance':
                return enemy.danced === true;

            case 'remember':
                return enemy.remembered === true;

            case 'mercy_many':
                return (enemy.mercyCount || 0) >= (enemy.spareTalkThreshold || 5);

            default:
                return false;
        }
    },

    /**
     * Apply ACT effect to enemy
     */
    applyActEffect(enemy, effect) {
        switch (effect) {
            case 'incrementTalk':
                enemy.talkCount = (enemy.talkCount || 0) + 1;
                break;

            case 'incrementAdmire':
                enemy.admireCount = (enemy.admireCount || 0) + 1;
                break;

            case 'incrementMercy':
                enemy.mercyCount = (enemy.mercyCount || 0) + 1;
                break;

            case 'compliment':
                enemy.complimented = true;
                break;

            case 'dance':
                enemy.danced = true;
                break;

            case 'remember':
                enemy.remembered = true;
                break;

            case 'comfort':
                enemy.mercyCount = (enemy.mercyCount || 0) + 1;
                enemy.attack = Math.max(1, enemy.attack - 2);
                break;

            case 'enrage':
                enemy.attack += 3;
                enemy.enraged = true;
                break;
        }
    }
};

// Make it globally available
window.Enemies = Enemies;
