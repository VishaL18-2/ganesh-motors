import React, { useRef, useLayoutEffect, useEffect, useState } from 'react'
import { useGLTF, Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Scene({ activeService }) {
  const groupRef = useRef()
  const { camera } = useThree()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const { scene } = useGLTF('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/ferrari.glb')

  // Setup ScrollTrigger for Parallax and Car base rotation
  useLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 2.5, // Increased scrub for smooth inertia
      }
    })

    if (groupRef.current) {
      tl.to(groupRef.current.rotation, {
        y: Math.PI * 2,
        ease: "none"
      }, 0)
      
      tl.to(groupRef.current.position, {
        x: 0, // Resetting X movement so it doesn't clash with service cards
        ease: "power1.inOut"
      }, 0)
    }

    tl.to(".parallax-wrapper", {
      y: -200,
      opacity: 0,
      ease: "power1.inOut"
    }, 0)

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  // Handle click on service cards
  useEffect(() => {
    if (!groupRef.current || !activeService) return;

    let targetRotation = 0;
    let targetCameraPos = { x: 0, y: 2, z: 8 };

    // We keep x mostly near 0 to keep the car centered. 
    // We only change rotation (y) and zoom (z) and keep height (y) between 1.5 and 2.5.
    switch (activeService) {
      case 'all_car':
        // Show whole car at a nice angle
        targetRotation = Math.PI / 4;
        targetCameraPos = { x: -1, y: 2, z: 7 };
        break;
      case 'breakdown':
        // Zoom into the front wheel/bumper area
        targetRotation = Math.PI / 5;
        targetCameraPos = { x: -1.5, y: 1.5, z: 5 };
        break;
      case 'accessories':
        // Show side profile
        targetRotation = Math.PI / 2;
        targetCameraPos = { x: -1, y: 1.8, z: 6 };
        break;
      case 'ac_service':
        // Focus near front grill/windshield
        targetRotation = -Math.PI / 8;
        targetCameraPos = { x: -1, y: 2, z: 5.5 };
        break;
      case 'interior':
        // Angle looking into the cabin (convertible)
        targetRotation = Math.PI / 3;
        targetCameraPos = { x: -1, y: 2.5, z: 4.5 };
        break;
      case 'wash':
        // Show the whole car from a slightly elevated back/side angle
        targetRotation = -Math.PI / 3;
        targetCameraPos = { x: -1, y: 2.2, z: 7 };
        break;
      default:
        targetRotation = 0;
        targetCameraPos = { 
          x: 0, 
          y: isMobile ? 1.5 : 2, 
          z: isMobile ? 12 : 8 
        };
        break;
    }

    // Animate the car rotation
    gsap.to(groupRef.current.rotation, {
      y: targetRotation,
      duration: 1.5,
      ease: "power3.inOut",
      overwrite: "auto" // Overwrite the scroll trigger animation temporarily
    });

    // Animate the camera position
    gsap.to(camera.position, {
      x: targetCameraPos.x,
      y: targetCameraPos.y,
      z: targetCameraPos.z,
      duration: 1.5,
      ease: "power3.inOut",
      overwrite: "auto"
    });

  }, [activeService, camera]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      
      <group ref={groupRef} position={[0, isMobile ? -0.5 : -1, 0]}>
        <primitive object={scene} />
      </group>

      <ContactShadows 
        position={[0, -1.01, 0]} 
        opacity={0.8} 
        scale={15} 
        blur={2} 
        far={4} 
        color="#000" 
      />
      
      <Environment preset="studio" />
    </>
  )
}

useGLTF.preload('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/ferrari.glb')
