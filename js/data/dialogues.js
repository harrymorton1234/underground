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
                { text: 'But it seems you survived.' },
                { text: '...' },
                { text: '= CONTROLS =' },
                { text: 'ARROW KEYS - Move around' },
                { text: 'Z or ENTER - Confirm / Interact' },
                { text: 'X - Cancel / Open Menu' },
                { text: 'C - Open Menu (alternate)' },
                { text: '...' },
                { text: 'You should explore this place.' }
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
                { text: "Welcome back! Want to buy something?" },
                { text: "I've got the best goods in the underground!" }
            ]
        },

        'shopkeeper_buy_hint': {
            speaker: 'Glint',
            portrait: 'shopkeeper_neutral',
            lines: [
                { text: "Use LEFT and RIGHT to switch between BUY and SELL." },
                { text: "UP and DOWN to pick items, Z to confirm!" },
                { text: "Press X when you're done shopping." }
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

        // ==================== DESCENT SHOP ====================
        'descent_shopkeeper_intro': {
            speaker: 'Dusty',
            portrait: 'shopkeeper_neutral',
            lines: [
                { text: 'Oh! A visitor!' },
                { text: "Haven't seen a human in ages..." },
                { text: "Name's DUSTY. Been running this little shop for centuries." },
                { text: "It's not much, but I've got supplies for travelers." },
                { text: 'Take a look around!' }
            ],
            setFlags: { 'met_dusty': true }
        },

        'descent_shopkeeper_talk': {
            speaker: 'Dusty',
            portrait: 'shopkeeper_happy',
            lines: [
                { text: 'Back again? Good to see a familiar face.' },
                { text: 'What can I get for you today?' }
            ]
        },

        // ==================== SWAMP SHOP ====================
        'swamp_shopkeeper_intro': {
            speaker: 'Bogsworth',
            portrait: 'shopkeeper_neutral',
            lines: [
                { text: '*bubble* *bubble*' },
                { text: 'Ah, a customer emerges from the murk!' },
                { text: "I am BOGSWORTH, purveyor of the swamp's finest goods." },
                { text: 'The deeper items are... more potent.' },
                { text: 'But also more expensive. Such is the way of things.' }
            ],
            setFlags: { 'met_bogsworth': true }
        },

        'swamp_shopkeeper_talk': {
            speaker: 'Bogsworth',
            portrait: 'shopkeeper_happy',
            lines: [
                { text: '*glub* Welcome back to the Murky Market!' },
                { text: 'The swamp provides, and I sell. Simple as that.' }
            ]
        },

        // ==================== KEEPER SHRINE ====================
        'shrine_spirit_intro': {
            speaker: 'Ancient Spirit',
            portrait: 'npc_neutral',
            lines: [
                { text: '...' },
                { text: 'You seek The Keeper.' },
                { text: 'Many have tried. Few have survived.' },
                { text: 'Heed my warning, young one...' },
                { text: 'The Keeper is no ordinary foe.' },
                { text: 'You should be at least LEVEL 8 before facing them.' },
                { text: 'Their attacks are swift and deadly.' },
                { text: 'Stock up on healing items. You will need them.' },
                { text: 'And remember... mercy is always an option.' }
            ],
            setFlags: { 'shrine_visited': true }
        },

        'shrine_spirit_advice': {
            speaker: 'Ancient Spirit',
            portrait: 'npc_neutral',
            lines: [
                { text: 'Remember... LEVEL 8 at minimum.' },
                { text: 'Bring healing items.' },
                { text: 'The Keeper can be spared... if you are patient.' },
                { text: 'Good luck, traveler.' }
            ]
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

        // ==================== LOCKED DOORS ====================
        'locked_door_core': {
            speaker: null,
            lines: [
                { text: 'The door is sealed with ancient technology.' },
                { text: 'It seems to require some kind of CORE to open.' },
                { text: "(You need the MEGA CORE to pass.)" }
            ]
        },

        'locked_door_key': {
            speaker: null,
            lines: [
                { text: 'The door is locked.' },
                { text: 'You need a KEY to open it.' }
            ]
        },

        'house_not_yours': {
            speaker: null,
            lines: [
                { text: "This is someone's home." },
                { text: "You can't just walk in." }
            ]
        },

        'locked_door_keeper': {
            speaker: null,
            lines: [
                { text: 'A massive door blocks the way.' },
                { text: 'An ancient lock seals it shut.' },
                { text: "You'll need a special key to open it." },
                { text: '(Find and defeat The Keeper to obtain the key.)' }
            ]
        },

        // ==================== SWAMP AREA ====================
        'swamp_entrance': {
            speaker: null,
            lines: [
                { text: 'The air becomes thick and humid.' },
                { text: 'You step into a murky underground swamp.' },
                { text: 'Strange sounds echo in the distance...' }
            ],
            setFlags: { 'swamp_entered': true }
        },

        'swamp_save_point': {
            speaker: null,
            lines: [
                { text: 'The glow cuts through the fog...' },
                { text: 'You feel determination despite the gloom.' },
                { text: '(HP fully restored.)' }
            ]
        },

        'swamp_guide_intro': {
            speaker: 'Wanderer',
            portrait: 'npc_neutral',
            lines: [
                { text: "Oh! A traveler in these parts?" },
                { text: "Be careful. This swamp hides many secrets." },
                { text: "There's something dark deeper in..." },
                { text: 'The Keeper guards the way forward.' },
                { text: "You'll need to find its lair to proceed." }
            ],
            setFlags: { 'met_swamp_guide': true }
        },

        'swamp_guide_hint': {
            speaker: 'Wanderer',
            portrait: 'npc_neutral',
            lines: [
                { text: "The Keeper's lair is to the south, then west." },
                { text: 'Defeat it to obtain the key you need.' }
            ]
        },

        'swamp_lore_tablet': {
            speaker: null,
            lines: [
                { text: 'An old stone tablet, covered in moss:' },
                { text: '"The Keeper watches over the final gate."' },
                { text: '"Only those who prove themselves may pass."' },
                { text: '"But beyond the gate lies greater danger..."' }
            ]
        },

        'fairy_ring_interact': {
            speaker: null,
            lines: [
                { text: 'A circle of glowing mushrooms...' },
                { text: 'They pulse with an otherworldly light.' },
                { text: 'You feel compelled to step into the ring.' }
            ],
            choices: [
                {
                    text: 'Step inside',
                    next: 'fairy_ring_enter'
                },
                {
                    text: 'Stay back',
                    next: 'fairy_ring_refuse'
                }
            ]
        },

        'fairy_ring_enter': {
            speaker: null,
            lines: [
                { text: 'You step into the fairy ring...' },
                { text: 'The mushrooms glow brighter!' },
                { text: 'A warm light envelops you.' },
                { text: '* Your HP was fully restored!' },
                { text: "* You feel... lucky. Like something good will happen." }
            ],
            setFlags: { 'fairy_ring_blessed': true },
            giveItem: 'glowing_mushroom',
            healPlayer: true
        },

        'fairy_ring_refuse': {
            speaker: null,
            lines: [
                { text: 'You decide not to risk it.' },
                { text: 'The mushrooms seem to dim slightly.' },
                { text: '...Was that disappointment?' }
            ]
        },

        'fairy_ring_return': {
            speaker: null,
            lines: [
                { text: 'The fairy ring still glows softly.' },
                { text: "But its magic seems spent... for now." }
            ]
        },

        'mystic_pool_interact': {
            speaker: null,
            lines: [
                { text: 'A strange pool in the fog...' },
                { text: 'The water glows with an inner light.' },
                { text: 'Something stirs beneath the surface.' }
            ],
            choices: [
                {
                    text: 'Gaze into the pool',
                    next: 'mystic_pool_vision'
                },
                {
                    text: 'Look away',
                    next: 'mystic_pool_ignore'
                }
            ]
        },

        'mystic_pool_vision': {
            speaker: null,
            lines: [
                { text: 'You gaze into the depths...' },
                { text: 'Images swirl in the water:' },
                { text: 'A great machine... pulsing with power.' },
                { text: 'A choice that will change everything.' },
                { text: 'And... a familiar face, watching.' },
                { text: 'The vision fades.' },
                { text: "* You gained insight into what's to come." }
            ],
            setFlags: { 'mystic_pool_vision_seen': true }
        },

        'mystic_pool_ignore': {
            speaker: null,
            lines: [
                { text: 'Some things are better left unknown.' },
                { text: 'You turn away from the pool.' }
            ]
        },

        'mystic_pool_return': {
            speaker: null,
            lines: [
                { text: 'The pool has grown dark.' },
                { text: 'It has shown you all it will.' }
            ]
        },

        'lost_spirit_talk': {
            speaker: 'Lost Spirit',
            portrait: 'npc_sad',
            lines: [
                { text: '...hello...' },
                { text: "I've been wandering here for so long..." },
                { text: 'The Keeper... it guards the only way out.' },
                { text: "I wasn't strong enough to pass..." },
                { text: 'Maybe you will be different.' }
            ],
            setFlags: { 'met_lost_spirit': true }
        },

        'lost_spirit_hint': {
            speaker: 'Lost Spirit',
            portrait: 'npc_sad',
            lines: [
                { text: "The Keeper isn't evil..." },
                { text: "It's just... doing its duty." },
                { text: 'Perhaps you can reach its heart.' }
            ]
        },

        'keeper_lair_enter': {
            speaker: null,
            lines: [
                { text: 'A chill runs down your spine.' },
                { text: 'You have entered the domain of The Keeper.' },
                { text: 'There is no turning back now.' }
            ]
        },

        'keeper_intro': {
            speaker: 'The Keeper',
            portrait: 'keeper_neutral',
            lines: [
                { text: '...' },
                { text: 'Another soul seeks passage.' },
                { text: 'I am The Keeper. Guardian of the gate.' },
                { text: 'None may pass without facing me.' },
                { text: 'Prepare yourself.' }
            ]
        },

        'locked_door_boss': {
            speaker: null,
            lines: [
                { text: 'Something powerful blocks the way.' },
                { text: "You can't proceed until it's dealt with." }
            ]
        },

        'treasure_chest_crystal': {
            speaker: null,
            lines: [
                { text: 'You found a treasure chest!' },
                { text: 'Inside you find valuable items...' },
                { text: '* Obtained ANCIENT BLADE!' },
                { text: '* Obtained ANCIENT ROBE!' },
                { text: '* Obtained 100 GOLD!' }
            ],
            setFlags: { 'crystal_treasury_opened': true },
            giveItems: ['ancient_blade', 'ancient_robe'],
            giveGold: 100
        },

        'treasure_chest_opened': {
            speaker: null,
            lines: [
                { text: 'The treasure chest is empty.' },
                { text: 'You already took everything.' }
            ]
        },

        'found_crystal_key': {
            speaker: null,
            lines: [
                { text: 'Hidden behind the tablet, you find something...' },
                { text: 'A key made of pure crystal!' },
                { text: '* Obtained CRYSTAL KEY!' },
                { text: 'It must open something in the caves...' }
            ],
            setFlags: { 'got_crystal_key': true },
            giveItem: 'crystal_key'
        },

        // ==================== SAVE POINTS ====================
        'keeper_save_point': {
            speaker: null,
            lines: [
                { text: 'A sense of dread fills the air...' },
                { text: 'But the gentle glow fills you with determination.' },
                { text: '(HP fully restored.)' }
            ]
        },

        'mega_save_point': {
            speaker: null,
            lines: [
                { text: 'The hum of machinery surrounds you.' },
                { text: 'Despite the danger ahead...' },
                { text: 'You are filled with determination.' },
                { text: '(HP fully restored.)' }
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
        },

        // ==================== VILLAGE (PART 2) ====================
        'village_intro': {
            speaker: '???',
            portrait: 'mysterious_happy',
            lines: [
                { text: 'You did it.' },
                { text: 'The MEGA DESTROYER has been vanquished.' },
                { text: 'Come with me.' },
                { text: 'There is something I want to show you.' }
            ],
            setFlags: { 'village_intro_seen': true }
        },

        'guide_follow': {
            speaker: '???',
            portrait: 'mysterious',
            lines: [
                { text: 'Follow me.' }
            ]
        },

        'guide_walking': {
            speaker: '???',
            portrait: 'mysterious',
            lines: [
                { text: '...' },
                { text: 'We are almost there.' },
                { text: 'Just a little further.' }
            ]
        },

        'village_crowning': {
            speaker: 'Village Elder',
            portrait: 'elder',
            lines: [
                { text: 'Citizens of Haven Village!' },
                { text: 'Today we gather to honor a true hero!' },
                { text: 'This brave soul has defeated the MEGA DESTROYER!' },
                { text: 'The terror that plagued our lands is no more!' },
                { text: '*The crowd cheers*' },
                { text: 'By the power vested in me as Village Elder...' },
                { text: 'I hereby crown you... HERO OF THE UNDERGROUND!' },
                { text: '*A crown is placed on your head*' },
                { text: 'As a token of our gratitude...' },
                { text: 'We present you with this house!' },
                { text: "It is yours, for as long as you wish to stay." },
                { text: 'Your trophies have been placed in your display case.' },
                { text: 'Welcome home, Hero.' }
            ],
            setFlags: { 'crowned_hero': true, 'has_house': true, 'trophy_mega_core': true, 'trophy_keepers_key': true },
            removeItems: ['mega_core', 'keepers_key']
        },

        'village_save_point': {
            speaker: null,
            lines: [
                { text: 'The warmth of the village surrounds you.' },
                { text: 'You are filled with peace and determination.' },
                { text: '(HP fully restored.)' }
            ]
        },

        // Village NPCs
        'village_elder_talk': {
            speaker: 'Village Elder',
            portrait: 'elder',
            lines: [
                { text: 'Ah, Hero! How are you finding your new home?' },
                { text: 'Feel free to explore the village.' },
                { text: 'We have a butcher, blacksmith, and magic shop.' },
                { text: 'Make yourself at home!' }
            ]
        },

        'village_citizen_1': {
            speaker: 'Villager',
            portrait: 'npc_happy',
            lines: [
                { text: "Oh my! It's the Hero!" },
                { text: 'Thank you for saving us!' },
                { text: "We've lived in fear of the Destroyer for so long..." },
                { text: 'Now we can finally live in peace!' }
            ]
        },

        'village_citizen_2': {
            speaker: 'Villager',
            portrait: 'npc_neutral',
            lines: [
                { text: 'This village has been hidden for centuries.' },
                { text: 'We fled underground to escape danger above.' },
                { text: 'But then the Destroyer appeared...' },
                { text: 'You gave us hope again.' }
            ]
        },

        'village_child': {
            speaker: 'Child',
            portrait: 'npc_happy',
            lines: [
                { text: "Wow! You're the Hero!" },
                { text: 'Can you teach me how to fight?!' },
                { text: '...Mom says no. But still! So cool!' }
            ]
        },

        // Butcher Shop
        'butcher_intro': {
            speaker: 'Gristle',
            portrait: 'npc_neutral',
            lines: [
                { text: "Welcome to Gristle's Meats!" },
                { text: "Ah! You're the Hero everyone's talking about!" },
                { text: 'For you, only the finest cuts!' },
                { text: "Have a look at what I've got." }
            ],
            setFlags: { 'met_butcher': true }
        },

        'butcher_talk': {
            speaker: 'Gristle',
            portrait: 'npc_neutral',
            lines: [
                { text: "Welcome back, Hero!" },
                { text: 'Need some supplies for your next adventure?' },
                { text: "I've got the best meat in the underground!" }
            ]
        },

        // Blacksmith
        'blacksmith_intro': {
            speaker: 'Hammerstone',
            portrait: 'npc_neutral',
            lines: [
                { text: '*CLANG CLANG*' },
                { text: 'Oh! A customer!' },
                { text: "Wait... you're THE Hero?!" },
                { text: "I've forged weapons my whole life..." },
                { text: 'It would be an honor to arm you!' },
                { text: 'Take a look at my finest work!' }
            ],
            setFlags: { 'met_blacksmith': true }
        },

        'blacksmith_talk': {
            speaker: 'Hammerstone',
            portrait: 'npc_neutral',
            lines: [
                { text: '*CLANG CLANG*' },
                { text: 'Ah, Hero! Back for more gear?' },
                { text: "I've got weapons and armor fit for legends!" }
            ]
        },

        // Magic Shop
        'magic_intro': {
            speaker: 'Mystara',
            portrait: 'npc_mysterious',
            lines: [
                { text: '...I sensed your arrival.' },
                { text: 'The Hero who defeated the Destroyer.' },
                { text: 'Your soul shines brightly.' },
                { text: 'I deal in magical artifacts and potions.' },
                { text: 'Perhaps something here will aid your journey.' }
            ],
            setFlags: { 'met_mage': true }
        },

        'magic_talk': {
            speaker: 'Mystara',
            portrait: 'npc_mysterious',
            lines: [
                { text: 'The stars have guided you back.' },
                { text: 'Seek what you need among my wares.' }
            ]
        },

        // Hero's House
        'house_enter': {
            speaker: null,
            lines: [
                { text: 'Your new home.' },
                { text: "It's cozy and warm." },
                { text: 'A perfect place to rest between adventures.' }
            ]
        },

        'house_bed': {
            speaker: null,
            lines: [
                { text: 'Your bed looks comfortable.' },
                { text: 'Do you want to rest?' }
            ],
            choices: [
                { text: 'Rest', next: 'house_rest' },
                { text: 'Not now', next: null }
            ]
        },

        'house_rest': {
            speaker: null,
            lines: [
                { text: 'You lay down and close your eyes...' },
                { text: '...' },
                { text: '*You feel completely refreshed!*' },
                { text: '(HP fully restored.)' }
            ],
            healPlayer: true
        },

        'house_bookshelf': {
            speaker: null,
            lines: [
                { text: 'A bookshelf filled with adventure stories.' },
                { text: '"The Hero of Legend"...' },
                { text: '"Tales from the Underground"...' },
                { text: '"How to Cook with Crystal Shards"...' },
                { text: 'Quite the collection!' }
            ]
        },

        'house_mirror': {
            speaker: null,
            lines: [
                { text: 'You look at yourself in the mirror.' },
                { text: "Despite everything, it's still you." },
                { text: '...But now with a crown!' }
            ]
        },

        'house_trophy': {
            speaker: null,
            lines: [
                { text: 'Your trophy case.' },
                { text: 'Memories of your adventures...' },
                { text: 'The crown from Haven Village.' },
                { text: 'A crystal shard from the Guardian.' },
                { text: 'The Mega Core... still pulsing with energy.' },
                { text: "The Keeper's Key that unlocked so many secrets." },
                { text: 'You came a long way.' }
            ]
        },

        'house_kitchen': {
            speaker: null,
            lines: [
                { text: 'Your cozy kitchen.' },
                { text: 'The stove is warm and inviting.' },
                { text: 'A good place to store your food supplies.' }
            ]
        },

        'house_save': {
            speaker: null,
            lines: [
                { text: 'Home sweet home.' },
                { text: 'You feel safe here.' }
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
