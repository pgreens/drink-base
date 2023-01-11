import React from "react";
import { Glass } from "../glass";
import { displayNameForIngredient } from "../ingredients";
// import * as THREE,{
//   AmbientLight,
//   BoxGeometry,
//   CanvasTexture,
//   CylinderGeometry,
//   DirectionalLight,
//   DoubleSide,
//   FrontSide,
//   Mesh,
//   MeshBasicMaterial,
//   MeshPhysicalMaterial,
//   NearestFilter,
//   PerspectiveCamera,
//   PlaneGeometry,
//   RepeatWrapping,
//   Scene,
//   WebGLRenderer,
// } from "three";
import * as THREE from "three";
// import { RGBELoader } from "../RGBELoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";

export default function GlassWebGL({ glass }: { glass: Glass }) {
  const theSpot = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    // const scene = new Scene();
    // const camera = new PerspectiveCamera(
    //   75,
    //   window.innerWidth / window.innerHeight,
    //   0.1,
    //   1000
    // );
    // const renderer = new WebGLRenderer();
    // renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);

    // const backGeo = new PlaneGeometry(100, 100);
    // const backMat = new MeshBasicMaterial({
    //   color: 0xffffff,
    //   side: DoubleSide,
    // });
    // const backPlane = new Mesh(backGeo, backMat);
    // scene.add(backPlane);

    // const geometry = new CylinderGeometry(4, 4, 4, 32, 1);

    // const texture = new CanvasTexture(generateTexture());
    // texture.magFilter = NearestFilter;
    // texture.wrapT = RepeatWrapping;
    // texture.wrapS = RepeatWrapping;
    // texture.repeat.set(1, 3.5);

    // const material = new MeshPhysicalMaterial({
    //   transparent: true,
    //   opacity: 0.9,
    //   depthTest: true,
    //   depthWrite: true,
    //   alphaTest: 0,
    //   visible: true,
    //   side: FrontSide,
    //   // color: 0x753d21,
    //   color: 0x663a15,
    //   emissive: 0x000000,
    //   roughness: 0,
    //   metalness: 0.693,
    //   reflectivity: 0,
    //   clearcoat: 0,
    //   specularIntensity: 1, // ?
    // });
    // const cube = new Mesh(geometry, material);
    // cube.rotation.x = 0.2;
    // scene.add(cube);

    // // const directionalLight = new DirectionalLight(0xffffff, 0.5);
    // // scene.add(directionalLight);

    // const ambientLight = new AmbientLight(0xffffff);
    // scene.add(ambientLight);

    // camera.position.z = 10;

    // function animate() {
    //   requestAnimationFrame(animate);
    //   cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;
    //   renderer.render(scene, camera);
    // }
    // animate();
    // // renderer.render(scene, camera);

    // if (theSpot.current) {
    //   theSpot.current.appendChild(renderer.domElement);
    // }

    const params = {
      color: 0xffffff,
      transmission: 1,
      opacity: 1,
      metalness: 0,
      roughness: 0,
      ior: 1.5,
      thickness: 0.01,
      specularIntensity: 1,
      specularColor: 0xffffff,
      envMapIntensity: 1,
      lightIntensity: 1,
      exposure: 1,
    };

    const hdrEquirect = new RGBELoader()
      .setPath("./")
      .load("royal_esplanade_1k.hdr", function () {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

        const [renderer, scene, camera] = init();
        renderer.render(scene, camera);
      });

    const init = (): [
      THREE.WebGLRenderer,
      THREE.Scene,
      THREE.PerspectiveCamera
    ] => {
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      if (theSpot.current) {
        theSpot.current.appendChild(renderer.domElement);
      }

      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = params.exposure;

      renderer.outputEncoding = THREE.sRGBEncoding;

      const scene = new THREE.Scene();

      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 10);

      const camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        2000
      );
      camera.position.set(0, 30, 120);
      camera.quaternion.copy(quaternion);

      scene.background = hdrEquirect;

      // const geometry = new THREE.SphereGeometry(20, 64, 32);
      const glassGeometry = new THREE.CylinderGeometry(20, 20, 40, 32, 1, true);

      const material = new THREE.MeshPhysicalMaterial({
        color: params.color,
        metalness: params.metalness,
        roughness: params.roughness,
        ior: params.ior,
        // alphaMap: texture,
        envMap: hdrEquirect,
        envMapIntensity: params.envMapIntensity,
        transmission: params.transmission, // use material.transmission for glass materials
        specularIntensity: params.specularIntensity,
        specularColor: new THREE.Color(0xffffff),
        opacity: 0.5,
        side: THREE.DoubleSide,
        transparent: true,
      });

      const drinkGeometry = new THREE.CylinderGeometry(18, 18, 15);

      const glassMesh = new THREE.Mesh(glassGeometry, material);
      glassMesh.position.copy(new THREE.Vector3(18, 0, 0));

      const drinkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x663a15,
        metalness: params.metalness,
        roughness: params.roughness,
        ior: params.ior,
        // alphaMap: texture,
        envMap: hdrEquirect,
        envMapIntensity: params.envMapIntensity,
        transmission: params.transmission, // use material.transmission for glass materials
        specularIntensity: params.specularIntensity,
        specularColor: new THREE.Color(0xffffff),
        opacity: params.opacity,
        side: THREE.DoubleSide,
        transparent: true,
      });

      const drink = new THREE.Mesh(drinkGeometry, drinkMaterial);
      drink.position.copy(new THREE.Vector3(0, -15, 0));
      // drink.quaternion.copy(quaternion);
      // drink.rotation.x = 0.5;

      const drinkMaterial2 = new THREE.MeshPhysicalMaterial({
        color: 0xdabe37,
        metalness: params.metalness,
        roughness: params.roughness,
        ior: params.ior,
        // alphaMap: texture,
        envMap: hdrEquirect,
        envMapIntensity: params.envMapIntensity,
        transmission: params.transmission, // use material.transmission for glass materials
        specularIntensity: params.specularIntensity,
        specularColor: new THREE.Color(0xffffff),
        opacity: params.opacity,
        side: THREE.DoubleSide,
        transparent: true,
      });

      const drink2 = new THREE.Mesh(drinkGeometry, drinkMaterial2);
      // drink2.position.copy(new THREE.Vector3(0, 0, 0));
      // drink2.quaternion.copy(quaternion);
      // drink2.rotation.x = 0.5;

      scene.add(glassMesh, drink, drink2);

      return [renderer, scene, camera];
    };
  });
  return (
    <section>
      <div ref={theSpot} />
    </section>
  );
}
// ?
function generateTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("no context");
  }
  context.fillStyle = "white";
  context.fillRect(0, 1, 2, 1);

  return canvas;
}
