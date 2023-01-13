import React from "react";
import Ingredients from "./components/Ingredients";
import { addIngredient, Glass } from "./glass";
// import * as foods from "./food.json";
import * as ontology from "../ontology/ontology.json";
import { defaultIngredients } from "./ingredients";
import GlassText from "./components/GlassText";
// import GlassWebGL from "./components/GlassWebGL";
import Glass3D from "./components/Glass3D";
import { isAnIndiviaulOfType } from "./jsonld/types";
import { Food } from "./jsonld/food";

const foods = ontology.filter((thing) =>
  isAnIndiviaulOfType(thing, "http://kb.liquorpicker.com/Mixin", ontology)
);
console.log("food", foods);
const ingredients = defaultIngredients(foods as Food[]);

export function App(): JSX.Element {
  const [glass, setGlass] = React.useState({
    contents: [],
  } as Glass);

  return (
    <>
      <h1>Pick some options! 🍷🍹🍸🥂</h1>
      <Ingredients
        ingredients={ingredients}
        onAddIngredientHandler={(ingredient) =>
          setGlass((curr) => addIngredient(curr, ingredient))
        }
      />
      {/* <GlassWebGL glass={glass} /> */}
      <Glass3D glass={glass} />
      <GlassText glass={glass} />
    </>
  );
}
