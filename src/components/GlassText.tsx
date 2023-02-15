import React from "react";
import { Glass } from "../glass";
import { displayNameForIngredient } from "../ingredients";

export default function GlassText({ glass }: { glass: Glass }) {
  return (
    <>
      A graphical representation of the following ingredients, stacked in
      layers:
      <ol>
        {[...glass.contents].reverse().map((ingredient, index) => (
          // can't use ingredient id here, because you could have doubles
          // should give these their own ids
          <li key={index}>{displayNameForIngredient(ingredient, "en")}</li>
        ))}
      </ol>
    </>
  );
}
