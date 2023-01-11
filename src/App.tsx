import React from "react";
import Ingredients from "./components/Ingredients";
import { addIngredient, Glass } from "./glass";
import * as foods from "./food.json";
import { defaultIngredients } from "./ingredients";
import GlassText from "./components/GlassText";
import GlassWebGL from "./components/GlassWebGL";

const ingredients = defaultIngredients(foods);

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
      <GlassText glass={glass} />
      <GlassWebGL glass={glass} />
    </>
  );
}
