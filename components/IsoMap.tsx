
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { MapControls, SoftShadows, Float, Outlines, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Grid, BuildingType } from '../types';
import { GRID_SIZE, BUILDINGS } from '../constants';

// --- Constants & Helpers ---
const WORLD_OFFSET = GRID_SIZE / 2 - 0.5;
const gridToWorld = (x: number, y: number) => [x - WORLD_OFFSET, 0, y - WORLD_OFFSET] as [number, number, number];
const getHash = (x: number, y: number) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;

// Accurate Stanford color palette
const COLORS = {
  sandstone: '#d4b896',
  sandstoneLight: '#e8d4b4',
  sandstoneDark: '#c4a57a',
  sandstoneShadow: '#a89070',
  terracotta: '#9c4a3a',
  terracottaDark: '#7a3a2a',
  mosaicGold: '#c9a84c',
  windowDark: '#2a3a4a',
  crossGold: '#d4a84c',
  ground: '#c4a878',
};

// Diversity Palettes
const SKIN_TONES = [
    '#ffe0bd', // Pale
    '#ffcd94', // Fair
    '#eac086', // Light Tan
    '#d2b48c', // Tan
    '#a67c52', // Medium Brown
    '#8d5524', // Brown
    '#5e3c25', // Dark Brown
    '#3b2219', // Very Dark
];

const HAIR_COLORS = [
    '#09090b', // Black
    '#3f2e18', // Dark Brown
    '#6b4a2e', // Brown
    '#a16207', // Bronze
    '#ca8a04', // Blonde
    '#fef3c7', // Platinum
    '#7f1d1d', // Red
    '#d6d3d1', // Gray
];

// --- Shared Geometries ---
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
const coneGeo = new THREE.ConeGeometry(1, 1, 6);
const sphereGeo = new THREE.IcosahedronGeometry(1, 1);
const groundGeo = new THREE.BoxGeometry(1, 0.1, 1);
const torusGeo = new THREE.TorusGeometry(0.45, 0.1, 8, 16);
const circleGeo = new THREE.CircleGeometry(1, 16);
const dodecahedronGeo = new THREE.DodecahedronGeometry(1, 0);

// --- Shared Materials (Performance Optimization) ---
const grassMat = new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 1 });
const pavedMat = new THREE.MeshStandardMaterial({ color: '#d6d3d1', roughness: 0.8 });

// Tree Materials
const oakTrunkMat = new THREE.MeshStandardMaterial({color: '#573d27'});
const oakLeafLightMat = new THREE.MeshStandardMaterial({color: '#166534', flatShading: true});
const oakLeafDarkMat = new THREE.MeshStandardMaterial({color: '#15803d', flatShading: true});
const oakSeedMat = new THREE.MeshStandardMaterial({color: '#a3e635'});
const oakSaplingStemMat = new THREE.MeshStandardMaterial({color: '#78350f'});
const oakSaplingLeafMat = new THREE.MeshStandardMaterial({color: '#4ade80'});

const pineTrunkMat = new THREE.MeshStandardMaterial({color: '#4a3627'});
const pineLeafMat = new THREE.MeshStandardMaterial({color: '#14532d', flatShading: true});
const pineSeedMat = new THREE.MeshStandardMaterial({color: '#bef264'});
const pineSaplingStemMat = new THREE.MeshStandardMaterial({color: '#573d27'});
const pineSaplingLeafMat = new THREE.MeshStandardMaterial({color: '#86efac'});

const palmTrunkMat = new THREE.MeshStandardMaterial({color: '#5d4037', roughness: 0.9});
const palmLeafMat = new THREE.MeshStandardMaterial({color: '#3f6212', roughness: 0.6});
const palmRingMat = new THREE.MeshStandardMaterial({color: '#3e2723'});
const palmSeedMat = new THREE.MeshStandardMaterial({color: '#573d27'});
const palmSaplingStemMat = new THREE.MeshStandardMaterial({color: '#a0522d'});
const palmSaplingLeafMat = new THREE.MeshStandardMaterial({color: '#84cc16'});

// Decor Materials
const roseBushMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.8 });
const roseFlowerMat = new THREE.MeshStandardMaterial({ color: '#e11d48', emissive: '#be123c', emissiveIntensity: 0.2 });
const hedgeMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 1 });
const woodMat = new THREE.MeshStandardMaterial({ color: '#92400e' });
const metalMat = new THREE.MeshStandardMaterial({ color: '#1f2937' });
const lampLightMat = new THREE.MeshStandardMaterial({ color: '#fef3c7', emissive: '#fcd34d', emissiveIntensity: 2 });
const gardenStoneMat = new THREE.MeshStandardMaterial({ color: '#78716c' });
const gardenDirtMat = new THREE.MeshStandardMaterial({ color: '#573d27' });
const gardenGreenMat = new THREE.MeshStandardMaterial({ color: '#4ade80' });
const gardenFlowerMat = new THREE.MeshStandardMaterial({ color: '#a855f7' });

// Arrillaga Materials
const arrillagaSandstone = new THREE.MeshStandardMaterial({ color: '#FDFCF5', roughness: 0.9 });
const arrillagaDarkSandstone = new THREE.MeshStandardMaterial({ color: '#d4c4a0', roughness: 0.9 });
const arrillagaRoof = new THREE.MeshStandardMaterial({ color: '#A03C31', roughness: 0.8 });
const arrillagaFrames = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.5, metalness: 0.2 });
const arrillagaGlass = new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0, metalness: 0.9 });
const arrillagaPavement = new THREE.MeshStandardMaterial({ color: '#EBEBE9', roughness: 0.9 });
const arrillagaFurnitureWood = new THREE.MeshStandardMaterial({ color: '#8D6E63', roughness: 0.6 });
const arrillagaFurnitureMetal = new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.4 });
const arrillagaFabric = new THREE.MeshStandardMaterial({ color: '#F5F5DC', roughness: 1 });
const arrillagaBush = new THREE.MeshStandardMaterial({ color: '#2E7D32', roughness: 1, flatShading: true });


// --- Particle System (Object Pooling) ---

const MAX_PARTICLES = 500;

class ParticlePool {
    positions: Float32Array;
    lives: Float32Array;
    scales: Float32Array;
    count: number;

    constructor(size: number) {
        this.positions = new Float32Array(size * 3);
        this.lives = new Float32Array(size);
        this.scales = new Float32Array(size);
        this.count = 0;
    }

    spawn(x: number, y: number, z: number) {
        if (this.count >= MAX_PARTICLES) return;
        
        const i = this.count;
        this.positions[i * 3] = x;
        this.positions[i * 3 + 1] = y;
        this.positions[i * 3 + 2] = z;
        this.lives[i] = 1.0;
        this.scales[i] = 0.1 + Math.random() * 0.1;
        this.count++;
    }

