// GENERATED FILE — do not edit by hand.
//
// Every Set 18 trait and champion, straight from Riot's shipped text via
// Community Dragon. Regenerate with:
//
//   node scripts/generate-tft-set18-reference.mjs
//
// Trait numbers are real: the source hashes their variable names, and the
// generator matches the hashes back. Champion ability numbers are not — the
// feed ships them empty for all but a handful of units — so those values read
// as an ellipsis. Ability numbers move every patch anyway; the mechanics do
// not, and the mechanics are the reason this file exists.
//
// Generated 2026-08-29 from https://raw.communitydragon.org/latest/cdragon/tft/en_us.json

export type TraitKind = 'origin' | 'class' | 'unique';

export interface TraitRow {
  /** Champion count this row switches on at. */
  at: number;
  text: string;
}

export interface TraitInfo {
  name: string;
  kind: TraitKind;
  breakpoints: number[];
  /** Text that applies at every breakpoint, printed above the rows. */
  intro: string;
  rows: TraitRow[];
  champions: string[];
}

export interface ChampionAbility {
  name: string;
  passive?: string;
  active: string;
  /** Stats the ability's values scale off — AP, AD, health and so on. */
  scales: string[];
  /** The bonus this unit gets from a Riftbeast Alpha Mark, where it has one. */
  buff?: { label: string; text: string };
  /** Riot's own explanation of a keyword the ability uses. */
  notes?: string[];
}

export interface ChampionInfo {
  name: string;
  cost: number;
  traits: string[];
  ability: ChampionAbility;
  stats: {
    hp: number;
    damage: number;
    armor: number;
    magicResist: number;
    mana: number;
    range: number;
    attackSpeed: number;
  };
}

