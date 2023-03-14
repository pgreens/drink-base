import {
  AppCocktail,
  AppIngredient,
  AppQuantitativeValue,
} from "../ontology/constraints";
import { add, toString } from "./quantity";

export interface Glass {
  readonly contents: AppIngredient[];
}

export function fromCocktail(cocktail: AppCocktail): Glass {
  return {
    contents: cocktail["http://rdfs.co/bevon/ingredient"],
  };
}

export function addIngredient(glass: Glass, ingredient: AppIngredient): Glass {
  const index = glass.contents.findIndex(
    ({ "http://rdfs.co/bevon/food": food }) =>
      food["@id"] === ingredient["http://rdfs.co/bevon/food"]["@id"]
  );
  if (index >= 0) {
    const newIngredient: AppIngredient = {
      "http://rdfs.co/bevon/food": ingredient["http://rdfs.co/bevon/food"],
      "http://rdfs.co/bevon/quantity": newQuant(
        glass.contents[index],
        ingredient
      ),
    };
    return {
      contents: [
        ...glass.contents.slice(0, index),
        newIngredient,
        ...glass.contents.slice(index + 1),
      ],
    };
  }

  return {
    contents: [...glass.contents, ingredient],
  };
}

export function totalQuantity(glass: Glass): AppQuantitativeValue {
  return glass.contents
    .filter(
      (ingredient) =>
        typeof ingredient["http://rdfs.co/bevon/quantity"] !== "number"
    )
    .reduce(
      (total, ingredient) => {
        if (typeof ingredient["http://rdfs.co/bevon/quantity"] !== "number") {
          return add(ingredient["http://rdfs.co/bevon/quantity"], total);
        }
        return total;
      },
      {
        "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": "OZA",
        "http://purl.org/goodrelations/v1#hasValue": 0,
      } as AppQuantitativeValue
    );
}

export function displayQuantity(
  quantity: number | AppQuantitativeValue
): string {
  if (typeof quantity === "number") {
    return String(quantity);
  }
  return toString(quantity);
}

function newQuant(
  i1: AppIngredient,
  i2: AppIngredient
): number | AppQuantitativeValue {
  if (
    typeof i1["http://rdfs.co/bevon/quantity"] === "number" &&
    typeof i2["http://rdfs.co/bevon/quantity"] === "number"
  ) {
    return (
      i1["http://rdfs.co/bevon/quantity"] + i2["http://rdfs.co/bevon/quantity"]
    );
  }
  if (
    typeof i1["http://rdfs.co/bevon/quantity"] === "object" &&
    typeof i2["http://rdfs.co/bevon/quantity"] === "object"
  ) {
    return add(
      i1["http://rdfs.co/bevon/quantity"],
      i2["http://rdfs.co/bevon/quantity"]
    );
  }
  throw new Error("Incompatible quantities for addition");
}
