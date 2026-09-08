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