export const TRAITS: TraitInfo[] = [
  {
    "name": "Adaptor",
    "kind": "class",
    "champions": [
      "Akali",
      "Gromp",
      "Kog'Maw",
      "Master Yi",
      "Nidalee"
    ],
    "intro": "Innate: Adaptor abilities change depending on if their Attack Damage or Ability Power is higher.\nAdaptors gain Ability Power or Attack Damage, depending on which is higher.",
    "breakpoints": [
      2,
      3,
      4
    ],
    "rows": [
      {
        "at": 2,
        "text": "25% OR"
      },
      {
        "at": 3,
        "text": "35% OR"
      },
      {
        "at": 4,
        "text": "50% OR"
      }
    ]
  },
  {
    "name": "Apex Predator",
    "kind": "unique",
    "champions": [
      "Elder Dragon"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Elder Dragon takes up 2 team slots and grants +2 to the Riftbeast trait."
      }
    ]
  },
  {
    "name": "Attuned",
    "kind": "unique",
    "champions": [
      "Alune"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Your strongest Alune cycles to a new phase of the moon after each cast. While the moon is at or below half full, your team gains 7% Durabilty. While above, your team gains 7% Damage Amp."
      }
    ]
  },
  {
    "name": "Avatar",
    "kind": "unique",
    "champions": [
      "Lux"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Having an Avatar on your bench or board transforms all other Avatars in your shop to the Trait of that Avatar.\nAn Avatar's chosen Trait is counted twice for Trait bonuses."
      }
    ]
  },
  {
    "name": "Blackthorn",
    "kind": "origin",
    "champions": [
      "Rek'Sai",
      "Veigar",
      "Warwick",
      "Azir",
      "Malphite"
    ],
    "intro": "The ally on the Blackthorn hex is sacrificed before combat, granting your champions Health.\nBlackthorn champions gain additional stats based on the sacrifice's Role, Star Level, and Cost.",
    "breakpoints": [
      2,
      4,
      6
    ],
    "rows": [
      {
        "at": 2,
        "text": "175 health"
      },
      {
        "at": 4,
        "text": "300 health; Bonus is 30% stronger"
      },
      {
        "at": 6,
        "text": "550 health; Bonus is 60% stronger"
      }
    ]
  },
  {
    "name": "Blossom",
    "kind": "origin",
    "champions": [
      "Karma",
      "Yorick",
      "Yunara",
      "Master Yi",
      "Ahri",
      "Sett",
      "Ashe"
    ],
    "intro": "After combat, your Wisps are empowered.\nBlossom champions gain Attack Damage, Ability Power, and 10% max Health.",
    "breakpoints": [
      3,
      5,
      7,
      9,
      11
    ],
    "rows": [
      {
        "at": 3,
        "text": "Wisps are upgraded, 12% ADAP"
      },
      {
        "at": 5,
        "text": "Wisps are in every shop, 30% ADAP"
      },
      {
        "at": 7,
        "text": "Gain 4 gold after buying a Wisp, 40% ADAP"
      },
      {
        "at": 9,
        "text": "You can buy 2 Wisps per round, 45% ADAP"
      },
      {
        "at": 11,
        "text": "Wisps overflow with power, 100% ADAP"
      }
    ]
  },
  {
    "name": "Bounty Seeker",
    "kind": "unique",
    "champions": [
      "Draven"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Choose a bounty. Your strongest Draven can progress on the bounty to earn its reward. Upon completing a bounty, choose another."
      }
    ]
  },
  {
    "name": "Brawler",
    "kind": "class",
    "champions": [
      "Kobuko",
      "Rek'Sai",
      "Alistar",
      "Krug",
      "Sett",
      "Gnar"
    ],
    "intro": "Your team gains 120 max Health. Brawlers gain more.",
    "breakpoints": [
      2,
      4,
      6
    ],
    "rows": [
      {
        "at": 2,
        "text": "25% health"
      },
      {
        "at": 4,
        "text": "40% health"
      },
      {
        "at": 6,
        "text": "65% health"
      }
    ]
  },
  {
    "name": "Caustic",
    "kind": "unique",
    "champions": [
      "Kog'Maw"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Caustic damage 30% Shreds and Sunders enemies for 4 seconds.\nShred: Reduce Magic Resist\nSunder: Reduce Armor"
      }
    ]
  },
  {
    "name": "Coven",
    "kind": "origin",
    "champions": [
      "Camille",
      "Caitlyn",
      "Elise",
      "Cassiopeia",
      "Morgana"
    ],
    "intro": "Gather Essence by killing champions, plus more by losing player combat.\nBeginning at 40 Essence, choose to convert Essence to rewards or continue gathering Essence. Each reward requires increasing amounts of Essence.",
    "breakpoints": [
      3,
      4,
      5,
      7
    ],
    "rows": [
      {
        "at": 3,
        "text": "2 Essence per kill, 18 Essence per loss"
      },
      {
        "at": 4,
        "text": "2 per kill, 25 per loss"
      },
      {
        "at": 5,
        "text": "3 per kill, 32 per loss"
      },
      {
        "at": 7,
        "text": "10 per kill, 60 per loss"
      }
    ]
  },
  {
    "name": "Defender",
    "kind": "class",
    "champions": [
      "Leona",
      "Ornn",
      "Shen",
      "Fiddlesticks",
      "Rammus",
      "Lillia"
    ],
    "intro": "Your team gains 12 Armor and Magic Resist. Defenders gain more.",
    "breakpoints": [
      2,
      4,
      6
    ],
    "rows": [
      {
        "at": 2,
        "text": "25"
      },
      {
        "at": 4,
        "text": "60"
      },
      {
        "at": 6,
        "text": "120"
      }
    ]
  },
  {
    "name": "Elderwood",
    "kind": "origin",
    "champions": [
      "Ornn",
      "Xayah",
      "Alistar",
      "LeBlanc",
      "Hecarim",
      "Ezreal",
      "Gnar"
    ],
    "intro": "Gain placeable Elderwood plants.",
    "breakpoints": [
      3,
      5,
      7,
      9,
      11
    ],
    "rows": [
      {
        "at": 3,
        "text": "A Stonebark Tree and a Lifebloom"
      },
      {
        "at": 5,
        "text": "A second Stonebark Tree and Stonebark Trees gain 200 Health"
      },
      {
        "at": 7,
        "text": "and the Deepwood Protector"
      },
      {
        "at": 9,
        "text": "Plants star up to 2-star"
      },
      {
        "at": 11,
        "text": "Plants star up to 3-star and the forest comes to life"
      }
    ]
  },
  {
    "name": "Emerald Aspect",
    "kind": "unique",
    "champions": [
      "Taric"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Drag an ally onto your strongest Taric to pair them, granting the ally powerful bonuses from Taric's Ability."
      }
    ]
  },
  {
    "name": "Executioner",
    "kind": "class",
    "champions": [
      "Yunara",
      "Azir",
      "Ezreal",
      "Soraka",
      "Kennen"
    ],
    "intro": "",
    "breakpoints": [
      2,
      3,
      4
    ],
    "rows": [
      {
        "at": 2,
        "text": "Executioners gain Precision and 15% Critical Strike Chance."
      },
      {
        "at": 3,
        "text": "Additionally, enemies bleed for 30% bonus true damage over 3 seconds."
      },
      {
        "at": 4,
        "text": "Bleed damage increased to 40%."
      }
    ]
  },
  {
    "name": "Fae",
    "kind": "origin",
    "champions": [
      "Rakan",
      "Xayah",
      "Tristana",
      "Lillia"
    ],
    "intro": "Your team's damage, healing, and shielding attracts Pixies.\nEach Pixie grants Fae champions Attack Damage and Ability Power, and after they fall below 50% Health, they heal for each Pixie.",
    "breakpoints": [
      2,
      4
    ],
    "rows": [
      {
        "at": 2,
        "text": "5% and 2% Heal."
      },
      {
        "at": 4,
        "text": "8% and 4% Heal. After attracting 7 Pixies, start attracting Golden Pixies instead which grant gold."
      }
    ]
  },
  {
    "name": "Flora Fatalis",
    "kind": "origin",
    "champions": [
      "Fiddlesticks",
      "Soraka"
    ],
    "intro": "Flora Fatalis champions harvest enemies on takedown, gaining:",
    "breakpoints": [
      1,
      2
    ],
    "rows": [
      {
        "at": 1,
        "text": "10 Mana"
      },
      {
        "at": 2,
        "text": "and grant a 8% max Health heal to the lowest Health ally."
      }
    ]
  },
  {
    "name": "Greenfather",
    "kind": "unique",
    "champions": [
      "Ivern"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Gain 1 seed when your strongest Ivern casts, plus 3 every combat. Ivern uses 5 seeds to grow a hex on your board that grants a bonus to its occupant.\nSeeds: 0 / 5\nCurrent Biome:"
      }
    ]
  },
  {
    "name": "Hunter",
    "kind": "class",
    "champions": [
      "Cinderling",
      "Caitlyn",
      "Tristana",
      "Sivir",
      "Ashe"
    ],
    "intro": "Hunters gain Attack Damage. If a Hunter hasn't swapped targets for 4 seconds, they gain 10% Damage Amp.",
    "breakpoints": [
      2,
      3,
      4,
      5
    ],
    "rows": [
      {
        "at": 2,
        "text": "20% AD"
      },
      {
        "at": 3,
        "text": "30% AD"
      },
      {
        "at": 4,
        "text": "45% AD"
      },
      {
        "at": 5,
        "text": "65% AD"
      }
    ]
  },
  {
    "name": "Inferno",
    "kind": "origin",
    "champions": [
      "Akali",
      "Varus",
      "Shen",
      "Amumu",
      "Kennen"
    ],
    "intro": "Inferno damage Burns and Wounds enemies for 4 seconds. Inferno Burns stack with other Burns.",
    "breakpoints": [
      2,
      3,
      5,
      7
    ],
    "rows": [
      {
        "at": 2,
        "text": "1% Burn, 33% Wound"
      },
      {
        "at": 3,
        "text": "After combat, 1 of your shop slots without an Inferno champion ignites, rolling a champion one tier higher"
      },
      {
        "at": 5,
        "text": "Ignite 2 shop slots, 2% Burn"
      },
      {
        "at": 7,
        "text": "Ignite 4 shop slots, 3% Burn"
      }
    ]
  },
  {
    "name": "Invoker",
    "kind": "class",
    "champions": [
      "Pebbles",
      "Teemo",
      "Kog'Maw",
      "Morgana",
      "Sentinel"
    ],
    "intro": "Your team gains Mana Regen, increased for Invokers.",
    "breakpoints": [
      2,
      3,
      4,
      5
    ],
    "rows": [
      {
        "at": 2,
        "text": "1 mana regen | 3 mana regen"
      },
      {
        "at": 3,
        "text": "1 mana regen | 4 mana regen"
      },
      {
        "at": 4,
        "text": "2 mana regen | 6 mana regen"
      },
      {
        "at": 5,
        "text": "2 mana regen | 9 mana regen"
      }
    ]
  },
  {
    "name": "Juggernaut",
    "kind": "class",
    "champions": [
      "Rakan",
      "Yorick",
      "Scuttlecrab",
      "Sejuani",
      "Vi",
      "Amumu",
      "Maokai"
    ],
    "intro": "Your team gains Durability. Juggernauts gain more.",
    "breakpoints": [
      2,
      4,
      6
    ],
    "rows": [
      {
        "at": 2,
        "text": "4% or 20%"
      },
      {
        "at": 4,
        "text": "6% or 30%"
      },
      {
        "at": 6,
        "text": "8% or 40%"
      }
    ]
  },
  {
    "name": "Lunar",
    "kind": "origin",
    "champions": [
      "Diana",
      "Aphelios",
      "Alune"
    ],
    "intro": "Lunar champions and adjacent allies gain Attack Speed and Ability Power. Lunar champions gain 100% more.",
    "breakpoints": [
      2,
      3,
      4,
      5
    ],
    "rows": [
      {
        "at": 2,
        "text": "7% attack speed, 7% AP"
      },
      {
        "at": 3,
        "text": "10% attack speed, 10% AP"
      },
      {
        "at": 4,
        "text": "14% attack speed, 14% AP"
      },
      {
        "at": 5,
        "text": "18% attack speed, 18% AP"
      }
    ]
  },
  {
    "name": "Monolith",
    "kind": "unique",
    "champions": [
      "Malphite"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Monoliths gain 10 Armor and Magic Resist for each enemy targeting them."
      }
    ]
  },
  {
    "name": "Old Growth",
    "kind": "unique",
    "champions": [
      "Maokai"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Whenever an enemy within 3 hexes dies, your strongest Old Growth champion gains 30 permanent max Health.\nCurrent: 0"
      }
    ]
  },
  {
    "name": "Primal",
    "kind": "origin",
    "champions": [
      "Vi",
      "Nidalee",
      "Sivir"
    ],
    "intro": "Choose one of four Primal Blessings.",
    "breakpoints": [
      2,
      4
    ],
    "rows": [
      {
        "at": 2,
        "text": ""
      },
      {
        "at": 4,
        "text": ""
      }
    ]
  },
  {
    "name": "Rapidfire",
    "kind": "class",
    "champions": [
      "Varus",
      "Xayah",
      "Kayle",
      "Mama Beak",
      "Aphelios"
    ],
    "intro": "Your team gains 10% Attack Speed. Rapidfire champions gain more on every attack, up to 10 stacks.",
    "breakpoints": [
      2,
      3,
      4,
      5
    ],
    "rows": [
      {
        "at": 2,
        "text": "+3% attack speed per Attack"
      },
      {
        "at": 3,
        "text": "+5% attack speed per Attack"
      },
      {
        "at": 4,
        "text": "+9% attack speed per Attack"
      },
      {
        "at": 5,
        "text": "+15% attack speed per Attack"
      }
    ]
  },
  {
    "name": "Ravager",
    "kind": "class",
    "champions": [
      "Akali",
      "Camille",
      "Murkwolf",
      "Warwick",
      "Diana",
      "Brambleback"
    ],
    "intro": "Ravagers gain 10% Omnivamp. Additionally, Ravagers deal bonus damage, doubled against units below 50% Health.",
    "breakpoints": [
      2,
      4,
      6
    ],
    "rows": [
      {
        "at": 2,
        "text": "12% Bonus Damage"
      },
      {
        "at": 4,
        "text": "25% Bonus Damage"
      },
      {
        "at": 6,
        "text": "40% Bonus Damage"
      }
    ]
  },
  {
    "name": "Riftbeast",
    "kind": "origin",
    "champions": [
      "Cinderling",
      "Pebbles",
      "Gromp",
      "Murkwolf",
      "Scuttlecrab",
      "Krug",
      "Mama Beak",
      "Brambleback",
      "Sentinel",
      "Elder Dragon"
    ],
    "intro": "",
    "breakpoints": [
      3,
      5,
      7,
      10
    ],
    "rows": [
      {
        "at": 3,
        "text": "Use the Alpha Mark to grant a Riftbeast their unique Buff"
      },
      {
        "at": 5,
        "text": "Every 3 combats, your next shop is overrun with Riftbeasts."
      },
      {
        "at": 7,
        "text": "On combat start and every 5 seconds Riftbeasts grow gaining\n6% AD 6% AP 6% attack speed\n+5 armor +5 magic resist +50 health +1 mana regen"
      },
      {
        "at": 10,
        "text": "+2 maximum team size"
      }
    ]
  },
  {
    "name": "Rival",
    "kind": "origin",
    "champions": [
      "Kha'Zix",
      "Rengar"
    ],
    "intro": "",
    "breakpoints": [
      1,
      1,
      2
    ],
    "rows": [
      {
        "at": 1,
        "text": "Only active while fielding 1 Rival.\nRivals collect takedowns, gaining 3 if they takedown another Rival."
      },
      {
        "at": 1,
        "text": "Rivals collect takedowns, gaining 3 if they takedown another Rival.\nTakedowns evolve Kha'Zix, permanently granting him your choice of Executioner, Rapidfire, Ravager, or Spellweaver.\nRengar grants 2/3/5 gold every 8 takedowns. After 30 takedowns, your team gains 5% Attack Damage plus 0.2% AD per additional takedown.\nKha'Zix Takedowns: 0 / 0\nRengar Takedowns: 0\nGold Earned: 0"
      },
      {
        "at": 2,
        "text": "Rivals can be fielded together, and their abilities grant each other bonuses."
      }
    ]
  },
  {
    "name": "Solar",
    "kind": "origin",
    "champions": [
      "Leona",
      "Kayle",
      "Sejuani"
    ],
    "intro": "",
    "breakpoints": [
      3
    ],
    "rows": [
      {
        "at": 3,
        "text": "Your champions gain a 5% max Health shield and deal 7% bonus magic damage. Gain additional bonuses for each unique 3-star champion:\n1: Increase shield and magic damage by 1.5% for each 3-star.\n3: 18% attack speed and 15 armormagic resist\n5: Convert 50% of the bonus magic damage to true damage.\n8: Every 4 seconds of combat, a 3-star champion ascends to 4-star."
      }
    ]
  },
  {
    "name": "Spellweaver",
    "kind": "class",
    "champions": [
      "Karma",
      "Veigar",
      "LeBlanc",
      "Cassiopeia",
      "Fiddlesticks",
      "Ahri",
      "Alune"
    ],
    "intro": "Your team gains 10% Ability Power. Spellweavers gain more, plus extra Ability Power whenever a Spellweaver casts an Ability.",
    "breakpoints": [
      2,
      4,
      6
    ],
    "rows": [
      {
        "at": 2,
        "text": "10% AP, +1% AP per cast"
      },
      {
        "at": 4,
        "text": "30% AP, +1% AP per cast"
      },
      {
        "at": 6,
        "text": "55% AP, +2% AP per cast"
      }
    ]
  },
  {
    "name": "Sprykin",
    "kind": "origin",
    "champions": [
      "Kobuko",
      "Veigar",
      "Teemo",
      "Rammus",
      "Tristana",
      "Gnar"
    ],
    "intro": "Gain the Big Furry Friend. Drop a Sprykin on the BFF to pick its Rider.",
    "breakpoints": [
      3,
      5,
      7
    ],
    "rows": [
      {
        "at": 3,
        "text": "The Rider gains\n15% health and 15% attack speed"
      },
      {
        "at": 5,
        "text": "40% health 35% attack speed, and 50% of the BFF's Ability applies to your Sprykin champions."
      },
      {
        "at": 7,
        "text": "45% health 45% attack speed, and 100% of the BFF's Ability applies to your Sprykin champions."
      }
    ]
  },
  {
    "name": "Summoner",
    "kind": "class",
    "champions": [
      "Yorick",
      "Azir",
      "Mama Beak",
      "Zyra"
    ],
    "intro": "Summoners empower their summons in different ways.\nYorick: +30% Health\nAzir: +45% Damage\nMama Beak: +45% Damage\nZyra: +4 Plant Attacks",
    "breakpoints": [
      2,
      3
    ],
    "rows": [
      {
        "at": 2,
        "text": "Empower Summons"
      },
      {
        "at": 3,
        "text": "Improve each effect by 50%"
      }
    ]
  },
  {
    "name": "Thornmaiden",
    "kind": "unique",
    "champions": [
      "Zyra"
    ],
    "intro": "",
    "breakpoints": [
      1
    ],
    "rows": [
      {
        "at": 1,
        "text": "Your team gains 5% Durability, increased to 10% if 6 or more Zyra plants are alive."
      }
    ]
  },
  {
    "name": "Vanguard",
    "kind": "class",
    "champions": [
      "Rakan",
      "Elise",
      "Diana",
      "Hecarim",
      "Sentinel",
      "Taric"
    ],
    "intro": "At Combat Start and after dropping below 50% Health, Vanguards gain a max Health Shield for 10 seconds.",
    "breakpoints": [
      2,
      4,
      6
    ],
    "rows": [
      {
        "at": 2,
        "text": "18% max Health"
      },
      {
        "at": 4,
        "text": "32% max Health"
      },
      {
        "at": 6,
        "text": "42% max Health. Gain 5% Durability while Shielded."
      }
    ]
  }
];

