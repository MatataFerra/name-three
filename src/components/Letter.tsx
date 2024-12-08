import { useRef, useState } from "react";
import * as THREE from "three";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Text3D, Center } from "@react-three/drei";

interface LetterProps {
  letter: string;
  position?: [number, number, number];
  font: string;
  size?: number;
}

const Letter: React.FC<LetterProps> = ({ letter, position = [0, 0, 0], font, size = 2 }) => {
  const ref = useRef<THREE.Group>(null);
  const vec = new THREE.Vector3();
  const [dragged, setDragged] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <RigidBody ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
      <CuboidCollider args={[0.5, 0.5, 0.01]} />
      <Center rotation={[0, 0, 0]}>
        <Text3D
          curveSegments={20}
          bevelEnabled
          bevelSize={0.04}
          bevelThickness={0.1}
          height={0}
          lineHeight={0}
          letterSpacing={0}
          size={0.5}
          position={[0, 1, 0]}
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
  );
};

export default Letter;
