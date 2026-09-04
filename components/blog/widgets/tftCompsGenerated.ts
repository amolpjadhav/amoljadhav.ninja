// GENERATED FILE — do not edit by hand.
//
// Every public Set 18 comp, read off tftacademy's own data layer and named with
// Riot's display names via Community Dragon. Regenerate with:
//
//   node scripts/fetch-tft-comps.mjs --write
//
// Board positions are real: they come from each unit's slot on the hex grid,
// not from a guess about what its class implies. Item icon URLs come from the
// same Community Dragon entry as the item's name, so an item can never be
// listed without art.
//
// Source last updated 2026-09-03; generated 2026-09-04.

import type { Position } from './tftCompData';

export interface BoardUnit {
  name: string;
  position: Position;
  /** Present only when the comp wants the unit above 1-star. */
  stars?: number;
  items?: string[];
  /** A trait emblem the comp wants on this unit. */
  emblem?: string;
}

export interface StageTip {
  stage: string;
  tip: string;
}

export interface GeneratedComp {
  name: string;
  tier: string;
  style: string;
  difficulty: string;
  carry: string;
  early: BoardUnit[];
  final: BoardUnit[];
  tips: StageTip[];
  note?: string;
  carousel: string[];
}

/** Item display name -> icon URL, for every item any comp asks for. */
export const ITEM_ICONS: Record<string, string> = {
  "Adaptive Helm": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_adaptivehelm.png",
  "Archangel's Staff": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_archangelsstaff.png",
  "Blue Buff": "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/standard/blue_buff.png",
  "Bramble Vest": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_bramblevest.png",
  "Crownguard": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_crownguard.png",
  "Deathblade": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_deathblade.png",
  "Dragon's Claw": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_dragonsclaw.png",
  "Edge of Night": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_guardianangel.png",
  "Evenshroud": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_spectralgauntlet.png",
  "Executioner Emblem": "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/traits/spatula/set15/tft15_emblem_executioner.png",
  "Fae Emblem": "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/traits/spatula/set18/tft18_emblem_fae.png",
  "Flickerblades": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_artifact_navoriflickerplade.png",
  "Flora Fatalis Emblem": "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/traits/spatula/set18/tft18_emblem_florafatalis.png",
  "Gargoyle Stoneplate": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_gargoylestoneplate.png",
  "Giant Slayer": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_madredsbloodrazor.png",
  "Guinsoo's Rageblade": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_guinsoosrageblade.png",
  "Hand Of Justice": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_unstableconcoction.png",
  "Hextech Gunblade": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_hextechgunblade.png",
  "Infinity Edge": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_infinityedge.png",
  "Invoker Emblem": "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/traits/spatula/set16/tft16_emblem_invoker.png",
  "Ionic Spark": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_ionicspark.png",
  "Jeweled Gauntlet": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_jeweledgauntlet.png",
  "Kraken's Fury": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_krakenslayer.png",
  "Last Whisper": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_lastwhisper.png",
  "Morellonomicon": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_morellonomicon.png",
  "Nashor's Tooth": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_leviathan.png",
  "Protector's Vow": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_frozenheart.png",
  "Quicksilver": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_quicksilver.png",
  "Rabadon's Deathcap": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_rabadonsdeathcap.png",
  "Ravager Emblem": "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/traits/spatula/set18/tft18_emblem_ravager.png",
  "Red Buff": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_rapidfirecannon.png",
  "Spear of Shojin": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_spearofshojin.png",
  "Spirit Visage": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_spiritvisagerr.png",
  "Sprykin Emblem": "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/traits/spatula/set18/tft18_emblem_sprykin.png",
  "Steadfast Heart": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_nightharvester.png",
  "Sterak's Gage": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_steraksgage.png",
  "Striker's Flail": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_powergauntlet.png",
  "Sunfire Cape": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_redbuff.png",
  "Thief's Gloves": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_thiefsgloves.png",
  "Titan's Resolve": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_titansresolve.png",
  "Void Staff": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_voidstaff.png",
  "Warmog's Armor": "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/tft_item_warmogsarmor.png"
};

export const COMPS_SOURCE_UPDATED = "2026-09-03";

