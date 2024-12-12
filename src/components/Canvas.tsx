/** @jsxImportSource react */

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import Badge from "./Badge";
import { Center } from "@react-three/drei";
import { useControls } from "leva";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useIsVisible } from "../hooks/isVisible";

const styles: CSSProperties = {
  height: "100vh",
  display: "block",
};

function Cnvas({
  letter = "M",
  top = false,
  yPosition,
  cache,
  chordLen = 0,
}: {
  letter: string;
  top?: boolean;
  cache?: string;
  yPosition: number;
  chordLen?: number;
}) {
  const { debug } = useControls({ debug: false });

  return (
    <>
      <ambientLight intensity={Math.PI} />
      <Center position={[0, yPosition, 0]} top={top}>
        <group position={[0, 0, 0]}>
          <Physics debug={debug} timeStep={1 / 60}>
            {letter.split("").map((l, i) => (
              <Badge key={l + i.toString()} letter={l} position={i} chordLen={chordLen} />
            ))}
          </Physics>
        </group>
      </Center>
    </>
  );
}

export default function CanvasComponent({ letter = "M" }: { letter: string; cssClass?: string }) {
  const [position, setPosition] = useState<number>(0);
  const canvasRef = useRef(null);
  const isCanvasVisible = useIsVisible(canvasRef);

  useEffect(() => {
    setTimeout(() => setPosition(4), 100);
  }, []);

  return (
    <>
      <Canvas style={styles} ref={canvasRef} camera={{ position: [0, 0, 35], fov: 15 }}>
        <Cnvas letter={"ferraro"} top={isCanvasVisible} yPosition={position} chordLen={2} />
        <Cnvas letter={letter} top={isCanvasVisible} yPosition={position} />
      </Canvas>
    </>
  );
}
