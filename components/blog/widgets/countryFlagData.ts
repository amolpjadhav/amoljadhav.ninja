// GENERATED FILE — do not edit by hand.
//
// Every country the World Bank lists, with its flag and the design family the
// flag belongs to. Regenerate with:
//
//   node scripts/generate-country-flags.mjs
//
// Flag images come from flagcdn at a stable URL per ISO code. Family membership
// and the lookalike pairs are editorial and live in the script, where each one
// is written down with its origin. Flag meanings are deliberately absent — see
// the note at the top of the generator.
//
// Generated 2026-09-08.

export interface FlagFamily {
  id: string;
  name: string;
  origin: string;
  /** ISO 3166-1 alpha-2 codes belonging to this family. */
  codes: string[];
}

export interface Country {
  /** ISO 3166-1 alpha-2, lowercased for the image URL. */
  code: string;
  name: string;
  region: string;
  capital: string | null;
  /** False for dependencies, overseas territories and SARs. */
  sovereign: boolean;
  families: string[];
}

export interface Lookalike {
  codes: string[];
  note: string;
}

export interface FlagQuizQuestion {
  question: string;
  image: string;
  imageAlt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Wikipedia article the flag's note came from. CC BY-SA, so credit it. */
  sourceUrl?: string;
}

/** 320px wide PNG. Use the svg variant only where the flag is shown large. */
export function flagUrl(code: string, width: 40 | 80 | 160 | 320 = 320): string {
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
}

export const FLAG_FAMILIES: FlagFamily[] = [
  {
    "id": "nordic-cross",
    "name": "The Nordic cross",
    "origin": "Denmark’s Dannebrog, the oldest national flag still in use. The off-center cross spread across every Nordic country and their island territories.",
    "codes": [
      "DK",
      "SE",
      "NO",
      "IS",
      "FI",
      "FO"
    ]
  },
  {
    "id": "pan-arab",
    "name": "Pan-Arab colors",
    "origin": "The flag of the 1916 Arab Revolt, whose black, white, green, and red stand for four historic dynasties. Almost every flag in the region is a rearrangement of those four.",
    "codes": [
      "EG",
      "IQ",
      "SY",
      "JO",
      "KW",
      "AE",
      "PS",
      "SD",
      "YE"
    ]
  },
  {
    "id": "pan-african",
    "name": "Pan-African colors",
    "origin": "Ethiopia’s red, gold, and green. Ethiopia was the African state that resisted colonization, so newly independent countries adopted its colors deliberately — Ghana first, in 1957.",
    "codes": [
      "ET",
      "GH",
      "SN",
      "ML",
      "GN",
      "CM",
      "TG",
      "BJ",
      "BF",
      "CG",
      "GW",
      "ST",
      "ZW"
    ]
  },
  {
    "id": "crescent-star",
    "name": "Crescent and star",
    "origin": "Spread first by the Ottoman Empire, then adopted as a marker of Islamic identity by countries the Ottomans never ruled. Not every crescent means that, though: Singapore’s stands for a young country rising, and has no religious sense at all.",
    "codes": [
      "TR",
      "TN",
      "DZ",
      "LY",
      "PK",
      "MY",
      "MR",
      "KM",
      "AZ",
      "UZ",
      "TM",
      "SG"
    ]
  },
  {
    "id": "union-canton",
    "name": "The Union Jack in the corner",
    "origin": "A British ensign with the Union Flag in the upper hoist. The countries that kept it after independence are making a statement by keeping it, and several have voted on removing it.",
    "codes": [
      "AU",
      "NZ",
      "FJ",
      "TV"
    ]
  },
  {
    "id": "southern-cross",
    "name": "The Southern Cross",
    "origin": "A constellation you can only see from the southern hemisphere, which makes it a flag element that is literally unavailable to half the world.",
    "codes": [
      "AU",
      "NZ",
      "BR",
      "PG",
      "WS"
    ]
  },
  {
    "id": "own-map",
    "name": "A map of itself",
    "origin": "Only two national flags show the outline of their own territory. Both were designed to avoid the symbols of the communities inside them.",
    "codes": [
      "CY",
      "XK"
    ]
  },
  {
    "id": "odd-shape",
    "name": "Not a rectangle",
    "origin": "Nepal is the only national flag that is not a rectangle — two stacked pennants. Switzerland and the Vatican are the only squares.",
    "codes": [
      "NP",
      "CH",
      "VA"
    ]
  }
];

export const LOOKALIKES: Lookalike[] = [
  {
    "codes": [
      "TD",
      "RO"
    ],
    "note": "Identical layout; Chad’s blue is darker. Chad has raised it at the UN."
  },
  {
    "codes": [
      "ID",
      "MC"
    ],
    "note": "The same two bands. Indonesia’s flag is longer."
  },
  {
    "codes": [
      "IE",
      "CI"
    ],
    "note": "Mirror images of each other — green is on the hoist for Ireland, the fly for Côte d’Ivoire."
  },
  {
    "codes": [
      "NL",
      "LU"
    ],
    "note": "Same three bands; Luxembourg’s blue is lighter and its flag longer."
  },
  {
    "codes": [
      "AU",
      "NZ"
    ],
    "note": "Both are Union-canton flags with the Southern Cross. New Zealand has four stars, Australia six."
  },
  {
    "codes": [
      "SI",
      "SK",
      "RS"
    ],
    "note": "Three Pan-Slavic tricolors separated only by their coats of arms."
  }
];

