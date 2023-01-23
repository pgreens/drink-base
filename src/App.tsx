import React from "react";
import Ingredients from "./components/Ingredients";
import { addIngredient, Glass } from "./glass";
import * as ontology from "../ontology/ontology.json";
import { defaultIngredients } from "./ingredients";
import GlassText from "./components/GlassText";
import Glass3D from "./components/Glass3D";
import { isAnIndividualOfType } from "./jsonld/types";
import { match } from "./engine/engine";
import { Food } from "../ontology/types";
import "./App.css";
import { displayNameFor } from "./jsonld/jsonld";

const foods = ontology.filter((thing) =>
  isAnIndividualOfType(thing, "http://kb.liquorpicker.com/Mixin", ontology)
);
const ingredients = defaultIngredients(foods as Food[]);

type Optional<T> =
  | {
      isPresent: false;
    }
  | {
      isPresent: true;
      value: T;
    };
function empty<T>(): Optional<T> {
  return {
    isPresent: false,
  };
}

export function App(): JSX.Element {
  const [glass, setGlass] = React.useState({
    contents: [],
  } as Glass);
  const [result, setResult] = React.useState(empty<[string, number]>());

  const onMix = () => {
    const [id, dist] = match(glass, ontology);
    const def = ontology.find((thing) => thing["@id"] === id);
    if (!def) {
      throw new Error(`no definition found for ${id}`);
    }
    console.log("match", def);
    setResult({
      isPresent: true,
      value: [displayNameFor(def, "en"), dist],
    });
  };

  const reset = () => {
    setGlass({ contents: [] });
    setResult(empty());
  };

  return (
    <>
      <h1>cocktail</h1>
      <Glass3D glass={glass} />
      <Ingredients
        ingredients={ingredients}
        onAddIngredientHandler={(ingredient) =>
          setGlass((curr) => addIngredient(curr, ingredient))
        }
      />
      {result.isPresent ? (
        <div className="glass-actions">
          <button id="dump-button" onClick={reset}>
            ↺
          </button>
          <div className="result">
            {description(result.value[1])} {aOrAn(result.value[0])}{" "}
            {result.value[0]}
          </div>
        </div>
      ) : (
        <div className="glass-actions">
          <button id="dump-button" onClick={reset}>
            ↺
          </button>
          <button id="mix-button" onClick={onMix}>
            mix it →
          </button>
        </div>
      )}
      {/* <GlassText glass={glass} /> */}
    </>
  );
}

function description(distance: number) {
  if (distance < 0.01) {
    return "This is";
  } else if (distance < 0.2) {
    return "This is close to";
  } else if (distance < 0.3) {
    return "Could be called";
  } else {
    return "Hmm... maybe";
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
