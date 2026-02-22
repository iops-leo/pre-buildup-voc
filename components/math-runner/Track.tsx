import { RigidBody } from "@react-three/rapier";

export default function Track({ position = [0, 0, 0], length = 100 }: { position?: [number, number, number], length?: number }) {
    const [x, y, z] = position;
    return (
        <RigidBody type="fixed" colliders="cuboid">
            {/* Ground */}
            <mesh receiveShadow position={[x, y - 0.15, z - length / 2]}>
                <boxGeometry args={[12, 0.3, length]} />
                <meshStandardMaterial color="#4dd0e1" />
            </mesh>

            {/* Left Edge Strip */}
            <mesh receiveShadow position={[x - 5.925, y + 0.01, z - length / 2]}>
                <boxGeometry args={[0.15, 0.3, length]} />
                <meshStandardMaterial color="#00acc1" />
            </mesh>

            {/* Right Edge Strip */}
            <mesh receiveShadow position={[x + 5.925, y + 0.01, z - length / 2]}>
                <boxGeometry args={[0.15, 0.3, length]} />
                <meshStandardMaterial color="#00acc1" />
            </mesh>
        </RigidBody>
    );
}
