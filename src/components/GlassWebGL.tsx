import React from "react";
import { Glass } from "../glass";
import { displayNameForIngredient } from "../ingredients";

export default function GlassWebGL({ glass }: { glass: Glass }) {
  return (
    <section>
      <h2>In your glass</h2>
      <ol>
        {glass.contents.map((ingredient, index) => (
          // can't use ingredient id here, because you could have doubles
          // should give these their own ids
          <li key={index}>{displayNameForIngredient(ingredient, "en")}</li>
        ))}
      </ol>
    </section>
  );
}
