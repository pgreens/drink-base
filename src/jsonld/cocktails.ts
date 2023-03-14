import {
  AppCocktail,
  constrainCocktail,
  constraintError,
  isFailure,
} from "../../ontology/constraints";
import { Cocktail } from "../../ontology/types";
import { JsonLdObject, query } from "./jsonld";

export function cocktailById(id: string, doc: JsonLdObject[]): AppCocktail {
  const results = query(
    {
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
                  properties: [{ name: "@language" }, { name: "@value" }],
                },
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
                    { name: "@type" },
                    { name: "http://kb.liquorpicker.com/color" },
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
                          {
                            name: "http://purl.org/goodrelations/v1#hasValue",
                          },
                        ],
                      },
                    },
                    {
                      type: "http://purl.org/goodrelations/v1#QuantitativeValueFloat",
                      query: {
                        properties: [
                          {
                            name: "http://purl.org/goodrelations/v1#hasUnitOfMeasurement",
                          },
                          {
                            name: "http://purl.org/goodrelations/v1#hasValue",
                          },
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
                          {
                            name: "http://purl.org/goodrelations/v1#hasValue",
                          },
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
    },
    doc,
    id
  ) as Cocktail;

  const cocktail = constrainCocktail(results);

  if (isFailure(cocktail)) {
    constraintError(cocktail);
  }

  return cocktail;
}
