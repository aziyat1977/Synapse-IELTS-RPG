import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const HEX_RADIUS = 1;
const HEX_HEIGHT = 0.2;

const HexTile = ({ q, r, node, onSelect, isSelected }) => {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    // Convert axial (q, r) to pixel (x, z) coordinates
    const x = HEX_RADIUS * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const z = HEX_RADIUS * (3 / 2) * r;

    const color = useMemo(() => {
        if (!node) return '#1a1d3a'; // Empty tile
        switch (node.type) {
            case 'vocabulary': return '#8b5cf6';
            case 'grammar': return '#3b82f6';
            case 'phonetics': return '#f59e0b';
            case 'coherence': return '#10b981';
            default: return '#6366f1';
        }
    }, [node]);

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            if (isSelected) {
                meshRef.current.position.y = Math.sin(time * 2) * 0.1 + 0.3;
            } else if (hovered) {
                meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0.2, 0.1);
            } else {
                meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 0.1);
            }
        }
    });

    return (
        <group position={[x, 0, z]}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={() => node && onSelect(node)}
            >
                <cylinderGeometry args={[HEX_RADIUS * 0.95, HEX_RADIUS * 0.95, HEX_HEIGHT, 6]} />
                <meshStandardMaterial
                    color={hovered || isSelected ? color : '#2d336b'}
                    emissive={color}
                    emissiveIntensity={isSelected ? 1 : hovered ? 0.5 : 0.1}
                    metalness={0.8}
                    roughness={0.2}
                />

                {node && (
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <Text
                            position={[0, 0.5, 0]}
                            fontSize={0.2}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                            font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4Cs97y_p68dHS4K266i5k_f_q.woff"
                        >
                            {node.title}
                        </Text>
                        <mesh position={[0, HEX_HEIGHT + 0.1, 0]}>
                            <sphereGeometry args={[0.1, 16, 16]} />
                            <MeshDistortMaterial
                                speed={3}
                                distort={0.4}
                                color={color}
                                emissive={color}
                                emissiveIntensity={2}
                            />
                        </mesh>
                    </Float>
                )}
            </mesh>

            {/* Hex Border */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <ringGeometry args={[HEX_RADIUS * 0.98, HEX_RADIUS * 1.02, 6]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
        </group>
    );
};

export function HexGrid({ nodes, onNodeSelect, selectedNodeId }) {
    // Generate a small grid of hexes around the center
    const grid = useMemo(() => {
        const hexes = [];
        const range = 3;
        for (let q = -range; q <= range; q++) {
            for (let r = -range; r <= range; r++) {
                if (Math.abs(q + r) <= range) {
                    const node = nodes?.find(n => n.coordinates.q === q && n.coordinates.r === r);
                    hexes.push({ q, r, node });
                }
            }
        }
        return hexes;
    }, [nodes]);

    return (
        <group>
            {grid.map((hex, i) => (
                <HexTile
                    key={`${hex.q}-${hex.r}`}
                    {...hex}
                    isSelected={selectedNodeId === hex.node?.id}
                    onSelect={onNodeSelect}
                />
            ))}
        </group>
    );
}
