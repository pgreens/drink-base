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
  const [searchText, setSearchText] = React.useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <section className="Ingredients">
      <label className="ingredient-search-label" htmlFor="ingredient-search">
        Search ingredients
      </label>
      <input
        id="ingredient-search"
        type="text"
        placeholder="search ingredients"
        onChange={handleSearchChange}
        value={searchText}
      />
      <ul>
        {ingredients
          .filter((i) =>
            displayNameForFood(i["http://rdfs.co/bevon/food"], "en")
              .toUpperCase()
              .includes(searchText.toUpperCase())
          )
          .map((i) => (
            <li key={i["http://rdfs.co/bevon/food"]["@id"]}>
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
            </li>
          ))}
      </ul>
      <div className="ingredient-options-list__overlay" />
    </section>
  );
}
