import { JsonLdString, LocaleString } from "../src/jsonld/jsonld";
import { Bevon_Ingredient, Food, Mixin, QuantitativeValue } from "./types";

export interface AppQuantitativeValue extends QuantitativeValue {
  readonly "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": string;
  readonly "http://purl.org/goodrelations/v1#hasValue": number;
}

export interface AppIngredient extends Bevon_Ingredient {
  "http://rdfs.co/bevon/quantity": number | AppQuantitativeValue;
  "http://rdfs.co/bevon/food": AppIngredientFood;
}

export interface AppIngredientFood extends Food, Mixin {
  "@id": string;
  "http://www.w3.org/2000/01/rdf-schema#label":
    | string
    | LocaleString
    | LocaleString[];
}

export function constrainIngredient(
  ingredient: Bevon_Ingredient | undefined
): AppIngredient {
  if (!ingredient) {
    throw new Error("Ingredient is undefined");
  }
  if (!ingredient["http://rdfs.co/bevon/food"]) {
    throw new Error("food required");
  }
  if (!ingredient["http://rdfs.co/bevon/quantity"]) {
    throw new Error("quantity required");
  }
  const food = single(
    ingredient["http://rdfs.co/bevon/food"],
    "http://rdfs.co/bevon/food"
  );
  const quant = single(
    ingredient["http://rdfs.co/bevon/quantity"],
    "http://rdfs.co/bevon/quantity"
  );

  if (isFailure(food) || isFailure(quant)) {
    throw new Error(`constraint failures: ${failures(food, quant)}`);
  }

  if (typeof quant !== "number") {
    return {
      ...ingredient,
      "http://rdfs.co/bevon/food": constrainIngredientFood(food),
      "http://rdfs.co/bevon/quantity": constrainQuantitativeValue(quant),
    };
  } else {
    return {
      ...ingredient,
      "http://rdfs.co/bevon/food": constrainIngredientFood(food),
      "http://rdfs.co/bevon/quantity": quant,
    };
  }
}

export function constrainIngredientFood(food: Food): AppIngredientFood {
  if (!food["@id"]) {
    throw new Error("id is required for ingredient food");
  }
  if (!food["http://www.w3.org/2000/01/rdf-schema#label"]) {
    throw new Error("label is required for ingredient food");
  }
  const label = food["http://www.w3.org/2000/01/rdf-schema#label"];

  if (typeof label === "string") {
    return {
      ...food,
      "@id": food["@id"],
      "http://www.w3.org/2000/01/rdf-schema#label": label,
    };
  }

  if (isLocaleString(label)) {
    return {
      ...food,
      "@id": food["@id"],
      "http://www.w3.org/2000/01/rdf-schema#label": label,
    };
  }

  if (
    label.find((l: string | LocaleString) => typeof l === "string") !==
    undefined
  ) {
    throw new Error(
      "Only one label allowed when not specifying a language. You cannot mix plain string labels with language tagged strings."
    );
  }

  const langLabel = minCardinality(
    label,
    "http://www.w3.org/2000/01/rdf-schema#label",
    1
  ) as LocaleString[]; // we know the array does not contain strings
  if (isFailure(langLabel)) {
    throw new Error(`constraint failure: ${failures(langLabel)}`);
  }

  return {
    ...food,
    "@id": food["@id"],
    "http://www.w3.org/2000/01/rdf-schema#label": langLabel,
  };
}

export function isLocaleString<T>(s: T | LocaleString): s is LocaleString {
  const lang = s as LocaleString;
  return lang["@language"] !== undefined && lang["@value"] !== undefined;
}

export function constrainQuantitativeValue(
  quant: QuantitativeValue
): AppQuantitativeValue {
  if (!quant["http://purl.org/goodrelations/v1#hasUnitOfMeasurement"]) {
    throw new Error("hasUnitOfMeasurement required");
  }
  if (!quant["http://purl.org/goodrelations/v1#hasValue"]) {
    throw new Error("hasValue required");
  }
  const unit = single(
    quant["http://purl.org/goodrelations/v1#hasUnitOfMeasurement"],
    "http://purl.org/goodrelations/v1#hasUnitOfMeasurement"
  );
  const value = single(
    quant["http://purl.org/goodrelations/v1#hasValue"],
    "http://purl.org/goodrelations/v1#hasValue"
  );

  if (isFailure(unit) || isFailure(value)) {
    throw new Error(`constraint failures: ${failures(unit, value)}`);
  }
  return {
    "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": unit,
    "http://purl.org/goodrelations/v1#hasValue": value,
  };
}

interface ConstraintFailure {
  message: string;
  property?: string;
}

function failures(...values: (any | ConstraintFailure)[]): string {
  return JSON.stringify(values.filter(isFailure));
}

function isFailure<T>(
  value: T | ConstraintFailure
): value is ConstraintFailure {
  const f = value as ConstraintFailure;
  return (
    f.message !== undefined &&
    f.property !== undefined &&
    Object.keys(f).length === 2
  );
}

function single<T>(val: T | T[], property: string): T | ConstraintFailure {
  if (Array.isArray(val)) {
    if (val.length !== 1) {
      return {
        message: `${property} must have cardinality of 1 but had ${val.length}`,
        property,
      } as ConstraintFailure;
    } else {
      return val[0];
    }
  } else {
    return val;
  }
}

function minCardinality<T>(
  val: T,
  property: string,
  min: number
): T | ConstraintFailure {
  if (Array.isArray(val) && val.length < min) {
    return {
      message: `${property} must have cardinality of at least ${min} but had ${val.length}`,
      property,
    } as ConstraintFailure;
  } else {
    return val;
  }
}
