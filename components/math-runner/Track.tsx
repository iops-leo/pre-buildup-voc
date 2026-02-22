import { RigidBody } from "@react-three/rapier";

export default function Track({ position = [0, 0, 0], length = 100 }: { position?: [number, number, number], length?: number }) {
    const [x, y, z] = position;
    return (
        <RigidBody type="fixed" colliders="cuboid">
            {/* Ground */}
            <mesh receiveShadow position={[x, y - 0.5, z - length / 2]}>
                <boxGeometry args={[20, 1, length]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>

            {/* Left Wall */}
            <mesh receiveShadow position={[x - 5, y + 0.5, z - length / 2]}>
                <boxGeometry args={[1, 2, length]} />
                <meshStandardMaterial color="#cccccc" />
            </mesh>

            {/* Right Wall */}
            <mesh receiveShadow position={[x + 5, y + 0.5, z - length / 2]}>
                <boxGeometry args={[1, 2, length]} />
                <meshStandardMaterial color="#cccccc" />
            </mesh>
        </RigidBody>
    );
}
