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
