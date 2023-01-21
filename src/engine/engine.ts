import { AppIngredient, constrainIngredient } from "../../ontology/constraints";
import { Cocktail, OldFashioned, SideCar } from "../../ontology/types";
import { Glass } from "../glass";
import { JsonLdObject } from "../jsonld/jsonld";
import { convert } from "../quantity";

interface VectorWrapper {
  "@id": string;
  v: DrinkVector;
}

interface DrinkVector {
  readonly [key: string]: number;
}

export function match(glass: Glass, doc: JsonLdObject[]): [string, number] {
  const space: VectorWrapper[] = buildSpace(doc);
  console.log("drink space", space);
  const drink = magnitudeOne(vectorOf(glass.contents));

  const distances = space
    .map(({ "@id": id, v }) => [id, distance(drink, v)] as [string, number])
    .sort(([id1, dist1], [id2, dist2]) => dist1 - dist2);

  return distances[0];
}

export function buildSpace(doc: JsonLdObject[]): VectorWrapper[] {
  const drinks: Cocktail[] = [OldFashioned, SideCar];
  return drinks.map((drink) => {
    if (!drink["http://rdfs.co/bevon/ingredient"]) {
      throw new Error("Ingredients are required!");
    }
    const appIngredients =
      drink["http://rdfs.co/bevon/ingredient"].map(constrainIngredient);
    return {
      "@id": drink["@id"] || "",
      v: magnitudeOne(vectorOf(appIngredients)),
    };
  });
}

function vectorOf(ingredients: AppIngredient[]): DrinkVector {
  return ingredients.reduce((v: DrinkVector, ingredient) => {
    const dimension = ingredient["http://rdfs.co/bevon/food"]["@id"];
    const position = normalizedQuantity(ingredient);
    return {
      ...v,
      [dimension]: position,
    };
  }, {});
}

function magnitudeOne(v: DrinkVector): DrinkVector {
  const magnitude = Math.sqrt(
    Object.keys(v).reduce((total, key) => {
      return total + v[key] * v[key];
    }, 0)
  );
  return Object.keys(v).reduce((newV, key) => {
    newV[key] = v[key] / magnitude;
    return newV;
  }, {});
}

function normalizedQuantity(ingredient: AppIngredient): number {
  const { "http://rdfs.co/bevon/quantity": q } = ingredient;

  if (typeof q === "number") {
    return q;
  }
  return convert(q, "MLT")["http://purl.org/goodrelations/v1#hasValue"];
}

function distance(d1: DrinkVector, d2: DrinkVector): number {
  const allFoods = union(Object.keys(d1), Object.keys(d2));
  return Math.sqrt(
    allFoods.reduce((sum: number, id) => {
      const food1 = d1[id] || 0;
      const food2 = d2[id] || 0;
      return sum + Math.pow(food1 - food2, 2);
    }, 0)
  );
}

function union<T>(a: T[], b: T[]): T[] {
  // not the most efficient, but these will be small sets
  return [...a, ...b].reduce((full: T[], element) => {
    if (!full.includes(element)) {
      full.push(element);
    }
    return full;
  }, []);
}
