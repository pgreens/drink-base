import React, { Ref, useEffect } from "react";
import { Glass } from "../glass";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Canvas, ThreeElements, useFrame, useLoader } from "@react-three/fiber";
import { displayNameForIngredient } from "../ingredients";
import { JsonLdObject, stringFrom } from "../jsonld/jsonld";
import { Text } from "@react-three/drei";
import {
  AppIngredient,
  AppQuantitativeValue,
} from "../../ontology/constraints";
import { convert } from "../quantity";
import { isA } from "../jsonld/types";
import { LemonTwist } from "./LemonTwist";

const MIN_LINE_HEIGHT = 7;

export default function Glass3D({
  glass,
  describedById,
  ontology,
}: {
  glass: Glass;
  describedById: string;
  ontology: JsonLdObject[];
}) {
  const texture = useLoader(RGBELoader, "static/royal_esplanade_1k.hdr");
  // const twist = useLoader(GLTFLoader, "static/Lemon-Twist.gltf");

  texture.mapping = THREE.EquirectangularReflectionMapping;

  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 10);

  const [liquids, solids] = glass.contents.reduce(
    ([liquids, solids], ingredient) => {
      if (
        isA(
          ingredient["http://rdfs.co/bevon/food"],
          "http://kb.liquorpicker.com/LiquidMixin",
          ontology
        )
      ) {
        liquids.push(ingredient);
      } else {
        // solids.push();
        return [
          liquids,
          [
            ...solids,
            ...(
              new Array(
                ingredient["http://rdfs.co/bevon/quantity"] as number
              ) as AppIngredient[]
            ).fill(ingredient),
          ],
        ];
      }
      return [liquids, solids];
    },
    [[] as AppIngredient[], [] as AppIngredient[]]
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

  const textPositions = positions.reduce((txtPoss, [top, _mid], i) => {
    const lastTxt = i > 0 ? txtPoss[txtPoss.length - 1] : -40 - MIN_LINE_HEIGHT;
    if (top - lastTxt < MIN_LINE_HEIGHT) {
      return [...txtPoss, lastTxt + MIN_LINE_HEIGHT];
    }
    return [...txtPoss, top];
  }, []);

  const liquidTop =
    positions.length === 0 ? -40 : positions[positions.length - 1][0];

  const solidSpacingAngle =
    solids.length <= 12 ? Math.PI / 6 : Math.PI / (solids.length / 2);

  return (
    <div className="glass">
      <Canvas
        camera={{
          position: [0, 30, window.innerWidth * -0.011389 + 154.4417],
          fov: 75,
          quaternion: quaternion,
        }}
        shadows={true}
        aria-describedby={describedById}
      >
        <ambientLight color={0xaaaaaa} />
        <color attach="background" args={["#15151a"]} />
        <ReferencePoint />
        {solids.map((ingredient, i) => {
          const solidQuant = new THREE.Quaternion();
          solidQuant.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            solidSpacingAngle * i + Math.PI / 8
          );
          if (
            ingredient["http://rdfs.co/bevon/food"]["@id"] ===
            "http://kb.liquorpicker.com/SugarCube"
          ) {
            return (
              <SugarCube
                key={`solid-${i}`}
                texture={texture}
                meshProps={{
                  position: new THREE.Vector3(30, liquidTop, 0).applyQuaternion(
                    solidQuant
                  ),
                  rotation: new THREE.Euler(
                    0,
                    solidSpacingAngle * i + Math.PI / 8,
                    0
                  ),
                  renderOrder: i,
                }}
              />
            );
          } else if (
            ingredient["http://rdfs.co/bevon/food"]["@id"] ===
            "http://kb.liquorpicker.com/LemonTwist"
          ) {
            return (
              <LemonTwist
                key={`solid-${i}`}
                scale={0.5}
                position={new THREE.Vector3(
                  34,
                  liquidTop + 5,
                  0
                ).applyQuaternion(solidQuant)}
                rotation={
                  new THREE.Euler(0, solidSpacingAngle * i + Math.PI / 8, 0)
                }
                texture={texture}
              />
            );
          } else if (
            ingredient["http://rdfs.co/bevon/food"]["@id"] ===
            "http://kb.liquorpicker.com/OrangeTwist"
          ) {
            return (
              <LemonTwist
                key={`solid-${i}`}
                scale={0.5}
                position={new THREE.Vector3(
                  34,
                  liquidTop + 5,
                  0
                ).applyQuaternion(solidQuant)}
                rotation={
                  new THREE.Euler(0, solidSpacingAngle * i + Math.PI / 8, 0)
                }
                texture={texture}
                orange={true}
              />
            );
          } else if (
            ingredient["http://rdfs.co/bevon/food"]["@id"] ===
            "http://kb.liquorpicker.com/Olive"
          ) {
            return (
              <GenericSolidIngredient
                key={`solid-${i}`}
                texture={texture}
                color={0x6f8861}
                meshProps={{
                  position: new THREE.Vector3(30, liquidTop, 0).applyQuaternion(
                    solidQuant
                  ),
                  renderOrder: i,
                }}
              />
            );
          } else if (
            ingredient["http://rdfs.co/bevon/food"]["@id"] ===
            "http://kb.liquorpicker.com/BrandiedCherry"
          ) {
            return (
              <GenericSolidIngredient
                key={`solid-${i}`}
                texture={texture}
                color={0x881122}
                meshProps={{
                  position: new THREE.Vector3(30, liquidTop, 0).applyQuaternion(
                    solidQuant
                  ),
                  renderOrder: i,
                }}
              />
            );
          } else if (
            ingredient["http://rdfs.co/bevon/food"]["@id"] ===
            "http://kb.liquorpicker.com/OrangeSlice"
          ) {
            return (
              <OrangeSlice
                key={`solid-${i}`}
                texture={texture}
                meshProps={{
                  position: new THREE.Vector3(
                    35,
                    liquidTop - 5,
                    0
                  ).applyQuaternion(solidQuant),
                  rotation: new THREE.Euler(
                    0,
                    solidSpacingAngle * i + Math.PI / 8,
                    0
                  ),
                  renderOrder: i,
                }}
              />
            );
          } else if (
            ingredient["http://rdfs.co/bevon/food"]["@id"] ===
            "http://kb.liquorpicker.com/LemonWedge"
          ) {
            return (
              <LemonSlice
                key={`solid-${i}`}
                texture={texture}
                meshProps={{
                  position: new THREE.Vector3(
                    35,
                    liquidTop - 5,
                    0
                  ).applyQuaternion(solidQuant),
                  rotation: new THREE.Euler(
                    0,
                    solidSpacingAngle * i + Math.PI / 8,
                    0
                  ),
                  renderOrder: i,
                }}
              />
            );
          }
          return (
            <GenericSolidIngredient
              key={`solid-${i}`}
              texture={texture}
              color={0xcccccc}
              meshProps={{
                position: new THREE.Vector3(30, liquidTop, 0).applyQuaternion(
                  solidQuant
                ),
                renderOrder: i,
              }}
            />
          );
        })}
        {solids.length && (
          <mesh
            position={
              new THREE.Vector3(
                40,
                positions.length === 0 ? 0 : positions[0][0] - 6,
                10
              )
            }
          >
            <Text color={0xffffff} anchorX="left" anchorY="top" fontSize={3}>
              and
            </Text>
          </mesh>
        )}
        {glass.contents
          .filter((ingredient) => {
            return !isA(
              ingredient["http://rdfs.co/bevon/food"],
              "http://kb.liquorpicker.com/LiquidMixin",
              ontology
            );
          })
          .map((ingredient, i) => {
            return (
              <React.Fragment key={`desc-${i}`}>
                <mesh
                  position={
                    new THREE.Vector3(
                      40,
                      positions.length === 0 ? 0 : positions[0][0] - 10 - i * 4,
                      10
                    )
                  }
                >
                  <Text
                    color={0xffffff}
                    anchorX="left"
                    anchorY="top"
                    fontSize={3}
                  >
                    {displayNameForIngredient(ingredient, "en")}
                  </Text>
                </mesh>
              </React.Fragment>
            );
          })}
        {liquids.map((ingredient, i) => (
          <LiquidIngredient3D
            key={i}
            ingredient={ingredient}
            texture={texture}
            meshProps={{
              position: [0, positions[i][1], 0],
              renderOrder: solids.length + i + 1,
            }}
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
                    new THREE.Vector3(40, positions[i][0] - 1, 10),
                    new THREE.Vector3(60, textPositions[i] - 1, 10)
                  ),
                  1,
                  0.05,
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
                    new THREE.Vector3(60, textPositions[i] - 1, 10),
                    new THREE.Vector3(100, textPositions[i] - 1, 10)
                  ),
                  1,
                  0.05,
                  8,
                  false,
                ]}
              />
              <lineBasicMaterial color={0xffffff} />
            </line>
            <mesh position={[100, textPositions[i] - 2, 10]}>
              <Text color={0xffffff} anchorX="right" anchorY="top" fontSize={3}>
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
  texture,
  meshProps,
}: {
  ingredient: AppIngredient;
  texture: THREE.DataTexture;
  meshProps: ThreeElements["mesh"];
}) {
  const ref = React.useRef<THREE.Mesh>(null!);

  if (typeof ingredient["http://rdfs.co/bevon/quantity"] === "number") {
    throw new Error("invalid liquid quantity");
  }

  const height =
    convert(ingredient["http://rdfs.co/bevon/quantity"], "MLT")[
      "http://purl.org/goodrelations/v1#hasValue"
    ] / 4;
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
      <cylinderGeometry args={[40, 40, height, 64]} />
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

function GenericSolidIngredient({
  // ingredient,
  texture,
  meshProps,
  color,
}: {
  // ingredient: AppIngredient;
  texture: THREE.DataTexture;
  meshProps: ThreeElements["mesh"];
  color: number;
}) {
  return (
    <mesh scale={1} {...meshProps}>
      <sphereGeometry args={[8]} />
      <meshPhysicalMaterial
        color={color}
        envMap={texture}
        transmission={0.5}
        opacity={1}
        metalness={0}
        roughness={0.2}
        ior={1.3}
        thickness={0.01}
        specularIntensity={0.25}
        specularColor={0xffffff}
        envMapIntensity={1}
        side={THREE.DoubleSide}
        transparent={false}
      />
    </mesh>
  );
}

function OrangeSlice({
  texture,
  meshProps,
}: {
  // ingredient: AppIngredient;
  texture: THREE.DataTexture;
  meshProps: ThreeElements["group"];
}) {
  const curve = new THREE.EllipseCurve(
    0,
    0, // ax, aY
    30,
    35, // xRadius, yRadius
    Math.PI / 2,
    (3 * Math.PI) / 2, // aStartAngle, aEndAngle
    false, // aClockwise
    0 // aRotation
  );
  const fruitCurve = new THREE.EllipseCurve(
    0,
    0, // ax, aY
    28,
    32, // xRadius, yRadius
    Math.PI / 2,
    (3 * Math.PI) / 2, // aStartAngle, aEndAngle
    false, // aClockwise
    0 // aRotation
  );

  const points = curve.getPoints(128);
  const fruitPoints = fruitCurve.getPoints(128);

  const sliceShape = new THREE.Shape(points);
  const fruitShape = new THREE.Shape(fruitPoints);
  return (
    <group {...meshProps} renderOrder={0} rotation-z={(3 * Math.PI) / 2}>
      <mesh scale={0.55} renderOrder={meshProps.renderOrder}>
        <extrudeGeometry args={[sliceShape, { depth: 10 }]} />
        <meshPhysicalMaterial
          color={0xff8f00}
          envMap={texture}
          transmission={0.5}
          opacity={1}
          metalness={0}
          roughness={0.2}
          ior={1.3}
          thickness={0.01}
          specularIntensity={0.25}
          specularColor={0xffffff}
          envMapIntensity={1}
          side={THREE.DoubleSide}
          transparent={false}
        />
      </mesh>
      <mesh
        scale={0.55}
        position={[0, 0, -0.05]}
        renderOrder={meshProps.renderOrder}
      >
        <extrudeGeometry args={[fruitShape, { depth: 10.2 }]} />
        <meshPhysicalMaterial
          color={0xffbf33}
          envMap={texture}
          transmission={0.5}
          opacity={1}
          metalness={0}
          roughness={0.05}
          ior={1.3}
          thickness={1}
          specularIntensity={0.25}
          specularColor={0xffffff}
          envMapIntensity={1}
          side={THREE.DoubleSide}
          transparent={false}
        />
      </mesh>
    </group>
  );
}

function LemonSlice({
  texture,
  meshProps,
}: {
  texture: THREE.DataTexture;
  meshProps: ThreeElements["group"];
}) {
  const curve = new THREE.EllipseCurve(
    0,
    0, // ax, aY
    30,
    35, // xRadius, yRadius
    Math.PI / 2,
    (3 * Math.PI) / 2, // aStartAngle, aEndAngle
    false, // aClockwise
    0 // aRotation
  );
  const fruitCurve = new THREE.EllipseCurve(
    0,
    0, // ax, aY
    28,
    32, // xRadius, yRadius
    Math.PI / 2,
    (3 * Math.PI) / 2, // aStartAngle, aEndAngle
    false, // aClockwise
    0 // aRotation
  );

  const points = curve.getPoints(128);
  const fruitPoints = fruitCurve.getPoints(128);

  const sliceShape = new THREE.Shape(points);
  const fruitShape = new THREE.Shape(fruitPoints);
  return (
    <group {...meshProps} renderOrder={0} rotation-z={(3 * Math.PI) / 2}>
      <mesh scale={0.4} renderOrder={meshProps.renderOrder}>
        <extrudeGeometry args={[sliceShape, { depth: 10 }]} />
        <meshPhysicalMaterial
          color={0xffff00}
          envMap={texture}
          transmission={0.5}
          opacity={1}
          metalness={0}
          roughness={0.2}
          ior={1.3}
          thickness={0.01}
          specularIntensity={0.25}
          specularColor={0xffffff}
          envMapIntensity={1}
          side={THREE.DoubleSide}
          transparent={false}
        />
      </mesh>
      <mesh
        scale={0.4}
        position={[0, 0, -0.05]}
        renderOrder={meshProps.renderOrder}
      >
        <extrudeGeometry args={[fruitShape, { depth: 10.2 }]} />
        <meshPhysicalMaterial
          color={0xfffff3}
          envMap={texture}
          transmission={0.5}
          opacity={1}
          metalness={0}
          roughness={0.05}
          ior={1.3}
          thickness={1}
          specularIntensity={0.25}
          specularColor={0xffffff}
          envMapIntensity={1}
          side={THREE.DoubleSide}
          transparent={false}
        />
      </mesh>
    </group>
  );
}

function SugarCube({
  texture,
  meshProps,
}: {
  // ingredient: AppIngredient;
  texture: THREE.DataTexture;
  meshProps: ThreeElements["mesh"];
}) {
  return (
    <mesh {...meshProps} scale={1}>
      <boxGeometry args={[12, 12, 12]} />
      {/* <meshBasicMaterial color={0xaa4422} /> */}
      <meshPhysicalMaterial
        color={0xffffff}
        envMap={texture}
        transmission={0.5}
        opacity={1}
        metalness={0}
        roughness={0.2}
        ior={1.3}
        thickness={0.01}
        specularIntensity={0.25}
        specularColor={0xffffff}
        envMapIntensity={1}
        side={THREE.DoubleSide}
        transparent={false}
      />
    </mesh>
  );
}

function ReferencePoint() {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const pointRef = React.useRef<THREE.Mesh>(null!);
  const camVector = new THREE.Vector3();

  useFrame((state) => {
    state.camera.lookAt(pointRef.current.position);
    state.camera.position.lerp(
      camVector.set(0, 30, windowWidth * -0.02 + 155), //
      0.1
    );
    state.camera.setViewOffset(
      windowWidth,
      window.innerHeight,
      windowWidth * -0.01518 + 250,
      0,
      windowWidth,
      window.innerHeight
    );
    state.camera.updateProjectionMatrix();
    return null;
  });

  const onResize = () => {
    console.log("resizing");
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    if (!window) {
      return;
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  return (
    <mesh ref={pointRef}>
      <circleGeometry args={[0.01]} />
      <meshBasicMaterial color={0x000000} />
    </mesh>
  );
}
