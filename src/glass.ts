import { Ingredient } from "./ingredients";
import { Food } from "./jsonld/food";
import { equal } from "./jsonld/jsonld";
import { add, QuantitativeValue, toString } from "./quantity";

export interface Glass {
  readonly contents: Ingredient[];
}

export function addIngredient(glass: Glass, ingredient: Ingredient): Glass {
  const index = glass.contents.findIndex(({ food }) =>
    equal(food, ingredient.food)
  );
  if (index >= 0) {
    const newIngredient: Ingredient = {
      food: ingredient.food,
      quantity: newQuant(glass.contents[index], ingredient),
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

export function displayQuantity(quantity: number | QuantitativeValue): string {
  if (typeof quantity === "number") {
    return String(quantity);
  }
  return toString(quantity);
}

function newQuant(i1: Ingredient, i2: Ingredient): number | QuantitativeValue {
  if (typeof i1.quantity === "number" && typeof i2.quantity === "number") {
    return i1.quantity + i2.quantity;
  }
  if (typeof i1.quantity === "object" && typeof i2.quantity === "object") {
    return add(i1.quantity, i2.quantity);
  }
  throw new Error("Incompatible quantities for addition");
}
