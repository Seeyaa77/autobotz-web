import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Procedural 256x256 sculpted cumulus cloud texture (sunrise sunlit & atmospheric mist variants).
 */
function createCloudTexture(palette = 'sunlit') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  const puffs = [
    { x: 128, y: 120, r: 74, top: 0.96, mid: 0.56, edge: 0.16 },
    { x: 84, y: 132, r: 58, top: 0.90, mid: 0.52, edge: 0.14 },
    { x: 172, y: 132, r: 58, top: 0.90, mid: 0.52, edge: 0.14 },
    { x: 108, y: 94, r: 54, top: 0.98, mid: 0.55, edge: 0.14 },
    { x: 150, y: 98, r: 50, top: 0.95, mid: 0.52, edge: 0.14 },
    { x: 54, y: 152, r: 44, top: 0.80, mid: 0.44, edge: 0.10 },
    { x: 202, y: 152, r: 44, top: 0.80, mid: 0.44, edge: 0.10 },
    { x: 96, y: 158, r: 52, top: 0.72, mid: 0.40, edge: 0.12 },
    { x: 160, y: 158, r: 52, top: 0.72, mid: 0.40, edge: 0.12 },
    { x: 128, y: 164, r: 58, top: 0.68, mid: 0.38, edge: 0.12 },
    { x: 128, y: 80, r: 40, top: 0.96, mid: 0.48, edge: 0.10 }
  ]

  const isSunlit = palette === 'sunlit'
  for (const p of puffs) {
    const grad = ctx.createRadialGradient(p.x, p.y - p.r * 0.22, p.r * 0.08, p.x, p.y, p.r)
    if (isSunlit) {
      grad.addColorStop(0, `rgba(255, 240, 220, ${(p.top * 0.92).toFixed(2)})`)
      grad.addColorStop(0.48, `rgba(255, 178, 114, ${(p.mid * 0.52).toFixed(2)})`)
      grad.addColorStop(0.78, `rgba(128, 48, 76, ${(p.edge * 0.16).toFixed(2)})`)
      grad.addColorStop(1, 'rgba(74, 34, 58, 0)')
    } else {
      grad.addColorStop(0, `rgba(255, 224, 192, ${(p.top * 0.78).toFixed(2)})`)
      grad.addColorStop(0.5, `rgba(224, 118, 86, ${(p.mid * 0.36).toFixed(2)})`)
      grad.addColorStop(0.8, `rgba(74, 34, 58, ${(p.edge * 0.12).toFixed(2)})`)
      grad.addColorStop(1, 'rgba(32, 16, 36, 0)')
    }
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/**
 * Procedural 128x128 ambient-occlusion contact shadow disc for button seating.
 */
function createContactShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62)
  grad.addColorStop(0, 'rgba(5, 7, 14, 0.82)')
  grad.addColorStop(0.5, 'rgba(5, 7, 14, 0.36)')
  grad.addColorStop(1, 'rgba(5, 7, 14, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/**
 * Glossy Armored 3D Companion Droid (AstroBot / EVE-inspired solid silhouette)
 * Smooth seamless overlapping shells — zero skinny skeleton gaps.
 */
function createCompanionDroid(shadowTex) {
  const root = new THREE.Group()

  const ceramicWhite = new THREE.MeshStandardMaterial({
    color: 0xeef2fa,
    metalness: 0.28,
    roughness: 0.22
  })
  const satinSlate = new THREE.MeshStandardMaterial({
    color: 0x262d3d,
    metalness: 0.72,
    roughness: 0.3
  })
  const visorGlass = new THREE.MeshStandardMaterial({
    color: 0x0b101b,
    metalness: 0.9,
    roughness: 0.08
  })
  const crimsonAccent = new THREE.MeshStandardMaterial({
    color: 0xfd1843,
    metalness: 0.45,
    roughness: 0.25
  })
  const sunriseGold = new THREE.MeshStandardMaterial({
    color: 0xff9e4f,
    metalness: 0.52,
    roughness: 0.24
  })
  const eyeGlow = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 3.2,
    roughness: 0.1
  })
  const coreGlow = new THREE.MeshStandardMaterial({
    color: 0xff9e4f,
    emissive: 0xff6b2b,
    emissiveIntensity: 2.5,
    roughness: 0.15
  })

  // 3D Contact Shadow Disc under seated pelvis/thighs on button top ledge
  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0,
    depthWrite: false
  })
  const contactShadow = new THREE.Mesh(new THREE.CircleGeometry(0.46, 28), contactShadowMat)
  contactShadow.rotation.x = -Math.PI / 2
  contactShadow.position.set(0, 0.528, 0.08)
  contactShadow.scale.set(1.25, 0.92, 1)
  root.add(contactShadow)

  const body = new THREE.Group()
  root.add(body)

  // --- LOWER TORSO / PELVIS (solid rounded armor shell, y = 0.82) ---
  const pelvis = new THREE.Group()
  pelvis.position.y = 0.82
  body.add(pelvis)

  const pelvisShell = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 20), satinSlate)
  pelvisShell.scale.set(1.06, 0.76, 0.92)
  pelvis.add(pelvisShell)

  const beltRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.045, 14, 32), crimsonAccent)
  beltRing.rotation.x = Math.PI / 2
  beltRing.position.y = 0.1
  pelvis.add(beltRing)

  // --- UPPER CHEST / TORSO ---
  const torso = new THREE.Group()
  torso.position.y = 0.14
  pelvis.add(torso)

  const chestMain = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 24), ceramicWhite)
  chestMain.scale.set(1.06, 1.02, 0.86)
  chestMain.position.y = 0.38
  torso.add(chestMain)

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.055, 14, 32), satinSlate)
  collar.rotation.x = Math.PI / 2.1
  collar.position.set(0, 0.76, 0.02)
  torso.add(collar)

  const coreBezel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.028, 14, 28), satinSlate)
  coreBezel.position.set(0, 0.42, 0.38)
  torso.add(coreBezel)

  const coreCenter = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 20), coreGlow)
  coreCenter.scale.set(1, 1, 0.35)
  coreCenter.position.set(0, 0.42, 0.38)
  torso.add(coreCenter)

  const backpack = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.28, 12, 20), satinSlate)
  backpack.position.set(0, 0.42, -0.34)
  torso.add(backpack)

  const packStripe = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.024, 10, 20), eyeGlow)
  packStripe.rotation.x = Math.PI / 2
  packStripe.position.set(0, 0.16, -0.38)
  torso.add(packStripe)

  // --- EXPRESSIVE HERO HEAD ---
  const head = new THREE.Group()
  head.position.set(0, 1.05, 0.02)
  torso.add(head)

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.48, 36, 26), ceramicWhite)
  helmet.scale.set(1.12, 0.94, 1.02)
  head.add(helmet)

  const crest = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.26, 8, 14), crimsonAccent)
  crest.rotation.x = Math.PI / 2.2
  crest.position.set(0, 0.43, -0.02)
  head.add(crest)

  const faceScreen = new THREE.Mesh(
    new THREE.SphereGeometry(0.44, 32, 24),
    visorGlass
  )
  faceScreen.scale.set(0.98, 0.68, 0.56)
  faceScreen.position.set(0, -0.01, 0.255)
  head.add(faceScreen)

  const leftEye = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.065, 8, 14), eyeGlow)
  leftEye.position.set(-0.14, 0.015, 0.495)
  leftEye.rotation.z = 0.06
  head.add(leftEye)

  const rightEye = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.065, 8, 14), eyeGlow)
  rightEye.position.set(0.14, 0.015, 0.495)
  rightEye.rotation.z = -0.06
  head.add(rightEye)

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.015, 8, 18, Math.PI * 0.72),
    eyeGlow
  )
  smile.rotation.z = Math.PI * 1.14
  smile.position.set(0, -0.085, 0.485)
  head.add(smile)

  ;[-1, 1].forEach((side) => {
    const earBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.1, 20), satinSlate)
    earBase.rotation.z = Math.PI / 2
    earBase.position.set(side * 0.52, -0.01, 0)
    head.add(earBase)

    const earCap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 20), sunriseGold)
    earCap.rotation.z = Math.PI / 2
    earCap.position.set(side * 0.57, -0.01, 0)
    head.add(earCap)
  })

  // --- CHUNKY SEAMLESS ARMORED ARMS ---
  const makeArm = (side) => {
    const shoulder = new THREE.Group()
    shoulder.position.set(side * 0.52, 0.62, 0)
    torso.add(shoulder)

    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 16), ceramicWhite)
    pauldron.scale.set(1.05, 0.95, 0.95)
    shoulder.add(pauldron)

    const pauldronTrim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.026, 10, 22), crimsonAccent)
    pauldronTrim.rotation.x = Math.PI / 2
    pauldronTrim.position.y = -0.1
    shoulder.add(pauldronTrim)

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.2, 10, 16), satinSlate)
    upperArm.position.y = -0.22
    shoulder.add(upperArm)

    const elbow = new THREE.Group()
    elbow.position.y = -0.38
    shoulder.add(elbow)

    const foreArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.145, 0.22, 10, 18), ceramicWhite)
    foreArm.position.y = -0.16
    elbow.add(foreArm)

    const wristGlow = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.02, 10, 20), eyeGlow)
    wristGlow.rotation.x = Math.PI / 2
    wristGlow.position.y = -0.29
    elbow.add(wristGlow)

    const hand = new THREE.Group()
    hand.position.y = -0.36
    elbow.add(hand)

    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 14), satinSlate)
    palm.scale.set(1.05, 1.0, 0.72)
    hand.add(palm)

    ;[-0.065, -0.022, 0.022, 0.065].forEach((fx, i) => {
      const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.024, 0.075, 6, 10), ceramicWhite)
      finger.position.set(fx, -0.11 - (i === 1 || i === 2 ? 0.015 : 0), 0)
      hand.add(finger)
    })
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.06, 6, 10), ceramicWhite)
    thumb.rotation.z = side * 0.78
    thumb.position.set(-side * 0.11, -0.04, 0.02)
    hand.add(thumb)

    return { shoulder, elbow, hand }
  }

  const leftArm = makeArm(-1)
  const rightArm = makeArm(1)

  // --- CHUNKY ARMORED LEGS & BOOTS ---
  const makeLeg = (side) => {
    const hip = new THREE.Group()
    hip.position.set(side * 0.21, -0.14, 0)
    pelvis.add(hip)

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.155, 0.22, 10, 16), satinSlate)
    thigh.position.y = -0.18
    hip.add(thigh)

    const knee = new THREE.Group()
    knee.position.y = -0.34
    hip.add(knee)

    const bootShin = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.2, 12, 18), ceramicWhite)
    bootShin.position.y = -0.17
    knee.add(bootShin)

    const bootRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.024, 10, 20), sunriseGold)
    bootRing.rotation.x = Math.PI / 2
    bootRing.position.y = -0.06
    knee.add(bootRing)

    const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.18, 10, 16), crimsonAccent)
    foot.rotation.x = Math.PI / 2
    foot.scale.set(1.08, 1.0, 0.72)
    foot.position.set(0, -0.32, 0.09)
    knee.add(foot)

    return { hip, knee }
  }

  const leftLeg = makeLeg(-1)
  const rightLeg = makeLeg(1)

  return {
    root,
    contactShadow,
    body,
    pelvis,
    torso,
    head,
    leftEye,
    rightEye,
    smile,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    coreGlow
  }
}

