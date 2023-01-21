import { Food } from "../../ontology/types";
import { displayNameFor, stringFrom } from "./jsonld";

export function displayNameForFood(o: Food, lang: string): string {
  if (o["http://rdfs.co/bevon/name"]) {
    return stringFrom(o["http://rdfs.co/bevon/name"], lang);
  }
  return displayNameFor(o, lang);
}
