/**
 * Dialogue data and trees
 */
const Dialogues = {
    data: {
        // ==================== INTRO ====================
        'intro_wake': {
            speaker: null,
            lines: [
                { text: '...' },
                { text: '......' },
                { text: 'Where... am I?' },
                { text: 'You fell a long way down.' },
                { text: 'But it seems you survived.' }
            ]
        },

        'intro_guide_meet': {
            speaker: 'Sage',
            portrait: 'guide_neutral',
            lines: [
                { text: 'Oh! A human!' },
                { text: "It's been so long since one has fallen down here." },
                { text: 'My name is SAGE. I watch over this part of the underground.' },
                { text: 'You must be very confused. Let me give you some advice.' },
                { text: 'Head south to explore. Be careful of creatures you meet.' },
                { text: 'Not all of them are hostile... try talking to them!' },
                { text: 'Good luck, young one.' }
            ],
            setFlags: { 'met_guide': true }
        },

        'intro_guide_met': {
            speaker: 'Sage',
            portrait: 'guide_neutral',
            lines: [
                { text: 'Remember: not everything that attacks you is evil.' },
                { text: 'Try using ACT to interact with creatures.' },
                { text: 'You might be surprised what happens!' }
            ]
        },

        'intro_battle_tutorial': {
            speaker: 'Sage',
            portrait: 'guide_explain',
            lines: [
                { text: 'Sometimes, you may encounter creatures down here.' },
                { text: "When that happens, you'll enter a BATTLE." },
                { text: 'Your SOUL - the culmination of your being - will appear.' },
                { text: "It's the little red heart. You must keep it safe!" },
                { text: 'Dodge the attacks that come your way.' },
                { text: 'You can FIGHT... but there are other ways.' },
                { text: "Try using ACT to interact. Or MERCY to spare them." },
                { text: "Not everything that attacks you is truly evil..." }
            ],
            setFlags: { 'learned_battle': true }
        },

        'intro_mercy_tutorial': {
            speaker: 'Sage',
            portrait: 'guide_happy',
            lines: [
                { text: 'You showed mercy! Well done.' },
                { text: 'When creatures no longer want to fight...' },
                { text: '...their name will turn YELLOW in the mercy menu.' },
                { text: "That's when you can SPARE them." },
                { text: 'Remember this. It will serve you well.' }
            ],
            setFlags: { 'learned_mercy': true }
        },

        // ==================== AREA 1: THE DESCENT ====================
        'descent_entrance': {
            speaker: null,
            lines: [
                { text: 'The air grows colder.' },
                { text: 'You can hear water dripping in the distance.' },
                { text: 'This place feels ancient.' }
            ],
            setFlags: { 'descent_entered': true }
        },

        'descent_lore_tablet': {
            speaker: null,
            lines: [
                { text: 'An ancient tablet. The text is faded but legible:' },
                { text: '"Long ago, two races ruled the surface..."' },
                { text: '"Humans and Monsters."' },
                { text: '"One day, war broke out between the two races."' },
                { text: '"After a long battle, the humans were victorious."' },
                { text: '"They sealed the monsters underground with a magic spell."' },
                { text: '...' },
                { text: 'The rest is too damaged to read.' }
            ],
            setFlags: { 'descent_secret_found': true }
        },

        'descent_save_point': {
            speaker: null,
            lines: [
                { text: 'The gentle glow fills you with determination.' },
                { text: '(HP fully restored.)' }
            ]
        },

        // ==================== AREA 2: CRYSTAL CAVERNS ====================
        'caverns_entrance': {
            speaker: null,
            lines: [
                { text: "The crystals here emit a soft, ethereal light." },
                { text: "It's strangely beautiful." }
            ],
            setFlags: { 'caverns_entered': true }
        },

        'shopkeeper_intro': {
            speaker: 'Glint',
            portrait: 'shopkeeper_neutral',
            lines: [
                { text: 'Well well well! A customer!' },
                { text: "Name's GLINT. I sell the finest goods in the underground!" },
                { text: '...Which is to say, the ONLY goods.' },
                { text: 'Take a look around! Everything is reasonably priced.' },
                { text: '...Mostly.' }
            ],
            setFlags: { 'met_shopkeeper': true }
        },

        'shopkeeper_talk': {
            speaker: 'Glint',
            portrait: 'shopkeeper_happy',
            lines: [
                { text: "Business is slow, but I can't complain." },
                { text: "At least I'm not stuck in the deeper caves." },
                { text: "Those places... they give me the creeps." }
            ]
        },

        'shopkeeper_talk_violence': {
            speaker: 'Glint',
            portrait: 'shopkeeper_nervous',
            lines: [
                { text: '...' },
                { text: "I've heard things about you." },
                { text: 'J-just... take what you want and go.' },
                { text: 'Please.' }
            ]
        },

        'shopkeeper_befriend': {
            speaker: 'Glint',
            portrait: 'shopkeeper_happy',
            lines: [
                { text: "You know, you're pretty nice for a human." },
                { text: 'Most of the stories say humans are scary.' },
                { text: "But you... you're alright." },
                { text: 'Here, take this. On the house.' }
            ],
            setFlags: { 'shopkeeper_befriended': true },
            giveItem: 'ancient_fruit'
        },

        'piano_interact': {
            speaker: null,
            lines: [
                { text: 'An old piano. Some keys are missing.' },
                { text: 'But it still makes sound.' }
            ],
            setFlags: { 'piano_played': true }
        },

        'piano_secret': {
            speaker: null,
            lines: [
                { text: 'You played a familiar melody...' },
                { text: '...' },
                { text: 'Something clicks in the distance.' }
            ],
            setFlags: { 'piano_secret_song': true }
        },

        // Crystal Guardian
        'guardian_intro': {
            speaker: 'Crystal Guardian',
            portrait: 'guardian_neutral',
            lines: [
                { text: 'HALT.' },
                { text: 'None may pass without proving their worth.' },
                { text: 'Prepare yourself, human.' }
            ]
        },

        'guardian_intro_violence': {
            speaker: 'Crystal Guardian',
            portrait: 'guardian_angry',
            lines: [
                { text: 'YOU.' },
                { text: 'I have sensed the dust on your hands.' },
                { text: 'You will go no further.' },
                { text: 'I will stop you here... even if it costs me everything.' }
            ]
        },

        'guardian_spare': {
            speaker: 'Crystal Guardian',
            portrait: 'guardian_happy',
            lines: [
                { text: '...You truly find beauty in these crystals?' },
                { text: 'Perhaps... I misjudged you.' },
                { text: 'Very well. You may pass.' },
                { text: 'May your journey be filled with light.' }
            ],
            setFlags: { 'guardian_spared': true }
        },

        'guardian_defeat': {
            speaker: null,
            lines: [
                { text: 'The Guardian shatters into pieces.' },
                { text: '...' },
                { text: 'You feel a strange emptiness.' }
            ],
            setFlags: { 'guardian_killed': true }
        },

        // ==================== AREA 3: ANCIENT HALL ====================
        'hall_entrance': {
            speaker: null,
            lines: [
                { text: 'The architecture here is unlike anything above.' },
                { text: 'These halls were built by hands long forgotten.' }
            ],
            setFlags: { 'hall_entered': true }
        },

        'mysterious_figure_intro': {
            speaker: '???',
            portrait: 'mysterious_shadow',
            lines: [
                { text: 'Interesting.' },
                { text: 'Another human, after all this time.' },
                { text: "I've been watching your progress." },
                { text: 'Your choices... fascinate me.' }
            ],
            setFlags: { 'mysterious_figure_met': true }
        },

        'mysterious_figure_pacifist': {
            speaker: '???',
            portrait: 'mysterious_neutral',
            lines: [
                { text: 'You show kindness to those who would harm you.' },
                { text: 'How... unusual.' },
                { text: 'The last human was not so gentle.' },
                { text: 'Perhaps there is hope after all.' }
            ]
        },

        'mysterious_figure_violence': {
            speaker: '???',
            portrait: 'mysterious_dark',
            lines: [
                { text: 'Dust covers your hands.' },
                { text: 'You remind me of... someone.' },
                { text: 'Someone who brought great suffering to this place.' },
                { text: 'I wonder... will history repeat itself?' }
            ]
        },

        'history_lesson': {
            speaker: '???',
            portrait: 'mysterious_neutral',
            lines: [
                { text: 'Let me tell you a story.' },
                { text: 'Long ago, monsters lived in peace with humans.' },
                { text: 'But fear drove humanity to war.' },
                { text: 'The monsters lost. They were sealed underground.' },
                { text: 'A barrier was created that none could cross.' },
                { text: '...Until now, perhaps.' }
            ],
            setFlags: { 'learned_history': true }
        },

        'moral_choice': {
            speaker: '???',
            portrait: 'mysterious_neutral',
            lines: [
                { text: 'Before you proceed, answer me this:' },
                { text: 'A creature stands in your way.' },
                { text: 'It fears you. It attacks out of that fear.' },
                { text: 'What do you do?' }
            ],
            choices: [
                {
                    text: 'Show it kindness',
                    setFlags: { 'moral_choice_made': true, 'moral_choice_kind': true },
                    next: 'moral_choice_kind_response'
                },
                {
                    text: 'Remove the threat',
                    setFlags: { 'moral_choice_made': true, 'moral_choice_cruel': true },
                    next: 'moral_choice_cruel_response'
                }
            ]
        },

        'moral_choice_kind_response': {
            speaker: '???',
            portrait: 'mysterious_happy',
            lines: [
                { text: '...' },
                { text: 'A gentle soul.' },
                { text: 'Perhaps you are the one we have waited for.' },
                { text: 'Go. The path ahead awaits.' }
            ]
        },

        'moral_choice_cruel_response': {
            speaker: '???',
            portrait: 'mysterious_dark',
            lines: [
                { text: '...' },
                { text: 'I see.' },
                { text: 'You are just like the rest.' },
                { text: 'Very well. Face what awaits you.' }
            ]
        },

        // Developer room easter egg
        'dev_room': {
            speaker: 'Developer',
            portrait: null,
            lines: [
                { text: 'Oh! You found this place!' },
                { text: 'This is the developer room.' },
                { text: "It's not really supposed to exist." },
                { text: 'But since you found it...' },
                { text: "Thanks for playing! Hope you're enjoying the demo." },
                { text: 'There are multiple endings, you know.' },
                { text: 'Try being nice. Or... not.' },
                { text: 'Your choices matter!' }
            ],
            setFlags: { 'dev_room_found': true }
        },

        // ==================== FINAL BOSS ====================
        'final_boss_intro': {
            speaker: 'The Keeper',
            portrait: 'keeper_neutral',
            lines: [
                { text: 'So you have come.' },
                { text: 'I am the Keeper of this place.' },
                { text: 'The last line of defense.' },
                { text: 'No human has ever passed me.' },
                { text: '...And none ever will.' }
            ]
        },

        'final_boss_intro_violence': {
            speaker: 'The Keeper',
            portrait: 'keeper_angry',
            lines: [
                { text: 'MURDERER.' },
                { text: 'I have felt every life you extinguished.' },
                { text: 'Every soul turned to dust.' },
                { text: 'This ends NOW.' },
                { text: 'I will make you PAY for what you have done!' }
            ]
        },

        'final_boss_phase2': {
            speaker: 'The Keeper',
            portrait: 'keeper_determined',
            lines: [
                { text: 'You are... stronger than I expected.' },
                { text: 'But I cannot let you pass.' },
                { text: 'For everyone down here... I must fight!' }
            ]
        },

        'final_boss_spare': {
            speaker: 'The Keeper',
            portrait: 'keeper_sad',
            lines: [
                { text: '...Why?' },
                { text: 'Why do you refuse to fight?' },
                { text: '...' },
                { text: 'Perhaps... I was wrong about humans.' },
                { text: 'Go. The exit is just ahead.' },
                { text: 'May you find what you seek.' }
            ],
            setFlags: { 'final_boss_spared': true }
        },

        'final_boss_defeat': {
            speaker: null,
            lines: [
                { text: 'The Keeper falls.' },
                { text: '...' },
                { text: 'The underground feels emptier.' },
                { text: 'But the path is now clear.' }
            ],
            setFlags: { 'final_boss_killed': true }
        },

        // ==================== MEGA BOSS ====================
        'mega_boss_intro': {
            speaker: 'MEGA DESTROYER',
            portrait: 'mega_neutral',
            lines: [
                { text: 'INTRUDER DETECTED.' },
                { text: 'SCANNING... HUMAN LIFE FORM CONFIRMED.' },
                { text: 'I AM THE MEGA DESTROYER.' },
                { text: 'BUILT LONG AGO TO PROTECT THE CORE.' },
                { text: 'YOU WILL NOT PASS.' },
                { text: 'INITIATING ELIMINATION PROTOCOL.' }
            ]
        },

        'mega_boss_intro_violence': {
            speaker: 'MEGA DESTROYER',
            portrait: 'mega_angry',
            lines: [
                { text: 'WARNING: EXTREME THREAT DETECTED.' },
                { text: 'KILL COUNT... EXCEEDS MAXIMUM.' },
                { text: 'YOU ARE DANGEROUS.' },
                { text: 'ENGAGING FULL COMBAT MODE.' },
                { text: 'PREPARE FOR ANNIHILATION.' }
            ]
        },

        'mega_phase2': {
            speaker: 'MEGA DESTROYER',
            portrait: 'mega_damaged',
            lines: [
                { text: 'DAMAGE DETECTED. SYSTEMS FAILING.' },
                { text: 'BUT... I MUST... PROTECT...' },
                { text: 'INCREASING POWER OUTPUT.' }
            ]
        },

        'mega_phase3': {
            speaker: 'MEGA DESTROYER',
            portrait: 'mega_damaged',
            lines: [
                { text: 'CORE... UNSTABLE...' },
                { text: 'WHY... DO YOU FIGHT?' },
                { text: 'I WAS ONLY... FOLLOWING ORDERS...' }
            ]
        },

        'mega_phase4': {
            speaker: 'MEGA DESTROYER',
            portrait: 'mega_sad',
            lines: [
                { text: 'SYSTEMS... CRITICAL...' },
                { text: 'I HAVE GUARDED THIS PLACE... FOR SO LONG...' },
                { text: 'IS THERE... NO OTHER WAY?' }
            ]
        },

        'mega_final': {
            speaker: 'MEGA DESTROYER',
            portrait: 'mega_dying',
            lines: [
                { text: 'I... UNDERSTAND NOW...' },
                { text: 'MY PURPOSE... WAS NOT TO DESTROY...' },
                { text: 'BUT TO PROTECT...' },
                { text: '...AND PERHAPS... TO BE FREED.' }
            ]
        },

        'mega_boss_spare': {
            speaker: 'MEGA DESTROYER',
            portrait: 'mega_peaceful',
            lines: [
                { text: 'SHUTDOWN... ACCEPTED.' },
                { text: 'THANK YOU... FOR SHOWING ME...' },
                { text: 'THAT THERE IS ANOTHER WAY.' },
                { text: 'TAKE THE CORE... IT IS YOURS.' },
                { text: 'USE IT... TO HELP OTHERS.' },
                { text: 'GOODBYE... KIND HUMAN...' }
            ],
            setFlags: { 'mega_boss_spared': true }
        },

        'mega_boss_defeat': {
            speaker: null,
            lines: [
                { text: 'The MEGA DESTROYER explodes.' },
                { text: 'Fragments scatter across the chamber.' },
                { text: 'Among the wreckage, something glows...' },
                { text: 'You obtained the MEGA CORE.' }
            ],
            setFlags: { 'mega_boss_killed': true }
        },

        // ==================== NEXT LEVEL ====================
        'next_level_intro': {
            speaker: '???',
            portrait: 'mysterious_happy',
            lines: [
                { text: 'Congratulations, traveler.' },
                { text: 'You have reached the end of the demo.' },
                { text: 'But this is not the end of your journey.' },
                { text: 'The world beyond awaits...' },
                { text: 'Thank you for playing!' },
                { text: '(More content coming soon!)' }
            ],
            setFlags: { 'reached_next_level': true }
        },

        // ==================== ENDINGS ====================
        'ending_pacifist': {
            speaker: null,
            lines: [
                { text: 'You made it through without hurting anyone.' },
                { text: 'The underground will remember your kindness.' },
                { text: 'Perhaps one day, humans and monsters can coexist.' },
                { text: '...' },
                { text: 'THE END' },
                { text: '(PACIFIST ENDING)' }
            ]
        },

        'ending_neutral': {
            speaker: null,
            lines: [
                { text: 'You made it through.' },
                { text: 'Some were spared. Some were not.' },
                { text: 'The underground continues as it always has.' },
                { text: '...' },
                { text: 'THE END' },
                { text: '(NEUTRAL ENDING)' }
            ]
        },

        'ending_violence': {
            speaker: null,
            lines: [
                { text: 'The underground is silent now.' },
                { text: 'Dust covers your hands.' },
                { text: 'You got what you wanted.' },
                { text: 'Was it worth it?' },
                { text: '...' },
                { text: 'THE END' },
                { text: '(VIOLENCE ENDING)' }
            ]
        },

        // ==================== MISC ====================
        'generic_npc': {
            speaker: 'Monster',
            lines: [
                { text: "It's a nice day, isn't it?" },
                { text: '...Well, as nice as it gets down here.' }
            ]
        },

        'generic_npc_scared': {
            speaker: 'Monster',
            portrait: 'npc_scared',
            lines: [
                { text: 'P-please... leave me alone.' },
                { text: "I don't want any trouble." }
            ]
        }
    },

    /**
     * Get dialogue by ID
     */
    get(dialogueId) {
        return this.data[dialogueId] || null;
    },

    /**
     * Check if dialogue exists
     */
    exists(dialogueId) {
        return dialogueId in this.data;
    },

    /**
     * Get route-appropriate dialogue
     */
    getForRoute(baseId, save) {
        const route = Flags.determineRoute(save);
        const variantId = `${baseId}_${route}`;

        if (this.data[variantId]) {
            return this.data[variantId];
        }

        return this.data[baseId] || null;
    }
};

// Make it globally available
window.Dialogues = Dialogues;