export const GENERATED_COMPS: GeneratedComp[] = [
  {
    "name": "Adaptor Reroll",
    "tier": "A",
    "style": "3-Cost Reroll",
    "difficulty": "Medium",
    "carry": "Master Yi",
    "early": [
      {
        "name": "Master Yi",
        "position": "mid"
      },
      {
        "name": "Karma",
        "position": "back"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Gromp",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Sett",
        "position": "front"
      },
      {
        "name": "Krug",
        "position": "front",
        "stars": 3
      },
      {
        "name": "Vi",
        "position": "front",
        "stars": 3,
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Gargoyle Stoneplate"
        ]
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Master Yi",
        "position": "mid",
        "stars": 3,
        "items": [
          "Guinsoo's Rageblade",
          "Edge of Night",
          "Titan's Resolve"
        ]
      },
      {
        "name": "Nidalee",
        "position": "back",
        "items": [
          "Guinsoo's Rageblade",
          "Spear of Shojin",
          "Rabadon's Deathcap"
        ]
      },
      {
        "name": "Kog'Maw",
        "position": "back",
        "stars": 3,
        "items": [
          "Spear of Shojin",
          "Rabadon's Deathcap",
          "Jeweled Gauntlet"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Ideally play around a Master Yi opener that can win streak. Blossom is very powerful to get early econ or item wisps."
      },
      {
        "stage": "Stage 3",
        "tip": "Add more Adaptors and frontline as you go. Finish Yi items by end of stage. You can even play 5 Blossom for maximum Wisp greed if you highroll the 4 costs."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 7 and roll for Master Yi 2, Kogmaw 2, and a Juggernaut Tank. Econ up and slow roll for 3*. Add Gromp or a flex unit in at 8."
      }
    ],
    "note": "+1 tier in strength with Artifact or Brawler emblem. Level 7 board is no Gromp. VI 3 is stronger than Krug 3, but harder to hit because of Vi's popularity. Item priority: Master Yi > Tank > Kogmaw > Nidalee. Only take Phoenix Primal buff if ahead. Otherwise, Execute / Healing Primal.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Edge of Night",
      "Chain Vest",
      "Recurve Bow"
    ]
  },
  {
    "name": "Defender Cassio",
    "tier": "A",
    "style": "3-Cost Reroll",
    "difficulty": "Easy",
    "carry": "Cassiopeia",
    "early": [
      {
        "name": "Karma",
        "position": "back"
      },
      {
        "name": "Leona",
        "position": "front"
      },
      {
        "name": "Ornn",
        "position": "front"
      },
      {
        "name": "LeBlanc",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Lillia",
        "position": "front",
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Ornn",
        "position": "front",
        "stars": 3
      },
      {
        "name": "Leona",
        "position": "front"
      },
      {
        "name": "Shen",
        "position": "front"
      },
      {
        "name": "Fiddlesticks",
        "position": "front",
        "stars": 3,
        "items": [
          "Titan's Resolve",
          "Adaptive Helm",
          "Crownguard"
        ]
      },
      {
        "name": "Rammus",
        "position": "front",
        "stars": 3,
        "items": [
          "Ionic Spark",
          "Sunfire Cape",
          "Steadfast Heart"
        ]
      },
      {
        "name": "Cassiopeia",
        "position": "back",
        "stars": 3,
        "items": [
          "Spear of Shojin",
          "Hextech Gunblade",
          "Archangel's Staff"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Open with a strong AP opener, preferably around Invokers. Karma is an example shown but you can also play Invokers or Coven lose streak."
      },
      {
        "stage": "Stage 3",
        "tip": "If lose streaking with Coven, try to kill some units each fight to preserve HP. If win streaking, push standard winstreak tempo (6 @ 3-2, 7 @ 3-5) and save econ."
      },
      {
        "stage": "Stage 4",
        "tip": "Cash out / roll on level 7 for Cassio 2 / Fiddle 2. Then econ up and slow roll above 50g for 3* units. Then level to 8 for a duo carry."
      }
    ],
    "note": "Very BIS dependent. Can play from Coven Cashout. Can also play for Ornn 3 to potentially farm Artifacts. Always play 6 Defender. Duo carry on 8 is any 4 or 5 cost AP carry. Titans on fiddle because we have no other use for bow.",
    "carousel": [
      "Spear of Shojin",
      "Hextech Gunblade",
      "Chain Vest",
      "Needlessly Large Rod"
    ]
  },
  {
    "name": "Draven AD 9",
    "tier": "A",
    "style": "Fast 9",
    "difficulty": "Hard",
    "carry": "Draven",
    "early": [
      {
        "name": "Rengar",
        "position": "mid",
        "items": [
          "Guinsoo's Rageblade",
          "Last Whisper",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Rek'Sai",
        "position": "front"
      },
      {
        "name": "Alistar",
        "position": "front"
      },
      {
        "name": "Warwick",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Stonebark",
        "position": "front"
      },
      {
        "name": "Alistar",
        "position": "front"
      },
      {
        "name": "Amumu",
        "position": "front"
      },
      {
        "name": "Kennen",
        "position": "front",
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Taric",
        "position": "front"
      },
      {
        "name": "Maokai",
        "position": "front",
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Bramble Vest"
        ]
      },
      {
        "name": "Gnar",
        "position": "mid",
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Ivern",
        "position": "back"
      },
      {
        "name": "Lifeblossom",
        "position": "back"
      },
      {
        "name": "Ezreal",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Last Whisper",
          "Deathblade"
        ]
      },
      {
        "name": "Draven",
        "position": "back",
        "items": [
          "Kraken's Fury",
          "Guinsoo's Rageblade",
          "Deathblade"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Slam items aggressively and play for full win streak with Draven items. Ideal opener will be some kind of resource engine like Rengar or Blossom."
      },
      {
        "stage": "Stage 3",
        "tip": "Continue prioritize win streaking. If you have an econ augment, you can go Fast 7 (before 3-3) to maintain win streak if needed."
      },
      {
        "stage": "Stage 4",
        "tip": "You can start losing rounds while focusing on econ. Fast 9 end of Stage 4 and look for the scaling 5 costs like Draven, Maokai, and Ivern."
      }
    ],
    "note": "Only play from early win streak and lots of gold. Because you are aiming for scaling 5 costs, aim to level 9 around end of Stage 4 / beginning of Stage 5. Best Draven quests are dealing damage for gold, but avoid the 10k damage in 1 round because you can get trapped.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Last Whisper",
      "Kraken's Fury",
      "Giant's Belt"
    ]
  },
  {
    "name": "Malphite AP Flex",
    "tier": "A",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Malphite",
    "early": [
      {
        "name": "Karma",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Void Staff"
        ]
      },
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Yunara",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Malphite",
        "position": "front",
        "items": [
          "Gargoyle Stoneplate",
          "Warmog's Armor",
          "Crownguard"
        ]
      },
      {
        "name": "Amumu",
        "position": "mid"
      },
      {
        "name": "Kennen",
        "position": "mid"
      },
      {
        "name": "Fiddlesticks",
        "position": "mid"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Azir",
        "position": "back"
      },
      {
        "name": "Soraka",
        "position": "back",
        "items": [
          "Rabadon's Deathcap",
          "Nashor's Tooth",
          "Spear of Shojin"
        ]
      },
      {
        "name": "Zyra",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Void Staff",
          "Archangel's Staff"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Open with a strong AP opener, preferably around Blossom. Slam generic AP items and Malphite items for a win streak."
      },
      {
        "stage": "Stage 3",
        "tip": "Add in useful 3 costs like Fiddlesticks, Cassio, Azir then flex around their traits. General rule: put items on upgraded units."
      },
      {
        "stage": "Stage 4",
        "tip": "Level and roll for Malphite. You will often have to itemize and work with whoever you hit so don't overly tunnel on your roll down."
      }
    ],
    "note": "Core is Malphite + Azir + 2 Flora Fatalis for healing. Can play Ahri/Zyra/Ezreal as additional carries and Lillia/Amumu/Kennen/Maokai as supporting frontline.",
    "carousel": [
      "Gargoyle Stoneplate",
      "Tear of the Goddess",
      "Needlessly Large Rod",
      "Recurve Bow"
    ]
  },
  {
    "name": "Primal Jungle",
    "tier": "A",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Sivir",
    "early": [
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Cinderling",
        "position": "back",
        "items": [
          "Infinity Edge",
          "Spear of Shojin"
        ]
      },
      {
        "name": "Gromp",
        "position": "back"
      },
      {
        "name": "Scuttlecrab",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Malphite",
        "position": "front",
        "items": [
          "Gargoyle Stoneplate",
          "Warmog's Armor",
          "Crownguard"
        ]
      },
      {
        "name": "Nidalee",
        "position": "mid",
        "items": [
          "Infinity Edge",
          "Sterak's Gage",
          "Spear of Shojin"
        ]
      },
      {
        "name": "Krug",
        "position": "mid"
      },
      {
        "name": "Sentinel",
        "position": "mid"
      },
      {
        "name": "Rek'Sai",
        "position": "mid"
      },
      {
        "name": "Sivir",
        "position": "back",
        "items": [
          "Infinity Edge",
          "Red Buff",
          "Striker's Flail"
        ]
      },
      {
        "name": "Kog'Maw",
        "position": "back"
      },
      {
        "name": "Cinderling",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Play around a strong AD opener around Cinderling 2 with Riftbeasts. Slam all your AD and tank items aggressively for win streak."
      },
      {
        "stage": "Stage 3",
        "tip": "Comp is very Sword hungry so keep taking them off augments / carousels when possible. You can flex in 5 Riftbeast for better shops or more generic frontline."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 8 and roll for Nidalee, Sivir, and Malphite / tank. If Malphite is too contested, consider Sentinel or Krug tank instead."
      }
    ],
    "note": "Krug on the Blackthorn hex. Prioritize Nidalee > Sivir items. Kogmaw provides free Shred and Sunder. Max cap is drop riftbeasts for Gnar + Ashe + Taric. Hunter emblem is incredible on Nidalee.",
    "carousel": [
      "Infinity Edge",
      "B.F. Sword",
      "Sparring Gloves",
      "Giant's Belt"
    ]
  },
  {
    "name": "Solar Kayle",
    "tier": "A",
    "style": "2-Cost Reroll",
    "difficulty": "Easy",
    "carry": "Kayle",
    "early": [
      {
        "name": "Leona",
        "position": "mid"
      },
      {
        "name": "Ornn",
        "position": "front",
        "items": [
          "Gargoyle Stoneplate"
        ]
      },
      {
        "name": "Sejuani",
        "position": "mid"
      },
      {
        "name": "Kayle",
        "position": "back",
        "items": [
          "Guinsoo's Rageblade"
        ]
      }
    ],
    "final": [
      {
        "name": "Stonebark",
        "position": "front"
      },
      {
        "name": "Ornn",
        "position": "front",
        "stars": 3,
        "items": [
          "Gargoyle Stoneplate",
          "Warmog's Armor",
          "Spirit Visage"
        ]
      },
      {
        "name": "Sejuani",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Leona",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Rakan",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Hecarim",
        "position": "mid"
      },
      {
        "name": "Lifeblossom",
        "position": "back"
      },
      {
        "name": "Xayah",
        "position": "back",
        "stars": 3,
        "items": [
          "Guinsoo's Rageblade",
          "Red Buff",
          "Deathblade"
        ]
      },
      {
        "name": "Kayle",
        "position": "back",
        "stars": 3,
        "items": [
          "Guinsoo's Rageblade",
          "Flickerblades",
          "Rabadon's Deathcap"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Ideally open with Kayle and upgraded Ornn. After Rageblade, prioritize tank items on Ornn so he can begin reliably stacking Artifact scaling."
      },
      {
        "stage": "Stage 3",
        "tip": "Bench priority: Kayle 3 > Ornn 3 > Xayah / Leona > Sejuani > Rakan. Once you finish 1 costs, move up to level 6 for 2 costs."
      },
      {
        "stage": "Stage 4",
        "tip": "Finish your 3* and level for Elderwood. Cap with any 5 costs like Lux, Ivern, Taric, etc."
      }
    ],
    "note": "Roll on 3-1 to try and finish a 3* 1 cost for bench space -> Slow roll above 50g on level 5. Ornn Artifact print is very strong but only scales quickly once you get him to 3*. Kayle has built in 20% Shred at 2*.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Gargoyle Stoneplate",
      "Needlessly Large Rod",
      "Sparring Gloves"
    ]
  },
  {
    "name": "Yi Rengar",
    "tier": "A",
    "style": "3-Cost Reroll",
    "difficulty": "Medium",
    "carry": "Master Yi",
    "early": [
      {
        "name": "Karma",
        "position": "back"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Gromp",
        "position": "back"
      },
      {
        "name": "Master Yi",
        "position": "mid",
        "items": [
          "Guinsoo's Rageblade"
        ]
      }
    ],
    "final": [
      {
        "name": "Sett",
        "position": "front"
      },
      {
        "name": "Krug",
        "position": "front",
        "stars": 3
      },
      {
        "name": "Vi",
        "position": "front",
        "stars": 3,
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Evenshroud"
        ]
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Rengar",
        "position": "mid",
        "stars": 3,
        "items": [
          "Titan's Resolve",
          "Edge of Night",
          "Guinsoo's Rageblade"
        ]
      },
      {
        "name": "Master Yi",
        "position": "mid",
        "stars": 3,
        "items": [
          "Guinsoo's Rageblade",
          "Edge of Night",
          "Titan's Resolve"
        ]
      },
      {
        "name": "Nidalee",
        "position": "back",
        "items": [
          "Guinsoo's Rageblade",
          "Spear of Shojin",
          "Rabadon's Deathcap"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Ideally play around a Rengar opener that can win streak. Blossom is very powerful to get early econ or item wisps."
      },
      {
        "stage": "Stage 3",
        "tip": "Add more Adaptors and frontline as you go. Finish Yi/Rengar items by end of stage. You can even play 5 Blossom for maximum Wisp greed if you highroll the 4 costs."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 7 and roll for Master Yi 2, Rengar 2, and a Juggernaut Tank. Econ up and slow roll for 3*. Add Kog or a flex unit in at 8."
      }
    ],
    "note": "+1 tier in strength with Artifact.  VI 3 is stronger than Krug 3. Item priority: Master Yi/Rengar > Tank > Nidalee. Only take Phoenix Primal buff if ahead. Otherwise, Execute / Healing Primal. Rengar and Yi have the exact same BIS. Yi is stronger but itemize whoever is upgraded first.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Recurve Bow",
      "Chain Vest",
      "B.F. Sword"
    ]
  },
  {
    "name": "10 Riftbeast",
    "tier": "B",
    "style": "Fast 9",
    "difficulty": "Medium",
    "carry": "Elder Dragon",
    "early": [
      {
        "name": "Cinderling",
        "position": "back",
        "items": [
          "Infinity Edge"
        ]
      },
      {
        "name": "Pebbles",
        "position": "back"
      },
      {
        "name": "Scuttlecrab",
        "position": "front"
      },
      {
        "name": "Yorick",
        "position": "mid"
      }
    ],
    "final": [
      {
        "name": "Krug",
        "position": "front"
      },
      {
        "name": "Scuttlecrab",
        "position": "front"
      },
      {
        "name": "Brambleback",
        "position": "front",
        "items": [
          "Edge of Night",
          "Quicksilver",
          "Giant Slayer"
        ]
      },
      {
        "name": "Sentinel",
        "position": "front",
        "items": [
          "Warmog's Armor",
          "Protector's Vow",
          "Crownguard"
        ]
      },
      {
        "name": "Taric",
        "position": "front"
      },
      {
        "name": "Gnar",
        "position": "mid",
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Elder Dragon",
        "position": "mid",
        "items": [
          "Infinity Edge",
          "Striker's Flail",
          "Deathblade"
        ]
      },
      {
        "name": "Gromp",
        "position": "back"
      },
      {
        "name": "Pebbles",
        "position": "back"
      },
      {
        "name": "Mama Beak",
        "position": "back"
      },
      {
        "name": "Murkwolf",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Slam items aggressively and play for full win streak with Riftbeast items. Ideal opener will be Riftbeasts featuring Cinderling / Gromp / Mama Beak carry."
      },
      {
        "stage": "Stage 3",
        "tip": "Continue prioritize win streaking. If you have an econ augment, you can go Fast 7 (before 3-3) to maintain win streak if needed."
      },
      {
        "stage": "Stage 4",
        "tip": "You can start losing rounds while focusing on econ. Fast 9 by the beginning of Stage 5 and look for your 5 costs. You want around 70g+ minimum for the rolldown."
      }
    ],
    "note": "Alpha Mark the Elder Dragon. Strong with any augment that gives you +1 team size so you can fit in another carry.",
    "carousel": [
      "Infinity Edge",
      "B.F. Sword",
      "Sparring Gloves",
      "Giant's Belt"
    ]
  },
  {
    "name": "Ahri Morgana",
    "tier": "B",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Ahri",
    "early": [
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Karma",
        "position": "back",
        "items": [
          "Jeweled Gauntlet",
          "Spear of Shojin"
        ]
      },
      {
        "name": "Yunara",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Krug",
        "position": "front"
      },
      {
        "name": "Taric",
        "position": "front"
      },
      {
        "name": "Sentinel",
        "position": "front"
      },
      {
        "name": "Sett",
        "position": "front",
        "items": [
          "Bramble Vest",
          "Warmog's Armor",
          "Dragon's Claw"
        ]
      },
      {
        "name": "Morgana",
        "position": "mid",
        "items": [
          "Void Staff",
          "Morellonomicon"
        ]
      },
      {
        "name": "Karma",
        "position": "back"
      },
      {
        "name": "Pebbles",
        "position": "back"
      },
      {
        "name": "Ahri",
        "position": "back",
        "items": [
          "Jeweled Gauntlet",
          "Striker's Flail",
          "Spear of Shojin"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Look for 3 Blossom early and play for win streak. Karma can hold items for Ahri. Itemize Yorick or any other 2* tank."
      },
      {
        "stage": "Stage 3",
        "tip": "Flex in more Blossom or Spellweavers as you get them. You can tank all kinds of frontline: Juggernauts, Defenders, or Vanguards."
      },
      {
        "stage": "Stage 4",
        "tip": "Level and roll for Ahri, Morgana, and the frontline. Once stable, go level 9 for Lux."
      }
    ],
    "note": "Morgana holds utility items. You can tank either Sentinel or Sett. Best emblem = Invoker on Ahri. Blossom emblem can go on frontline or Morgana.",
    "carousel": [
      "Spear of Shojin",
      "Jeweled Gauntlet",
      "Giant's Belt",
      "Tear of the Goddess"
    ]
  },
  {
    "name": "Ahri Spellweavers",
    "tier": "B",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Ahri",
    "early": [
      {
        "name": "Karma",
        "position": "back"
      },
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Yunara",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Lillia",
        "position": "front",
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Crownguard"
        ]
      },
      {
        "name": "Fiddlesticks",
        "position": "mid"
      },
      {
        "name": "Diana",
        "position": "mid"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Karma",
        "position": "back"
      },
      {
        "name": "Zyra",
        "position": "back",
        "items": [
          "Void Staff",
          "Morellonomicon",
          "Spear of Shojin"
        ]
      },
      {
        "name": "Alune",
        "position": "back"
      },
      {
        "name": "Ahri",
        "position": "back",
        "items": [
          "Jeweled Gauntlet",
          "Striker's Flail",
          "Spear of Shojin"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Look for 3 Blossom early and play for win streak. Karma can hold items for Ahri. Itemize Yorick or any other 2* tank."
      },
      {
        "stage": "Stage 3",
        "tip": "Flex in more Spellweavers + frontline as you get them. You can tank all kinds of frontline: Juggernauts, Defenders, or Vanguards."
      },
      {
        "stage": "Stage 4",
        "tip": "Level and roll for Ahri, Zyra, and the 4 Spellweavers. Play Cassio or LeBlanc until you find Alune."
      }
    ],
    "note": "No Sett version of Ahri carry. Best when played from ahead and can push level 9 for Alune. Ahri 2 is better than Alune 2 so only give Alune leftover items.",
    "carousel": [
      "Spear of Shojin",
      "Jeweled Gauntlet",
      "Giant's Belt",
      "Tear of the Goddess"
    ]
  },
  {
    "name": "Aphelios Elderwood",
    "tier": "B",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Aphelios",
    "early": [
      {
        "name": "Ornn",
        "position": "front",
        "items": [
          "Evenshroud"
        ]
      },
      {
        "name": "Varus",
        "position": "flex"
      },
      {
        "name": "Xayah",
        "position": "back",
        "items": [
          "Red Buff"
        ]
      },
      {
        "name": "Shen",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Lillia",
        "position": "front",
        "items": [
          "Protector's Vow"
        ]
      },
      {
        "name": "Stonebark",
        "position": "front"
      },
      {
        "name": "Hecarim",
        "position": "front",
        "items": [
          "Crownguard",
          "Warmog's Armor",
          "Evenshroud"
        ]
      },
      {
        "name": "Diana",
        "position": "front",
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Ornn",
        "position": "front"
      },
      {
        "name": "Alistar",
        "position": "front"
      },
      {
        "name": "Stonebark",
        "position": "front"
      },
      {
        "name": "Gnar",
        "position": "mid",
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Lifeblossom",
        "position": "mid"
      },
      {
        "name": "Aphelios",
        "position": "back",
        "items": [
          "Red Buff",
          "Deathblade",
          "Giant Slayer"
        ]
      },
      {
        "name": "Alune",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Rabadon's Deathcap",
          "Jeweled Gauntlet"
        ]
      },
      {
        "name": "Xayah",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Open with a strong win streak AD tempo around Rapidfires. BIS is somewhat fake in this comp so slam aggressively to win."
      },
      {
        "stage": "Stage 3",
        "tip": "Comp can use many items so take item augment if you don't have one yet. Mama Beak can be a strong carry here if you have Riftbeasts online."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 8 and roll heavily for Aphelios and the 4 costs. Only push for 9 once you have almost all your 4 costs upgraded."
      }
    ],
    "note": "Cheap version of Aphelios to push to level 9, but falls off hard if you end the game on this comp. Red Buff is BIS Aphelios but you can also play Rageblade build. Alune spot is flexible for any duo carry or 5 cost.",
    "carousel": [
      "Recurve Bow",
      "B.F. Sword",
      "Sparring Gloves",
      "Chain Vest"
    ]
  },
  {
    "name": "Aphelios Vanguards",
    "tier": "B",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Aphelios",
    "early": [
      {
        "name": "Ornn",
        "position": "front"
      },
      {
        "name": "Varus",
        "position": "flex"
      },
      {
        "name": "Xayah",
        "position": "back",
        "items": [
          "Last Whisper",
          "Red Buff"
        ]
      },
      {
        "name": "Shen",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Taric",
        "position": "front"
      },
      {
        "name": "Sentinel",
        "position": "front",
        "items": [
          "Protector's Vow",
          "Protector's Vow",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Brambleback",
        "position": "mid",
        "items": [
          "Edge of Night",
          "Quicksilver",
          "Sterak's Gage"
        ]
      },
      {
        "name": "Diana",
        "position": "mid"
      },
      {
        "name": "Hecarim",
        "position": "mid"
      },
      {
        "name": "Aphelios",
        "position": "back",
        "items": [
          "Red Buff",
          "Deathblade",
          "Giant Slayer"
        ]
      },
      {
        "name": "Mama Beak",
        "position": "back",
        "items": [
          "Last Whisper"
        ]
      },
      {
        "name": "Zyra",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Open with a strong win streak AD tempo around Rapidfires. BIS is somewhat fake in this comp so slam aggressively to win."
      },
      {
        "stage": "Stage 3",
        "tip": "Comp can use many items so take item augment if you don't have one yet. Mama Beak can be a strong carry here if you have Riftbeasts online."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 8 and roll heavily for Aphelios and the 4 costs. Only push for 9 once you have almost all your 4 costs upgraded."
      }
    ],
    "note": "Core units are Aphelios + Diana + Sentinel + Mama Beak. Red Buff is BIS Aphelios but you can also play Rageblade build. Play Scuttlecrab + Rakan over Brambleback if no melee items. Can duo carry Zyra or Morgana if extra AP items.",
    "carousel": [
      "Recurve Bow",
      "B.F. Sword",
      "Sparring Gloves",
      "Chain Vest"
    ]
  },
  {
    "name": "Caitlyn Hunters",
    "tier": "B",
    "style": "2-Cost Reroll",
    "difficulty": "Easy",
    "carry": "Caitlyn",
    "early": [
      {
        "name": "Caitlyn",
        "position": "back"
      },
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Tristana",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Scuttlecrab",
        "position": "front",
        "stars": 3,
        "items": [
          "Spirit Visage",
          "Gargoyle Stoneplate",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Sejuani",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Vi",
        "position": "mid"
      },
      {
        "name": "Tristana",
        "position": "back"
      },
      {
        "name": "Sivir",
        "position": "back",
        "items": [
          "Infinity Edge",
          "Last Whisper",
          "Red Buff"
        ]
      },
      {
        "name": "Caitlyn",
        "position": "back",
        "stars": 3,
        "items": [
          "Guinsoo's Rageblade",
          "Kraken's Fury",
          "Kraken's Fury"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Slam Rageblade and bow items on Caitlyn for a winstreak. BIS Caitlyn is often hard to get so you can also slam items like Gunblade or Giant Slayer."
      },
      {
        "stage": "Stage 3",
        "tip": "Level to 6 and roll for 4 Juggernaut + 2 Hunter. Ideally upgrade Caitlyn 2 and 2 cost Juggernaut then econ up -> slow roll above 50g for 3* units."
      },
      {
        "stage": "Stage 4",
        "tip": "Finish your 3* ideally by mid Stage 4. Level for more Hunters. Take Execute or Tank Primal unless you are super high rolling and can take items."
      }
    ],
    "note": "Can also tank Sejuani 3. Tank whoever you can hit first. Can also play 4 Vanguard version with Elise. Sivir takes leftover utility / AD items (red buff highly impractical so oftentimes you play Morello).",
    "carousel": [
      "Guinsoo's Rageblade",
      "Kraken's Fury",
      "Recurve Bow",
      "Giant's Belt"
    ]
  },
  {
    "name": "Coven Ahri",
    "tier": "B",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Ahri",
    "early": [
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Karma",
        "position": "back",
        "items": [
          "Jeweled Gauntlet",
          "Spear of Shojin"
        ]
      },
      {
        "name": "Yunara",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Taric",
        "position": "front"
      },
      {
        "name": "Sentinel",
        "position": "front",
        "items": [
          "Crownguard",
          "Protector's Vow",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Diana",
        "position": "mid"
      },
      {
        "name": "Elise",
        "position": "mid"
      },
      {
        "name": "Morgana",
        "position": "mid",
        "items": [
          "Void Staff",
          "Morellonomicon"
        ]
      },
      {
        "name": "Fiddlesticks",
        "position": "mid"
      },
      {
        "name": "Ahri",
        "position": "back",
        "items": [
          "Jeweled Gauntlet",
          "Striker's Flail",
          "Spear of Shojin"
        ]
      },
      {
        "name": "Alune",
        "position": "back"
      },
      {
        "name": "Cassiopeia",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Look for 3 Blossom early and play for win streak. Karma can hold items for Ahri. Itemize Yorick or any other 2* tank."
      },
      {
        "stage": "Stage 3",
        "tip": "Flex in more Blossom or Spellweavers as you get them. You can tank all kinds of frontline: Juggernauts, Defenders, or Vanguards."
      },
      {
        "stage": "Stage 4",
        "tip": "Level and roll for Ahri, Morgana, and the frontline. Once stable, go level 9 for Lux."
      }
    ],
    "note": "Play Coven throughout the game but still using strongest board, try to greed for a 250 cash-out. Spellweaver emblem on Morgana->Drop Fiddle is really strong, so is Invoker emblem on Ahri.",
    "carousel": [
      "Spear of Shojin",
      "Jeweled Gauntlet",
      "Giant's Belt",
      "Tear of the Goddess"
    ]
  },
  {
    "name": "Dragon 9",
    "tier": "B",
    "style": "Fast 9",
    "difficulty": "Hard",
    "carry": "Elder Dragon",
    "early": [
      {
        "name": "Cinderling",
        "position": "back"
      },
      {
        "name": "Pebbles",
        "position": "back"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Scuttlecrab",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Taric",
        "position": "front"
      },
      {
        "name": "Kennen",
        "position": "front",
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Sentinel",
        "position": "front",
        "items": [
          "Protector's Vow"
        ]
      },
      {
        "name": "Amumu",
        "position": "front"
      },
      {
        "name": "Maokai",
        "position": "front",
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Crownguard"
        ]
      },
      {
        "name": "Morgana",
        "position": "mid",
        "items": [
          "Void Staff",
          "Rabadon's Deathcap",
          "Jeweled Gauntlet"
        ]
      },
      {
        "name": "Elder Dragon",
        "position": "mid",
        "items": [
          "Infinity Edge",
          "Deathblade",
          "Striker's Flail"
        ]
      },
      {
        "name": "Ivern",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Slam items aggressively and play for full win streak with Riftbeast items. Ideal opener will be Riftbeasts featuring Cinderling / Gromp / Mama Beak carry."
      },
      {
        "stage": "Stage 3",
        "tip": "Continue prioritize win streaking. If you have an econ augment, you can go Fast 7 (before 3-3) to maintain win streak if needed."
      },
      {
        "stage": "Stage 4",
        "tip": "You can start losing rounds while focusing on econ. Fast 9 by the beginning of Stage 5 and look for your 5 costs. You want around 70g+ minimum for the rolldown."
      }
    ],
    "note": "Alpha Mark the Elder Dragon. Your duo carry with Elder Dragon is highly flexible. Can replace Morgana for Lux, Alune, Soraka for AP options. Can also play AD duo carry: Ashe, Draven, Ezreal, etc.",
    "carousel": [
      "Infinity Edge",
      "B.F. Sword",
      "Sparring Gloves",
      "Giant's Belt"
    ]
  },
  {
    "name": "Invoker Morgana",
    "tier": "B",
    "style": "Lose Streak",
    "difficulty": "Hard",
    "carry": "Morgana",
    "early": [
      {
        "name": "Kobuko",
        "position": "mid"
      },
      {
        "name": "Pebbles",
        "position": "back"
      },
      {
        "name": "Teemo",
        "position": "back",
        "items": [
          "Void Staff",
          "Morellonomicon"
        ]
      },
      {
        "name": "Rammus",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Hecarim",
        "position": "front"
      },
      {
        "name": "Taric",
        "position": "front"
      },
      {
        "name": "Diana",
        "position": "front"
      },
      {
        "name": "Sentinel",
        "position": "front",
        "items": [
          "Protector's Vow",
          "Warmog's Armor",
          "Adaptive Helm"
        ]
      },
      {
        "name": "Morgana",
        "position": "mid",
        "items": [
          "Morellonomicon",
          "Rabadon's Deathcap",
          "Void Staff"
        ]
      },
      {
        "name": "Brambleback",
        "position": "mid",
        "items": [
          "Edge of Night",
          "Giant Slayer",
          "Quicksilver"
        ]
      },
      {
        "name": "Pebbles",
        "position": "back"
      },
      {
        "name": "Alune",
        "position": "back",
        "items": [
          "Invoker Emblem"
        ]
      },
      {
        "name": "Kog'Maw",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Open with a strong AP opener, preferably around Invokers. Teemo is an example shown but you can also play Pebbles, Spellweavers, or Coven."
      },
      {
        "stage": "Stage 3",
        "tip": "If lose streaking with Coven, try to kill some units each fight to preserve HP. If win streaking, push standard winstreak tempo (6 @ 3-2, 7 @ 3-5) and save econ."
      },
      {
        "stage": "Stage 4",
        "tip": "Cash out / roll down on level 8 for Morgana 2, Sentinel, and 4 Invoker. If you don't have Bramble items, flex in another AP carry like Ahri / Nidalee."
      }
    ],
    "note": "Can play from Coven Cashout. Aim for 250 + essence for chance at Morgana 2 + item cashout. Void staff still okay with Kog since he doesn't hit backline.",
    "carousel": [
      "Morellonomicon",
      "Void Staff",
      "Needlessly Large Rod",
      "Tear of the Goddess"
    ]
  },
  {
    "name": "Riftbeast Reroll",
    "tier": "B",
    "style": "1-Cost Reroll",
    "difficulty": "Easy",
    "carry": "Cinderling",
    "early": [
      {
        "name": "Cinderling",
        "position": "back"
      },
      {
        "name": "Pebbles",
        "position": "back"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Scuttlecrab",
        "position": "mid"
      }
    ],
    "final": [
      {
        "name": "Krug",
        "position": "front",
        "stars": 3,
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Spirit Visage"
        ]
      },
      {
        "name": "Sentinel",
        "position": "mid"
      },
      {
        "name": "Murkwolf",
        "position": "mid"
      },
      {
        "name": "Scuttlecrab",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Gnar",
        "position": "mid"
      },
      {
        "name": "Brambleback",
        "position": "mid",
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Pebbles",
        "position": "back",
        "stars": 3,
        "items": [
          "Blue Buff",
          "Rabadon's Deathcap",
          "Jeweled Gauntlet"
        ]
      },
      {
        "name": "Cinderling",
        "position": "back",
        "stars": 3,
        "items": [
          "Infinity Edge",
          "Blue Buff",
          "Last Whisper"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Slam items aggressively and play for full win streak with Pebbles items. Alpha Mark Crab or Gromp."
      },
      {
        "stage": "Stage 3",
        "tip": "Save up econ and try to go level 7  for 7 riftbeast on 3-5, if you're poor wait until 4-1."
      },
      {
        "stage": "Stage 4",
        "tip": "Once you have your 3*, level to 8 and field 7 Riftbeast. If you can get to 9, you can ditch 1* Ravagers for Elder Dragon."
      }
    ],
    "note": "Use 5 Riftbeast shops to finish your 3* because you want to rush 7 Riftbeast on Level 7 ASAP. You can carry ALL of the riftbeast carries besides Mama Beak if you have items. Krug 3 is the best tank but you can also tank Sentinel 2 > Scuttle Crab 3. Alpha Mark Cinderling early > Crab late.",
    "carousel": [
      "Last Whisper",
      "B.F. Sword",
      "Tear of the Goddess",
      "Giant's Belt"
    ]
  },
  {
    "name": "Spirit Blossom",
    "tier": "B",
    "style": "4-Cost Fast 8",
    "difficulty": "Easy",
    "carry": "Ahri",
    "early": [
      {
        "name": "Karma",
        "position": "back"
      },
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Yorick",
        "position": "front"
      },
      {
        "name": "Yunara",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Yorick",
        "position": "front"
      },
      {
        "name": "Vi",
        "position": "front"
      },
      {
        "name": "Sett",
        "position": "front",
        "items": [
          "Bramble Vest",
          "Dragon's Claw",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Gnar",
        "position": "mid"
      },
      {
        "name": "Karma",
        "position": "back"
      },
      {
        "name": "Zyra",
        "position": "back"
      },
      {
        "name": "Sivir",
        "position": "back"
      },
      {
        "name": "Ashe",
        "position": "back",
        "items": [
          "Red Buff",
          "Spear of Shojin",
          "Last Whisper"
        ]
      },
      {
        "name": "Ahri",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Jeweled Gauntlet",
          "Striker's Flail"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Look for 3 Blossom early and play for win streak. Karma can hold items for Ahri. Itemize Yorick or any other 2* tank."
      },
      {
        "stage": "Stage 3",
        "tip": "Add 5 Blossom when you can. Flex in Blackthorn (Veigar / Azir), Fiddlesticks + Defender, or other frontline while stacking econ. Always play Ahri 1 and itemize her."
      },
      {
        "stage": "Stage 4",
        "tip": "Level and roll for Ahri, Sett, and at least 5 Blossom. You can also temporarily play 7 Blossom for econ while going to 9. End game cap = replace Yorick / Karma."
      }
    ],
    "note": "Core of the comp is Ahri + Sett + Ashe. The rest of the units are flexible. If itemizing Sivir, go for Execute Primal. If far ahead and win streaking, you can play for Phoenix Primal.",
    "carousel": [
      "Spear of Shojin",
      "Jeweled Gauntlet",
      "Giant's Belt",
      "Sparring Gloves"
    ]
  },
  {
    "name": "Elderwood Executioners",
    "tier": "C",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Ezreal",
    "early": [
      {
        "name": "Ornn",
        "position": "front"
      },
      {
        "name": "Xayah",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Last Whisper"
        ]
      },
      {
        "name": "LeBlanc",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Void Staff"
        ]
      },
      {
        "name": "Shen",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Stonebark",
        "position": "front"
      },
      {
        "name": "Ornn",
        "position": "front"
      },
      {
        "name": "Alistar",
        "position": "front"
      },
      {
        "name": "Hecarim",
        "position": "front",
        "items": [
          "Dragon's Claw",
          "Bramble Vest",
          "Sunfire Cape"
        ]
      },
      {
        "name": "Taric",
        "position": "front"
      },
      {
        "name": "Fiddlesticks",
        "position": "front"
      },
      {
        "name": "Stonebark",
        "position": "front"
      },
      {
        "name": "Gnar",
        "position": "mid"
      },
      {
        "name": "Lux",
        "position": "back",
        "items": [
          "Executioner Emblem",
          "Spear of Shojin"
        ]
      },
      {
        "name": "Lifeblossom",
        "position": "back"
      },
      {
        "name": "Soraka",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Rabadon's Deathcap",
          "Void Staff"
        ]
      },
      {
        "name": "Ezreal",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Last Whisper",
          "Deathblade"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Open with upgraded Elderwood and slam items on LeBlanc or Xayah. LeBlanc can farm copies of units on your board so avoid fielding unwanted units."
      },
      {
        "stage": "Stage 3",
        "tip": "Add more Elderwood as you level with Spellweavers. If you start getting AD items, play them on Xayah / Rapidfires."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 8 and look for Ezreal and Soraka with 7 Elderwood. Try not to roll to 0g because we need gold to get to level 9."
      }
    ],
    "note": "Look for Elderwood Lux. 3 Executioner is a big spike so always look to play around it if possible. Can also chase 9 Elderwood if you have Elderwood Lux.",
    "carousel": [
      "Spear of Shojin",
      "B.F. Sword",
      "Sparring Gloves",
      "Recurve Bow"
    ]
  },
  {
    "name": "Invoker Nidalee",
    "tier": "C",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Nidalee",
    "early": [
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Xayah",
        "position": "back"
      },
      {
        "name": "Scuttlecrab",
        "position": "front"
      },
      {
        "name": "Kayle",
        "position": "back",
        "items": [
          "Jeweled Gauntlet",
          "Guinsoo's Rageblade"
        ]
      }
    ],
    "final": [
      {
        "name": "Taric",
        "position": "front"
      },
      {
        "name": "Sentinel",
        "position": "front",
        "items": [
          "Protector's Vow",
          "Warmog's Armor",
          "Adaptive Helm"
        ]
      },
      {
        "name": "Scuttlecrab",
        "position": "front"
      },
      {
        "name": "Vi",
        "position": "front"
      },
      {
        "name": "Morgana",
        "position": "mid",
        "items": [
          "Morellonomicon",
          "Archangel's Staff",
          "Adaptive Helm"
        ]
      },
      {
        "name": "Nidalee",
        "position": "back",
        "items": [
          "Jeweled Gauntlet",
          "Guinsoo's Rageblade",
          "Striker's Flail"
        ]
      },
      {
        "name": "Kog'Maw",
        "position": "back"
      },
      {
        "name": "Pebbles",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Play any strong Rageblade opener on an AP carry such as Kayle, Master Yi, or a Spellweaver. Opener is very flexible."
      },
      {
        "stage": "Stage 3",
        "tip": "Comp is very Rod hungry so keep taking them off augments / carousels when possible. If you are not playing Invokers, hold onto cheap units like Pebbles for later."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 8 and roll for 4 Invoker. Avoid tunneling only on 4 Vanguard frontline. You can also flex Brawlers or Juggernauts as needed."
      }
    ],
    "note": "Prioritize Nidalee > Morello on Morgana + Tank > leftover AP on Morgana. If above 50HP with Nidalee, choose Phoenix Primal (item). Otherwise, go for Execute Primal. Riftbeast Alpha Mark the Scuttle Crab. Kogmaw provides free Sunder / Shred.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Jeweled Gauntlet",
      "Morellonomicon",
      "Giant's Belt"
    ]
  },
  {
    "name": "Moo-nara",
    "tier": "C",
    "style": "2-Cost Reroll",
    "difficulty": "Medium",
    "carry": "Yunara",
    "early": [
      {
        "name": "Karma",
        "position": "back"
      },
      {
        "name": "Yorick",
        "position": "front"
      },
      {
        "name": "Yunara",
        "position": "back"
      },
      {
        "name": "Azir",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Yorick",
        "position": "front"
      },
      {
        "name": "Stonebark",
        "position": "front"
      },
      {
        "name": "Rek'Sai",
        "position": "front"
      },
      {
        "name": "Sett",
        "position": "front"
      },
      {
        "name": "Alistar",
        "position": "front",
        "stars": 3,
        "items": [
          "Gargoyle Stoneplate",
          "Spirit Visage",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Lifeblossom",
        "position": "mid"
      },
      {
        "name": "Gnar",
        "position": "mid"
      },
      {
        "name": "Azir",
        "position": "back"
      },
      {
        "name": "Ezreal",
        "position": "back",
        "items": [
          "Last Whisper",
          "Spear of Shojin",
          "Red Buff"
        ]
      },
      {
        "name": "Yunara",
        "position": "back",
        "stars": 3,
        "items": [
          "Deathblade",
          "Spear of Shojin",
          "Striker's Flail"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Slam items for Yunara and play for win streak with Blossom in. Tank Yorick / Juggernaut until you find Alistar."
      },
      {
        "stage": "Stage 3",
        "tip": "Level at 3-2 and roll for 2* upgrades then econ up. The level 6 board plays Azir + Rek'Sai until you find Sett / Ezreal. Skip Azir 2, too expensive."
      },
      {
        "stage": "Stage 4",
        "tip": "Finish your 3* then level for Executioners. Your biggest spike is 3 Executioner, but Kennen caps your board. Gnar is nice but not important."
      }
    ],
    "note": "Play when you have lots of copies of Yunara with sword items. Leftover AD on Ezreal. Can also play 3* Leblanc / Ahri 2* as an AP duo carry if you have the items for it. Play Azir + Reksai on 6 before you find Ezreal + Sett. Level for more executioners.",
    "carousel": [
      "Spear of Shojin",
      "Gargoyle Stoneplate",
      "Deathblade",
      "Sparring Gloves"
    ]
  },
  {
    "name": "Primal Hunters",
    "tier": "C",
    "style": "4-Cost Fast 8",
    "difficulty": "Medium",
    "carry": "Sivir",
    "early": [
      {
        "name": "Cinderling",
        "position": "back"
      },
      {
        "name": "Gromp",
        "position": "back"
      },
      {
        "name": "Scuttlecrab",
        "position": "front"
      },
      {
        "name": "Yorick",
        "position": "mid"
      }
    ],
    "final": [
      {
        "name": "Amumu",
        "position": "front",
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Spirit Visage"
        ]
      },
      {
        "name": "Shen",
        "position": "mid"
      },
      {
        "name": "Vi",
        "position": "mid"
      },
      {
        "name": "Lillia",
        "position": "mid"
      },
      {
        "name": "Kennen",
        "position": "mid",
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Ivern",
        "position": "back"
      },
      {
        "name": "Tristana",
        "position": "back"
      },
      {
        "name": "Ashe",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Red Buff",
          "Last Whisper"
        ]
      },
      {
        "name": "Sivir",
        "position": "back",
        "items": [
          "Infinity Edge",
          "Deathblade",
          "Blue Buff"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Play from a strong AD opener, preferably around Cinderling and Riftbeasts. Alpha Mark the Cinderling 2 and win streak."
      },
      {
        "stage": "Stage 3",
        "tip": "Add in more Hunters and frontline as necessary. If you high roll a very early Sivir and Vi, you can start farming items."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 8 and roll down for Sivir and upgraded frontline. Always play Ashe if you hit. Can also flex in 3 Blossom if you hit Sett. Go 9 once stable."
      }
    ],
    "note": "Must find a way to get to Ashe to cap the board, otherwise you fall off hard. Choose Execute Primal > Item Primal if very far ahead. Ashe is great with utility items because she has big AOE spell.",
    "carousel": [
      "Blue Buff",
      "Infinity Edge",
      "Gargoyle Stoneplate",
      "B.F. Sword"
    ]
  },
  {
    "name": "Rengar Reroll",
    "tier": "C",
    "style": "3-Cost Reroll",
    "difficulty": "Medium",
    "carry": "Rengar",
    "early": [
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Elise",
        "position": "mid"
      },
      {
        "name": "Rengar",
        "position": "front",
        "items": [
          "Guinsoo's Rageblade",
          "Edge of Night"
        ]
      }
    ],
    "final": [
      {
        "name": "Rengar",
        "position": "front",
        "stars": 3,
        "items": [
          "Edge of Night",
          "Titan's Resolve",
          "Guinsoo's Rageblade"
        ]
      },
      {
        "name": "Hecarim",
        "position": "front",
        "stars": 3,
        "items": [
          "Protector's Vow",
          "Sunfire Cape",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Sentinel",
        "position": "front"
      },
      {
        "name": "Diana",
        "position": "mid",
        "stars": 3,
        "items": [
          "Thief's Gloves"
        ]
      },
      {
        "name": "Brambleback",
        "position": "mid"
      },
      {
        "name": "Taric",
        "position": "mid"
      },
      {
        "name": "Mama Beak",
        "position": "back",
        "stars": 3,
        "items": [
          "Last Whisper",
          "Kraken's Fury",
          "Guinsoo's Rageblade"
        ]
      },
      {
        "name": "Aphelios",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Only play this comp with an early Rengar with items so you can snowball Rival. Play any upgraded frontline tank to stall for Kha'zix."
      },
      {
        "stage": "Stage 3",
        "tip": "If you have a few crucial pairs on level 6, you can consider rolling slightly on 6 to get charms / upgrade units. Econ up to 7 otherwise."
      },
      {
        "stage": "Stage 4",
        "tip": "Slow roll on 7 for 3* upgrades on whatever 3 costs you're chasing. In this example, if you can't hit Mama Beak 3, look for Aphelios duo instead."
      }
    ],
    "note": "Strong with artifacts. Rengar prefers to be paired with other carries that can use AD scaling. But he is a flexible unit with no traits so you can play him with whatever you hit.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Edge of Night",
      "Titan's Resolve",
      "Recurve Bow"
    ]
  },
  {
    "name": "Sprykin Teemo",
    "tier": "C",
    "style": "2-Cost Reroll",
    "difficulty": "Easy",
    "carry": "Teemo",
    "early": [
      {
        "name": "Kobuko",
        "position": "mid"
      },
      {
        "name": "Veigar",
        "position": "back"
      },
      {
        "name": "Teemo",
        "position": "back"
      },
      {
        "name": "Rek'Sai",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Rek'Sai",
        "position": "front",
        "stars": 3,
        "items": [
          "Sprykin Emblem",
          "Gargoyle Stoneplate",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Fiddlesticks",
        "position": "mid"
      },
      {
        "name": "Kobuko",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Rammus",
        "position": "mid"
      },
      {
        "name": "Veigar",
        "position": "back"
      },
      {
        "name": "Kog'Maw",
        "position": "back",
        "items": [
          "Morellonomicon"
        ]
      },
      {
        "name": "Teemo",
        "position": "back",
        "stars": 3,
        "items": [
          "Spear of Shojin",
          "Rabadon's Deathcap",
          "Jeweled Gauntlet"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Open with a win streak Teemo start and itemize him ASAP. The more Teemo casts, the more likely you can collect value off his mushrooms."
      },
      {
        "stage": "Stage 3",
        "tip": "Level to 6 and roll for your 2* upgrades to stabilize and win streak Stage 3. Econ up and slow roll above 50g for 3*."
      },
      {
        "stage": "Stage 4",
        "tip": "Finish Teemo 3* and your tank then push levels for more Sprykins. Cap the board with Gnar or another 5 cost."
      }
    ],
    "note": "Best with Sprykin emblem and lots of copies of Teemo early. Sacrifice a 3* unit (ideally Kobuko) to give Rek'Sai big stats. Can also tank Rammus 3 if very rich / high rolling. Kog'maw provides free Shred / Sunder.",
    "carousel": [
      "Spear of Shojin",
      "Rabadon's Deathcap",
      "Gargoyle Stoneplate",
      "Needlessly Large Rod"
    ]
  },
  {
    "name": "Warwick Reroll",
    "tier": "C",
    "style": "2-Cost Reroll",
    "difficulty": "Medium",
    "carry": "Warwick",
    "early": [
      {
        "name": "Rek'Sai",
        "position": "mid"
      },
      {
        "name": "Warwick",
        "position": "back"
      },
      {
        "name": "Kobuko",
        "position": "mid"
      },
      {
        "name": "Murkwolf",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Malphite",
        "position": "front",
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Crownguard"
        ]
      },
      {
        "name": "Brambleback",
        "position": "mid"
      },
      {
        "name": "Krug",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Rek'Sai",
        "position": "mid"
      },
      {
        "name": "Warwick",
        "position": "back",
        "stars": 3,
        "items": [
          "Sterak's Gage",
          "Titan's Resolve",
          "Spear of Shojin"
        ]
      },
      {
        "name": "Murkwolf",
        "position": "back",
        "stars": 3,
        "items": [
          "Deathblade",
          "Edge of Night",
          "Hand Of Justice"
        ]
      },
      {
        "name": "Azir",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "If you don't have Shojin, consider lose streak to guarantee it on carousel. If you have Shojin + good component, play for win streak instead."
      },
      {
        "stage": "Stage 3",
        "tip": "Level to 6 and roll for Warwick 2 with 4 Blackthorn + 2 Ravager. Econ up and slow roll for 3*. You can also play 4 Ravager temporarily if needed."
      },
      {
        "stage": "Stage 4",
        "tip": "Finish Warwick 3 and push levels. If you don't have Murkwolf 3, look for Brambleback as your duo carry."
      }
    ],
    "note": "Aim to play a 3* unit in the Blackthorn center hex for max stats, preferably Krug 3. Leftover AD items on Murkwolf. Can also tank Rek'sai 3 if you can't find Malphite 2.",
    "carousel": [
      "Spear of Shojin",
      "Titan's Resolve",
      "B.F. Sword",
      "Giant's Belt"
    ]
  },
  {
    "name": "Cursed Crown Kayle",
    "tier": "X",
    "style": "2-Cost Reroll",
    "difficulty": "Easy",
    "carry": "Kayle",
    "early": [
      {
        "name": "Kayle",
        "position": "back",
        "items": [
          "Guinsoo's Rageblade"
        ]
      },
      {
        "name": "Leona",
        "position": "mid"
      },
      {
        "name": "Sejuani",
        "position": "mid"
      },
      {
        "name": "Ornn",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Stonebark",
        "position": "front"
      },
      {
        "name": "Ornn",
        "position": "front",
        "stars": 3,
        "items": [
          "Gargoyle Stoneplate",
          "Warmog's Armor",
          "Spirit Visage"
        ]
      },
      {
        "name": "Sejuani",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Leona",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Rakan",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Elise",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Lifeblossom",
        "position": "back"
      },
      {
        "name": "LeBlanc",
        "position": "back",
        "stars": 3
      },
      {
        "name": "Kayle",
        "position": "back",
        "stars": 3,
        "items": [
          "Guinsoo's Rageblade",
          "Jeweled Gauntlet",
          "Striker's Flail"
        ]
      },
      {
        "name": "Xayah",
        "position": "back",
        "stars": 3,
        "items": [
          "Guinsoo's Rageblade",
          "Kraken's Fury",
          "Deathblade"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Play aroud early Solar, Elderwood, and Inferno. Prioritize Kayle and Ornn items. Cursed Crown is very expensive so every gold interest counts."
      },
      {
        "stage": "Stage 3",
        "tip": "You will likely be poor so consider an econ augment. Slow roll above 50g for 3* units. Prioritize Solars > 1 costs > 2 costs."
      },
      {
        "stage": "Stage 4",
        "tip": "You can stay on 6 to finish all your 3* because of Cursed Crown. If you natural level to 7, add in any Spellweaver or 5 cost."
      }
    ],
    "note": "With Cursed Crown, we can go for the big 8 unit 3-star Solar bonus. Roll on 5 for 1 costs and 6 for the 2 costs. Sell LB and Elise if you need bench space.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Gargoyle Stoneplate",
      "Needlessly Large Rod",
      "Sparring Gloves"
    ]
  },
  {
    "name": "Emblem Rengar",
    "tier": "X",
    "style": "3-Cost Reroll",
    "difficulty": "Medium",
    "carry": "Rengar",
    "early": [
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Xayah",
        "position": "back"
      },
      {
        "name": "Yorick",
        "position": "mid"
      },
      {
        "name": "Rengar",
        "position": "mid"
      }
    ],
    "final": [
      {
        "name": "Rammus",
        "position": "front",
        "stars": 3,
        "items": [
          "Gargoyle Stoneplate",
          "Spirit Visage",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Lillia",
        "position": "mid"
      },
      {
        "name": "Kobuko",
        "position": "mid"
      },
      {
        "name": "Gnar",
        "position": "mid"
      },
      {
        "name": "Rengar",
        "position": "mid",
        "stars": 3,
        "items": [
          "Sprykin Emblem",
          "Edge of Night",
          "Guinsoo's Rageblade"
        ]
      },
      {
        "name": "Sivir",
        "position": "back"
      },
      {
        "name": "Tristana",
        "position": "back",
        "stars": 3,
        "items": [
          "Guinsoo's Rageblade",
          "Last Whisper",
          "Deathblade"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Play for win streak with Rengar and the emblem. Position him same side as enemy carries to get backline snipes."
      },
      {
        "stage": "Stage 3",
        "tip": "Keep snowballing with Rengar. Take an item augment if you aren't on track to get 3 items by end of Stage. Rengar only performs as well as your best tank so prioritize frontline too."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 7 and roll above 50g for 3* Rengar and 3* Rammus. Use your 4 Fae cash outs to push levels. Tristana takes leftover items."
      }
    ],
    "note": "Only play when you have emblem for Rengar. Stacking 4 Fae ASAP is important so you can get a gold engine. Can also tank Lillia primary if you can't find Rammus. Can flex in Primal as well if you have emblem.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Edge of Night",
      "Negatron Cloak",
      "Recurve Bow"
    ]
  },
  {
    "name": "Fae Tristana",
    "tier": "X",
    "style": "3-Cost Reroll",
    "difficulty": "Medium",
    "carry": "Tristana",
    "early": [
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Varus",
        "position": "flex"
      },
      {
        "name": "Xayah",
        "position": "back"
      },
      {
        "name": "Hecarim",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Rammus",
        "position": "front",
        "stars": 3,
        "items": [
          "Gargoyle Stoneplate",
          "Spirit Visage",
          "Warmog's Armor"
        ]
      },
      {
        "name": "Vi",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Kobuko",
        "position": "mid"
      },
      {
        "name": "Lillia",
        "position": "mid"
      },
      {
        "name": "Rakan",
        "position": "mid"
      },
      {
        "name": "Sivir",
        "position": "back",
        "items": [
          "Fae Emblem",
          "Last Whisper",
          "Red Buff"
        ]
      },
      {
        "name": "Tristana",
        "position": "back",
        "stars": 3,
        "items": [
          "Guinsoo's Rageblade",
          "Hextech Gunblade",
          "Giant Slayer"
        ]
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Play for win streak with upgraded Rageblade holder. Start stacking Fae since getting to 7 ASAP is crucial for success."
      },
      {
        "stage": "Stage 3",
        "tip": "Itemize and play Tristana as soon as you find her. Sprykin is more important than Hunter. If you spike very early Primal from ahead, you can consider items."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 7 and roll above 50g for 3* Tristana and Rammus. Use your 4 Fae cash outs to push levels. Give Sivir leftover AD items."
      }
    ],
    "note": "Only play when you have Fae emblem. Stacking 4 Fae ASAP is important so you can get a gold engine. Can also tank Vi primary if you can't find Rammus. Execute Primal > Item Primal unless very far ahead / win streaking.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Hextech Gunblade",
      "B.F. Sword",
      "Recurve Bow"
    ]
  },
  {
    "name": "Trait Ladder",
    "tier": "X",
    "style": "Fast 9",
    "difficulty": "Hard",
    "carry": "Fiddlesticks",
    "early": [
      {
        "name": "Ornn",
        "position": "front"
      },
      {
        "name": "Kha'Zix",
        "position": "front"
      },
      {
        "name": "Shen",
        "position": "front"
      },
      {
        "name": "Varus",
        "position": "flex"
      }
    ],
    "final": [
      {
        "name": "Fiddlesticks",
        "position": "front",
        "items": [
          "Warmog's Armor",
          "Sunfire Cape",
          "Spirit Visage"
        ]
      },
      {
        "name": "Diana",
        "position": "front"
      },
      {
        "name": "Kha'Zix",
        "position": "front",
        "items": [
          "Ravager Emblem"
        ]
      },
      {
        "name": "Ornn",
        "position": "front"
      },
      {
        "name": "Rakan",
        "position": "front"
      },
      {
        "name": "Stonebark",
        "position": "mid"
      },
      {
        "name": "Aphelios",
        "position": "back",
        "items": [
          "Guinsoo's Rageblade",
          "Kraken's Fury",
          "Last Whisper"
        ]
      },
      {
        "name": "Xayah",
        "position": "back"
      },
      {
        "name": "LeBlanc",
        "position": "back",
        "items": [
          "Spear of Shojin",
          "Rabadon's Deathcap"
        ]
      },
      {
        "name": "Lifeblossom",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Ideally start with Khazix to get 10 takedowns ASAP. Add in the cheap 1-2 cost units to activate traits. Otherwise, flex around your best upgraded unit."
      },
      {
        "stage": "Stage 3",
        "tip": "Continue adding and flexing in more traits. +1 team size augments like Coronation or Cursed Crown are very OP here."
      },
      {
        "stage": "Stage 4",
        "tip": "After you hit 10 traits, add Amumu with the Tactician's Crown you get and then level for Kennen. Then pivot to 5 costs at level 9."
      }
    ],
    "note": "Hard flex composition, but very strong when played well. Any emblem start is fine. Get Khazix 10 takedowns for ravager evolution while gathering the early 2-8 trait cashouts in the midgame. The key interval to plan for is 10 traits for the Tactician Crown -> pivot to legendaries or go for even more cashouts if healthy.",
    "carousel": [
      "Guinsoo's Rageblade",
      "Recurve Bow",
      "Sparring Gloves",
      "Giant's Belt"
    ]
  },
  {
    "name": "Unrivaled Reroll",
    "tier": "X",
    "style": "3-Cost Reroll",
    "difficulty": "Conditional",
    "carry": "Kha'Zix",
    "early": [
      {
        "name": "Kha'Zix",
        "position": "mid"
      },
      {
        "name": "Rengar",
        "position": "mid"
      },
      {
        "name": "Kobuko",
        "position": "mid"
      },
      {
        "name": "Rek'Sai",
        "position": "front"
      }
    ],
    "final": [
      {
        "name": "Hecarim",
        "position": "front",
        "stars": 3,
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Spirit Visage"
        ]
      },
      {
        "name": "Stonebark",
        "position": "mid"
      },
      {
        "name": "Rengar",
        "position": "mid",
        "stars": 3,
        "items": [
          "Edge of Night",
          "Titan's Resolve",
          "Guinsoo's Rageblade"
        ]
      },
      {
        "name": "Kha'Zix",
        "position": "mid",
        "stars": 3,
        "items": [
          "Hand Of Justice",
          "Rabadon's Deathcap",
          "Edge of Night"
        ]
      },
      {
        "name": "Aphelios",
        "position": "back",
        "items": [
          "Last Whisper",
          "Red Buff"
        ]
      },
      {
        "name": "Ezreal",
        "position": "back"
      },
      {
        "name": "Lifeblossom",
        "position": "back"
      },
      {
        "name": "Diana",
        "position": "back"
      },
      {
        "name": "LeBlanc",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Items are crucial for this composition so focus on Edge of Night first. Play any upgraded frontline tank to stall for Khazix + Rengar."
      },
      {
        "stage": "Stage 3",
        "tip": "Keep adding more frontline. Rengar and Khazix will only be effective as your best tank. Item augments are huge to keep your momentum."
      },
      {
        "stage": "Stage 4",
        "tip": "Level to 7 and roll for the 2* upgrades. Then econ up and slow roll above 50g for 3* units. Once you finish 3* tank + Khazix 3 / Rengar 3, add 5 costs."
      }
    ],
    "note": "Ideally, Khazix gains Ravager > Executioner > Rapidfire > Spellweaver with takedowns.",
    "carousel": [
      "Edge of Night",
      "B.F. Sword",
      "Chain Vest",
      "Needlessly Large Rod"
    ]
  },
  {
    "name": "Veigar Consuming Flora",
    "tier": "X",
    "style": "1-Cost Reroll",
    "difficulty": "Easy",
    "carry": "Veigar",
    "early": [
      {
        "name": "Kobuko",
        "position": "mid"
      },
      {
        "name": "Rek'Sai",
        "position": "front"
      },
      {
        "name": "Veigar",
        "position": "back"
      },
      {
        "name": "Teemo",
        "position": "back"
      }
    ],
    "final": [
      {
        "name": "Rek'Sai",
        "position": "front",
        "stars": 3,
        "items": [
          "Warmog's Armor",
          "Gargoyle Stoneplate",
          "Gargoyle Stoneplate"
        ]
      },
      {
        "name": "Gnar",
        "position": "mid"
      },
      {
        "name": "Fiddlesticks",
        "position": "mid"
      },
      {
        "name": "Kobuko",
        "position": "mid",
        "stars": 3
      },
      {
        "name": "Rammus",
        "position": "mid"
      },
      {
        "name": "Sett",
        "position": "mid"
      },
      {
        "name": "Veigar",
        "position": "back",
        "stars": 3,
        "items": [
          "Jeweled Gauntlet",
          "Blue Buff",
          "Flora Fatalis Emblem"
        ]
      },
      {
        "name": "Teemo",
        "position": "back"
      }
    ],
    "tips": [
      {
        "stage": "Stage 2",
        "tip": "Only play around this opener with early upgrades so Veigar can snowball and gain stacks. Prioritize Veigar items."
      },
      {
        "stage": "Stage 3",
        "tip": "If you are close to Veigar 3 (7+ copies), consider rolling until you hit 3*. If far (3-4 copies), slow roll above 50g for 3*."
      },
      {
        "stage": "Stage 4",
        "tip": "Once you finish your 3*, push levels for more Spyrkin, Blackthorn, or Brawlers."
      }
    ],
    "note": "Very strong with Dawncore and Ludens as well. Sacrifice a 3* unit for maximum Blackthorn stats.",
    "carousel": [
      "Blue Buff",
      "Jeweled Gauntlet",
      "Gargoyle Stoneplate",
      "Giant's Belt"
    ]
  }
];