export const COUNTRIES: Country[] = [
  {
    "code": "AF",
    "name": "Afghanistan",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Kabul",
    "sovereign": true,
    "families": []
  },
  {
    "code": "AL",
    "name": "Albania",
    "region": "Europe & Central Asia",
    "capital": "Tirane",
    "sovereign": true,
    "families": []
  },
  {
    "code": "DZ",
    "name": "Algeria",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Algiers",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "AS",
    "name": "American Samoa",
    "region": "East Asia & Pacific",
    "capital": "Pago Pago",
    "sovereign": false,
    "families": []
  },
  {
    "code": "AD",
    "name": "Andorra",
    "region": "Europe & Central Asia",
    "capital": "Andorra la Vella",
    "sovereign": true,
    "families": []
  },
  {
    "code": "AO",
    "name": "Angola",
    "region": "Sub-Saharan Africa",
    "capital": "Luanda",
    "sovereign": true,
    "families": []
  },
  {
    "code": "AG",
    "name": "Antigua and Barbuda",
    "region": "Latin America & Caribbean",
    "capital": "Saint John's",
    "sovereign": true,
    "families": []
  },
  {
    "code": "AR",
    "name": "Argentina",
    "region": "Latin America & Caribbean",
    "capital": "Buenos Aires",
    "sovereign": true,
    "families": []
  },
  {
    "code": "AM",
    "name": "Armenia",
    "region": "Europe & Central Asia",
    "capital": "Yerevan",
    "sovereign": true,
    "families": []
  },
  {
    "code": "AW",
    "name": "Aruba",
    "region": "Latin America & Caribbean",
    "capital": "Oranjestad",
    "sovereign": false,
    "families": []
  },
  {
    "code": "AU",
    "name": "Australia",
    "region": "East Asia & Pacific",
    "capital": "Canberra",
    "sovereign": true,
    "families": [
      "union-canton",
      "southern-cross"
    ]
  },
  {
    "code": "AT",
    "name": "Austria",
    "region": "Europe & Central Asia",
    "capital": "Vienna",
    "sovereign": true,
    "families": []
  },
  {
    "code": "AZ",
    "name": "Azerbaijan",
    "region": "Europe & Central Asia",
    "capital": "Baku",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "BH",
    "name": "Bahrain",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Manama",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BD",
    "name": "Bangladesh",
    "region": "South Asia",
    "capital": "Dhaka",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BB",
    "name": "Barbados",
    "region": "Latin America & Caribbean",
    "capital": "Bridgetown",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BY",
    "name": "Belarus",
    "region": "Europe & Central Asia",
    "capital": "Minsk",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BE",
    "name": "Belgium",
    "region": "Europe & Central Asia",
    "capital": "Brussels",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BZ",
    "name": "Belize",
    "region": "Latin America & Caribbean",
    "capital": "Belmopan",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BJ",
    "name": "Benin",
    "region": "Sub-Saharan Africa",
    "capital": "Porto-Novo",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "BM",
    "name": "Bermuda",
    "region": "North America",
    "capital": "Hamilton",
    "sovereign": false,
    "families": []
  },
  {
    "code": "BT",
    "name": "Bhutan",
    "region": "South Asia",
    "capital": "Thimphu",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BO",
    "name": "Bolivia",
    "region": "Latin America & Caribbean",
    "capital": "La Paz",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BA",
    "name": "Bosnia and Herzegovina",
    "region": "Europe & Central Asia",
    "capital": "Sarajevo",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BW",
    "name": "Botswana",
    "region": "Sub-Saharan Africa",
    "capital": "Gaborone",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BR",
    "name": "Brazil",
    "region": "Latin America & Caribbean",
    "capital": "Brasilia",
    "sovereign": true,
    "families": [
      "southern-cross"
    ]
  },
  {
    "code": "VG",
    "name": "British Virgin Islands",
    "region": "Latin America & Caribbean",
    "capital": "Road Town",
    "sovereign": false,
    "families": []
  },
  {
    "code": "BN",
    "name": "Brunei",
    "region": "East Asia & Pacific",
    "capital": "Bandar Seri Begawan",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BG",
    "name": "Bulgaria",
    "region": "Europe & Central Asia",
    "capital": "Sofia",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BF",
    "name": "Burkina Faso",
    "region": "Sub-Saharan Africa",
    "capital": "Ouagadougou",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "BI",
    "name": "Burundi",
    "region": "Sub-Saharan Africa",
    "capital": "Bujumbura",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CV",
    "name": "Cabo Verde",
    "region": "Sub-Saharan Africa",
    "capital": "Praia",
    "sovereign": true,
    "families": []
  },
  {
    "code": "KH",
    "name": "Cambodia",
    "region": "East Asia & Pacific",
    "capital": "Phnom Penh",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CM",
    "name": "Cameroon",
    "region": "Sub-Saharan Africa",
    "capital": "Yaounde",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "CA",
    "name": "Canada",
    "region": "North America",
    "capital": "Ottawa",
    "sovereign": true,
    "families": []
  },
  {
    "code": "KY",
    "name": "Cayman Islands",
    "region": "Latin America & Caribbean",
    "capital": "George Town",
    "sovereign": false,
    "families": []
  },
  {
    "code": "CF",
    "name": "Central African Republic",
    "region": "Sub-Saharan Africa",
    "capital": "Bangui",
    "sovereign": true,
    "families": []
  },
  {
    "code": "TD",
    "name": "Chad",
    "region": "Sub-Saharan Africa",
    "capital": "N'Djamena",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CL",
    "name": "Chile",
    "region": "Latin America & Caribbean",
    "capital": "Santiago",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CN",
    "name": "China",
    "region": "East Asia & Pacific",
    "capital": "Beijing",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CO",
    "name": "Colombia",
    "region": "Latin America & Caribbean",
    "capital": "Bogota",
    "sovereign": true,
    "families": []
  },
  {
    "code": "KM",
    "name": "Comoros",
    "region": "Sub-Saharan Africa",
    "capital": "Moroni",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "CR",
    "name": "Costa Rica",
    "region": "Latin America & Caribbean",
    "capital": "San Jose",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CI",
    "name": "Côte d’Ivoire",
    "region": "Sub-Saharan Africa",
    "capital": "Yamoussoukro",
    "sovereign": true,
    "families": []
  },
  {
    "code": "HR",
    "name": "Croatia",
    "region": "Europe & Central Asia",
    "capital": "Zagreb",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CU",
    "name": "Cuba",
    "region": "Latin America & Caribbean",
    "capital": "Havana",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CW",
    "name": "Curacao",
    "region": "Latin America & Caribbean",
    "capital": "Willemstad",
    "sovereign": false,
    "families": []
  },
  {
    "code": "CY",
    "name": "Cyprus",
    "region": "Europe & Central Asia",
    "capital": "Nicosia",
    "sovereign": true,
    "families": [
      "own-map"
    ]
  },
  {
    "code": "CZ",
    "name": "Czechia",
    "region": "Europe & Central Asia",
    "capital": "Prague",
    "sovereign": true,
    "families": []
  },
  {
    "code": "DK",
    "name": "Denmark",
    "region": "Europe & Central Asia",
    "capital": "Copenhagen",
    "sovereign": true,
    "families": [
      "nordic-cross"
    ]
  },
  {
    "code": "DJ",
    "name": "Djibouti",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Djibouti",
    "sovereign": true,
    "families": []
  },
  {
    "code": "DM",
    "name": "Dominica",
    "region": "Latin America & Caribbean",
    "capital": "Roseau",
    "sovereign": true,
    "families": []
  },
  {
    "code": "DO",
    "name": "Dominican Republic",
    "region": "Latin America & Caribbean",
    "capital": "Santo Domingo",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CD",
    "name": "DR Congo",
    "region": "Sub-Saharan Africa",
    "capital": "Kinshasa",
    "sovereign": true,
    "families": []
  },
  {
    "code": "EC",
    "name": "Ecuador",
    "region": "Latin America & Caribbean",
    "capital": "Quito",
    "sovereign": true,
    "families": []
  },
  {
    "code": "EG",
    "name": "Egypt",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Cairo",
    "sovereign": true,
    "families": [
      "pan-arab"
    ]
  },
  {
    "code": "SV",
    "name": "El Salvador",
    "region": "Latin America & Caribbean",
    "capital": "San Salvador",
    "sovereign": true,
    "families": []
  },
  {
    "code": "GQ",
    "name": "Equatorial Guinea",
    "region": "Sub-Saharan Africa",
    "capital": "Malabo",
    "sovereign": true,
    "families": []
  },
  {
    "code": "ER",
    "name": "Eritrea",
    "region": "Sub-Saharan Africa",
    "capital": "Asmara",
    "sovereign": true,
    "families": []
  },
  {
    "code": "EE",
    "name": "Estonia",
    "region": "Europe & Central Asia",
    "capital": "Tallinn",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SZ",
    "name": "Eswatini",
    "region": "Sub-Saharan Africa",
    "capital": "Mbabane",
    "sovereign": true,
    "families": []
  },
  {
    "code": "ET",
    "name": "Ethiopia",
    "region": "Sub-Saharan Africa",
    "capital": "Addis Ababa",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "FO",
    "name": "Faroe Islands",
    "region": "Europe & Central Asia",
    "capital": "Torshavn",
    "sovereign": false,
    "families": [
      "nordic-cross"
    ]
  },
  {
    "code": "FJ",
    "name": "Fiji",
    "region": "East Asia & Pacific",
    "capital": "Suva",
    "sovereign": true,
    "families": [
      "union-canton"
    ]
  },
  {
    "code": "FI",
    "name": "Finland",
    "region": "Europe & Central Asia",
    "capital": "Helsinki",
    "sovereign": true,
    "families": [
      "nordic-cross"
    ]
  },
  {
    "code": "FR",
    "name": "France",
    "region": "Europe & Central Asia",
    "capital": "Paris",
    "sovereign": true,
    "families": []
  },
  {
    "code": "PF",
    "name": "French Polynesia",
    "region": "East Asia & Pacific",
    "capital": "Papeete",
    "sovereign": false,
    "families": []
  },
  {
    "code": "GA",
    "name": "Gabon",
    "region": "Sub-Saharan Africa",
    "capital": "Libreville",
    "sovereign": true,
    "families": []
  },
  {
    "code": "GE",
    "name": "Georgia",
    "region": "Europe & Central Asia",
    "capital": "Tbilisi",
    "sovereign": true,
    "families": []
  },
  {
    "code": "DE",
    "name": "Germany",
    "region": "Europe & Central Asia",
    "capital": "Berlin",
    "sovereign": true,
    "families": []
  },
  {
    "code": "GH",
    "name": "Ghana",
    "region": "Sub-Saharan Africa",
    "capital": "Accra",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "GI",
    "name": "Gibraltar",
    "region": "Europe & Central Asia",
    "capital": null,
    "sovereign": false,
    "families": []
  },
  {
    "code": "GR",
    "name": "Greece",
    "region": "Europe & Central Asia",
    "capital": "Athens",
    "sovereign": true,
    "families": []
  },
  {
    "code": "GL",
    "name": "Greenland",
    "region": "Europe & Central Asia",
    "capital": "Nuuk",
    "sovereign": false,
    "families": []
  },
  {
    "code": "GD",
    "name": "Grenada",
    "region": "Latin America & Caribbean",
    "capital": "Saint George's",
    "sovereign": true,
    "families": []
  },
  {
    "code": "GU",
    "name": "Guam",
    "region": "East Asia & Pacific",
    "capital": "Agana",
    "sovereign": false,
    "families": []
  },
  {
    "code": "GT",
    "name": "Guatemala",
    "region": "Latin America & Caribbean",
    "capital": "Guatemala City",
    "sovereign": true,
    "families": []
  },
  {
    "code": "GN",
    "name": "Guinea",
    "region": "Sub-Saharan Africa",
    "capital": "Conakry",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "GW",
    "name": "Guinea-Bissau",
    "region": "Sub-Saharan Africa",
    "capital": "Bissau",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "GY",
    "name": "Guyana",
    "region": "Latin America & Caribbean",
    "capital": "Georgetown",
    "sovereign": true,
    "families": []
  },
  {
    "code": "HT",
    "name": "Haiti",
    "region": "Latin America & Caribbean",
    "capital": "Port-au-Prince",
    "sovereign": true,
    "families": []
  },
  {
    "code": "HN",
    "name": "Honduras",
    "region": "Latin America & Caribbean",
    "capital": "Tegucigalpa",
    "sovereign": true,
    "families": []
  },
  {
    "code": "HK",
    "name": "Hong Kong",
    "region": "East Asia & Pacific",
    "capital": null,
    "sovereign": false,
    "families": []
  },
  {
    "code": "HU",
    "name": "Hungary",
    "region": "Europe & Central Asia",
    "capital": "Budapest",
    "sovereign": true,
    "families": []
  },
  {
    "code": "IS",
    "name": "Iceland",
    "region": "Europe & Central Asia",
    "capital": "Reykjavik",
    "sovereign": true,
    "families": [
      "nordic-cross"
    ]
  },
  {
    "code": "IN",
    "name": "India",
    "region": "South Asia",
    "capital": "New Delhi",
    "sovereign": true,
    "families": []
  },
  {
    "code": "ID",
    "name": "Indonesia",
    "region": "East Asia & Pacific",
    "capital": "Jakarta",
    "sovereign": true,
    "families": []
  },
  {
    "code": "IR",
    "name": "Iran",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Tehran",
    "sovereign": true,
    "families": []
  },
  {
    "code": "IQ",
    "name": "Iraq",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Baghdad",
    "sovereign": true,
    "families": [
      "pan-arab"
    ]
  },
  {
    "code": "IE",
    "name": "Ireland",
    "region": "Europe & Central Asia",
    "capital": "Dublin",
    "sovereign": true,
    "families": []
  },
  {
    "code": "IM",
    "name": "Isle of Man",
    "region": "Europe & Central Asia",
    "capital": "Douglas",
    "sovereign": false,
    "families": []
  },
  {
    "code": "IL",
    "name": "Israel",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": null,
    "sovereign": true,
    "families": []
  },
  {
    "code": "IT",
    "name": "Italy",
    "region": "Europe & Central Asia",
    "capital": "Rome",
    "sovereign": true,
    "families": []
  },
  {
    "code": "JM",
    "name": "Jamaica",
    "region": "Latin America & Caribbean",
    "capital": "Kingston",
    "sovereign": true,
    "families": []
  },
  {
    "code": "JP",
    "name": "Japan",
    "region": "East Asia & Pacific",
    "capital": "Tokyo",
    "sovereign": true,
    "families": []
  },
  {
    "code": "JO",
    "name": "Jordan",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Amman",
    "sovereign": true,
    "families": [
      "pan-arab"
    ]
  },
  {
    "code": "KZ",
    "name": "Kazakhstan",
    "region": "Europe & Central Asia",
    "capital": "Astana",
    "sovereign": true,
    "families": []
  },
  {
    "code": "KE",
    "name": "Kenya",
    "region": "Sub-Saharan Africa",
    "capital": "Nairobi",
    "sovereign": true,
    "families": []
  },
  {
    "code": "KI",
    "name": "Kiribati",
    "region": "East Asia & Pacific",
    "capital": "Tarawa",
    "sovereign": true,
    "families": []
  },
  {
    "code": "XK",
    "name": "Kosovo",
    "region": "Europe & Central Asia",
    "capital": "Pristina",
    "sovereign": false,
    "families": [
      "own-map"
    ]
  },
  {
    "code": "KW",
    "name": "Kuwait",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Kuwait City",
    "sovereign": true,
    "families": [
      "pan-arab"
    ]
  },
  {
    "code": "KG",
    "name": "Kyrgyzstan",
    "region": "Europe & Central Asia",
    "capital": "Bishkek",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LA",
    "name": "Laos",
    "region": "East Asia & Pacific",
    "capital": "Vientiane",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LV",
    "name": "Latvia",
    "region": "Europe & Central Asia",
    "capital": "Riga",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LB",
    "name": "Lebanon",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Beirut",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LS",
    "name": "Lesotho",
    "region": "Sub-Saharan Africa",
    "capital": "Maseru",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LR",
    "name": "Liberia",
    "region": "Sub-Saharan Africa",
    "capital": "Monrovia",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LY",
    "name": "Libya",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Tripoli",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "LI",
    "name": "Liechtenstein",
    "region": "Europe & Central Asia",
    "capital": "Vaduz",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LT",
    "name": "Lithuania",
    "region": "Europe & Central Asia",
    "capital": "Vilnius",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LU",
    "name": "Luxembourg",
    "region": "Europe & Central Asia",
    "capital": "Luxembourg",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MO",
    "name": "Macao",
    "region": "East Asia & Pacific",
    "capital": null,
    "sovereign": false,
    "families": []
  },
  {
    "code": "MG",
    "name": "Madagascar",
    "region": "Sub-Saharan Africa",
    "capital": "Antananarivo",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MW",
    "name": "Malawi",
    "region": "Sub-Saharan Africa",
    "capital": "Lilongwe",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MY",
    "name": "Malaysia",
    "region": "East Asia & Pacific",
    "capital": "Kuala Lumpur",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "MV",
    "name": "Maldives",
    "region": "South Asia",
    "capital": "Male",
    "sovereign": true,
    "families": []
  },
  {
    "code": "ML",
    "name": "Mali",
    "region": "Sub-Saharan Africa",
    "capital": "Bamako",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "MT",
    "name": "Malta",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Valletta",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MH",
    "name": "Marshall Islands",
    "region": "East Asia & Pacific",
    "capital": "Majuro",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MR",
    "name": "Mauritania",
    "region": "Sub-Saharan Africa",
    "capital": "Nouakchott",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "MU",
    "name": "Mauritius",
    "region": "Sub-Saharan Africa",
    "capital": "Port Louis",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MX",
    "name": "Mexico",
    "region": "Latin America & Caribbean",
    "capital": "Mexico City",
    "sovereign": true,
    "families": []
  },
  {
    "code": "FM",
    "name": "Micronesia",
    "region": "East Asia & Pacific",
    "capital": "Palikir",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MD",
    "name": "Moldova",
    "region": "Europe & Central Asia",
    "capital": "Chisinau",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MC",
    "name": "Monaco",
    "region": "Europe & Central Asia",
    "capital": "Monaco",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MN",
    "name": "Mongolia",
    "region": "East Asia & Pacific",
    "capital": "Ulaanbaatar",
    "sovereign": true,
    "families": []
  },
  {
    "code": "ME",
    "name": "Montenegro",
    "region": "Europe & Central Asia",
    "capital": "Podgorica",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MA",
    "name": "Morocco",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Rabat",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MZ",
    "name": "Mozambique",
    "region": "Sub-Saharan Africa",
    "capital": "Maputo",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MM",
    "name": "Myanmar",
    "region": "East Asia & Pacific",
    "capital": "Naypyidaw",
    "sovereign": true,
    "families": []
  },
  {
    "code": "NA",
    "name": "Namibia",
    "region": "Sub-Saharan Africa",
    "capital": "Windhoek",
    "sovereign": true,
    "families": []
  },
  {
    "code": "NR",
    "name": "Naoero",
    "region": "East Asia & Pacific",
    "capital": "Yaren District",
    "sovereign": true,
    "families": []
  },
  {
    "code": "NP",
    "name": "Nepal",
    "region": "South Asia",
    "capital": "Kathmandu",
    "sovereign": true,
    "families": [
      "odd-shape"
    ]
  },
  {
    "code": "NL",
    "name": "Netherlands",
    "region": "Europe & Central Asia",
    "capital": "Amsterdam",
    "sovereign": true,
    "families": []
  },
  {
    "code": "NC",
    "name": "New Caledonia",
    "region": "East Asia & Pacific",
    "capital": "Noum'ea",
    "sovereign": false,
    "families": []
  },
  {
    "code": "NZ",
    "name": "New Zealand",
    "region": "East Asia & Pacific",
    "capital": "Wellington",
    "sovereign": true,
    "families": [
      "union-canton",
      "southern-cross"
    ]
  },
  {
    "code": "NI",
    "name": "Nicaragua",
    "region": "Latin America & Caribbean",
    "capital": "Managua",
    "sovereign": true,
    "families": []
  },
  {
    "code": "NE",
    "name": "Niger",
    "region": "Sub-Saharan Africa",
    "capital": "Niamey",
    "sovereign": true,
    "families": []
  },
  {
    "code": "NG",
    "name": "Nigeria",
    "region": "Sub-Saharan Africa",
    "capital": "Abuja",
    "sovereign": true,
    "families": []
  },
  {
    "code": "KP",
    "name": "North Korea",
    "region": "East Asia & Pacific",
    "capital": "Pyongyang",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MK",
    "name": "North Macedonia",
    "region": "Europe & Central Asia",
    "capital": "Skopje",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MP",
    "name": "Northern Mariana Islands",
    "region": "East Asia & Pacific",
    "capital": "Saipan",
    "sovereign": false,
    "families": []
  },
  {
    "code": "NO",
    "name": "Norway",
    "region": "Europe & Central Asia",
    "capital": "Oslo",
    "sovereign": true,
    "families": [
      "nordic-cross"
    ]
  },
  {
    "code": "OM",
    "name": "Oman",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Muscat",
    "sovereign": true,
    "families": []
  },
  {
    "code": "PK",
    "name": "Pakistan",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Islamabad",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "PW",
    "name": "Palau",
    "region": "East Asia & Pacific",
    "capital": "Koror",
    "sovereign": true,
    "families": []
  },
  {
    "code": "PS",
    "name": "Palestine",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": null,
    "sovereign": false,
    "families": [
      "pan-arab"
    ]
  },
  {
    "code": "PA",
    "name": "Panama",
    "region": "Latin America & Caribbean",
    "capital": "Panama City",
    "sovereign": true,
    "families": []
  },
  {
    "code": "PG",
    "name": "Papua New Guinea",
    "region": "East Asia & Pacific",
    "capital": "Port Moresby",
    "sovereign": true,
    "families": [
      "southern-cross"
    ]
  },
  {
    "code": "PY",
    "name": "Paraguay",
    "region": "Latin America & Caribbean",
    "capital": "Asuncion",
    "sovereign": true,
    "families": []
  },
  {
    "code": "PE",
    "name": "Peru",
    "region": "Latin America & Caribbean",
    "capital": "Lima",
    "sovereign": true,
    "families": []
  },
  {
    "code": "PH",
    "name": "Philippines",
    "region": "East Asia & Pacific",
    "capital": "Manila",
    "sovereign": true,
    "families": []
  },
  {
    "code": "PL",
    "name": "Poland",
    "region": "Europe & Central Asia",
    "capital": "Warsaw",
    "sovereign": true,
    "families": []
  },
  {
    "code": "PT",
    "name": "Portugal",
    "region": "Europe & Central Asia",
    "capital": "Lisbon",
    "sovereign": true,
    "families": []
  },
  {
    "code": "PR",
    "name": "Puerto Rico (US)",
    "region": "Latin America & Caribbean",
    "capital": "San Juan",
    "sovereign": false,
    "families": []
  },
  {
    "code": "QA",
    "name": "Qatar",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Doha",
    "sovereign": true,
    "families": []
  },
  {
    "code": "CG",
    "name": "Republic of the Congo",
    "region": "Sub-Saharan Africa",
    "capital": "Brazzaville",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "RO",
    "name": "Romania",
    "region": "Europe & Central Asia",
    "capital": "Bucharest",
    "sovereign": true,
    "families": []
  },
  {
    "code": "RU",
    "name": "Russia",
    "region": "Europe & Central Asia",
    "capital": "Moscow",
    "sovereign": true,
    "families": []
  },
  {
    "code": "RW",
    "name": "Rwanda",
    "region": "Sub-Saharan Africa",
    "capital": "Kigali",
    "sovereign": true,
    "families": []
  },
  {
    "code": "KN",
    "name": "Saint Kitts and Nevis",
    "region": "Latin America & Caribbean",
    "capital": "Basseterre",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LC",
    "name": "Saint Lucia",
    "region": "Latin America & Caribbean",
    "capital": "Castries",
    "sovereign": true,
    "families": []
  },
  {
    "code": "MF",
    "name": "Saint Martin",
    "region": "Latin America & Caribbean",
    "capital": "Marigot",
    "sovereign": true,
    "families": []
  },
  {
    "code": "VC",
    "name": "Saint Vincent and the Grenadines",
    "region": "Latin America & Caribbean",
    "capital": "Kingstown",
    "sovereign": true,
    "families": []
  },
  {
    "code": "WS",
    "name": "Samoa",
    "region": "East Asia & Pacific",
    "capital": "Apia",
    "sovereign": true,
    "families": [
      "southern-cross"
    ]
  },
  {
    "code": "SM",
    "name": "San Marino",
    "region": "Europe & Central Asia",
    "capital": "San Marino",
    "sovereign": true,
    "families": []
  },
  {
    "code": "ST",
    "name": "Sao Tome and Principe",
    "region": "Sub-Saharan Africa",
    "capital": "Sao Tome",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "SA",
    "name": "Saudi Arabia",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Riyadh",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SN",
    "name": "Senegal",
    "region": "Sub-Saharan Africa",
    "capital": "Dakar",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "RS",
    "name": "Serbia",
    "region": "Europe & Central Asia",
    "capital": "Belgrade",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SC",
    "name": "Seychelles",
    "region": "Sub-Saharan Africa",
    "capital": "Victoria",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SL",
    "name": "Sierra Leone",
    "region": "Sub-Saharan Africa",
    "capital": "Freetown",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SG",
    "name": "Singapore",
    "region": "East Asia & Pacific",
    "capital": "Singapore",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "SX",
    "name": "Sint Maarten (Dutch part)",
    "region": "Latin America & Caribbean",
    "capital": "Philipsburg",
    "sovereign": false,
    "families": []
  },
  {
    "code": "SK",
    "name": "Slovakia",
    "region": "Europe & Central Asia",
    "capital": "Bratislava",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SI",
    "name": "Slovenia",
    "region": "Europe & Central Asia",
    "capital": "Ljubljana",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SB",
    "name": "Solomon Islands",
    "region": "East Asia & Pacific",
    "capital": "Honiara",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SO",
    "name": "Somalia",
    "region": "Sub-Saharan Africa",
    "capital": "Mogadishu",
    "sovereign": true,
    "families": []
  },
  {
    "code": "ZA",
    "name": "South Africa",
    "region": "Sub-Saharan Africa",
    "capital": "Pretoria",
    "sovereign": true,
    "families": []
  },
  {
    "code": "KR",
    "name": "South Korea",
    "region": "East Asia & Pacific",
    "capital": "Seoul",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SS",
    "name": "South Sudan",
    "region": "Sub-Saharan Africa",
    "capital": "Juba",
    "sovereign": true,
    "families": []
  },
  {
    "code": "ES",
    "name": "Spain",
    "region": "Europe & Central Asia",
    "capital": "Madrid",
    "sovereign": true,
    "families": []
  },
  {
    "code": "LK",
    "name": "Sri Lanka",
    "region": "South Asia",
    "capital": "Colombo",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SD",
    "name": "Sudan",
    "region": "Sub-Saharan Africa",
    "capital": "Khartoum",
    "sovereign": true,
    "families": [
      "pan-arab"
    ]
  },
  {
    "code": "SR",
    "name": "Suriname",
    "region": "Latin America & Caribbean",
    "capital": "Paramaribo",
    "sovereign": true,
    "families": []
  },
  {
    "code": "SE",
    "name": "Sweden",
    "region": "Europe & Central Asia",
    "capital": "Stockholm",
    "sovereign": true,
    "families": [
      "nordic-cross"
    ]
  },
  {
    "code": "CH",
    "name": "Switzerland",
    "region": "Europe & Central Asia",
    "capital": "Bern",
    "sovereign": true,
    "families": [
      "odd-shape"
    ]
  },
  {
    "code": "SY",
    "name": "Syria",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Damascus",
    "sovereign": true,
    "families": [
      "pan-arab"
    ]
  },
  {
    "code": "TJ",
    "name": "Tajikistan",
    "region": "Europe & Central Asia",
    "capital": "Dushanbe",
    "sovereign": true,
    "families": []
  },
  {
    "code": "TZ",
    "name": "Tanzania",
    "region": "Sub-Saharan Africa",
    "capital": "Dodoma",
    "sovereign": true,
    "families": []
  },
  {
    "code": "TH",
    "name": "Thailand",
    "region": "East Asia & Pacific",
    "capital": "Bangkok",
    "sovereign": true,
    "families": []
  },
  {
    "code": "BS",
    "name": "The Bahamas",
    "region": "Latin America & Caribbean",
    "capital": "Nassau",
    "sovereign": true,
    "families": []
  },
  {
    "code": "GM",
    "name": "The Gambia",
    "region": "Sub-Saharan Africa",
    "capital": "Banjul",
    "sovereign": true,
    "families": []
  },
  {
    "code": "TL",
    "name": "Timor-Leste",
    "region": "East Asia & Pacific",
    "capital": "Dili",
    "sovereign": true,
    "families": []
  },
  {
    "code": "TG",
    "name": "Togo",
    "region": "Sub-Saharan Africa",
    "capital": "Lome",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  },
  {
    "code": "TO",
    "name": "Tonga",
    "region": "East Asia & Pacific",
    "capital": "Nuku'alofa",
    "sovereign": true,
    "families": []
  },
  {
    "code": "TT",
    "name": "Trinidad and Tobago",
    "region": "Latin America & Caribbean",
    "capital": "Port-of-Spain",
    "sovereign": true,
    "families": []
  },
  {
    "code": "TN",
    "name": "Tunisia",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Tunis",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "TR",
    "name": "Türkiye",
    "region": "Europe & Central Asia",
    "capital": "Ankara",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "TM",
    "name": "Turkmenistan",
    "region": "Europe & Central Asia",
    "capital": "Ashgabat",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "TC",
    "name": "Turks and Caicos Islands",
    "region": "Latin America & Caribbean",
    "capital": "Grand Turk",
    "sovereign": false,
    "families": []
  },
  {
    "code": "TV",
    "name": "Tuvalu",
    "region": "East Asia & Pacific",
    "capital": "Funafuti",
    "sovereign": true,
    "families": [
      "union-canton"
    ]
  },
  {
    "code": "UG",
    "name": "Uganda",
    "region": "Sub-Saharan Africa",
    "capital": "Kampala",
    "sovereign": true,
    "families": []
  },
  {
    "code": "UA",
    "name": "Ukraine",
    "region": "Europe & Central Asia",
    "capital": "Kiev",
    "sovereign": true,
    "families": []
  },
  {
    "code": "AE",
    "name": "United Arab Emirates",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Abu Dhabi",
    "sovereign": true,
    "families": [
      "pan-arab"
    ]
  },
  {
    "code": "GB",
    "name": "United Kingdom",
    "region": "Europe & Central Asia",
    "capital": "London",
    "sovereign": true,
    "families": []
  },
  {
    "code": "US",
    "name": "United States",
    "region": "North America",
    "capital": "Washington D.C.",
    "sovereign": true,
    "families": []
  },
  {
    "code": "UY",
    "name": "Uruguay",
    "region": "Latin America & Caribbean",
    "capital": "Montevideo",
    "sovereign": true,
    "families": []
  },
  {
    "code": "UZ",
    "name": "Uzbekistan",
    "region": "Europe & Central Asia",
    "capital": "Tashkent",
    "sovereign": true,
    "families": [
      "crescent-star"
    ]
  },
  {
    "code": "VU",
    "name": "Vanuatu",
    "region": "East Asia & Pacific",
    "capital": "Port-Vila",
    "sovereign": true,
    "families": []
  },
  {
    "code": "VA",
    "name": "Vatican City",
    "region": "Europe & Central Asia",
    "capital": "Vatican City",
    "sovereign": true,
    "families": [
      "odd-shape"
    ]
  },
  {
    "code": "VE",
    "name": "Venezuela",
    "region": "Latin America & Caribbean",
    "capital": "Caracas",
    "sovereign": true,
    "families": []
  },
  {
    "code": "VN",
    "name": "Vietnam",
    "region": "East Asia & Pacific",
    "capital": "Hanoi",
    "sovereign": true,
    "families": []
  },
  {
    "code": "VI",
    "name": "Virgin Islands (U.S.)",
    "region": "Latin America & Caribbean",
    "capital": "Charlotte Amalie",
    "sovereign": false,
    "families": []
  },
  {
    "code": "YE",
    "name": "Yemen",
    "region": "Middle East, North Africa, Afghanistan & Pakistan",
    "capital": "Sana'a",
    "sovereign": true,
    "families": [
      "pan-arab"
    ]
  },
  {
    "code": "ZM",
    "name": "Zambia",
    "region": "Sub-Saharan Africa",
    "capital": "Lusaka",
    "sovereign": true,
    "families": []
  },
  {
    "code": "ZW",
    "name": "Zimbabwe",
    "region": "Sub-Saharan Africa",
    "capital": "Harare",
    "sovereign": true,
    "families": [
      "pan-african"
    ]
  }
];

