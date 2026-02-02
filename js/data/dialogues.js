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

        'piano_playing': {
            speaker: null,
            lines: [
                { text: 'You sit down at the piano...' },
                { text: 'Your fingers move across the keys as if guided by memory...' },
                { text: '...' }
            ]
        },

        'piano_after_secret': {
            speaker: null,
            lines: [
                { text: 'The old piano. Its melody still echoes in your mind.' },
                { text: 'The secret passage to the left remains open.' }
            ]
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

        'piano_song_complete': {
            speaker: null,
            lines: [
                { text: 'The piano plays a beautiful, melancholic melody...' },
                { text: 'The notes echo through the cavern...' },
                { text: 'As the final note fades...' },
                { text: '* A hidden passage has opened on the left wall!' }
            ],
            setFlags: { 'piano_secret_complete': true }
        },

        'secret_chamber_lore': {
            speaker: null,
            lines: [
                { text: 'An ancient plaque, covered in dust...' },
                { text: 'You wipe away the grime to reveal the inscription:' },
                { text: '"Long ago, before the darkness came, this land flourished."' },
                { text: '"The monsters you see were once guardians, protectors of this realm."' },
                { text: '"But a corruption spread from deep within the earth..."' },
                { text: '"It twisted their minds, made them forget who they were."' },
                { text: '"Only one who proves their worth by defeating the Core..."' },
                { text: '"...may learn the truth and perhaps... restore what was lost."' },
                { text: '* You found 200G hidden behind the plaque!' }
            ],
            giveGold: 200
        },

        'secret_chamber_lore_read': {
            speaker: null,
            lines: [
                { text: 'The ancient plaque. You\'ve already read its secrets.' },
                { text: '"Only one who defeats the Core may restore what was lost..."' }
            ]
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
            giveItems: ['hero_crown'],
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

        'fred_talk': {
            speaker: 'Fred',
            portrait: 'npc_neutral',
            lines: [
                { text: '*twitch*' },
                { text: 'You... you feel it too, yes?' },
                { text: 'The darkness... creeping in from FAR AWAY...' },
                { text: "There's a land beyond the underground..." },
                { text: 'A place where EVIL festers and grows!' },
                { text: '*eye twitches*' },
                { text: "They say it's just stories... but I KNOW!" },
                { text: "I've SEEN it in my dreams!" },
                { text: 'Shadows that walk... eyes in the void...' },
                { text: "An ancient evil awakening in distant lands!" },
                { text: '*mutters* They called me mad... MAD!' },
                { text: "But you... you're the Hero, yes?" },
                { text: 'Maybe YOU can stop it... when the time comes...' },
                { text: 'Heheheh... or maybe not. WHO KNOWS?!' },
                { text: '*stares with misaligned eyes*' }
            ]
        },

        // Bank
        'banker_intro': {
            speaker: 'Goldsworth',
            portrait: 'npc_neutral',
            lines: [
                { text: '*adjusts monocle*' },
                { text: 'Ah, welcome to Haven Vault & Trust!' },
                { text: "I am Goldsworth, the bank's proprietor." },
                { text: 'We offer secure storage for your gold.' },
                { text: 'Your wealth will be safe here, I assure you!' },
                { text: '*twirls mustache*' },
                { text: 'Would you like to make a transaction?' }
            ],
            setFlags: { 'met_banker': true }
        },

        'banker_talk': {
            speaker: 'Goldsworth',
            portrait: 'npc_neutral',
            lines: [
                { text: '*adjusts monocle*' },
                { text: 'Welcome back to Haven Vault & Trust!' },
                { text: 'How may I assist you today?' }
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
            dynamicDialogue: 'house_mirror'
        },

        'house_mirror_crowned': {
            speaker: null,
            lines: [
                { text: 'You look at yourself in the mirror.' },
                { text: "Despite everything, it's still you." },
                { text: '...But now with a crown!' }
            ]
        },

        'house_mirror_no_crown': {
            speaker: null,
            lines: [
                { text: 'You look at yourself in the mirror.' },
                { text: "Despite everything, it's still you." },
                { text: "The Hero of the Underground." }
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
                { text: 'The cabinets can store your food.' }
            ],
            choices: [
                { text: 'Store Food', next: 'kitchen_store' },
                { text: 'Take Food', next: 'kitchen_take' },
                { text: 'Never mind', next: null }
            ]
        },

        'kitchen_store': {
            speaker: null,
            lines: [
                { text: 'You store your food items in the cabinet.' }
            ],
            storeItems: 'food'
        },

        'kitchen_take': {
            speaker: null,
            lines: [
                { text: 'You check the cabinet for food...' }
            ],
            retrieveItems: 'food'
        },

        'house_armor_chest': {
            speaker: null,
            lines: [
                { text: 'A sturdy chest for storing armor.' }
            ],
            choices: [
                { text: 'Store Armor', next: 'armor_store' },
                { text: 'Take Armor', next: 'armor_take' },
                { text: 'Never mind', next: null }
            ]
        },

        'armor_store': {
            speaker: null,
            lines: [
                { text: 'You store your armor in the chest.' }
            ],
            storeItems: 'armor'
        },

        'armor_take': {
            speaker: null,
            lines: [
                { text: 'You check the chest for armor...' }
            ],
            retrieveItems: 'armor'
        },

        'house_weapon_chest': {
            speaker: null,
            lines: [
                { text: 'A chest for storing weapons.' }
            ],
            choices: [
                { text: 'Store Weapons', next: 'weapon_store' },
                { text: 'Take Weapons', next: 'weapon_take' },
                { text: 'Never mind', next: null }
            ]
        },

        'weapon_store': {
            speaker: null,
            lines: [
                { text: 'You store your weapons in the chest.' }
            ],
            storeItems: 'weapon'
        },

        'weapon_take': {
            speaker: null,
            lines: [
                { text: 'You check the chest for weapons...' }
            ],
            retrieveItems: 'weapon'
        },

        'house_save': {
            speaker: null,
            lines: [
                { text: 'Home sweet home.' },
                { text: 'You feel safe here.' }
            ]
        },

        // ==================== FRED FRIENDSHIP ====================
        'fred_talk_1': {
            speaker: 'Fred',
            portrait: 'npc_neutral',
            lines: [
                { text: '*twitch*' },
                { text: 'You... you came back to talk to me?' },
                { text: "Most people avoid me, you know..." },
                { text: "They think I'm CRAZY!" },
                { text: '*eye twitches*' },
                { text: "But I've seen things... TERRIBLE things!" },
                { text: "The darkness beyond... it's REAL!" },
                { text: '...' },
                { text: "You're... different. You listen." },
                { text: 'Come visit me at my house sometime!' },
                { text: "It's just to the left, near the blacksmith." },
                { text: '*points with trembling hand*' }
            ],
            setFlags: { 'fred_talked_1': true }
        },

        'fred_talk_2': {
            speaker: 'Fred',
            portrait: 'npc_neutral',
            lines: [
                { text: 'Oh! You again!' },
                { text: '*twitch* Did you visit my house yet?' },
                { text: "I have... THINGS to show you." },
                { text: 'Evidence! Proof of what I speak!' },
                { text: '*mutters* They all thought I was mad...' },
                { text: "But YOU'LL understand!" }
            ],
            setFlags: { 'fred_talked_2': true }
        },

        'fred_talk_3': {
            speaker: 'Fred',
            portrait: 'npc_neutral',
            lines: [
                { text: '*twitch twitch*' },
                { text: "You keep coming back... why?" },
                { text: '...' },
                { text: "You actually CARE, don't you?" },
                { text: '*eye stops twitching for a moment*' },
                { text: "It's been so long since anyone..." },
                { text: 'Please. Visit my house. I have something important.' },
                { text: 'Something about the OLD MINES.' }
            ],
            setFlags: { 'fred_talked_3': true }
        },

        'fred_talk_waiting': {
            speaker: 'Fred',
            portrait: 'npc_neutral',
            lines: [
                { text: '*twitch*' },
                { text: "I'm waiting at my house, friend." },
                { text: "There's something I need to show you..." },
                { text: '*mumbles about shadows*' }
            ]
        },

        'fred_house_enter': {
            speaker: null,
            lines: [
                { text: "Fred's home. It's... cluttered." },
                { text: 'Papers and drawings cover every surface.' },
                { text: 'Strange symbols are scrawled on the walls.' }
            ],
            setFlags: { 'fred_visited_house': true }
        },

        'fred_at_home_1': {
            speaker: 'Fred',
            portrait: 'npc_happy',
            lines: [
                { text: 'You came! YOU ACTUALLY CAME!' },
                { text: '*happy twitch*' },
                { text: 'Let me show you... let me show you everything!' },
                { text: '*gestures wildly at papers*' },
                { text: 'These are my research notes!' },
                { text: "The old mines beneath this village..." },
                { text: 'They go DEEP. Deeper than anyone knows!' },
                { text: 'I used to work there, you know. Before...' },
                { text: '*shudders*' },
                { text: 'Before I saw what lurks in the depths.' },
                { text: 'Come back again. I have MORE to tell you!' }
            ],
            setFlags: { 'fred_hangout_1': true }
        },

        'fred_at_home_2': {
            speaker: 'Fred',
            portrait: 'npc_neutral',
            lines: [
                { text: '*twitch* Back again?' },
                { text: "Good. Good! I've been preparing!" },
                { text: '*shuffles through papers*' },
                { text: "The mines go down 50 LEVELS!" },
                { text: 'At the bottom... something ANCIENT sleeps.' },
                { text: "I couldn't reach it. The creatures..." },
                { text: '*eye twitches rapidly*' },
                { text: 'They drove me back. EVERY TIME.' },
                { text: 'But you... you defeated the MEGA DESTROYER!' },
                { text: 'Maybe YOU can reach the bottom!' },
                { text: 'One more visit. Then I show you the entrance.' }
            ],
            setFlags: { 'fred_hangout_2': true }
        },

        'fred_at_home_3': {
            speaker: 'Fred',
            portrait: 'npc_happy',
            lines: [
                { text: '*both eyes focus on you*' },
                { text: "You've been so kind to me..." },
                { text: "No one else ever listened." },
                { text: '*wipes tear*' },
                { text: "I trust you. I TRUST YOU!" },
                { text: '*twitch*' },
                { text: "The mine entrance... it's in the village." },
                { text: 'At the bottom of Market Street.' },
                { text: "I sealed it years ago, after what I saw." },
                { text: "But for you... I'll open it." },
                { text: '*hands you a rusty key*' },
                { text: 'Meet me at the sealed door. South end of the street.' },
                { text: "Together, we'll unseal what I've hidden!" }
            ],
            setFlags: { 'fred_hangout_3': true, 'fred_friendship_complete': true },
            giveItem: 'freds_key'
        },

        'fred_at_home_complete': {
            speaker: 'Fred',
            portrait: 'npc_happy',
            lines: [
                { text: '*twitch*' },
                { text: "The mines await you, friend!" },
                { text: 'Remember: every 5 levels there is an elevator.' },
                { text: "Use them wisely. Don't go too deep too fast!" },
                { text: '*eye twitches*' },
                { text: "And whatever you do... don't wake HIM." }
            ]
        },

        'fred_at_door': {
            speaker: 'Fred',
            portrait: 'npc_neutral',
            lines: [
                { text: '*twitch*' },
                { text: "You're here. Good. GOOD!" },
                { text: '*fumbles with the lock*' },
                { text: 'This door... I sealed it myself.' },
                { text: 'After what I saw down there...' },
                { text: '*shudders*' },
                { text: "But you're different. You're STRONG!" },
                { text: '*click*' },
                { text: "There. It's open." },
                { text: '*steps back*' },
                { text: 'The mines await, Hero.' },
                { text: "Remember: every 5 levels there's an elevator." },
                { text: "It'll remember how deep you've been." },
                { text: 'Good luck... and be CAREFUL!' },
                { text: '*eye twitches with concern*' }
            ],
            setFlags: { 'mines_unlocked': true }
        },

        'mines_door_locked': {
            speaker: null,
            lines: [
                { text: 'A heavy iron door, sealed shut.' },
                { text: 'Strange symbols are carved into the metal.' },
                { text: 'You can feel cold air seeping through the cracks.' },
                { text: '(You need to befriend Fred to open this door.)' }
            ]
        },

        'fred_house_locked': {
            speaker: null,
            lines: [
                { text: "Someone's house. The nameplate says 'FRED'." },
                { text: "It would be rude to enter without being invited." },
                { text: "(Maybe you should talk to Fred in the village first.)" }
            ]
        },

        // ==================== MINES ====================
        'mines_entrance': {
            speaker: null,
            lines: [
                { text: 'Cold, stale air rushes up from below.' },
                { text: 'The old mine shaft stretches into darkness.' },
                { text: 'You can hear distant sounds echoing from the depths...' }
            ]
        },

        'mines_save_point': {
            speaker: null,
            lines: [
                { text: 'The faint glow pushes back the darkness.' },
                { text: 'You steel yourself for what lies below.' },
                { text: '(HP fully restored.)' }
            ]
        },

        'mines_elevator_up': {
            speaker: null,
            lines: [
                { text: 'An old mining elevator.' },
                { text: 'It creaks but seems functional.' }
            ],
            choices: [
                { text: 'Go to Surface', next: 'elevator_to_surface' },
                { text: 'Stay here', next: null }
            ]
        },

        'mines_elevator_with_levels': {
            speaker: null,
            lines: [
                { text: 'An old mining elevator.' },
                { text: 'It remembers where you have been.' },
                { text: 'Where do you want to go?' }
            ]
        },

        'elevator_to_surface': {
            speaker: null,
            lines: [
                { text: 'The elevator groans to life...' },
                { text: '*CLANK CLANK CLANK*' },
                { text: 'You ascend through the darkness.' }
            ]
        },

        'elevator_descend': {
            speaker: null,
            lines: [
                { text: 'The elevator shudders...' },
                { text: '*CLANK CLANK CLANK*' },
                { text: 'You descend deeper into the mines.' }
            ]
        },

        'mines_level_5': {
            speaker: null,
            lines: [
                { text: 'Level -5: The Upper Mines' },
                { text: 'Old mining equipment lies abandoned.' },
                { text: 'The creatures here seem almost... normal.' }
            ],
            setFlags: { 'mines_elevator_unlocked_5': true }
        },

        'mines_level_10': {
            speaker: null,
            lines: [
                { text: 'Level -10: The Forgotten Tunnels' },
                { text: 'These tunnels are older than the village itself.' },
                { text: 'Strange markings cover the walls.' }
            ],
            setFlags: { 'mines_elevator_unlocked_10': true }
        },

        'mines_level_15': {
            speaker: null,
            lines: [
                { text: 'Level -15: The Crystal Veins' },
                { text: 'Crystals grow from the walls here.' },
                { text: 'But they pulse with an unnatural light...' }
            ],
            setFlags: { 'mines_elevator_unlocked_15': true }
        },

        'mines_level_20': {
            speaker: null,
            lines: [
                { text: 'Level -20: The Deep Dark' },
                { text: 'Light seems to struggle to exist here.' },
                { text: 'You can feel something watching you.' }
            ],
            setFlags: { 'mines_elevator_unlocked_20': true }
        },

        'mines_level_25': {
            speaker: null,
            lines: [
                { text: 'Level -25: The Bone Gallery' },
                { text: 'Fossils of creatures long extinct line the walls.' },
                { text: 'Some of them are... enormous.' }
            ],
            setFlags: { 'mines_elevator_unlocked_25': true }
        },

        'mines_level_30': {
            speaker: null,
            lines: [
                { text: 'Level -30: The Whisper Depths' },
                { text: 'You can hear voices... but see no one.' },
                { text: "They speak of things that shouldn't be." }
            ],
            setFlags: { 'mines_elevator_unlocked_30': true }
        },

        'mines_level_35': {
            speaker: null,
            lines: [
                { text: 'Level -35: The Ancient Ruins' },
                { text: 'A civilization existed here once.' },
                { text: 'What happened to them?' }
            ],
            setFlags: { 'mines_elevator_unlocked_35': true }
        },

        'mines_level_40': {
            speaker: null,
            lines: [
                { text: 'Level -40: The Nightmare Caverns' },
                { text: 'Reality feels... thin here.' },
                { text: 'The creatures here defy explanation.' }
            ],
            setFlags: { 'mines_elevator_unlocked_40': true }
        },

        'mines_level_45': {
            speaker: null,
            lines: [
                { text: 'Level -45: The Abyssal Gate' },
                { text: 'Massive doors block further descent.' },
                { text: 'But they stand open now... waiting.' }
            ],
            setFlags: { 'mines_elevator_unlocked_45': true }
        },

        'mines_level_50': {
            speaker: null,
            lines: [
                { text: 'Level -50: The Heart of Darkness' },
                { text: 'This is it. The deepest point.' },
                { text: 'Something ancient stirs ahead...' }
            ],
            setFlags: { 'mines_elevator_unlocked_50': true }
        },

        'mines_boss_intro': {
            speaker: 'THE ANCIENT ONE',
            portrait: 'ancient_boss',
            lines: [
                { text: '...' },
                { text: '...you have come...' },
                { text: '...after all this time...' },
                { text: '...a visitor...' },
                { text: 'I have slumbered here for eons.' },
                { text: 'Waiting... dreaming of the surface.' },
                { text: 'Fred... I remember Fred.' },
                { text: 'He ran. They all ran.' },
                { text: 'But you... you came DOWN.' },
                { text: 'Interesting.' },
                { text: 'Let us see if you are worthy...' },
                { text: '...of learning the truth.' }
            ]
        },

        'mines_boss_spare': {
            speaker: 'THE ANCIENT ONE',
            portrait: 'ancient_boss',
            lines: [
                { text: '...you would spare me?' },
                { text: '...after all I have done?' },
                { text: '...' },
                { text: 'Perhaps... the surface has changed.' },
                { text: 'Perhaps there is hope after all.' },
                { text: 'Take this gift, young one.' },
                { text: 'Tell Fred... I am sorry.' },
                { text: 'I only wanted... to be remembered.' }
            ],
            setFlags: { 'mines_boss_spared': true },
            giveItem: 'ancient_heart'
        },

        'mines_boss_defeat': {
            speaker: null,
            lines: [
                { text: 'THE ANCIENT ONE crumbles to dust.' },
                { text: '...' },
                { text: 'The mines fall silent.' },
                { text: 'Whatever lurked here is gone.' },
                { text: 'But was this the right choice?' }
            ],
            setFlags: { 'mines_boss_killed': true, 'mines_boss_defeated': true }
        },

        'fred_mine_map': {
            speaker: null,
            lines: [
                { text: 'A hand-drawn map of the mines.' },
                { text: 'Levels are marked from -1 to -50.' },
                { text: 'Every 5 levels, an "E" is marked - elevators?' },
                { text: 'At the bottom, a large circle with "???" inside.' },
                { text: 'Scrawled in the corner: "DON\'T WAKE HIM"' }
            ]
        },

        'fred_conspiracy_board': {
            speaker: null,
            lines: [
                { text: 'A wall covered in drawings and notes.' },
                { text: 'Red string connects various points...' },
                { text: '"THE DARKNESS SPREADS" is written in large letters.' },
                { text: 'Drawings of eyes, shadows, and something massive...' },
                { text: 'One note reads: "Level -50. I saw it. IT SAW ME."' },
                { text: 'Another: "No one believes. But I KNOW."' }
            ]
        },

        'fred_desk': {
            speaker: null,
            lines: [
                { text: "Fred's research desk. Covered in papers and ink stains." },
                { text: 'An open journal reads:' },
                { text: '"Day 847: Still no one listens."' },
                { text: '"Day 848: The dreams are getting worse."' },
                { text: '"Day 849: I can hear it calling from below..."' },
                { text: 'The rest of the pages are filled with frantic scribbles.' }
            ]
        },

        'fred_bookshelf': {
            speaker: null,
            lines: [
                { text: 'A bookshelf stuffed with old tomes and scrolls.' },
                { text: 'Most titles are faded or in languages you don\'t recognize.' },
                { text: 'One book stands out: "ENTITIES OF THE DEEP"' },
                { text: 'It\'s been read so many times the spine is falling apart.' }
            ]
        },

        'fred_floor_papers': {
            speaker: null,
            lines: [
                { text: 'Papers scattered all over the floor...' },
                { text: 'Drawings of mine tunnels, strange creatures...' },
                { text: 'Notes about "elevator maintenance schedules"...' },
                { text: 'A crumpled letter: "Fred, please come home. -Mom"' },
                { text: '...it looks like it was never sent.' }
            ]
        },

        // Dynamic Fred dialogue handlers
        'fred_talk_dynamic': {
            speaker: 'Fred',
            portrait: 'npc_neutral',
            dynamicDialogue: 'fred',
            lines: [
                { text: '*twitch*' },
                { text: 'You... you feel it too, yes?' }
            ]
        },

        'fred_at_home_dynamic': {
            speaker: 'Fred',
            portrait: 'npc_neutral',
            dynamicDialogue: 'fred_home',
            lines: [
                { text: '*twitch*' },
                { text: 'Welcome to my humble home...' }
            ]
        },

        // Ancient One phase dialogues
        'ancient_phase2': {
            speaker: 'THE ANCIENT ONE',
            portrait: 'ancient_boss',
            lines: [
                { text: '...you persist...' },
                { text: '...why do you fight?' },
                { text: '...I only wanted... company...' }
            ]
        },

        'ancient_phase3': {
            speaker: 'THE ANCIENT ONE',
            portrait: 'ancient_boss',
            lines: [
                { text: '...the loneliness... it consumes...' },
                { text: '...Fred understood... once...' },
                { text: '...but he ran... they all run...' }
            ]
        },

        'ancient_phase4': {
            speaker: 'THE ANCIENT ONE',
            portrait: 'ancient_boss',
            lines: [
                { text: '...I am... so tired...' },
                { text: '...so very... tired...' },
                { text: '...will no one... remember me?' }
            ]
        },

        'ancient_final': {
            speaker: 'THE ANCIENT ONE',
            portrait: 'ancient_boss',
            lines: [
                { text: '...please...' },
                { text: '...just... remember...' },
                { text: '...that I existed...' }
            ]
        },

        // Elevator dialogues for each level
        'mines_elevator_5_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -5' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 5
        },

        'mines_elevator_10_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -10' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 10
        },

        'mines_elevator_15_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -15' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 15
        },

        'mines_elevator_20_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -20' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 20
        },

        'mines_elevator_25_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -25' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 25
        },

        'mines_elevator_30_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -30' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 30
        },

        'mines_elevator_35_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -35' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 35
        },

        'mines_elevator_40_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -40' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 40
        },

        'mines_elevator_45_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -45' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 45
        },

        'mines_elevator_50_use': {
            speaker: null,
            lines: [
                { text: 'Mining Elevator - Level -50' },
                { text: 'The deepest point.' },
                { text: 'Where would you like to go?' }
            ],
            elevatorLevel: 50
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
