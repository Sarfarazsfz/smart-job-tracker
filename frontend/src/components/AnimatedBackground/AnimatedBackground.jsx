import { Canvas } from '@react-three/fiber'
import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Flowing wave particles
function WaveParticles() {
    const pointsRef = useRef()
    const count = 3000

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const gridSize = 60
        const spacing = 1.5

        for (let i = 0; i < count; i++) {
            const x = (i % gridSize) * spacing - (gridSize * spacing) / 2
            const z = Math.floor(i / gridSize) * spacing - (gridSize * spacing) / 2
            const y = 0

            pos[i * 3] = x
            pos[i * 3 + 1] = y
            pos[i * 3 + 2] = z
        }
        return pos
    }, [])

    useFrame((state) => {
        if (!pointsRef.current) return

        const time = state.clock.elapsedTime
        const positions = pointsRef.current.geometry.attributes.position.array

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const x = positions[i3]
            const z = positions[i3 + 2]

            // Create flowing wave effect (slower)
            positions[i3 + 1] =
                Math.sin(x * 0.1 + time * 0.2) * 3 +
                Math.cos(z * 0.1 + time * 0.15) * 3 +
                Math.sin((x + z) * 0.05 + time * 0.18) * 2
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true
        pointsRef.current.rotation.y = time * 0.02
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#6366f1"
                transparent
                opacity={0.4}
                sizeAttenuation={true}
            />
        </points>
    )
}

// Elegant floating orbs with gradient colors
function GradientOrbs() {
    const groupRef = useRef()

    const orbs = useMemo(() => [
        { position: [-20, 10, -10], scale: 4, color: '#818cf8', speed: 0.3 },
        { position: [25, -15, -20], scale: 5, color: '#a78bfa', speed: 0.4 },
        { position: [-15, -20, 10], scale: 3.5, color: '#c084fc', speed: 0.35 },
        { position: [20, 15, 5], scale: 4.5, color: '#e879f9', speed: 0.25 },
        { position: [0, 0, -30], scale: 6, color: '#6366f1', speed: 0.2 },
    ], [])

    useFrame((state) => {
        if (!groupRef.current) return

        groupRef.current.children.forEach((child, i) => {
            const time = state.clock.elapsedTime
            child.position.y += Math.sin(time * orbs[i].speed + i * 2) * 0.008
            child.position.x += Math.cos(time * orbs[i].speed * 0.7 + i) * 0.006
            child.rotation.x = time * 0.03
            child.rotation.y = time * 0.05
        })
    })

    return (
        <group ref={groupRef}>
            {orbs.map((orb, i) => (
                <mesh key={i} position={orb.position} scale={orb.scale}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial
                        color={orb.color}
                        emissive={orb.color}
                        emissiveIntensity={0.2}
                        transparent
                        opacity={0.15}
                        roughness={0.1}
                        metalness={0.9}
                    />
                </mesh>
            ))}
        </group>
    )
}

// Sparkling particles
function SparkleParticles() {
    const pointsRef = useRef()
    const count = 150

    const { positions, sizes } = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const size = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 100
            pos[i * 3 + 1] = (Math.random() - 0.5) * 100
            pos[i * 3 + 2] = (Math.random() - 0.5) * 60
            size[i] = Math.random() * 2 + 0.5
        }

        return { positions: pos, sizes: size }
    }, [])

    useFrame((state) => {
        if (!pointsRef.current) return

        const time = state.clock.elapsedTime
        pointsRef.current.rotation.y = time * 0.01

        // Twinkling effect (slower)
        pointsRef.current.material.opacity = 0.6 + Math.sin(time * 0.8) * 0.2
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.8}
                color="#fbbf24"
                transparent
                opacity={0.6}
                sizeAttenuation={true}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

export default function AnimatedBackground({ enabled = true }) {
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains('dark')
            setIsDarkMode(isDark)
        }

        checkDarkMode()

        const observer = new MutationObserver(checkDarkMode)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })

        return () => observer.disconnect()
    }, [])

    // Only show in LIGHT MODE (not in dark mode)
    if (!enabled || isDarkMode) {
        return null
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                background: 'linear-gradient(180deg, rgba(238, 242, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50%, rgba(250, 245, 255, 0.3) 100%)',
                opacity: 1
            }}
        >
            <Canvas
                camera={{ position: [0, 20, 60], fov: 60 }}
                style={{ width: '100%', height: '100%' }}
            >
                <ambientLight intensity={0.6} />
                <pointLight position={[30, 30, 30]} intensity={0.8} color="#a78bfa" />
                <pointLight position={[-30, -30, -30]} intensity={0.6} color="#818cf8" />
                <spotLight position={[0, 50, 0]} intensity={0.5} angle={0.6} penumbra={1} color="#e0e7ff" />

                {/* Flowing wave grid */}
                <WaveParticles />

                {/* Large gradient orbs */}
                <GradientOrbs />

                {/* Sparkling particles */}
                <SparkleParticles />
            </Canvas>
        </div>
    )
}
