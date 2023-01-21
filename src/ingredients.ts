import { displayQuantity } from "./glass";
import { displayNameForFood } from "./jsonld/food";
import { isA } from "./jsonld/types";
// import { QuantitativeValue } from "./quantity";
import * as full from "../ontology/ontology.json";
import {
  AppIngredient,
  constrainIngredient,
  constrainIngredientFood,
} from "../ontology/constraints";
import { Food, QuantitativeValue } from "../ontology/types";

// export interface Ingredient {
//   readonly "http://rdfs.co/bevon/food": Food;
//   readonly "http://rdfs.co/bevon/quantity": number | QuantitativeValue;
// }

export function defaultIngredients(food: Food[]): AppIngredient[] {
  return food.map((f) => {
    const consF = constrainIngredientFood(f);
    if (isA(f, "http://kb.liquorpicker.com/Bitters", full)) {
      return {
        "http://rdfs.co/bevon/food": consF,
        "http://rdfs.co/bevon/quantity": {
          "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": "dash",
          "http://purl.org/goodrelations/v1#hasValue": 1,
        }, //as QuantitativeValue,
      };
    }
    if (isA(f, "http://kb.liquorpicker.com/Syrup", full)) {
      return {
        "http://rdfs.co/bevon/food": consF,
        "http://rdfs.co/bevon/quantity": {
          "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": "G25",
          "http://purl.org/goodrelations/v1#hasValue": 1,
        },
      };
    }
    if (isA(f, "http://kb.liquorpicker.com/LiquidMixin", full)) {
      return {
        "http://rdfs.co/bevon/food": consF,
        "http://rdfs.co/bevon/quantity": {
          "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": "OZA",
          "http://purl.org/goodrelations/v1#hasValue": 0.25,
        },
      };
    }
    return {
      "http://rdfs.co/bevon/food": consF,
      "http://rdfs.co/bevon/quantity": 1,
    };
  });
}

export function displayNameForIngredient(
  i: AppIngredient,
  lang: string
): string {
  return `${displayQuantity(
    i["http://rdfs.co/bevon/quantity"]
  )} ${displayNameForFood(i["http://rdfs.co/bevon/food"], lang)}`;
}