    update(delta: number, dummy: THREE.Object3D, mesh: THREE.InstancedMesh) {
        if (this.count === 0) {
            if (mesh.count > 0) {
                mesh.count = 0;
                mesh.instanceMatrix.needsUpdate = true;
            }
            return;
        }

        let aliveCount = 0;

        for (let i = 0; i < this.count; i++) {
            // Update logic
            this.lives[i] -= delta * 0.8;
            
            if (this.lives[i] > 0) {
                // Physics
                this.positions[i * 3 + 1] += delta * 0.5; // Rise
                this.scales[i] += delta * 0.2; // Expand

                // Set Matrix
                dummy.position.set(
                    this.positions[i * 3],
                    this.positions[i * 3 + 1],
                    this.positions[i * 3 + 2]
                );
                dummy.scale.set(this.scales[i], this.scales[i], this.scales[i]);
                dummy.rotation.set(0,0,0);
                dummy.updateMatrix();
                
                // Compaction
                if (i !== aliveCount) {
                    this.positions[aliveCount * 3] = this.positions[i * 3];
                    this.positions[aliveCount * 3 + 1] = this.positions[i * 3 + 1];
                    this.positions[aliveCount * 3 + 2] = this.positions[i * 3 + 2];
                    this.lives[aliveCount] = this.lives[i];
                    this.scales[aliveCount] = this.scales[i];
                }
                
                mesh.setMatrixAt(aliveCount, dummy.matrix);
                
                // Color fade
                const gray = this.lives[aliveCount] * 0.5 + 0.5;
                mesh.setColorAt(aliveCount, new THREE.Color(gray, gray, gray));
                
                aliveCount++;
            }
        }

        this.count = aliveCount;
        mesh.count = aliveCount;
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
}

// --- Textures & Helper Components ---

const createMosaicTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#d4a84c');
  gradient.addColorStop(0.3, '#c9a048');
  gradient.addColorStop(0.6, '#b89040');
  gradient.addColorStop(1, '#a88038');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x += 4) {
    for (let y = 0; y < canvas.height; y += 4) {
      const hue = 38 + Math.random() * 10;
      const sat = 55 + Math.random() * 15;
      const light = 50 + Math.random() * 20;
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.15)`;
      ctx.fillRect(x, y, 3, 3);
    }
  }

  // Simplified figure drawing for texture
  ctx.fillStyle = '#b89040';
  ctx.fillRect(0, 0, canvas.width, 40);
  ctx.fillStyle = '#8a6a2a';
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const createEntranceMosaic = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#3a5a8c');
  gradient.addColorStop(0.5, '#2a4a7c');
  gradient.addColorStop(1, '#1a3a6c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#d4a84c';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const RomanesqueArch = ({ position, scale = 1, rotation = [0, 0, 0] }: any) => {
  return (
    <group position={position} rotation={rotation}>
      {[0.75, 0.65, 0.55].map((r, i) => (
        <mesh key={i} position={[0, 1.8 * scale, -i * 0.12]}>
          <torusGeometry args={[r * scale, 0.08 * scale, 8, 24, Math.PI]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? COLORS.sandstoneDark : COLORS.sandstoneLight} 
            roughness={0.7} 
          />
        </mesh>
      ))}
      
      {[-0.75, 0.75].map((x, i) => (
        <group key={i}>
          <mesh position={[x * scale, 0.9 * scale, 0]} castShadow>
            <cylinderGeometry args={[0.1 * scale, 0.12 * scale, 1.8 * scale, 12]} />
            <meshStandardMaterial color={COLORS.sandstoneLight} roughness={0.65} />
          </mesh>
          <mesh position={[x * scale, 0.08 * scale, 0]}>
            <boxGeometry args={[0.3 * scale, 0.15 * scale, 0.25 * scale]} />
            <meshStandardMaterial color={COLORS.sandstoneDark} roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const ConicalTower = ({ position }: any) => {
  return (
    <group position={position}>
      <mesh position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.35, 6, 16]} />
        <meshStandardMaterial color={COLORS.sandstone} roughness={0.72} />
      </mesh>
      <mesh position={[0, 8, 0]} castShadow>
        <coneGeometry args={[1.5, 3, 16]} />
        <meshStandardMaterial color={COLORS.terracotta} roughness={0.7} />
      </mesh>
    </group>
  );
};

const ArcadeWing = ({ position, direction = 1 }: any) => {
  return (
    <group position={position}>
      <mesh position={[0, 2.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, 4.5, 4.5]} />
        <meshStandardMaterial color={COLORS.sandstone} roughness={0.72} />
      </mesh>
      {[-1.85, 0.05, 1.95].map((x, i) => (
        <RomanesqueArch key={i} position={[x, 0.4, 2.26]} scale={0.7} />
      ))}
      <mesh position={[0, 5.1, 0]} rotation={[0, 0, 0.08 * direction]} castShadow>
        <boxGeometry args={[10, 0.5, 5.5]} />
        <meshStandardMaterial color={COLORS.terracotta} roughness={0.7} />
      </mesh>
    </group>
  );
};

// --- Procedural Assets ---

const StanfordMemorialChurch = () => {
    const churchRef = useRef<THREE.Group>(null);
    const mosaicTexture = useMemo(() => createMosaicTexture(), []);
    const entranceMosaicTexture = useMemo(() => createEntranceMosaic(), []);

    const pedimentShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-5.5, 0);
        shape.lineTo(0, 4.5);
        shape.lineTo(5.5, 0);
        shape.lineTo(-5.5, 0);
        return shape;
    }, []);

    useFrame((state) => {
        if (churchRef.current) {
            churchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.005;
        }
    });

    return (
        <group ref={churchRef} scale={0.35}>
             {/* Main Body */}
            <mesh position={[0, 3.9, -1]} castShadow receiveShadow>
                <boxGeometry args={[11, 7, 9]} />
                <meshStandardMaterial color={COLORS.sandstone} roughness={0.72} />
            </mesh>

            {/* Pediment */}
            <group position={[0, 7.4, 3.5]}>
                <mesh castShadow>
                    <extrudeGeometry args={[pedimentShape, { depth: 0.8, bevelEnabled: false }]} />
                    <meshStandardMaterial color={COLORS.sandstoneLight} roughness={0.7} />
                </mesh>
                <mesh position={[0, 1.8, 0.81]} receiveShadow={false} castShadow={false}>
                    <planeGeometry args={[9.5, 3.8]} />
                    <meshStandardMaterial 
                        map={mosaicTexture} 
                        roughness={0.9} 
                        emissive={COLORS.mosaicGold} 
                        emissiveIntensity={0.15} 
                        polygonOffset 
                        polygonOffsetFactor={-4} 
                    />
                </mesh>
            </group>

            {/* Entrance Mosaic Band */}
            <mesh position={[0, 3.4, 4.02]} receiveShadow={false} castShadow={false}>
                <planeGeometry args={[9, 0.8]} />
                <meshStandardMaterial 
                    map={entranceMosaicTexture} 
                    roughness={0.9}
                    polygonOffset
                    polygonOffsetFactor={-4} 
                />
            </mesh>

            {/* Main Entrance Arches */}
            <RomanesqueArch position={[0, 0.4, 4]} scale={1.3} />
            <RomanesqueArch position={[-2.6, 0.4, 4]} scale={0.9} />
            <RomanesqueArch position={[2.6, 0.4, 4]} scale={0.9} />

            {/* Arcade Wings */}
            <ArcadeWing position={[-10, 0, 0.5]} direction={-1} />
            <ArcadeWing position={[10, 0, 0.5]} direction={1} />

            {/* Conical Towers */}
            <ConicalTower position={[-6, 0.4, 0]} />
            <ConicalTower position={[6, 0.4, 0]} />

            {/* Main Roof */}
            <mesh position={[0, 7.7, -1]} castShadow>
                <boxGeometry args={[12, 0.6, 10]} />
                <meshStandardMaterial color={COLORS.terracotta} roughness={0.7} />
            </mesh>
        </group>
    )
}

const EngineeringQuadModel = () => {
    // Specific colors for SEQ to match reference
    const SEQ_COLORS = {
        sandstone: "#E6D7B9",
        roof: "#A03C31",
        grass: "#558B2F",
        pavement: "#F0F0EE",
        solar: "#2F3542",
        window: "#2C3E50",
        white: "#FFFFFF",
        treeTrunk: "#5D4037",
        treeLeaves: "#33691E"
    };

    const sandstone = useMemo(() => new THREE.MeshStandardMaterial({ color: SEQ_COLORS.sandstone, roughness: 0.8 }), []);
    const roof = useMemo(() => new THREE.MeshStandardMaterial({ color: SEQ_COLORS.roof, roughness: 0.9 }), []);
    const windowMat = useMemo(() => new THREE.MeshStandardMaterial({ color: SEQ_COLORS.window, roughness: 0.2, metalness: 0.5 }), []);
    const solarPanel = useMemo(() => new THREE.MeshStandardMaterial({ color: SEQ_COLORS.solar, metalness: 0.8, roughness: 0.2 }), []);
    const grass = useMemo(() => new THREE.MeshStandardMaterial({ color: SEQ_COLORS.grass }), []);
    const pavement = useMemo(() => new THREE.MeshStandardMaterial({ color: SEQ_COLORS.pavement }), []);
    const whiteRoof = useMemo(() => new THREE.MeshStandardMaterial({ color: SEQ_COLORS.white }), []);
    const treeTrunk = useMemo(() => new THREE.MeshStandardMaterial({ color: SEQ_COLORS.treeTrunk }), []);
    const treeLeaves = useMemo(() => new THREE.MeshStandardMaterial({ color: SEQ_COLORS.treeLeaves }), []);

    const BuildingBlock = ({ position, args, rotation = [0, 0, 0] }: any) => {
        const [width, height, depth] = args || [1, 1, 1];
        const roofHeight = 1.5;

        return (
            <group position={position} rotation={rotation}>
                <mesh position={[0, height / 2, 0]} geometry={boxGeo} material={sandstone} scale={[width, height, depth]} castShadow />
                <mesh position={[0, height * 0.4, depth / 2 + 0.01]} material={sandstone}>
                     <planeGeometry args={[width * 0.9, height * 0.5]} />
                </mesh>
                {Array.from({ length: Math.floor(width / 2) }).map((_, i) => (
                    <mesh key={i} position={[ -width/2 + 1 + (i * 2), height * 0.3, depth/2 + 0.02]} material={windowMat}>
                        <planeGeometry args={[1, height * 0.4]} />
                    </mesh>
                ))}
                <mesh position={[0, height + roofHeight / 2, 0]} material={roof} castShadow>
                     <cylinderGeometry args={[width * 0.8 * 0.5, (width + 0.2) * 0.5, roofHeight, 4]} />
                </mesh>
                <mesh position={[0, height + roofHeight * 0.3, 0]} rotation={[-0.1, 0, 0]} material={solarPanel} castShadow>
                    <boxGeometry args={[width * 0.6, 0.1, depth * 0.5]} />
                </mesh>
            </group>
        );
    };

    const LShapedBuilding = ({ position, rotation = [0, 0, 0] }: any) => (
        <group position={position} rotation={rotation}>
             <BuildingBlock position={[0, 0, 0]} args={[12, 4, 4]} />
             <BuildingBlock position={[-5, 0, 5]} args={[4, 4, 8]} rotation={[0, 0, 0]} />
        </group>
    );

    const Rotunda = ({ position }: any) => (
        <group position={position}>
             <mesh position={[0, 2, 0]} material={sandstone} castShadow>
                 <cylinderGeometry args={[3.5, 3.5, 4, 8]} />
             </mesh>
             <mesh position={[0, 4.5, 0]} material={whiteRoof}>
                 <coneGeometry args={[4, 1.5, 8]} />
             </mesh>
        </group>
    );
    
    return (
        <group scale={0.15}>
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} material={pavement} receiveShadow>
                <planeGeometry args={[40, 40]} />
             </mesh>
             <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 5]} geometry={circleGeo} material={grass} scale={3} receiveShadow />
             <mesh rotation={[-Math.PI/2, 0, 0]} position={[5, 0.1, -5]} geometry={circleGeo} material={grass} scale={2.5} receiveShadow />
             <mesh rotation={[-Math.PI/2, 0, 0]} position={[-4, 0.1, -8]} geometry={circleGeo} material={grass} scale={3.5} receiveShadow />
             <LShapedBuilding position={[-15, 0, -15]} rotation={[0, 0, 0]} />
             <LShapedBuilding position={[15, 0, -15]} rotation={[0, -Math.PI/2, 0]} />
             <LShapedBuilding position={[-15, 0, 15]} rotation={[0, Math.PI/2, 0]} />
             <LShapedBuilding position={[15, 0, 15]} rotation={[0, Math.PI, 0]} />
             <Rotunda position={[8, 0, 5]} />
             {[[-2, -25], [2, -25], [-2, -20], [2, -20], [10, 5], [-10, 8]].map((pos, i) => (
                 <group key={i} position={[pos[0], 0, pos[1]]}>
                     <mesh position={[0, 1, 0]} geometry={cylinderGeo} material={treeTrunk} scale={[0.2, 2, 0.2]} castShadow />
                     <mesh position={[0, 2.5, 0]} geometry={sphereGeo} material={treeLeaves} scale={1.2} castShadow />
                 </group>
             ))}
        </group>
    )
}

const ArrillagaHallModel = () => {
    // Helper sub-components
    const GridWindow = ({ position, width, height, rows = 3, cols = 3 }: { position: [number, number, number], width: number, height: number, rows?: number, cols?: number }) => {
        const frameThickness = 0.15;
        const mullionThickness = 0.08;
      
        const mullions = useMemo(() => {
          const els = [];
          // Horizontal bars
          for (let i = 1; i < rows; i++) {
              const y = -height/2 + (height/rows) * i;
              els.push(
                  <mesh key={`h-${i}`} position={[0, y, 0]} material={arrillagaFrames}>
                      <boxGeometry args={[width - frameThickness, mullionThickness, frameThickness]} />
                  </mesh>
              );
          }
          // Vertical bars
          for (let i = 1; i < cols; i++) {
              const x = -width/2 + (width/cols) * i;
              els.push(
                  <mesh key={`v-${i}`} position={[x, 0, 0]} material={arrillagaFrames}>
                      <boxGeometry args={[mullionThickness, height - frameThickness, frameThickness]} />
                  </mesh>
              );
          }
          return els;
        }, [width, height, rows, cols]);
      
        return (
          <group position={position}>
              {/* Main Frame */}
              <group>
                  <mesh position={[0, height/2 - frameThickness/2, 0]} material={arrillagaFrames}>
                      <boxGeometry args={[width, frameThickness, frameThickness * 1.5]} />
                  </mesh>
                  <mesh position={[0, -height/2 + frameThickness/2, 0]} material={arrillagaFrames}>
                      <boxGeometry args={[width, frameThickness, frameThickness * 1.5]} />
                  </mesh>
                  <mesh position={[-width/2 + frameThickness/2, 0, 0]} material={arrillagaFrames}>
                      <boxGeometry args={[frameThickness, height, frameThickness * 1.5]} />
                  </mesh>
                  <mesh position={[width/2 - frameThickness/2, 0, 0]} material={arrillagaFrames}>
                      <boxGeometry args={[frameThickness, height, frameThickness * 1.5]} />
                  </mesh>
              </group>
              {mullions}
              <mesh position={[0, 0, -0.02]} material={arrillagaGlass}>
                  <planeGeometry args={[width - 0.1, height - 0.1]} />
              </mesh>
          </group>
        );
      };

      const ArcadeArch = ({ width = 4, height = 4.5, position }: { width?: number, height?: number, position: [number, number, number] }) => {
        const columnWidth = 0.8;
        const openingWidth = width - columnWidth * 2;
        const archRadius = openingWidth / 2;
        
        return (
            <group position={position}>
                <mesh position={[-width/2 + columnWidth/2, height/2, 0]} material={arrillagaSandstone} castShadow receiveShadow>
                    <boxGeometry args={[columnWidth, height, columnWidth]} />
                </mesh>
                 <mesh position={[width/2 - columnWidth/2, height/2, 0]} material={arrillagaSandstone} castShadow receiveShadow>
                    <boxGeometry args={[columnWidth, height, columnWidth]} />
                </mesh>
                <mesh position={[0, height + archRadius/2, 0]} material={arrillagaSandstone}>
                    <boxGeometry args={[width, archRadius, columnWidth]} />
                </mesh>
            </group>
        );
      };

      const HippedRoof = ({ width, depth, height, overhang = 0.5, position }: { width: number, depth: number, height: number, overhang?: number, position: [number, number, number] }) => {
          return (
             <mesh position={position} material={arrillagaRoof} castShadow receiveShadow>
                 <coneGeometry args={[Math.max(width, depth)*0.6, height, 4]} />
             </mesh>
          )
      }

    return (
        <group scale={0.16}>
             {/* Ground Floor Arcade Mass */}
             <mesh position={[0, 2.25, 3]} material={arrillagaSandstone} receiveShadow castShadow>
                <boxGeometry args={[36, 4.5, 4]} />
            </mesh>
            {/* Main Building Body */}
            <mesh position={[0, 5, -2]} material={arrillagaSandstone} receiveShadow castShadow>
                <boxGeometry args={[36, 10, 8]} />
            </mesh>

            {/* Roofs */}
            <HippedRoof width={38} depth={10} height={3.5} overhang={1} position={[0, 11, -2]} />
            <HippedRoof width={37} depth={5} height={1.5} overhang={0.6} position={[0, 5, 3]} />

            {/* Windows */}
            <group position={[0, 2, 2.1]}>
                 <GridWindow position={[-12, 0, 0]} width={5} height={3.5} rows={2} cols={3} />
                 <GridWindow position={[-6, 0, 0]} width={5} height={3.5} rows={2} cols={3} />
                 <GridWindow position={[0, 0, 0]} width={6} height={3.5} rows={2} cols={4} />
                 <GridWindow position={[6, 0, 0]} width={5} height={3.5} rows={2} cols={3} />
                 <GridWindow position={[12, 0, 0]} width={5} height={3.5} rows={2} cols={3} />
            </group>

            {/* Arches */}
            <group position={[-10, 0, 0]}>
                <ArcadeArch position={[-3.5, 0, 5.1]} width={5} height={4} />
                <ArcadeArch position={[3.5, 0, 5.1]} width={5} height={4} />
            </group>
            <group position={[0, 0, 0]}>
                 <mesh position={[0, 7.5, 1.5]} material={arrillagaDarkSandstone}><boxGeometry args={[7, 4, 1]} /></mesh>
                 <ArcadeArch position={[0, 0, 5.1]} width={6} height={4.2} />
            </group>
            <group position={[10, 0, 0]}>
                <ArcadeArch position={[-3.5, 0, 5.1]} width={5} height={4} />
                <ArcadeArch position={[3.5, 0, 5.1]} width={5} height={4} />
            </group>

            {/* Pavement */}
            <mesh position={[0, 0.05, 3]} rotation={[-Math.PI/2, 0, 0]} material={arrillagaPavement} receiveShadow>
                <planeGeometry args={[38, 6]} />
            </mesh>
        </group>
    )
}

const HooverTowerModel = () => {
    return (
        <group scale={1.5}>
             <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.5, 2, 1.5]} />
                <meshStandardMaterial color={COLORS.sandstone} roughness={0.7} />
             </mesh>
             <mesh position={[0, 4, 0]} castShadow>
                <boxGeometry args={[1, 6, 1]} />
                <meshStandardMaterial color={COLORS.sandstone} roughness={0.7} />
             </mesh>
             <mesh position={[0, 4, 0]} castShadow>
                 <boxGeometry args={[1.1, 5.8, 0.8]} />
                 <meshStandardMaterial color={COLORS.sandstoneDark} roughness={0.8} />
             </mesh>
              <mesh position={[0, 4, 0]} castShadow>
                 <boxGeometry args={[0.8, 5.8, 1.1]} />
                 <meshStandardMaterial color={COLORS.sandstoneDark} roughness={0.8} />
             </mesh>
             <mesh position={[0, 7.2, 0]} castShadow>
                <boxGeometry args={[1.2, 0.8, 1.2]} />
                <meshStandardMaterial color={COLORS.sandstoneLight} roughness={0.6} />
             </mesh>
             <mesh position={[0, 7.8, 0]}>
                <cylinderGeometry args={[0.5, 0.6, 0.4, 8]} />
                <meshStandardMaterial color={COLORS.sandstone} />
             </mesh>
             <mesh position={[0, 8.2, 0]} castShadow>
                <sphereGeometry args={[0.5, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={COLORS.terracotta} roughness={0.6} />
             </mesh>
             <mesh position={[0, 8.8, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color={COLORS.crossGold} metalness={0.8} roughness={0.2} />
             </mesh>
        </group>
    )
}

// --- New Decor Models ---

const PicnicTableModel = () => {
    return (
        <group scale={1.1}>
            {/* Table Top */}
            <mesh position={[0, 0.4, 0]} geometry={boxGeo} material={woodMat} scale={[1.2, 0.08, 0.6]} castShadow />
            {/* Legs */}
            <mesh position={[0.4, 0.2, 0]} geometry={boxGeo} material={woodMat} scale={[0.1, 0.4, 0.4]} rotation={[0, 0, -0.2]} castShadow />
            <mesh position={[-0.4, 0.2, 0]} geometry={boxGeo} material={woodMat} scale={[0.1, 0.4, 0.4]} rotation={[0, 0, 0.2]} castShadow />
            {/* Benches */}
            <mesh position={[0, 0.2, 0.6]} geometry={boxGeo} material={woodMat} scale={[1.2, 0.05, 0.3]} castShadow />
            <mesh position={[0, 0.2, -0.6]} geometry={boxGeo} material={woodMat} scale={[1.2, 0.05, 0.3]} castShadow />
            {/* Bench Legs */}
            <mesh position={[0.4, 0.1, 0.6]} geometry={boxGeo} material={woodMat} scale={[0.08, 0.2, 0.2]} />
            <mesh position={[-0.4, 0.1, 0.6]} geometry={boxGeo} material={woodMat} scale={[0.08, 0.2, 0.2]} />
            <mesh position={[0.4, 0.1, -0.6]} geometry={boxGeo} material={woodMat} scale={[0.08, 0.2, 0.2]} />
            <mesh position={[-0.4, 0.1, -0.6]} geometry={boxGeo} material={woodMat} scale={[0.08, 0.2, 0.2]} />
        </group>
    );
};

const StreetLampModel = () => {
    return (
        <group>
            <mesh position={[0, 1.0, 0]} geometry={cylinderGeo} material={metalMat} scale={[0.06, 2.0, 0.06]} castShadow />
            <mesh position={[0, 2.0, 0]} geometry={boxGeo} material={metalMat} scale={[0.3, 0.4, 0.3]} castShadow />
            <mesh position={[0, 2.0, 0]} geometry={boxGeo} material={lampLightMat} scale={[0.2, 0.3, 0.2]} />
            <mesh position={[0, 2.2, 0]} geometry={coneGeo} material={metalMat} scale={[0.4, 0.2, 0.4]} castShadow />
        </group>
    );
};

const RoseBushModel = () => {
    return (
        <group scale={0.8}>
            <mesh position={[0, 0.3, 0]} geometry={sphereGeo} material={roseBushMat} scale={0.6} castShadow />
            {/* Larger blooms for visibility */}
            <mesh position={[0.25, 0.45, 0.2]} geometry={sphereGeo} material={roseFlowerMat} scale={0.18} />
            <mesh position={[-0.2, 0.55, 0.1]} geometry={sphereGeo} material={roseFlowerMat} scale={0.15} />
            <mesh position={[0, 0.35, -0.25]} geometry={sphereGeo} material={roseFlowerMat} scale={0.16} />
            <mesh position={[0.15, 0.25, 0.35]} geometry={sphereGeo} material={roseFlowerMat} scale={0.14} />
            <mesh position={[-0.25, 0.3, -0.1]} geometry={sphereGeo} material={roseFlowerMat} scale={0.15} />
        </group>
    );
};

const GardenBedModel = () => {
    return (
        <group>
            <mesh position={[0, 0.15, 0]} geometry={boxGeo} material={gardenStoneMat} scale={[1.2, 0.3, 1.2]} castShadow />
            <mesh position={[0, 0.25, 0]} geometry={boxGeo} material={gardenDirtMat} scale={[1.0, 0.2, 1.0]} />
            <mesh position={[-0.3, 0.35, -0.3]} geometry={sphereGeo} material={gardenGreenMat} scale={0.2} />
            <mesh position={[0.3, 0.35, 0.3]} geometry={sphereGeo} material={gardenGreenMat} scale={0.25} />
            <mesh position={[-0.3, 0.4, 0.3]} geometry={sphereGeo} material={gardenFlowerMat} scale={0.15} />
            <mesh position={[0.3, 0.4, -0.3]} geometry={sphereGeo} material={gardenFlowerMat} scale={0.15} />
        </group>
    );
};

const HedgeModel = () => {
    return (
        <group>
            <mesh position={[0, 0.5, 0]} geometry={boxGeo} material={hedgeMat} scale={[1.0, 1.0, 0.4]} castShadow />
        </group>
    );
};

const ClawFountainModel = () => {
    const waterMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#38bdf8', transparent: true, opacity: 0.8, roughness: 0.1 }), []);
    const bronzeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#271a0c', metalness: 0.8, roughness: 0.4 }), []);
    const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#78716c', roughness: 0.8 }), []);

    return (
        <group scale={1.2}>
            <mesh position={[0, 0.1, 0]} geometry={cylinderGeo} material={stoneMat} scale={[1.4, 0.2, 1.4]} receiveShadow />
            <mesh position={[0, 0.15, 0]} geometry={cylinderGeo} material={waterMat} scale={[1.25, 0.15, 1.25]} />
            <group position={[0, 0.2, 0]}>
                <mesh position={[0, 0.6, 0]} rotation={[0.2, 0, 0.2]} geometry={cylinderGeo} material={bronzeMat} scale={[0.1, 1.2, 0.1]} castShadow />
                {[0, 2.1, 4.2].map(rot => (
                    <group key={rot} rotation={[0, rot, 0]}>
                        <mesh position={[0.3, 0.5, 0.3]} rotation={[0, 0, -0.6]} geometry={coneGeo} material={bronzeMat} scale={[0.15, 1.0, 0.15]} castShadow />
                         <mesh position={[0.4, 0.8, 0]} rotation={[0.4, 0, -0.4]} geometry={boxGeo} material={bronzeMat} scale={[0.1, 0.5, 0.1]} castShadow />
                    </group>
                ))}
            </group>
        </group>
    );
};

const RodinModel = () => {
    const bronzeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a120b', metalness: 0.7, roughness: 0.5 }), []);
    const plinthMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a8a29e' }), []);

    return (
        <group scale={1.1}>
            <mesh position={[0, 0.15, 0]} geometry={boxGeo} material={plinthMat} scale={[1.4, 0.3, 0.9]} castShadow receiveShadow />
            <group position={[0, 0.3, 0]}>
                {[ -0.4, -0.2, 0, 0.2, 0.4 ].map((x, i) => (
                    <group key={i} position={[x, 0, (i%2)*0.15 - 0.05]} rotation={[0, Math.random()*0.5 + (i%2)*3, 0]}>
                        <mesh position={[0, 0.5, 0]} geometry={cylinderGeo} material={bronzeMat} scale={[0.1, 1.0, 0.1]} castShadow />
                        <mesh position={[0.05, 1.05, 0]} rotation={[0.2, 0, 0]} geometry={sphereGeo} material={bronzeMat} scale={0.1} castShadow />
                         <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0]} geometry={cylinderGeo} material={bronzeMat} scale={[0.16, 0.4, 0.16]} castShadow />
                    </group>
                ))}
            </group>
        </group>
    );
};

const TotemModel = () => {
    const woodMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5c2d15', roughness: 0.8 }), []);
    const paintRed = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9f1239' }), []);
    const paintWhite = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f3f4f6' }), []);
    const paintBlack = useMemo(() => new THREE.MeshStandardMaterial({ color: '#18181b' }), []);
    const paintOchre = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d97706' }), []);

    return (
        <group scale={1.2}>
            <mesh position={[0, 1.2, 0]} geometry={cylinderGeo} material={woodMat} scale={[0.2, 2.4, 0.2]} castShadow />
             <mesh position={[0, 0.6, 0.15]} rotation={[0,0,0]} geometry={boxGeo} material={paintWhite} scale={[0.35, 0.4, 0.1]} />
             <mesh position={[0, 0.6, 0.21]} geometry={sphereGeo} material={paintRed} scale={0.08} />
             <mesh position={[0, 1.4, 0.16]} rotation={[0,0,0]} geometry={boxGeo} material={paintOchre} scale={[0.3, 0.5, 0.1]} />
            <mesh position={[0.1, 1.5, 0.22]} geometry={sphereGeo} material={paintBlack} scale={0.04} />
            <mesh position={[-0.1, 1.5, 0.22]} geometry={sphereGeo} material={paintBlack} scale={0.04} />
             <mesh position={[0, 2.0, 0]} geometry={boxGeo} material={woodMat} scale={[1.0, 0.1, 0.1]} />
             <mesh position={[0, 1.9, 0.2]} rotation={[0.4, 0, 0]} geometry={coneGeo} material={paintBlack} scale={[0.08, 0.4, 0.08]} />
        </group>
    );
}

const StudentDormModel = () => {
    const sandstone = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e7d5b8', roughness: 0.8 }), []);
    const redTile = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8c1515', roughness: 0.6 }), []);
    const windowMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.1 }), []);

    return (
        <group scale={1.3}>
            <mesh geometry={boxGeo} material={sandstone} scale={[1.2, 1.5, 0.6]} position={[-0.2, 0.75, -0.2]} castShadow />
            <mesh geometry={boxGeo} material={sandstone} scale={[0.6, 1.2, 0.6]} position={[0.4, 0.6, -0.2]} castShadow />
            <mesh geometry={coneGeo} material={redTile} scale={[1.4, 0.5, 0.8]} position={[-0.2, 1.75, -0.2]} rotation={[0, 0, 0]} castShadow />
            <mesh geometry={coneGeo} material={redTile} scale={[0.8, 0.4, 0.8]} position={[0.4, 1.4, -0.2]} rotation={[0, 0, 0]} castShadow />
            <mesh geometry={boxGeo} material={windowMat} scale={[0.1, 0.2, 0.05]} position={[-0.5, 1.0, 0.11]} />
            <mesh geometry={boxGeo} material={windowMat} scale={[0.1, 0.2, 0.05]} position={[-0.2, 1.0, 0.11]} />
            <mesh geometry={boxGeo} material={windowMat} scale={[0.1, 0.2, 0.05]} position={[-0.5, 0.5, 0.11]} />
            <mesh geometry={boxGeo} material={windowMat} scale={[0.1, 0.2, 0.05]} position={[-0.2, 0.5, 0.11]} />
        </group>
    )
}

const LectureHallModel = () => {
    const concrete = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a8a29e', roughness: 0.9 }), []);
    const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0ea5e9', roughness: 0.2, metalness: 0.8 }), []);

    return (
        <group scale={1.5}>
             <mesh geometry={boxGeo} material={concrete} scale={[1.4, 0.8, 1.4]} position={[0, 0.4, 0]} castShadow />
             <mesh geometry={boxGeo} material={concrete} scale={[1.0, 0.8, 1.0]} position={[0, 1.0, 0]} castShadow />
             <mesh geometry={boxGeo} material={glass} scale={[0.6, 0.1, 0.6]} position={[0, 1.45, 0]} />
             <mesh geometry={cylinderGeo} material={concrete} scale={[0.1, 0.8, 0.1]} position={[0.5, 0.4, 0.8]} castShadow />
             <mesh geometry={cylinderGeo} material={concrete} scale={[0.1, 0.8, 0.1]} position={[-0.5, 0.4, 0.8]} castShadow />
        </group>
    )
}

const VapeStoreModel = () => {
    const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#171717', roughness: 0.5 }), []);
    const neonPurple = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d8b4fe', emissive: '#a855f7', emissiveIntensity: 2 }), []);
    const neonGreen = useMemo(() => new THREE.MeshStandardMaterial({ color: '#bef264', emissive: '#84cc16', emissiveIntensity: 2 }), []);

    return (
        <group scale={1.6}>
            <mesh geometry={boxGeo} material={darkMat} scale={[1.0, 0.8, 0.8]} position={[0, 0.4, 0]} castShadow />
            <mesh geometry={boxGeo} material={neonPurple} scale={[1.05, 0.05, 0.85]} position={[0, 0.8, 0]} />
            <mesh geometry={boxGeo} material={neonGreen} scale={[0.2, 0.4, 0.05]} position={[0.3, 0.4, 0.42]} />
            <mesh geometry={boxGeo} material={neonPurple} scale={[0.2, 0.4, 0.05]} position={[-0.3, 0.4, 0.42]} />
            <mesh geometry={boxGeo} material={darkMat} scale={[0.6, 0.2, 0.1]} position={[0, 1.0, 0]} />
            <mesh geometry={boxGeo} material={neonGreen} scale={[0.5, 0.05, 0.12]} position={[0, 1.0, 0]} />
        </group>
    )
}

const CoupaCafeModel = () => {
    const greenUmbrella = useMemo(() => new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.4 }), []);
    const whiteStripe = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f0fdf4', roughness: 0.4 }), []);
    const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#78350f' }), []);

    return (
        <group scale={1.2}>
            <mesh geometry={cylinderGeo} material={new THREE.MeshStandardMaterial({color: '#27272a'})} scale={[0.6, 1, 0.6]} position={[0, 0.5, 0]} castShadow />
            <group position={[0, 1.6, 0]}>
                 <mesh geometry={coneGeo} material={greenUmbrella} scale={[1.5, 0.6, 1.5]} castShadow />
                 <mesh geometry={coneGeo} material={whiteStripe} scale={[1.52, 0.1, 1.52]} position={[0, -0.25, 0]} />
            </group>
            <mesh geometry={cylinderGeo} material={new THREE.MeshStandardMaterial({color: '#a1a1aa'})} scale={[0.05, 1.8, 0.05]} position={[0, 0.9, 0]} />
            <mesh geometry={cylinderGeo} material={wood} scale={[0.3, 0.4, 0.3]} position={[0.8, 0.2, 0.8]} castShadow />
            <mesh geometry={cylinderGeo} material={wood} scale={[0.3, 0.4, 0.3]} position={[-0.8, 0.2, 0.5]} castShadow />
        </group>
    )
}

const TennisCourtModel = () => {
    const courtMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.3 }), []); 
    const outerMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.4 }), []); 
    const whiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 }), []);
    const postMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#374151' }), []);
    
    return (
        <group scale={[2.0, 1, 2.0]}>
            <mesh geometry={boxGeo} material={outerMat} scale={[1.5, 0.08, 2.6]} position={[0, 0.04, 0]} receiveShadow />
            <mesh geometry={boxGeo} material={courtMat} scale={[1.0, 0.1, 2.0]} position={[0, 0.05, 0]} receiveShadow />
            <mesh geometry={boxGeo} material={whiteMat} scale={[1.05, 0.11, 0.05]} position={[0, 0.05, 1.0]} />
            <mesh geometry={boxGeo} material={whiteMat} scale={[1.05, 0.11, 0.05]} position={[0, 0.05, -1.0]} />
            <mesh geometry={boxGeo} material={whiteMat} scale={[0.05, 0.11, 2.0]} position={[0.5, 0.05, 0]} />
            <mesh geometry={boxGeo} material={whiteMat} scale={[0.05, 0.11, 2.0]} position={[-0.5, 0.05, 0]} />
            <mesh geometry={boxGeo} material={whiteMat} scale={[0.03, 0.11, 2.0]} position={[0, 0.05, 0]} /> 
            <mesh geometry={cylinderGeo} material={postMat} scale={[0.04, 0.4, 0.04]} position={[0.6, 0.2, 0]} castShadow />
            <mesh geometry={cylinderGeo} material={postMat} scale={[0.04, 0.4, 0.04]} position={[-0.6, 0.2, 0]} castShadow />
            <mesh geometry={boxGeo} material={new THREE.MeshStandardMaterial({color: 'white', transparent: true, opacity: 0.4})} scale={[1.2, 0.25, 0.01]} position={[0, 0.25, 0]} />
        </group>
    )
}

const VolleyballCourtModel = () => {
    const sandMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fcd34d', roughness: 1 }), []);
    const postMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#78716c' }), []);
    const netMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e5e7eb', transparent: true, opacity: 0.6 }), []);
    const tapeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ef4444' }), []);

    return (
        <group scale={[1.8, 1, 1.8]}>
            <mesh geometry={boxGeo} material={sandMat} scale={[1.2, 0.1, 2.0]} position={[0, 0.05, 0]} castShadow receiveShadow />
            <mesh geometry={boxGeo} material={tapeMat} scale={[1.0, 0.11, 0.05]} position={[0, 0.05, 0.9]} />
            <mesh geometry={boxGeo} material={tapeMat} scale={[1.0, 0.11, 0.05]} position={[0, 0.05, -0.9]} />
            <mesh geometry={boxGeo} material={tapeMat} scale={[0.05, 0.11, 1.8]} position={[0.5, 0.05, 0]} />
            <mesh geometry={boxGeo} material={tapeMat} scale={[0.05, 0.11, 1.8]} position={[-0.5, 0.05, 0]} />
            <mesh geometry={cylinderGeo} material={postMat} scale={[0.05, 0.8, 0.05]} position={[0.6, 0.4, 0]} castShadow />
            <mesh geometry={cylinderGeo} material={postMat} scale={[0.05, 0.8, 0.05]} position={[-0.6, 0.4, 0]} castShadow />
            <mesh geometry={boxGeo} material={netMat} scale={[1.2, 0.3, 0.01]} position={[0, 0.6, 0]} />
        </group>
    )
}

const FootballFieldModel = () => {
    const grassMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 }), []);
    const endzoneMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.9 }), []);
    const whiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 }), []);
    const yellowMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.3 }), []);

    return (
        <group scale={[3.0, 1, 3.0]}>
             <mesh geometry={boxGeo} material={grassMat} scale={[1.4, 0.1, 3.0]} position={[0, 0.05, 0]} castShadow receiveShadow />
             <mesh geometry={boxGeo} material={endzoneMat} scale={[1.4, 0.11, 0.4]} position={[0, 0.05, 1.3]} receiveShadow />
             <mesh geometry={boxGeo} material={endzoneMat} scale={[1.4, 0.11, 0.4]} position={[0, 0.05, -1.3]} receiveShadow />
             {[-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1].map((offset, i) => (
                 <mesh key={i} geometry={boxGeo} material={whiteMat} scale={[1.4, 0.11, 0.02]} position={[0, 0.06, offset * 1.0]} />
             ))}
             <mesh geometry={boxGeo} material={whiteMat} scale={[0.05, 0.11, 3.0]} position={[0.7, 0.06, 0]} />
             <mesh geometry={boxGeo} material={whiteMat} scale={[0.05, 0.11, 3.0]} position={[-0.7, 0.06, 0]} />
             <group position={[0, 0.3, -1.5]} rotation={[0, 0, 0]}>
                 <mesh geometry={cylinderGeo} material={yellowMat} scale={[0.03, 0.6, 0.03]} position={[0, 0, 0]} castShadow /> 
                 <mesh geometry={boxGeo} material={yellowMat} scale={[0.4, 0.03, 0.03]} position={[0, 0.3, 0]} castShadow /> 
                 <mesh geometry={cylinderGeo} material={yellowMat} scale={[0.015, 0.5, 0.015]} position={[0.2, 0.55, 0]} castShadow /> 
                 <mesh geometry={cylinderGeo} material={yellowMat} scale={[0.015, 0.5, 0.015]} position={[-0.2, 0.55, 0]} castShadow /> 
             </group>
             <group position={[0, 0.3, 1.5]} rotation={[0, Math.PI, 0]}>
                 <mesh geometry={cylinderGeo} material={yellowMat} scale={[0.03, 0.6, 0.03]} position={[0, 0, 0]} castShadow />
                 <mesh geometry={boxGeo} material={yellowMat} scale={[0.4, 0.03, 0.03]} position={[0, 0.3, 0]} castShadow />
                 <mesh geometry={cylinderGeo} material={yellowMat} scale={[0.015, 0.5, 0.015]} position={[0.2, 0.55, 0]} castShadow />
                 <mesh geometry={cylinderGeo} material={yellowMat} scale={[0.015, 0.5, 0.015]} position={[-0.2, 0.55, 0]} castShadow /> 
             </group>
        </group>
    )
}

const TrackFieldModel = () => {
    const trackMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.9 }), []);
    const grassMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 }), []);
    const lineMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 'white', roughness: 0.8 }), []);

    return (
        <group scale={[3.5, 1, 3.5]}>
            <mesh geometry={boxGeo} material={trackMat} scale={[0.4, 0.1, 1.5]} position={[0.8, 0.05, 0]} castShadow />
            <mesh geometry={boxGeo} material={trackMat} scale={[0.4, 0.1, 1.5]} position={[-0.8, 0.05, 0]} castShadow />
            <group position={[0, 0.05, 0.75]} rotation={[Math.PI/2, 0, 0]}>
                 <mesh geometry={torusGeo} material={trackMat} scale={[2.0, 2.0, 2]} />
            </group>
            <group position={[0, 0.05, -0.75]} rotation={[Math.PI/2, 0, 0]}>
                 <mesh geometry={torusGeo} material={trackMat} scale={[2.0, 2.0, 2]} />
            </group>
            <mesh geometry={boxGeo} material={trackMat} scale={[1.7, 0.1, 0.4]} position={[0, 0.05, 1.5]} />
            <mesh geometry={boxGeo} material={trackMat} scale={[1.7, 0.1, 0.4]} position={[0, 0.05, -1.5]} />
            <mesh geometry={boxGeo} material={grassMat} scale={[1.2, 0.1, 2.8]} position={[0, 0.06, 0]} />
            <mesh geometry={boxGeo} material={lineMat} scale={[1.2, 0.11, 0.02]} position={[0, 0.07, 0]} />
            <mesh geometry={boxGeo} material={lineMat} scale={[1.2, 0.11, 0.02]} position={[0, 0.07, 0.5]} />
            <mesh geometry={boxGeo} material={lineMat} scale={[1.2, 0.11, 0.02]} position={[0, 0.07, -0.5]} />
        </group>
    )
}

const OvalModel = () => {
    const grassMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.9 }), []);
    const flowerRed = useMemo(() => new THREE.MeshStandardMaterial({ color: '#dc2626' }), []);
    const flowerWhite = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f3f4f6' }), []);
    
    return (
        <group scale={[4, 1, 4]}>
            <mesh geometry={cylinderGeo} material={grassMat} scale={[1.0, 0.15, 1.0]} position={[0, 0.05, 0]} castShadow receiveShadow />
            <group position={[0, 0.15, 0]}>
                 <mesh geometry={sphereGeo} material={flowerRed} scale={0.05} position={[0.2, 0, -0.3]} />
                 <mesh geometry={sphereGeo} material={flowerRed} scale={0.05} position={[0, 0, -0.35]} />
                 <mesh geometry={sphereGeo} material={flowerRed} scale={0.05} position={[-0.2, 0, -0.3]} />
                 <mesh geometry={sphereGeo} material={flowerRed} scale={0.05} position={[-0.2, 0, -0.1]} />
                 <mesh geometry={sphereGeo} material={flowerWhite} scale={0.05} position={[0, 0, 0]} />
                 <mesh geometry={sphereGeo} material={flowerRed} scale={0.05} position={[0.2, 0, 0.1]} />
                 <mesh geometry={sphereGeo} material={flowerRed} scale={0.05} position={[0.2, 0, 0.3]} />
                 <mesh geometry={sphereGeo} material={flowerRed} scale={0.05} position={[0, 0, 0.35]} />
                 <mesh geometry={sphereGeo} material={flowerRed} scale={0.05} position={[-0.2, 0, 0.3]} />
            </group>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                 const rad = angle * Math.PI / 180;
                 return (
                     <group key={i} position={[Math.cos(rad)*0.8, 0.1, Math.sin(rad)*0.8]} scale={0.3}>
                         <mesh geometry={cylinderGeo} material={new THREE.MeshStandardMaterial({color: '#573d27'})} scale={[0.2, 0.5, 0.2]} position={[0, 0.25, 0]} />
                         <mesh geometry={coneGeo} material={new THREE.MeshStandardMaterial({color: '#166534'})} scale={[0.8, 1.2, 0.8]} position={[0, 0.8, 0]} />
                     </group>
                 )
            })}
        </group>
    )
}

const TreeModel = React.memo(({ type, age, variant }: { type: BuildingType, age: number, variant: number }) => {
    const scale = 0.5 + (age / 100) * 0.7; 
    const wobble = Math.sin(variant * 10) * 0.05;
    
    if (type.includes('Oak')) {
        if (type === BuildingType.OakSeed) return <mesh geometry={sphereGeo} material={oakSeedMat} scale={0.15} position={[0, -0.2, 0]} castShadow />;
        if (type === BuildingType.OakSapling) return <group scale={0.5}><mesh geometry={cylinderGeo} material={oakSaplingStemMat} scale={[0.08, 0.5, 0.08]} position={[0, 0.25, 0]} castShadow /><mesh geometry={sphereGeo} material={oakSaplingLeafMat} scale={0.3} position={[0, 0.5, 0]} castShadow /></group>;
        
        const leafMat = variant > 50 ? oakLeafDarkMat : oakLeafLightMat;
        return (
            <group scale={scale} rotation={[0, variant, wobble]}>
                <mesh geometry={cylinderGeo} material={oakTrunkMat} scale={[0.25, 0.8, 0.25]} position={[0, 0.4, 0]} castShadow />
                <group position={[0, 0.9, 0]}>
                    <mesh geometry={sphereGeo} material={leafMat} scale={0.8} position={[0, 0, 0]} castShadow />
                    <mesh geometry={sphereGeo} material={leafMat} scale={0.6} position={[0.4, 0.2, 0]} castShadow />
                    <mesh geometry={sphereGeo} material={leafMat} scale={0.65} position={[-0.3, 0.3, 0.3]} castShadow />
                </group>
            </group>
        )
    }

    if (type.includes('Pine')) {
         if (type === BuildingType.PineSeed) return <mesh geometry={coneGeo} material={pineSeedMat} scale={0.12} position={[0, -0.25, 0]} castShadow />;
        if (type === BuildingType.PineSapling) return <group scale={0.5}><mesh geometry={cylinderGeo} material={pineSaplingStemMat} scale={[0.06, 0.4, 0.06]} position={[0, 0.2, 0]} castShadow /><mesh geometry={coneGeo} material={pineSaplingLeafMat} scale={0.25} position={[0, 0.4, 0]} castShadow /></group>;
        
        return (
            <group scale={scale} rotation={[0, variant, wobble]}>
                <mesh geometry={cylinderGeo} material={pineTrunkMat} scale={[0.18, 0.8, 0.18]} position={[0, 0.4, 0]} castShadow />
                <mesh geometry={coneGeo} material={pineLeafMat} scale={[0.9, 0.8, 0.9]} position={[0, 0.6, 0]} castShadow />
                <mesh geometry={coneGeo} material={pineLeafMat} scale={[0.7, 0.8, 0.7]} position={[0, 1.1, 0]} rotation={[0, 0.5, 0]} castShadow />
                <mesh geometry={coneGeo} material={pineLeafMat} scale={[0.45, 0.7, 0.45]} position={[0, 1.5, 0]} rotation={[0, 1.0, 0]} castShadow />
            </group>
        )
    }

    if (type.includes('Palm')) {
        if (type === BuildingType.PalmSeed) return <mesh geometry={sphereGeo} material={palmSeedMat} scale={0.15} position={[0, -0.2, 0]} castShadow />;
        if (type === BuildingType.PalmSapling) return <group scale={0.5}><mesh geometry={cylinderGeo} material={palmSaplingStemMat} scale={[0.08, 0.4, 0.08]} position={[0, 0.2, 0]} castShadow /><mesh geometry={boxGeo} material={palmSaplingLeafMat} scale={[0.5, 0.05, 0.2]} position={[0, 0.4, 0]} rotation={[0, 0, 0]} castShadow /><mesh geometry={boxGeo} material={palmSaplingLeafMat} scale={[0.5, 0.05, 0.2]} position={[0, 0.4, 0]} rotation={[0, 1.57, 0]} castShadow /></group>;

        // Canary Island Date Palm - Tall, thick patterned trunk, massive crown
        // Height matching Memorial Church approx (~6.0)
        const trunkHeight = 6.0;
        
        return (
            <group scale={scale} rotation={[0, variant, wobble]}>
                {/* Thick Trunk */}
                <mesh geometry={cylinderGeo} material={palmTrunkMat} scale={[0.5, trunkHeight, 0.5]} position={[0, trunkHeight/2, 0]} castShadow />
                
                {/* Patterned Trunk Detail (Rings) */}
                {[0.2, 0.4, 0.6, 0.8].map(h => (
                     <mesh key={h} position={[0, trunkHeight * h, 0]} scale={[0.52, 0.2, 0.52]}>
                        <cylinderGeometry args={[1, 1, 1, 8]} />
                        <meshStandardMaterial color="#3e2723" />
                     </mesh>
                ))}

                {/* Massive Crown */}
                <group position={[0, trunkHeight, 0]}>
                     {/* Many layers of fronds */}
                     {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((rot, i) => {
                         const dip = Math.sin(i) * 0.2;
                         return (
                             <group key={rot} rotation={[dip, rot * Math.PI/180, 0]}>
                                {/* Arching Frond */}
                                <mesh geometry={boxGeo} material={palmLeafMat} scale={[2.0, 0.08, 0.35]} position={[1.1, 0.1, 0]} rotation={[0, 0, 0.2]} castShadow />
                                <mesh geometry={boxGeo} material={palmLeafMat} scale={[1.4, 0.06, 0.25]} position={[2.5, -0.3, 0]} rotation={[0, 0, -0.3]} castShadow />
                             </group>
                         )
                     })}
                     {/* Center growth */}
                     <mesh geometry={sphereGeo} material={palmLeafMat} scale={0.9} />
                </group>
            </group>
        )
    }
    
    return null;
});

const StudySpotModel = () => {
    const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#92400e' }), []); 
    const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f2937' }), []); 

    return (
        <group>
            <mesh geometry={boxGeo} material={wood} scale={[1.0, 0.1, 0.4]} position={[0, 0.3, 0.2]} castShadow />
            <mesh geometry={boxGeo} material={wood} scale={[0.1, 0.3, 0.4]} position={[0.4, 0.15, 0.2]} castShadow />
            <mesh geometry={boxGeo} material={wood} scale={[0.1, 0.3, 0.4]} position={[-0.4, 0.15, 0.2]} castShadow />
            <mesh geometry={boxGeo} material={wood} scale={[1.0, 0.4, 0.05]} position={[0, 0.6, 0]} rotation={[0.2, 0, 0]} castShadow />
            <mesh geometry={boxGeo} material={wood} scale={[0.08, 0.5, 0.05]} position={[0.4, 0.4, 0.02]} rotation={[0.2, 0, 0]} />
            <mesh geometry={boxGeo} material={wood} scale={[0.08, 0.5, 0.05]} position={[-0.4, 0.4, 0.02]} rotation={[0.2, 0, 0]} />
            <mesh geometry={boxGeo} material={wood} scale={[1.2, 0.08, 0.6]} position={[0, 0.5, 0.9]} castShadow />
            <mesh geometry={cylinderGeo} material={metal} scale={[0.05, 0.5, 0.05]} position={[0.5, 0.25, 0.7]} />
            <mesh geometry={cylinderGeo} material={metal} scale={[0.05, 0.5, 0.05]} position={[-0.5, 0.25, 0.7]} />
            <mesh geometry={cylinderGeo} material={metal} scale={[0.05, 0.5, 0.05]} position={[0.5, 0.25, 1.1]} />
            <mesh geometry={cylinderGeo} material={metal} scale={[0.05, 0.5, 0.05]} position={[-0.5, 0.25, 1.1]} />
        </group>
    );
};

const ProceduralBuilding = React.memo(({ type, x, y, variant = 0, rotation = 0, ...props }: any) => {
  const yOffset = -0.3;
  
  // Apply rotation group
  const rotationY = rotation * (Math.PI / 2);

  return (
    <group position={[0, yOffset, 0]} rotation={[0, rotationY, 0]} {...props}>
        {type === BuildingType.Stanford && <StanfordMemorialChurch />}
        {type === BuildingType.HooverTower && <HooverTowerModel />}
        {type === BuildingType.EngineeringQuad && <EngineeringQuadModel />}
        {type === BuildingType.ArrillagaHall && <ArrillagaHallModel />}
        {type === BuildingType.StudentDorm && <StudentDormModel />}
        {type === BuildingType.LectureHall && <LectureHallModel />}
        {type === BuildingType.VapeStore && <VapeStoreModel />}
        {type === BuildingType.StudySpot && <StudySpotModel />}
        {type === BuildingType.CoupaCafe && <CoupaCafeModel />}
        {type === BuildingType.TennisCourt && <TennisCourtModel />}
        {type === BuildingType.VolleyballCourt && <VolleyballCourtModel />}
        {type === BuildingType.FootballField && <FootballFieldModel />}
        {type === BuildingType.TrackField && <TrackFieldModel />}
        {type === BuildingType.Oval && <OvalModel />}
        {type === BuildingType.ClawFountain && <ClawFountainModel />}
        {type === BuildingType.RodinSculpture && <RodinModel />}
        {type === BuildingType.TotemSculpture && <TotemModel />}
        {type === BuildingType.PicnicTable && <PicnicTableModel />}
        {type === BuildingType.StreetLamp && <StreetLampModel />}
        {type === BuildingType.RoseBush && <RoseBushModel />}
        {type === BuildingType.GardenBed && <GardenBedModel />}
        {type === BuildingType.Hedge && <HedgeModel />}
        {(type.includes('Oak') || type.includes('Pine') || type.includes('Palm')) && (
            <TreeModel type={type} age={variant} variant={getHash(x,y) * 100} />
        )}
    </group>
  );
});

// --- Optimization: Instanced Ground Plane ---

const GroundLayer = React.memo(({ grid }: { grid: Grid }) => {
    const grassRef = useRef<THREE.InstancedMesh>(null);
    const pavedRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        let grassCount = 0;
        let pavedCount = 0;
        
        // 1. Calculate counts
        grid.forEach(row => row.forEach(tile => {
            const type = tile.buildingType;
            // NOTE: Removed StreetLamp from paved list
            const isPaved = type === BuildingType.Path || type === BuildingType.Stanford || type === BuildingType.HooverTower || type === BuildingType.EngineeringQuad || type === BuildingType.ArrillagaHall || type === BuildingType.CoupaCafe || type === BuildingType.StudySpot || type === BuildingType.StudentDorm || type === BuildingType.LectureHall || type === BuildingType.VapeStore || type === BuildingType.TennisCourt || type === BuildingType.VolleyballCourt || type === BuildingType.FootballField || type === BuildingType.TrackField || type === BuildingType.ClawFountain || type === BuildingType.RodinSculpture || type === BuildingType.TotemSculpture || type === BuildingType.PicnicTable;
            if (isPaved) pavedCount++; else grassCount++;
        }));

        // 2. Set instances
        if (grassRef.current) grassRef.current.count = grassCount;
        if (pavedRef.current) pavedRef.current.count = pavedCount;

        let gIdx = 0;
        let pIdx = 0;

        grid.forEach((row, y) => row.forEach((tile, x) => {
             const [wx, _, wz] = gridToWorld(x, y);
             const type = tile.buildingType;
             // NOTE: Removed StreetLamp from paved list
             const isPaved = type === BuildingType.Path || type === BuildingType.Stanford || type === BuildingType.HooverTower || type === BuildingType.EngineeringQuad || type === BuildingType.ArrillagaHall || type === BuildingType.CoupaCafe || type === BuildingType.StudySpot || type === BuildingType.StudentDorm || type === BuildingType.LectureHall || type === BuildingType.VapeStore || type === BuildingType.TennisCourt || type === BuildingType.VolleyballCourt || type === BuildingType.FootballField || type === BuildingType.TrackField || type === BuildingType.ClawFountain || type === BuildingType.RodinSculpture || type === BuildingType.TotemSculpture || type === BuildingType.PicnicTable;
             
             dummy.position.set(wx, -0.55, wz);
             dummy.scale.set(1, 1, 1);
             dummy.rotation.set(0, 0, 0);
             dummy.updateMatrix();

             if (isPaved && pavedRef.current) {
                 pavedRef.current.setMatrixAt(pIdx++, dummy.matrix);
             } else if (grassRef.current) {
                 grassRef.current.setMatrixAt(gIdx++, dummy.matrix);
             }
        }));

        if (grassRef.current) grassRef.current.instanceMatrix.needsUpdate = true;
        if (pavedRef.current) pavedRef.current.instanceMatrix.needsUpdate = true;

    }, [grid, dummy]);

    return (
        <group>
            <instancedMesh ref={grassRef} args={[groundGeo, grassMat, GRID_SIZE * GRID_SIZE]} receiveShadow />
            <instancedMesh ref={pavedRef} args={[groundGeo, pavedMat, GRID_SIZE * GRID_SIZE]} receiveShadow />
        </group>
    );
});


// --- Enhanced Student Simulation & Performance Optimized Smoke ---

interface Student {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    state: 'walking' | 'studying' | 'playing_tennis';
    timer: number;
    color: THREE.Color;
    skinColor: THREE.Color;
    hairColor: THREE.Color;
    phase: number;
    hairStyle: number;
    hasVape: boolean;
    atStudySpot: boolean;
    atTennisCourt: boolean;
    tennisSlot: number; // 0-3 for doubles positions
    isMascot: boolean;
}

const StudentSystem = ({ grid, onStudentVisit }: { grid: Grid, onStudentVisit: (amount: number) => void }) => {
    const { paths, attractions } = useMemo(() => {
        const p: {x: number, y: number, type: BuildingType}[] = [];
        const a: {x: number, y: number, type: BuildingType}[] = [];
        grid.forEach(row => row.forEach(tile => {
            const t = tile.buildingType;
            if (t !== BuildingType.None && !t.includes('Tree') && !t.includes('Seed') && !t.includes('Sapling') && !t.includes('Hedge') && !t.includes('Rose') && !t.includes('Garden')) {
                p.push({x: tile.x, y: tile.y, type: t});
            }
            const isAttraction = t === BuildingType.Stanford || t === BuildingType.HooverTower || t === BuildingType.EngineeringQuad || t === BuildingType.ArrillagaHall || t === BuildingType.CoupaCafe || t === BuildingType.StudySpot || t === BuildingType.StudentDorm || t === BuildingType.LectureHall || t === BuildingType.VapeStore || t === BuildingType.TennisCourt || t === BuildingType.VolleyballCourt || t === BuildingType.FootballField || t === BuildingType.TrackField || t === BuildingType.Oval || t === BuildingType.ClawFountain || t === BuildingType.RodinSculpture || t === BuildingType.TotemSculpture || t === BuildingType.PicnicTable;
            if (isAttraction) {
                a.push({x: tile.x, y: tile.y, type: t});
            }
        }));
        return { paths: p, attractions: a };
    }, [grid]);

    const maxStudents = Math.min(Math.max(paths.length * 2, 20), 300); 
    const studentsRef = useRef<Student[]>([]);
    
    // Performance: Use Object Pool for Smoke
    const smokePool = useMemo(() => new ParticlePool(MAX_PARTICLES), []);

    // Instanced Mesh Refs
    const bodyRef = useRef<THREE.InstancedMesh>(null);
    const headRef = useRef<THREE.InstancedMesh>(null);
    const backpackRef = useRef<THREE.InstancedMesh>(null);
    const hairRef = useRef<THREE.InstancedMesh>(null);
    const smokeRef = useRef<THREE.InstancedMesh>(null);
    const laptopBaseRef = useRef<THREE.InstancedMesh>(null);
    const laptopScreenRef = useRef<THREE.InstancedMesh>(null);
    const tennisBallRef = useRef<THREE.InstancedMesh>(null); // New Tennis Ball
    const racketHandleRef = useRef<THREE.InstancedMesh>(null); // New Racket Handle
    const racketHeadRef = useRef<THREE.InstancedMesh>(null); // New Racket Head
    const mascotBodyRef = useRef<THREE.InstancedMesh>(null); 
    const mascotDecorRef = useRef<THREE.InstancedMesh>(null); 
    const mascotEyesRef = useRef<THREE.InstancedMesh>(null);
    
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialization
    useEffect(() => {
        if (paths.length === 0) return;
        
        if (studentsRef.current.length < maxStudents) {
            const needed = maxStudents - studentsRef.current.length;
            for(let i=0; i<needed; i++) {
                const start = paths[Math.floor(Math.random() * paths.length)];
                const isCardinal = Math.random() > 0.6;
                const col = isCardinal 
                    ? new THREE.Color('#8c1515') 
                    : new THREE.Color().setHSL(Math.random(), 0.1, 0.2 + Math.random()*0.3);
                
                const skinHex = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
                const hairHex = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
                
                // 1% Chance to be Stanford Tree Mascot
                const isMascot = Math.random() < 0.01;

                studentsRef.current.push({
                    x: start.x, y: start.y,
                    targetX: start.x, targetY: start.y,
                    state: 'walking',
                    timer: 0,
                    color: col,
                    skinColor: new THREE.Color(skinHex),
                    hairColor: new THREE.Color(hairHex),
                    phase: Math.random() * Math.PI * 2,
                    hairStyle: Math.random(),
                    hasVape: false,
                    atStudySpot: false,
                    atTennisCourt: false,
                    tennisSlot: 0,
                    isMascot: isMascot
                });
            }
        }
        if (studentsRef.current.length > maxStudents) {
            studentsRef.current = studentsRef.current.slice(0, maxStudents);
        }

    }, [paths, maxStudents]);

    useFrame((state, delta) => {
        if (!bodyRef.current || paths.length === 0) return;

        let visitIncome = 0;
        let tennisBallCount = 0;
        // Racket counts match student counts essentially, but only for those playing
        
        studentsRef.current.forEach((student, i) => {
            // Logic
            if (student.state === 'studying' || student.state === 'playing_tennis') {
                student.timer -= delta;
                if (student.timer <= 0) {
                    student.state = 'walking';
                    student.atStudySpot = false;
                    student.atTennisCourt = false;
                    const dest = attractions.length > 0 ? attractions[Math.floor(Math.random() * attractions.length)] : paths[Math.floor(Math.random() * paths.length)];
                    student.targetX = dest.x;
                    student.targetY = dest.y;
                    
                    const destType = dest.type;
                    if (destType === BuildingType.ClawFountain || destType === BuildingType.RodinSculpture || destType === BuildingType.TotemSculpture) {
                        const angle = Math.random() * Math.PI * 2;
                        student.targetX += Math.cos(angle) * 0.7;
                        student.targetY += Math.sin(angle) * 0.7;
                    }
                }
            } else {
                // Walking
                const dx = student.targetX - student.x;
                const dy = student.targetY - student.y;
                const distSq = dx*dx + dy*dy;
                
                if (distSq < 0.05) {
                    student.x = student.targetX;
                    student.y = student.targetY;
                    
                    const gridX = Math.round(student.targetX);
                    const gridY = Math.round(student.targetY);
                    
                    if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
                        const building = grid[gridY][gridX].buildingType;
                        const config = BUILDINGS[building];
                        
                        if (building === BuildingType.VapeStore) {
                            student.hasVape = true;
                        }

                        if (config && config.incomeGen > 0) {
                            visitIncome += config.incomeGen;
                            if (building === BuildingType.StudySpot) {
                                student.state = 'studying';
                                student.timer = 3 + Math.random() * 4;
                                student.atStudySpot = true;
                            } else if (building === BuildingType.TennisCourt) {
                                // LIMIT TENNIS TO 4 PLAYERS
                                const existingPlayers = studentsRef.current.filter(s => 
                                    s.state === 'playing_tennis' && 
                                    Math.round(s.x) === gridX && 
                                    Math.round(s.y) === gridY
                                );
                                
                                if (existingPlayers.length >= 4) {
                                    // Court is full! Go somewhere else
                                    const next = paths[Math.floor(Math.random() * paths.length)];
                                    student.targetX = next.x;
                                    student.targetY = next.y;
                                    student.state = 'walking';
                                } else {
                                    student.state = 'playing_tennis';
                                    student.timer = 10 + Math.random() * 10;
                                    student.atTennisCourt = true;
                                    student.tennisSlot = existingPlayers.length; // 0, 1, 2, or 3
                                }
                            } else {
                                student.state = 'studying';
                                student.timer = 3 + Math.random() * 4;
                            }
                        } else {
                             const next = paths[Math.floor(Math.random() * paths.length)];
                             student.targetX = next.x;
                             student.targetY = next.y;
                        }
                    } else {
                        const next = paths[Math.floor(Math.random() * paths.length)];
                        student.targetX = next.x;
                        student.targetY = next.y;
                    }
                } else {
                    const dist = Math.sqrt(distSq);
                    const speed = 2.5 * delta;
                    student.x += (dx / dist) * speed;
                    student.y += (dy / dist) * speed;
                }
            }

            // Smoke
            if (student.hasVape && !student.isMascot && Math.random() < 0.05) {
                const [wx, _, wz] = gridToWorld(student.x, student.y);
                smokePool.spawn(wx, 1.0, wz);
            }

            // Animation Prep
            const [wx, _, wz] = gridToWorld(student.x, student.y);
            let drawX = wx;
            let drawZ = wz;
            let bob = student.state === 'walking' ? Math.abs(Math.sin(state.clock.elapsedTime * 12 + student.phase)) * 0.15 : 0;
            
            // Tennis Animation Override
            if (student.state === 'playing_tennis') {
                const t = state.clock.elapsedTime * 3;
                // Slot 0: Side A Left, Slot 1: Side B Left, Slot 2: Side A Right, Slot 3: Side B Right
                const isSideB = student.tennisSlot % 2 !== 0; 
                const isRight = student.tennisSlot >= 2;
                
                // Determine Opponent Slot (0 <-> 1, 2 <-> 3)
                const opponentSlot = isSideB ? student.tennisSlot - 1 : student.tennisSlot + 1;
                
                // Check if opponent exists on the same court
                const hasOpponent = studentsRef.current.some(s => 
                    s.state === 'playing_tennis' && 
                    Math.round(s.x) === Math.round(student.x) &&
                    Math.round(s.y) === Math.round(student.y) &&
                    s.tennisSlot === opponentSlot
                );

                // Base positions relative to tile center
                // Tennis court is 2x1 scaled, so roughly +/- 0.8 on Z axis is baselines
                const zOffset = isSideB ? -0.8 : 0.8;
                const xOffset = isRight ? 0.4 : -0.4;
                
                drawX = wx + xOffset;
                drawZ = wz + zOffset;

                if (hasOpponent) {
                    // Strafe movement only if opponent exists
                    const strafe = Math.sin(t + student.phase) * 0.3;
                    drawX += strafe;
                    bob = Math.abs(Math.sin(t * 2)) * 0.1; // Running bob
                } else {
                    // Idle wait for opponent
                    bob = Math.abs(Math.sin(t * 0.5)) * 0.05; 
                }

                // Render Ball if we are the "primary" student on this court (Side A) AND we have an opponent
                // We just render balls near students.
                if (tennisBallRef.current && !isSideB && hasOpponent) {
                    const ballTime = state.clock.elapsedTime * 2.5; // Faster ball
                    // Ball moves between Z=0.8 (Side A) and Z=-0.8 (Side B)
                    const ballZ = Math.cos(ballTime) * 0.8;
                    // Parabolic arc Y
                    const ballY = 0.5 + Math.abs(Math.sin(ballTime * 3)) * 0.6; // Bounce
                    // Lerp X between the pair's lane (Left or Right)
                    const ballX = isRight ? 0.4 : -0.4; 

                    dummy.position.set(wx + ballX, ballY, wz + ballZ);
                    dummy.scale.set(0.1, 0.1, 0.1);
                    dummy.rotation.set(0,0,0);
                    dummy.updateMatrix();
                    tennisBallRef.current.setMatrixAt(tennisBallCount++, dummy.matrix);
                    tennisBallRef.current.setColorAt(tennisBallCount - 1, new THREE.Color('#facc15'));
                }
            }

            const yPos = -0.2 + bob;
            
            let angle = 0;
            if (student.state === 'studying') {
                 const cx = Math.round(student.x);
                 const cy = Math.round(student.y);
                 angle = Math.atan2(cx - student.x, cy - student.y);
            } else if (student.state === 'playing_tennis') {
                 // Face center
                 angle = student.tennisSlot % 2 !== 0 ? 0 : Math.PI; 
            } else {
                const dx = student.targetX - student.x;
                const dy = student.targetY - student.y;
                angle = Math.atan2(dx, dy);
            }

            dummy.rotation.set(0, angle, 0);

            if (student.isMascot) {
                // MASCOT RENDERING
                // Hide normal parts
                const zero = new THREE.Matrix4().makeScale(0,0,0);
                bodyRef.current!.setMatrixAt(i, zero);
                headRef.current!.setMatrixAt(i, zero);
                backpackRef.current!.setMatrixAt(i, zero);
                hairRef.current!.setMatrixAt(i, zero);
                racketHandleRef.current!.setMatrixAt(i, zero);
                racketHeadRef.current!.setMatrixAt(i, zero);

                // Show Mascot Body (Tree Costume) - Intricate Wobble
                const wobbleX = Math.sin(state.clock.elapsedTime * 12) * 0.15;
                const wobbleZ = Math.cos(state.clock.elapsedTime * 10) * 0.15;
                
                dummy.position.set(drawX, yPos + 0.6, drawZ);
                dummy.rotation.set(wobbleX, angle, wobbleZ);
                dummy.scale.set(0.6, 0.9, 0.6);
                dummy.updateMatrix();
                if (mascotBodyRef.current) {
                    mascotBodyRef.current.setMatrixAt(i, dummy.matrix);
                    mascotBodyRef.current.setColorAt(i, new THREE.Color('#15803d')); // Green Tree
                }
                
                // Mascot Face: Intricate Smiley Face
                // 1. Mouth (Smile) - Using box scaled wide and short
                dummy.scale.set(0.3, 0.08, 0.1); 
                // Position slightly forward from center
                const faceOffset = new THREE.Vector3(0, 0.6, 0.25);
                faceOffset.applyEuler(new THREE.Euler(wobbleX, angle, wobbleZ));
                dummy.position.set(drawX + faceOffset.x, yPos + faceOffset.y, drawZ + faceOffset.z);
                dummy.rotation.set(wobbleX, angle, wobbleZ);
                dummy.updateMatrix();
                if (mascotDecorRef.current) {
                     mascotDecorRef.current.setMatrixAt(i, dummy.matrix);
                     mascotDecorRef.current.setColorAt(i, new THREE.Color('#1c1917')); // Dark smile
                }

                // 2. Eyes - Googly Eyes
                if (mascotEyesRef.current) {
                    // Left Eye
                    const eyeL = new THREE.Vector3(-0.12, 0.75, 0.22);
                    eyeL.applyEuler(new THREE.Euler(wobbleX, angle, wobbleZ));
                    dummy.position.set(drawX + eyeL.x, yPos + eyeL.y, drawZ + eyeL.z);
                    dummy.scale.set(0.12, 0.12, 0.12);
                    dummy.rotation.set(wobbleX, angle, wobbleZ);
                    dummy.updateMatrix();
                    mascotEyesRef.current.setMatrixAt(i*2, dummy.matrix); // Use 2x slots per student for eyes
                    mascotEyesRef.current.setColorAt(i*2, new THREE.Color('#ffffff'));

                    // Right Eye
                    const eyeR = new THREE.Vector3(0.12, 0.75, 0.22);
                    eyeR.applyEuler(new THREE.Euler(wobbleX, angle, wobbleZ));
                    dummy.position.set(drawX + eyeR.x, yPos + eyeR.y, drawZ + eyeR.z);
                    dummy.updateMatrix();
                    mascotEyesRef.current.setMatrixAt(i*2 + 1, dummy.matrix);
                    mascotEyesRef.current.setColorAt(i*2 + 1, new THREE.Color('#ffffff'));
                }

            } else {
                // NORMAL STUDENT RENDERING
                const zero = new THREE.Matrix4().makeScale(0,0,0);
                if (mascotBodyRef.current) mascotBodyRef.current.setMatrixAt(i, zero);
                if (mascotDecorRef.current) mascotDecorRef.current.setMatrixAt(i, zero);
                if (mascotEyesRef.current) {
                    mascotEyesRef.current.setMatrixAt(i*2, zero);
                    mascotEyesRef.current.setMatrixAt(i*2+1, zero);
                }

                // Body
                dummy.position.set(drawX, yPos + 0.35, drawZ);
                dummy.scale.set(0.25, 0.45, 0.15);
                dummy.updateMatrix();
                bodyRef.current!.setMatrixAt(i, dummy.matrix);
                bodyRef.current!.setColorAt(i, student.color);

                // Head
                dummy.position.set(drawX, yPos + 0.7, drawZ);
                dummy.scale.set(0.2, 0.2, 0.2);
                dummy.updateMatrix();
                if (headRef.current) {
                    headRef.current.setMatrixAt(i, dummy.matrix);
                    headRef.current.setColorAt(i, student.skinColor);
                }

                // Backpack
                dummy.position.set(drawX - Math.sin(angle)*0.12, yPos + 0.45, drawZ - Math.cos(angle)*0.12);
                dummy.scale.set(0.18, 0.25, 0.1);
                dummy.updateMatrix();
                if (backpackRef.current) {
                    backpackRef.current.setMatrixAt(i, dummy.matrix);
                    backpackRef.current.setColorAt(i, new THREE.Color('#713f12'));
                }

                // IMPROVED HAIR
                if (hairRef.current) {
                    const hStyle = student.hairStyle;
                    if (hStyle < 0.3) {
                         // Short / Buzz
                         dummy.position.set(drawX, yPos + 0.82, drawZ);
                         dummy.scale.set(0.21, 0.05, 0.21);
                    } else if (hStyle < 0.6) {
                         // Bun
                         dummy.position.set(drawX, yPos + 0.85, drawZ - 0.05);
                         dummy.scale.set(0.1, 0.1, 0.1); // Sphere bun
                    } else {
                         // Long
                         dummy.position.set(drawX, yPos + 0.75, drawZ - 0.05);
                         dummy.scale.set(0.22, 0.3, 0.05);
                    }
                    dummy.rotation.set(0, angle, 0); // Re-apply rotation
                    dummy.updateMatrix();
                    hairRef.current.setMatrixAt(i, dummy.matrix);
                    hairRef.current.setColorAt(i, student.hairColor);
                }

                // Racket Logic - Only show if playing tennis AND has opponent
                if (racketHandleRef.current && racketHeadRef.current) {
                    if (student.state === 'playing_tennis') {
                        // Check for opponent again for animation state
                        const isSideB = student.tennisSlot % 2 !== 0; 
                        const opponentSlot = isSideB ? student.tennisSlot - 1 : student.tennisSlot + 1;
                        const hasOpponent = studentsRef.current.some(s => 
                            s.state === 'playing_tennis' && 
                            Math.round(s.x) === Math.round(student.x) &&
                            Math.round(s.y) === Math.round(student.y) &&
                            s.tennisSlot === opponentSlot
                        );

                        // Position racket relative to right hand side
                        const handX = drawX + Math.cos(angle) * 0.15; 
                        const handZ = drawZ - Math.sin(angle) * 0.15;
                        // Only swing if opponent exists
                        const swing = hasOpponent ? Math.sin(state.clock.elapsedTime * 6) * 0.4 : 0;
                        const tilt = hasOpponent ? -0.2 : -0.8; // Ready vs Idle down
                        
                        // Handle
                        dummy.position.set(handX, yPos + 0.45, handZ);
                        dummy.scale.set(0.02, 0.3, 0.02);
                        // Rotate racket forward and slightly up
                        dummy.rotation.set(0.5 + swing, angle, tilt);
                        dummy.updateMatrix();
                        racketHandleRef.current.setMatrixAt(i, dummy.matrix);
                        racketHandleRef.current.setColorAt(i, new THREE.Color('#3f2e18'));

                        // Head (Paddle style)
                        const headOffset = new THREE.Vector3(0, 0.25, 0);
                        headOffset.applyEuler(new THREE.Euler(0.5 + swing, angle, tilt));
                        dummy.position.set(handX + headOffset.x, yPos + 0.45 + headOffset.y, handZ + headOffset.z);
                        dummy.scale.set(0.18, 0.25, 0.02);
                        dummy.rotation.set(0.5 + swing, angle, tilt);
                        dummy.updateMatrix();
                        racketHeadRef.current.setMatrixAt(i, dummy.matrix);
                        racketHeadRef.current.setColorAt(i, new THREE.Color('#ef4444'));

                    } else {
                        // Hide racket if not playing
                        dummy.scale.set(0,0,0);
                        dummy.updateMatrix();
                        racketHandleRef.current.setMatrixAt(i, dummy.matrix);
                        racketHeadRef.current.setMatrixAt(i, dummy.matrix);
                    }
                }

                // Laptop
                if (laptopBaseRef.current && laptopScreenRef.current) {
                    if (student.state === 'studying' && student.atStudySpot) {
                         const lx = drawX + Math.sin(angle) * 0.7;
                         const lz = drawZ + Math.cos(angle) * 0.7;
                         
                         dummy.position.set(lx, 0.25, lz); 
                         dummy.scale.set(0.15, 0.01, 0.1);
                         dummy.rotation.set(0, angle, 0);
                         dummy.updateMatrix();
                         laptopBaseRef.current.setMatrixAt(i, dummy.matrix);
                         laptopBaseRef.current.setColorAt(i, new THREE.Color('#94a3b8'));

                         dummy.position.set(lx - Math.sin(angle)*0.05, 0.3, lz - Math.cos(angle)*0.05); 
                         dummy.scale.set(0.15, 0.1, 0.01);
                         dummy.rotation.set(-0.3, angle, 0);
                         dummy.updateMatrix();
                         laptopScreenRef.current.setMatrixAt(i, dummy.matrix);
                         laptopScreenRef.current.setColorAt(i, new THREE.Color('#94a3b8'));
                    } else {
                         dummy.scale.set(0,0,0);
                         dummy.updateMatrix();
                         laptopBaseRef.current.setMatrixAt(i, dummy.matrix);
                         laptopScreenRef.current.setMatrixAt(i, dummy.matrix);
                    }
                }
            }
        });

        if (smokeRef.current) {
            smokePool.update(delta, dummy, smokeRef.current);
        }

        // Cleanup unused balls
        if (tennisBallRef.current) {
            if (tennisBallCount === 0) {
                 tennisBallRef.current.count = 0;
            } else {
                tennisBallRef.current.count = tennisBallCount;
                tennisBallRef.current.instanceMatrix.needsUpdate = true;
                if(tennisBallRef.current.instanceColor) tennisBallRef.current.instanceColor.needsUpdate = true;
            }
        }

        [bodyRef, headRef, backpackRef, hairRef, laptopBaseRef, laptopScreenRef, mascotBodyRef, mascotDecorRef, mascotEyesRef, racketHandleRef, racketHeadRef].forEach(ref => {
            if (ref.current) {
                ref.current.instanceMatrix.needsUpdate = true;
                if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
            }
        });

        if (visitIncome > 0) {
            onStudentVisit(visitIncome);
        }
    });

    return (
        <group>
            <instancedMesh ref={bodyRef} args={[boxGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
            </instancedMesh>
            <instancedMesh ref={headRef} args={[sphereGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
            </instancedMesh>
            <instancedMesh ref={backpackRef} args={[boxGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
            </instancedMesh>
             {/* Use Sphere for Hair to support buns better, scaled for others */}
             <instancedMesh ref={hairRef} args={[sphereGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
            </instancedMesh>
             <instancedMesh ref={laptopBaseRef} args={[boxGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
            </instancedMesh>
             <instancedMesh ref={laptopScreenRef} args={[boxGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
            </instancedMesh>
             
             {/* Tennis Ball */}
             <instancedMesh ref={tennisBallRef} args={[sphereGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial emissive="#facc15" emissiveIntensity={0.5} />
             </instancedMesh>
             
             {/* Tennis Racket Parts */}
             <instancedMesh ref={racketHandleRef} args={[cylinderGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
             </instancedMesh>
             <instancedMesh ref={racketHeadRef} args={[boxGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
             </instancedMesh>

             {/* Mascot Instanced Meshes */}
             <instancedMesh ref={mascotBodyRef} args={[coneGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
             </instancedMesh>
             <instancedMesh ref={mascotDecorRef} args={[boxGeo, undefined, maxStudents]} castShadow>
                <meshStandardMaterial />
             </instancedMesh>
             <instancedMesh ref={mascotEyesRef} args={[sphereGeo, undefined, maxStudents * 2]} castShadow>
                <meshStandardMaterial />
             </instancedMesh>

             <instancedMesh ref={smokeRef} args={[boxGeo, undefined, MAX_PARTICLES]}>
                <meshStandardMaterial transparent opacity={0.6} color="#a1a1aa" />
            </instancedMesh>
        </group>
    )
}

// --- IsoMap Component ---

interface IsoMapProps {
  grid: Grid;
  onTileClick: (x: number, y: number) => void;
  hoveredTool: BuildingType;
  onStudentVisit: (amount: number) => void;
  rotation: number;
}

const IsoMap: React.FC<IsoMapProps> = ({ grid, onTileClick, hoveredTool, onStudentVisit, rotation }) => {
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const [ox, _, oz] = gridToWorld(0, 0); 
      const localX = e.point.x - ox + 0.5;
      const localZ = e.point.z - oz + 0.5;
      
      const x = Math.floor(localX);
      const y = Math.floor(localZ);

      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
          setHoveredTile({ x, y });
      } else {
          setHoveredTile(null);
      }
  }, []);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      
      const [ox, _, oz] = gridToWorld(0, 0);
      const localX = e.point.x - ox + 0.5;
      const localZ = e.point.z - oz + 0.5;
      const x = Math.floor(localX);
      const y = Math.floor(localZ);

      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
          onTileClick(x, y);
      }
  }, [onTileClick]);

  const previewPos = hoveredTile ? gridToWorld(hoveredTile.x, hoveredTile.y) : [0,0,0];
  const showPreview = hoveredTile && grid[hoveredTile.y][hoveredTile.x].buildingType === BuildingType.None && hoveredTool !== BuildingType.None;

  const renderedBuildings = useMemo(() => {
      return grid.map((row, y) => 
        row.map((tile, x) => {
            if (tile.buildingType === BuildingType.None) return null;
            const [wx, _, wz] = gridToWorld(x, y);
            return (
                <group key={`${x}-${y}`} position={[wx, 0, wz]}>
                    <ProceduralBuilding type={tile.buildingType} x={x} y={y} variant={tile.variant} rotation={tile.rotation} />
                </group>
            );
        })
      );
  }, [grid]);

  const distantTrees = useMemo(() => {
      return Array.from({length: 80}).map((_, i) => {
           const angle = (i / 80) * Math.PI * 2;
           const r = GRID_SIZE * 0.7 + Math.random() * 20;
           return {
               key: i,
               position: [Math.cos(angle)*r, 0, Math.sin(angle)*r] as [number, number, number],
               scale: [3, 8 + Math.random()*6, 3] as [number, number, number]
           };
      });
  }, []);

  // Helper to show ghost of full tree instead of seed
  const getPreviewType = (type: BuildingType) => {
    if (type === BuildingType.OakSeed) return BuildingType.OakTree;
    if (type === BuildingType.PineSeed) return BuildingType.PineTree;
    if (type === BuildingType.PalmSeed) return BuildingType.PalmTree;
    return type;
  }

  return (
    <div className="absolute inset-0 bg-teal-900 touch-none">
      <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: false }}>
        <OrthographicCamera makeDefault zoom={20} position={[40, 40, 40]} near={-100} far={500} />
        <MapControls enableRotate={true} enableZoom={true} minZoom={5} maxZoom={80} maxPolarAngle={Math.PI / 2.2} minPolarAngle={0.1} target={[0, 0, 0]} />

        <group>
            <ambientLight intensity={0.6} color="#ecfccb" />
            <directionalLight 
                position={[50, 80, 20]} 
                intensity={1.2} 
                castShadow 
                shadow-bias={-0.0005} 
                shadow-mapSize={[2048, 2048]}
            >
                 <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100, 1, 200]} />
            </directionalLight>
            
            <mesh 
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[0, -0.5, 0]} 
                onPointerMove={handlePointerMove}
                onPointerOut={() => setHoveredTile(null)}
                onPointerDown={handlePointerDown}
                visible={false} 
            >
                <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
                <meshBasicMaterial color="red" wireframe />
            </mesh>
            
            <GroundLayer grid={grid} />

            <group raycast={() => null}>
               {renderedBuildings}
            </group>
            
            {distantTrees.map((tree) => (
                 <mesh key={tree.key} position={tree.position} scale={tree.scale}>
                    <coneGeometry args={[1, 1, 4]} />
                    <meshStandardMaterial color="#064e3b" transparent opacity={0.6} />
                 </mesh>
            ))}
        </group>

        <group raycast={() => null}>
             <StudentSystem grid={grid} onStudentVisit={onStudentVisit} />

            {showPreview && hoveredTile && (
              <group position={[previewPos[0], 0, previewPos[2]]}>
                <Float speed={3} rotationIntensity={0} floatIntensity={0.1} floatingRange={[0, 0.1]}>
                  <ProceduralBuilding 
                    type={getPreviewType(hoveredTool)} 
                    x={hoveredTile.x} 
                    y={hoveredTile.y} 
                    rotation={rotation}
                    transparent 
                    opacity={0.6} 
                  />
                </Float>
              </group>
            )}
            {hoveredTile && (
              <mesh position={[previewPos[0], -0.4, previewPos[2]]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial color={hoveredTool === BuildingType.None ? '#ef4444' : (showPreview ? '#ffffff' : '#fbbf24')} transparent opacity={0.5} />
                <Outlines thickness={0.05} color="white" />
              </mesh>
            )}
          </group>
        <SoftShadows size={25} samples={8} focus={0.5} />
      </Canvas>
    </div>
  );
};

export default IsoMap;
