import { displayQuantity } from "./glass";
import { displayNameForFood, Food } from "./jsonld/food";
import { isA } from "./jsonld/types";
import { QuantitativeValue } from "./quantity";
import * as full from '../ontology/ontology.json';

export interface Ingredient {
  readonly food: Food;
  readonly quantity: number | QuantitativeValue;
}

export function defaultIngredients(food: Food[]): Ingredient[] {
  return food.map((f) => {
    if (isA(f, "http://kb.liquorpicker.com/Bitters", full)) {
      return {
        food: f,
        quantity: {
          hasUnitOfMeasurement: "dash",
          hasValue: 1,
        },
      };
    }
    if (isA(f, "http://rdfs.co/bevon/Beverage", full)) {
      return {
        food: f,
        quantity: {
          hasUnitOfMeasurement: "OZA",
          hasValue: 0.25,
        },
      };
    }
    return {
      food: f,
      quantity: 1,
    };
  });
}

export function displayNameForIngredient(i: Ingredient, lang: string): string {
  return `${displayQuantity(i.quantity)} ${displayNameForFood(i.food, lang)}`;
}