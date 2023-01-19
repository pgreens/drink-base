import { frame, NodeObject } from "jsonld";
import { AppIngredient, constrainIngredient } from "../../ontology/constraints";
import { Cocktail, OldFashioned, SideCar } from "../../ontology/types";
import { Glass } from "../glass";
// import { Ingredient } from "../ingredients";
import { JsonLdObject, JsonLdRef } from "../jsonld/jsonld";
import { isAnIndividualOfType } from "../jsonld/types";
import { convert } from "../quantity";

// interface Cocktail extends JsonLdObject {
//   "http://rdfs.co/bevon/name": string;
//   "http://rdfs.co/bevon/description"?: string;
//   "http://rdfs.co/bevon/ingredient": Ingredient[];
// }

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
  // need to frame the doc around the cocktail first
  // or build a util to resolve references...
  // const drinks = doc.filter((thing) =>
  //   isAnIndividualOfType(thing, "http://rdfs.co/bevon/Cocktail", doc)
  // ) as Cocktail[];
  // console.log("cocktails", drinks);
  // return drinks.map((drink) => {
  //   const ingredients = drink["http://rdfs.co/bevon/ingredient"].map(
  //     (ingNode) => resolveIngredient(ingNode, doc)
  //   );
  //   console.log("resolved", ingredients);
  //   return {
  //     "@id": drink["@id"],
  //     v: magnitudeOne(vectorOf(ingredients)),
  //   };
  // });
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

// this is an ugly solution for now
// function resolveIngredient(node: any, doc: JsonLdObject[]): Ingredient {
//   if (!node["@id"]) {
//     return node as Ingredient;
//   }
//   // const ingredient = frame(require("../../ontology"), {"@id": node["@id"]});

//   const ingredient = doc.find((thing) => thing["@id"] === node["@id"]) as
//     | Ingredient
//     | undefined;
//   if (!ingredient) {
//     throw new Error(`unable to resolve ingredient id ${node["@id"]}`);
//   }
//   console.log("found ingredient", ingredient);
//   if (typeof ingredient["http://rdfs.co/bevon/quantity"] !== "number") {
//     let quantNode;
//     if ((ingredient["http://rdfs.co/bevon/quantity"] as any).length) {
//       quantNode = ingredient["http://rdfs.co/bevon/quantity"][0];
//     } else {
//       quantNode = ingredient["http://rdfs.co/bevon/quantity"];
//     }

//     let quant;
//     if (quantNode["@id"]) {
//       // this is too messy
//       // quantity is coming in as an array with one reference node!
//       const qRef = quantNode as JsonLdRef;
//       quant = doc.find((thing) => thing["@id"] === qRef["@id"]) as
//         | QuantitativeValue
//         | undefined;

//       if (!quant) {
//         throw new Error(`quantity not found ${qRef["@id"]}`);
//       }
//     } else {
//       quant = quantNode;
//     }

//     if (
//       typeof quant["http://purl.org/goodrelations/v1#hasValue"] === "object"
//     ) {
//       return {
//         ...ingredient,
//         "http://rdfs.co/bevon/quantity": {
//           ...quant,
//           "http://purl.org/goodrelations/v1#hasValue": parseFloat(
//             quant["http://purl.org/goodrelations/v1#hasValue"]["@value"]
//           ),
//         },
//       };
//     } else {
//       return {
//         ...ingredient,
//         "http://rdfs.co/bevon/quantity": quant,
//       };
//     }
//   }
//   return ingredient;
// }

// function vectorOf(ingredients: Ingredient[]): DrinkVector {
//   return ingredients.reduce((v: DrinkVector, ingredient) => {
//     console.log("Ing", ingredient);
//     const dimension = ingredient["http://rdfs.co/bevon/food"]["@id"];
//     const position = normalizedQuantity(ingredient);
//     // v[dimension] = position;
//     return {
//       ...v,
//       [dimension]: position,
//     };
//   }, {});
// }

function vectorOf(ingredients: AppIngredient[]): DrinkVector {
  return ingredients.reduce((v: DrinkVector, ingredient) => {
    console.log("Ing", ingredient);
    const dimension = ingredient["http://rdfs.co/bevon/food"]["@id"];
    const position = normalizedQuantity(ingredient);
    return {
      ...v,
      [dimension]: position,
    };
  }, {});
}

function magnitudeOne(v: DrinkVector): DrinkVector {
  console.log(v);
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

// function normalizedQuantity(ingredient: Ingredient): number {
//   if (typeof ingredient["http://rdfs.co/bevon/quantity"] === "number") {
//     return ingredient["http://rdfs.co/bevon/quantity"];
//   }
//   return convert(ingredient["http://rdfs.co/bevon/quantity"], "MLT")[
//     "http://purl.org/goodrelations/v1#hasValue"
//   ];
// }

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
