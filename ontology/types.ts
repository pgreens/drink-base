import { JsonLdString, LocaleString } from "../src/jsonld/jsonld";

// Some of this is weirder than I thought.
// example: bevon uses food:Ingredient but defines its own food and quantity properties for it that are
// different than defined in the food ontology. What's the point of reusing food if you don't use the properties?

// It will probably be smoother to cut out most of these other ontologies.

export interface OwlClass {
  "@id"?: string; // probably the wrong place to put this
  "http://www.w3.org/2000/01/rdf-schema#label"?:
    | (string | LocaleString)
    | (string | LocaleString)[];
}

export interface QuantitativeValue {
  readonly "http://purl.org/goodrelations/v1#hasUnitOfMeasurement"?:
    | string
    | string[];
  readonly "http://purl.org/goodrelations/v1#hasValue"?: number | number[];
}

export interface Food extends OwlClass {}

export interface Bevon_Ingredient extends OwlClass {
  "http://rdfs.co/bevon/quantity"?:
    | (number | QuantitativeValue)
    | (number | QuantitativeValue)[];
  "http://rdfs.co/bevon/food"?: Food | Food[];
}

export interface Beverage extends Food {
  "http://rdfs.co/bevon/name"?: LocaleString[];
}

export interface AlcoholicBeverage extends Beverage {}

export interface FermentedBeverage extends AlcoholicBeverage {}

export interface FermentedBeverage {}

export interface DistilledBeverage extends FermentedBeverage {}

export interface Liqueur extends DistilledBeverage {}

export interface Whisky extends DistilledBeverage {}

export interface AmericanWhiskey extends Whisky {}

export interface BourbonWhiskey extends AmericanWhiskey {}

export interface Bevon_Brandy extends DistilledBeverage {}

export interface Bevon_Cognac extends Bevon_Brandy {}

export interface MixedDrink extends Beverage {}

export interface Cocktail extends MixedDrink, AlcoholicBeverage {
  "http://rdfs.co/bevon/ingredient"?: Bevon_Ingredient[];
}

// mine

export interface Mixin extends Food {
  "http://kb.liquorpicker.com/color"?: string[];
}

export interface LiquidMixin extends Mixin {}

export interface Bitters extends FermentedBeverage {}

export interface AromaticBitters extends Bitters {}

export interface Curaçao extends Liqueur {}

// export const Bourbon: BourbonWhiskey & LiquidMixin = {
//   "@id": "http://kb.liquorpicker.com/Bourbon",
//   "http://www.w3.org/2000/01/rdf-schema#label": [
//     {
//       "@value": "Bourbon",
//       "@language": "en",
//     },
//   ],
//   "http://kb.liquorpicker.com/color": ["8c4707"],
// };

// export const AngosturaBitters: AromaticBitters & LiquidMixin = {
//   "@id": "http://kb.liquorpicker.com/AngosturaBitters",
//   "http://www.w3.org/2000/01/rdf-schema#label": [
//     {
//       "@value": "Angostura Bitters",
//       "@language": "en",
//     },
//   ],
//   "http://kb.liquorpicker.com/color": ["771414"],
// };

// export const Cognac: Bevon_Cognac & LiquidMixin = {
//   "@id": "http://kb.liquorpicker.com/Cognac",
//   "http://www.w3.org/2000/01/rdf-schema#label": [
//     {
//       "@value": "Cognac",
//       "@language": "en",
//     },
//   ],
//   "http://kb.liquorpicker.com/color": ["915318"],
// };

// export const DryCuraçao: Curaçao & LiquidMixin = {
//   "@id": "http://kb.liquorpicker.com/DryCuraçao",
//   "http://www.w3.org/2000/01/rdf-schema#label": [
//     {
//       "@value": "Dry Curaçao",
//       "@language": "en",
//     },
//   ],
//   "http://kb.liquorpicker.com/color": ["f97b04"],
// };

