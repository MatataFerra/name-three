import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  type RapierRigidBody,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { Text3D, Center } from "@react-three/drei";

extend({ MeshLineGeometry, MeshLineMaterial });

// Make RigidBody physics a bit more realistic
const segmentProps = {
  type: "dynamic",
  canSleep: true,
  colliders: false,
  angularDamping: 1,
  linearDamping: 2,
} as const;

export default function Badge({ maxSpeed = 50, minSpeed = 10, letter = "M", position = 0 }) {
  // References for the band and the joints
  const band = useRef<THREE.Mesh<MeshLineGeometry, MeshLineMaterial>>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);

  // Reference for the card and some vector values
  const card = useRef<RapierRigidBody>(null);
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  // A Catmull-Rom curve
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  // Connect band joints
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);

  // Connect card to band
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 0.5, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (
      !fixed.current ||
      !j1.current ||
      !j2.current ||
      !j3.current ||
      !band.current ||
      !card.current
    )
      return;

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      // biome-ignore lint/complexity/noForEach: <explanation>
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    // Fix most of the band jitter when over pulling the card (https://codesandbox.io/s/sweet-galois-3fw3wq?file=/App.js:3796-3849)
    const [j1Lerped, j2Lerped] = [j1, j2].map((ref) => {
      if (ref.current) {
        const lerped = new THREE.Vector3().copy(ref.current.translation());

        const clampedDistance = Math.max(
          0.1,
          Math.min(1, lerped.distanceTo(ref.current.translation()))
        );

        return lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      }
    });

    // Calculate Catmull curve for band
    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(j2Lerped ?? j2.current.translation());
    curve.points[2].copy(j1Lerped ?? j1.current.translation());
    curve.points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(32));

    // Tilt the card back towards the screen
    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.5, z: ang.z }, false);
  });

  curve.curveType = "chordal";

  return (
    <>
      <group position={[0, 14, 0]}>
        {/* Band */}
        <RigidBody ref={fixed} type="fixed" position={[position, 0, 0]} />
        <RigidBody position={[0.1, 0, 0]} {...segmentProps} ref={j1}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} {...segmentProps} ref={j2}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.5, 0, 0]} {...segmentProps} ref={j3}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <mesh ref={band}>
          <meshLineGeometry />
          <meshLineMaterial
            color="black"
            depthTest={false}
            useMap={0}
            repeat={new THREE.Vector2(2, 1)}
            lineWidth={0.005}
          />
        </mesh>

        {/* Card */}
        <RigidBody ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[1, 0.2, 0.01]} />
          <Center top>
            <Text3D
              curveSegments={50}
              bevelEnabled
              bevelSize={0.04}
              bevelThickness={0.1}
              height={0}
              lineHeight={0}
              letterSpacing={0}
              size={1}
              position={[0, 0, 0]}
              font="./assets/Inter_bold.json"
              onPointerOver={() => hover(true)}
              onPointerOut={() => hover(false)}
              onPointerUp={() => drag(false)}
              onPointerDown={(evt) =>
                card.current &&
                drag(new THREE.Vector3().copy(evt.point).sub(vec.copy(card.current.translation())))
              }>
              {letter.toUpperCase()}
              <meshNormalMaterial />
            </Text3D>
          </Center>
        </RigidBody>
      </group>
    </>
  );
}
