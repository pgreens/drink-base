import React from "react";
import { AppCocktail } from "../../ontology/constraints";
import { Glass } from "../glass";
import { displayNameForIngredient } from "../ingredients";

export default function Recipe({ cocktail }: { cocktail: AppCocktail }) {
  return (
    <section className="Recipe">
      <ul>
        {[...cocktail["http://rdfs.co/bevon/ingredient"]]
          .reverse()
          .map((ingredient, index) => (
            // can't use ingredient id here, because you could have doubles
            // should give these their own ids
            <li key={ingredient["http://rdfs.co/bevon/food"]["@id"]}>
              {displayNameForIngredient(ingredient, "en")}
            </li>
          ))}
      </ul>
    </section>
  );
}
