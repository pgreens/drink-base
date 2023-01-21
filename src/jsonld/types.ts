import { OwlClass } from "../../ontology/types";
import { JsonLdObject } from "./jsonld";

export function isA(
  thing: OwlClass, // not quite right
  owlClassId: string,
  doc: JsonLdObject[]
): boolean {
  if (!thing["@type"]) {
    return false;
  }
  if (thing["@id"] === owlClassId || thing["@type"].includes(owlClassId)) {
    return true;
  }

  // look at the type for individuals
  if (!thing["@type"].includes("http://www.w3.org/2002/07/owl#Class")) {
    const typeDefs = doc.filter((o) => thing["@type"]?.includes(o["@id"]));
    const found = typeDefs.find((def) => isA(def, owlClassId, doc));
    return found !== undefined;
  }

  if (!thing["http://www.w3.org/2000/01/rdf-schema#subClassOf"]) {
    return false;
  }
  const superTypes = doc.filter(
    (o) =>
      thing["http://www.w3.org/2000/01/rdf-schema#subClassOf"] && // find better way to avoid this duplicate logic
      thing["http://www.w3.org/2000/01/rdf-schema#subClassOf"].find(
        (ref) => ref["@id"] === o["@id"]
      )
  );
  const found = superTypes.find((superT) => isA(superT, owlClassId, doc));
  return found !== undefined;
}

export function isAnIndividualOfType(
  thing: JsonLdObject,
  owlClassId: string,
  doc: JsonLdObject[]
): boolean {
  if (!thing["@type"]) {
    return false;
  }

  return (
    !thing["@type"].includes("http://www.w3.org/2002/07/owl#Class") &&
    isA(thing, owlClassId, doc)
  );
}
