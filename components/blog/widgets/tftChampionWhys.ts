// Kid-simple "what does this champion do" lines for the items sheet's
// By-champion tab.
//
// Riot's own ability text ships with the numbers blank ("Gain … Shield for …
// seconds"), which reads as broken. These lines say what each ability DOES —
// never how much — so they survive patches: numbers move every fortnight,
// mechanics rarely do. One or two short sentences each, no numbers anywhere.
//
// Keyed by exact champion display name; the test suite fails if a champion
// in tftReferenceData has no line here.

export const CHAMPION_WHYS: Record<string, string> = {
  // 1-cost
  Akali: 'Throws knives at one enemy — extra hurt if they are burning. If the knives kill, she throws them again.',
  Camille: 'Slashes one enemy and gives herself a shield to hide behind.',
  Cinderling: 'Calls sharp leaves down on one enemy that wound them and set them burning.',
  Karma: 'Ties one enemy with magic rope, hurting them, then bursts and slows everyone standing nearby.',
  Kobuko: 'Heals itself up, then its very next punch hits extra hard.',
  Leona: 'Smacks one enemy and stuns them. Starts every fight extra tough, though the toughness fades.',
  Ornn: 'Breathes on the enemies in front and shields himself. Blocking hits saves up toward a free treasure chest.',
  Pebbles: 'Fires a laser that keeps burning one enemy and melts their magic defense the longer it goes.',
  Rakan: 'Dances: shields himself, then speeds up whichever friend is hitting the hardest.',
  "Rek'Sai": 'Burrows and pops up under nearby enemies, stunning them. Constantly heals itself the whole fight.',
  Varus: 'Fires one piercing arrow straight through a whole line of enemies.',
  Veigar: 'Blasts one enemy — much harder if they are already hurt. Kills make him permanently stronger.',
  Xayah: 'Flaps into a flurry: faster attacks that shred armor with feathers.',
  Yorick: 'Heals and smacks one enemy. When he dies, a ghost pops out and taunts everyone into hitting it.',
  // 2-cost
  Alistar: 'Roars: heals himself, shakes off stuns, and heals two hurt friends — then slams and stuns one enemy.',
  Caitlyn: 'Every third shot is a big Headshot on one enemy. That is the whole trick — attack speed is everything.',
  Elise: 'Turns into a spider: tougher, her bites heal her, and later casts make her attack faster and faster.',
  Gromp: 'Belches an exploding bubble that burns and slows. Builds itself around whichever stats you give it.',
  Kayle: 'Keeps leveling up mid-fight: her attacks gain magic damage, then shred, then even more. Protect her and she takes over.',
  LeBlanc: 'Throws an exploding mirror image at one enemy that splashes the neighbors. After each fight she may copy one of your units.',
  Murkwolf: 'Jumps onto the weakest enemy and shreds them with fast empowered bites. Point it at the back line.',
  Scuttlecrab: 'Digs underground to heal and toughen up, then pops out spinning and hitting everyone around it.',
  Sejuani: 'Shields herself, then smashes everything in front of her — a cone and a line.',
  Shen: 'Shields himself and one hurt friend, then both hit faster and harder for a while. A bodyguard that shares.',
  Teemo: 'Throws exploding mushrooms into groups. Sometimes finds an extra mushroom lying around.',
  Warwick: 'Bites one enemy, heals from the bite, and gets faster for the rest of the fight. Never stops scaling.',
  Yunara: 'Dashes and throws a magic ball that bounces into nearby enemies. Wants attack speed and a straight line.',
  // 3-cost
  Azir: 'Calls sand soldiers that fight beside him while he commands them to strike fast. More soldiers, more damage.',
  Cassiopeia: 'Poisons enemies and the poison spreads — stacked poison melts them slowly. Patience pays.',
  Diana: 'Shields herself and fires moon balls at the enemies nearby. Sturdy for a damage dealer.',
  Fiddlesticks: 'Weakens nearby enemies\u2019 magic defense, then drains their life to heal itself. Gets better the longer it stands there.',
  Hecarim: 'Toughens up, heals, and sends ghost riders that stun a whole group. A tank that starts fights.',
  "Kha'Zix": 'Jumps on the loneliest enemy far away. If nobody stands next to them, it hurts far more — and refunds mana.',
  "Kog'Maw": 'Lobs exploding acid that keeps burning. Enemies already low on health take far worse. Lob it at crowds.',
  Krug: 'Gets huge, rolls into the enemy team, and splits into two little Krugs when it dies. Two bodies for the price of one.',
  'Mama Beak': 'Calls four baby beaks that all peck whatever she pecks. She multiplies every attack item by five.',
  'Master Yi': 'Every third hit strikes twice, and kills make him zoom. Give him attack speed and point him at anything.',
  Rammus: 'Taunts everyone into hitting him, gets extremely tough, then explodes the shield back at them. Punishes the whole enemy team for attacking.',
  Rengar: 'Jumps on the weakest enemy and stabs them — healing more the closer they were to dying. A finisher.',
  Tristana: 'Plants a bomb on one enemy, gains huge range and speed, and then it explodes over the whole area around them.',
  Vi: 'Roars to heal and become unstoppable, then punches fast while healing on every hit. Refuses to die.',
  // 4-cost
  Ahri: 'Drops one giant spirit bomb on the biggest crowd of enemies. Position her to see the crowd.',
  Amumu: 'Throws a tantrum: hurts and stuns everyone nearby — longer if they are burning — while constantly healing and burning its neighbors.',
  Aphelios: 'Slashes one enemy many times with his blade, then fires a blast over the area. A duelist that finishes with fireworks.',
  Brambleback: 'Powers up and ignores armor for a while. When its target dies, it leaps straight to the next one.',
  Ezreal: 'Blinks away from danger, shoots back, and every few casts fires a huge blast through the biggest group. Slippery and deadly.',
  Lillia: 'Heals herself and puts nearby enemies to sleep with butterflies. Wake them early and they take extra hurt.',
  Malphite: 'Turns to stone behind a big shield. When it breaks, dark energy explodes around him. The longer he stands, the bigger the boom.',
  Morgana: 'Blasts nearby enemies, curses them, and leaves a burning zone that melts them over time — while healing herself from the damage.',
  Nidalee: 'Throws magic javelins instead of attacking, and every third one snipes the weakest far-away enemy. Give her attack speed.',
  Sentinel: 'Shields up, then slams the ground toward the most enemies — knocking them up, hurting them, and draining their mana so they cannot cast back.',
  Sett: 'Heals up, then punches a huge cone in front of him. The first time he would fall, he gets mana instead of dying.',
  Sivir: 'Throws a bouncing blade through many enemies — kills make it bounce even more. She cleans up whole teams.',
  Soraka: 'Drops stars on one enemy. Once marked, extra stars keep raining on them. Focus fire, automated.',
  Zyra: 'Grows plants around the battlefield that shoot whatever walks near. More plants, more damage — protect the gardener.',
  // 5-cost
  Alune: 'Rains moon pieces on nearby enemies. When the moon is full, she drops the whole moon on everyone instead.',
  Ashe: 'Fires one enormous arrow through a line of enemies that leaves a burning trail behind it. Aim down the line.',
  Draven: 'Throws giant axes that bleed enemies, then cashes in the bleed for huge instant damage. His normal attacks hit random enemies, so he needs no aiming.',
  'Elder Dragon': 'Flies up where nothing can touch it, then crashes down stunning everyone and setting them burning. Its attacks splash the neighbors too.',
  Gnar: 'Turns giant, jumps into the biggest group, smashes their armor and magic defense off, and stuns them. Builds rage just by fighting.',
  Ivern: 'Shields friends and makes them hit harder. Casting again and again also speeds their attacks up. A support that scales with casting.',
  Kennen: 'Charges up from burning enemies, dashes straight through a group hurting them, and leaves a firestorm behind. Wants to be where the enemies are.',
  Lux: 'Fires one giant laser through the biggest group of enemies. Casting also gives mana to friends who share her traits.',
  Maokai: 'Hurts one enemy and heals its missing health. Blocking hits grows saplings that jump at enemies — and more pop out when it dies.',
  Taric: 'Heals and makes itself plus one paired buddy hit harder. When either gets low, both burst shields onto all nearby friends.',
};
