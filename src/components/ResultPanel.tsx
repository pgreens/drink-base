import React from "react";
import { AppCocktail } from "../../ontology/constraints";
import { fromCocktail, Glass } from "../glass";
import { displayNameFor, JsonLdObject } from "../jsonld/jsonld";
import { Optional } from "../optional";
import Glass3D from "./Glass3D";
import Glass3D2 from "./Glass3D2";
import Recipe from "./Recipe";

export interface Result {
  cocktail: AppCocktail;
  distance: number;
}

export default function ResultPanel({
  result,
  userDrink,
  ontology,
  onClose,
}: {
  result: Optional<Result>;
  userDrink: Glass;
  ontology: JsonLdObject[];
  onClose: any;
}): JSX.Element {
  if (!result.isPresent) {
    return (
      <div id="results" className="ResultPanel ResultPanel--not-active">
        Results will appear here when you mix a drink.
      </div>
    );
  }

  const cocktailName = displayNameFor(result.value.cocktail, "en");

  return (
    <>
      <div className="ResultPanel-backing-overlay" onClick={onClose} />
      <div id="results" className="ResultPanel">
        <h1 className="ResultPanel__sr-heading">Results</h1>
        <div className="ResultPanel__result-text">
          {description(result.value.distance)} {aOrAn(cocktailName)}
          <div className="ResultPanel__result-cocktail-name">
            {cocktailName}
          </div>
        </div>
        <div className="ResultPanel__recipe">
          <Glass3D2
            glass={fromCocktail(result.value.cocktail)}
            backgroundColor="#313138"
            describedById="fake!"
            ontology={ontology}
          />
          <Recipe cocktail={result.value.cocktail} />
        </div>
        <button className="ResultPanel__close-button" onClick={onClose}>close</button>
      </div>
    </>
  );
}

function description(distance: number) {
  if (distance < 0.03) {
    return "You made";
  } else if (distance < 0.2) {
    return "You made something close to";
  } else if (distance < 0.3) {
    return "You made something that could be called";
  } else {
    return "We're not sure! The closest thing we found is";
  }
}

function aOrAn(englishNoun: string): string {
  const anLetters = ["a", "e", "i", "o", "u", "h"];
  if (
    englishNoun &&
    englishNoun.length >= 1 &&
    anLetters.includes(englishNoun.substring(0, 1).toLowerCase())
  ) {
    return "an";
  }
  return "a";
}
