import React from "react";
import { Glass, totalQuantity } from "../glass";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Canvas, ThreeElements, useFrame, useLoader } from "@react-three/fiber";
import { displayNameForIngredient, Ingredient } from "../ingredients";
import { stringFrom } from "../jsonld/jsonld";
import { QuantitativeValue } from "../quantity";
import { CanvasTexture } from "three";
import { Text } from "@react-three/drei";

export default function Glass3D({ glass }: { glass: Glass }) {
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 10);

  const liquids = glass.contents.filter(
    (ingredient) => typeof ingredient.quantity !== "number"
  );

  const positions = liquids
    .reduce(
      (positions, ingredient) => {
        const [lastTop, _lastMid] = positions[positions.length - 1];
        const height = (ingredient.quantity as QuantitativeValue).hasValue * 10;
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
            <mesh position={[90, positions[i][0], 10]}>
              <planeGeometry args={[100, 0.5]} />
              <meshBasicMaterial color={0xffffff} />
            </mesh>
            <mesh position={[140, positions[i][0]-1, 10]}>
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
  ingredient: Ingredient;
  meshProps: ThreeElements["mesh"];
}) {
  const ref = React.useRef<THREE.Mesh>(null!);
  const texture = useLoader(RGBELoader, "./royal_esplanade_1k.hdr");
  texture.mapping = THREE.EquirectangularReflectionMapping;

  if (typeof ingredient.quantity === "number") {
    throw new Error("invalid liquid quantity");
  }

  const height = ingredient.quantity.hasValue * 10;
  const color = ingredient.food["http://kb.liquorpicker.com/color"]
    ? stringFrom(ingredient.food["http://kb.liquorpicker.com/color"])
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
