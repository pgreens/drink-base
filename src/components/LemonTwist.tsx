import * as THREE from "three";
import React from "react";

export function LemonTwist(props) {
  return (
    <mesh {...props}>
      <boxGeometry args={[15, 60, 4]} />
      <meshPhysicalMaterial
        color={props.orange ? 0xff8f00 : 0xffde5d}
        envMap={props.texture}
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
