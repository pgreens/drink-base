import {
  displayNameFor,
  JsonLdObject,
  JsonLdString,
  stringFrom,
} from "./jsonld";

export interface Food extends JsonLdObject {
  "http://rdfs.co/bevon/name"?: JsonLdString;
}

export function displayNameForFood(o: Food, lang: string): string {
  if (o["http://rdfs.co/bevon/name"]) {
    return stringFrom(o["http://rdfs.co/bevon/name"], lang);
  }
  return displayNameFor(o, lang);
}
