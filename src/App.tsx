import React from "react";
import Ingredients from "./components/Ingredients";
import { addIngredient, Glass } from "./glass";
import * as ontology from "../dist/ontology/ontology.json";
import { defaultIngredients } from "./ingredients";
import GlassText from "./components/GlassText";
import Glass3D from "./components/Glass3D";
import { isAnIndividualOfType } from "./jsonld/types";
import { match } from "./engine/engine";
import { Food } from "../ontology/types";
import "./sanitize.css";
import "./App.css";
import { displayNameFor } from "./jsonld/jsonld";
import {
  AppIngredient,
  AppIngredientFood,
  constrainIngredientFood,
  constraintError,
  isFailure,
} from "../ontology/constraints";
import { Unit } from "./quantity";
import { displayNameForFood } from "./jsonld/food";

const foods = ontology
  .filter((thing) =>
    isAnIndividualOfType(thing, "http://kb.liquorpicker.com/Mixin", ontology)
  )
  .map((f) => {
    const constrained = constrainIngredientFood(f);
    if (isFailure(constrained)) {
      constraintError(constrained);
    }
    return f as AppIngredientFood;
  })
  .sort((a: AppIngredientFood, b: AppIngredientFood) => {
    const aLabel = displayNameForFood(a, "en");
    const bLabel = displayNameForFood(b, "en");
    if (aLabel > bLabel) {
      return 1;
    } else if (aLabel < bLabel) {
      return -1;
    } else {
      return 0;
    }
  });

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

function nextUnit(unit: string): Unit {
  const us: [string, string][] = Object.entries(Unit);
  const curr = us.findIndex(([_key, value]) => value === unit);
  return Unit[us[(curr + 1) % us.length][0]] as Unit;
}

export function App(): JSX.Element {
  const [glass, setGlass] = React.useState({
    contents: [],
  } as Glass);
  const [ingredients, setIngredients] = React.useState(
    defaultIngredients(foods as Food[])
  );
  const [result, setResult] = React.useState(empty<[string, number]>());

  const switchUnit = (ingredient: AppIngredient) => {
    setIngredients((curr: AppIngredient[]) => {
      if (typeof ingredient["http://rdfs.co/bevon/quantity"] === "number") {
        return curr;
      }
      const newIngredient: AppIngredient = {
        ...ingredient,
        "http://rdfs.co/bevon/quantity": {
          ...ingredient["http://rdfs.co/bevon/quantity"],
          "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": nextUnit(
            ingredient["http://rdfs.co/bevon/quantity"][
              "http://purl.org/goodrelations/v1#hasUnitOfMeasurement"
            ]
          ),
        },
      };
      curr.splice(curr.indexOf(ingredient), 1, newIngredient);
      return [...curr];
    });
  };
  const onMix = () => {
    const [id, dist] = match(glass, ontology);
    const def = ontology.find((thing) => thing["@id"] === id);
    if (!def) {
      throw new Error(`no definition found for ${id}`);
    }
    console.log("match", def, "distance:", dist);
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
      <figure>
        <Glass3D glass={glass} describedById="text-description" />
        <figcaption id="text-description">
          <GlassText glass={glass} />
        </figcaption>
      </figure>
      <Ingredients
        ingredients={ingredients}
        onAddIngredientHandler={(ingredient) =>
          setGlass((curr) => addIngredient(curr, ingredient))
        }
        switchUnit={switchUnit}
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
  if (distance < 0.03) {
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
