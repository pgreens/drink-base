import { JsonLdString, LocaleString } from "../src/jsonld/jsonld";
import {
  Bevon_Ingredient,
  Cocktail,
  Food,
  Mixin,
  QuantitativeValue,
} from "./types";

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

export interface AppCocktail extends Cocktail {
  "@id": string;
  "http://www.w3.org/2000/01/rdf-schema#label":
    | string
    | LocaleString
    | LocaleString[];
  "http://rdfs.co/bevon/ingredient": AppIngredient[];
}

export function constrainCocktail(
  cocktail: Cocktail
): AppCocktail | ConstraintFailure[] {
  if (!cocktail["@id"]) {
    throw new Error("id is required for a cocktail");
  }
  if (!cocktail["http://www.w3.org/2000/01/rdf-schema#label"]) {
    throw new Error("label is required for Cocktail");
  }
  if (!cocktail["http://rdfs.co/bevon/ingredient"]) {
    throw new Error("ingredient is required for Cocktail");
  }

  const constrainedIngredients =
    cocktail["http://rdfs.co/bevon/ingredient"].map(constrainIngredient);

  const failures = constrainedIngredients.filter(isFailure).flatMap((f) => f);
  if (failures.length > 0) {
    return [
      {
        message: `constraint failure for cocktail ${cocktail["@id"]}`,
      },
      ...failures,
    ];
  } else {
    const label = constrainAppLabel(cocktail);
    if (isFailure(label)) {
      return [
        {
          message: `constraint failure for cocktail ${cocktail["@id"]}`,
        },
        ...label,
      ];
    }
    return {
      "@id": cocktail["@id"],
      "http://www.w3.org/2000/01/rdf-schema#label": label,
      "http://rdfs.co/bevon/ingredient": constrainedIngredients.filter(
        (v): v is AppIngredient => !isFailure(v)
      ),
    };
  }
}

export function constrainIngredient(
  ingredient: Bevon_Ingredient | undefined
): AppIngredient | ConstraintFailure[] {
  if (!ingredient) {
    throw new Error("Ingredient is undefined");
  }
  if (!ingredient["http://rdfs.co/bevon/food"]) {
    throw new Error(`food required. id: ${ingredient["@id"]}`);
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
    return failures(food, quant);
  }

  if (typeof quant !== "number") {
    const constrainedQuant = constrainQuantitativeValue(quant);
    const constrainedFood = constrainIngredientFood(food);

    if (isFailure(constrainedQuant) || isFailure(constrainedFood)) {
      return [
        {
          message: `constraint failure encountered for ingredient ${ingredient["@id"]} / ${ingredient["http://rdfs.co/bevon/food"]}`,
        },
        ...failures(constrainedQuant, constrainedFood),
      ];
    } else {
      return {
        ...ingredient,
        "http://rdfs.co/bevon/food": constrainedFood,
        "http://rdfs.co/bevon/quantity": constrainedQuant,
      };
    }
  } else {
    // duplication
    const constrainedFood = constrainIngredientFood(food);
    if (isFailure(constrainedFood)) {
      return [
        {
          message: `constraint failure encountered for ingredient ${ingredient["@id"]} / ${ingredient["http://rdfs.co/bevon/food"]}`,
        },
        ...failures(constrainedFood),
      ];
    }
    return {
      ...ingredient,
      "http://rdfs.co/bevon/food": constrainedFood,
      "http://rdfs.co/bevon/quantity": quant,
    };
  }
}

export function constrainIngredientFood(
  food: Food
): AppIngredientFood | ConstraintFailure[] {
  if (!food["@id"]) {
    throw new Error("id is required for ingredient food");
  }
  if (!food["http://www.w3.org/2000/01/rdf-schema#label"]) {
    throw new Error(
      `label is required for AppIngredientFood. id: ${food["@id"]}`
    );
  }

  const label = constrainAppLabel(food);

  if (isFailure(label)) {
    return [
      {
        message: `constraint failure for food ${food["@id"]}`,
      },
      ...label,
    ];
  }

  return {
    ...food,
    "@id": food["@id"],
    "http://www.w3.org/2000/01/rdf-schema#label": label,
  };
}

function constrainAppLabel(
  thing: any
): string | LocaleString | LocaleString[] | ConstraintFailure[] {
  if (!thing["http://www.w3.org/2000/01/rdf-schema#label"]) {
    throw new Error("label is required for ingredient thing");
  }
  const label = thing["http://www.w3.org/2000/01/rdf-schema#label"];

  if (typeof label === "string" || isLocaleString(label)) {
    return label;
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

  return langLabel;
}

export function isLocaleString<T>(s: T | LocaleString): s is LocaleString {
  const lang = s as LocaleString;
  return lang["@language"] !== undefined && lang["@value"] !== undefined;
}

export function constrainQuantitativeValue(
  quant: QuantitativeValue
): AppQuantitativeValue | ConstraintFailure[] {
  const presentUnit = present(
    quant["http://purl.org/goodrelations/v1#hasUnitOfMeasurement"],
    "http://purl.org/goodrelations/v1#hasUnitOfMeasurement"
  );
  const presentValue = present(
    quant["http://purl.org/goodrelations/v1#hasValue"],
    "http://purl.org/goodrelations/v1#hasValue"
  );

  if (isFailure(presentUnit) || isFailure(presentValue)) {
    return failures(presentUnit, presentValue);
  }

  const singleUnit = single(
    presentUnit,
    "http://purl.org/goodrelations/v1#hasUnitOfMeasurement"
  );
  const singleValue = single(
    presentValue,
    "http://purl.org/goodrelations/v1#hasValue"
  );

  if (isFailure(singleUnit) || isFailure(singleValue)) {
    return failures(singleUnit, singleValue);
  }
  return {
    "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": singleUnit,
    "http://purl.org/goodrelations/v1#hasValue": singleValue,
  };
}

interface ConstraintFailure {
  message: string;
  property?: string;
}

export function constraintError(
  constraintFailures: ConstraintFailure[]
): never {
  throw new Error(JSON.stringify(constraintFailures));
}

function failures(
  ...values: (any | ConstraintFailure[])[]
): ConstraintFailure[] {
  return values.filter(isFailure).flatMap((f) => f);
}

export function isFailure<T>(
  value: T | ConstraintFailure[]
): value is ConstraintFailure[] {
  return Array.isArray(value) && value.filter(isFailureInternal).length > 0;
}

function isFailureInternal<T>(
  value: T | ConstraintFailure
): value is ConstraintFailure {
  const f = value as ConstraintFailure;
  return (
    f.message !== undefined &&
    f.property !== undefined &&
    Object.keys(f).length === 2
  );
}

function present<T>(
  val: T | null | undefined,
  property: string
): T | ConstraintFailure[] {
  if (val === null || val === undefined) {
    return [
      {
        message: `${property} must be defined`,
        property,
      },
    ] as ConstraintFailure[];
  }
  return val;
}

function single<T>(val: T | T[], property: string): T | ConstraintFailure[] {
  if (Array.isArray(val)) {
    if (val.length !== 1) {
      return [
        {
          message: `${property} must have cardinality of 1 but had ${val.length}`,
          property,
        },
      ] as ConstraintFailure[];
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
): T | ConstraintFailure[] {
  if (Array.isArray(val) && val.length < min) {
    return [
      {
        message: `${property} must have cardinality of at least ${min} but had ${val.length}`,
        property,
      },
    ] as ConstraintFailure[];
  } else {
    return val;
  }
}
