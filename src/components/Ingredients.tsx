import React from "react";
import { AppIngredient } from "../../ontology/constraints";
import { displayNameForFood } from "../jsonld/food";

export interface OnAddIngredientEventHandler {
  (ingredient: AppIngredient): any;
}
export default function Ingredients({
  ingredients,
  onAddIngredientHandler,
}: {
  ingredients: AppIngredient[];
  onAddIngredientHandler: OnAddIngredientEventHandler;
}) {
  return (
    <ul>
      {ingredients.map((i) => (
        <li key={i["http://rdfs.co/bevon/food"]["@id"]}>
          <button onClick={(event) => onAddIngredientHandler(i)}>
            {displayNameForFood(i["http://rdfs.co/bevon/food"], "en")}
          </button>
        </li>
      ))}
    </ul>
  );
}
