import { isLocaleString } from "../../ontology/constraints";
import { OwlClass } from "../../ontology/types";
import { isA } from "./types";

export interface JsonLdObject {
  "@id"?: string;
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

export interface TaggedValue {
  "@type": string;
  "@value": string;
}

export interface LocaleString {
  "@language": string | undefined;
  "@value": string;
}

export type JsonLdString = (string | LocaleString) | (string | LocaleString)[];

function isTaggedValue(val: any): val is TaggedValue {
  return val["@type"] !== undefined && val["@value"] !== undefined;
}

export function displayNameFor(o: OwlClass, lang: string): string {
  if (o["http://www.w3.org/2000/01/rdf-schema#label"]) {
    return stringFrom(o["http://www.w3.org/2000/01/rdf-schema#label"], lang);
  }
  return "unknown";
}

export function stringFrom(jsonLdString: JsonLdString, lang?: string): string {
  if (!jsonLdString) {
    return "";
  }
  if (lang) {
    if (typeof jsonLdString === "string") {
      return jsonLdString;
    }
    if (isLocaleString(jsonLdString)) {
      return jsonLdString["@value"];
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
  }
  // any lang
  return jsonLdString[0]["@value"] || jsonLdString[0];
}

export function equal(o1: JsonLdObject, o2: JsonLdObject) {
  return o1["@id"] === o2["@id"];
}

interface GqlSelect {
  properties: (SelectDataTypeProperty | SelectObjectTypeProperty | OnQuery)[];
}

interface SelectDataTypeProperty {
  name: string;
}

interface SelectObjectTypeProperty {
  name: string;
  query: GqlSelect;
}

interface OnQuery {
  type: string;
  query: GqlSelect;
}

function isSelectDataTypeProperty(
  prop: SelectDataTypeProperty | SelectObjectTypeProperty
): prop is SelectDataTypeProperty {
  return (
    (prop as SelectDataTypeProperty).name !== undefined &&
    Object.keys(prop).length === 1
  );
}

function isSelectObjectTypeProperty(
  prop: SelectDataTypeProperty | SelectObjectTypeProperty
): prop is SelectObjectTypeProperty {
  return (prop as SelectObjectTypeProperty).query !== undefined;
}

function isOnQuery(
  prop: SelectDataTypeProperty | SelectObjectTypeProperty | OnQuery
): prop is OnQuery {
  return (prop as OnQuery).type !== undefined;
}

// This is what I would like to do
const egSelect = `
{
  id
  label {
    ...on string {}
    ...on langString {
    language
    value
  } 
  ingredient {
    food {
      id
      label {
        ...on string {}
        ...on langString {
        language
        value
      }
    }
    quantity {
      ...on string {}
      ...on QuantitativeValue {
        hasUnitOfMeasurement
        hasValue
    }
  }
}
`;

const select: GqlSelect = {
  properties: [
    { name: "@id" },
    {
      name: "http://www.w3.org/2000/01/rdf-schema#label",
      query: {
        properties: [
          { type: "String", query: { properties: [] } },
          {
            type: "LangString",
            query: { properties: [{ name: "@language" }, { name: "@value" }] },
          },
        ],
      },
    },
    {
      name: "http://rdfs.co/bevon/ingredient",
      query: {
        properties: [
          {
            name: "http://rdfs.co/bevon/food",
            query: {
              properties: [
                { name: "@id" },
                {
                  name: "http://www.w3.org/2000/01/rdf-schema#label",
                  query: {
                    properties: [
                      { type: "String", query: { properties: [] } },
                      {
                        type: "LangString",
                        query: {
                          properties: [
                            { name: "@language" },
                            { name: "@value" },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "http://rdfs.co/bevon/quantity",
            query: {
              properties: [
                { type: "String", query: { properties: [] } },
                {
                  type: "Number",
                  query: { properties: [] },
                },
                {
                  type: "http://purl.org/goodrelations/v1#QuantitativeValueInteger",
                  query: {
                    properties: [
                      {
                        name: "http://purl.org/goodrelations/v1#hasUnitOfMeasurement",
                      },
                      { name: "http://purl.org/goodrelations/v1#hasValue" },
                    ],
                  },
                },
                {
                  type: "http://purl.org/goodrelations/v1#QuantitativeValue",
                  query: {
                    properties: [
                      {
                        name: "http://purl.org/goodrelations/v1#hasUnitOfMeasurement",
                      },
                      { name: "http://purl.org/goodrelations/v1#hasValue" },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};

export function testQ(doc: JsonLdObject[]) {
  return query(select, doc, "http://kb.liquorpicker.com/Sazerac");
  // const testDoc: JsonLdObject[] = [
  //   {
  //     "@id": "myThing",
  //     "http://www.w3.org/2000/01/rdf-schema#label": {
  //       "@language": "en",
  //       "@value": "WOW!",
  //     },
  //   },
  // ];
  // const q: GqlSelect = {
  //   properties: [
  //     {
  //       name: "http://www.w3.org/2000/01/rdf-schema#label",
  //       query: {
  //         properties: [
  //           { type: "String", query: { properties: [] } },
  //           {
  //             type: "LangString",
  //             query: {
  //               properties: [{ name: "@language" }, { name: "@value" }],
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   ],
  // };
  // return query(q, testDoc, "myThing");
}

export function query(
  select: GqlSelect,
  doc: JsonLdObject[],
  id: string
): string | number | object {
  console.log("selecting", select.properties, "for", id);
  const root = doc.find((thing) => thing["@id"] === id);
  if (!root) {
    throw new Error(`document does not contain id ${id}`);
  }

  return selectWithin(select, doc, root);
}

export function selectWithin(
  select: GqlSelect,
  doc: JsonLdObject[],
  root: string | number | object
): string | number | object {
  console.log("selecting", select.properties, "within", root);

  const resRoot = resolveValue(root, doc);

  const onQueries = select.properties.filter((prop): prop is OnQuery =>
    isOnQuery(prop)
  );

  for (const onQuery of onQueries) {
    if (onQuery.type === "String" && typeof resRoot === "string") {
      return resRoot;
    } else if (onQuery.type === "Number" && typeof resRoot === "number") {
      return resRoot;
    } else if (onQuery.type === "LangString" && isLangString(resRoot)) {
      return selectWithin(onQuery.query, doc, resRoot);
      // } else if (onQuery.type === "TaggedString" && isTaggedValue(resRoot)) {
      //   return coerceValueToNumber(resRoot);
      // return selectWithin(onQuery.query, doc, resRoot);
    } else if (typeof resRoot === "object" && isA(resRoot, onQuery.type, doc)) {
      return selectWithin(onQuery.query, doc, resRoot);
    } else {
      // do nothing
      console.log("did nothing for", onQuery);
    }
  }

  return select.properties
    .filter(
      (prop): prop is SelectDataTypeProperty | SelectObjectTypeProperty =>
        !isOnQuery(prop)
    )
    .reduce((obj, prop) => {
      console.log(`working on setting ${prop.name}=...`);
      obj[prop.name] = resolveProp(resRoot, prop, doc);
      console.log("returning obj", obj);
      return obj;
    }, {});
}

function isLangString(obj: any): boolean {
  return obj["@value"] && obj["@language"];
}

export function resolveProp(
  parent: string | number | object,
  prop: SelectDataTypeProperty | SelectObjectTypeProperty,
  doc: JsonLdObject[]
) {
  console.log("resolving prop", prop.name, "on", parent);
  const resolveFn = isSelectObjectTypeProperty(prop)
    ? (v: JsonLdObject) => selectWithin(prop.query, doc, v)
    : (v: JsonLdObject) => resolveValue(v, doc);

  const val = parent[prop.name];
  if (Array.isArray(val)) {
    return val.map((entry) => resolveFn(entry));
  } else {
    return resolveFn(val);
  }
}

export function resolveValue(
  value: string | number | object,
  doc: JsonLdObject[]
): string | number | JsonLdObject {
  console.log("resolving value", value);
  if (typeof value !== "object") {
    return value;
  }
  // reference
  if (value["@id"] && Object.keys(value).length === 1) {
    const found = doc.find((thing) => thing["@id"] === value["@id"]);
    if (!found) {
      throw new Error(`document does not contain id ${value["@id"]}`);
    }
    return resolveValue(found, doc);
  } else if (isTaggedValue(value)) {
    return coerceValueToNumber(value);
  } else if (value["@value"] !== undefined && Object.keys(value).length === 1) {
    // some values are represented like this for some reason
    return value["@value"];
  } else {
    return value;
  }
}

export function coerceValueToNumber(val: string | TaggedValue): number {
  if (typeof val === "string") {
    return parseFloat(val);
  } else if (
    val["@type"] === "http://www.w3.org/2001/XMLSchema#int" ||
    val["@type"] === "http://www.w3.org/2001/XMLSchema#integer"
  ) {
    return parseInt(val["@value"]);
  } else if (val["@type"] === "http://www.w3.org/2001/XMLSchema#float") {
    return parseFloat(val["@value"]);
  } else {
    throw new Error(`unimplemented number type ${val["@type"]}`);
  }
}
