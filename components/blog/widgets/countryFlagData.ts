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
    "explanation": "Chad. Identical layout; Chad’s blue is darker. Chad has raised it at the UN."
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
    "explanation": "Romania. Identical layout; Chad’s blue is darker. Chad has raised it at the UN."
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
    "explanation": "Indonesia. The same two bands. Indonesia’s flag is longer."
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
    "explanation": "Monaco. The same two bands. Indonesia’s flag is longer."
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
    "explanation": "Ireland. Mirror images of each other — green is on the hoist for Ireland, the fly for Côte d’Ivoire."
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
    "explanation": "Côte d’Ivoire. Mirror images of each other — green is on the hoist for Ireland, the fly for Côte d’Ivoire."
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
    "explanation": "Netherlands. Same three bands; Luxembourg’s blue is lighter and its flag longer."
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
    "explanation": "Luxembourg. Same three bands; Luxembourg’s blue is lighter and its flag longer."
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
    "explanation": "Australia. Both are Union-canton flags with the Southern Cross. New Zealand has four stars, Australia six."
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
    "explanation": "New Zealand. Both are Union-canton flags with the Southern Cross. New Zealand has four stars, Australia six."
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
    "explanation": "Slovenia. Three Pan-Slavic tricolors separated only by their coats of arms."
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
    "explanation": "Slovakia. Three Pan-Slavic tricolors separated only by their coats of arms."
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
    "explanation": "Serbia. Three Pan-Slavic tricolors separated only by their coats of arms."
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
    "explanation": "Hungary. All four are in Europe & Central Asia."
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
    "explanation": "Grenada. All four are in Latin America & Caribbean."
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
    "explanation": "El Salvador. All four are in Latin America & Caribbean."
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
    "explanation": "DR Congo. All four are in Sub-Saharan Africa."
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
    "explanation": "Saint Kitts and Nevis. All four are in Latin America & Caribbean."
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
    "explanation": "Trinidad and Tobago. All four are in Latin America & Caribbean."
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
    "explanation": "Malaysia. All four are crescent and star flags."
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
    "explanation": "Sweden. All four are the nordic cross flags."
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
    "explanation": "Zambia. All four are in Sub-Saharan Africa."
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
    "explanation": "Norway. All four are the nordic cross flags."
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
    "explanation": "Bahrain. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "Malta. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "Dominica. All four are in Latin America & Caribbean."
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
    "explanation": "Saint Lucia. All four are in Latin America & Caribbean."
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
    "explanation": "Tonga. All four are in East Asia & Pacific."
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
    "explanation": "The Gambia. All four are in Sub-Saharan Africa."
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
    "explanation": "Belarus. All four are in Europe & Central Asia."
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
    "explanation": "Azerbaijan. All four are crescent and star flags."
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
    "explanation": "Tunisia. All four are crescent and star flags."
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
    "explanation": "Guinea. All four are pan-african colors flags."
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
    "explanation": "Comoros. All four are crescent and star flags."
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
    "explanation": "Sri Lanka. All four are in South Asia."
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
    "explanation": "Switzerland. All four are not a rectangle flags."
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
    "explanation": "Venezuela. All four are in Latin America & Caribbean."
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
    "explanation": "Suriname. All four are in Latin America & Caribbean."
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
    "explanation": "Djibouti. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "Mali. All four are pan-african colors flags."
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
    "explanation": "Vietnam. All four are in East Asia & Pacific."
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
    "explanation": "Myanmar. All four are in East Asia & Pacific."
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
    "explanation": "Mozambique. All four are in Sub-Saharan Africa."
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
    "explanation": "Mauritania. All four are crescent and star flags."
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
    "explanation": "Cabo Verde. All four are in Sub-Saharan Africa."
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
    "explanation": "Cuba. All four are in Latin America & Caribbean."
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
    "explanation": "Naoero. All four are in East Asia & Pacific."
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
    "explanation": "Greece. All four are in Europe & Central Asia."
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
    "explanation": "Fiji. All four are the union jack in the corner flags."
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
    "explanation": "Portugal. All four are in Europe & Central Asia."
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
    "explanation": "Timor-Leste. All four are in East Asia & Pacific."
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
    "explanation": "Malawi. All four are in Sub-Saharan Africa."
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
    "explanation": "Republic of the Congo. All four are pan-african colors flags."
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
    "explanation": "Sao Tome and Principe. All four are pan-african colors flags."
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
    "explanation": "Madagascar. All four are in Sub-Saharan Africa."
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
    "explanation": "Kazakhstan. All four are in Europe & Central Asia."
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
    "explanation": "Iraq. All four are pan-arab colors flags."
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
    "explanation": "Uruguay. All four are in Latin America & Caribbean."
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
    "explanation": "Sudan. All four are pan-arab colors flags."
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
    "explanation": "Eswatini. All four are in Sub-Saharan Africa."
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
    "explanation": "San Marino. All four are in Europe & Central Asia."
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
    "explanation": "South Africa. All four are in Sub-Saharan Africa."
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
    "explanation": "Poland. All four are in Europe & Central Asia."
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
    "explanation": "South Korea. All four are in East Asia & Pacific."
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
    "explanation": "Yemen. All four are pan-arab colors flags."
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
    "explanation": "Thailand. All four are in East Asia & Pacific."
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
    "explanation": "Guatemala. All four are in Latin America & Caribbean."
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
    "explanation": "Saint Martin. All four are in Latin America & Caribbean."
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
    "explanation": "Guinea-Bissau. All four are pan-african colors flags."
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
    "explanation": "Russia. All four are in Europe & Central Asia."
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
    "explanation": "North Macedonia. All four are in Europe & Central Asia."
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
    "explanation": "Vanuatu. All four are in East Asia & Pacific."
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
    "explanation": "Tanzania. All four are in Sub-Saharan Africa."
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
    "explanation": "Moldova. All four are in Europe & Central Asia."
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
    "explanation": "Singapore. All four are crescent and star flags."
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
    "explanation": "United Arab Emirates. All four are pan-arab colors flags."
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
    "explanation": "Saint Vincent and the Grenadines. All four are in Latin America & Caribbean."
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
    "explanation": "Equatorial Guinea. All four are in Sub-Saharan Africa."
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
    "explanation": "Nicaragua. All four are in Latin America & Caribbean."
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
    "explanation": "Eritrea. All four are in Sub-Saharan Africa."
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
    "explanation": "Vatican City. All four are not a rectangle flags."
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
    "explanation": "Armenia. All four are in Europe & Central Asia."
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
    "explanation": "Rwanda. All four are in Sub-Saharan Africa."
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
    "explanation": "Papua New Guinea. All four are the southern cross flags."
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
    "explanation": "Mexico. All four are in Latin America & Caribbean."
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
    "explanation": "Syria. All four are pan-arab colors flags."
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
    "explanation": "Finland. All four are the nordic cross flags."
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
    "explanation": "Israel. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "South Sudan. All four are in Sub-Saharan Africa."
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
    "explanation": "Gabon. All four are in Sub-Saharan Africa."
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
    "explanation": "Belize. All four are in Latin America & Caribbean."
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
    "explanation": "Botswana. All four are in Sub-Saharan Africa."
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
    "explanation": "Palau. All four are in East Asia & Pacific."
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
    "explanation": "Ukraine. All four are in Europe & Central Asia."
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
    "explanation": "Tajikistan. All four are in Europe & Central Asia."
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
    "explanation": "Croatia. All four are in Europe & Central Asia."
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
    "explanation": "Central African Republic. All four are in Sub-Saharan Africa."
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
    "explanation": "Oman. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "Costa Rica. All four are in Latin America & Caribbean."
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
    "explanation": "Spain. All four are in Europe & Central Asia."
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
    "explanation": "Zimbabwe. All four are pan-african colors flags."
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
    "explanation": "Micronesia. All four are in East Asia & Pacific."
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
    "explanation": "Belgium. All four are in Europe & Central Asia."
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
    "explanation": "Seychelles. All four are in Sub-Saharan Africa."
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
    "explanation": "Libya. All four are crescent and star flags."
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
    "explanation": "Bhutan. All four are in South Asia."
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
    "explanation": "France. All four are in Europe & Central Asia."
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
    "explanation": "Kenya. All four are in Sub-Saharan Africa."
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
    "explanation": "Jordan. All four are pan-arab colors flags."
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
    "explanation": "Togo. All four are pan-african colors flags."
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
    "explanation": "Nepal. All four are not a rectangle flags."
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
    "explanation": "Burundi. All four are in Sub-Saharan Africa."
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
    "explanation": "Antigua and Barbuda. All four are in Latin America & Caribbean."
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
    "explanation": "Sierra Leone. All four are in Sub-Saharan Africa."
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
    "explanation": "Guyana. All four are in Latin America & Caribbean."
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
    "explanation": "Laos. All four are in East Asia & Pacific."
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
    "explanation": "Argentina. All four are in Latin America & Caribbean."
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
    "explanation": "Chile. All four are in Latin America & Caribbean."
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
    "explanation": "Maldives. All four are in South Asia."
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
    "explanation": "North Korea. All four are in East Asia & Pacific."
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
    "explanation": "Burkina Faso. All four are pan-african colors flags."
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
    "explanation": "Cameroon. All four are pan-african colors flags."
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
    "explanation": "Senegal. All four are pan-african colors flags."
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
    "explanation": "Marshall Islands. All four are in East Asia & Pacific."
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
    "explanation": "Kuwait. All four are pan-arab colors flags."
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
    "explanation": "Germany. All four are in Europe & Central Asia."
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
    "explanation": "Bolivia. All four are in Latin America & Caribbean."
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
    "explanation": "Niger. All four are in Sub-Saharan Africa."
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
    "explanation": "Kiribati. All four are in East Asia & Pacific."
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
    "explanation": "Turkmenistan. All four are crescent and star flags."
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
    "explanation": "Cambodia. All four are in East Asia & Pacific."
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
    "explanation": "The Bahamas. All four are in Latin America & Caribbean."
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
    "explanation": "Brunei. All four are in East Asia & Pacific."
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
    "explanation": "Ghana. All four are pan-african colors flags."
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
    "explanation": "Georgia. All four are in Europe & Central Asia."
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
    "explanation": "Tuvalu. All four are the union jack in the corner flags."
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
    "explanation": "United States. All four are in North America."
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
    "explanation": "Czechia. All four are in Europe & Central Asia."
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
    "explanation": "Benin. All four are pan-african colors flags."
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
    "explanation": "Lebanon. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "Mongolia. All four are in East Asia & Pacific."
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
    "explanation": "Lesotho. All four are in Sub-Saharan Africa."
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
    "explanation": "Egypt. All four are pan-arab colors flags."
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
    "explanation": "Qatar. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "Uzbekistan. All four are crescent and star flags."
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
    "explanation": "Algeria. All four are crescent and star flags."
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
    "explanation": "Cyprus. All four are a map of itself flags."
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
    "explanation": "Canada. All four are in North America."
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
    "explanation": "Liechtenstein. All four are in Europe & Central Asia."
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
    "explanation": "Somalia. All four are in Sub-Saharan Africa."
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
    "explanation": "Denmark. All four are the nordic cross flags."
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
    "explanation": "Japan. All four are in East Asia & Pacific."
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
    "explanation": "Panama. All four are in Latin America & Caribbean."
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
    "explanation": "United Kingdom. All four are in Europe & Central Asia."
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
    "explanation": "Dominican Republic. All four are in Latin America & Caribbean."
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
    "explanation": "Albania. All four are in Europe & Central Asia."
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
    "explanation": "China. All four are in East Asia & Pacific."
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
    "explanation": "Ethiopia. All four are pan-african colors flags."
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
    "explanation": "Haiti. All four are in Latin America & Caribbean."
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
    "explanation": "Kyrgyzstan. All four are in Europe & Central Asia."
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
    "explanation": "India. All four are in South Asia."
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
    "explanation": "Philippines. All four are in East Asia & Pacific."
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
    "explanation": "Angola. All four are in Sub-Saharan Africa."
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
    "explanation": "Ecuador. All four are in Latin America & Caribbean."
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
    "explanation": "Afghanistan. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "Samoa. All four are the southern cross flags."
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
    "explanation": "Andorra. All four are in Europe & Central Asia."
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
    "explanation": "Türkiye. All four are crescent and star flags."
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
    "explanation": "Iceland. All four are the nordic cross flags."
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
    "explanation": "Austria. All four are in Europe & Central Asia."
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
    "explanation": "Brazil. All four are the southern cross flags."
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
    "explanation": "Jamaica. All four are in Latin America & Caribbean."
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
    "explanation": "Paraguay. All four are in Latin America & Caribbean."
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
    "explanation": "Uganda. All four are in Sub-Saharan Africa."
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
    "explanation": "Estonia. All four are in Europe & Central Asia."
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
    "explanation": "Bulgaria. All four are in Europe & Central Asia."
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
    "explanation": "Pakistan. All four are crescent and star flags."
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
    "explanation": "Montenegro. All four are in Europe & Central Asia."
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
    "explanation": "Solomon Islands. All four are in East Asia & Pacific."
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
    "explanation": "Latvia. All four are in Europe & Central Asia."
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
    "explanation": "Mauritius. All four are in Sub-Saharan Africa."
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
    "explanation": "Morocco. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "Barbados. All four are in Latin America & Caribbean."
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
    "explanation": "Bangladesh. All four are in South Asia."
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
    "explanation": "Honduras. All four are in Latin America & Caribbean."
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
    "explanation": "Liberia. All four are in Sub-Saharan Africa."
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
    "explanation": "Namibia. All four are in Sub-Saharan Africa."
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
    "explanation": "Peru. All four are in Latin America & Caribbean."
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
    "explanation": "Italy. All four are in Europe & Central Asia."
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
    "explanation": "Lithuania. All four are in Europe & Central Asia."
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
    "explanation": "Colombia. All four are in Latin America & Caribbean."
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
    "explanation": "Bosnia and Herzegovina. All four are in Europe & Central Asia."
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
    "explanation": "Nigeria. All four are in Sub-Saharan Africa."
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
    "explanation": "Saudi Arabia. All four are in Middle East, North Africa, Afghanistan & Pakistan."
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
    "explanation": "Iran. All four are in Middle East, North Africa, Afghanistan & Pakistan."
  }
];
