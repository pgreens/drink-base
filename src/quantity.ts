export interface QuantitativeValue {
  readonly hasUnitOfMeasurement: string;
  readonly hasValue: number;
}

export function add(
  qv1: QuantitativeValue,
  qv2: QuantitativeValue
): QuantitativeValue {
  const { hasUnitOfMeasurement: hasUnitOfMeasurement1, hasValue: hasValue1 } =
    qv1;
  const { hasUnitOfMeasurement: hasUnitOfMeasurement2, hasValue: hasValue2 } =
    qv2;
  if (hasUnitOfMeasurement1 === hasUnitOfMeasurement2) {
    return {
      hasUnitOfMeasurement: hasUnitOfMeasurement1,
      hasValue: hasValue1 + hasValue2,
    };
  }

  throw new Error("Hey! You haven't implemented unit conversions yet!");
}

export function toString(q: QuantitativeValue) {
  return `${q.hasValue} ${unitName(q.hasUnitOfMeasurement)}`;
}

function unitName(unitCode: string): string {
  switch (unitCode) {
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