/**
 * One question per sovereign flag, in a fixed order: the near-identical pairs
 * first, then a deterministic shuffle. Shape matches QuizQuestion in
 * types/database.ts so it can be handed straight to the quiz.
 */
export const FLAG_QUIZ: FlagQuizQuestion[] = [
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/td.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Tanzania",
      "Chad",
      "Mauritius",
      "Romania"
    ],
    "correctIndex": 1,
    "explanation": "Chad. Identical layout; Chad’s blue is darker. Chad has raised it at the UN. The national flag of Chad is a vertical tricolour of indigo, yellow, and red. It was adopted on 6 November 1959, almost a year after the founding of the autonomous Republic of Chad.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Chad"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ro.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Sweden",
      "Chad",
      "Romania",
      "France"
    ],
    "correctIndex": 2,
    "explanation": "Romania. Identical layout; Chad’s blue is darker. Chad has raised it at the UN. The national flag of Romania is a tricolor featuring three equal vertical bands colored blue, yellow, and red, with a width-to-length ratio of 2:3.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Romania"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/id.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Indonesia",
      "Samoa",
      "Timor-Leste",
      "Monaco"
    ],
    "correctIndex": 0,
    "explanation": "Indonesia. The same two bands. Indonesia’s flag is longer. The national flag of Indonesia is bicolor, with two horizontal bands, red (top) and white (bottom) with an overall ratio of 2:3. It was introduced and hoisted in public during the proclamation of independence on 17 August 1945 at 56 Jalan Proklamasi in Jakarta, and again when the Dutch formally transferred sovereignty on 27 December 1949.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Indonesia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mc.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Indonesia",
      "Kazakhstan",
      "Switzerland",
      "Monaco"
    ],
    "correctIndex": 3,
    "explanation": "Monaco. The same two bands. Indonesia’s flag is longer. The national flag of Monaco has two equal horizontal bands, of red (top) and white (bottom), both of which have been the heraldic colours of the House of Grimaldi since at least 1339. The present bicolour design was adopted on 4 April 1881, under Charles III.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Monaco"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ie.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Côte d’Ivoire",
      "Georgia",
      "Ireland",
      "Bulgaria"
    ],
    "correctIndex": 2,
    "explanation": "Ireland. Mirror images of each other — green is on the hoist for Ireland, the fly for Côte d’Ivoire. The national flag of Ireland, frequently referred to in Ireland as \"the tricolour\" and elsewhere as the Irish tricolour, is a vertical tricolour of green, white and orange. The proportions of the flag are 1:2.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Ireland"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ci.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Ireland",
      "The Gambia",
      "Chad",
      "Côte d’Ivoire"
    ],
    "correctIndex": 3,
    "explanation": "Côte d’Ivoire. Mirror images of each other — green is on the hoist for Ireland, the fly for Côte d’Ivoire. The national flag of Ivory Coast is a vertical tricolour of orange, white, and green, with a 2:3 width-to-length ratio. It was adopted on 3 December 1959 with the passing of law no.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Ivory_Coast"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/nl.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Netherlands",
      "Türkiye",
      "Luxembourg",
      "Belarus"
    ],
    "correctIndex": 0,
    "explanation": "Netherlands. Same three bands; Luxembourg’s blue is lighter and its flag longer. The national flag of the Netherlands is a horizontal tricolour of red, white, and blue. The current design originates as a variant of the late 16th century orange-white-blue Prinsenvlag, evolving in the early 17th century as the red-white-blue Statenvlag, the naval flag of the States-General of the Dutch Republic, making the Dutch flag the oldest tricolour flag in continuous use.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Netherlands"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/lu.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Denmark",
      "Estonia",
      "Luxembourg",
      "Netherlands"
    ],
    "correctIndex": 2,
    "explanation": "Luxembourg. Same three bands; Luxembourg’s blue is lighter and its flag longer. The national flag of Luxembourg is a tricolour flag, that consists of three horizontal stripes; watermelon red, white and light blue, and can be in 2:1 or 5:3 ratio. It was first used between 1845 and 1848 and officially adopted in 1993.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Luxembourg"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/au.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Fiji",
      "Tuvalu",
      "New Zealand",
      "Australia"
    ],
    "correctIndex": 3,
    "explanation": "Australia. Both are Union-canton flags with the Southern Cross. New Zealand has four stars, Australia six. The national flag of Australia is based on the British Blue Ensign—a blue field with the Union Jack in the upper hoist quarter—featuring a large white seven-pointed star and a representation of the Southern Cross constellation, made up of five white stars.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Australia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/nz.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "New Zealand",
      "Australia",
      "Fiji",
      "Tuvalu"
    ],
    "correctIndex": 0,
    "explanation": "New Zealand. Both are Union-canton flags with the Southern Cross. New Zealand has four stars, Australia six. The flag of New Zealand, also known as the New Zealand Ensign, is based on the British maritime Blue Ensign – a blue field with the Union Jack in the canton or upper hoist corner – augmented or defaced with four red stars centred within four white stars, representing the Southern Cross constellation.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_New_Zealand"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/si.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Slovakia",
      "Serbia",
      "Finland",
      "Slovenia"
    ],
    "correctIndex": 3,
    "explanation": "Slovenia. Three Pan-Slavic tricolors separated only by their coats of arms. The national flag of Slovenia features three equal horizontal bands of white (top), blue, and red, with the coat of arms of Slovenia located in the upper hoist side of the flag centred in the white and blue bands. The coat of arms is a shield with the image of Mount Triglav, Slovenia's highest peak, in white against a blue background at the centre; beneath it are two wavy blue lines representing the Adriatic Sea and local rivers, and above it are three six-pointed golden stars arranged in an inverted triangle which are taken from the coat of arms of the Counts of Celje, the great Slovene dynastic house of the late 14th and early 15th centuries.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Slovenia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sk.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Slovenia",
      "Serbia",
      "Netherlands",
      "Slovakia"
    ],
    "correctIndex": 3,
    "explanation": "Slovakia. Three Pan-Slavic tricolors separated only by their coats of arms. The current form of the national flag of the Slovak Republic was adopted by Slovakia's Constitution, which came into force on 3 September 1992. The flag of Slovakia, like many other flags of Slavic nations, uses the Pan-Slavic colours.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Slovakia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/rs.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Slovenia",
      "Serbia",
      "Slovakia",
      "Türkiye"
    ],
    "correctIndex": 1,
    "explanation": "Serbia. Three Pan-Slavic tricolors separated only by their coats of arms. The flag of Serbia, also known as the Tricolour, is a tricolour consisting of three equal horizontal bands, red on the top, blue in the middle, and white on the bottom, with the lesser coat of arms towards the hoist of centre.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Serbia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/hu.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Andorra",
      "Bosnia and Herzegovina",
      "Hungary",
      "Cyprus"
    ],
    "correctIndex": 2,
    "explanation": "Hungary. All four are in Europe & Central Asia. The national flag of Hungary, also known as the Red-White-Green, is an equal horizontal tricolour of red, white and green. In this exact form, it has been the official flag of Hungary since 23 May 1957.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Hungary"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gd.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "The Bahamas",
      "Uruguay",
      "Grenada",
      "Antigua and Barbuda"
    ],
    "correctIndex": 2,
    "explanation": "Grenada. All four are in Latin America & Caribbean. The flag of Grenada consists of two yellow triangles at the top and bottom and two green triangles at the hoist and fly. These are surrounded by a red border charged with six five-pointed yellow stars – three at the top centre and three at the bottom centre – along with an additional star on a red disc at the centre and a nutmeg at the hoist triangle.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Grenada"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sv.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "El Salvador",
      "Grenada",
      "Belize",
      "Brazil"
    ],
    "correctIndex": 0,
    "explanation": "El Salvador. All four are in Latin America & Caribbean. The national flag of El Salvador, officially named the Bandera Magna, is a horizontal triband of blue-white-blue, with the national coat of arms centered and entirely contained within the central white stripe. The current flag was adopted by the Legislative Assembly of El Salvador on 24 March 1916, and its design is established by the Law of National Symbols approved in 1972.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_El_Salvador"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cd.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Uganda",
      "DR Congo",
      "Guinea",
      "Chad"
    ],
    "correctIndex": 1,
    "explanation": "DR Congo. All four are in Sub-Saharan Africa. The national flag of the Democratic Republic of the Congo is a sky blue flag, adorned with a yellow star in the upper left canton and cut diagonally by a red stripe with a yellow fimbriation. It was adopted on 18 February 2006.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Democratic_Republic_of_the_Congo"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/kn.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Panama",
      "Brazil",
      "Venezuela",
      "Saint Kitts and Nevis"
    ],
    "correctIndex": 3,
    "explanation": "Saint Kitts and Nevis. All four are in Latin America & Caribbean. The national flag of Saint Kitts and Nevis consists of a yellow-edged black band containing two white stars that divides diagonally from the lower hoist-side corner, with a green upper triangle and red lower triangle. Adopted in 1983 to replace the flag of Saint Christopher-Nevis-Anguilla, it has been the flag of the Federation of Saint Kitts and Nevis since the country gained independence that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Saint_Kitts_and_Nevis"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/tt.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Peru",
      "Honduras",
      "El Salvador",
      "Trinidad and Tobago"
    ],
    "correctIndex": 3,
    "explanation": "Trinidad and Tobago. All four are in Latin America & Caribbean. The flag of Trinidad and Tobago was adopted upon independence from the United Kingdom on 31 August 1962. Designed by Carlisle Chang (1921–2001), the flag of Trinidad and Tobago was chosen by the independence committee of 1962.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Trinidad_and_Tobago"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/my.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Pakistan",
      "Tunisia",
      "Malaysia",
      "Algeria"
    ],
    "correctIndex": 2,
    "explanation": "Malaysia. All four are Crescent and star flags. The national flag of Malaysia, also known as the Stripes of Glory, is composed of a field of 14 alternating red and white stripes along the fly, and a blue canton bearing a crescent and a 14-point star known as the Bintang Persekutuan.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Malaysia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/se.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Iceland",
      "Sweden",
      "Denmark",
      "Finland"
    ],
    "correctIndex": 1,
    "explanation": "Sweden. All four are The Nordic cross flags. The national flag of Sweden consists of a yellow or gold Nordic cross on a field of light blue. The Nordic cross design traditionally represents Christianity.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Sweden"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/zm.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Zambia",
      "Sierra Leone",
      "Eswatini",
      "Nigeria"
    ],
    "correctIndex": 0,
    "explanation": "Zambia. All four are in Sub-Saharan Africa. The national flag of Zambia was adopted upon independence on 24 October 1964, by the first Republican president, Dr. Kenneth David Kaunda.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Zambia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/no.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Finland",
      "Norway",
      "Iceland",
      "Sweden"
    ],
    "correctIndex": 1,
    "explanation": "Norway. All four are The Nordic cross flags. The national flag of Norway is red with a navy blue Scandinavian cross bordered in white that extends to the edges of the flag; the vertical part of the cross is shifted to the hoist side in the style of the Dannebrog, the flag of Denmark.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Norway"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bh.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Pakistan",
      "Bahrain",
      "Israel",
      "United Arab Emirates"
    ],
    "correctIndex": 1,
    "explanation": "Bahrain. All four are in Middle East, North Africa, Afghanistan & Pakistan. The flag of Bahrain consists of a white band on the left, separated from a red area on the right by five triangles that serve as a serrated line. The five white triangles symbolize the five pillars of Islam, the red on the flag represents the blood of the martyrs and the battles of Bahrain, and the white represents peace.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Bahrain"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mt.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Yemen",
      "Pakistan",
      "Kuwait",
      "Malta"
    ],
    "correctIndex": 3,
    "explanation": "Malta. All four are in Middle East, North Africa, Afghanistan & Pakistan. The flag of Malta is a bicolour, with white in the hoist and red in the fly. A representation of the George Cross, awarded to Malta by George VI in 1942, is carried, edged with red, in the canton of the white stripe.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Malta"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/dm.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Jamaica",
      "Dominica",
      "Nicaragua",
      "Antigua and Barbuda"
    ],
    "correctIndex": 1,
    "explanation": "Dominica. All four are in Latin America & Caribbean. The national flag of Dominica was adopted on 3 November 1978, with some small changes having been made in 1981, 1988, and 1990. The original flag was designed by playwright Alwin Bully in early 1978 as the country prepared for independence.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Dominica"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/lc.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Saint Lucia",
      "Dominica",
      "Suriname",
      "Saint Vincent and the Grenadines"
    ],
    "correctIndex": 0,
    "explanation": "Saint Lucia. All four are in Latin America & Caribbean. The national flag of Saint Lucia consists of a cerulean blue field charged with a golden triangle in front of a white-edged black isosceles triangle. Adopted in 1967 to replace the British Blue Ensign defaced with the arms of the colony, it has been the flag of Saint Lucia since the country became an associated state of the United Kingdom that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Saint_Lucia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/to.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Marshall Islands",
      "Laos",
      "Tonga",
      "Naoero"
    ],
    "correctIndex": 2,
    "explanation": "Tonga. All four are in East Asia & Pacific. The national flag of Tonga consists of a red field with a white canton charged with a red couped cross. Adopted in 1875 after being officially enshrined into the nation's constitution, it has been the flag of the Kingdom of Tonga since that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Tonga"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gm.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Namibia",
      "The Gambia",
      "Zambia",
      "Mauritius"
    ],
    "correctIndex": 1,
    "explanation": "The Gambia. All four are in Sub-Saharan Africa. The national flag of The Gambia consists of three horizontal red, blue and green bands separated by two thin white stripes. Adopted in 1965 to replace the British Blue Ensign defaced with the arms of the Gambia Colony and Protectorate, it has been the flag of the Republic of the Gambia since the country gained independence that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Gambia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/by.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Belarus",
      "Moldova",
      "Italy",
      "Kyrgyzstan"
    ],
    "correctIndex": 0,
    "explanation": "Belarus. All four are in Europe & Central Asia. The national flag of Belarus is an unequal red-green bicolour with a red-on-white ornament pattern placed at the hoist (staff) end. The current design was introduced in 2012 by the State Committee for Standardisation of the Republic of Belarus, and is adapted from a design approved in a May 1995 referendum.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Belarus"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/az.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Uzbekistan",
      "Mauritania",
      "Azerbaijan",
      "Türkiye"
    ],
    "correctIndex": 2,
    "explanation": "Azerbaijan. All four are Crescent and star flags. The national flag of Azerbaijan, often referred to as the Tricolor flag, is a horizontal tricolor that features three equally sized bars of bright blue, red, and green; a white crescent; and a centred eight-pointed star. The flag has become the predominant and most recognizable symbol of Azerbaijan.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Azerbaijan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/tn.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Tunisia",
      "Libya",
      "Uzbekistan",
      "Malaysia"
    ],
    "correctIndex": 0,
    "explanation": "Tunisia. All four are Crescent and star flags. The national flag of Tunisia is a rectangular panel of red color with an aspect ratio of 2:3. In the center of the cloth in a white disk is placed a red crescent, surrounding a red five-pointed star on three sides.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Tunisia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gn.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Guinea",
      "Zimbabwe",
      "Togo",
      "Republic of the Congo"
    ],
    "correctIndex": 0,
    "explanation": "Guinea. All four use the Pan-African colors. The national flag of Guinea is a triband of red, yellow, and green. It was adopted on 10 November 1958, with the publication of the country's first Constitution.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Guinea"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/km.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Comoros",
      "Uzbekistan",
      "Türkiye",
      "Pakistan"
    ],
    "correctIndex": 0,
    "explanation": "Comoros. All four are Crescent and star flags. The national flag of the Union of the Comoros was designed in 2001 and officially adopted on 23 December of that year. It continues to display the crescent and four stars, which is a motif that has been in use in various forms since 1975 during the independence movement.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Comoros"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/lk.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Maldives",
      "Bhutan",
      "Sri Lanka",
      "Bangladesh"
    ],
    "correctIndex": 2,
    "explanation": "Sri Lanka. All four are in South Asia. The national flag of Sri Lanka, also called the Singha Flag or Lion Flag, consists of a golden lion holding a kastane sword in its right fore-paw in a maroon background with four gold bo leaves, one in each corner. This is bordered by gold, and to its left are two vertical stripes of equal size in teal and orange, with the orange stripe closest to the lion.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Sri_Lanka"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ch.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Vatican City",
      "Switzerland",
      "Andorra",
      "Nepal"
    ],
    "correctIndex": 1,
    "explanation": "Switzerland. All four are Not a rectangle flags. The national flag of Switzerland displays a white Greek cross in the centre of a red field. The white cross is known as the Swiss cross or the federal cross.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Switzerland"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ve.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Peru",
      "Venezuela",
      "The Bahamas",
      "Mexico"
    ],
    "correctIndex": 1,
    "explanation": "Venezuela. All four are in Latin America & Caribbean. The current national flag of Venezuela was introduced in 2006. The basic design includes a horizontal tricolour of yellow, blue, and red, dating to the original flag introduced in 1811, in the Venezuelan War of Independence.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Venezuela"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Suriname",
      "Bolivia",
      "Nicaragua",
      "Peru"
    ],
    "correctIndex": 0,
    "explanation": "Suriname. All four are in Latin America & Caribbean. The national flag of Suriname was legally adopted on 25 November 1975, upon the independence of Suriname from the Netherlands.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Suriname"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/dj.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Jordan",
      "Djibouti",
      "Morocco",
      "Afghanistan"
    ],
    "correctIndex": 1,
    "explanation": "Djibouti. All four are in Middle East, North Africa, Afghanistan & Pakistan. The national flag of Djibouti is a horizontal flag bicolour with equal bands of light blue and light green, with a white, equilateral triangle at the hoist. In the centre of the triangle is a red star.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Djibouti"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ml.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Cameroon",
      "Guinea-Bissau",
      "Mali",
      "Burkina Faso"
    ],
    "correctIndex": 2,
    "explanation": "Mali. All four use the Pan-African colors. The national flag of Mali is a vertical tricolour of green, gold, and red, the pan-African colours.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Mali"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/vn.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Vietnam",
      "Cambodia",
      "Japan",
      "Philippines"
    ],
    "correctIndex": 0,
    "explanation": "Vietnam. All four are in East Asia & Pacific. The national flag of the Socialist Republic of Vietnam, previously presenting the Democratic Republic of Vietnam, was originally designed in 1940 and first used during a failed communist uprising against the French colonialists in Cochinchina that year. The red background symbolizes revolution and bloodshed.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Vietnam"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mm.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Thailand",
      "Myanmar",
      "Singapore",
      "Malaysia"
    ],
    "correctIndex": 1,
    "explanation": "Myanmar. All four are in East Asia & Pacific. The State Flag of the Republic of the Union of Myanmar is a horizontal rectangular tricolor flag of yellow, green, and red with a large white five-pointed star in the center. The current flag was adopted on 21 October 2010.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Myanmar"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mz.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Mozambique",
      "Eritrea",
      "South Africa",
      "Chad"
    ],
    "correctIndex": 0,
    "explanation": "Mozambique. All four are in Sub-Saharan Africa. The national flag of Mozambique is a horizontal tricolour of green, black, and golden-yellow with white fimbriations and a red isosceles triangle at the hoist. The triangle is charged with a five-pointed gold star in its centre, above which there is a bayonet-equipped AK-47 crossed by a hoe, superimposed on an open book.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Mozambique"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Tunisia",
      "Mauritania",
      "Türkiye",
      "Pakistan"
    ],
    "correctIndex": 1,
    "explanation": "Mauritania. All four are Crescent and star flags. The national flag of Mauritania is a green field bordered above and below by a horizontal red band and charged in the centre with an upward-pointing golden star and crescent. It is a derivative of the country's first flag, which omitted the red bands.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Mauritania"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cv.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Guinea",
      "Zimbabwe",
      "South Africa",
      "Cabo Verde"
    ],
    "correctIndex": 3,
    "explanation": "Cabo Verde. All four are in Sub-Saharan Africa. The national flag of Cape Verde consists of five horizontal bands of blue, white, red, white, and blue, in a 6:1:1:1:3 ratio. A circle of ten yellow five-pointed stars – representing the ten islands that make up the country – is charged on the hoist (left) side of the flag, centred on the red band.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Cape_Verde"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cu.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Dominican Republic",
      "Antigua and Barbuda",
      "Cuba",
      "Ecuador"
    ],
    "correctIndex": 2,
    "explanation": "Cuba. All four are in Latin America & Caribbean. The national flag of Cuba, also known as the Flag of the Lone Star, consists of five alternating stripes and a cherry red chevron at the hoist, within which is a white five-pointed star. It was designed in 1849 and officially adopted May 20, 1902.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Cuba"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/nr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Indonesia",
      "Mongolia",
      "Palau",
      "Naoero"
    ],
    "correctIndex": 3,
    "explanation": "Naoero. All four are in East Asia & Pacific. Following the independence of Nauru, the flag of Nauru was raised for the first time. The flag, chosen in a local design competition, was adopted on independence day, 31 January 1968.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Nauru"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Spain",
      "Georgia",
      "Vatican City",
      "Greece"
    ],
    "correctIndex": 3,
    "explanation": "Greece. All four are in Europe & Central Asia. The national flag of Greece, popularly referred to as the Blue-and-White or the Cyan-and-White, is officially recognised by Greece as one of its national symbols and has 9 horizontal stripes of alternating blue and white. There is a blue canton in the upper hoist-side corner bearing a white cross; the cross symbolises Christianity.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Greece"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/fj.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Fiji",
      "Tuvalu",
      "New Zealand",
      "Australia"
    ],
    "correctIndex": 0,
    "explanation": "Fiji. All four are The Union Jack in the corner flags. The national flag of Fiji was adopted on 10 October 1970. The state arms have been slightly modified but the flag has remained the same as during Fiji's colonial period.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Fiji"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/pt.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "France",
      "Albania",
      "Andorra",
      "Portugal"
    ],
    "correctIndex": 3,
    "explanation": "Portugal. All four are in Europe & Central Asia. The national flag of the Portuguese Republic, often referred to as the Portuguese flag, consists of a rectangular bicolour with a field divided into green on the hoist, and red on the fly. The version without laurels of the country’s national coat of arms stands in the middle of the Portuguese armillary sphere and shield, centered over the colour boundary at equal distance.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Portugal"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/tl.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Micronesia",
      "Thailand",
      "Naoero",
      "Timor-Leste"
    ],
    "correctIndex": 3,
    "explanation": "Timor-Leste. All four are in East Asia & Pacific. The national flag of Timor-Leste consists of a red field with the black isosceles triangle based on the hoist-side bearing a white five-pointed star in the center superimposed on the larger yellow triangle, also based on the hoist-side, that extends to the center of the flag.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Timor-Leste"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mw.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Central African Republic",
      "Benin",
      "Malawi",
      "Nigeria"
    ],
    "correctIndex": 2,
    "explanation": "Malawi. All four are in Sub-Saharan Africa. The national flag of Malawi was officially adopted on 6 July 1964 when the colony of Nyasaland became independent from British rule and renamed itself Malawi.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Malawi"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cg.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Ghana",
      "Mali",
      "Sao Tome and Principe",
      "Republic of the Congo"
    ],
    "correctIndex": 3,
    "explanation": "Republic of the Congo. All four use the Pan-African colors. The national flag of the Republic of the Congo consists of a yellow diagonal band divided diagonally from the lower hoist-side corner, with a green upper triangle and red lower triangle. Adopted in 1959 to replace the French Tricolour, it was the flag of the Republic of the Congo until 1970, when the People's Republic of the Congo was established.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Republic_of_the_Congo"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/st.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Republic of the Congo",
      "Mali",
      "Sao Tome and Principe",
      "Cameroon"
    ],
    "correctIndex": 2,
    "explanation": "Sao Tome and Principe. All four use the Pan-African colors. The national flag of São Tomé and Príncipe is a horizontal triband of green, yellow, and green, with a red isosceles triangle at the hoist and two five-pointed black stars on the yellow band. The flag's aspect ratio is 1:2 and the ratio of the bands are 2:3:2.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_S%C3%A3o_Tom%C3%A9_and_Pr%C3%ADncipe"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mg.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Liberia",
      "Uganda",
      "Equatorial Guinea",
      "Madagascar"
    ],
    "correctIndex": 3,
    "explanation": "Madagascar. All four are in Sub-Saharan Africa. The national flag of Madagascar is a tricolour featuring two equal horizontal bands of red and green with a vertical white band of the same size on the hoist side. It was designed by Andrianome Ranaivosoa, an agent of the Malagasy National Geographic Institute.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Madagascar"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/kz.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Slovenia",
      "Spain",
      "North Macedonia",
      "Kazakhstan"
    ],
    "correctIndex": 3,
    "explanation": "Kazakhstan. All four are in Europe & Central Asia. The State Flag of the Republic of Kazakhstan is a turquoise banner consisting of a 32-ray gold sun above a soaring golden steppe eagle, with the hoist side displaying a national ornamental pattern \"qoşqar-müiız\". It was adopted on 4 June 1992, designed by Shaken Niyazbekov, and replacing the Soviet-era flag.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Kazakhstan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/iq.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Kuwait",
      "Iraq",
      "United Arab Emirates",
      "Jordan"
    ],
    "correctIndex": 1,
    "explanation": "Iraq. All four use the Pan-Arab colors. Since the 1958 Iraqi coup d'état, the various republican governments of Iraq have used a number of different flags, all featuring the pan-Arab colors of green, black, white, and red. The current official and internationally recognized flag of Iraq was adopted in 2008 as a temporary compromise, and consists of the three equal horizontal red, white, and black stripes of the Arab Liberation Flag, that was first used by Gamal Abdel Nasser during the Egyptian Revolution, with the takbīr written in green in the Kufic script that was originally added by Saddam Hussein following the Gulf War.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Iraq"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/uy.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Uruguay",
      "Grenada",
      "Barbados",
      "Panama"
    ],
    "correctIndex": 0,
    "explanation": "Uruguay. All four are in Latin America & Caribbean. The national flag of Uruguay, officially known as the National Pavilion, is the most important of the three official flags of Uruguay along with the Artigas flag and the flag of the Treinta y Tres. It has a field of nine equal horizontal stripes alternating white and blue.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Uruguay"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sd.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Egypt",
      "Jordan",
      "Yemen",
      "Sudan"
    ],
    "correctIndex": 3,
    "explanation": "Sudan. All four use the Pan-Arab colors. The flag of Sudan used since 20 May 1970 consists of a horizontal red-white-black tricolour with a green triangle at the hoist. The flag is based on the Arab Liberation Flag of the Egyptian Revolution of 1952.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Sudan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sz.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Madagascar",
      "Ethiopia",
      "Eswatini",
      "Liberia"
    ],
    "correctIndex": 2,
    "explanation": "Eswatini. All four are in Sub-Saharan Africa. The flag of Eswatini was adopted on 6 October 1968 after Eswatini gained its independence from the United Kingdom one month before. The design by King Sobhuza II features a black and white shield called the Nguni shield, with a staff and two spears, on a field of blue, yellow, and red horizontal bands.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Eswatini"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sm.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Bulgaria",
      "San Marino",
      "Austria",
      "France"
    ],
    "correctIndex": 1,
    "explanation": "San Marino. All four are in Europe & Central Asia. The national flag of San Marino is formed by two equal horizontal bands of white (top) and light blue with the national coat of arms superimposed in the center; the coat of arms has a shield with a closed crown on top, flanked by an oak and laurel wreath, with a scroll below bearing the word LIBERTAS (Freedom). The two colours of the flag represent peace (white) and liberty.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_San_Marino"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/za.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Malawi",
      "Guinea-Bissau",
      "South Africa",
      "Côte d’Ivoire"
    ],
    "correctIndex": 2,
    "explanation": "South Africa. All four are in Sub-Saharan Africa. The national flag of South Africa was designed in March 1994 and adopted on 27 April 1994, during South Africa's 1994 general election, to replace the previous flag used from 1928–1994.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_South_Africa"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/pl.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Poland",
      "Montenegro",
      "Tajikistan",
      "Monaco"
    ],
    "correctIndex": 0,
    "explanation": "Poland. All four are in Europe & Central Asia. The national flag of Poland consists of two horizontal stripes of equal width, the upper one white and the lower one red. The two colours are defined in the Polish constitution as the national colours.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Poland"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/kr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "South Korea",
      "Japan",
      "Tuvalu",
      "Vanuatu"
    ],
    "correctIndex": 0,
    "explanation": "South Korea. All four are in East Asia & Pacific. The national flag of the Republic of Korea, also known as the Taegeukgi, consists of three components: a white rectangular background, a red and blue taegeuk in its center, accompanied by four black trigrams, one in each corner. The predecessors to the current Taegeukgi were used as the national flag of Korea by the Joseon dynasty, the Korean Empire, as well as the Korean government-in-exile during Japanese rule.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_South_Korea"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ye.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Egypt",
      "Iraq",
      "United Arab Emirates",
      "Yemen"
    ],
    "correctIndex": 3,
    "explanation": "Yemen. All four use the Pan-Arab colors. The national flag of Yemen is the official flag of the Republic of Yemen. It was adopted on 22 May 1990, the day of the unification of Yemen.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Yemen"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/th.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Thailand",
      "Vanuatu",
      "Solomon Islands",
      "Micronesia"
    ],
    "correctIndex": 0,
    "explanation": "Thailand. All four are in East Asia & Pacific. The flag of Thailand consists of five horizontal stripes of red, white, blue, white and red, with the central blue stripe being twice as wide as each of the other four. The design was adopted on 28 September 1917, according to the royal decree issued by Rama VI.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Thailand"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gt.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Guatemala",
      "Jamaica",
      "Saint Vincent and the Grenadines",
      "Saint Martin"
    ],
    "correctIndex": 0,
    "explanation": "Guatemala. All four are in Latin America & Caribbean. The flag of Guatemala, often referred to as the National Pavilion or the Blue-and-White, features two colors: sky blue and white. According to decree, the two sky blue stripes represents strength, justice, truth and loyalty.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Guatemala"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mf.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Honduras",
      "Guyana",
      "Suriname",
      "Saint Martin"
    ],
    "correctIndex": 3,
    "explanation": "Saint Martin. All four are in Latin America & Caribbean. Flag of Saint Martin may refer to:Flag of Sint Maarten, a constituent country of the Netherlands in the Caribbean Flag of the Collectivity of Saint Martin, an overseas collectivity of France in the Caribbean",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Saint_Martin"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gw.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Guinea-Bissau",
      "Ghana",
      "Sao Tome and Principe",
      "Mali"
    ],
    "correctIndex": 0,
    "explanation": "Guinea-Bissau. All four use the Pan-African colors. The national flag of Guinea-Bissau was adopted on the day Guinea-Bissau proclaimed its independence from Portugal on 24 September 1973. It is almost identical to the flag of the African Party for the Independence of Guinea and Cape Verde, the country's dominant party and previously sole ruling party.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Guinea-Bissau"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ru.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Russia",
      "Slovenia",
      "Georgia",
      "Czechia"
    ],
    "correctIndex": 0,
    "explanation": "Russia. All four are in Europe & Central Asia. The national flag of Russia is a tricolour of three equal horizontal bands: white on the top, blue in the middle, and red on the bottom.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Russia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mk.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "North Macedonia",
      "Serbia",
      "Luxembourg",
      "Czechia"
    ],
    "correctIndex": 0,
    "explanation": "North Macedonia. All four are in Europe & Central Asia. The national flag of North Macedonia depicts a stylized yellow sun on a red field, with eight broadening rays extending from the center to the edge of the field. It was designed by Miroslav Grčev and was adopted on 5 October 1995.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_North_Macedonia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/vu.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Vanuatu",
      "New Zealand",
      "Samoa",
      "Laos"
    ],
    "correctIndex": 0,
    "explanation": "Vanuatu. All four are in East Asia & Pacific. The national flag of Vanuatu was adopted on 18 February 1980.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Vanuatu"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/tz.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Tanzania",
      "Guinea",
      "Niger",
      "Zimbabwe"
    ],
    "correctIndex": 0,
    "explanation": "Tanzania. All four are in Sub-Saharan Africa. The national flag of Tanzania consists of a gold-edged black bend, divided diagonally from the lower hoist-side corner, with a green upper triangle and light blue lower triangle. Adopted in 1964 to replace the individual flags of Tanganyika and Zanzibar, it has been the flag of the United Republic of Tanzania since the two states merged that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Tanzania"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/md.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Armenia",
      "Tajikistan",
      "Portugal",
      "Moldova"
    ],
    "correctIndex": 3,
    "explanation": "Moldova. All four are in Europe & Central Asia. The national flag of the Republic of Moldova is a vertical triband of blue, yellow, and red, charged with the coat of arms of Moldova on the centre bar. The reverse is mirrored.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Moldova"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sg.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Malaysia",
      "Singapore",
      "Turkmenistan",
      "Libya"
    ],
    "correctIndex": 1,
    "explanation": "Singapore. All four are Crescent and star flags. The flag of Singapore was adopted in 1959, the year Singapore became self-governing within the British Empire. Designed by a government committee led by deputy prime minister Toh Chin Chye, it remained as the national flag upon the country's independence from Malaysia on 9 August 1965.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Singapore"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ae.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Kuwait",
      "Egypt",
      "Iraq",
      "United Arab Emirates"
    ],
    "correctIndex": 3,
    "explanation": "United Arab Emirates. All four use the Pan-Arab colors. The national flag of the United Arab Emirates contains the pan-Arab colors red, green, white, and black. It was designed in 1971 by Abdullah Mohammed Al Maainah, who was 19 years old at that time, and was adopted on 2 December 1971 after winning a nationwide flag design contest.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_United_Arab_Emirates"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/vc.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Saint Vincent and the Grenadines",
      "Jamaica",
      "Peru",
      "Costa Rica"
    ],
    "correctIndex": 0,
    "explanation": "Saint Vincent and the Grenadines. All four are in Latin America & Caribbean. The flag of Saint Vincent and the Grenadines is a Canadian pale triband consisting of blue, gold, and green bands charged with three green diamonds at the middle. Adopted in 1985 to replace a similar design used from the time of independence, it has been the flag of Saint Vincent since that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Saint_Vincent_and_the_Grenadines"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gq.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Botswana",
      "Namibia",
      "Equatorial Guinea",
      "Benin"
    ],
    "correctIndex": 2,
    "explanation": "Equatorial Guinea. All four are in Sub-Saharan Africa. The national flag of Equatorial Guinea is a horizontal tricolour of green, white, and red with a blue isosceles triangle based at the hoist and the coat of arms of Equatorial Guinea centered on the white band. The flag without the coat of arms was raised upon the country's independence from Spain on 12 October 1968.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Equatorial_Guinea"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ni.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Saint Lucia",
      "Nicaragua",
      "Argentina",
      "Trinidad and Tobago"
    ],
    "correctIndex": 1,
    "explanation": "Nicaragua. All four are in Latin America & Caribbean. The flag of Nicaragua was first adopted on September 11th, 1908, but not made official until August 27, 1971. It is based on, and inspired by, the flag of the Federal Republic of Central America, with a blue and white triband and a coat of arms as the charge in the centre.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Nicaragua"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/er.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Botswana",
      "Sudan",
      "Madagascar",
      "Eritrea"
    ],
    "correctIndex": 3,
    "explanation": "Eritrea. All four are in Sub-Saharan Africa. The flag of Eritrea is the national flag of the State of Eritrea. It was adopted on 5 December 1995.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Eritrea"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/va.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Nepal",
      "Iceland",
      "Switzerland",
      "Vatican City"
    ],
    "correctIndex": 3,
    "explanation": "Vatican City. All four are Not a rectangle flags. The flag of Vatican City, also referred to as the flag of the Holy See, consists of vertical bicolour of yellow and white, with the white half charged with the emblem of the Holy See. It was adopted in 1929, the year Pope Pius XI signed the Lateran Treaty with Italy, creating the new independent state of Vatican City.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Vatican_City"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/am.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Denmark",
      "Albania",
      "Armenia",
      "Finland"
    ],
    "correctIndex": 2,
    "explanation": "Armenia. All four are in Europe & Central Asia. The national flag of Armenia, sometimes referred to as the Armenian tricolor, consists of three horizontal bands of equal width, red on the top, blue in the middle, and orange on the bottom. The Armenian Supreme Soviet (parliament) adopted the current flag on 24 August 1990, which was originally used during the First Republic of Armenia (1918–20).",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Armenia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/rw.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Rwanda",
      "Mozambique",
      "Sierra Leone",
      "Madagascar"
    ],
    "correctIndex": 0,
    "explanation": "Rwanda. All four are in Sub-Saharan Africa. The national flag of Rwanda is a horizontal tricolour consisting of a light blue top half, two equal bands of yellow and green in the bottom half, and a golden sun in the upper fly-side corner. It was adopted on 31 December 2001.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Rwanda"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/pg.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "New Zealand",
      "Samoa",
      "Papua New Guinea",
      "Brazil"
    ],
    "correctIndex": 2,
    "explanation": "Papua New Guinea. All four are The Southern Cross flags. The flag of Papua New Guinea was adopted on 1 July 1971. In the hoist, it depicts the Southern Cross; in the fly, a Raggiana bird-of-paradise is silhouetted.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Papua_New_Guinea"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mx.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Costa Rica",
      "Mexico",
      "Saint Lucia",
      "Haiti"
    ],
    "correctIndex": 1,
    "explanation": "Mexico. All four are in Latin America & Caribbean. The national flag of Mexico is a vertical tricolor of green, white, and red with the national coat of arms charged in the center of the white stripe. While the meaning of the colors has changed over time, these three colors were adopted by Mexico following independence from Spain during the country's War of Independence, and subsequent First Mexican Empire.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Mexico"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sy.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Jordan",
      "Syria",
      "United Arab Emirates",
      "Sudan"
    ],
    "correctIndex": 1,
    "explanation": "Syria. All four use the Pan-Arab colors. The national flag of Syria, commonly known as the Syrian flag or the flag of the Syrian Arab Republic, is a rectangular tricolour with three stars. It consists of three equal horizontal stripes of green, white, and black from top to bottom, with three red five-pointed stars centered in the white stripe.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Syria"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/fi.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Denmark",
      "Finland",
      "Norway",
      "Sweden"
    ],
    "correctIndex": 1,
    "explanation": "Finland. All four are The Nordic cross flags. The national flag of Finland, also known in Finnish as the siniristilippu, dates from the beginning of the 20th century. The flag was adopted after independence from the Russian Empire, but its design has roots in the 19th century.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Finland"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/il.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Yemen",
      "Egypt",
      "Israel",
      "Libya"
    ],
    "correctIndex": 2,
    "explanation": "Israel. All four are in Middle East, North Africa, Afghanistan & Pakistan. The flag of Israel was officially adopted on 28 October 1948. It is a white banner with three blue (tekhelet) symbols: a pair of horizontal tallit-like stripes above and below a centred Star of David.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Israel"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ss.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "South Sudan",
      "Côte d’Ivoire",
      "Angola",
      "Zimbabwe"
    ],
    "correctIndex": 0,
    "explanation": "South Sudan. All four are in Sub-Saharan Africa. The flag of South Sudan was adopted following the signing of the Comprehensive Peace Agreement that ended the Second Sudanese Civil War. A different version of the flag was previously used as the flag of the Sudan People's Liberation Movement.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_South_Sudan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ga.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Eritrea",
      "Gabon",
      "Sao Tome and Principe",
      "Kenya"
    ],
    "correctIndex": 1,
    "explanation": "Gabon. All four are in Sub-Saharan Africa. The flag of Gabon is a tricolour consisting of three horizontal green, yellow, and blue bands. Adopted in 1960 to replace the previous colonial flag containing the French Tricolour at the canton, it has been the flag of the Gabonese Republic since the country gained independence that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Gabon"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bz.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "The Bahamas",
      "Belize",
      "Haiti",
      "Dominica"
    ],
    "correctIndex": 1,
    "explanation": "Belize. All four are in Latin America & Caribbean. The flag of Belize was adopted on 21 September 1981, the day Belize became independent. It consists of the coat of arms of Belize on a blue field with red stripes at the top and bottom.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Belize"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bw.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Nigeria",
      "Lesotho",
      "Botswana",
      "Sierra Leone"
    ],
    "correctIndex": 2,
    "explanation": "Botswana. All four are in Sub-Saharan Africa. The national flag of Botswana consists of an azure blue background cut horizontally in the centre by a black stripe with a thin white frame. The flag's design is outlined in the Botswana Emblems Law, and Section 91 of the Botswana Penal Code criminalises insults towards the flag.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Botswana"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/pw.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "North Korea",
      "New Zealand",
      "Marshall Islands",
      "Palau"
    ],
    "correctIndex": 3,
    "explanation": "Palau. All four are in East Asia & Pacific. The Flag of Palau was adopted on 1 January 1981, when the island group separated from the United Nations Trust Territory. As with the flags of several other Pacific island groups, light blue is the color used to represent the ocean and the nation's place within it.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Palau"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ua.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Serbia",
      "Ukraine",
      "Austria",
      "Monaco"
    ],
    "correctIndex": 1,
    "explanation": "Ukraine. All four are in Europe & Central Asia. The national flag of Ukraine consists of equally sized horizontal bands of blue and yellow.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Ukraine"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/tj.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Liechtenstein",
      "Tajikistan",
      "Romania",
      "Kyrgyzstan"
    ],
    "correctIndex": 1,
    "explanation": "Tajikistan. All four are in Europe & Central Asia. The national flag of Tajikistan was adopted in November 1992, replacing the flag of the Tajik Soviet Socialist Republic of 1953. The flag of Tajikistan is an unequal horizontal tricolour of red, white, and green, defaced with a yellow crown surmounted by an arc of seven stars at the centre.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Tajikistan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/hr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Vatican City",
      "Estonia",
      "Croatia",
      "Norway"
    ],
    "correctIndex": 2,
    "explanation": "Croatia. All four are in Europe & Central Asia. The national flag of the Republic of Croatia, also known in Croatian as the Tricolor or the Red-white-blue (Crven-bijeli-plavi), is one of the state symbols of Croatia. It consists of three equal size, horizontal stripes in colors red, white and blue anchored by the coat of arms of Croatia.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Croatia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cf.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Mauritius",
      "Tanzania",
      "Central African Republic",
      "Rwanda"
    ],
    "correctIndex": 2,
    "explanation": "Central African Republic. All four are in Sub-Saharan Africa. The flag of the Central African Republic was officially adopted in 1958. It has been retained since that time with the same design, four horizontal stripes of blue, white, green and yellow, and a single vertical band of red, with a yellow five-pointed star in the upper left corner.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Central_African_Republic"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/om.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Qatar",
      "Egypt",
      "Iraq",
      "Oman"
    ],
    "correctIndex": 3,
    "explanation": "Oman. All four are in Middle East, North Africa, Afghanistan & Pakistan. The national flag of Oman consists of two horizontal stripes of upper white and lower green, separated by a red horizontal \"T\" shape in the centre that contains the national emblem of Oman.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Oman"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Saint Kitts and Nevis",
      "Cuba",
      "Barbados",
      "Costa Rica"
    ],
    "correctIndex": 3,
    "explanation": "Costa Rica. All four are in Latin America & Caribbean. The national flag of Costa Rica is based on a design created in 1848 and consists of two blue stripes, two white stripes, and a central red stripe which is twice as wide as each of the other four. The civil flag omits the coat of arms seen on the state flag, since the state variant is only permitted to be used by the government.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Costa_Rica"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/es.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Tajikistan",
      "Andorra",
      "United Kingdom",
      "Spain"
    ],
    "correctIndex": 3,
    "explanation": "Spain. All four are in Europe & Central Asia. The national flag of Spain, as it is defined in the Constitution of 1978, consists of three horizontal lines: red, yellow and red, the yellow stripe being twice the height of each red stripe. Traditionally, the middle stripe color was called by the archaic term gualda ; hence the flag's nickname la Rojigualda.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Spain"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/zw.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Cameroon",
      "Sao Tome and Principe",
      "Zimbabwe",
      "Guinea-Bissau"
    ],
    "correctIndex": 2,
    "explanation": "Zimbabwe. All four use the Pan-African colors. The national flag of Zimbabwe consists of seven even horizontal stripes of green, gold, red and black with a white triangle containing a red five-pointed star with a Zimbabwe Bird. The present design was adopted on 18 April 1980.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Zimbabwe"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/fm.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Micronesia",
      "Tonga",
      "Samoa",
      "Kiribati"
    ],
    "correctIndex": 0,
    "explanation": "Micronesia. All four are in East Asia & Pacific. The flag of the Federated States of Micronesia was adopted on 30 November 1978. The blue field represents the Pacific Ocean.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Federated_States_of_Micronesia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/be.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Slovakia",
      "Belgium",
      "Uzbekistan",
      "Ireland"
    ],
    "correctIndex": 1,
    "explanation": "Belgium. All four are in Europe & Central Asia. The national flag of the Kingdom of Belgium is a tricolour consisting of three equal vertical bands displaying the national colours: black, yellow, and red. The colours were taken from the coat of arms of the Duchy of Brabant, and the vertical design may be based on the flag of France.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Belgium"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sc.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Liberia",
      "Zambia",
      "Seychelles",
      "Malawi"
    ],
    "correctIndex": 2,
    "explanation": "Seychelles. All four are in Sub-Saharan Africa. The national flag of Seychelles was adopted on 8 January 1996. The current flag is the third used by the country since its independence from the United Kingdom on 29 June 1976.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Seychelles"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ly.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Uzbekistan",
      "Mauritania",
      "Libya",
      "Algeria"
    ],
    "correctIndex": 2,
    "explanation": "Libya. All four are Crescent and star flags. The national flag of Libya was originally introduced in 1951, following the creation of the Kingdom of Libya. It was designed by Omar Faiek Shennib and approved by King Idris Al Senussi who comprised the UN delegation representing the three regions of Cyrenaica, Fezzan, and Tripolitania at UN unification discussions.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Libya"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bt.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Bhutan",
      "Maldives",
      "Sri Lanka",
      "India"
    ],
    "correctIndex": 0,
    "explanation": "Bhutan. All four are in South Asia. The national flag of Bhutan is one of the national symbols of Bhutan. The flag features the Druk, a dragon from Bhutanese mythology.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Bhutan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/fr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "France",
      "Slovakia",
      "Croatia",
      "Austria"
    ],
    "correctIndex": 0,
    "explanation": "France. All four are in Europe & Central Asia. The national flag of France is a tricolour featuring three vertical bands coloured blue, white, and red. The design was adopted during the French Revolution and has remained the national flag since then, with only minor variations in shade and proportion.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_France"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ke.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Kenya",
      "Equatorial Guinea",
      "Republic of the Congo",
      "Mauritania"
    ],
    "correctIndex": 0,
    "explanation": "Kenya. All four are in Sub-Saharan Africa. The flag of Kenya is a tricolour of black, red, and green with two white edges imposed with a red, white and black Maasai shield and two crossed spears. The flag is mainly based on that of Kenya African National Union and was officially adopted on 12 December 1963 upon Kenya's independence.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Kenya"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/jo.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Jordan",
      "Kuwait",
      "Sudan",
      "United Arab Emirates"
    ],
    "correctIndex": 0,
    "explanation": "Jordan. All four use the Pan-Arab colors. The national flag of Jordan, officially adopted on 16 April 1928, is based on the 1916 flag of the Arab Revolt against the Ottoman Empire during World War I. The flag consists of horizontal black, white, and green bands, with a red isoceles triangle based at the hoist.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Jordan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/tg.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Togo",
      "Ghana",
      "Senegal",
      "Ethiopia"
    ],
    "correctIndex": 0,
    "explanation": "Togo. All four use the Pan-African colors. The national flag of Togo consists of five horizontal stripes, alternating between green and yellow, with a red square bearing a five-pointed white star in the canton. It is one of many African flags that use the pan-African colours of green, yellow, and red.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Togo"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/np.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Vatican City",
      "Nepal",
      "India",
      "Switzerland"
    ],
    "correctIndex": 1,
    "explanation": "Nepal. All four are Not a rectangle flags. The flag of Nepal is a concave pentagonal flag of red, white, and blue colour. It is used as both the state and civil flag of Nepal.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Nepal"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bi.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Burkina Faso",
      "Burundi",
      "Rwanda",
      "Mauritania"
    ],
    "correctIndex": 1,
    "explanation": "Burundi. All four are in Sub-Saharan Africa. The original national flag of Burundi was adopted after the Burundian independence from Belgium on 1 July 1962. It went through several revisions and now consists of a white saltire which divides the field into alternating red and green areas.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Burundi"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ag.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Paraguay",
      "Saint Martin",
      "Antigua and Barbuda",
      "Ecuador"
    ],
    "correctIndex": 2,
    "explanation": "Antigua and Barbuda. All four are in Latin America & Caribbean. The national flag of Antigua and Barbuda was adopted on 27 February 1967 to mark the achievement of self-government. A competition to design the flag was held in which more than 600 local people entered.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Antigua_and_Barbuda"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sl.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Senegal",
      "Malawi",
      "Sierra Leone",
      "Zambia"
    ],
    "correctIndex": 2,
    "explanation": "Sierra Leone. All four are in Sub-Saharan Africa. The national flag of Sierra Leone is a tricolour consisting of three horizontal green, white and blue bands. It was adopted in 1961, Sierra Leone's independence year, to replace the British Blue Ensign defaced with the arms of the Crown Colony of Sierra Leone.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Sierra_Leone"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gy.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Grenada",
      "Uruguay",
      "Saint Martin",
      "Guyana"
    ],
    "correctIndex": 3,
    "explanation": "Guyana. All four are in Latin America & Caribbean. The national flag of Guyana, known as the Golden Arrowhead, was adopted on May 1966, when the country became independent from the United Kingdom. It was designed by Whitney Smith, an American vexillologist.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Guyana"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/la.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Philippines",
      "Laos",
      "Mongolia",
      "South Korea"
    ],
    "correctIndex": 1,
    "explanation": "Laos. All four are in East Asia & Pacific. The national flag of the Lao People's Democratic Republic consists of 3 horizontal stripes, with the middle stripe in blue being twice the height of the top and bottom red stripes. In the middle is a white disc, the diameter of the disc is 4⁄5 the height of the blue stripe.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Laos"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ar.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Dominican Republic",
      "Argentina",
      "Paraguay",
      "Haiti"
    ],
    "correctIndex": 1,
    "explanation": "Argentina. All four are in Latin America & Caribbean. The national flag of Argentina, often referred to as the Argentine flag, is a triband, composed of three equally wide horizontal bands coloured baby blue and white. There are multiple interpretations on the reasons for those colors.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Argentina"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cl.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Dominica",
      "Trinidad and Tobago",
      "Honduras",
      "Chile"
    ],
    "correctIndex": 3,
    "explanation": "Chile. All four are in Latin America & Caribbean. The flag of Chile consists of two equal-height horizontal bands of white and red, with a blue square the same height as the white band in the canton, which bears a white five-pointed star in its center. It was adopted on 18 October 1817.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Chile"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mv.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "India",
      "Sri Lanka",
      "Maldives",
      "Bhutan"
    ],
    "correctIndex": 2,
    "explanation": "Maldives. All four are in South Asia. The Flag of the Republic of Maldives is green with a red border. The center bears a vertical white crescent; the closed side of the crescent is on the raising side of the flag.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Maldives"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/kp.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Myanmar",
      "Tuvalu",
      "Fiji",
      "North Korea"
    ],
    "correctIndex": 3,
    "explanation": "North Korea. All four are in East Asia & Pacific. The national flag of the Democratic People's Republic of Korea consists of a wide horizontal red stripe bordered above and below by a thin white stripe and a broad blue stripe. The red stripe is charged near the hoist with a five-pointed red star inside a white disc.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_North_Korea"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bf.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Burkina Faso",
      "Senegal",
      "Togo",
      "Guinea-Bissau"
    ],
    "correctIndex": 0,
    "explanation": "Burkina Faso. All four use the Pan-African colors. The national flag of Burkina Faso is formed by two equal horizontal bands of red (top) and green, with a yellow five-pointed star resting in the center. The flag was adopted on 4 August 1984.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Burkina_Faso"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cm.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Cameroon",
      "Guinea",
      "Guinea-Bissau",
      "Senegal"
    ],
    "correctIndex": 0,
    "explanation": "Cameroon. All four use the Pan-African colors. The national flag of Cameroon is a vertical tricolour of green, red and yellow pales, with one yellow five-pointed star in its center. This flag was originally adopted on 26 October 1957 as a plain tricolor then gained its present form on 20 May 1975 after Cameroon became a unitary state.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Cameroon"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sn.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Guinea-Bissau",
      "Sao Tome and Principe",
      "Senegal",
      "Benin"
    ],
    "correctIndex": 2,
    "explanation": "Senegal. All four use the Pan-African colors. The national flag of Senegal is a tricolour consisting of three vertical green, yellow and red bands charged with a five-pointed green star at the centre. Adopted in 1960 to replace the flag of the Mali Federation, it has been the flag of the Republic of Senegal since the country gained independence that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Senegal"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mh.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Mongolia",
      "Myanmar",
      "Marshall Islands",
      "Solomon Islands"
    ],
    "correctIndex": 2,
    "explanation": "Marshall Islands. All four are in East Asia & Pacific. The flag of the Republic of the Marshall Islands, an island nation in the Pacific, was adopted upon the start of self-government, May 1, 1979. The flag was designed by Emlain Kabua, who served as the first First Lady of the republic.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Marshall_Islands"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/kw.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Egypt",
      "Kuwait",
      "Syria",
      "Yemen"
    ],
    "correctIndex": 1,
    "explanation": "Kuwait. All four use the Pan-Arab colors. The flag of Kuwait was adopted on 7 September 1961, and officially hoisted 24 November 1961. Before 1961, the flag of Kuwait was red and white, like those of other Arab states of the Persian Gulf at the time, with the field being red and words or charges being written in white.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Kuwait"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/de.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Latvia",
      "Belgium",
      "Germany",
      "Greece"
    ],
    "correctIndex": 2,
    "explanation": "Germany. All four are in Europe & Central Asia. The national flag of Germany is a tricolour consisting of three equal horizontal bands displaying the national colours of Germany: black, red, and gold. The flag was first sighted in 1848 in the German Confederation.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Germany"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bo.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Brazil",
      "Barbados",
      "Paraguay",
      "Bolivia"
    ],
    "correctIndex": 3,
    "explanation": "Bolivia. All four are in Latin America & Caribbean. The original national flag of the Plurinational State of Bolivia was created in 1851. The state and war flag is a horizontal tricolor of red, yellow and green with the Bolivian coat of arms in the center, whereas the civil flag is just the three colors without the coat of arms.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Bolivia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ne.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Senegal",
      "Côte d’Ivoire",
      "Nigeria",
      "Niger"
    ],
    "correctIndex": 3,
    "explanation": "Niger. All four are in Sub-Saharan Africa. The flag of Niger has been the national flag since 1959, a year prior to its formal independence from French West Africa. It uses the national colors of orange, white and green, in equal horizontal bands, with an orange circle in the center.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Niger"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ki.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Tuvalu",
      "Malaysia",
      "Kiribati",
      "Marshall Islands"
    ],
    "correctIndex": 2,
    "explanation": "Kiribati. All four are in East Asia & Pacific. The flag of Kiribati is red in the upper half with a gold frigatebird flying over a gold rising sun (otintaai), and the lower half is blue with three horizontal wavy white stripes to represent the ocean and the three archipelagoes. The 17 rays of the sun represent the 16 Gilbert Islands and Banaba.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Kiribati"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/tm.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Turkmenistan",
      "Comoros",
      "Türkiye",
      "Singapore"
    ],
    "correctIndex": 0,
    "explanation": "Turkmenistan. All four are Crescent and star flags. The national flag of Turkmenistan features a white crescent and five stars representing the five regions of the country and the Five Pillars of Islam. Placed upon a green field is a symbolic representation of the country's famous carpet industry.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Turkmenistan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/kh.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Timor-Leste",
      "Cambodia",
      "Japan",
      "Australia"
    ],
    "correctIndex": 1,
    "explanation": "Cambodia. All four are in East Asia & Pacific. The flag of Cambodia features three horizontal bands of blue, double-width red, and blue, with a white depiction of Angkor Wat centred on the red band. Red and blue are traditionally the colours of Cambodia, representing the nation and the king respectively.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Cambodia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bs.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Venezuela",
      "Bolivia",
      "The Bahamas",
      "Dominica"
    ],
    "correctIndex": 2,
    "explanation": "The Bahamas. All four are in Latin America & Caribbean. The national flag of the Commonwealth of The Bahamas consists of a black triangle situated at the hoist with three horizontal bands: aquamarine, gold and aquamarine. Adopted in 1973 to replace the British Blue Ensign defaced with the emblem of the Crown Colony of the Bahama Islands, it has been the flag of The Bahamas since the country gained independence that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Bahamas"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bn.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Brunei",
      "Timor-Leste",
      "Vanuatu",
      "Micronesia"
    ],
    "correctIndex": 0,
    "explanation": "Brunei. All four are in East Asia & Pacific. The flag of Brunei was originally a solid yellow background until 1906 when it added two diagonal white and black striped lines to the flags. By then, Brunei was already a British protectorate since 1888.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Brunei"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gh.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Senegal",
      "Guinea",
      "Ethiopia",
      "Ghana"
    ],
    "correctIndex": 3,
    "explanation": "Ghana. All four use the Pan-African colors. The national flag of Ghana consists of a horizontal triband of red, yellow, and green with a black five-pointed star in the center taking up all of the width of the yellow stripe, touching the red and green stripes. It replaced the British Gold Coast's Blue Ensign.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Ghana"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ge.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Italy",
      "Serbia",
      "Georgia",
      "Switzerland"
    ],
    "correctIndex": 2,
    "explanation": "Georgia. All four are in Europe & Central Asia. Flag of Georgia may refer to:Flag of Georgia (country) Flag of the Georgian Soviet Socialist Republic Flag of Georgia",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Georgia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/tv.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Fiji",
      "New Zealand",
      "Tuvalu",
      "Australia"
    ],
    "correctIndex": 2,
    "explanation": "Tuvalu. All four are The Union Jack in the corner flags. The national flag of Tuvalu is a light blue field with the Union Jack in the canton and nine yellow five-pointed stars on the fly (right) half of the flag. The nine stars represent the nine islands of Tuvalu, while the Union Jack symbolises the country's connections to the United Kingdom and the Commonwealth.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Tuvalu"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/us.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "United States",
      "Canada",
      "Poland",
      "Micronesia"
    ],
    "correctIndex": 0,
    "explanation": "United States. All four are in North America. The national flag of the United States of America, often referred to as the American flag or the U. S.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_United_States"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cz.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "France",
      "Poland",
      "Czechia",
      "Bosnia and Herzegovina"
    ],
    "correctIndex": 2,
    "explanation": "Czechia. All four are in Europe & Central Asia. The national flag of the Czech Republic is the same as the flag of the former Czechoslovakia. Upon the dissolution of Czechoslovakia in December 1992, the Czech Republic kept the Czechoslovak flag while Slovakia adopted its own flag.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Czech_Republic"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bj.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Benin",
      "Guinea",
      "Zimbabwe",
      "Ghana"
    ],
    "correctIndex": 0,
    "explanation": "Benin. All four use the Pan-African colors. The national flag of Benin is a flag consisting of two horizontal yellow and red bands on the fly side and a green vertical band at the hoist. Adopted in 1959 to replace the French Tricolour, it was the flag of the Republic of Dahomey until 1975, when the People's Republic of Benin was established.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Benin"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/lb.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Iran",
      "Lebanon",
      "Afghanistan",
      "Algeria"
    ],
    "correctIndex": 1,
    "explanation": "Lebanon. All four are in Middle East, North Africa, Afghanistan & Pakistan. The national flag of Lebanon is a horizontal triband of two red stripes enveloping a central white stripe which is twice the height of each red stripe. Centered on the white stripe is a green cedar of Lebanon tree, touching both red stripes.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Lebanon"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mn.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Kiribati",
      "Singapore",
      "Timor-Leste",
      "Mongolia"
    ],
    "correctIndex": 3,
    "explanation": "Mongolia. All four are in East Asia & Pacific. The national flag of Mongolia is a vertical triband with a red stripe at each side and a blue stripe in the middle, with the Mongolian Soyombo symbol centering on the leftmost stripe. The blue stripe represents the eternal blue sky, the red stripes thriving for eternity, and the yellow color symbolize Tibetan Buddhism.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Mongolia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ls.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Mali",
      "Ethiopia",
      "South Sudan",
      "Lesotho"
    ],
    "correctIndex": 3,
    "explanation": "Lesotho. All four are in Sub-Saharan Africa. The flag of Lesotho, adopted on the 40th anniversary of Lesotho's independence on 4 October 2006, features a horizontal blue, white, and green tricolour with a black mokorotlo in the center. The design is intended to reflect a state that is both at peace internally and with its only neighbour South Africa, replacing the old flag design that featured a military emblem of a shield, spear and knobkerrie.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Lesotho"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/eg.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Egypt",
      "Syria",
      "Jordan",
      "United Arab Emirates"
    ],
    "correctIndex": 0,
    "explanation": "Egypt. All four use the Pan-Arab colors. The national flag of Egypt is a tricolour consisting of the three equal horizontal red, white, and black bands of the Arab Liberation Flag that dates back to the 1952 Egyptian Revolution. The flag bears Egypt's national emblem, the Egyptian eagle of Saladin, centred in the white band.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Egypt"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/qa.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Tunisia",
      "Jordan",
      "Malta",
      "Qatar"
    ],
    "correctIndex": 3,
    "explanation": "Qatar. All four are in Middle East, North Africa, Afghanistan & Pakistan. The flag of Qatar is in the ratio of 11:28. It is maroon with a broad white serrated band of nine points at the hoist.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Qatar"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/uz.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Mauritania",
      "Uzbekistan",
      "Comoros",
      "Türkiye"
    ],
    "correctIndex": 1,
    "explanation": "Uzbekistan. All four are Crescent and star flags. The national flag of Uzbekistan, officially the state flag of the Republic of Uzbekistan, consists of a horizontal triband of dark azure blue, white and dark green, separated by two thin red fimbriations, with a white crescent moon and twelve white stars in the canton. Adopted in 1991 to replace the flag of the Uzbek Soviet Socialist Republic, it has been the flag of the Republic of Uzbekistan since the country gained independence in that same year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Uzbekistan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/dz.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Algeria",
      "Libya",
      "Pakistan",
      "Tunisia"
    ],
    "correctIndex": 0,
    "explanation": "Algeria. All four are Crescent and star flags. The national flag of Algeria consists of two equal vertical bars, green and white, charged in the center with a red star and crescent, a symbol of Islam as the nation's prominent faith. The flag was adopted on 3 July 1962.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Algeria"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cy.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Belgium",
      "Luxembourg",
      "Finland",
      "Cyprus"
    ],
    "correctIndex": 3,
    "explanation": "Cyprus. All four are A map of itself flags. The flag of Cyprus came into use on 16 August 1960, under the Zürich and London Agreements, whereby a constitution was drafted and Cyprus was proclaimed an independent state. The flag was designed by Turkish Cypriot artist İsmet Güney.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Cyprus"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ca.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Canada",
      "Germany",
      "Fiji",
      "United States"
    ],
    "correctIndex": 0,
    "explanation": "Canada. All four are in North America. The national flag of Canada, popularly referred to as the Maple Leaf, consists of a red field with a white square at its centre in the horizontal ratio of 1∶2∶1, in which is featured one stylized, red, 11-pointed maple leaf charged in the centre. It is the first flag to have been adopted by both houses of Parliament and officially proclaimed by the Canadian monarch as the country's official national flag.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Canada"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/li.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Croatia",
      "Montenegro",
      "Liechtenstein",
      "Belgium"
    ],
    "correctIndex": 2,
    "explanation": "Liechtenstein. All four are in Europe & Central Asia. The national flag of the Principality of Liechtenstein consists of two horizontal bands, one blue and one red, charged with a gold crown in the canton. In use since 1852 and officially enshrined into the nation's constitution in 1921, it has been the flag of the principality since that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Liechtenstein"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/so.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Somalia",
      "Ghana",
      "South Sudan",
      "Kenya"
    ],
    "correctIndex": 0,
    "explanation": "Somalia. All four are in Sub-Saharan Africa. The national flag of Somalia was adopted on October 12, 1954, and was designed by Mohammed Awale Liban. The flag was initially used within the Trust Territory of Somaliland before being adopted by the short-lived State of Somaliland and the Somali Republic.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Somalia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/dk.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Finland",
      "Norway",
      "Sweden",
      "Denmark"
    ],
    "correctIndex": 3,
    "explanation": "Denmark. All four are The Nordic cross flags. The Dannebrog is the flag of the Kingdom of Denmark. The flag is red with a white Nordic cross, which means that the cross extends to the edges of the flag and that the vertical part of the cross is shifted to the hoist side.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Dannebrog"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/jp.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Myanmar",
      "China",
      "Japan",
      "Fiji"
    ],
    "correctIndex": 2,
    "explanation": "Japan. All four are in East Asia & Pacific. The national flag of Japan is a rectangular white banner with a red circle at its center. The flag is officially called the Nisshōki , but is more commonly known in Japan as the Hinomaru .",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Japan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/pa.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Argentina",
      "Antigua and Barbuda",
      "Panama",
      "Nicaragua"
    ],
    "correctIndex": 2,
    "explanation": "Panama. All four are in Latin America & Caribbean. The national flag of Panama was made by María de la Ossa de Amador and was officially adopted by the \"ley 48 de 1925\". The Panamanian flag day is celebrated on November 4, one day after the Panamanian separation from Colombia, and is one of a series of holidays celebrated in November known as the Fiestas Patrias.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Panama"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/gb.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Latvia",
      "United Kingdom",
      "Estonia",
      "Monaco"
    ],
    "correctIndex": 1,
    "explanation": "United Kingdom. All four are in Europe & Central Asia. The Union Jack or Union Flag is the national flag of the United Kingdom. While no law has been enacted making the Union Flag the national flag of the United Kingdom, it has become so through precedent.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Union_Jack"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/do.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Bolivia",
      "Suriname",
      "Colombia",
      "Dominican Republic"
    ],
    "correctIndex": 3,
    "explanation": "Dominican Republic. All four are in Latin America & Caribbean. The national flag of the Dominican Republic is one of the official national symbols of the nation, along with the coat of arms and the national anthem. The blue on the flag stands for liberty, the white for salvation, and the red for the blood of heroes.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Dominican_Republic"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/al.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Albania",
      "Serbia",
      "Armenia",
      "Switzerland"
    ],
    "correctIndex": 0,
    "explanation": "Albania. All four are in Europe & Central Asia. The national flag of Albania depicts a silhouetted black double-headed eagle in the center of a red background. The red stands for bravery, strength, valour and bloodshed, while the eagle – traditionally the symbol of Albanians – represents the sovereign state of Albania.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Albania"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/cn.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "South Korea",
      "Singapore",
      "Japan",
      "China"
    ],
    "correctIndex": 3,
    "explanation": "China. All four are in East Asia & Pacific. The national flag of the People's Republic of China is a Chinese red field with five golden stars charged at the canton. The design features one large star, with four smaller stars in an arc set off towards the fly.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_China"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/et.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Guinea-Bissau",
      "Ghana",
      "Ethiopia",
      "Burkina Faso"
    ],
    "correctIndex": 2,
    "explanation": "Ethiopia. All four use the Pan-African colors. The flag of Ethiopia consists of a green, yellow, and red tricolour with the national emblem, a golden pentagram on a blue disc, superimposed at the centre. While the colours green, yellow, and red in combination held symbolic importance since at least the early 17th century, the modern tricolour was first adopted on 11 October 1897 by Menelik II, and the present flag on 31 October 1996.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Ethiopia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ht.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Belize",
      "Haiti",
      "Mexico",
      "Trinidad and Tobago"
    ],
    "correctIndex": 1,
    "explanation": "Haiti. All four are in Latin America & Caribbean. The flag of Haiti is a bicolour featuring two horizontal bands coloured blue and red, emblazoned by a white rectangular panel bearing the coat of arms of Haiti. The coat of arms depicts a trophy of weapons atop a green hill and a royal palm symbolizing independence.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Haiti"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/kg.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "San Marino",
      "Armenia",
      "Kyrgyzstan",
      "Latvia"
    ],
    "correctIndex": 2,
    "explanation": "Kyrgyzstan. All four are in Europe & Central Asia. The State Flag of the Kyrgyz Republic consists of a red field charged with a yellow sun that contains a depiction of a tündük, the opening in the center of the roof of a yurt. Adopted in 1992, just over seven months after the country's independence was declared, to replace the flag of the Kirghiz SSR, it has been the flag of Kyrgyzstan since that year.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Kyrgyzstan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/in.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "India",
      "Sri Lanka",
      "Bhutan",
      "Maldives"
    ],
    "correctIndex": 0,
    "explanation": "India. All four are in South Asia. The national flag of India, colloquially called Tiraṅgā, is a horizontal rectangular tricolour flag, the colours being of India saffron, white and India green; with the Ashoka Chakra, a 24-spoke wheel, in navy blue at its centre. It was adopted in its present form during a meeting of the Constituent Assembly held on 22 July 1947, and it became the official flag of the Union of India on 15 August 1947.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_India"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ph.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "South Korea",
      "Naoero",
      "Philippines",
      "Palau"
    ],
    "correctIndex": 2,
    "explanation": "Philippines. All four are in East Asia & Pacific. The national flag of the Philippines, also known as Three Stars and a Sun, is a horizontal bicolor flag with equal bands of royal blue and crimson red, with a white, equilateral triangle at the hoist. In the center of the triangle is a golden-yellow sun with eight primary rays, to represent the original eight provinces that rebelled against the Spanish during the 1896 Philippine Revolution.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_the_Philippines"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ao.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Republic of the Congo",
      "Zimbabwe",
      "Central African Republic",
      "Angola"
    ],
    "correctIndex": 3,
    "explanation": "Angola. All four are in Sub-Saharan Africa. The national flag of Angola is a horizontal bicolour of red and black, charged in the center with a yellow emblem consisting of a machete crossed by a half-cogwheel and crowned with a five-pointed star. It was adopted on 11 November 1975, when Angola became independent from Portugal following the thirteen-year Angolan War of Independence.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Angola"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ec.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Suriname",
      "Venezuela",
      "Ecuador",
      "Guatemala"
    ],
    "correctIndex": 2,
    "explanation": "Ecuador. All four are in Latin America & Caribbean. The national flag of Ecuador, which consists of horizontal bands of the Pan-Colombian colors of yellow, blue and red, was first adopted by law in 1835 and later on 26 September 1860. The design of the current flag was finalized in 1900 with the addition of the coat of arms in the center of the flag.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Ecuador"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/af.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Afghanistan",
      "Egypt",
      "United Arab Emirates",
      "Israel"
    ],
    "correctIndex": 0,
    "explanation": "Afghanistan. All four are in Middle East, North Africa, Afghanistan & Pakistan. The national flag of the Islamic Emirate of Afghanistan was adopted on 15 August 2021, with the Taliban's victory in the 2001–2021 war. It features a white field with a black Shahada, the Islamic declaration of belief, inscribed.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Afghanistan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ws.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Samoa",
      "Papua New Guinea",
      "Australia",
      "Brazil"
    ],
    "correctIndex": 0,
    "explanation": "Samoa. All four are The Southern Cross flags. The flag of Samoa is a red field with a blue canton bearing five white five-pointed stars arranged to form the Southern Cross constellation. Paramount chiefs Malietoa Tanumafili II and Tupua Tamasese Meaʻole designed the flag with four stars in 1948, when Samoa was under the stewardship of New Zealand as the Territory of Western Samoa.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Samoa"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ad.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Monaco",
      "Turkmenistan",
      "Kyrgyzstan",
      "Andorra"
    ],
    "correctIndex": 3,
    "explanation": "Andorra. All four are in Europe & Central Asia. The national flag of Andorra features a vertical tricolour of blue, yellow, and red with the coat of arms of Andorra in the center. The centre yellow bar is slightly wider than the other two so that the ratio of bar widths is 8:9:8 with an overall flag ratio of 7:10.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Andorra"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/tr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Azerbaijan",
      "Turkmenistan",
      "Comoros",
      "Türkiye"
    ],
    "correctIndex": 3,
    "explanation": "Türkiye. All four are Crescent and star flags. The national flag of Turkey, officially the Turkish flag, features a white crescent and star in a red background on its emblem, based on the 18th-century flag of the Ottoman Empire. The flag is often called \"the red flag\", and is referred to as \"the red banner\" in the Turkish national anthem.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Turkey"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/is.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Norway",
      "Denmark",
      "Iceland",
      "Finland"
    ],
    "correctIndex": 2,
    "explanation": "Iceland. All four are The Nordic cross flags. The flag of Iceland is defined in Law No. 34/1944, adopted on 17 June 1944, the day Iceland became a republic.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Iceland"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/at.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "France",
      "Kyrgyzstan",
      "Austria",
      "Kazakhstan"
    ],
    "correctIndex": 2,
    "explanation": "Austria. All four are in Europe & Central Asia. The national flag of Austria is a triband in the following order: red, white, and red.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Austria"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/br.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "New Zealand",
      "Samoa",
      "Papua New Guinea",
      "Brazil"
    ],
    "correctIndex": 3,
    "explanation": "Brazil. All four are The Southern Cross flags. The national flag of Brazil is a blue disc depicting a starry sky spanned by a curved band inscribed with the national motto Ordem e Progresso, within a yellow rhombus on a green field. It was officially adopted on 19 November 1889, four days after the Proclamation of the Republic, to replace the flag of the Empire of Brazil.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Brazil"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/jm.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Brazil",
      "Dominican Republic",
      "Jamaica",
      "Costa Rica"
    ],
    "correctIndex": 2,
    "explanation": "Jamaica. All four are in Latin America & Caribbean. The flag of Jamaica was adopted on 6 August 1962, the day Jamaica became independent from the United Kingdom. The flag consists of a gold saltire, which divides the flag into four sections: two of them green and two black.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Jamaica"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/py.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Barbados",
      "Antigua and Barbuda",
      "Dominica",
      "Paraguay"
    ],
    "correctIndex": 3,
    "explanation": "Paraguay. All four are in Latin America & Caribbean. The flag of Paraguay was first adopted in 1842. Its design, a red–white–blue triband, was inspired by the colours of the French Tricolour, believed to signify independence and liberty.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Paraguay"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ug.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Madagascar",
      "Senegal",
      "South Sudan",
      "Uganda"
    ],
    "correctIndex": 3,
    "explanation": "Uganda. All four are in Sub-Saharan Africa. The national flag of Uganda was adopted on 9 October 1962, the day the nation became independent from the United Kingdom. It consists of six equal horizontal bands, from top to bottom, of black, yellow, red, black, yellow, and red, with a white disc containing a crested crane superimposed (charged) at the centre.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Uganda"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ee.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Estonia",
      "Bosnia and Herzegovina",
      "Serbia",
      "Armenia"
    ],
    "correctIndex": 0,
    "explanation": "Estonia. All four are in Europe & Central Asia. The national flag of Estonia is a tricolour featuring three equal horizontal bands of blue at the top, black in the middle, and white at the bottom. The flag is called sinimustvalge in Estonian.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Estonia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bg.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Bulgaria",
      "Armenia",
      "Serbia",
      "Belgium"
    ],
    "correctIndex": 0,
    "explanation": "Bulgaria. All four are in Europe & Central Asia. The national flag of the Republic of Bulgaria is a tricolour consisting of three equal-sized horizontal bands of white, green, and red. The flag was first adopted after the 1877–1878 Russo-Turkish War, when Bulgaria gained de facto independence.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Bulgaria"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/pk.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Pakistan",
      "Comoros",
      "Tunisia",
      "Türkiye"
    ],
    "correctIndex": 0,
    "explanation": "Pakistan. All four are Crescent and star flags. The national flag of Pakistan, also known as the Flag of the Star and Crescent, is made up of a green field with a stylized tilted white descending crescent moon and five-pointed star at its centre, and a vertical white stripe at its hoist-end. Though the specific shade of green on the flag is mandated only as 'dark green', its official and most consistent representation is in Pakistan green, which is shaded distinctively darker.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Pakistan"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/me.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Bulgaria",
      "Montenegro",
      "Poland",
      "Sweden"
    ],
    "correctIndex": 1,
    "explanation": "Montenegro. All four are in Europe & Central Asia. The national flag of Montenegro has a red field with gold border and the coat of arms of Montenegro in its center. It was officially adopted on 13 July 2004, when the then Republic of Montenegro was a constituent of the State Union of Serbia and Montenegro, and its precise specification was standardized on 16 September 2004.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Montenegro"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sb.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Solomon Islands",
      "Japan",
      "New Zealand",
      "Marshall Islands"
    ],
    "correctIndex": 0,
    "explanation": "Solomon Islands. All four are in East Asia & Pacific. The flag of Solomon Islands consists of a thin yellow diagonal stripe from the lower hoist-side corner, with a blue upper triangle and green lower triangle, and the canton charged with five white stars. Adopted in 1977 to replace the British Blue Ensign defaced with the arms of the protectorate, it has been the flag of Solomon Islands since 18 November of that year, eight months before the country gained independence.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Solomon_Islands"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/lv.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Liechtenstein",
      "Germany",
      "Slovenia",
      "Latvia"
    ],
    "correctIndex": 3,
    "explanation": "Latvia. All four are in Europe & Central Asia. The national flag of Latvia is a triband featuring two wide horizontal stripes of red at the top and bottom, separated by a twice narrower white centre stripe. It was used as the national flag after Latvia became an independent country in 1918.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Latvia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/mu.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Sao Tome and Principe",
      "Mauritius",
      "Chad",
      "Comoros"
    ],
    "correctIndex": 1,
    "explanation": "Mauritius. All four are in Sub-Saharan Africa. The national flag of Mauritius, also known as The Four Bands, was adopted upon independence, 12 March 1968. It consists of four horizontal bands of equal width, coloured red, blue, yellow, and green.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Mauritius"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ma.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Morocco",
      "Afghanistan",
      "Qatar",
      "Yemen"
    ],
    "correctIndex": 0,
    "explanation": "Morocco. All four are in Middle East, North Africa, Afghanistan & Pakistan. The flag of Morocco is the flag used by the government of Morocco and has served as the national flag of Morocco since 17 November 1915. It has a red field with a green pentagram in the center.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Morocco"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bb.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Barbados",
      "Dominica",
      "Guyana",
      "Saint Kitts and Nevis"
    ],
    "correctIndex": 0,
    "explanation": "Barbados. All four are in Latin America & Caribbean. The flag of Barbados was designed by Grantley W. Prescod and was officially adopted to represent Barbados at midnight on 30 November 1966, the day the country gained independence.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Barbados"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/bd.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Sri Lanka",
      "Nepal",
      "Maldives",
      "Bangladesh"
    ],
    "correctIndex": 3,
    "explanation": "Bangladesh. All four are in South Asia. The national flag of Bangladesh, nicknamed the Lal–Sobuj, was adopted officially on 17 January 1972. It consists of a red circle on top of a dark green field.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Bangladesh"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/hn.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Honduras",
      "Uruguay",
      "Chile",
      "Barbados"
    ],
    "correctIndex": 0,
    "explanation": "Honduras. All four are in Latin America & Caribbean. The flag of Honduras consists of three equal horizontal stripes of turquoise blue, white and the same shade of blue, with five turquoise stars arranged in a quincuncial pattern at the centre of the middle stripe. The two outer bands represent the Pacific Ocean and the Caribbean Sea, and also represent the blue sky and brotherhood.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Honduras"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/lr.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Comoros",
      "Liberia",
      "Benin",
      "Angola"
    ],
    "correctIndex": 1,
    "explanation": "Liberia. All four are in Sub-Saharan Africa. The flag of Liberia, occasionally referred to as the Lone Star, bears a close resemblance to the flag of the United States, representing Liberia's founding by free people of color and former slaves from the United States and the Caribbean. They are both part of the stars and stripes flag family.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Liberia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/na.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Botswana",
      "Cabo Verde",
      "Côte d’Ivoire",
      "Namibia"
    ],
    "correctIndex": 3,
    "explanation": "Namibia. All four are in Sub-Saharan Africa. The flag of Namibia consists of a red bend sinister fimbriated white, separating a blue upper triangle charged with a twelve-rayed yellow sun from a green lower triangle.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Namibia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/pe.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Uruguay",
      "Bolivia",
      "Peru",
      "Belize"
    ],
    "correctIndex": 2,
    "explanation": "Peru. All four are in Latin America & Caribbean. The national flag of Peru, officially named the Bandera Nacional and often referred to as The Bicolour, is a vertical triband with red outer bands and a single white middle band, as defined by Article 49 of the Constitution of the Republic of Peru. The current flag was adopted by the Congress of Peru on 25 February 1825, and modified in 1950.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Peru"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/it.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Georgia",
      "Albania",
      "Russia",
      "Italy"
    ],
    "correctIndex": 3,
    "explanation": "Italy. All four are in Europe & Central Asia. The national flag of Italy, often referred to as the Tricolour, is a flag featuring three equally sized vertical pales of green, white and red, with the green at the hoist side, as defined by Article 12 of the Constitution of the Italian Republic. The Italian law regulates its use and display, protecting its defence and providing for the crime of insulting it; it also prescribes its teaching in Italian schools together with other national symbols of Italy.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Italy"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/lt.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Belarus",
      "Lithuania",
      "North Macedonia",
      "Ireland"
    ],
    "correctIndex": 1,
    "explanation": "Lithuania. All four are in Europe & Central Asia. The national flag of Lithuania consists of a horizontal tricolour of yellow, green, and red. It was adopted on 25 April 1918 during Lithuania's first period of independence (1918–1940), which ceased with the occupation first by the Soviet Union, and then by Nazi Germany (1941–1944).",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Lithuania"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/co.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Brazil",
      "Nicaragua",
      "Venezuela",
      "Colombia"
    ],
    "correctIndex": 3,
    "explanation": "Colombia. All four are in Latin America & Caribbean. The flag of the Republic of Colombia, also known as El Tricolor Nacional, is the national flag representing the country and, alongside the coat of arms and the national anthem, constitutes one of its official national symbols. The flag consists of a rectangle divided into three horizontal bands featuring the primary colors of the RYB color model.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Colombia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ba.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Bosnia and Herzegovina",
      "Luxembourg",
      "Greece",
      "Belarus"
    ],
    "correctIndex": 0,
    "explanation": "Bosnia and Herzegovina. All four are in Europe & Central Asia. The national flag of Bosnia and Herzegovina contains a medium blue field with a yellow right triangle separating said field, and there are seven full five-pointed white stars and two half stars, top and bottom, along the hypotenuse of the triangle.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Bosnia_and_Herzegovina"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ng.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Seychelles",
      "Tanzania",
      "Nigeria",
      "Sudan"
    ],
    "correctIndex": 2,
    "explanation": "Nigeria. All four are in Sub-Saharan Africa. The flag of Nigeria was designed by Taiwo Akinkunmi and was officially adopted to represent Nigeria at midnight on 1 October 1960, the day the country gained independence. The flag was chosen as part of a nationwide open contest held by the government, with Akinkunmi's design being selected as the winner of a field of over three thousand entries.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Nigeria"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/sa.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Kuwait",
      "Iran",
      "United Arab Emirates",
      "Saudi Arabia"
    ],
    "correctIndex": 3,
    "explanation": "Saudi Arabia. All four are in Middle East, North Africa, Afghanistan & Pakistan. The national flag of Saudi Arabia is a green background with Arabic inscription and a sword in white. The inscription is the Islamic creed, or shahada: \"There is no god but Allah, and Muhammad is the Messenger of God\".",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Saudi_Arabia"
  },
  {
    "question": "Which country flies this flag?",
    "image": "https://flagcdn.com/w320/ir.png",
    "imageAlt": "A national flag to identify",
    "options": [
      "Oman",
      "Iraq",
      "Libya",
      "Iran"
    ],
    "correctIndex": 3,
    "explanation": "Iran. All four are in Middle East, North Africa, Afghanistan & Pakistan. The national flag of the Islamic Republic of Iran is a tricolour of equal horizontal bands of green, white, and red, featuring the Islamic emblem in red centred on the white band, and the Takbir written 11 times each in white Kufic script along the edges of the green and red bands.",
    "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Iran"
  }
];
