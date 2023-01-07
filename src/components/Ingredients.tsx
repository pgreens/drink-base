import React from "react";
import {
  displayNameFor,
  JsonLdObject,
  JsonLdString,
  stringFrom,
} from "../jsonld";

export interface Ingredient extends JsonLdObject {
  "http://rdfs.co/bevon/name"?: JsonLdString;
}

export default function Ingredients({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  return (
    <ul>
      {ingredients.map((i) => (
        <li key={i["@id"]}>{displayNameForIngredient(i, "en")}</li>
      ))}
    </ul>
  );
}

function displayNameForIngredient(o: Ingredient, lang: string): string {
  if (o["http://rdfs.co/bevon/name"]) {
    return stringFrom(o["http://rdfs.co/bevon/name"], lang);
  }
  return displayNameFor(o, lang);
}
