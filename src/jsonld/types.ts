import { JsonLdObject } from "./jsonld";

export function isA(
  thing: JsonLdObject,
  owlClassId: string,
  doc: JsonLdObject[]
): boolean {
  console.log(`is ${thing["@id"]} a ${owlClassId}?`, thing);
  if (!thing["@type"]) {
    console.log("no type", thing);
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

  // look superclasses for classes
  // const thingDef = doc.find((o) => o["@id"] === thing["@id"]);
  // if (!thingDef) {
  //   throw new Error(`${thing["@id"]} not found in linked-data doc`);
  // }
  // console.log(thingDef);
  if (!thing["http://www.w3.org/2000/01/rdf-schema#subClassOf"]) {
    console.log("no subclass definition");
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
  console.log(found ? "yes!" : "no");
  return found !== undefined;
}