export const CHAMPIONS: ChampionInfo[] = [
  {
    "name": "Akali",
    "cost": 1,
    "traits": [
      "Inferno",
      "Adaptor",
      "Ravager"
    ],
    "ability": {
      "name": "Kunai Strike",
      "active": "Adaptor: Throw a volley of kunai at the target, dealing … physical damage. If the target is Burning, deal an additional … damage.\nAdaptor: If the Ability kills, cast it again.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 650,
      "damage": 40,
      "armor": 35,
      "magicResist": 35,
      "mana": 30,
      "range": 1,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Camille",
    "cost": 1,
    "traits": [
      "Coven",
      "Ravager"
    ],
    "ability": {
      "name": "Defensive Sweep",
      "active": "Slice the target for … physical damage and gain … Shield for … seconds.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 700,
      "damage": 40,
      "armor": 40,
      "magicResist": 40,
      "mana": 25,
      "range": 1,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Cinderling",
    "cost": 1,
    "traits": [
      "Riftbeast",
      "Hunter"
    ],
    "ability": {
      "name": "Razor Leaves",
      "active": "Summon five razor-sharp leaves that converge on the current target, dealing a total of … physical damage and applying … Wound and … Burn for … seconds.",
      "scales": [
        "AD",
        "AP"
      ],
      "notes": [
        "Wound: Reduces healing received.",
        "Burn: Deals a percent of the target's max Health as true damage every second."
      ],
      "buff": {
        "label": "Scarlet Buff",
        "text": "Cinderling gains … Attack Damage each cast."
      }
    },
    "stats": {
      "hp": 500,
      "damage": 40,
      "armor": 25,
      "magicResist": 25,
      "mana": 50,
      "range": 4,
      "attackSpeed": 0.7
    }
  },
  {
    "name": "Karma",
    "cost": 1,
    "traits": [
      "Blossom",
      "Spellweaver"
    ],
    "ability": {
      "name": "Karmic Bond",
      "active": "Tether the current target, dealing … magic damage over … seconds. Then release a burst of power around them, dealing … magic damage to all enemies in a … Hex radius and … Slowing them for … seconds.\nSlow: Reduce Attack Speed",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 500,
      "damage": 25,
      "armor": 25,
      "magicResist": 25,
      "mana": 40,
      "range": 4,
      "attackSpeed": 0.7
    }
  },
  {
    "name": "Kobuko",
    "cost": 1,
    "traits": [
      "Sprykin",
      "Brawler"
    ],
    "ability": {
      "name": "Dance of Life",
      "active": "Restore … Health over … seconds. The next attack is replaced with a bash that deals … magic damage.",
      "scales": [
        "health",
        "AP"
      ]
    },
    "stats": {
      "hp": 700,
      "damage": 55,
      "armor": 40,
      "magicResist": 40,
      "mana": 90,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Leona",
    "cost": 1,
    "traits": [
      "Solar",
      "Defender"
    ],
    "ability": {
      "name": "Shield Bash",
      "active": "Bash the current target, dealing … magic damage and Stunning them for … seconds.",
      "passive": "Start combat with … bonus Armor and Magic Resist that decays over … seconds.",
      "scales": [
        "AP",
        "armor"
      ]
    },
    "stats": {
      "hp": 700,
      "damage": 50,
      "armor": 40,
      "magicResist": 40,
      "mana": 100,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Ornn",
    "cost": 1,
    "traits": [
      "Elderwood",
      "Defender"
    ],
    "ability": {
      "name": "Bellows Breath",
      "active": "Gain … Shield for … seconds and deal … magic damage to enemies in a cone.\nQuest: Each player combat, Ornn stores damage blocked as Forge Power, doubled at 3-star. Gain an Artifact Anvil each time he gains enough Forge Power. (Forge Power: … / …)",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 700,
      "damage": 40,
      "armor": 40,
      "magicResist": 40,
      "mana": 100,
      "range": 1,
      "attackSpeed": 0.6
    }
  },
  {
    "name": "Pebbles",
    "cost": 1,
    "traits": [
      "Riftbeast",
      "Invoker"
    ],
    "ability": {
      "name": "Azure Laser",
      "active": "Begin consuming … max Mana per second and channeling a laser on the target. Each second while casting, deal … magic damage to them and reduce their Magic Resist by ….",
      "scales": [
        "AP"
      ],
      "buff": {
        "label": "Teal Buff",
        "text": "Gain … Mana Regen for every … seconds channeled."
      }
    },
    "stats": {
      "hp": 500,
      "damage": 30,
      "armor": 25,
      "magicResist": 25,
      "mana": 65,
      "range": 4,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Rakan",
    "cost": 1,
    "traits": [
      "Fae",
      "Juggernaut",
      "Vanguard"
    ],
    "ability": {
      "name": "Entrancing Dance",
      "active": "Gain … Shield for … seconds. Then grant the ally who has dealt the most damage this combat … decaying Attack Speed for … seconds.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 700,
      "damage": 45,
      "armor": 35,
      "magicResist": 35,
      "mana": 105,
      "range": 1,
      "attackSpeed": 0.6
    }
  },
  {
    "name": "Rek'Sai",
    "cost": 1,
    "traits": [
      "Blackthorn",
      "Brawler"
    ],
    "ability": {
      "name": "Uproot",
      "active": "Lunge out of the ground, Stunning adjacent enemies for … second and dealing … magic damage to them.",
      "passive": "Restore … Health each second, tripled for … seconds after casting.",
      "scales": [
        "health",
        "AP"
      ]
    },
    "stats": {
      "hp": 700,
      "damage": 50,
      "armor": 40,
      "magicResist": 40,
      "mana": 100,
      "range": 1,
      "attackSpeed": 0.55
    }
  },
  {
    "name": "Varus",
    "cost": 1,
    "traits": [
      "Inferno",
      "Rapidfire"
    ],
    "ability": {
      "name": "Piercing Arrow",
      "active": "Wind up, then fire an arrow at the most enemies in line with the target. It deals … physical damage to enemies hit, reduced by … for each enemy it passes through (minimum …).",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 500,
      "damage": 40,
      "armor": 25,
      "magicResist": 25,
      "mana": 120,
      "range": 4,
      "attackSpeed": 0.7
    }
  },
  {
    "name": "Veigar",
    "cost": 1,
    "traits": [
      "Blackthorn",
      "Sprykin",
      "Spellweaver"
    ],
    "ability": {
      "name": "Primordial Burst",
      "active": "Launch a giant blast at the target that deals … magic damage, increased to … if they're below … max Health.\nIf they die, permanently gain … Ability Power.\nCurrent bonus: …",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 500,
      "damage": 25,
      "armor": 25,
      "magicResist": 25,
      "mana": 30,
      "range": 4,
      "attackSpeed": 0.7
    }
  },
  {
    "name": "Xayah",
    "cost": 1,
    "traits": [
      "Elderwood",
      "Fae",
      "Rapidfire"
    ],
    "ability": {
      "name": "Deadly Plumage",
      "active": "Gain … Attack Speed for the next … attacks. These attacks are replaced with feathers that deal … physical damage and reduce Armor by ….",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 450,
      "damage": 45,
      "armor": 25,
      "magicResist": 25,
      "mana": 50,
      "range": 4,
      "attackSpeed": 0.7
    }
  },
  {
    "name": "Yorick",
    "cost": 1,
    "traits": [
      "Blossom",
      "Juggernaut",
      "Summoner"
    ],
    "ability": {
      "name": "Last Rites",
      "active": "Restore … Health and strike the target, dealing … physical damage.",
      "passive": "On death, spawn a Spirit Walker with … max Health which immediately taunts, forcing enemies to attack it.",
      "scales": [
        "health",
        "AP",
        "AD"
      ]
    },
    "stats": {
      "hp": 650,
      "damage": 50,
      "armor": 35,
      "magicResist": 35,
      "mana": 110,
      "range": 1,
      "attackSpeed": 0.6
    }
  },
  {
    "name": "Alistar",
    "cost": 2,
    "traits": [
      "Elderwood",
      "Brawler"
    ],
    "ability": {
      "name": "Triumphant Roar",
      "active": "Roar, restoring … Health, cleansing disables, and healing the two lowest percent Health allies for …. Then slam the current target, dealing … magic damage and Stunning them for … seconds.",
      "scales": [
        "health",
        "AP"
      ]
    },
    "stats": {
      "hp": 950,
      "damage": 50,
      "armor": 45,
      "magicResist": 45,
      "mana": 90,
      "range": 1,
      "attackSpeed": 0.6
    }
  },
  {
    "name": "Caitlyn",
    "cost": 2,
    "traits": [
      "Coven",
      "Hunter"
    ],
    "ability": {
      "name": "Headshot",
      "active": "",
      "passive": "Every third attack is replaced with a Headshot that deals … physical damage.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 550,
      "damage": 50,
      "armor": 30,
      "magicResist": 30,
      "mana": 3,
      "range": 4,
      "attackSpeed": 0.7
    }
  },
  {
    "name": "Elise",
    "cost": 2,
    "traits": [
      "Coven",
      "Vanguard"
    ],
    "ability": {
      "name": "Spider Queen",
      "active": "Transform into a spider and gain … max Health. Attacks while in Spider Form deal … bonus magic damage and heal for …. Subsequent casts grant … decaying Attack Speed for … seconds.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 900,
      "damage": 20,
      "armor": 45,
      "magicResist": 45,
      "mana": 70,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Gromp",
    "cost": 2,
    "traits": [
      "Riftbeast",
      "Adaptor"
    ],
    "ability": {
      "name": "Belchy Bubble",
      "active": "Adaptor: Belch a noxious bubble at the current target that explodes on the first enemy hit, dealing … magic damage. Enemies within a 1 hex radius of the explosion take … magic damage over … seconds.\nAdaptor: Heavily slows the target.",
      "scales": [
        "AP",
        "AD"
      ],
      "buff": {
        "label": "Purple Buff",
        "text": "Every … seconds, Gromp gains … Ability Power."
      }
    },
    "stats": {
      "hp": 550,
      "damage": 30,
      "armor": 30,
      "magicResist": 30,
      "mana": 45,
      "range": 4,
      "attackSpeed": 0.7
    }
  },
  {
    "name": "Kayle",
    "cost": 2,
    "traits": [
      "Solar",
      "Rapidfire"
    ],
    "ability": {
      "name": "Solar Judgement",
      "active": "",
      "passive": "Kayle ascends based on her star level, granting her stacking bonuses.\n1st Ascension: Attacks deal … bonus magic damage.\n2nd Ascension: Attacks … Shred enemies hit for … seconds.\n3rd Ascension: Attacks fire waves, dealing … magic damage to all other units hit.\n4th Ascension: Gain infinite range. Every …rd wave is much larger.\nShred: Reduce Magic Resist",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 550,
      "damage": 0,
      "armor": 30,
      "magicResist": 30,
      "mana": 0,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "LeBlanc",
    "cost": 2,
    "traits": [
      "Elderwood",
      "Spellweaver"
    ],
    "ability": {
      "name": "Mirror Image",
      "active": "Launch a mirror image at the current target, dealing … magic damage and … to adjacent enemies.",
      "passive": "After player combat, your strongest LeBlanc has a … chance to create a copy of an ally on your board, increased by … per takedown.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 550,
      "damage": 30,
      "armor": 30,
      "magicResist": 30,
      "mana": 40,
      "range": 4,
      "attackSpeed": 0.7
    }
  },
  {
    "name": "Murkwolf",
    "cost": 2,
    "traits": [
      "Riftbeast",
      "Ravager"
    ],
    "ability": {
      "name": "Rending Claws",
      "active": "Leap to the lowest Health enemy within … Hexes and deal … physical damage. The next … attacks gain … Attack Speed and deal … bonus physical damage.",
      "scales": [
        "AD",
        "AP"
      ],
      "buff": {
        "label": "Grey Buff",
        "text": "Gain Precision and … Critical Strike Chance, increased up to … based on missing Health."
      }
    },
    "stats": {
      "hp": 700,
      "damage": 50,
      "armor": 40,
      "magicResist": 40,
      "mana": 40,
      "range": 1,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Scuttlecrab",
    "cost": 2,
    "traits": [
      "Riftbeast",
      "Juggernaut"
    ],
    "ability": {
      "name": "Can You Dig It?",
      "active": "Burrow underground, gaining … Durability for … seconds and healing … over the duration.",
      "passive": "Attacks are replaced by a dance that deals … physical damage to all adjacent enemies.",
      "scales": [
        "AD",
        "AP"
      ],
      "buff": {
        "label": "Green Buff",
        "text": "When allies fall below … Health, they restore … max Health."
      }
    },
    "stats": {
      "hp": 950,
      "damage": 50,
      "armor": 45,
      "magicResist": 45,
      "mana": 100,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Sejuani",
    "cost": 2,
    "traits": [
      "Solar",
      "Juggernaut"
    ],
    "ability": {
      "name": "Sun's Wrath",
      "active": "Gain … Shield for … seconds. Then cleave in a cone, dealing … magic damage and strike in a line, dealing … magic damage to enemies hit.",
      "scales": [
        "health",
        "AP"
      ]
    },
    "stats": {
      "hp": 900,
      "damage": 50,
      "armor": 45,
      "magicResist": 45,
      "mana": 100,
      "range": 1,
      "attackSpeed": 0.6
    }
  },
  {
    "name": "Shen",
    "cost": 2,
    "traits": [
      "Inferno",
      "Defender"
    ],
    "ability": {
      "name": "Ki Barrier",
      "active": "Grant … Shield to Shen and … Shield to a nearby damaged ally for … seconds. Both of their next … attacks gain … Attack Speed and deal … bonus magic damage.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 900,
      "damage": 50,
      "armor": 45,
      "magicResist": 45,
      "mana": 90,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Teemo",
    "cost": 2,
    "traits": [
      "Sprykin",
      "Invoker"
    ],
    "ability": {
      "name": "Fungus Among Us",
      "active": "Throw 2 clusters of mushrooms that deal … magic damage to the … nearest enemies. Then hurl a giant mushroom that deals … magic damage to the target.\nEach cast has a … chance to forage an extra mushroom that can be collected for bonus effects.\nRed: … Reroll (Reds Foraged: …)\nGreen: … Tactician Health (Greens Foraged: …)\nYellow: … XP (Yellows Foraged: …)",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 550,
      "damage": 35,
      "armor": 30,
      "magicResist": 30,
      "mana": 50,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Warwick",
    "cost": 2,
    "traits": [
      "Blackthorn",
      "Ravager"
    ],
    "ability": {
      "name": "Jaws of The Beast",
      "active": "Bite the current target, dealing … physical damage and healing for … of the damage dealt. Gain … Attack Speed for the rest of combat.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 750,
      "damage": 40,
      "armor": 45,
      "magicResist": 45,
      "mana": 40,
      "range": 1,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Yunara",
    "cost": 2,
    "traits": [
      "Blossom",
      "Executioner"
    ],
    "ability": {
      "name": "Cultivation of Spirit",
      "active": "Dash, then launch an orb at the current target that deals … physical damage and splits, dealing … physical damage to … nearby enemies.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 550,
      "damage": 42,
      "armor": 30,
      "magicResist": 30,
      "mana": 35,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Azir",
    "cost": 3,
    "traits": [
      "Blackthorn",
      "Executioner",
      "Summoner"
    ],
    "ability": {
      "name": "Arise!",
      "active": "Gain … Attack Speed and summon … soldiers for the next … attacks. These attacks are replaced by commands which direct each soldier to deal … magic damage per attack.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 650,
      "damage": 30,
      "armor": 35,
      "magicResist": 35,
      "mana": 35,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Cassiopeia",
    "cost": 3,
    "traits": [
      "Coven",
      "Spellweaver"
    ],
    "ability": {
      "name": "Noxious Blast",
      "active": "Poison the target and the nearest non-poisoned enemy, dealing … magic damage over … seconds. Poisons stack.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 650,
      "damage": 30,
      "armor": 35,
      "magicResist": 35,
      "mana": 30,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Diana",
    "cost": 3,
    "traits": [
      "Lunar",
      "Ravager",
      "Vanguard"
    ],
    "ability": {
      "name": "Pale Barrier",
      "active": "Gain … shield for … seconds and send out … moonlight orbs spread among enemies within 2 hexes, each dealing … magic damage.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 30,
      "armor": 50,
      "magicResist": 50,
      "mana": 40,
      "range": 1,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Fiddlesticks",
    "cost": 3,
    "traits": [
      "Flora Fatalis",
      "Defender",
      "Spellweaver"
    ],
    "ability": {
      "name": "Harvest",
      "active": "Reduce the Magic Resist of the … nearest enemies by …. Then drain life from them over … seconds, healing for … Health and dealing … magic damage to each over the duration.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 1000,
      "damage": 50,
      "armor": 55,
      "magicResist": 55,
      "mana": 90,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Hecarim",
    "cost": 3,
    "traits": [
      "Elderwood",
      "Vanguard"
    ],
    "ability": {
      "name": "Spirit of Dread",
      "active": "Gain … Armor and Magic Resist for 3 seconds and restore … Health over the duration. Launch spectral riders at the … nearest enemies, dealing … magic damage and Stunning them for … seconds.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 1100,
      "damage": 50,
      "armor": 50,
      "magicResist": 50,
      "mana": 110,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Kha'Zix",
    "cost": 3,
    "traits": [
      "Rival"
    ],
    "ability": {
      "name": "Taste Their Fear",
      "active": "Leap to the farthest enemy within … Hexes, dealing … magic damage. If they have no adjacent allies, deal … magic damage instead and gain … mana.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 30,
      "armor": 55,
      "magicResist": 55,
      "mana": 25,
      "range": 1,
      "attackSpeed": 0.85
    }
  },
  {
    "name": "Kog'Maw",
    "cost": 3,
    "traits": [
      "Caustic",
      "Adaptor",
      "Invoker"
    ],
    "ability": {
      "name": "Raining Artillery",
      "active": "Adaptor: Launch acid at the target and the other nearest enemy, dealing … physical damage. Enemies below … max Health take … physical damage instead.\nAdaptor: Damages enemies over time.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 650,
      "damage": 40,
      "armor": 35,
      "magicResist": 35,
      "mana": 55,
      "range": 4,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Krug",
    "cost": 3,
    "traits": [
      "Riftbeast",
      "Brawler"
    ],
    "ability": {
      "name": "Rock and Roll",
      "active": "Gain … max Health, then roll into the target, dealing … damage.",
      "passive": "On death, split into two Kruglettes with … Health which immediately taunt, forcing enemies to attack them.",
      "scales": [
        "health",
        "AP",
        "AD"
      ],
      "buff": {
        "label": "Slate Buff",
        "text": "On death, Krug and Kruglettes Shield allies for … max Health."
      }
    },
    "stats": {
      "hp": 1100,
      "damage": 55,
      "armor": 40,
      "magicResist": 40,
      "mana": 135,
      "range": 1,
      "attackSpeed": 0.6
    }
  },
  {
    "name": "Mama Beak",
    "cost": 3,
    "traits": [
      "Riftbeast",
      "Summoner",
      "Rapidfire"
    ],
    "ability": {
      "name": "Flock Family",
      "active": "Summon 4 untargetable Tiny Beaks nearby for … seconds. Whenever Mama Beak attacks, Tiny Beaks attack the same enemy, dealing … physical damage.",
      "scales": [
        "AP",
        "AD"
      ],
      "buff": {
        "label": "Orange Buff",
        "text": "Dealing physical damage reduces enemy Armor by …."
      }
    },
    "stats": {
      "hp": 650,
      "damage": 60,
      "armor": 35,
      "magicResist": 35,
      "mana": 60,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Master Yi",
    "cost": 3,
    "traits": [
      "Blossom",
      "Adaptor"
    ],
    "ability": {
      "name": "Wuju Style",
      "active": "",
      "passive": "Every third attack is a Double Strike. On takedown, gain a burst of movement speed.\nAdaptor: Double Strikes grant … stacking Attack Speed.\nAdaptor: Double Strikes deal bonus damage and heal.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 65,
      "armor": 60,
      "magicResist": 60,
      "mana": 3,
      "range": 1,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Rammus",
    "cost": 3,
    "traits": [
      "Sprykin",
      "Defender"
    ],
    "ability": {
      "name": "Defensive Ball Curl",
      "active": "Taunt, forcing enemies to attack this champion. For … seconds, gain … Shield and … Armor and Magic Resist.\nWhen the Shield breaks, deal … physical damage to enemies in … Hexes.",
      "scales": [
        "AP",
        "armor",
        "magic resist"
      ]
    },
    "stats": {
      "hp": 1100,
      "damage": 50,
      "armor": 50,
      "magicResist": 50,
      "mana": 80,
      "range": 1,
      "attackSpeed": 0.6
    }
  },
  {
    "name": "Rengar",
    "cost": 3,
    "traits": [
      "Rival"
    ],
    "ability": {
      "name": "Savagery",
      "active": "Jump to the lowest percent Health enemy within … hexes and stab them, dealing … physical damage. Then heal for …, increased to up to … based on their missing Health.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 900,
      "damage": 60,
      "armor": 55,
      "magicResist": 55,
      "mana": 50,
      "range": 1,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Tristana",
    "cost": 3,
    "traits": [
      "Fae",
      "Sprykin",
      "Hunter"
    ],
    "ability": {
      "name": "Explosive Charge",
      "active": "Attach an explosive charge to the target that lasts … seconds. While active, gain infinite range and … Attack Speed. After the duration, the charge explodes and splits damage between all enemies within 2 hexes, dealing … physical damage + … for each attack while casting.\nIf an enemy with an explosive charge on them dies, it attaches to Tristana's new target.",
      "scales": [
        "AP",
        "AD"
      ]
    },
    "stats": {
      "hp": 650,
      "damage": 55,
      "armor": 35,
      "magicResist": 35,
      "mana": 60,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Vi",
    "cost": 3,
    "traits": [
      "Primal",
      "Juggernaut"
    ],
    "ability": {
      "name": "Furious Fists",
      "active": "Unleash a primal roar, restoring … Health. Then gain … Attack Speed, … Durability, and is Unstoppable for … seconds.",
      "passive": "On attack, restore … Health.",
      "scales": [
        "health",
        "AP"
      ]
    },
    "stats": {
      "hp": 1100,
      "damage": 45,
      "armor": 50,
      "magicResist": 50,
      "mana": 60,
      "range": 1,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Ahri",
    "cost": 4,
    "traits": [
      "Blossom",
      "Spellweaver"
    ],
    "ability": {
      "name": "Spirit Bomb",
      "active": "Launch a spirit bomb at the location within … hexes that has the most surrounding enemies. It deals … magic damage to enemies in a … hex radius, reduced by … per hex away from the epicenter.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 40,
      "armor": 40,
      "magicResist": 40,
      "mana": 100,
      "range": 4,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Amumu",
    "cost": 4,
    "traits": [
      "Inferno",
      "Juggernaut"
    ],
    "ability": {
      "name": "Tantrum",
      "active": "Deal … magic damage to enemies within … hexes and Stun them for … seconds, increased to … seconds if the target is Burning.\nBurn: Deals a percent of the target's max Health as true damage every second.",
      "passive": "Every second, restore … Health and deal … magic damage to enemies within … hex.",
      "scales": [
        "AP",
        "health"
      ]
    },
    "stats": {
      "hp": 1300,
      "damage": 70,
      "armor": 60,
      "magicResist": 60,
      "mana": 140,
      "range": 1,
      "attackSpeed": 0.7
    }
  },
  {
    "name": "Aphelios",
    "cost": 4,
    "traits": [
      "Lunar",
      "Rapidfire"
    ],
    "ability": {
      "name": "Moonlight's Onslaught",
      "active": "Equip Severum and swipe the target … times over … seconds, each dealing … physical damage.\nAfter the onslaught finishes, fire a blast that deals … physical damage split among all enemies in a 2 Hex radius.",
      "scales": [
        "attack speed",
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 60,
      "armor": 40,
      "magicResist": 40,
      "mana": 70,
      "range": 4,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Brambleback",
    "cost": 4,
    "traits": [
      "Riftbeast",
      "Ravager"
    ],
    "ability": {
      "name": "Crimson Fury",
      "active": "Gain … Attack Damage for … seconds. During this time ignore … Armor.",
      "passive": "When the target dies, leap at the next target, dealing … physical damage.",
      "scales": [
        "AD",
        "AP"
      ],
      "buff": {
        "label": "Red Buff",
        "text": "Attacks … Burn enemies and heal Brambleback for … max Health."
      }
    },
    "stats": {
      "hp": 1100,
      "damage": 110,
      "armor": 65,
      "magicResist": 65,
      "mana": 40,
      "range": 1,
      "attackSpeed": 0.55
    }
  },
  {
    "name": "Ezreal",
    "cost": 4,
    "traits": [
      "Elderwood",
      "Executioner"
    ],
    "ability": {
      "name": "Forest's Flurry",
      "active": "Blink away from the current target, deal … physical damage to them, and gain … Attack Speed.\nEvery 4th cast consumes the Attack Speed granted from Nature's Wrath and fires a blast through the largest group of enemies that deals … physical damage, reduced by … for each enemy it passes through (minimum …).",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 45,
      "armor": 40,
      "magicResist": 40,
      "mana": 30,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Lillia",
    "cost": 4,
    "traits": [
      "Fae",
      "Defender"
    ],
    "ability": {
      "name": "Lilting Lullaby",
      "active": "Restore … Health and send … butterflies at nearby enemies. Enemies hit take … magic damage and Sleep for … seconds. If they take … damage, they wake up and take an additional … max Health magic damage.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 1300,
      "damage": 40,
      "armor": 60,
      "magicResist": 60,
      "mana": 140,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Malphite",
    "cost": 4,
    "traits": [
      "Blackthorn",
      "Monolith"
    ],
    "ability": {
      "name": "Petrified Bark",
      "active": "Gain … Shield for … seconds and become petrified. When the shield breaks, unleash a wave of dark energy, dealing … magic damage to enemies within … hexes.",
      "scales": [
        "AP",
        "armor",
        "magic resist"
      ]
    },
    "stats": {
      "hp": 1300,
      "damage": 70,
      "armor": 70,
      "magicResist": 70,
      "mana": 80,
      "range": 1,
      "attackSpeed": 0.55
    }
  },
  {
    "name": "Morgana",
    "cost": 4,
    "traits": [
      "Coven",
      "Invoker"
    ],
    "ability": {
      "name": "Withering Curse",
      "active": "Fire a dark blast at … nearby enemies, dealing … magic damage to them and cursing them for … seconds. Then, spawn a … Hex withering zone for the same duration that deals … magic damage per second. Cursed enemies take … more damage per curse.",
      "passive": "Gain … Omnivamp.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 1100,
      "damage": 45,
      "armor": 60,
      "magicResist": 60,
      "mana": 60,
      "range": 2,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Nidalee",
    "cost": 4,
    "traits": [
      "Primal",
      "Adaptor"
    ],
    "ability": {
      "name": "Javelin Toss",
      "active": "Adaptor: Gain … Attack Speed for the next … attacks. These attacks are replaced with javelins that deal … magic damage. The 3rd attack instead targets the furthest enemy with the least items and deals … magic damage.\nAdaptor: Transform into a Melee cougar Assassin that swipes enemies.",
      "scales": [
        "AP",
        "AD"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 35,
      "armor": 30,
      "magicResist": 30,
      "mana": 40,
      "range": 1,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Sentinel",
    "cost": 4,
    "traits": [
      "Riftbeast",
      "Vanguard",
      "Invoker"
    ],
    "ability": {
      "name": "Azure Shockwave",
      "active": "Gain … Shield for … seconds. Slam the ground, sending a fissure in the direction of the most enemies. Enemies hit are briefly knocked up, take … magic damage, and are Mana Reaved for ….",
      "scales": [
        "AP",
        "health"
      ],
      "notes": [
        "Mana Reave: Increase the Mana cost of the next Ability cast."
      ],
      "buff": {
        "label": "Blue Buff",
        "text": "Each time Sentinel casts, allies gain … Mana Regen."
      }
    },
    "stats": {
      "hp": 1300,
      "damage": 75,
      "armor": 60,
      "magicResist": 60,
      "mana": 150,
      "range": 1,
      "attackSpeed": 0.6
    }
  },
  {
    "name": "Sett",
    "cost": 4,
    "traits": [
      "Blossom",
      "Brawler"
    ],
    "ability": {
      "name": "Haymaker",
      "active": "Wind up a big punch, rapidly healing for … before dealing … physical damage in a large cone.",
      "passive": "Upon falling below … max Health the first time each combat, gain 100 mana.",
      "scales": [
        "health",
        "AP",
        "AD"
      ]
    },
    "stats": {
      "hp": 1200,
      "damage": 80,
      "armor": 60,
      "magicResist": 60,
      "mana": 135,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Sivir",
    "cost": 4,
    "traits": [
      "Primal",
      "Hunter"
    ],
    "ability": {
      "name": "Boomerang Blade",
      "active": "Throw a large crossblade that deals … physical damage to the current target and bounces … times between nearby enemies, dealing … physical damage each bounce. When this kills an enemy, bounce … additional times.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 50,
      "armor": 40,
      "magicResist": 40,
      "mana": 40,
      "range": 4,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Soraka",
    "cost": 4,
    "traits": [
      "Flora Fatalis",
      "Executioner"
    ],
    "ability": {
      "name": "Starcall",
      "active": "Call down a star on the current target, dealing … magic damage. If a star has previously fallen on them, call down … additional stars that each deal … magic damage.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 30,
      "armor": 40,
      "magicResist": 40,
      "mana": 30,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Zyra",
    "cost": 4,
    "traits": [
      "Thornmaiden",
      "Summoner"
    ],
    "ability": {
      "name": "Rampant Growth",
      "active": "Spawn … plants around the battlefield that attack the nearest enemy … times. Each attack deals … magic damage.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 850,
      "damage": 40,
      "armor": 40,
      "magicResist": 40,
      "mana": 45,
      "range": 4,
      "attackSpeed": 0.75
    }
  },
  {
    "name": "Alune",
    "cost": 5,
    "traits": [
      "Attuned",
      "Lunar",
      "Spellweaver"
    ],
    "ability": {
      "name": "Moonfall",
      "active": "Rain … moonshards split among the … nearest enemies, dealing … magic damage each.\nIf the moon is full, instead crash it onto the board, dealing … magic damage split among all enemies.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 900,
      "damage": 40,
      "armor": 45,
      "magicResist": 45,
      "mana": 35,
      "range": 4,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Ashe",
    "cost": 5,
    "traits": [
      "Blossom",
      "Hunter"
    ],
    "ability": {
      "name": "Spirit Rift",
      "active": "Fire an arrow through the most enemies in a line that deals … physical damage, reduced by … per enemy hit (minimum …).\nThe arrow leaves a trail for … seconds that deals … + … max Health physical damage per second to enemies within and … Slows them.\nSlow: Reduce Attack Speed",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 900,
      "damage": 75,
      "armor": 45,
      "magicResist": 45,
      "mana": 80,
      "range": 6,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Draven",
    "cost": 5,
    "traits": [
      "Bounty Seeker"
    ],
    "ability": {
      "name": "Whirling Death",
      "active": "Throw two giant axes towards the enemy with the most bleeds. Deal … physical damage to enemies hit and consume their bleed, instantly dealing the remaining damage. The axes then return, dealing … physical damage to enemies hit.",
      "passive": "Attacks target random enemies in range and apply a bleed that deals … physical damage over … seconds. Every attack has a … chance to deal … bonus physical damage and apply … bleeds instead.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 900,
      "damage": 48,
      "armor": 45,
      "magicResist": 45,
      "mana": 120,
      "range": 6,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Elder Dragon",
    "cost": 5,
    "traits": [
      "Apex Predator",
      "Riftbeast"
    ],
    "ability": {
      "name": "Heat Without Equal",
      "active": "Become invulnerable and fly into the air. On return, stun all enemies for … seconds, gain … Omnivamp, and Ignite them for … seconds. Ignited enemies take … max Health physical damage per second. Replace this ability with Flame Breath and immediately cast it.\nFlame Breath: Spew fire at the most enemies in a line through the target, dealing … physical damage, reduced by … for each enemy it passes through (minimum ….) Ignite those enemies for … seconds.\nElder Dragon Buff: Damaging an enemy below … Health executes them.",
      "passive": "Attacks deal … damage to enemies adjacent to the target.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 1800,
      "damage": 110,
      "armor": 70,
      "magicResist": 70,
      "mana": 60,
      "range": 2,
      "attackSpeed": 0.5
    }
  },
  {
    "name": "Gnar",
    "cost": 5,
    "traits": [
      "Elderwood",
      "Sprykin",
      "Brawler"
    ],
    "ability": {
      "name": "Rage Gene",
      "active": "Transform into Mega Gnar and leap into the largest group of enemies within … hexes. Then, deal … physical damage to enemies within … hexes, reduce their Armor and Magic Resist by …, and Stun them for … second. Mega Gnar gains … Health, and replaces his Ability with Grab n' Throw.\nGrab n' Throw: Throw the target at the farthest enemy, dealing … physical damage to them and … physical damage to enemies they pass through. If there's only 1 enemy left, throw them off the battlefield instead.",
      "passive": "Gain … Rage per second and … Rage per attack.",
      "scales": [
        "AD",
        "AP"
      ]
    },
    "stats": {
      "hp": 900,
      "damage": 100,
      "armor": 55,
      "magicResist": 55,
      "mana": 70,
      "range": 2,
      "attackSpeed": 0.9
    }
  },
  {
    "name": "Ivern",
    "cost": 5,
    "traits": [
      "Greenfather"
    ],
    "ability": {
      "name": "Triggerseed",
      "active": "Grant … allies … Shield and … Damage Amp for … seconds. Then deal … magic damage to enemies adjacent to them. After casting … times, also grant … stacking Attack Speed to targets.",
      "passive": "Shields from this Ability can critically strike with Precision.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 1000,
      "damage": 60,
      "armor": 55,
      "magicResist": 55,
      "mana": 80,
      "range": 3,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Kennen",
    "cost": 5,
    "traits": [
      "Inferno",
      "Executioner"
    ],
    "ability": {
      "name": "Firestorm",
      "active": "Charge up, gaining … Ability Power per Burning enemy. Then, gain … Shield for … seconds and rush through a nearby group of enemies, dealing … magic damage to each.\nAfter rushing, unleash a … Hex firestorm that deals a total of … magic damage split among all enemies hit over … seconds.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 1200,
      "damage": 50,
      "armor": 60,
      "magicResist": 60,
      "mana": 40,
      "range": 2,
      "attackSpeed": 0.85
    }
  },
  {
    "name": "Lux",
    "cost": 5,
    "traits": [
      "Avatar"
    ],
    "ability": {
      "name": "Final Spark",
      "active": "Fire a laser towards the largest group of enemies that deals … magic damage, reduced by … for each enemy hit.",
      "passive": "On cast, all allies that share a trait with Lux gain … mana.",
      "scales": [
        "AP"
      ]
    },
    "stats": {
      "hp": 900,
      "damage": 40,
      "armor": 40,
      "magicResist": 40,
      "mana": 70,
      "range": 6,
      "attackSpeed": 0.8
    }
  },
  {
    "name": "Maokai",
    "cost": 5,
    "traits": [
      "Old Growth",
      "Juggernaut"
    ],
    "ability": {
      "name": "Sow the Seeds",
      "active": "Deal … magic damage to target and restore … + … missing Health.",
      "passive": "After every … damage blocked, a sapling jumps towards a nearby enemy and deals … magic damage. On death, … saplings jump out.",
      "scales": [
        "health",
        "AP"
      ]
    },
    "stats": {
      "hp": 1100,
      "damage": 80,
      "armor": 60,
      "magicResist": 60,
      "mana": 100,
      "range": 1,
      "attackSpeed": 0.65
    }
  },
  {
    "name": "Taric",
    "cost": 5,
    "traits": [
      "Emerald Aspect",
      "Vanguard"
    ],
    "ability": {
      "name": "Emerald Radiance",
      "active": "Restore … Health. Taric and his paired ally deal … bonus magic damage on their next … attacks.",
      "passive": "The first time Taric or his paired ally drops below … Health, unleash emerald energy from both of them, granting … Shield to allies within … Hexes for … seconds.",
      "scales": [
        "health",
        "AP"
      ]
    },
    "stats": {
      "hp": 1300,
      "damage": 55,
      "armor": 65,
      "magicResist": 65,
      "mana": 65,
      "range": 1,
      "attackSpeed": 0.75
    }
  }
];