export default function IndustrialRobots3D({ progressRef, ctaBtnRef }) {
  const containerRef = useRef(null)
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      })
    } catch {
      setWebglFailed(true)
      return
    }

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.22
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const fog = new THREE.FogExp2(0x3c1e2a, 0.045)
    scene.fog = fog

    // Full-body camera framing
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60)
    camera.position.set(0, 1.38, 9.2)
    camera.lookAt(0, 1.28, 0)

    scene.add(new THREE.HemisphereLight(0xc2d4ff, 0xf27d3b, 1.6))

    const sunBack = new THREE.DirectionalLight(0xffb870, 3.0)
    sunBack.position.set(0, 5, -8)
    scene.add(sunBack)

    const frontKey = new THREE.DirectionalLight(0xfff1e4, 2.1)
    frontKey.position.set(2.5, 5.2, 9.5)
    scene.add(frontKey)

    const crimsonRim = new THREE.PointLight(0xfd1843, 18, 22, 1.5)
    crimsonRim.position.set(-6, 3.0, 4)
    scene.add(crimsonRim)

    const cyanRim = new THREE.PointLight(0x38bdf8, 18, 22, 1.5)
    cyanRim.position.set(6, 3.2, 4)
    scene.add(cyanRim)

    const seatBounceLight = new THREE.PointLight(0xfd1843, 0, 4.5, 2)
    scene.add(seatBounceLight)

    const cloudTexSunlit = createCloudTexture('sunlit')
    const cloudTexMist = createCloudTexture('mist')
    const shadowTex = createContactShadowTexture()

    // 22 Volumetric 3D Cloud Sprites across 3 depth layers (fog: false so dark scene fog never muddies them)
    const cloudSprites = []
    const addCloudSprite = (cfg) => {
      const mat = new THREE.SpriteMaterial({
        map: cfg.variant === 'sunlit' ? cloudTexSunlit : cloudTexMist,
        transparent: true,
        opacity: cfg.baseOpacity,
        depthWrite: false,
        fog: false
      })
      const sprite = new THREE.Sprite(mat)
      sprite.position.set(cfg.baseX, cfg.baseY, cfg.z)
      sprite.scale.set(cfg.sx, cfg.sy, 1)
      sprite.renderOrder = cfg.layer === 'curtain' ? 3 : 1
      scene.add(sprite)
      cloudSprites.push({ ...cfg, sprite, mat })
    }

    // Layer A: 8 Background Sky Cloud Deck sprites (always visible behind/flanking the robot)
    const skyConfigs = [
      { baseX: -7.8, baseY: 3.8, z: -6.4, sx: 7.4, sy: 3.4, speed: 0.14, baseOpacity: 0.66, variant: 'sunlit', phase: 0.2 },
      { baseX: -3.2, baseY: 4.1, z: -5.8, sx: 6.4, sy: 3.0, speed: 0.18, baseOpacity: 0.72, variant: 'sunlit', phase: 1.4 },
      { baseX: 2.6, baseY: 3.7, z: -6.1, sx: 7.8, sy: 3.5, speed: 0.13, baseOpacity: 0.64, variant: 'mist', phase: 2.5 },
      { baseX: 7.9, baseY: 4.2, z: -5.2, sx: 6.2, sy: 2.9, speed: 0.21, baseOpacity: 0.60, variant: 'sunlit', phase: 3.7 },
      { baseX: -6.2, baseY: 1.6, z: -4.2, sx: 6.6, sy: 2.8, speed: 0.22, baseOpacity: 0.76, variant: 'sunlit', phase: 0.9 },
      { baseX: -1.4, baseY: 1.9, z: -4.8, sx: 7.2, sy: 3.2, speed: 0.16, baseOpacity: 0.78, variant: 'mist', phase: 2.1 },
      { baseX: 3.8, baseY: 1.4, z: -3.6, sx: 6.0, sy: 2.6, speed: 0.25, baseOpacity: 0.74, variant: 'sunlit', phase: 4.2 },
      { baseX: 6.9, baseY: 2.4, z: -2.8, sx: 5.2, sy: 2.4, speed: 0.28, baseOpacity: 0.58, variant: 'mist', phase: 5.1 }
    ]
    skyConfigs.forEach((c) => addCloudSprite({ ...c, layer: 'sky' }))

    // Layer B: 6 Lower Horizon Cloud Sea sprites under robot's feet in Beat 1
    const horizonConfigs = [
      { baseX: -6.0, baseY: -0.25, z: -1.6, sx: 6.2, sy: 2.5, speed: -0.15, baseOpacity: 0.74, variant: 'sunlit', phase: 0.6 },
      { baseX: -2.4, baseY: -0.12, z: -0.8, sx: 5.8, sy: 2.4, speed: 0.17, baseOpacity: 0.82, variant: 'sunlit', phase: 1.8 },
      { baseX: 1.6, baseY: -0.20, z: -1.2, sx: 6.6, sy: 2.6, speed: -0.14, baseOpacity: 0.80, variant: 'mist', phase: 3.1 },
      { baseX: 5.6, baseY: -0.08, z: 0.2, sx: 5.4, sy: 2.2, speed: 0.19, baseOpacity: 0.70, variant: 'sunlit', phase: 4.5 },
      { baseX: -3.8, baseY: 0.18, z: 0.9, sx: 4.8, sy: 2.1, speed: 0.12, baseOpacity: 0.66, variant: 'mist', phase: 2.7 },
      { baseX: 3.4, baseY: 0.28, z: 1.3, sx: 4.6, sy: 2.0, speed: -0.16, baseOpacity: 0.68, variant: 'sunlit', phase: 5.4 }
    ]
    horizonConfigs.forEach((c) => addCloudSprite({ ...c, layer: 'horizon' }))

    // Layer C: 8 Foreground 2-Way Parting Cloud Curtains (4 Left + 4 Right)
    const curtainConfigs = [
      { baseX: -2.35, baseY: 2.45, z: 3.1, sx: 6.2, sy: 4.1, side: -1, baseOpacity: 0.92, variant: 'sunlit', phase: 0.3 },
      { baseX: -1.10, baseY: 1.55, z: 3.7, sx: 6.8, sy: 4.4, side: -1, baseOpacity: 0.95, variant: 'sunlit', phase: 1.5 },
      { baseX: -1.85, baseY: 0.55, z: 3.4, sx: 5.8, sy: 3.6, side: -1, baseOpacity: 0.90, variant: 'mist', phase: 2.8 },
      { baseX: -0.45, baseY: 1.15, z: 4.1, sx: 5.2, sy: 3.5, side: -1, baseOpacity: 0.94, variant: 'sunlit', phase: 3.9 },
      { baseX: 2.35, baseY: 2.55, z: 3.0, sx: 6.2, sy: 4.1, side: 1, baseOpacity: 0.92, variant: 'sunlit', phase: 0.8 },
      { baseX: 1.05, baseY: 1.45, z: 3.8, sx: 6.8, sy: 4.4, side: 1, baseOpacity: 0.95, variant: 'sunlit', phase: 2.0 },
      { baseX: 1.85, baseY: 0.45, z: 3.3, sx: 5.8, sy: 3.6, side: 1, baseOpacity: 0.90, variant: 'mist', phase: 3.2 },
      { baseX: 0.45, baseY: 1.25, z: 4.2, sx: 5.2, sy: 3.5, side: 1, baseOpacity: 0.94, variant: 'sunlit', phase: 4.6 }
    ]
    curtainConfigs.forEach((c) => addCloudSprite({ ...c, layer: 'curtain' }))

    const robot = createCompanionDroid(shadowTex)
    robot.root.renderOrder = 2
    scene.add(robot.root)

    // Project DOM button top-left corner into 3D world coordinates on z = targetZ
    const getSeatWorldPos = (targetZ) => {
      const btn = ctaBtnRef?.current
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      let ndcX = -0.46
      let ndcY = -0.18
      if (btn) {
        const rect = btn.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          const screenX = rect.left + Math.min(26, rect.width * 0.14)
          const screenY = rect.top + 3
          ndcX = (screenX / w) * 2 - 1
          ndcY = -(screenY / h) * 2 + 1
        }
      }
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera)
      const dir = vec.sub(camera.position).normalize()
      const dist = (targetZ - camera.position.z) / dir.z
      return camera.position.clone().add(dir.multiplyScalar(dist))
    }

    const wrapRange = (val, halfSpan) => {
      const span = halfSpan * 2
      return ((((val + halfSpan) % span) + span) % span) - halfSpan
    }

    const updateRobot = (elapsed, p) => {
      // Beat 1 (p: 0.00 -> 0.34): Glide from distant clouds into full-body centered wave
      const approach = easeOutCubic(clamp01(p / 0.34))
      // Beat 2 (p: 0.38 -> 0.54): Glide left & sit grounded on "Sewa Bot Cloud" button
      const sitBlend = easeInOutCubic(clamp01((p - 0.38) / 0.16))
      // Beat 3 (p: 0.68 -> 0.82): Lift & exit cleanly as Arsitektur & Keamanan UI rises
      const exitBlend = easeInOutCubic(clamp01((p - 0.68) / 0.14))
      const cloudPart = easeInOutCubic(clamp01((p - 0.04) / 0.30))
      const sp = easeInOutCubic(clamp01((p - 0.72) / 0.16))

      const standX = 0
      const standY = -0.18 + approach * 0.24 + Math.sin(elapsed * 2.2) * 0.04
      const standZ = -5.4 + approach * 7.0
      const standScale = 0.58 + approach * 0.44

      const seatZ = 2.0
      const seatTarget = getSeatWorldPos(seatZ)
      const seatScale = 0.35
      const seatX = seatTarget.x
      const seatY = seatTarget.y - 0.525 * seatScale

      const x = standX * (1 - sitBlend) + seatX * sitBlend - exitBlend * 1.4
      const y = standY * (1 - sitBlend) + seatY * sitBlend + exitBlend * 2.6
      const z = standZ * (1 - sitBlend) + seatZ * sitBlend - exitBlend * 3.0
      const sc = Math.max(0.01, (standScale * (1 - sitBlend) + seatScale * sitBlend) * (1 - exitBlend * 0.85))

      robot.root.position.set(x, y, z)
      robot.root.visible = exitBlend < 0.95
      robot.root.scale.setScalar(sc)
      robot.root.rotation.y = Math.sin(elapsed * 0.7) * 0.07 + sitBlend * 0.34

      fog.density = 0.068 * (1 - approach) + exitBlend * 0.08

      // Realistic 3D cloud & mist layer updates
      for (const c of cloudSprites) {
        if (c.layer === 'sky') {
          const driftedX = wrapRange(c.baseX + elapsed * c.speed, 10.5)
          const driftedY = c.baseY + Math.sin(elapsed * 0.45 + c.phase) * 0.12
          c.sprite.position.set(driftedX, driftedY, c.z)
          const deckVis = 1 - sitBlend * 0.42 + sp * 0.22
          c.mat.opacity = clamp01(c.baseOpacity * deckVis)
        } else if (c.layer === 'horizon') {
          const driftedX = wrapRange(c.baseX + elapsed * c.speed, 8.0)
          const driftedY = c.baseY + Math.sin(elapsed * 0.6 + c.phase) * 0.08 + sp * 0.25
          c.sprite.position.set(driftedX, driftedY, c.z)
          const seaVis = Math.max(sp * 0.38, 1 - sitBlend * 0.78) * (1 - exitBlend * 0.2)
          c.mat.opacity = clamp01(c.baseOpacity * seaVis)
        } else {
          const partedX = c.baseX + c.side * 6.4 * cloudPart + Math.sin(elapsed * 0.5 + c.phase) * 0.08
          const partedY = c.baseY + cloudPart * 0.35 + Math.cos(elapsed * 0.4 + c.phase) * 0.06
          c.sprite.position.set(partedX, partedY, c.z)
          const curtainVis = (1 - cloudPart * 0.70) * (1 - sitBlend * 0.65)
          c.mat.opacity = clamp01(c.baseOpacity * curtainVis)
        }
      }

      // Wave animation ("Say Hi!") transitioning into natural seated pose on thighs/knees
      const waveMain = easeInOutCubic(clamp01((p - 0.14) / 0.14)) * (1 - sitBlend * 0.75) * (1 - exitBlend)
      const waveOsc = Math.sin(elapsed * 7.6)

      robot.rightArm.shoulder.rotation.z = 0.18 + waveMain * 2.1 - sitBlend * 0.08
      robot.rightArm.shoulder.rotation.x = -0.08 - waveMain * 0.24 - sitBlend * 0.36
      robot.rightArm.elbow.rotation.z = waveMain * (0.28 + waveOsc * 0.42)
      robot.rightArm.elbow.rotation.x = -0.20 - sitBlend * 0.44
      robot.rightArm.hand.rotation.z = waveMain * (waveOsc * 0.3)

      robot.leftArm.shoulder.rotation.z = -0.18 + sitBlend * 0.08
      robot.leftArm.shoulder.rotation.x = -0.10 - sitBlend * 0.36
      robot.leftArm.elbow.rotation.x = -0.22 - sitBlend * 0.44 - Math.sin(elapsed * 1.8) * 0.04

      // True 90-degree bench-perch legs with shins hanging down over button front edge
      const dangleL = Math.sin(elapsed * 2.9) * 0.13 * sitBlend
      const dangleR = Math.sin(elapsed * 2.9 + Math.PI) * 0.13 * sitBlend
      robot.leftLeg.hip.rotation.x = -1.52 * sitBlend
      robot.leftLeg.hip.rotation.z = -0.07 * sitBlend
      robot.leftLeg.knee.rotation.x = 1.50 * sitBlend + dangleL
      robot.rightLeg.hip.rotation.x = -1.52 * sitBlend
      robot.rightLeg.hip.rotation.z = 0.07 * sitBlend
      robot.rightLeg.knee.rotation.x = 1.50 * sitBlend + dangleR

      robot.head.rotation.z = -waveMain * 0.14 + sitBlend * 0.08 + Math.sin(elapsed * 1.4) * 0.03
      robot.head.rotation.y = Math.sin(elapsed * 1.1) * 0.1
      const blinkCycle = elapsed % 3.8
      const eyeScaleY = blinkCycle > 3.64 ? 0.16 : 1.0
      robot.leftEye.scale.y = eyeScaleY
      robot.rightEye.scale.y = eyeScaleY

      robot.torso.rotation.x =
        0.03 - waveMain * 0.05 + sitBlend * 0.08 + Math.sin(elapsed * 2.4) * 0.02 * sitBlend
      robot.coreGlow.emissiveIntensity = 2.0 + Math.sin(elapsed * 3.8) * 0.6 + waveMain * 0.5

      // Contact shadow + crimson button underside bounce lighting
      robot.contactShadow.material.opacity = sitBlend * (1 - exitBlend) * 0.72
      seatBounceLight.position.set(x, seatTarget.y - 0.16, seatZ + 0.45)
      seatBounceLight.intensity = sitBlend * (1 - exitBlend) * 2.8
    }

    let rafId = 0
    let isVisible = true
    let lastTime = performance.now()
    let elapsed = 0.8

    updateRobot(elapsed, prefersReduced ? 0.56 : 0)
    renderer.render(scene, camera)

    const animate = (now) => {
      if (!isVisible) {
        rafId = 0
        return
      }
      rafId = requestAnimationFrame(animate)
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      elapsed += dt
      const p = progressRef?.current ?? 0
      updateRobot(elapsed, p)
      renderer.render(scene, camera)
    }

    let observer
    if (!prefersReduced) {
      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(
          (entries) => {
            isVisible = Boolean(entries[0]?.isIntersecting)
            if (isVisible && !rafId) {
              lastTime = performance.now()
              rafId = requestAnimationFrame(animate)
            }
          },
          { threshold: 0.02 }
        )
        observer.observe(container)
      }
      rafId = requestAnimationFrame(animate)
    }

    const onResize = () => {
      if (!container) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      if (prefersReduced) renderer.render(scene, camera)
    }

    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (observer) observer.disconnect()
      window.removeEventListener('resize', onResize)

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => {
              m.map?.dispose()
              m.dispose()
            })
          } else {
            obj.material.map?.dispose()
            obj.material.dispose()
          }
        }
      })
      cloudTexSunlit.dispose()
      cloudTexMist.dispose()
      shadowTex.dispose()
      renderer.dispose()
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [progressRef, ctaBtnRef])

  if (webglFailed) {
    return null
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
