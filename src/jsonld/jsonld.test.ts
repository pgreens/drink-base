import {
  JsonLdObject,
  resolveProp,
  resolveValue,
  selectWithin,
} from "./jsonld";

const testDoc: JsonLdObject[] = [
  {
    "@id": "myThing",
    "http://www.w3.org/2000/01/rdf-schema#label": {
      "@language": "en",
      "@value": "WOW!",
    },
  },
  {
    "@id": "myThing2",
    "http://www.w3.org/2000/01/rdf-schema#label": [
      {
        "@language": "en",
        "@value": "WOW!",
      },
      {
        "@language": "es",
        "@value": "Guay",
      },
    ],
  },
];

describe("resolveValue", () => {
  test("resolves literal string", () => {
    const actual = resolveValue("hello", testDoc);
    expect(actual).toBe("hello");
  });

  test("resolves tagged string", () => {
    const actual = resolveValue(
      {
        "@value": "hello",
        "@language": "en",
      },
      testDoc
    );
    expect(actual).toMatchObject({
      "@value": "hello",
      "@language": "en",
    });
  });

  test("resolves individual", () => {
    const actual = resolveValue(testDoc[0], testDoc);
    expect(actual).toBe(testDoc[0]);
  });

  test("resolves individual from reference", () => {
    const actual = resolveValue(
      {
        "@id": "myThing",
      },
      testDoc
    );
    expect(actual).toBe(testDoc[0]);
  });
});

describe("resolveProp", () => {
  test("resolves prop with literal string value", () => {
    const actual = resolveProp(
      testDoc[0],
      {
        name: "@id",
      },
      testDoc
    );
    expect(actual).toBe("myThing");
  });

  test("resolves prop with list of literal string value", () => {
    const actual = resolveProp(
      {
        myProp: ["s1", "s2", "s3"],
      },
      {
        name: "myProp",
      },
      testDoc
    );
    expect(actual).toMatchObject(["s1", "s2", "s3"]);
  });

  test("resolves prop with tagged string value", () => {
    const actual = resolveProp(
      testDoc[0],
      {
        name: "http://www.w3.org/2000/01/rdf-schema#label",
        query: {
          properties: [{ name: "@value" }, { name: "@language" }],
        },
      },
      testDoc
    );
    expect(actual).toMatchObject({
      "@value": "WOW!",
      "@language": "en",
    });
  });

  test("resolves prop with list of tagged string value", () => {
    const actual = resolveProp(
      testDoc[1],
      {
        name: "http://www.w3.org/2000/01/rdf-schema#label",
        query: {
          properties: [{ name: "@value" }, { name: "@language" }],
        },
      },
      testDoc
    );
    expect(actual).toMatchObject([
      {
        "@value": "WOW!",
        "@language": "en",
      },
      {
        "@language": "es",
        "@value": "Guay",
      },
    ]);
  });
});

describe("selectWithin", () => {
  test("selects string prop", () => {
    const actual = selectWithin(
      {
        properties: [{ name: "@id" }],
      },
      testDoc,
      testDoc[0]
    );
    expect(actual).toMatchObject({ "@id": "myThing" });
  });

  test("selects list string prop", () => {
    const actual = selectWithin(
      {
        properties: [{ name: "myProp" }],
      },
      testDoc,
      {
        myProp: ["s1", "s2", "s3"],
      }
    );
    expect(actual).toMatchObject({ myProp: ["s1", "s2", "s3"] });
  });

  test("selects list tagged string prop", () => {
    const actual = selectWithin(
      {
        properties: [
          {
            name: "myProp",
            query: {
              properties: [{ name: "@value" }],
            },
          },
        ],
      },
      testDoc,
      {
        myProp: [
          {
            "@value": "hi",
            "@language": "en",
          },
          {
            "@value": "hola",
            "@language": "es",
          },
        ],
      }
    );
    expect(actual).toMatchObject({
      myProp: [{ "@value": "hi" }, { "@value": "hola" }],
    });
  });

  test("selects string with on query", () => {
    const actual = selectWithin(
      {
        properties: [
          {
            name: "myProp",
            query: {
              properties: [{ type: "String", query: { properties: [] } }],
            },
          },
        ],
      },
      testDoc,
      {
        myProp: "hi",
      }
    );
    expect(actual).toMatchObject({
      myProp: "hi",
    });
  });
});
