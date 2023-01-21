import React from "react";
import { Glass } from "../glass";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Canvas, ThreeElements, useFrame, useLoader } from "@react-three/fiber";
import { displayNameForIngredient } from "../ingredients";
import { stringFrom } from "../jsonld/jsonld";
import { Text } from "@react-three/drei";
import {
  AppIngredient,
  AppQuantitativeValue,
} from "../../ontology/constraints";
import { convert } from "../quantity";

const MIN_LINE_HEIGHT = 7;

export default function Glass3D({ glass }: { glass: Glass }) {
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 10);

  const liquids = glass.contents.filter(
    (ingredient) =>
      typeof ingredient["http://rdfs.co/bevon/quantity"] !== "number"
  );

  const positions = liquids
    .reduce(
      (positions, ingredient) => {
        const [lastTop, _lastMid] = positions[positions.length - 1];
        const height =
          convert(
            ingredient["http://rdfs.co/bevon/quantity"] as AppQuantitativeValue,
            "MLT"
          )["http://purl.org/goodrelations/v1#hasValue"] / 4;
        return [
          ...positions,
          // filtered out the other types already
          [lastTop + height, lastTop + height / 2],
        ];
      },
      [[-40, 0]]
    )
    // drop first entry, which was an initial value to make the reduction easier
    .slice(1);
  if (positions.length === 0) positions.push([0, 0]);

  const textPositions = positions.reduce((txtPoss, [top, _mid], i) => {
    const lastTxt = i > 0 ? txtPoss[txtPoss.length - 1] : -40 - MIN_LINE_HEIGHT;
    if (top - lastTxt < MIN_LINE_HEIGHT) {
      return [...txtPoss, lastTxt + MIN_LINE_HEIGHT];
    }
    return [...txtPoss, top];
  }, []);

  return (
    <div style={{ height: 500 }}>
      <Canvas
        camera={{ position: [0, 30, 120], fov: 75, quaternion: quaternion }}
        shadows={true}
      >
        <color attach="background" args={["#15151a"]} />
        {liquids.map((ingredient, i) => (
          <LiquidIngredient3D
            key={i}
            ingredient={ingredient}
            meshProps={{ position: [0, positions[i][1], 0] }}
          />
        ))}
        {liquids.map((ingredient, i) => (
          <React.Fragment key={`desc-${i}`}>
            <line>
              <tubeGeometry
                args={[
                  // is there a way to do this with straight JSX
                  // so we don't recreate these every render?
                  new THREE.LineCurve3(
                    new THREE.Vector3(40, positions[i][0], 10),
                    new THREE.Vector3(60, textPositions[i], 10)
                  ),
                  1,
                  0.1,
                  8,
                  false,
                ]}
              />
              <lineBasicMaterial color={0xffffff} />
            </line>
            <line>
              <tubeGeometry
                args={[
                  new THREE.LineCurve3(
                    new THREE.Vector3(60, textPositions[i], 10),
                    new THREE.Vector3(140, textPositions[i], 10)
                  ),
                  1,
                  0.1,
                  8,
                  false,
                ]}
              />
              <lineBasicMaterial color={0xffffff} />
            </line>
            <mesh position={[140, textPositions[i] - 1, 10]}>
              <Text color={0xffffff} anchorX="right" anchorY="top" fontSize={5}>
                {displayNameForIngredient(ingredient, "en")}
              </Text>
            </mesh>
          </React.Fragment>
        ))}
      </Canvas>
    </div>
  );
}

function LiquidIngredient3D({
  ingredient,
  meshProps,
}: {
  ingredient: AppIngredient;
  meshProps: ThreeElements["mesh"];
}) {
  const ref = React.useRef<THREE.Mesh>(null!);
  const texture = useLoader(RGBELoader, "./royal_esplanade_1k.hdr");
  texture.mapping = THREE.EquirectangularReflectionMapping;

  if (typeof ingredient["http://rdfs.co/bevon/quantity"] === "number") {
    throw new Error("invalid liquid quantity");
  }

  const height =
    convert(ingredient["http://rdfs.co/bevon/quantity"], "MLT")[
      "http://purl.org/goodrelations/v1#hasValue"
    ] / 4;
  // ingredient["http://rdfs.co/bevon/quantity"][
  //   "http://purl.org/goodrelations/v1#hasValue"
  // ] * 10;
  const color = ingredient["http://rdfs.co/bevon/food"][
    "http://kb.liquorpicker.com/color"
  ]
    ? stringFrom(
        ingredient["http://rdfs.co/bevon/food"][
          "http://kb.liquorpicker.com/color"
        ]
      )
    : "ffffff";

  return (
    <mesh ref={ref} scale={1} {...meshProps}>
      <cylinderGeometry args={[40, 40, height]} />
      <meshPhysicalMaterial
        color={parseInt(color, 16)}
        envMap={texture}
        transmission={0.5}
        opacity={0.7}
        metalness={0.5}
        roughness={0.1}
        ior={1.5}
        thickness={0.01}
        specularIntensity={1}
        specularColor={0xffffff}
        envMapIntensity={1}
        side={THREE.DoubleSide}
        transparent={true}
      />
    </mesh>
  );
}
