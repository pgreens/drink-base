import { AppQuantitativeValue } from "../ontology/constraints";

export function add(
  qv1: AppQuantitativeValue,
  qv2: AppQuantitativeValue
): AppQuantitativeValue {
  const {
    "http://purl.org/goodrelations/v1#hasUnitOfMeasurement":
      hasUnitOfMeasurement1,
    "http://purl.org/goodrelations/v1#hasValue": hasValue1,
  } = qv1;
  const {
    "http://purl.org/goodrelations/v1#hasUnitOfMeasurement":
      hasUnitOfMeasurement2,
    "http://purl.org/goodrelations/v1#hasValue": hasValue2,
  } = qv2;
  if (hasUnitOfMeasurement1 === hasUnitOfMeasurement2) {
    return {
      "http://purl.org/goodrelations/v1#hasUnitOfMeasurement":
        hasUnitOfMeasurement1,
      "http://purl.org/goodrelations/v1#hasValue": hasValue1 + hasValue2,
    };
  }

  throw new Error("Hey! You haven't implemented unit conversions yet!");
}

export function toString(q: AppQuantitativeValue) {
  return `${q["http://purl.org/goodrelations/v1#hasValue"]} ${unitName(
    q["http://purl.org/goodrelations/v1#hasUnitOfMeasurement"]
  )}`;
}

function unitName(unitCode: string): string {
  switch (unitCode) {
    case "dash":
      return "dash";
    case "OZA":
      return "ounce";
    case "G24":
      return "tablespoon";
    case "G25":
      return "teaspoon";
    default:
      return unitCode;
  }
}

export function convert(
  quantity: AppQuantitativeValue,
  toUnit: string
): AppQuantitativeValue {
  if (
    quantity["http://purl.org/goodrelations/v1#hasUnitOfMeasurement"] === toUnit
  ) {
    return quantity;
  }
  const conversion = conversions.filter(
    (c) =>
      c.fromUnitOfMeasurement ===
        quantity["http://purl.org/goodrelations/v1#hasUnitOfMeasurement"] &&
      c.toUnitOfMeasurement === toUnit
  );

  if (conversion.length === 0) {
    throw new Error(
      `Unsupported conversion: ${quantity["http://purl.org/goodrelations/v1#hasUnitOfMeasurement"]} to ${toUnit}`
    );
  }

  return {
    "http://purl.org/goodrelations/v1#hasUnitOfMeasurement": toUnit,
    "http://purl.org/goodrelations/v1#hasValue": toNumber(
      mult(
        fraction(quantity["http://purl.org/goodrelations/v1#hasValue"], 1),
        conversion[0].factor
      )
    ),
  };
}

enum Unit {
  // Volume - metric
  Milliliter = "MLT",
  Centiliter = "CLT",
  Liter = "LTR",

  // Volume - US
  FluidOunce = "OZA",
  Teaspoon = "G25",

  // Volume - loose
  Dash = "dash",
}

interface UnitConversion {
  fromUnitOfMeasurement: Unit;
  toUnitOfMeasurement: Unit;
  isExact: boolean;
  factor: Fraction;
}

interface Fraction {
  num: number;
  denom: number;
}

function fraction(num: number, denom: number): Fraction {
  return {
    num,
    denom,
  };
}

const conversions: UnitConversion[] = [
  {
    fromUnitOfMeasurement: Unit.Centiliter,
    toUnitOfMeasurement: Unit.Milliliter,
    isExact: true,
    factor: fraction(10, 1),
  },
  {
    fromUnitOfMeasurement: Unit.Liter,
    toUnitOfMeasurement: Unit.Centiliter,
    isExact: true,
    factor: fraction(100, 1),
  },
  {
    fromUnitOfMeasurement: Unit.FluidOunce,
    toUnitOfMeasurement: Unit.Milliliter,
    isExact: false,
    // we use exactly 30mL for labeling
    factor: fraction(2957353, 100000),
  },
  {
    fromUnitOfMeasurement: Unit.Teaspoon,
    toUnitOfMeasurement: Unit.Milliliter,
    isExact: false,
    factor: fraction(4928922, 1000000),
  },
  {
    fromUnitOfMeasurement: Unit.Dash,
    toUnitOfMeasurement: Unit.Milliliter,
    isExact: false,
    factor: fraction(1, 1),
  },
];

function mult(f1: Fraction, f2: Fraction): Fraction {
  return {
    num: f1.num * f2.num,
    denom: f1.denom * f2.denom,
  };
}

function inverse(f: Fraction): Fraction {
  return {
    num: f.denom,
    denom: f.num,
  };
}

function gcf(a: number, b: number) {
  if (b === 0) {
    return a;
  }
  return gcf(b, a % b);
}

function toNumber({ num, denom }: Fraction): number {
  return num / denom;
}

// fraction:  q * c / d
// fl ounce -> MLT
