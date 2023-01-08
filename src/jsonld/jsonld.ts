export interface JsonLdObject {
  "@id": string;
  "@type"?: string[];
  "http://www.w3.org/2000/01/rdf-schema#subClassOf"?: JsonLdRef[];
  "http://www.w3.org/2000/01/rdf-schema#label"?: JsonLdString;
  "http://www.w3.org/2000/01/rdf-schema#seeAlso"?: {
    "@id": string;
  }[];
}

export interface JsonLdRef {
  "@id": string;
}

export interface LocaleString {
  "@language": string | undefined;
  "@value": string;
}

export type JsonLdString = string | LocaleString[];

export function displayNameFor(o: JsonLdObject, lang: string): string {
  if (o["http://www.w3.org/2000/01/rdf-schema#label"]) {
    return stringFrom(o["http://www.w3.org/2000/01/rdf-schema#label"], lang);
  }
  return "unknown";
}

export function stringFrom(jsonLdString: JsonLdString, lang: string): string {
  if (!jsonLdString) {
    return "";
  }
  if (typeof jsonLdString === "string") {
    return jsonLdString;
  }
  const preferredLang = jsonLdString.find(
    (localStr) => localStr["@language"] === lang
  );
  if (preferredLang) {
    return preferredLang["@value"];
  }
  const english = jsonLdString.find(
    (localStr) => localStr["@language"] === "en"
  );
  if (english) {
    return english["@value"];
  }
  // any lang
  return jsonLdString[0]["@value"];
}

export function equal(o1: JsonLdObject, o2: JsonLdObject) {
  return o1["@id"] === o2["@id"];
}
