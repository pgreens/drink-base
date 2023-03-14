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
  AppCocktail,
  AppIngredient,
  AppIngredientFood,
  constrainIngredientFood,
  constraintError,
  isFailure,
} from "../ontology/constraints";
import { Unit } from "./quantity";
import { displayNameForFood } from "./jsonld/food";
import { cocktailById } from "./jsonld/cocktails";
import ResultPanel, { Result } from "./components/ResultPanel";
import { empty, Optional } from "./optional";

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
  const [result, setResult] = React.useState(empty<Result>());

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
    const def = cocktailById(id, ontology);
    if (!def) {
      throw new Error(`no definition found for ${id}`);
    }
    console.log("match", def, "distance:", dist);
    setResult({
      isPresent: true,
      value: { cocktail: def, distance: dist },
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
        <Glass3D
          glass={glass}
          describedById="text-description"
          ontology={ontology}
        />
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
      <div className="glass-actions">
        <button id="dump-button" onClick={reset}>
          ↺
        </button>
        <button id="mix-button" onClick={onMix}>
          mix it →
        </button>
      </div>
      <ResultPanel
        result={result}
        userDrink={glass}
        ontology={ontology}
        onClose={() => setResult(empty())}
      />
    </>
  );
}
