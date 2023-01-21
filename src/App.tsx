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

const foods = ontology.filter((thing) =>
  isAnIndividualOfType(thing, "http://kb.liquorpicker.com/Mixin", ontology)
);
console.log("food", foods);
const ingredients = defaultIngredients(foods as Food[]);

export function App(): JSX.Element {
  const [glass, setGlass] = React.useState({
    contents: [],
  } as Glass);

  const onMix = () => {
    const m = match(glass, ontology);
    console.log("match", m);
  };

  return (
    <>
      <h1>Pick some options! 🍷🍹🍸🥂</h1>
      <Ingredients
        ingredients={ingredients}
        onAddIngredientHandler={(ingredient) =>
          setGlass((curr) => addIngredient(curr, ingredient))
        }
      />
      <Glass3D glass={glass} />
      <GlassText glass={glass} />
      <button onClick={onMix}>MIX</button>
      <button onClick={() => setGlass({ contents: [] })}>Dump glass</button>
    </>
  );
}
