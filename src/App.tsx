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

const foods = ontology.filter((thing) =>
  isAnIndividualOfType(thing, "http://kb.liquorpicker.com/Mixin", ontology)
);
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
      <h1>cocktail</h1>
      <Glass3D glass={glass} />
      <Ingredients
        ingredients={ingredients}
        onAddIngredientHandler={(ingredient) =>
          setGlass((curr) => addIngredient(curr, ingredient))
        }
      />
      <div style={{}}>
        <button onClick={() => setGlass({ contents: [] })}>Dump</button>
        <button onClick={onMix}>Mis &gt;</button>
      </div>
      <GlassText glass={glass} />
    </>
  );
}