// export const SimpleSyrup: Food & LiquidMixin = {
//   "@id": "http://kb.liquorpicker.com/SimpleSyrup",
//   "http://www.w3.org/2000/01/rdf-schema#label": [
//     {
//       "@value": "Simple syrup",
//       "@language": "en",
//     },
//   ],
//   "http://kb.liquorpicker.com/color": ["f4f4f4"],
// };

// export const LemonTwist: Mixin = {
//   "@id": "http://kb.liquorpicker.com/LemonTwist",
//   "http://www.w3.org/2000/01/rdf-schema#label": [
//     {
//       "@value": "Lemon twist",
//       "@language": "en",
//     },
//   ],
// };

// export const OrangeTwist: Mixin = {
//   "@id": "http://kb.liquorpicker.com/OrangeTwist",
//   "http://www.w3.org/2000/01/rdf-schema#label": [
//     {
//       "@value": "Orange twist",
//       "@language": "en",
//     },
//   ],
// };

// export const FreshLemonJuice: Mixin = {
//   "@id": "http://kb.liquorpicker.com/FreshLemonJuice",
//   "http://www.w3.org/2000/01/rdf-schema#label": [
//     {
//       "@value": "Fresh lemon juice",
//       "@language": "en",
//     },
//   ],
// };

// export const OldFashioned: Cocktail = {
//   "@id": "http://kb.liquorpicker.com/OldFashioned",
//   "http://rdfs.co/bevon/name": [
//     {
//       "@language": "en",
//       "@value": "Old Fashioned",
//     },
//   ],
//   "http://rdfs.co/bevon/ingredient": [
//     {
//       "http://rdfs.co/bevon/food": [Bourbon],
//       "http://rdfs.co/bevon/quantity": [
//         {
//           "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": ["OZA"],
//           "http://purl.org/goodrelations/v1#hasValue": [2],
//         },
//       ],
//     },
//     {
//       "http://rdfs.co/bevon/food": [AngosturaBitters],
//       "http://rdfs.co/bevon/quantity": [
//         {
//           "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": ["dash"],
//           "http://purl.org/goodrelations/v1#hasValue": [2],
//         },
//       ],
//     },
//     {
//       "http://rdfs.co/bevon/food": [SimpleSyrup],
//       "http://rdfs.co/bevon/quantity": [
//         {
//           "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": ["G25"],
//           "http://purl.org/goodrelations/v1#hasValue": [1],
//         },
//       ],
//     },
//     {
//       "http://rdfs.co/bevon/food": [OrangeTwist],
//       "http://rdfs.co/bevon/quantity": 1,
//     },
//     {
//       "http://rdfs.co/bevon/food": [LemonTwist],
//       "http://rdfs.co/bevon/quantity": 1,
//     },
//   ],
// };

// export const SideCar: Cocktail = {
//   "@id": "http://kb.liquorpicker.com/SideCar",
//   "http://rdfs.co/bevon/name": [
//     {
//       "@language": "en",
//       "@value": "Side car",
//     },
//   ],
//   "http://rdfs.co/bevon/ingredient": [
//     {
//       "http://rdfs.co/bevon/food": [Cognac],
//       "http://rdfs.co/bevon/quantity": [
//         {
//           "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": ["OZA"],
//           "http://purl.org/goodrelations/v1#hasValue": [1.5],
//         },
//       ],
//     },
//     {
//       "http://rdfs.co/bevon/food": [DryCuraçao],
//       "http://rdfs.co/bevon/quantity": [
//         {
//           "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": ["OZA"],
//           "http://purl.org/goodrelations/v1#hasValue": [1],
//         },
//       ],
//     },
//     {
//       "http://rdfs.co/bevon/food": [FreshLemonJuice],
//       "http://rdfs.co/bevon/quantity": [
//         {
//           "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": ["OZA"],
//           "http://purl.org/goodrelations/v1#hasValue": [0.75],
//         },
//       ],
//     },
//     {
//       "http://rdfs.co/bevon/food": [OrangeTwist],
//       "http://rdfs.co/bevon/quantity": 1,
//     },
//   ],
// };
