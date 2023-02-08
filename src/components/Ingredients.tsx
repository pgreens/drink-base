import React from "react";
import { AppIngredient } from "../../ontology/constraints";
import { displayNameForFood } from "../jsonld/food";
import { unitName } from "../quantity";

export interface OnAddIngredientEventHandler {
  (ingredient: AppIngredient): any;
}
export interface SwitchUnitHandler {
  (ingredient: AppIngredient): any;
}
export default function Ingredients({
  ingredients,
  onAddIngredientHandler,
  switchUnit,
}: {
  ingredients: AppIngredient[];
  onAddIngredientHandler: OnAddIngredientEventHandler;
  switchUnit: SwitchUnitHandler;
}) {
  return (
    <ul className="ingredient-options-list">
      {ingredients.map((i) => (
        <li
          style={{ marginBottom: 5 }}
          key={i["http://rdfs.co/bevon/food"]["@id"]}
        >
          <div>
            <button
              className="ingredient-button"
              onClick={(event) => onAddIngredientHandler(i)}
            >
              {displayNameForFood(i["http://rdfs.co/bevon/food"], "en")}
            </button>
            <button
              className="ingredient-unit-button"
              onClick={() => switchUnit(i)}
            >
              {typeof i["http://rdfs.co/bevon/quantity"] === "number"
                ? "n/a"
                : unitName(
                    i["http://rdfs.co/bevon/quantity"][
                      "http://purl.org/goodrelations/v1#hasUnitOfMeasurement"
                    ]
                  )}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
