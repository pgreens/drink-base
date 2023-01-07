import React from "react";
import Ingredients, { Ingredient } from "./components/Ingredients";
import * as ingredients from "./ingredients.json";

export function App(): JSX.Element {

  return (
    <>
      <h1>Pick some options! 🍷🍹🍸🥂</h1>
      <Ingredients ingredients={ingredients}/>
    </>
  );
}
