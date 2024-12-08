/** @jsxImportSource react */

import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import Badge from "./Badge";
import { Center, Float } from "@react-three/drei";
import { useControls } from "leva";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useIsVisible } from "../hooks/isVisible";

const styles: CSSProperties = {};

const CACHE_VALUE = "not-centered";

export default function CanvasComponent({
  letter = "M",
  cssClass,
}: {
  letter: string;
  cssClass?: string;
}) {
  const { debug } = useControls({ debug: false });
  const [keycache, setChache] = useState<string | null>(null);
  const canvasRef = useRef(null);
  const isCanvasVisible = useIsVisible(canvasRef);

  useEffect(() => {
    if (isCanvasVisible) {
      return setChache("canvas-center-key");
    }

    // return () => setChache("not-center");
  }, [isCanvasVisible]);

  return (
    <Canvas style={styles} ref={canvasRef}>
      <ambientLight intensity={Math.PI} />
      <Center cacheKey={keycache} top>
        {letter.split("").map((l, i) => (
          <Physics key={l + i.toString()} debug={debug} timeStep={1 / 60}>
            <Badge letter={l} position={i} />
          </Physics>
        ))}
      </Center>
    </Canvas>
  );
}
