import React from "react";
import { Ingredient } from "../ingredients";
import { displayNameForFood } from "../jsonld/food";

export interface OnAddIngredientEventHandler {
  (ingredient: Ingredient): any;
}
export default function Ingredients({
  ingredients,
  onAddIngredientHandler,
}: {
  ingredients: Ingredient[];
  onAddIngredientHandler: OnAddIngredientEventHandler;
}) {
  return (
    <ul>
      {ingredients.map((i) => (
        <li key={i.food["@id"]}>
          <button onClick={(event) => onAddIngredientHandler(i)}>
            {displayNameForFood(i.food, "en")}
          </button>
        </li>
      ))}
    </ul>
  );
}
