// src/components/Ballpit.tsx
"use client";

import React, { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Color,
  InstancedMesh,
  MathUtils,
  MeshPhysicalMaterial,
  MeshPhysicalMaterialParameters,
  Object3D,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  ShaderChunk,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRendererParameters,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/Addons.js";
import { gsap } from "gsap";

/* ======================================================================= */
/*                               ТИПЫ / ВСПОМОГАШКИ                        */
/* ======================================================================= */

interface Shader {
  uniforms: Record<string, { value: unknown }>;
  fragmentShader: string;
  vertexShader: string;
}

interface SizeData {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
  pixelRatio: number;
}

interface ThreeWrapperConfig {
  canvas?: HTMLCanvasElement;
  id?: string;
  rendererOptions?: Partial<WebGLRendererParameters>;
  size?: "parent" | { width: number; height: number };
}

interface PostprocessingLike {
  setSize(width: number, height: number): void;
  render(): void;
  dispose(): void;
}

interface AnimationState {
  elapsed: number;
  delta: number;
}

/* ======================================================================= */
/*                             ОБЁРТКА ВОКРУГ THREE                        */
/* ======================================================================= */

class ThreeWrapper {
  private config: ThreeWrapperConfig;
  private postprocessing?: PostprocessingLike;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private resizeTimer?: number;
  private animationFrameId = 0;
  private clock: Clock = new Clock();
  private isAnimating = false;
  private isVisible = false;

  canvas!: HTMLCanvasElement;
  camera!: PerspectiveCamera;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  cameraFov!: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
  scene!: Scene;
  renderer!: WebGLRenderer;

  size: SizeData = {
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    ratio: 0,
    pixelRatio: 0,
  };

  animationState: AnimationState = { elapsed: 0, delta: 0 };

  render: () => void = this.innerRender.bind(this);
  onBeforeRender: (state: AnimationState) => void = () => {};
  onAfterRender: (state: AnimationState) => void = () => {};
  onAfterResize: (size: SizeData) => void = () => {};
  isDisposed = false;

  constructor(config: ThreeWrapperConfig) {
    this.config = { ...config };
    this.initCamera();
    this.initScene();
    this.initRenderer();
    this.resize();
    this.initObservers();
  }

  private initCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }

  private initScene() {
    this.scene = new Scene();
  }

  private initRenderer() {
    if (this.config.canvas) {
      this.canvas = this.config.canvas;
    } else if (this.config.id) {
      const elem = document.getElementById(this.config.id);
      if (elem instanceof HTMLCanvasElement) {
        this.canvas = elem;
      } else {
        throw new Error("ThreeWrapper: element with given id is not a canvas");
      }
    } else {
      throw new Error("ThreeWrapper: canvas or id must be provided");
    }

    this.canvas.style.display = "block";

    const rendererOptions: WebGLRendererParameters = {
      canvas: this.canvas,
      powerPreference: "high-performance",
      ...(this.config.rendererOptions ?? {}),
    };

    this.renderer = new WebGLRenderer(rendererOptions);
    this.renderer.outputColorSpace = SRGBColorSpace;
  }

  private initObservers() {
    if (!(this.config.size instanceof Object)) {
      const resizeHandler = this.onResize.bind(this);
      window.addEventListener("resize", resizeHandler);

      if (this.config.size === "parent" && this.canvas.parentNode) {
        this.resizeObserver = new ResizeObserver(resizeHandler);
        this.resizeObserver.observe(this.canvas.parentNode as Element);
      }
    }

    this.intersectionObserver = new IntersectionObserver(
      this.onIntersection.bind(this),
      { root: null, rootMargin: "0px", threshold: 0 }
    );
    this.intersectionObserver.observe(this.canvas);

    document.addEventListener(
      "visibilitychange",
      this.onVisibilityChange.bind(this)
    );
  }

  private onResize() {
    if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => this.resize(), 80);
  }

  resize() {
    let w: number;
    let h: number;

    if (this.config.size && this.config.size !== "parent") {
      w = this.config.size.width;
      h = this.config.size.height;
    } else if (this.config.size === "parent" && this.canvas.parentNode) {
      const parent = this.canvas.parentNode as HTMLElement;
      w = parent.offsetWidth;
      h = parent.offsetHeight;
    } else {
      w = window.innerWidth;
      h = window.innerHeight;
    }

    this.size.width = w;
    this.size.height = h;
    this.size.ratio = w / h;

    this.updateCamera();
    this.updateRenderer();
    this.onAfterResize(this.size);
  }

  private updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;

    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.adjustFov(this.cameraMinAspect);
      } else if (
        this.cameraMaxAspect &&
        this.camera.aspect > this.cameraMaxAspect
      ) {
        this.adjustFov(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }

    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  private adjustFov(aspect: number) {
    const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
    const newTan = tanFov / (this.camera.aspect / aspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
  }

  updateWorldSize() {
    const fovRad = (this.camera.fov * Math.PI) / 180;
    this.size.wHeight =
      2 * Math.tan(fovRad / 2) * this.camera.position.length();
    this.size.wWidth = this.size.wHeight * this.camera.aspect;
  }

  private updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);
    if (this.postprocessing) {
      this.postprocessing.setSize(this.size.width, this.size.height);
    }

    let pr = window.devicePixelRatio;
    if (this.maxPixelRatio && pr > this.maxPixelRatio) {
      pr = this.maxPixelRatio;
    } else if (this.minPixelRatio && pr < this.minPixelRatio) {
      pr = this.minPixelRatio;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    this.size.pixelRatio = pr;
  }

  get postProcessing(): PostprocessingLike | undefined {
    return this.postprocessing;
  }

  set postProcessing(value: PostprocessingLike | undefined) {
    this.postprocessing = value;
    if (value) {
      this.render = value.render.bind(value);
    } else {
      this.render = this.innerRender.bind(this);
    }
  }

  private onIntersection(entries: IntersectionObserverEntry[]) {
    const isIntersecting = entries[0]?.isIntersecting ?? false;
    this.isAnimating = isIntersecting;
    if (isIntersecting) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

  private onVisibilityChange() {
    if (!this.isAnimating) return;
    if (document.hidden) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  private startAnimation() {
    if (this.isVisible) return;

    const animateFrame = () => {
      this.animationFrameId = window.requestAnimationFrame(animateFrame);
      this.animationState.delta = this.clock.getDelta();
      this.animationState.elapsed += this.animationState.delta;

      this.onBeforeRender(this.animationState);
      this.render();
      this.onAfterRender(this.animationState);
    };

    this.isVisible = true;
    this.clock.start();
    animateFrame();
  }

  private stopAnimation() {
    if (!this.isVisible) return;
    window.cancelAnimationFrame(this.animationFrameId);
    this.isVisible = false;
    this.clock.stop();
  }

  private innerRender() {
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.scene.traverse((obj) => {
      const anyObj = obj as {
        isMesh?: boolean;
        material?: unknown;
        geometry?: { dispose: () => void };
      };

      if (!anyObj.isMesh || !anyObj.material || !anyObj.geometry) return;

      const mat = anyObj.material as {
        dispose?: () => void;
        [key: string]: unknown;
      };

      Object.values(mat).forEach((val) => {
        const maybeDisposable = val as { dispose?: () => void };
        if (maybeDisposable && typeof maybeDisposable.dispose === "function") {
          maybeDisposable.dispose();
        }
      });

      if (typeof mat.dispose === "function") {
        mat.dispose();
      }

      anyObj.geometry.dispose();
    });

    this.scene.clear();
  }

  updateSize(width: number, height: number) {
    if (this.config.size && typeof this.config.size === "object") {
      this.config.size.width = width;
      this.config.size.height = height;
    }
    this.resize();
  }

  dispose() {
    this.stopAnimation();

    window.removeEventListener("resize", this.onResize.bind(this));
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener(
      "visibilitychange",
      this.onVisibilityChange.bind(this)
    );

    this.clear();
    this.postprocessing?.dispose();
    this.renderer.dispose();
    this.isDisposed = true;
  }
}

/* ======================================================================= */
/*                              ФИЗИКА ШАРОВ                               */
/* ======================================================================= */

interface PhysicsConfig {
  count: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  maxSize: number;
  minSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  controlSphere0: boolean;
  followCursor: boolean;
}

class PhysicsSystem {
  config: PhysicsConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center: Vector3 = new Vector3();

  constructor(config: PhysicsConfig) {
    this.config = { ...config };
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3();

    this.initPositions();
    this.setSizes();
  }

  private initPositions() {
    const { config, positionData } = this;

    this.center.toArray(positionData, 0);

    for (let i = 1; i < config.count; i += 1) {
      const idx = 3 * i;
      positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
      positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
      positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
    }
  }

  reinitPositions() {
    this.initPositions();
  }

  setSizes() {
    const { config, sizeData } = this;

    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i += 1) {
      sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
    }
  }

  update(deltaInfo: { delta: number }) {
    const { config, center, positionData, sizeData, velocityData } = this;

    let startIdx = 0;

    const tmpPos = new Vector3();
    const tmpVel = new Vector3();
    const diff = new Vector3();
    const otherPos = new Vector3();
    const otherVel = new Vector3();

    if (config.controlSphere0) {
      startIdx = 1;
      tmpPos.fromArray(positionData, 0);
      tmpPos.lerp(center, 0.12).toArray(positionData, 0);
      new Vector3(0, 0, 0).toArray(velocityData, 0);
    }

    for (let idx = startIdx; idx < config.count; idx += 1) {
      const base = 3 * idx;
      tmpPos.fromArray(positionData, base);
      tmpVel.fromArray(velocityData, base);

      tmpVel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
      tmpVel.multiplyScalar(config.friction);
      tmpVel.clampLength(0, config.maxVelocity);

      tmpPos.add(tmpVel);

      tmpPos.toArray(positionData, base);
      tmpVel.toArray(velocityData, base);
    }

    for (let idx = startIdx; idx < config.count; idx += 1) {
      const base = 3 * idx;
      tmpPos.fromArray(positionData, base);
      tmpVel.fromArray(velocityData, base);

      const radius = sizeData[idx];

      for (let j = idx + 1; j < config.count; j += 1) {
        const otherBase = 3 * j;
        otherPos.fromArray(positionData, otherBase);
        otherVel.fromArray(velocityData, otherBase);

        diff.copy(otherPos).sub(tmpPos);
        const dist = diff.length();
        const sumRadius = radius + sizeData[j];

        if (dist < sumRadius && dist > 0.0001) {
          const overlap = sumRadius - dist;
          const correction = diff.normalize().multiplyScalar(0.5 * overlap);

          const velMag = Math.max(tmpVel.length(), 1);
          const otherVelMag = Math.max(otherVel.length(), 1);

          tmpPos.sub(correction);
          tmpVel.sub(correction.clone().multiplyScalar(velMag));

          otherPos.add(correction);
          otherVel.add(correction.clone().multiplyScalar(otherVelMag));

          tmpPos.toArray(positionData, base);
          tmpVel.toArray(velocityData, base);

          otherPos.toArray(positionData, otherBase);
          otherVel.toArray(velocityData, otherBase);
        }
      }

      if (config.controlSphere0) {
        diff.fromArray(positionData, 0).sub(tmpPos);
        const d = diff.length();
        const sumRadius0 = radius + sizeData[0];
        if (d < sumRadius0 && d > 0.0001) {
          const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
          const velCorrection = correction
            .clone()
            .multiplyScalar(Math.max(tmpVel.length(), 2));
          tmpPos.sub(correction);
          tmpVel.sub(velCorrection);
        }
      }

      if (Math.abs(tmpPos.x) + radius > config.maxX) {
        tmpPos.x = Math.sign(tmpPos.x) * (config.maxX - radius);
        tmpVel.x = -tmpVel.x * config.wallBounce;
      }

      if (config.gravity === 0) {
        if (Math.abs(tmpPos.y) + radius > config.maxY) {
          tmpPos.y = Math.sign(tmpPos.y) * (config.maxY - radius);
          tmpVel.y = -tmpVel.y * config.wallBounce;
        }
      } else if (tmpPos.y - radius < -config.maxY) {
        tmpPos.y = -config.maxY + radius;
        tmpVel.y = -tmpVel.y * config.wallBounce;
      }

      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(tmpPos.z) + radius > maxBoundary) {
        tmpPos.z = Math.sign(tmpPos.z) * (config.maxZ - radius);
        tmpVel.z = -tmpVel.z * config.wallBounce;
      }

      tmpPos.toArray(positionData, base);
      tmpVel.toArray(velocityData, base);
    }
  }
}

/* ======================================================================= */
/*                     МАТЕРИАЛ С ПОЛУПРОЗРАЧНЫМ СВЕЧЕНИЕМ                 */
/* ======================================================================= */

class ScatteringMaterial extends MeshPhysicalMaterial {
  uniforms: Record<string, { value: number }> = {
    thicknessDistortion: { value: 0.1 },
    thicknessAmbient: { value: 0 },
    thicknessAttenuation: { value: 0.1 },
    thicknessPower: { value: 2 },
    thicknessScale: { value: 10 },
  };

  defines?: Record<string, string>;
  onBeforeCompile2?: (shader: Shader) => void;

  constructor(params: MeshPhysicalMaterialParameters & { envMap: Texture }) {
    super(params);

    this.defines = this.defines || {};
    this.defines.USE_UV = "";

    this.onBeforeCompile = (shaderData: unknown) => {
      const shader = shaderData as Shader;

      Object.assign(shader.uniforms, this.uniforms);

      shader.fragmentShader =
        `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
        ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        void RE_Direct_Scattering(
          const in IncidentLight directLight,
          const in vec2 uv,
          const in vec3 geometryPosition,
          const in vec3 geometryNormal,
          const in vec3 geometryViewDir,
          const in vec3 geometryClearcoatNormal,
          inout ReflectedLight reflectedLight
        ) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;

          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif

          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }

        void main() {
        `
      );

      const lightsChunkOriginal = ShaderChunk.lights_fragment_begin as string;
      const lightsChunk = lightsChunkOriginal.replace(
        "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
        `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering( directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight );
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <lights_fragment_begin>",
        lightsChunk
      );

      if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
    };
  }
}

/* ======================================================================= */
/*                           КОНФИГ БОЛЬШОГО ПИТА                          */
/* ======================================================================= */

interface BallpitConfig {
  count: number;
  colors: number[];
  ambientColor: number;
  ambientIntensity: number;
  lightIntensity: number;
  materialParams: {
    metalness: number;
    roughness: number;
    clearcoat: number;
    clearcoatRoughness: number;
  };
  minSize: number;
  maxSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  controlSphere0: boolean;
  followCursor: boolean;
}

const defaultBallpitConfig: BallpitConfig = {
  count: 220,
  colors: [0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xffffff],
  ambientColor: 0xffffff,
  ambientIntensity: 1.1,
  lightIntensity: 220,
  materialParams: {
    metalness: 0.6,
    roughness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
  },
  minSize: 0.6,
  maxSize: 1.1,
  size0: 1.1,
  gravity: 0.45,
  friction: 0.995,
  wallBounce: 0.96,
  maxVelocity: 0.17,
  maxX: 5,
  maxY: 4,
  maxZ: 2.3,
  controlSphere0: false,
  followCursor: true,
};

const tempObject = new Object3D();

const isMobile =
  typeof window !== "undefined" &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );

/* ======================================================================= */
/*                            Pointer helper                                */
/* ======================================================================= */

interface PointerData {
  position: Vector2;
  nPosition: Vector2;
  hover: boolean;
  touching: boolean;
  onEnter: (data: PointerData) => void;
  onMove: (data: PointerData) => void;
  onClick: (data: PointerData) => void;
  onLeave: (data: PointerData) => void;
  dispose: () => void;
}

const pointerPosition = new Vector2();
const pointerMap = new Map<HTMLElement, PointerData>();
let globalPointerActive = false;

function isInside(rect: DOMRect): boolean {
  return (
    pointerPosition.x >= rect.left &&
    pointerPosition.x <= rect.left + rect.width &&
    pointerPosition.y >= rect.top &&
    pointerPosition.y <= rect.top + rect.height
  );
}

function updatePointerData(data: PointerData, rect: DOMRect) {
  data.position.set(
    pointerPosition.x - rect.left,
    pointerPosition.y - rect.top
  );
  data.nPosition.set(
    (data.position.x / rect.width) * 2 - 1,
    (-data.position.y / rect.height) * 2 + 1
  );
}

function handlePointerMove() {
  for (const [elem, data] of pointerMap.entries()) {
    const rect = elem.getBoundingClientRect();
    if (isInside(rect)) {
      updatePointerData(data, rect);
      if (!data.hover) {
        data.hover = true;
        data.onEnter(data);
      }
      data.onMove(data);
    } else if (data.hover && !data.touching) {
      data.hover = false;
      data.onLeave(data);
    }
  }
}

function onPointerMove(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY);
  handlePointerMove();
}

function onPointerLeave() {
  for (const data of pointerMap.values()) {
    if (data.hover) {
      data.hover = false;
      data.onLeave(data);
    }
  }
}

function onPointerClick(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY);
  for (const [elem, data] of pointerMap.entries()) {
    const rect = elem.getBoundingClientRect();
    updatePointerData(data, rect);
    if (isInside(rect)) data.onClick(data);
  }
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 0) return;
  // e.preventDefault();
  pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
  for (const [elem, data] of pointerMap.entries()) {
    const rect = elem.getBoundingClientRect();
    if (isInside(rect)) {
      data.touching = true;
      updatePointerData(data, rect);
      if (!data.hover) {
        data.hover = true;
        data.onEnter(data);
      }
      data.onMove(data);
    }
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 0) return;
  // e.preventDefault();
  pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
  for (const [elem, data] of pointerMap.entries()) {
    const rect = elem.getBoundingClientRect();
    updatePointerData(data, rect);
    if (isInside(rect)) {
      if (!data.hover) {
        data.hover = true;
        data.touching = true;
        data.onEnter(data);
      }
      data.onMove(data);
    } else if (data.hover && data.touching) {
      data.onMove(data);
    }
  }
}

function onTouchEnd() {
  for (const data of pointerMap.values()) {
    if (data.touching) {
      data.touching = false;
      if (data.hover) {
        data.hover = false;
        data.onLeave(data);
      }
    }
  }
}

function ensureGlobalPointerListeners() {
  if (globalPointerActive) return;
  document.body.addEventListener("pointermove", onPointerMove as EventListener);
  document.body.addEventListener(
    "pointerleave",
    onPointerLeave as EventListener
  );
  document.body.addEventListener("click", onPointerClick as EventListener);

  document.body.addEventListener("touchstart", onTouchStart as EventListener, {
    passive: false,
  });
  document.body.addEventListener("touchmove", onTouchMove as EventListener, {
    passive: false,
  });
  document.body.addEventListener("touchend", onTouchEnd as EventListener, {
    passive: false,
  });
  document.body.addEventListener("touchcancel", onTouchEnd as EventListener, {
    passive: false,
  });

  globalPointerActive = true;
}

function cleanupGlobalPointerListeners() {
  if (!globalPointerActive) return;

  document.body.removeEventListener(
    "pointermove",
    onPointerMove as EventListener
  );
  document.body.removeEventListener(
    "pointerleave",
    onPointerLeave as EventListener
  );
  document.body.removeEventListener("click", onPointerClick as EventListener);

  document.body.removeEventListener(
    "touchstart",
    onTouchStart as EventListener
  );
  document.body.removeEventListener("touchmove", onTouchMove as EventListener);
  document.body.removeEventListener("touchend", onTouchEnd as EventListener);
  document.body.removeEventListener(
    "touchcancel",
    onTouchEnd as EventListener
  );

  globalPointerActive = false;
}

function createPointerData(domElement: HTMLElement): PointerData {
  const data: PointerData = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter: () => {},
    onMove: () => {},
    onClick: () => {},
    onLeave: () => {},
    dispose: () => {},
  };

  pointerMap.set(domElement, data);
  ensureGlobalPointerListeners();

  data.dispose = () => {
    pointerMap.delete(domElement);
    if (pointerMap.size === 0) {
      cleanupGlobalPointerListeners();
    }
  };

  return data;
}

/* ======================================================================= */
/*                             INSTANCED ШАРЫ                               */
/* ======================================================================= */

class Spheres extends InstancedMesh {
  config: BallpitConfig;
  physics: PhysicsSystem;
  ambientLight: AmbientLight;
  light: PointLight;

  constructor(renderer: WebGLRenderer, params: Partial<BallpitConfig> = {}) {
    const config: BallpitConfig = {
      ...defaultBallpitConfig,
      ...params,
    };

    const roomEnv = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(roomEnv);
    const envTexture = envRT.texture as Texture;

    const geometry = new SphereGeometry(1, 48, 48);
    const material = new ScatteringMaterial({
      envMap: envTexture,
      ...config.materialParams,
      transmission: 0.96,
      ior: 1.3,
      thickness: 1.2,
    });

    material.envMapRotation.x = -Math.PI / 2;

    super(geometry, material, config.count);

    this.config = config;
    this.physics = new PhysicsSystem(config);
    this.ambientLight = new AmbientLight(
      this.config.ambientColor,
      this.config.ambientIntensity
    );
    this.light = new PointLight(
      this.config.colors[0],
      this.config.lightIntensity
    );

    this.add(this.ambientLight);
    this.add(this.light);

    this.setColors(config.colors);
  }

  setColors(colors: readonly number[]) {
    const colorObjects: Color[] = colors.map((c) => new Color(c));

    const getColorAt = (ratio: number, out: Color): Color => {
      const clamped = Math.min(1, Math.max(0, ratio));
      const scaled = clamped * (colorObjects.length - 1);
      const idx = Math.floor(scaled);

      const start = colorObjects[idx];
      if (idx >= colorObjects.length - 1) {
        return out.copy(start);
      }

      const alpha = scaled - idx;
      const end = colorObjects[idx + 1];

      out.r = start.r + alpha * (end.r - start.r);
      out.g = start.g + alpha * (end.g - start.g);
      out.b = start.b + alpha * (end.b - start.b);

      return out;
    };

    const tmpColor = new Color();

    for (let i = 0; i < this.count; i += 1) {
      this.setColorAt(i, getColorAt(i / this.count, tmpColor));
      if (i === 0) {
        this.light.color.copy(tmpColor);
      }
    }

    if (this.instanceColor) {
      this.instanceColor.needsUpdate = true;
    }
  }

  update(deltaInfo: { delta: number }) {
    this.physics.update(deltaInfo);

    for (let idx = 0; idx < this.count; idx += 1) {
      tempObject.position.fromArray(this.physics.positionData, 3 * idx);

      if (idx === 0 && !this.config.followCursor) {
        tempObject.scale.setScalar(0);
      } else {
        tempObject.scale.setScalar(this.physics.sizeData[idx]);
      }

      tempObject.updateMatrix();
      this.setMatrixAt(idx, tempObject.matrix);

      if (idx === 0) {
        this.light.position.copy(tempObject.position);
      }
    }

    this.instanceMatrix.needsUpdate = true;
  }
}

/* ======================================================================= */
/*                      ФАБРИКА: СОЗДАНИЕ ПОЛЯ СФЕР                         */
/* ======================================================================= */

interface BallpitInstance {
  three: ThreeWrapper;
  readonly spheres: Spheres;
  setCount(count: number): void;
  togglePause(): void;
  dispose(): void;
}

function createBallpit(
  canvas: HTMLCanvasElement,
  config: Partial<BallpitConfig> = {}
): BallpitInstance {
  const threeInstance = new ThreeWrapper({
    canvas,
    size: { width: window.innerWidth, height: window.innerHeight },
    rendererOptions: { antialias: true, alpha: true },
  });

  threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
  threeInstance.camera.position.set(0, 0, 18);
  threeInstance.camera.lookAt(0, 0, 0);
  threeInstance.resize();

  let spheres: Spheres = new Spheres(threeInstance.renderer, config);
  threeInstance.scene.add(spheres);

  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const intersectionPoint = new Vector3();
  let isPaused = false;

  const pointerData = createPointerData(canvas);

  if (config.followCursor !== false && !isMobile) {
    pointerData.onMove = (data) => {
      raycaster.setFromCamera(data.nPosition, threeInstance.camera);
      threeInstance.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, intersectionPoint);

      gsap.to(spheres.physics.center, {
        x: intersectionPoint.x,
        y: intersectionPoint.y,
        z: intersectionPoint.z,
        duration: 0.35,
        ease: "power2.out",
      });

      spheres.config.controlSphere0 = true;
    };

    pointerData.onLeave = () => {
      spheres.config.controlSphere0 = false;
    };
  }

  // canvas.style.touchAction = "none";
  // canvas.style.userSelect = "none";
  // (canvas.style as { webkitUserSelect?: string }).webkitUserSelect = "none";

  const setBox = () => {
    const worldW = threeInstance.size.wWidth;
    const worldH = threeInstance.size.wHeight;

    spheres.config.maxX = worldW * 0.35;             // ширина коробки
    spheres.config.maxY = (worldH * 0.14) / 2;       // высота (узкая)
    spheres.position.y = worldH * 0.22;              // поднять в зону хиро
    spheres.physics.reinitPositions();
  };

  threeInstance.onBeforeRender = (deltaInfo) => {
    if (!isPaused) spheres.update(deltaInfo);
  };

  threeInstance.onAfterResize = (size) => {
    const oldMaxX = spheres.config.maxX;
    const oldMaxY = spheres.config.maxY;

    spheres.config.maxX = size.wWidth * 0.35;
    spheres.config.maxY = (size.wHeight * 0.14) / 2;
    spheres.position.y = size.wHeight * 0.22;

    const xChange = Math.abs(spheres.config.maxX - oldMaxX) / Math.max(oldMaxX, 0.0001);
    const yChange = Math.abs(spheres.config.maxY - oldMaxY) / Math.max(oldMaxY, 0.0001);
    if (xChange > 0.2 || yChange > 0.2) {
      spheres.physics.reinitPositions();
    }
  };

  setBox();

  const handleWindowResize = () => {
    threeInstance.updateSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", handleWindowResize);

  const initSpheres = (newConfig: BallpitConfig) => {
    threeInstance.clear();
    threeInstance.scene.remove(spheres);
    spheres = new Spheres(threeInstance.renderer, newConfig);
    threeInstance.scene.add(spheres);
    setBox();
  };

  return {
    three: threeInstance,
    get spheres() {
      return spheres;
    },
    setCount(count: number) {
      initSpheres({ ...spheres.config, count });
    },
    togglePause() {
      isPaused = !isPaused;
    },
    dispose() {
      window.removeEventListener("resize", handleWindowResize);
      pointerData.dispose();
      threeInstance.dispose();
    },
  };
}

/* ======================================================================= */
/*                           REACT-КОМПОНЕНТ                               */
/* ======================================================================= */

export interface BallpitProps {
  className?: string;
  followCursor?: boolean;
  colors?: number[];
  count?: number;
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  maxVelocity?: number;
  minSize?: number;
  maxSize?: number;
}

const Ballpit: React.FC<BallpitProps> = ({
  className,
  followCursor = true,
  colors,
  count,
  gravity,
  friction,
  wallBounce,
  maxVelocity,
  minSize,
  maxSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instanceRef = useRef<BallpitInstance | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initBallpit = () => {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;

      instanceRef.current = createBallpit(currentCanvas, {
        followCursor,
        ...(colors ? { colors } : {}),
        ...(typeof count === "number" ? { count } : {}),
        ...(typeof gravity === "number" ? { gravity } : {}),
        ...(typeof friction === "number" ? { friction } : {}),
        ...(typeof wallBounce === "number" ? { wallBounce } : {}),
        ...(typeof maxVelocity === "number" ? { maxVelocity } : {}),
        ...(typeof minSize === "number" ? { minSize } : {}),
        ...(typeof maxSize === "number" ? { maxSize } : {}),
      });
    };

    if (window.innerWidth === 0 || window.innerHeight === 0) {
      const timeout = setTimeout(() => {
        if (window.innerWidth > 0 && window.innerHeight > 0) initBallpit();
      }, 100);
      return () => clearTimeout(timeout);
    }

    initBallpit();

    return () => {
      instanceRef.current?.dispose();
    };
  }, [followCursor, colors, count, gravity, friction, wallBounce, maxVelocity, minSize, maxSize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
};

export default Ballpit;








// //------------работает но залазит на футер----------
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   ACESFilmicToneMapping,
//   AmbientLight,
//   Clock,
//   Color,
//   InstancedMesh,
//   MathUtils,
//   MeshPhysicalMaterial,
//   MeshPhysicalMaterialParameters,
//   Object3D,
//   PerspectiveCamera,
//   Plane,
//   PMREMGenerator,
//   PointLight,
//   Raycaster,
//   Scene,
//   ShaderChunk,
//   SphereGeometry,
//   SRGBColorSpace,
//   Texture,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
//   WebGLRendererParameters,
// } from "three";
// import { RoomEnvironment } from "three/examples/jsm/Addons.js";
// import { gsap } from "gsap";

// /* ======================================================================= */
// /*                               ТИПЫ / ВСПОМОГАШКИ                        */
// /* ======================================================================= */

// interface Shader {
//   uniforms: Record<string, { value: unknown }>;
//   fragmentShader: string;
//   vertexShader: string;
// }

// interface SizeData {
//   width: number;
//   height: number;
//   wWidth: number;
//   wHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// interface ThreeWrapperConfig {
//   canvas?: HTMLCanvasElement;
//   id?: string;
//   rendererOptions?: Partial<WebGLRendererParameters>;
//   size?: "parent" | { width: number; height: number };
// }

// interface PostprocessingLike {
//   setSize(width: number, height: number): void;
//   render(): void;
//   dispose(): void;
// }

// interface AnimationState {
//   elapsed: number;
//   delta: number;
// }

// /* ======================================================================= */
// /*                             ОБЁРТКА ВОКРУГ THREE                        */
// /* ======================================================================= */

// class ThreeWrapper {
//   private config: ThreeWrapperConfig;
//   private postprocessing?: PostprocessingLike;
//   private resizeObserver?: ResizeObserver;
//   private intersectionObserver?: IntersectionObserver;
//   private resizeTimer?: number;
//   private animationFrameId = 0;
//   private clock: Clock = new Clock();
//   private isAnimating = false;
//   private isVisible = false;

//   canvas!: HTMLCanvasElement;
//   camera!: PerspectiveCamera;
//   cameraMinAspect?: number;
//   cameraMaxAspect?: number;
//   cameraFov!: number;
//   maxPixelRatio?: number;
//   minPixelRatio?: number;
//   scene!: Scene;
//   renderer!: WebGLRenderer;

//   size: SizeData = {
//     width: 0,
//     height: 0,
//     wWidth: 0,
//     wHeight: 0,
//     ratio: 0,
//     pixelRatio: 0,
//   };

//   animationState: AnimationState = { elapsed: 0, delta: 0 };

//   render: () => void = this.innerRender.bind(this);
//   onBeforeRender: (state: AnimationState) => void = () => {};
//   onAfterRender: (state: AnimationState) => void = () => {};
//   onAfterResize: (size: SizeData) => void = () => {};
//   isDisposed = false;

//   constructor(config: ThreeWrapperConfig) {
//     this.config = { ...config };
//     this.initCamera();
//     this.initScene();
//     this.initRenderer();
//     this.resize();
//     this.initObservers();
//   }

//   private initCamera() {
//     this.camera = new PerspectiveCamera();
//     this.cameraFov = this.camera.fov;
//   }

//   private initScene() {
//     this.scene = new Scene();
//   }

//   private initRenderer() {
//     if (this.config.canvas) {
//       this.canvas = this.config.canvas;
//     } else if (this.config.id) {
//       const elem = document.getElementById(this.config.id);
//       if (elem instanceof HTMLCanvasElement) {
//         this.canvas = elem;
//       } else {
//         throw new Error("ThreeWrapper: element with given id is not a canvas");
//       }
//     } else {
//       throw new Error("ThreeWrapper: canvas or id must be provided");
//     }

//     this.canvas.style.display = "block";

//     const rendererOptions: WebGLRendererParameters = {
//       canvas: this.canvas,
//       powerPreference: "high-performance",
//       ...(this.config.rendererOptions ?? {}),
//     };

//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;
//   }

//   private initObservers() {
//     if (!(this.config.size instanceof Object)) {
//       const resizeHandler = this.onResize.bind(this);
//       window.addEventListener("resize", resizeHandler);

//       if (this.config.size === "parent" && this.canvas.parentNode) {
//         this.resizeObserver = new ResizeObserver(resizeHandler);
//         this.resizeObserver.observe(this.canvas.parentNode as Element);
//       }
//     }

//     this.intersectionObserver = new IntersectionObserver(
//       this.onIntersection.bind(this),
//       { root: null, rootMargin: "0px", threshold: 0 }
//     );
//     this.intersectionObserver.observe(this.canvas);

//     document.addEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );
//   }

//   private onResize() {
//     if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
//     this.resizeTimer = window.setTimeout(() => this.resize(), 80);
//   }

//   resize() {
//     let w: number;
//     let h: number;

//     if (this.config.size && this.config.size !== "parent") {
//       w = this.config.size.width;
//       h = this.config.size.height;
//     } else if (this.config.size === "parent" && this.canvas.parentNode) {
//       const parent = this.canvas.parentNode as HTMLElement;
//       w = parent.offsetWidth;
//       h = parent.offsetHeight;
//     } else {
//       w = window.innerWidth;
//       h = window.innerHeight;
//     }

//     this.size.width = w;
//     this.size.height = h;
//     this.size.ratio = w / h;

//     this.updateCamera();
//     this.updateRenderer();
//     this.onAfterResize(this.size);
//   }

//   private updateCamera() {
//     this.camera.aspect = this.size.width / this.size.height;

//     if (this.camera.isPerspectiveCamera && this.cameraFov) {
//       if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
//         this.adjustFov(this.cameraMinAspect);
//       } else if (
//         this.cameraMaxAspect &&
//         this.camera.aspect > this.cameraMaxAspect
//       ) {
//         this.adjustFov(this.cameraMaxAspect);
//       } else {
//         this.camera.fov = this.cameraFov;
//       }
//     }

//     this.camera.updateProjectionMatrix();
//     this.updateWorldSize();
//   }

//   private adjustFov(aspect: number) {
//     const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
//     const newTan = tanFov / (this.camera.aspect / aspect);
//     this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
//   }

//   updateWorldSize() {
//     const fovRad = (this.camera.fov * Math.PI) / 180;
//     this.size.wHeight =
//       2 * Math.tan(fovRad / 2) * this.camera.position.length();
//     this.size.wWidth = this.size.wHeight * this.camera.aspect;
//   }

//   private updateRenderer() {
//     this.renderer.setSize(this.size.width, this.size.height);
//     if (this.postprocessing) {
//       this.postprocessing.setSize(this.size.width, this.size.height);
//     }

//     let pr = window.devicePixelRatio;
//     if (this.maxPixelRatio && pr > this.maxPixelRatio) {
//       pr = this.maxPixelRatio;
//     } else if (this.minPixelRatio && pr < this.minPixelRatio) {
//       pr = this.minPixelRatio;
//     }

//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;
//   }

//   get postProcessing(): PostprocessingLike | undefined {
//     return this.postprocessing;
//   }

//   set postProcessing(value: PostprocessingLike | undefined) {
//     this.postprocessing = value;
//     if (value) {
//       this.render = value.render.bind(value);
//     } else {
//       this.render = this.innerRender.bind(this);
//     }
//   }

//   private onIntersection(entries: IntersectionObserverEntry[]) {
//     const isIntersecting = entries[0]?.isIntersecting ?? false;
//     this.isAnimating = isIntersecting;
//     if (isIntersecting) {
//       this.startAnimation();
//     } else {
//       this.stopAnimation();
//     }
//   }

//   private onVisibilityChange() {
//     if (!this.isAnimating) return;
//     if (document.hidden) {
//       this.stopAnimation();
//     } else {
//       this.startAnimation();
//     }
//   }

//   private startAnimation() {
//     if (this.isVisible) return;

//     const animateFrame = () => {
//       this.animationFrameId = window.requestAnimationFrame(animateFrame);
//       this.animationState.delta = this.clock.getDelta();
//       this.animationState.elapsed += this.animationState.delta;

//       this.onBeforeRender(this.animationState);
//       this.render();
//       this.onAfterRender(this.animationState);
//     };

//     this.isVisible = true;
//     this.clock.start();
//     animateFrame();
//   }

//   private stopAnimation() {
//     if (!this.isVisible) return;
//     window.cancelAnimationFrame(this.animationFrameId);
//     this.isVisible = false;
//     this.clock.stop();
//   }

//   private innerRender() {
//     this.renderer.render(this.scene, this.camera);
//   }

//   clear() {
//     this.scene.traverse((obj) => {
//       const anyObj = obj as {
//         isMesh?: boolean;
//         material?: unknown;
//         geometry?: { dispose: () => void };
//       };

//       if (!anyObj.isMesh || !anyObj.material || !anyObj.geometry) return;

//       const mat = anyObj.material as {
//         dispose?: () => void;
//         [key: string]: unknown;
//       };

//       Object.values(mat).forEach((val) => {
//         const maybeDisposable = val as { dispose?: () => void };
//         if (maybeDisposable && typeof maybeDisposable.dispose === "function") {
//           maybeDisposable.dispose();
//         }
//       });

//       if (typeof mat.dispose === "function") {
//         mat.dispose();
//       }

//       anyObj.geometry.dispose();
//     });

//     this.scene.clear();
//   }

//   updateSize(width: number, height: number) {
//     if (this.config.size && typeof this.config.size === "object") {
//       this.config.size.width = width;
//       this.config.size.height = height;
//     }
//     this.resize();
//   }

//   dispose() {
//     this.stopAnimation();

//     window.removeEventListener("resize", this.onResize.bind(this));
//     this.resizeObserver?.disconnect();
//     this.intersectionObserver?.disconnect();
//     document.removeEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );

//     this.clear();
//     this.postprocessing?.dispose();
//     this.renderer.dispose();
//     this.isDisposed = true;
//   }
// }

// /* ======================================================================= */
// /*                              ФИЗИКА ШАРОВ                               */
// /* ======================================================================= */

// interface PhysicsConfig {
//   count: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   maxSize: number;
//   minSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// class PhysicsSystem {
//   config: PhysicsConfig;
//   positionData: Float32Array;
//   velocityData: Float32Array;
//   sizeData: Float32Array;
//   center: Vector3 = new Vector3();

//   constructor(config: PhysicsConfig) {
//     this.config = { ...config };
//     this.positionData = new Float32Array(3 * config.count).fill(0);
//     this.velocityData = new Float32Array(3 * config.count).fill(0);
//     this.sizeData = new Float32Array(config.count).fill(1);
//     this.center = new Vector3();

//     this.initPositions();
//     this.setSizes();
//   }

//   private initPositions() {
//     const { config, positionData } = this;

//     this.center.toArray(positionData, 0);

//     for (let i = 1; i < config.count; i += 1) {
//       const idx = 3 * i;
//       positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   reinitPositions() {
//     this.initPositions();
//   }

//   setSizes() {
//     const { config, sizeData } = this;

//     sizeData[0] = config.size0;
//     for (let i = 1; i < config.count; i += 1) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     const { config, center, positionData, sizeData, velocityData } = this;

//     let startIdx = 0;

//     const tmpPos = new Vector3();
//     const tmpVel = new Vector3();
//     const diff = new Vector3();
//     const otherPos = new Vector3();
//     const otherVel = new Vector3();

//     if (config.controlSphere0) {
//       startIdx = 1;
//       tmpPos.fromArray(positionData, 0);
//       tmpPos.lerp(center, 0.12).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }

//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       tmpVel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
//       tmpVel.multiplyScalar(config.friction);
//       tmpVel.clampLength(0, config.maxVelocity);

//       tmpPos.add(tmpVel);

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }

//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       const radius = sizeData[idx];

//       for (let j = idx + 1; j < config.count; j += 1) {
//         const otherBase = 3 * j;
//         otherPos.fromArray(positionData, otherBase);
//         otherVel.fromArray(velocityData, otherBase);

//         diff.copy(otherPos).sub(tmpPos);
//         const dist = diff.length();
//         const sumRadius = radius + sizeData[j];

//         if (dist < sumRadius && dist > 0.0001) {
//           const overlap = sumRadius - dist;
//           const correction = diff.normalize().multiplyScalar(0.5 * overlap);

//           const velMag = Math.max(tmpVel.length(), 1);
//           const otherVelMag = Math.max(otherVel.length(), 1);

//           tmpPos.sub(correction);
//           tmpVel.sub(correction.clone().multiplyScalar(velMag));

//           otherPos.add(correction);
//           otherVel.add(correction.clone().multiplyScalar(otherVelMag));

//           tmpPos.toArray(positionData, base);
//           tmpVel.toArray(velocityData, base);

//           otherPos.toArray(positionData, otherBase);
//           otherVel.toArray(velocityData, otherBase);
//         }
//       }

//       if (config.controlSphere0) {
//         diff.fromArray(positionData, 0).sub(tmpPos);
//         const d = diff.length();
//         const sumRadius0 = radius + sizeData[0];
//         if (d < sumRadius0 && d > 0.0001) {
//           const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
//           const velCorrection = correction
//             .clone()
//             .multiplyScalar(Math.max(tmpVel.length(), 2));
//           tmpPos.sub(correction);
//           tmpVel.sub(velCorrection);
//         }
//       }

//       if (Math.abs(tmpPos.x) + radius > config.maxX) {
//         tmpPos.x = Math.sign(tmpPos.x) * (config.maxX - radius);
//         tmpVel.x = -tmpVel.x * config.wallBounce;
//       }

//       if (config.gravity === 0) {
//         if (Math.abs(tmpPos.y) + radius > config.maxY) {
//           tmpPos.y = Math.sign(tmpPos.y) * (config.maxY - radius);
//           tmpVel.y = -tmpVel.y * config.wallBounce;
//         }
//       } else if (tmpPos.y - radius < -config.maxY) {
//         tmpPos.y = -config.maxY + radius;
//         tmpVel.y = -tmpVel.y * config.wallBounce;
//       }

//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(tmpPos.z) + radius > maxBoundary) {
//         tmpPos.z = Math.sign(tmpPos.z) * (config.maxZ - radius);
//         tmpVel.z = -tmpVel.z * config.wallBounce;
//       }

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }
//   }
// }

// /* ======================================================================= */
// /*                     МАТЕРИАЛ С ПОЛУПРОЗРАЧНЫМ СВЕЧЕНИЕМ                 */
// /* ======================================================================= */

// class ScatteringMaterial extends MeshPhysicalMaterial {
//   uniforms: Record<string, { value: number }> = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2 },
//     thicknessScale: { value: 10 },
//   };

//   defines?: Record<string, string>;
//   onBeforeCompile2?: (shader: Shader) => void;

//   constructor(params: MeshPhysicalMaterialParameters & { envMap: Texture }) {
//     super(params);

//     this.defines = this.defines || {};
//     this.defines.USE_UV = "";

//     this.onBeforeCompile = (shaderData: unknown) => {
//       const shader = shaderData as Shader;

//       Object.assign(shader.uniforms, this.uniforms);

//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//         ` + shader.fragmentShader;

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "void main() {",
//         `
//         void RE_Direct_Scattering(
//           const in IncidentLight directLight,
//           const in vec2 uv,
//           const in vec3 geometryPosition,
//           const in vec3 geometryNormal,
//           const in vec3 geometryViewDir,
//           const in vec3 geometryClearcoatNormal,
//           inout ReflectedLight reflectedLight
//         ) {
//           vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;

//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif

//           reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//         `
//       );

//       const lightsChunkOriginal = ShaderChunk.lights_fragment_begin as string;
//       const lightsChunk = lightsChunkOriginal.replace(
//         "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
//         `
//           RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
//           RE_Direct_Scattering( directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight );
//         `
//       );

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "#include <lights_fragment_begin>",
//         lightsChunk
//       );

//       if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
//     };
//   }
// }

// /* ======================================================================= */
// /*                           КОНФИГ БОЛЬШОГО ПИТА                          */
// /* ======================================================================= */

// interface BallpitConfig {
//   count: number;
//   colors: number[];
//   ambientColor: number;
//   ambientIntensity: number;
//   lightIntensity: number;
//   materialParams: {
//     metalness: number;
//     roughness: number;
//     clearcoat: number;
//     clearcoatRoughness: number;
//   };
//   minSize: number;
//   maxSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// const defaultBallpitConfig: BallpitConfig = {
//   count: 220,
//   colors: [0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xffffff],
//   ambientColor: 0xffffff,
//   ambientIntensity: 1.1,
//   lightIntensity: 220,
//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.35,
//     clearcoat: 1,
//     clearcoatRoughness: 0.18,
//   },
//   minSize: 0.6,
//   maxSize: 1.1,
//   size0: 1.1,
//   gravity: 0.45,
//   friction: 0.995,
//   wallBounce: 0.96,
//   maxVelocity: 0.17,
//   maxX: 5,
//   maxY: 4,
//   maxZ: 2.3,
//   controlSphere0: false,
//   followCursor: true,
// };

// const tempObject = new Object3D();

// /* ======================================================================= */
// /*                            Pointer helper                                */
// /* ======================================================================= */

// interface PointerData {
//   position: Vector2;
//   nPosition: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (data: PointerData) => void;
//   onMove: (data: PointerData) => void;
//   onClick: (data: PointerData) => void;
//   onLeave: (data: PointerData) => void;
//   dispose: () => void;
// }

// const pointerPosition = new Vector2();
// const pointerMap = new Map<HTMLElement, PointerData>();
// let globalPointerActive = false;

// function isInside(rect: DOMRect): boolean {
//   return (
//     pointerPosition.x >= rect.left &&
//     pointerPosition.x <= rect.left + rect.width &&
//     pointerPosition.y >= rect.top &&
//     pointerPosition.y <= rect.top + rect.height
//   );
// }

// function updatePointerData(data: PointerData, rect: DOMRect) {
//   data.position.set(
//     pointerPosition.x - rect.left,
//     pointerPosition.y - rect.top
//   );
//   data.nPosition.set(
//     (data.position.x / rect.width) * 2 - 1,
//     (-data.position.y / rect.height) * 2 + 1
//   );
// }

// function handlePointerMove() {
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && !data.touching) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerMove(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   handlePointerMove();
// }

// function onPointerLeave() {
//   for (const data of pointerMap.values()) {
//     if (data.hover) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerClick(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) data.onClick(data);
//   }
// }

// function onTouchStart(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       data.touching = true;
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     }
//   }
// }

// function onTouchMove(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) {
//       if (!data.hover) {
//         data.hover = true;
//         data.touching = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && data.touching) {
//       data.onMove(data);
//     }
//   }
// }

// function onTouchEnd() {
//   for (const data of pointerMap.values()) {
//     if (data.touching) {
//       data.touching = false;
//       if (data.hover) {
//         data.hover = false;
//         data.onLeave(data);
//       }
//     }
//   }
// }

// function ensureGlobalPointerListeners() {
//   if (globalPointerActive) return;
//   document.body.addEventListener("pointermove", onPointerMove as EventListener);
//   document.body.addEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.addEventListener("click", onPointerClick as EventListener);

//   document.body.addEventListener("touchstart", onTouchStart as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchmove", onTouchMove as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchend", onTouchEnd as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchcancel", onTouchEnd as EventListener, {
//     passive: false,
//   });

//   globalPointerActive = true;
// }

// function cleanupGlobalPointerListeners() {
//   if (!globalPointerActive) return;

//   document.body.removeEventListener(
//     "pointermove",
//     onPointerMove as EventListener
//   );
//   document.body.removeEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.removeEventListener("click", onPointerClick as EventListener);

//   document.body.removeEventListener(
//     "touchstart",
//     onTouchStart as EventListener
//   );
//   document.body.removeEventListener("touchmove", onTouchMove as EventListener);
//   document.body.removeEventListener("touchend", onTouchEnd as EventListener);
//   document.body.removeEventListener(
//     "touchcancel",
//     onTouchEnd as EventListener
//   );

//   globalPointerActive = false;
// }

// function createPointerData(domElement: HTMLElement): PointerData {
//   const data: PointerData = {
//     position: new Vector2(),
//     nPosition: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onClick: () => {},
//     onLeave: () => {},
//     dispose: () => {},
//   };

//   pointerMap.set(domElement, data);
//   ensureGlobalPointerListeners();

//   data.dispose = () => {
//     pointerMap.delete(domElement);
//     if (pointerMap.size === 0) {
//       cleanupGlobalPointerListeners();
//     }
//   };

//   return data;
// }

// /* ======================================================================= */
// /*                             INSTANCED ШАРЫ                               */
// /* ======================================================================= */

// class Spheres extends InstancedMesh {
//   config: BallpitConfig;
//   physics: PhysicsSystem;
//   ambientLight: AmbientLight;
//   light: PointLight;

//   constructor(renderer: WebGLRenderer, params: Partial<BallpitConfig> = {}) {
//     const config: BallpitConfig = {
//       ...defaultBallpitConfig,
//       ...params,
//     };

//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envRT = pmrem.fromScene(roomEnv);
//     const envTexture = envRT.texture as Texture;

//     const geometry = new SphereGeometry(1, 32, 32);
//     const material = new ScatteringMaterial({
//       envMap: envTexture,
//       ...config.materialParams,
//       transmission: 0.96,
//       ior: 1.3,
//       thickness: 1.2,
//     });

//     material.envMapRotation.x = -Math.PI / 2;

//     super(geometry, material, config.count);

//     this.config = config;
//     this.physics = new PhysicsSystem(config);
//     this.ambientLight = new AmbientLight(
//       this.config.ambientColor,
//       this.config.ambientIntensity
//     );
//     this.light = new PointLight(
//       this.config.colors[0],
//       this.config.lightIntensity
//     );

//     this.add(this.ambientLight);
//     this.add(this.light);

//     this.setColors(config.colors);
//   }

//   setColors(colors: readonly number[]) {
//     const colorObjects: Color[] = colors.map((c) => new Color(c));

//     const getColorAt = (ratio: number, out: Color): Color => {
//       const clamped = Math.min(1, Math.max(0, ratio));
//       const scaled = clamped * (colorObjects.length - 1);
//       const idx = Math.floor(scaled);

//       const start = colorObjects[idx];
//       if (idx >= colorObjects.length - 1) {
//         return out.copy(start);
//       }

//       const alpha = scaled - idx;
//       const end = colorObjects[idx + 1];

//       out.r = start.r + alpha * (end.r - start.r);
//       out.g = start.g + alpha * (end.g - start.g);
//       out.b = start.b + alpha * (end.b - start.b);

//       return out;
//     };

//     const tmpColor = new Color();

//     for (let i = 0; i < this.count; i += 1) {
//       this.setColorAt(i, getColorAt(i / this.count, tmpColor));
//       if (i === 0) {
//         this.light.color.copy(tmpColor);
//       }
//     }

//     if (this.instanceColor) {
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     this.physics.update(deltaInfo);

//     for (let idx = 0; idx < this.count; idx += 1) {
//       tempObject.position.fromArray(this.physics.positionData, 3 * idx);

//       if (idx === 0 && !this.config.followCursor) {
//         tempObject.scale.setScalar(0);
//       } else {
//         tempObject.scale.setScalar(this.physics.sizeData[idx]);
//       }

//       tempObject.updateMatrix();
//       this.setMatrixAt(idx, tempObject.matrix);

//       if (idx === 0) {
//         this.light.position.copy(tempObject.position);
//       }
//     }

//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// /* ======================================================================= */
// /*                      ФАБРИКА: СОЗДАНИЕ ПОЛЯ СФЕР                         */
// /* ======================================================================= */

// interface BallpitInstance {
//   three: ThreeWrapper;
//   readonly spheres: Spheres;
//   setCount(count: number): void;
//   togglePause(): void;
//   dispose(): void;
// }

// function createBallpit(
//   canvas: HTMLCanvasElement,
//   config: Partial<BallpitConfig> = {}
// ): BallpitInstance {
//   const threeInstance = new ThreeWrapper({
//     canvas,
//     size: { width: window.innerWidth, height: window.innerHeight },
//     rendererOptions: { antialias: true, alpha: true },
//   });

//   threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
//   threeInstance.camera.position.set(0, 0, 18);
//   threeInstance.camera.lookAt(0, 0, 0);
//   threeInstance.resize();

//   let spheres: Spheres = new Spheres(threeInstance.renderer, config);
//   threeInstance.scene.add(spheres);

//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();
//   let isPaused = false;

//   const pointerData = createPointerData(canvas);

//   if (config.followCursor !== false) {
//     pointerData.onMove = (data) => {
//       raycaster.setFromCamera(data.nPosition, threeInstance.camera);
//       threeInstance.camera.getWorldDirection(plane.normal);
//       raycaster.ray.intersectPlane(plane, intersectionPoint);

//       gsap.to(spheres.physics.center, {
//         x: intersectionPoint.x,
//         y: intersectionPoint.y,
//         z: intersectionPoint.z,
//         duration: 0.35,
//         ease: "power2.out",
//       });

//       spheres.config.controlSphere0 = true;
//     };

//     pointerData.onLeave = () => {
//       spheres.config.controlSphere0 = false;
//     };
//   }

//   canvas.style.touchAction = "none";
//   canvas.style.userSelect = "none";
//   (canvas.style as { webkitUserSelect?: string }).webkitUserSelect = "none";

//   threeInstance.onBeforeRender = (deltaInfo) => {
//     if (!isPaused) spheres.update(deltaInfo);
//   };

//   threeInstance.onAfterResize = (size) => {
//     const oldMaxX = spheres.config.maxX;
//     const oldMaxY = spheres.config.maxY;

//     // Ограничиваем коробку по Y: только верхняя полоса
//     const worldWidth = size.wWidth;
//     const worldHeight = size.wHeight;

//     // ширина коробки
//     const newMaxX = worldWidth * 0.45;
//     // высота коробки (около 20% высоты) и смещение вверх (центр в ~25–30% экрана)
//     const boxHeight = worldHeight * 0.20;
//     const boxCenterY = worldHeight * 0.28;

//     spheres.config.maxX = newMaxX;
//     spheres.config.maxY = boxHeight / 2;

//     // Сдвиг всей группы вверх
//     spheres.position.y = boxCenterY;

//     const xChange = Math.abs(newMaxX - oldMaxX) / Math.max(oldMaxX, 0.0001);
//     const yChange = Math.abs(spheres.config.maxY - oldMaxY) / Math.max(oldMaxY, 0.0001);
//     if (xChange > 0.2 || yChange > 0.2) {
//       spheres.physics.reinitPositions();
//     }
//   };

//   spheres.config.maxX = threeInstance.size.wWidth * 0.45;
//   spheres.config.maxY = (threeInstance.size.wHeight * 0.20) / 2;
//   spheres.position.y = threeInstance.size.wHeight * 0.28;
//   spheres.physics.reinitPositions();

//   const handleWindowResize = () => {
//     threeInstance.updateSize(window.innerWidth, window.innerHeight);
//   };
//   window.addEventListener("resize", handleWindowResize);

//   const initSpheres = (newConfig: BallpitConfig) => {
//     threeInstance.clear();
//     threeInstance.scene.remove(spheres);
//     spheres = new Spheres(threeInstance.renderer, newConfig);
//     threeInstance.scene.add(spheres);
//   };

//   return {
//     three: threeInstance,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initSpheres({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       window.removeEventListener("resize", handleWindowResize);
//       pointerData.dispose();
//       threeInstance.dispose();
//     },
//   };
// }

// /* ======================================================================= */
// /*                           REACT-КОМПОНЕНТ                               */
// /* ======================================================================= */

// export interface BallpitProps {
//   className?: string;
//   followCursor?: boolean;
//   colors?: number[];
//   count?: number;
//   gravity?: number;
//   friction?: number;
//   wallBounce?: number;
//   maxVelocity?: number;
//   minSize?: number;
//   maxSize?: number;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   className,
//   followCursor = true,
//   colors,
//   count,
//   gravity,
//   friction,
//   wallBounce,
//   maxVelocity,
//   minSize,
//   maxSize,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const instanceRef = useRef<BallpitInstance | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const initBallpit = () => {
//       const currentCanvas = canvasRef.current;
//       if (!currentCanvas) return;

//       instanceRef.current = createBallpit(currentCanvas, {
//         followCursor,
//         ...(colors ? { colors } : {}),
//         ...(typeof count === "number" ? { count } : {}),
//         ...(typeof gravity === "number" ? { gravity } : {}),
//         ...(typeof friction === "number" ? { friction } : {}),
//         ...(typeof wallBounce === "number" ? { wallBounce } : {}),
//         ...(typeof maxVelocity === "number" ? { maxVelocity } : {}),
//         ...(typeof minSize === "number" ? { minSize } : {}),
//         ...(typeof maxSize === "number" ? { maxSize } : {}),
//       });
//     };

//     if (window.innerWidth === 0 || window.innerHeight === 0) {
//       const timeout = setTimeout(() => {
//         if (window.innerWidth > 0 && window.innerHeight > 0) initBallpit();
//       }, 100);
//       return () => clearTimeout(timeout);
//     }

//     initBallpit();

//     return () => {
//       instanceRef.current?.dispose();
//     };
//   }, [followCursor, colors, count, gravity, friction, wallBounce, maxVelocity, minSize, maxSize]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         display: "block",
//         pointerEvents: "auto",
//         zIndex: 1,
//       }}
//     />
//   );
// };

// export default Ballpit;










// // src/components/Ballpit.tsx
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   AmbientLight,
//   Clock,
//   Color,
//   Mesh,
//   MeshPhysicalMaterial,
//   PerspectiveCamera,
//   Plane,
//   PointLight,
//   Raycaster,
//   Scene,
//   SphereGeometry,
//   SRGBColorSpace,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
// } from "three";

// export interface BallpitProps {
//   className?: string;
//   /** Реакция шариков на курсор */
//   followCursor?: boolean;
//   /** Количество шариков */
//   count?: number;
//   /** Гравитация */
//   gravity?: number;
//   /** Трение */
//   friction?: number;
//   /** Отскок от стен */
//   wallBounce?: number;
//   /** Максимальная скорость */
//   maxVelocity?: number;
//   /** Минимальный размер */
//   minSize?: number;
//   /** Максимальный размер */
//   maxSize?: number;
//   /** Цвета шаров */
//   colors?: number[];
// }

// /**
//  * Красивый фон с цветными шариками.
//  * Работает в границах родительского блока. Родителю желательно дать
//  * `position: relative` и `overflow: hidden`.
//  */
// const Ballpit: React.FC<BallpitProps> = ({
//   className = "",
//   followCursor = true,
//   count = 120,
//   gravity: gravityProp = 0.2,
//   friction: frictionProp = 0.995,
//   maxVelocity: maxVelocityProp = 2.2,
//   minSize = 0.7,
//   maxSize = 1.8,
//   colors,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // ----------------- БАЗОВАЯ СЦЕНА -----------------
//     const scene = new Scene();
//     scene.background = null;

//     const clock = new Clock();

//     const camera = new PerspectiveCamera(32, 1, 0.1, 100);
//     camera.position.set(0, 0, 20);
//     camera.lookAt(0, 0, 0);

//     const renderer = new WebGLRenderer({
//       canvas,
//       antialias: true,
//       alpha: true,
//       powerPreference: "high-performance",
//     });
//     renderer.outputColorSpace = SRGBColorSpace;

//     // Мягкое освещение
//     const ambient = new AmbientLight(0xffffff, 1.0);
//     const mainLight = new PointLight(0xffffff, 40, 100);
//     mainLight.position.set(5, 10, 15);
//     scene.add(ambient, mainLight);

//     // ----------------- ПАРАМЕТРЫ ПУЗЫРЕЙ -----------------
//     const defaultPalette = [
//       new Color("#ff7cf5"),
//       new Color("#ffd6ff"),
//       new Color("#b3f3ff"),
//       new Color("#ffeaa7"),
//       new Color("#c4ffdd"),
//     ];

//     const palette = colors
//       ? colors.map((hex) => new Color(hex))
//       : defaultPalette;

//     const spheres: Mesh<SphereGeometry, MeshPhysicalMaterial>[] = [];
//     const velocities: Vector3[] = [];
//     const baseScales: number[] = [];
//     const floatOffsets: number[] = [];

//     const geometry = new SphereGeometry(1, 32, 32);

//     // Границы мира (в мировых координатах)
//     // НАЧАЛЬНЫЕ границы - будут пересчитаны в resize()
//     const bounds = {
//       minX: -10,
//       maxX: 10,
//       minY: 2,    // Верхняя часть (положительные Y = верх)
//       maxY: 6,    // Самый верх
//     };

//     const gravity = gravityProp;
//     const friction = frictionProp;
//     const maxVelocity = maxVelocityProp;

//     // ----------------- СОЗДАНИЕ ПУЗЫРЕЙ -----------------
//     for (let i = 0; i < count; i += 1) {
//       const color = palette[i % palette.length].clone();

//       const material = new MeshPhysicalMaterial({
//         color,
//         metalness: 0.2,
//         roughness: 0.15,
//         transmission: 0.9, // стеклянный эффект
//         thickness: 1.0,
//         clearcoat: 1,
//         clearcoatRoughness: 0.1,
//         reflectivity: 0.8,
//       });

//       const mesh = new Mesh(geometry, material);

//       // базовый размер
//       const scale = minSize + Math.random() * (maxSize - minSize);
//       mesh.scale.setScalar(scale);
//       baseScales.push(scale);

//       // случайное положение по всей ширине/высоте
//       mesh.position.set(
//         bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
//         bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
//         -4 + Math.random() * 8 // небольшой разброс по глубине
//       );

//       // начальная скорость - преимущественно вверх и в стороны
//       const velocity = new Vector3(
//         (Math.random() - 0.5) * 0.6,        // движение влево-вправо
//         Math.random() * 0.3,                // движение ВВЕРХ (положительные Y)
//         (Math.random() - 0.5) * 0.2         // небольшое движение по глубине
//       );

//       velocities.push(velocity);
//       floatOffsets.push(Math.random() * Math.PI * 2);

//       spheres.push(mesh);
//       scene.add(mesh);
//     }

//     // ----------------- РЕАКЦИЯ НА КУРСОР -----------------
//     const raycaster = new Raycaster();
//     const pointerNdc = new Vector2();
//     const pointerWorld = new Vector3();
//     const plane = new Plane(new Vector3(0, 0, 1), 0); // плоскость z=0
//     const hasPointer = { value: false };

//     function updatePointer(event: PointerEvent) {
//       if (!followCursor || !canvas) return;

//       const rect = canvas.getBoundingClientRect();
//       pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//       raycaster.setFromCamera(pointerNdc, camera);
//       raycaster.ray.intersectPlane(plane, pointerWorld);
//       hasPointer.value = true;
//     }

//     function clearPointer() {
//       hasPointer.value = false;
//     }

//     if (followCursor) {
//       canvas.addEventListener("pointermove", updatePointer);
//       canvas.addEventListener("pointerleave", clearPointer);
//       canvas.addEventListener("pointerdown", updatePointer);
//       canvas.addEventListener("pointerup", clearPointer);
//     }

//     // ----------------- РЕСАЙЗ -----------------
//     const resize = () => {
//       const parent = canvas.parentElement;
//       if (!parent) return;

//       const { clientWidth, clientHeight } = parent;

//       const width = clientWidth || window.innerWidth;
//       const height = clientHeight || window.innerHeight;

//       const aspect = width / height;
//       camera.aspect = aspect;
//       camera.updateProjectionMatrix();

//       renderer.setSize(width, height, false);
//       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//       // пересчёт мировых границ из параметров камеры
//       const distance = Math.abs(camera.position.z);
//       const vFov = (camera.fov * Math.PI) / 180;
//       const worldHeight = 2 * Math.tan(vFov / 2) * distance;
//       const worldWidth = worldHeight * aspect;

//       // немного уменьшаем границы, чтобы пузыри не "липли" к краю
//       const paddingX = worldWidth * 0.05;

//       bounds.minX = -worldWidth / 2 + paddingX;
//       bounds.maxX = worldWidth / 2 - paddingX;
      
//       // ОГРАНИЧЕНИЕ: Шары только в ВЕРХНЕЙ части экрана (верхние 35%)
//       const topAreaHeight = worldHeight * 0.35;
//       bounds.maxY = worldHeight / 2 - worldHeight * 0.1; // Немного от самого верха
//       bounds.minY = bounds.maxY - topAreaHeight; // Только верхние 35%
      
//       // Пересоздаем позиции шаров в новых границах
//       for (let i = 0; i < spheres.length; i += 1) {
//         const mesh = spheres[i];
//         // Перемещаем шар в верхнюю зону если он вне её
//         if (mesh.position.y < bounds.minY || mesh.position.y > bounds.maxY) {
//           mesh.position.y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
//         }
//         if (mesh.position.x < bounds.minX || mesh.position.x > bounds.maxX) {
//           mesh.position.x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
//         }
//       }
//     };

//     resize();
//     window.addEventListener("resize", resize);

//     // ----------------- АНИМАЦИЯ -----------------
//     let animationFrameId: number;

//     const animate = () => {
//       animationFrameId = window.requestAnimationFrame(animate);

//       const delta = Math.min(clock.getDelta(), 0.033);
//       const elapsed = clock.getElapsedTime();

//       for (let i = 0; i < spheres.length; i += 1) {
//         const mesh = spheres[i];
//         const velocity = velocities[i];

//         // псевдо-гравитация
//         velocity.y -= gravity * delta;
        
//         // ЛЕГКАЯ ПЛАВУЧЕСТЬ - шары стремятся оставаться в верхней части
//         const floatStrength = 0.15;
//         velocity.y += floatStrength * delta;

//         // лёгкие колебания
//         const floatPhase = elapsed * 0.8 + floatOffsets[i];
//         mesh.scale.setScalar(
//           baseScales[i] * (1 + 0.08 * Math.sin(floatPhase * 1.3))
//         );

//         // реакция на курсор
//         if (hasPointer.value) {
//           const toPointer = new Vector3()
//             .subVectors(pointerWorld, mesh.position)
//             .multiplyScalar(0.12);

//           velocity.add(toPointer);
//         }

//         // трение
//         velocity.multiplyScalar(friction);

//         // ограничение скорости
//         if (velocity.lengthSq() > maxVelocity * maxVelocity) {
//           velocity.setLength(maxVelocity);
//         }

//         // обновление позиции
//         mesh.position.addScaledVector(velocity, 60 * delta);

//         // отскоки от границ по X
//         const radius = mesh.scale.x;
//         if (mesh.position.x - radius < bounds.minX) {
//           mesh.position.x = bounds.minX + radius;
//           velocity.x = Math.abs(velocity.x);
//         } else if (mesh.position.x + radius > bounds.maxX) {
//           mesh.position.x = bounds.maxX - radius;
//           velocity.x = -Math.abs(velocity.x);
//         }

//         // отскоки от границ по Y
//         if (mesh.position.y - radius < bounds.minY) {
//           mesh.position.y = bounds.minY + radius;
//           velocity.y = Math.abs(velocity.y) * 0.9;
//         } else if (mesh.position.y + radius > bounds.maxY) {
//           mesh.position.y = bounds.maxY - radius;
//           velocity.y = -Math.abs(velocity.y) * 0.9;
//         }
//       }

//       renderer.render(scene, camera);
//     };

//     animate();

//     // ----------------- ОЧИСТКА -----------------
//     return () => {
//       window.cancelAnimationFrame(animationFrameId);
//       window.removeEventListener("resize", resize);

//       if (followCursor) {
//         canvas.removeEventListener("pointermove", updatePointer);
//         canvas.removeEventListener("pointerleave", clearPointer);
//         canvas.removeEventListener("pointerdown", updatePointer);
//         canvas.removeEventListener("pointerup", clearPointer);
//       }

//       spheres.forEach((mesh) => {
//         mesh.geometry.dispose();
//         mesh.material.dispose();
//         scene.remove(mesh);
//       });

//       renderer.dispose();
//     };
//   }, [followCursor, count, gravityProp, frictionProp, maxVelocityProp, minSize, maxSize, colors]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{
//         width: "100%",
//         height: "100%",
//         display: "block",
//         pointerEvents: "auto", // курсор нужен для эффекта
//       }}
//     />
//   );
// };

// export default Ballpit;



// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   AmbientLight,
//   Clock,
//   Color,
//   Mesh,
//   MeshPhysicalMaterial,
//   PerspectiveCamera,
//   Plane,
//   PointLight,
//   Raycaster,
//   Scene,
//   SphereGeometry,
//   SRGBColorSpace,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
// } from "three";

// export interface BallpitProps {
//   className?: string;
//   /** Реакция шариков на курсор */
//   followCursor?: boolean;
//   /** Количество шариков */
//   count?: number;
//   /** Гравитация */
//   gravity?: number;
//   /** Трение */
//   friction?: number;
//   /** Отскок от стен */
//   wallBounce?: number;
//   /** Максимальная скорость */
//   maxVelocity?: number;
//   /** Минимальный размер */
//   minSize?: number;
//   /** Максимальный размер */
//   maxSize?: number;
//   /** Цвета шаров */
//   colors?: number[];
// }

// /**
//  * Красивый фон с цветными шариками.
//  * Работает в границах родительского блока. Родителю желательно дать
//  * `position: relative` и `overflow: hidden`.
//  */
// const Ballpit: React.FC<BallpitProps> = ({
//   className = "",
//   followCursor = true,
//   count = 120,
//   gravity: gravityProp = 0.2,
//   friction: frictionProp = 0.995,
//   maxVelocity: maxVelocityProp = 2.2,
//   minSize = 0.7,
//   maxSize = 1.8,
//   colors,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // ----------------- БАЗОВАЯ СЦЕНА -----------------
//     const scene = new Scene();
//     scene.background = null;

//     const clock = new Clock();

//     const camera = new PerspectiveCamera(32, 1, 0.1, 100);
//     camera.position.set(0, 0, 20);
//     camera.lookAt(0, 0, 0);

//     const renderer = new WebGLRenderer({
//       canvas,
//       antialias: true,
//       alpha: true,
//       powerPreference: "high-performance",
//     });
//     renderer.outputColorSpace = SRGBColorSpace;

//     // Мягкое освещение
//     const ambient = new AmbientLight(0xffffff, 1.0);
//     const mainLight = new PointLight(0xffffff, 40, 100);
//     mainLight.position.set(5, 10, 15);
//     scene.add(ambient, mainLight);

//     // ----------------- ПАРАМЕТРЫ ПУЗЫРЕЙ -----------------
//     const defaultPalette = [
//       new Color("#ff7cf5"),
//       new Color("#ffd6ff"),
//       new Color("#b3f3ff"),
//       new Color("#ffeaa7"),
//       new Color("#c4ffdd"),
//     ];

//     const palette = colors
//       ? colors.map((hex) => new Color(hex))
//       : defaultPalette;

//     const spheres: Mesh<SphereGeometry, MeshPhysicalMaterial>[] = [];
//     const velocities: Vector3[] = [];
//     const baseScales: number[] = [];
//     const floatOffsets: number[] = [];

//     const geometry = new SphereGeometry(1, 32, 32);

//     // Границы мира (в мировых координатах)
//     const bounds = {
//       minX: -10,
//       maxX: 10,
//       minY: -6,
//       maxY: 6,
//     };

//     const gravity = gravityProp;
//     const friction = frictionProp;
//     const maxVelocity = maxVelocityProp;

//     // ----------------- СОЗДАНИЕ ПУЗЫРЕЙ -----------------
//     for (let i = 0; i < count; i += 1) {
//       const color = palette[i % palette.length].clone();

//       const material = new MeshPhysicalMaterial({
//         color,
//         metalness: 0.2,
//         roughness: 0.15,
//         transmission: 0.9, // стеклянный эффект
//         thickness: 1.0,
//         clearcoat: 1,
//         clearcoatRoughness: 0.1,
//         reflectivity: 0.8,
//       });

//       const mesh = new Mesh(geometry, material);

//       // базовый размер
//       const scale = minSize + Math.random() * (maxSize - minSize);
//       mesh.scale.setScalar(scale);
//       baseScales.push(scale);

//       // случайное положение по всей ширине/высоте
//       mesh.position.set(
//         bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
//         bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
//         -4 + Math.random() * 8 // небольшой разброс по глубине
//       );

//       // начальная скорость
//       const velocity = new Vector3(
//         (Math.random() - 0.5) * 0.4,
//         (Math.random() - 0.5) * 0.4,
//         (Math.random() - 0.5) * 0.2
//       );

//       velocities.push(velocity);
//       floatOffsets.push(Math.random() * Math.PI * 2);

//       spheres.push(mesh);
//       scene.add(mesh);
//     }

//     // ----------------- РЕАКЦИЯ НА КУРСОР -----------------
//     const raycaster = new Raycaster();
//     const pointerNdc = new Vector2();
//     const pointerWorld = new Vector3();
//     const plane = new Plane(new Vector3(0, 0, 1), 0); // плоскость z=0
//     const hasPointer = { value: false };

//     function updatePointer(event: PointerEvent) {
//       if (!followCursor || !canvas) return;

//       const rect = canvas.getBoundingClientRect();
//       pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//       raycaster.setFromCamera(pointerNdc, camera);
//       raycaster.ray.intersectPlane(plane, pointerWorld);
//       hasPointer.value = true;
//     }

//     function clearPointer() {
//       hasPointer.value = false;
//     }

//     if (followCursor) {
//       canvas.addEventListener("pointermove", updatePointer);
//       canvas.addEventListener("pointerleave", clearPointer);
//       canvas.addEventListener("pointerdown", updatePointer);
//       canvas.addEventListener("pointerup", clearPointer);
//     }

//     // ----------------- РЕСАЙЗ -----------------
//     const resize = () => {
//       const parent = canvas.parentElement;
//       if (!parent) return;

//       const { clientWidth, clientHeight } = parent;

//       const width = clientWidth || window.innerWidth;
//       const height = clientHeight || window.innerHeight;

//       const aspect = width / height;
//       camera.aspect = aspect;
//       camera.updateProjectionMatrix();

//       renderer.setSize(width, height, false);
//       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//       // пересчёт мировых границ из параметров камеры
//       const distance = Math.abs(camera.position.z);
//       const vFov = (camera.fov * Math.PI) / 180;
//       const worldHeight = 2 * Math.tan(vFov / 2) * distance;
//       const worldWidth = worldHeight * aspect;

//       // немного уменьшаем границы, чтобы пузыри не "липли" к краю
//       const paddingX = worldWidth * 0.05;
//       const paddingY = worldHeight * 0.1;

//       bounds.minX = -worldWidth / 2 + paddingX;
//       bounds.maxX = worldWidth / 2 - paddingX;
//       bounds.minY = -worldHeight / 2 + paddingY;
//       bounds.maxY = worldHeight / 2 - paddingY;
//     };

//     resize();
//     window.addEventListener("resize", resize);

//     // ----------------- АНИМАЦИЯ -----------------
//     let animationFrameId: number;

//     const animate = () => {
//       animationFrameId = window.requestAnimationFrame(animate);

//       const delta = Math.min(clock.getDelta(), 0.033);
//       const elapsed = clock.getElapsedTime();

//       for (let i = 0; i < spheres.length; i += 1) {
//         const mesh = spheres[i];
//         const velocity = velocities[i];

//         // псевдо-гравитация
//         velocity.y -= gravity * delta;

//         // лёгкие колебания
//         const floatPhase = elapsed * 0.8 + floatOffsets[i];
//         mesh.scale.setScalar(
//           baseScales[i] * (1 + 0.08 * Math.sin(floatPhase * 1.3))
//         );

//         // реакция на курсор
//         if (hasPointer.value) {
//           const toPointer = new Vector3()
//             .subVectors(pointerWorld, mesh.position)
//             .multiplyScalar(0.12);

//           velocity.add(toPointer);
//         }

//         // трение
//         velocity.multiplyScalar(friction);

//         // ограничение скорости
//         if (velocity.lengthSq() > maxVelocity * maxVelocity) {
//           velocity.setLength(maxVelocity);
//         }

//         // обновление позиции
//         mesh.position.addScaledVector(velocity, 60 * delta);

//         // отскоки от границ по X
//         const radius = mesh.scale.x;
//         if (mesh.position.x - radius < bounds.minX) {
//           mesh.position.x = bounds.minX + radius;
//           velocity.x = Math.abs(velocity.x);
//         } else if (mesh.position.x + radius > bounds.maxX) {
//           mesh.position.x = bounds.maxX - radius;
//           velocity.x = -Math.abs(velocity.x);
//         }

//         // отскоки от границ по Y
//         if (mesh.position.y - radius < bounds.minY) {
//           mesh.position.y = bounds.minY + radius;
//           velocity.y = Math.abs(velocity.y) * 0.9;
//         } else if (mesh.position.y + radius > bounds.maxY) {
//           mesh.position.y = bounds.maxY - radius;
//           velocity.y = -Math.abs(velocity.y) * 0.9;
//         }
//       }

//       renderer.render(scene, camera);
//     };

//     animate();

//     // ----------------- ОЧИСТКА -----------------
//     return () => {
//       window.cancelAnimationFrame(animationFrameId);
//       window.removeEventListener("resize", resize);

//       if (followCursor) {
//         canvas.removeEventListener("pointermove", updatePointer);
//         canvas.removeEventListener("pointerleave", clearPointer);
//         canvas.removeEventListener("pointerdown", updatePointer);
//         canvas.removeEventListener("pointerup", clearPointer);
//       }

//       spheres.forEach((mesh) => {
//         mesh.geometry.dispose();
//         mesh.material.dispose();
//         scene.remove(mesh);
//       });

//       renderer.dispose();
//     };
//   }, [followCursor, count, gravityProp, frictionProp, maxVelocityProp, minSize, maxSize, colors]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{
//         width: "100%",
//         height: "100%",
//         display: "block",
//         pointerEvents: "auto", // курсор нужен для эффекта
//       }}
//     />
//   );
// };

// export default Ballpit;



// // src/components/Ballpit.tsx
// import React, { useRef, useEffect } from "react";
// import {
//   Scene,
//   PerspectiveCamera,
//   WebGLRenderer,
//   Clock,
//   Vector2,
//   Vector3,
//   Plane,
//   Raycaster,
//   AmbientLight,
//   PointLight,
//   InstancedMesh,
//   MeshPhysicalMaterial,
//   SphereGeometry,
//   Object3D,
//   Color,
//   MathUtils,
// } from "three";

// /* ============================================================
//    Пропсы компонента
// ============================================================ */

// export interface BallpitProps {
//   className?: string;
//   count?: number;
//   minSize?: number;
//   maxSize?: number;
//   gravity?: number;
//   friction?: number;
//   wallBounce?: number;
//   maxVelocity?: number;
//   colors?: number[];
//   followCursor?: boolean;
//   /** Какую часть высоты экрана занимают шары (0–1). 0.45 ≈ верхние 45% */
//   verticalOffset?: number;
// }

// /* ============================================================
//    Типы для физики
// ============================================================ */

// interface BallPhysicsConfig {
//   count: number;
//   minSize: number;
//   maxSize: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
// }

// interface PhysicsState {
//   positions: Float32Array;
//   velocities: Float32Array;
//   sizes: Float32Array;
// }

// /* ============================================================
//    Движок физики
// ============================================================ */

// class PhysicsEngine {
//   config: BallPhysicsConfig;
//   state: PhysicsState;

//   constructor(config: BallPhysicsConfig) {
//     this.config = config;

//     this.state = {
//       positions: new Float32Array(config.count * 3),
//       velocities: new Float32Array(config.count * 3),
//       sizes: new Float32Array(config.count),
//     };

//     this.init();
//   }

//   private init() {
//     const { count, minSize, maxSize, maxX, maxY, maxZ } = this.config;
//     const { positions, velocities, sizes } = this.state;

//     for (let i = 0; i < count; i++) {
//       const base = i * 3;

//       positions[base] = MathUtils.randFloatSpread(maxX * 2);
//       positions[base + 1] = MathUtils.randFloatSpread(maxY * 1.2);
//       positions[base + 2] = MathUtils.randFloatSpread(maxZ * 2);

//       velocities[base] = MathUtils.randFloatSpread(0.05);
//       velocities[base + 1] = MathUtils.randFloatSpread(0.05);
//       velocities[base + 2] = MathUtils.randFloatSpread(0.05);

//       sizes[i] = MathUtils.randFloat(minSize, maxSize);
//     }
//   }

//   update(delta: number) {
//     const {
//       count,
//       gravity,
//       friction,
//       wallBounce,
//       maxVelocity,
//       maxX,
//       maxY,
//       maxZ,
//     } = this.config;

//     const { positions, velocities, sizes } = this.state;

//     for (let i = 0; i < count; i++) {
//       const base = i * 3;
//       const r = sizes[i];

//       let x = positions[base];
//       let y = positions[base + 1];
//       let z = positions[base + 2];

//       let vx = velocities[base];
//       let vy = velocities[base + 1];
//       let vz = velocities[base + 2];

//       // гравитация
//       vy -= gravity * delta * r;

//       // трение
//       vx *= friction;
//       vy *= friction;
//       vz *= friction;

//       // ограничение скорости
//       const speed = Math.hypot(vx, vy, vz);
//       if (speed > maxVelocity) {
//         const s = maxVelocity / speed;
//         vx *= s;
//         vy *= s;
//         vz *= s;
//       }

//       x += vx;
//       y += vy;
//       z += vz;

//       // левая/правая стенка
//       if (x + r > maxX) {
//         x = maxX - r;
//         vx = -vx * wallBounce;
//       } else if (x - r < -maxX) {
//         x = -maxX + r;
//         vx = -vx * wallBounce;
//       }

//       // ВЕРХНЯЯ ЗОНА — шары живут только в "короне" экрана
//       if (y + r > maxY) {
//         y = maxY - r;
//         vy = -vy * wallBounce;
//       }

//       // Низ чуть выше 0, чтобы не опускались к футеру
//       const minY = -maxY * 0.1;
//       if (y - r < minY) {
//         y = minY + r;
//         vy = -vy * wallBounce;
//       }

//       // глубина
//       if (z + r > maxZ) {
//         z = maxZ - r;
//         vz = -vz * wallBounce;
//       } else if (z - r < -maxZ) {
//         z = -maxZ + r;
//         vz = -vz * wallBounce;
//       }

//       positions[base] = x;
//       positions[base + 1] = y;
//       positions[base + 2] = z;

//       velocities[base] = vx;
//       velocities[base + 1] = vy;
//       velocities[base + 2] = vz;
//     }
//   }
// }

// /* ============================================================
//    Компонент Ballpit
// ============================================================ */

// export const Ballpit: React.FC<BallpitProps> = ({
//   className = "",
//   count = 150,
//   minSize = 0.3,
//   maxSize = 1.2,
//   gravity = 0.05,
//   friction = 0.995,
//   wallBounce = 0.95,
//   maxVelocity = 0.15,
//   colors = [0xffb7ff, 0x99c5ff, 0xe3e3ff, 0xffffff],
//   followCursor = true,
//   verticalOffset = 0.45,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const canvasEl = canvasRef.current;
//     if (!canvasEl) {
//       return;
//     }

//     // --- THREE SETUP ---
//     const scene = new Scene();
//     const renderer = new WebGLRenderer({
//       canvas: canvasEl,
//       antialias: true,
//       alpha: true,
//     });

//     renderer.setPixelRatio(window.devicePixelRatio);

//     const camera = new PerspectiveCamera(35, 1, 0.1, 200);
//     camera.position.set(0, 0, 20);

//     const clock = new Clock();

//     const geometry = new SphereGeometry(1, 32, 32);
//     const material = new MeshPhysicalMaterial({
//       roughness: 0.35,
//       metalness: 0.0,
//       clearcoat: 0.9,
//       transparent: true,
//       opacity: 0.92,
//     });

//     const instanced = new InstancedMesh(geometry, material, count);
//     scene.add(instanced);

//     const ambient = new AmbientLight(0xffffff, 1.1);
//     scene.add(ambient);

//     const pointLight = new PointLight(0xffffff, 16);
//     pointLight.position.set(0, 0, 18);
//     scene.add(pointLight);

//     const dummy = new Object3D();

//     // --- PHYSICS INIT (заполняется после resize) ---
//     const physics = new PhysicsEngine({
//       count,
//       minSize,
//       maxSize,
//       gravity,
//       friction,
//       wallBounce,
//       maxVelocity,
//       maxX: 5,
//       maxY: 3,
//       maxZ: 4,
//     });

//     // --- RESIZE: здесь canvas уже точно не null ---
//     const resize = () => {
//       const w = canvasEl.clientWidth;
//       const h = canvasEl.clientHeight || 1;

//       renderer.setSize(w, h, false);
//       camera.aspect = w / h;
//       camera.updateProjectionMatrix();

//       // вычисляем видимую ширину/высоту мира на расстоянии камеры
//       const halfHeight =
//         camera.position.z * Math.tan(MathUtils.degToRad(camera.fov / 2));
//       const maxY = halfHeight * verticalOffset;
//       const maxX = halfHeight * camera.aspect;
//       const maxZ = 4;

//       physics.config.maxX = maxX;
//       physics.config.maxY = maxY;
//       physics.config.maxZ = maxZ;
//     };

//     resize();
//     window.addEventListener("resize", resize);

//     // --- Pointer / cursor ---
//     const raycaster = new Raycaster();
//     const pointerNdc = new Vector2();
//     const plane = new Plane(new Vector3(0, 0, 1), 0);
//     const cursorWorld = new Vector3();
//     let hasPointer = false;

//     const handlePointerMove = (event: PointerEvent) => {
//       if (!followCursor) return;

//       const rect = canvasEl.getBoundingClientRect();
//       pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//       raycaster.setFromCamera(pointerNdc, camera);
//       raycaster.ray.intersectPlane(plane, cursorWorld);
//       hasPointer = true;
//     };

//     const handlePointerLeave = () => {
//       hasPointer = false;
//     };

//     if (followCursor) {
//       canvasEl.addEventListener("pointermove", handlePointerMove);
//       canvasEl.addEventListener("pointerleave", handlePointerLeave);
//     }

//     // --- ANIMATION LOOP ---
//     const colorTmp = new Color();

//     const animate = () => {
//       const delta = clock.getDelta();
//       physics.update(delta);

//       const { positions, sizes } = physics.state;

//       for (let i = 0; i < count; i++) {
//         const base = i * 3;

//         dummy.position.set(
//           positions[base],
//           positions[base + 1],
//           positions[base + 2]
//         );

//         dummy.scale.setScalar(sizes[i]);
//         dummy.updateMatrix();
//         instanced.setMatrixAt(i, dummy.matrix);

//         const t = i / count;
//         colorTmp.setHSL(0.8 - t * 0.25, 0.6, 0.7);
//         instanced.setColorAt(i, colorTmp);
//       }

//       if (hasPointer) {
//         pointLight.position.lerp(cursorWorld, 0.08);
//       }

//       instanced.instanceMatrix.needsUpdate = true;
//       instanced.instanceColor!.needsUpdate = true;

//       renderer.render(scene, camera);
//       requestAnimationFrame(animate);
//     };

//     animate();

//     // --- cleanup ---
//     return () => {
//       window.removeEventListener("resize", resize);
//       if (followCursor) {
//         canvasEl.removeEventListener("pointermove", handlePointerMove);
//         canvasEl.removeEventListener("pointerleave", handlePointerLeave);
//       }
//       instanced.geometry.dispose();
//       material.dispose();
//       renderer.dispose();
//     };
//   }, [
//     count,
//     gravity,
//     friction,
//     wallBounce,
//     maxSize,
//     minSize,
//     maxVelocity,
//     followCursor,
//     verticalOffset,
//     colors,
//   ]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// };

// export default Ballpit;




// // src/components/Ballpit.tsx
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   ACESFilmicToneMapping,
//   AmbientLight,
//   Clock,
//   Color,
//   InstancedMesh,
//   MathUtils,
//   MeshPhysicalMaterial,
//   MeshPhysicalMaterialParameters,
//   Object3D,
//   PerspectiveCamera,
//   Plane,
//   PMREMGenerator,
//   Raycaster,
//   Scene,
//   ShaderChunk, // <— добавить
//   SphereGeometry,
//   SRGBColorSpace,
//   Texture,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
//   WebGLRendererParameters,
//   PointLight,
// } from "three";

// import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// import { gsap } from "gsap";

// /* ======================================================================= */
// /*                               ТИПЫ / ВСПОМОГАШКИ                        */
// /* ======================================================================= */

// type Shader = {
//   uniforms: Record<string, { value: unknown }>;
//   fragmentShader: string;
//   vertexShader: string;
// };

// interface SizeData {
//   width: number;
//   height: number;
//   wWidth: number;
//   wHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// interface ThreeWrapperConfig {
//   canvas?: HTMLCanvasElement;
//   id?: string;
//   rendererOptions?: Partial<WebGLRendererParameters>;
//   size?: "parent" | { width: number; height: number };
// }

// interface PostprocessingLike {
//   setSize(width: number, height: number): void;
//   render(): void;
//   dispose(): void;
// }

// interface AnimationState {
//   elapsed: number;
//   delta: number;
// }

// /* ======================================================================= */
// /*                             ОБЁРТКА ВОКРУГ THREE                        */
// /* ======================================================================= */

// class ThreeWrapper {
//   private config: ThreeWrapperConfig;
//   private postprocessing?: PostprocessingLike;
//   private resizeObserver?: ResizeObserver;
//   private intersectionObserver?: IntersectionObserver;
//   private resizeTimer?: number;
//   private animationFrameId = 0;
//   private clock: Clock = new Clock();
//   private isAnimating = false;
//   private isVisible = false;

//   canvas!: HTMLCanvasElement;
//   camera!: PerspectiveCamera;
//   cameraMinAspect?: number;
//   cameraMaxAspect?: number;
//   cameraFov!: number;
//   maxPixelRatio?: number;
//   minPixelRatio?: number;
//   scene!: Scene;
//   renderer!: WebGLRenderer;

//   size: SizeData = {
//     width: 0,
//     height: 0,
//     wWidth: 0,
//     wHeight: 0,
//     ratio: 0,
//     pixelRatio: 0,
//   };

//   animationState: AnimationState = { elapsed: 0, delta: 0 };

//   render: () => void = this.innerRender.bind(this);
//   onBeforeRender: (state: AnimationState) => void = () => {};
//   onAfterRender: (state: AnimationState) => void = () => {};
//   onAfterResize: (size: SizeData) => void = () => {};
//   isDisposed = false;

//   constructor(config: ThreeWrapperConfig) {
//     this.config = { ...config };
//     this.initCamera();
//     this.initScene();
//     this.initRenderer();
//     this.resize();
//     this.initObservers();
//   }

//   private initCamera() {
//     this.camera = new PerspectiveCamera();
//     this.cameraFov = this.camera.fov;
//   }

//   private initScene() {
//     this.scene = new Scene();
//   }

//   private initRenderer() {
//     if (this.config.canvas) {
//       this.canvas = this.config.canvas;
//     } else if (this.config.id) {
//       const elem = document.getElementById(this.config.id);
//       if (elem instanceof HTMLCanvasElement) {
//         this.canvas = elem;
//       } else {
//         throw new Error("ThreeWrapper: element with given id is not a canvas");
//       }
//     } else {
//       throw new Error("ThreeWrapper: canvas or id must be provided");
//     }

//     this.canvas.style.display = "block";

//     const rendererOptions: WebGLRendererParameters = {
//       canvas: this.canvas,
//       powerPreference: "high-performance",
//       ...(this.config.rendererOptions ?? {}),
//     };

//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;
//   }

//   private initObservers() {
//     if (!(this.config.size instanceof Object)) {
//       const resizeHandler = this.onResize.bind(this);
//       window.addEventListener("resize", resizeHandler);

//       if (this.config.size === "parent" && this.canvas.parentNode) {
//         this.resizeObserver = new ResizeObserver(resizeHandler);
//         this.resizeObserver.observe(this.canvas.parentNode as Element);
//       }
//     }

//     this.intersectionObserver = new IntersectionObserver(
//       this.onIntersection.bind(this),
//       { root: null, rootMargin: "0px", threshold: 0 }
//     );
//     this.intersectionObserver.observe(this.canvas);

//     document.addEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );
//   }

//   private onResize() {
//     if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
//     this.resizeTimer = window.setTimeout(() => this.resize(), 80);
//   }

//   resize() {
//     let w: number;
//     let h: number;

//     if (this.config.size && this.config.size !== "parent") {
//       w = this.config.size.width;
//       h = this.config.size.height;
//     } else if (this.config.size === "parent" && this.canvas.parentNode) {
//       const parent = this.canvas.parentNode as HTMLElement;
//       w = parent.offsetWidth;
//       h = parent.offsetHeight;
//     } else {
//       w = window.innerWidth;
//       h = window.innerHeight;
//     }

//     this.size.width = w;
//     this.size.height = h;
//     this.size.ratio = w / h;

//     this.updateCamera();
//     this.updateRenderer();
//     this.onAfterResize(this.size);
//   }

//   private updateCamera() {
//     this.camera.aspect = this.size.width / this.size.height;

//     if (this.camera.isPerspectiveCamera && this.cameraFov) {
//       if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
//         this.adjustFov(this.cameraMinAspect);
//       } else if (
//         this.cameraMaxAspect &&
//         this.camera.aspect > this.cameraMaxAspect
//       ) {
//         this.adjustFov(this.cameraMaxAspect);
//       } else {
//         this.camera.fov = this.cameraFov;
//       }
//     }

//     this.camera.updateProjectionMatrix();
//     this.updateWorldSize();
//   }

//   private adjustFov(aspect: number) {
//     const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
//     const newTan = tanFov / (this.camera.aspect / aspect);
//     this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
//   }

//   updateWorldSize() {
//     const fovRad = (this.camera.fov * Math.PI) / 180;
//     this.size.wHeight =
//       2 * Math.tan(fovRad / 2) * this.camera.position.length();
//     this.size.wWidth = this.size.wHeight * this.camera.aspect;
//   }

//   private updateRenderer() {
//     this.renderer.setSize(this.size.width, this.size.height);
//     if (this.postprocessing) {
//       this.postprocessing.setSize(this.size.width, this.size.height);
//     }

//     let pr = window.devicePixelRatio;
//     if (this.maxPixelRatio && pr > this.maxPixelRatio) {
//       pr = this.maxPixelRatio;
//     } else if (this.minPixelRatio && pr < this.minPixelRatio) {
//       pr = this.minPixelRatio;
//     }

//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;
//   }

//   get postProcessing(): PostprocessingLike | undefined {
//     return this.postprocessing;
//   }

//   set postProcessing(value: PostprocessingLike | undefined) {
//     this.postprocessing = value;
//     if (value) {
//       this.render = value.render.bind(value);
//     } else {
//       this.render = this.innerRender.bind(this);
//     }
//   }

//   private onIntersection(entries: IntersectionObserverEntry[]) {
//     const isIntersecting = entries[0]?.isIntersecting ?? false;
//     this.isAnimating = isIntersecting;
//     if (isIntersecting) {
//       this.startAnimation();
//     } else {
//       this.stopAnimation();
//     }
//   }

//   private onVisibilityChange() {
//     if (!this.isAnimating) return;
//     if (document.hidden) {
//       this.stopAnimation();
//     } else {
//       this.startAnimation();
//     }
//   }

//   private startAnimation() {
//     if (this.isVisible) return;

//     const animateFrame = () => {
//       this.animationFrameId = window.requestAnimationFrame(animateFrame);
//       this.animationState.delta = this.clock.getDelta();
//       this.animationState.elapsed += this.animationState.delta;

//       this.onBeforeRender(this.animationState);
//       this.render();
//       this.onAfterRender(this.animationState);
//     };

//     this.isVisible = true;
//     this.clock.start();
//     animateFrame();
//   }

//   private stopAnimation() {
//     if (!this.isVisible) return;
//     window.cancelAnimationFrame(this.animationFrameId);
//     this.isVisible = false;
//     this.clock.stop();
//   }

//   private innerRender() {
//     this.renderer.render(this.scene, this.camera);
//   }

//   clear() {
//     this.scene.traverse((obj) => {
//       const anyObj = obj as {
//         isMesh?: boolean;
//         material?: unknown;
//         geometry?: { dispose: () => void };
//       };

//       if (!anyObj.isMesh || !anyObj.material || !anyObj.geometry) return;

//       const mat = anyObj.material as {
//         dispose?: () => void;
//         [key: string]: unknown;
//       };

//       Object.values(mat).forEach((val) => {
//         const maybeDisposable = val as { dispose?: () => void };
//         if (maybeDisposable && typeof maybeDisposable.dispose === "function") {
//           maybeDisposable.dispose();
//         }
//       });

//       if (typeof mat.dispose === "function") {
//         mat.dispose();
//       }

//       anyObj.geometry.dispose();
//     });

//     this.scene.clear();
//   }

//   dispose() {
//     this.stopAnimation();

//     window.removeEventListener("resize", this.onResize.bind(this));
//     this.resizeObserver?.disconnect();
//     this.intersectionObserver?.disconnect();
//     document.removeEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );

//     this.clear();
//     this.postprocessing?.dispose();
//     this.renderer.dispose();
//     this.isDisposed = true;
//   }
// }

// /* ======================================================================= */
// /*                              ФИЗИКА ШАРОВ                               */
// /* ======================================================================= */

// interface PhysicsConfig {
//   count: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   maxSize: number;
//   minSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// class PhysicsSystem {
//   config: PhysicsConfig;
//   positionData: Float32Array;
//   velocityData: Float32Array;
//   sizeData: Float32Array;
//   center: Vector3 = new Vector3();

//   constructor(config: PhysicsConfig) {
//     this.config = { ...config };
//     this.positionData = new Float32Array(3 * config.count).fill(0);
//     this.velocityData = new Float32Array(3 * config.count).fill(0);
//     this.sizeData = new Float32Array(config.count).fill(1);
//     this.center = new Vector3();

//     this.initPositions();
//     this.setSizes();
//   }

//   private initPositions() {
//     const { config, positionData } = this;

//     this.center.toArray(positionData, 0);

//     for (let i = 1; i < config.count; i += 1) {
//       const idx = 3 * i;
//       positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   setSizes() {
//     const { config, sizeData } = this;

//     sizeData[0] = config.size0;
//     for (let i = 1; i < config.count; i += 1) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     const { config, center, positionData, sizeData, velocityData } = this;

//     let startIdx = 0;

//     const tmpPos = new Vector3();
//     const tmpVel = new Vector3();
//     const diff = new Vector3();
//     const otherPos = new Vector3();
//     const otherVel = new Vector3();

//     if (config.controlSphere0) {
//       startIdx = 1;
//       tmpPos.fromArray(positionData, 0);
//       tmpPos.lerp(center, 0.12).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }

//     // обновляем позиции
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       // гравитация
//       tmpVel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
//       // трение
//       tmpVel.multiplyScalar(config.friction);
//       // ограничение скорости
//       tmpVel.clampLength(0, config.maxVelocity);

//       tmpPos.add(tmpVel);

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }

//     // столкновения и стены
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       const radius = sizeData[idx];

//       for (let j = idx + 1; j < config.count; j += 1) {
//         const otherBase = 3 * j;
//         otherPos.fromArray(positionData, otherBase);
//         otherVel.fromArray(velocityData, otherBase);

//         diff.copy(otherPos).sub(tmpPos);
//         const dist = diff.length();
//         const sumRadius = radius + sizeData[j];

//         if (dist < sumRadius && dist > 0.0001) {
//           const overlap = sumRadius - dist;
//           const correction = diff.normalize().multiplyScalar(0.5 * overlap);

//           const velMag = Math.max(tmpVel.length(), 1);
//           const otherVelMag = Math.max(otherVel.length(), 1);

//           tmpPos.sub(correction);
//           tmpVel.sub(correction.clone().multiplyScalar(velMag));

//           otherPos.add(correction);
//           otherVel.add(correction.clone().multiplyScalar(otherVelMag));

//           tmpPos.toArray(positionData, base);
//           tmpVel.toArray(velocityData, base);

//           otherPos.toArray(positionData, otherBase);
//           otherVel.toArray(velocityData, otherBase);
//         }
//       }

//       // отталкивание от шара 0
//       if (config.controlSphere0) {
//         diff.fromArray(positionData, 0).sub(tmpPos);
//         const d = diff.length();
//         const sumRadius0 = radius + sizeData[0];
//         if (d < sumRadius0 && d > 0.0001) {
//           const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
//           const velCorrection = correction
//             .clone()
//             .multiplyScalar(Math.max(tmpVel.length(), 2));
//           tmpPos.sub(correction);
//           tmpVel.sub(velCorrection);
//         }
//       }

//       // стены по X
//       if (Math.abs(tmpPos.x) + radius > config.maxX) {
//         tmpPos.x = Math.sign(tmpPos.x) * (config.maxX - radius);
//         tmpVel.x = -tmpVel.x * config.wallBounce;
//       }

//       // по Y
//       if (config.gravity === 0) {
//         if (Math.abs(tmpPos.y) + radius > config.maxY) {
//           tmpPos.y = Math.sign(tmpPos.y) * (config.maxY - radius);
//           tmpVel.y = -tmpVel.y * config.wallBounce;
//         }
//       } else if (tmpPos.y - radius < -config.maxY) {
//         tmpPos.y = -config.maxY + radius;
//         tmpVel.y = -tmpVel.y * config.wallBounce;
//       }

//       // по Z
//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(tmpPos.z) + radius > maxBoundary) {
//         tmpPos.z = Math.sign(tmpPos.z) * (config.maxZ - radius);
//         tmpVel.z = -tmpVel.z * config.wallBounce;
//       }

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }
//   }
// }

// /* ======================================================================= */
// /*                     МАТЕРИАЛ С ПОЛУПРОЗРАЧНЫМ СВЕЧЕНИЕМ                 */
// /* ======================================================================= */

// class ScatteringMaterial extends MeshPhysicalMaterial {
//   // объявляем defines, чтобы TS знал о поле у базового материала
//   declare defines: Record<string, string> | undefined;

//   uniforms: Record<string, { value: number }> = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2 },
//     thicknessScale: { value: 10 },
//   };

//   onBeforeCompile2?: (shader: Shader) => void;

//   constructor(params: MeshPhysicalMaterialParameters & { envMap: Texture }) {
//     super(params);

//     // у базового Material уже есть defines: Record<string, any> | undefined
//     this.defines = { USE_UV: "" };

//     this.onBeforeCompile = (shader: Shader) => {
//       Object.assign(shader.uniforms, this.uniforms);

//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//         ` + shader.fragmentShader;

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "void main() {",
//         `
//         void RE_Direct_Scattering(
//           const in IncidentLight directLight,
//           const in vec2 uv,
//           const in vec3 geometryPosition,
//           const in vec3 geometryNormal,
//           const in vec3 geometryViewDir,
//           const in vec3 geometryClearcoatNormal,
//           inout ReflectedLight reflectedLight
//         ) {
//           vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;

//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif

//           reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//         `
//       );

//       const lightsChunk = ShaderChunk.lights_fragment_begin.replace(
//         "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
//         `
//           RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
//           RE_Direct_Scattering( directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight );
//         `
//       );

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "#include <lights_fragment_begin>",
//         lightsChunk
//       );

//       if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
//     };
//   }
// }

// /* ======================================================================= */
// /*                           КОНФИГ БОЛЬШОГО ПИТА                          */
// /* ======================================================================= */

// interface BallpitConfig {
//   count: number;
//   colors: number[];
//   ambientColor: number;
//   ambientIntensity: number;
//   lightIntensity: number;
//   materialParams: {
//     metalness: number;
//     roughness: number;
//     clearcoat: number;
//     clearcoatRoughness: number;
//   };
//   minSize: number;
//   maxSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// const defaultBallpitConfig: BallpitConfig = {
//   count: 220,
//   // нежные неоновые цвета
//   colors: [0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xffffff],
//   ambientColor: 0xffffff,
//   ambientIntensity: 1.1,
//   lightIntensity: 220,
//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.08,
//     clearcoat: 1,
//     clearcoatRoughness: 0.08,
//   },
//   minSize: 0.36,
//   maxSize: 0.82,
//   size0: 1.4,
//   gravity: 0.5,
//   friction: 0.999,
//   wallBounce: 0.92,
//   maxVelocity: 0.8,
//   maxX: 7,
//   maxY: 4,
//   maxZ: 4,
//   controlSphere0: true,
//   followCursor: true,
// };

// const helperObject = new Object3D();

// /* ======================================================================= */
// /*                      ИНСТАНСЫ СФЕР + МАТЕРИАЛ                           */
// /* ======================================================================= */

// class SpheresMesh extends InstancedMesh {
//   config: BallpitConfig;
//   physics: PhysicsSystem;
//   ambientLight: AmbientLight | undefined;
//   light: PointLight | undefined;

//   constructor(renderer: WebGLRenderer, params: Partial<BallpitConfig> = {}) {
//     const config: BallpitConfig = {
//       ...defaultBallpitConfig,
//       ...params,
//     };

//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envRT = pmrem.fromScene(roomEnv);
//     const envTexture = envRT.texture as Texture;

//     const geometry = new SphereGeometry(1, 32, 32);
//     const material = new ScatteringMaterial({
//       envMap: envTexture,
//       ...config.materialParams,
//       transmission: 0.96,
//       opacity: 1,
//       transparent: true,
//       thickness: 1,
//       ior: 1.05,
//       attenuationColor: new Color(0xffffff),
//       attenuationDistance: 0.8,
//       reflectivity: 0.1,
//       sheen: 1,
//       sheenRoughness: 0.5,
//       sheenColor: new Color(0xffffff),
//       roughness: config.materialParams.roughness ?? 0.15,
//     });

//     material.defines ??= {};
//     material.defines.USE_UV = "";
//     material.needsUpdate = true;

//     material.onBeforeCompile2 = (shader) => {
//       shader.uniforms.thicknessDistortion.value = 0.15;
//       shader.uniforms.thicknessPower.value = 2.2;
//       shader.uniforms.thicknessAmbient.value = 0.06;
//       shader.uniforms.thicknessAttenuation.value = 0.4;
//       shader.uniforms.thicknessScale.value = 7;
//     };

//     super(geometry, material, config.count);
//     this.config = config;
//     this.physics = new PhysicsSystem(config);

//     this.#setupLights();
//     this.setColors(config.colors ?? []);
//   }

//   #setupLights() {
//     this.ambientLight = new AmbientLight(
//       this.config.ambientColor,
//       this.config.ambientIntensity
//     );
//     this.add(this.ambientLight);

//     this.light = new PointLight(
//       this.config.colors[0],
//       this.config.lightIntensity
//     );
//     this.add(this.light);
//   }

//   setColors(colors: number[]) {
//     if (Array.isArray(colors) && colors.length > 1) {
//       const colorUtils = (function (colorsArr: number[]) {
//         let baseColors: number[] = colorsArr;
//         let colorObjects: Color[] = [];
//         baseColors.forEach((col) => {
//           colorObjects.push(new Color(col));
//         });
//         return {
//           setColors: (cols: number[]) => {
//             baseColors = cols;
//             colorObjects = [];
//             baseColors.forEach((col) => {
//               colorObjects.push(new Color(col));
//             });
//           },
//           getColorAt: (ratio: number, out: Color = new Color()) => {
//             const clamped = Math.max(0, Math.min(1, ratio));
//             const scaled = clamped * (baseColors.length - 1);
//             const idx = Math.floor(scaled);
//             const start = colorObjects[idx];
//             if (idx >= baseColors.length - 1) return start.clone();
//             const alpha = scaled - idx;
//             const end = colorObjects[idx + 1];
//             out.r = start.r + alpha * (end.r - start.r);
//             out.g = start.g + alpha * (end.g - start.g);
//             out.b = start.b + alpha * (end.b - start.b);
//             return out;
//           },
//         };
//       })(colors);

//       for (let idx = 0; idx < this.count; idx++) {
//         this.setColorAt(idx, colorUtils.getColorAt(idx / this.count));
//         if (idx === 0) {
//           this.light!.color.copy(colorUtils.getColorAt(idx / this.count));
//         }
//       }
//       if (!this.instanceColor) return;
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     this.physics.update(deltaInfo);

//     for (let idx = 0; idx < this.count; idx++) {
//       helperObject.position.fromArray(this.physics.positionData, 3 * idx);

//       if (idx === 0 && this.config.followCursor === false) {
//         helperObject.scale.setScalar(0);
//       } else {
//         helperObject.scale.setScalar(this.physics.sizeData[idx]);
//       }

//       helperObject.updateMatrix();
//       this.setMatrixAt(idx, helperObject.matrix);

//       if (idx === 0) this.light!.position.copy(helperObject.position);
//     }

//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// /* ======================================================================= */
// /*                         СОЗДАНИЕ СЦЕНЫ / API                            */
// /* ======================================================================= */

// interface BallpitInstance {
//   three: ThreeWrapper;
//   spheres: SpheresMesh;
//   setCount(count: number): void;
//   togglePause(): void;
//   dispose(): void;
// }

// function createBallpit(
//   canvas: HTMLCanvasElement,
//   config: Partial<BallpitConfig> = {}
// ): BallpitInstance {
//   const three = new ThreeWrapper({
//     canvas,
//     size: "parent",
//     rendererOptions: { antialias: true, alpha: true },
//   });

//   let spheres: SpheresMesh;

//   three.renderer.toneMapping = ACESFilmicToneMapping;
//   three.camera.position.set(0, 0, 20);
//   three.camera.lookAt(0, 0, 0);
//   three.cameraMaxAspect = 1.5;

//   three.resize();

//   const initSpheres = (newConfig: BallpitConfig) => {
//     if (spheres) {
//       three.clear();
//       three.scene.remove(spheres);
//     }
//     spheres = new SpheresMesh(three.renderer, newConfig);
//     three.scene.add(spheres);
//   };

//   initSpheres({
//     ...defaultBallpitConfig,
//     ...config,
//   });

//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();
//   let isPaused = false;

//   canvas.style.touchAction = "none";
//   canvas.style.userSelect = "none";
//   (canvas.style as CSSStyleDeclaration & { webkitUserSelect: string }).webkitUserSelect =
//     "none";

//   const pointerData = createPointerData({
//     domElement: canvas,
//     onMove() {
//       raycaster.setFromCamera(pointerData.nPosition, three.camera);
//       three.camera.getWorldDirection(plane.normal);
//       raycaster.ray.intersectPlane(plane, intersectionPoint);
//       spheres.physics.center.copy(intersectionPoint);
//       spheres.config.controlSphere0 = true;
//     },
//     onLeave() {
//       spheres.config.controlSphere0 = false;
//     },
//   });

//   three.onBeforeRender = (deltaInfo) => {
//     if (!isPaused) spheres.update(deltaInfo);
//   };

//   three.onAfterResize = (size) => {
//     spheres.config.maxX = size.wWidth / 2;
//     spheres.config.maxY = size.wHeight / 2;
//   };

//   return {
//     three,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initSpheres({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       pointerData.dispose?.();
//       three.dispose();
//     },
//   };
// }

// /* ======================================================================= */
// /*                      POINTER INPUT (курсор/тач)                         */
// /* ======================================================================= */

// const pointerPosition = new Vector2();

// interface PointerData {
//   position: Vector2;
//   nPosition: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (data: PointerData) => void;
//   onMove: (data: PointerData) => void;
//   onClick: (data: PointerData) => void;
//   onLeave: (data: PointerData) => void;
//   dispose?: () => void;
// }

// const pointerMap = new Map<HTMLElement, PointerData>();
// let globalPointerActive = false;

// function createPointerData(
//   options: Partial<PointerData> & { domElement: HTMLElement }
// ): PointerData {
//   const defaultData: PointerData = {
//     position: new Vector2(),
//     nPosition: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onClick: () => {},
//     onLeave: () => {},
//     ...options,
//   };

//   if (!pointerMap.has(options.domElement)) {
//     pointerMap.set(options.domElement, defaultData);

//     if (!globalPointerActive) {
//       document.body.addEventListener("pointermove", onPointerMove as EventListener);
//       document.body.addEventListener("pointerleave", onPointerLeave as EventListener);
//       document.body.addEventListener("click", onPointerClick as EventListener);
//       document.body.addEventListener("touchstart", onTouchStart as EventListener, {
//         passive: false,
//       });
//       document.body.addEventListener("touchmove", onTouchMove as EventListener, {
//         passive: false,
//       });
//       document.body.addEventListener("touchend", onTouchEnd as EventListener, {
//         passive: false,
//       });
//       document.body.addEventListener("touchcancel", onTouchEnd as EventListener, {
//         passive: false,
//       });
//       globalPointerActive = true;
//     }
//   }

//   defaultData.dispose = () => {
//     pointerMap.delete(options.domElement);

//     if (pointerMap.size === 0) {
//       document.body.removeEventListener("pointermove", onPointerMove as EventListener);
//       document.body.removeEventListener("pointerleave", onPointerLeave as EventListener);
//       document.body.removeEventListener("click", onPointerClick as EventListener);
//       document.body.removeEventListener("touchstart", onTouchStart as EventListener);
//       document.body.removeEventListener("touchmove", onTouchMove as EventListener);
//       document.body.removeEventListener("touchend", onTouchEnd as EventListener);
//       document.body.removeEventListener("touchcancel", onTouchEnd as EventListener);
//       globalPointerActive = false;
//     }
//   };

//   return defaultData;
// }

// function onPointerMove(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   processPointerInteraction();
// }

// function processPointerInteraction() {
//   for (const [elem, data] of pointerMap) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && !data.touching) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onTouchStart(e: TouchEvent) {
//   if (e.touches.length > 0) {
//     e.preventDefault();
//     pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);

//     for (const [elem, data] of pointerMap) {
//       const rect = elem.getBoundingClientRect();
//       if (isInside(rect)) {
//         data.touching = true;
//         updatePointerData(data, rect);
//         if (!data.hover) {
//           data.hover = true;
//           data.onEnter(data);
//         }
//         data.onMove(data);
//       }
//     }
//   }
// }

// function onTouchMove(e: TouchEvent) {
//   if (e.touches.length > 0) {
//     e.preventDefault();
//     pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);

//     for (const [elem, data] of pointerMap) {
//       const rect = elem.getBoundingClientRect();
//       updatePointerData(data, rect);

//       if (isInside(rect)) {
//         if (!data.hover) {
//           data.hover = true;
//           data.touching = true;
//           data.onEnter(data);
//         }
//         data.onMove(data);
//       } else if (data.hover && data.touching) {
//         data.onMove(data);
//       }
//     }
//   }
// }

// function onTouchEnd() {
//   for (const [, data] of pointerMap) {
//     if (data.touching) {
//       data.touching = false;
//       if (data.hover) {
//         data.hover = false;
//         data.onLeave(data);
//       }
//     }
//   }
// }

// function onPointerClick(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);

//   for (const [elem, data] of pointerMap) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);

//     if (isInside(rect)) data.onClick(data);
//   }
// }

// function onPointerLeave() {
//   for (const data of pointerMap.values()) {
//     if (data.hover) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function updatePointerData(data: PointerData, rect: DOMRect) {
//   data.position.set(
//     pointerPosition.x - rect.left,
//     pointerPosition.y - rect.top
//   );
//   data.nPosition.set(
//     (data.position.x / rect.width) * 2 - 1,
//     (-data.position.y / rect.height) * 2 + 1
//   );
// }

// function isInside(rect: DOMRect) {
//   return (
//     pointerPosition.x >= rect.left &&
//     pointerPosition.x <= rect.left + rect.width &&
//     pointerPosition.y >= rect.top &&
//     pointerPosition.y <= rect.top + rect.height
//   );
// }

// /* ======================================================================= */
// /*                        РЕАКТ-КОМПОНЕНТ Ballpit                          */
// /* ======================================================================= */

// export interface BallpitProps {
//   className?: string;
//   count?: number;
//   colors?: number[];
//   ambientColor?: number;
//   ambientIntensity?: number;
//   lightIntensity?: number;
//   materialParams?: BallpitConfig["materialParams"];
//   minSize?: number;
//   maxSize?: number;
//   size0?: number;
//   gravity?: number;
//   friction?: number;
//   wallBounce?: number;
//   maxVelocity?: number;
//   maxX?: number;
//   maxY?: number;
//   maxZ?: number;
//   controlSphere0?: boolean;
//   followCursor?: boolean;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   className = "",
//   followCursor = true,
//   count = 150,
//   gravity = 0.7,
//   friction = 0.998,
//   wallBounce = 0.95,
//   ...props
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const instanceRef = useRef<BallpitInstance | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return; // защита от null

//     instanceRef.current = createBallpit(canvas, {
//       followCursor,
//       count,
//       gravity,
//       friction,
//       wallBounce,
//       ...props,
//     });

//     return () => {
//       instanceRef.current?.dispose();
//     };
//   }, [followCursor, count, gravity, friction, wallBounce, props]);

//   return (
//     <canvas
//       className={className}
//       ref={canvasRef}
//       style={{ width: "100%", height: "100%" }}
//     />
//   );
// };

// export default Ballpit;

// /* ======================================================================= */
// /* Ниже оставлены старые/альтернативные версии и черновики (закомментированы) */
// /* ======================================================================= */

// // ... (остальные закомментированные версии из файла остаются без изменений)






// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   AmbientLight,
//   Clock,
//   Color,
//   Mesh,
//   MeshPhysicalMaterial,
//   PerspectiveCamera,
//   Plane,
//   PointLight,
//   Raycaster,
//   Scene,
//   SphereGeometry,
//   SRGBColorSpace,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
// } from "three";

// export interface BallpitProps {
//   className?: string;
//   /** Реакция шариков на курсор */
//   followCursor?: boolean;
//   /** Количество шариков */
//   count?: number;
//   /** Гравитация */
//   gravity?: number;
//   /** Трение */
//   friction?: number;
//   /** Отскок от стен */
//   wallBounce?: number;
//   /** Максимальная скорость */
//   maxVelocity?: number;
//   /** Минимальный размер */
//   minSize?: number;
//   /** Максимальный размер */
//   maxSize?: number;
//   /** Цвета шаров */
//   colors?: number[];
// }

// /**
//  * Красивый фон с цветными шариками.
//  * Работает в границах родительского блока. Родителю желательно дать
//  * `position: relative` и `overflow: hidden`.
//  */
// const Ballpit: React.FC<BallpitProps> = ({
//   className = "",
//   followCursor = true,
//   count = 120,
//   gravity: gravityProp = 0.2,
//   friction: frictionProp = 0.995,
//   maxVelocity: maxVelocityProp = 2.2,
//   minSize = 0.7,
//   maxSize = 1.8,
//   colors,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // ----------------- БАЗОВАЯ СЦЕНА -----------------
//     const scene = new Scene();
//     scene.background = null;

//     const clock = new Clock();

//     const camera = new PerspectiveCamera(32, 1, 0.1, 100);
//     camera.position.set(0, 0, 20);
//     camera.lookAt(0, 0, 0);

//     const renderer = new WebGLRenderer({
//       canvas,
//       antialias: true,
//       alpha: true,
//       powerPreference: "high-performance",
//     });
//     renderer.outputColorSpace = SRGBColorSpace;

//     // Мягкое освещение
//     const ambient = new AmbientLight(0xffffff, 1.0);
//     const mainLight = new PointLight(0xffffff, 40, 100);
//     mainLight.position.set(5, 10, 15);
//     scene.add(ambient, mainLight);

//     // ----------------- ПАРАМЕТРЫ ПУЗЫРЕЙ -----------------
//     const defaultPalette = [
//       new Color("#ff7cf5"),
//       new Color("#ffd6ff"),
//       new Color("#b3f3ff"),
//       new Color("#ffeaa7"),
//       new Color("#c4ffdd"),
//     ];

//     const palette = colors
//       ? colors.map((hex) => new Color(hex))
//       : defaultPalette;

//     const spheres: Mesh<SphereGeometry, MeshPhysicalMaterial>[] = [];
//     const velocities: Vector3[] = [];
//     const baseScales: number[] = [];
//     const floatOffsets: number[] = [];

//     const geometry = new SphereGeometry(1, 32, 32);

//     // Границы мира (в мировых координатах)
//     const bounds = {
//       minX: -10,
//       maxX: 10,
//       minY: -6,
//       maxY: 6,
//     };

//     const gravity = gravityProp;
//     const friction = frictionProp;
//     const maxVelocity = maxVelocityProp;

//     // ----------------- СОЗДАНИЕ ПУЗЫРЕЙ -----------------
//     for (let i = 0; i < count; i += 1) {
//       const color = palette[i % palette.length].clone();

//       const material = new MeshPhysicalMaterial({
//         color,
//         metalness: 0.2,
//         roughness: 0.15,
//         transmission: 0.9, // стеклянный эффект
//         thickness: 1.0,
//         clearcoat: 1,
//         clearcoatRoughness: 0.1,
//         reflectivity: 0.8,
//       });

//       const mesh = new Mesh(geometry, material);

//       // базовый размер
//       const scale = minSize + Math.random() * (maxSize - minSize);
//       mesh.scale.setScalar(scale);
//       baseScales.push(scale);

//       // случайное положение по всей ширине/высоте
//       mesh.position.set(
//         bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
//         bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
//         -4 + Math.random() * 8 // небольшой разброс по глубине
//       );

//       // начальная скорость
//       const velocity = new Vector3(
//         (Math.random() - 0.5) * 0.4,
//         (Math.random() - 0.5) * 0.4,
//         (Math.random() - 0.5) * 0.2
//       );

//       velocities.push(velocity);
//       floatOffsets.push(Math.random() * Math.PI * 2);

//       spheres.push(mesh);
//       scene.add(mesh);
//     }

//     // ----------------- РЕАКЦИЯ НА КУРСОР -----------------
//     const raycaster = new Raycaster();
//     const pointerNdc = new Vector2();
//     const pointerWorld = new Vector3();
//     const plane = new Plane(new Vector3(0, 0, 1), 0); // плоскость z=0
//     const hasPointer = { value: false };

//     function updatePointer(event: PointerEvent) {
//       if (!followCursor || !canvas) return;

//       const rect = canvas.getBoundingClientRect();
//       pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//       raycaster.setFromCamera(pointerNdc, camera);
//       raycaster.ray.intersectPlane(plane, pointerWorld);
//       hasPointer.value = true;
//     }

//     function clearPointer() {
//       hasPointer.value = false;
//     }

//     if (followCursor) {
//       canvas.addEventListener("pointermove", updatePointer);
//       canvas.addEventListener("pointerleave", clearPointer);
//       canvas.addEventListener("pointerdown", updatePointer);
//       canvas.addEventListener("pointerup", clearPointer);
//     }

//     // ----------------- РЕСАЙЗ -----------------
//     const resize = () => {
//       const parent = canvas.parentElement;
//       if (!parent) return;

//       const { clientWidth, clientHeight } = parent;

//       const width = clientWidth || window.innerWidth;
//       const height = clientHeight || window.innerHeight;

//       const aspect = width / height;
//       camera.aspect = aspect;
//       camera.updateProjectionMatrix();

//       renderer.setSize(width, height, false);
//       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//       // пересчёт мировых границ из параметров камеры
//       const distance = Math.abs(camera.position.z);
//       const vFov = (camera.fov * Math.PI) / 180;
//       const worldHeight = 2 * Math.tan(vFov / 2) * distance;
//       const worldWidth = worldHeight * aspect;

//       // немного уменьшаем границы, чтобы пузыри не "липли" к краю
//       const paddingX = worldWidth * 0.05;
//       const paddingY = worldHeight * 0.1;

//       bounds.minX = -worldWidth / 2 + paddingX;
//       bounds.maxX = worldWidth / 2 - paddingX;
//       bounds.minY = -worldHeight / 2 + paddingY;
//       bounds.maxY = worldHeight / 2 - paddingY;
//     };

//     resize();
//     window.addEventListener("resize", resize);

//     // ----------------- АНИМАЦИЯ -----------------
//     let animationFrameId: number;

//     const animate = () => {
//       animationFrameId = window.requestAnimationFrame(animate);

//       const delta = Math.min(clock.getDelta(), 0.033);
//       const elapsed = clock.getElapsedTime();

//       for (let i = 0; i < spheres.length; i += 1) {
//         const mesh = spheres[i];
//         const velocity = velocities[i];

//         // псевдо-гравитация
//         velocity.y -= gravity * delta;

//         // лёгкие колебания
//         const floatPhase = elapsed * 0.8 + floatOffsets[i];
//         mesh.scale.setScalar(
//           baseScales[i] * (1 + 0.08 * Math.sin(floatPhase * 1.3))
//         );

//         // реакция на курсор
//         if (hasPointer.value) {
//           const toPointer = new Vector3()
//             .subVectors(pointerWorld, mesh.position)
//             .multiplyScalar(0.12);

//           velocity.add(toPointer);
//         }

//         // трение
//         velocity.multiplyScalar(friction);

//         // ограничение скорости
//         if (velocity.lengthSq() > maxVelocity * maxVelocity) {
//           velocity.setLength(maxVelocity);
//         }

//         // обновление позиции
//         mesh.position.addScaledVector(velocity, 60 * delta);

//         // отскоки от границ по X
//         const radius = mesh.scale.x;
//         if (mesh.position.x - radius < bounds.minX) {
//           mesh.position.x = bounds.minX + radius;
//           velocity.x = Math.abs(velocity.x);
//         } else if (mesh.position.x + radius > bounds.maxX) {
//           mesh.position.x = bounds.maxX - radius;
//           velocity.x = -Math.abs(velocity.x);
//         }

//         // отскоки от границ по Y
//         if (mesh.position.y - radius < bounds.minY) {
//           mesh.position.y = bounds.minY + radius;
//           velocity.y = Math.abs(velocity.y) * 0.9;
//         } else if (mesh.position.y + radius > bounds.maxY) {
//           mesh.position.y = bounds.maxY - radius;
//           velocity.y = -Math.abs(velocity.y) * 0.9;
//         }
//       }

//       renderer.render(scene, camera);
//     };

//     animate();

//     // ----------------- ОЧИСТКА -----------------
//     return () => {
//       window.cancelAnimationFrame(animationFrameId);
//       window.removeEventListener("resize", resize);

//       if (followCursor) {
//         canvas.removeEventListener("pointermove", updatePointer);
//         canvas.removeEventListener("pointerleave", clearPointer);
//         canvas.removeEventListener("pointerdown", updatePointer);
//         canvas.removeEventListener("pointerup", clearPointer);
//       }

//       spheres.forEach((mesh) => {
//         mesh.geometry.dispose();
//         mesh.material.dispose();
//         scene.remove(mesh);
//       });

//       renderer.dispose();
//     };
//   }, [followCursor, count, gravityProp, frictionProp, maxVelocityProp, minSize, maxSize, colors]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{
//         width: "100%",
//         height: "100%",
//         display: "block",
//         pointerEvents: "auto", // курсор нужен для эффекта
//       }}
//     />
//   );
// };

// export default Ballpit;



// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   AmbientLight,
//   Clock,
//   Color,
//   Mesh,
//   MeshPhysicalMaterial,
//   PerspectiveCamera,
//   Plane,
//   PointLight,
//   Raycaster,
//   Scene,
//   SphereGeometry,
//   SRGBColorSpace,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
// } from "three";

// export interface BallpitProps {
//   className?: string;
//   /** Реакция шариков на курсор */
//   followCursor?: boolean;
//   /** Количество шариков */
//   count?: number;
// }

// /**
//  * Красивый фон с цветными шариками.
//  * Работает в границах родительского блока. Родителю желательно дать
//  * `position: relative` и `overflow: hidden`.
//  */
// const Ballpit: React.FC<BallpitProps> = ({
//   className = "",
//   followCursor = true,
//   count = 120,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // ----------------- БАЗОВАЯ СЦЕНА -----------------
//     const scene = new Scene();
//     scene.background = null;

//     const clock = new Clock();

//     const camera = new PerspectiveCamera(32, 1, 0.1, 100);
//     camera.position.set(0, 0, 20);
//     camera.lookAt(0, 0, 0);

//     const renderer = new WebGLRenderer({
//       canvas,
//       antialias: true,
//       alpha: true,
//       powerPreference: "high-performance",
//     });
//     renderer.outputColorSpace = SRGBColorSpace;

//     // Мягкое освещение
//     const ambient = new AmbientLight(0xffffff, 1.0);
//     const mainLight = new PointLight(0xffffff, 40, 100);
//     mainLight.position.set(5, 10, 15);
//     scene.add(ambient, mainLight);

//     // ----------------- ПАРАМЕТРЫ ПУЗЫРЕЙ -----------------
//     const palette = [
//       new Color("#ff7cf5"),
//       new Color("#ffd6ff"),
//       new Color("#b3f3ff"),
//       new Color("#ffeaa7"),
//       new Color("#c4ffdd"),
//     ];

//     const spheres: Mesh<SphereGeometry, MeshPhysicalMaterial>[] = [];
//     const velocities: Vector3[] = [];
//     const baseScales: number[] = [];
//     const floatOffsets: number[] = [];

//     const geometry = new SphereGeometry(1, 32, 32);

//     // Границы мира (в мировых координатах)
//     const bounds = {
//       minX: -10,
//       maxX: 10,
//       minY: -6,
//       maxY: 6,
//     };

//     const gravity = 0.2;
//     const friction = 0.995;
//     const maxVelocity = 2.2;

//     // ----------------- СОЗДАНИЕ ПУЗЫРЕЙ -----------------
//     for (let i = 0; i < count; i += 1) {
//       const color = palette[i % palette.length].clone();

//       const material = new MeshPhysicalMaterial({
//         color,
//         metalness: 0.2,
//         roughness: 0.15,
//         transmission: 0.9, // стеклянный эффект
//         thickness: 1.0,
//         clearcoat: 1,
//         clearcoatRoughness: 0.1,
//         reflectivity: 0.8,
//       });

//       const mesh = new Mesh(geometry, material);

//       // базовый размер
//       const scale = 0.7 + Math.random() * 1.1;
//       mesh.scale.setScalar(scale);
//       baseScales.push(scale);

//       // случайное положение по всей ширине/высоте
//       mesh.position.set(
//         bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
//         bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
//         -4 + Math.random() * 8 // небольшой разброс по глубине
//       );

//       // начальная скорость
//       const velocity = new Vector3(
//         (Math.random() - 0.5) * 0.4,
//         (Math.random() - 0.5) * 0.4,
//         (Math.random() - 0.5) * 0.2
//       );

//       velocities.push(velocity);
//       floatOffsets.push(Math.random() * Math.PI * 2);

//       spheres.push(mesh);
//       scene.add(mesh);
//     }

//     // ----------------- РЕАКЦИЯ НА КУРСОР -----------------
//     const raycaster = new Raycaster();
//     const pointerNdc = new Vector2();
//     const pointerWorld = new Vector3();
//     const plane = new Plane(new Vector3(0, 0, 1), 0); // плоскость z=0
//     const hasPointer = { value: false };

//     function updatePointer(event: PointerEvent) {
//       if (!followCursor) return;

//       const rect = canvas.getBoundingClientRect();
//       pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//       raycaster.setFromCamera(pointerNdc, camera);
//       raycaster.ray.intersectPlane(plane, pointerWorld);
//       hasPointer.value = true;
//     }

//     function clearPointer() {
//       hasPointer.value = false;
//     }

//     if (followCursor) {
//       canvas.addEventListener("pointermove", updatePointer);
//       canvas.addEventListener("pointerleave", clearPointer);
//       canvas.addEventListener("pointerdown", updatePointer);
//       canvas.addEventListener("pointerup", clearPointer);
//     }

//     // ----------------- РЕСАЙЗ -----------------
//     const resize = () => {
//       const { clientWidth, clientHeight } = canvas.parentElement ?? canvas;

//       const width = clientWidth || window.innerWidth;
//       const height = clientHeight || window.innerHeight;

//       const aspect = width / height;
//       camera.aspect = aspect;
//       camera.updateProjectionMatrix();

//       renderer.setSize(width, height, false);
//       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//       // пересчёт мировых границ из параметров камеры
//       const distance = Math.abs(camera.position.z);
//       const vFov = (camera.fov * Math.PI) / 180;
//       const worldHeight = 2 * Math.tan(vFov / 2) * distance;
//       const worldWidth = worldHeight * aspect;

//       // немного уменьшаем границы, чтобы пузыри не "липли" к краю
//       const paddingX = worldWidth * 0.05;
//       const paddingY = worldHeight * 0.1;

//       bounds.minX = -worldWidth / 2 + paddingX;
//       bounds.maxX = worldWidth / 2 - paddingX;
//       bounds.minY = -worldHeight / 2 + paddingY;
//       bounds.maxY = worldHeight / 2 - paddingY;
//     };

//     resize();
//     window.addEventListener("resize", resize);

//     // ----------------- АНИМАЦИЯ -----------------
//     let animationFrameId: number;

//     const animate = () => {
//       animationFrameId = window.requestAnimationFrame(animate);

//       const delta = Math.min(clock.getDelta(), 0.033);
//       const elapsed = clock.getElapsedTime();

//       for (let i = 0; i < spheres.length; i += 1) {
//         const mesh = spheres[i];
//         const velocity = velocities[i];

//         // псевдо-гравитация
//         velocity.y -= gravity * delta;

//         // лёгкие колебания
//         const floatPhase = elapsed * 0.8 + floatOffsets[i];
//         mesh.scale.setScalar(
//           baseScales[i] * (1 + 0.08 * Math.sin(floatPhase * 1.3))
//         );

//         // реакция на курсор
//         if (hasPointer.value) {
//           const toPointer = new Vector3()
//             .subVectors(pointerWorld, mesh.position)
//             .multiplyScalar(0.12);

//           velocity.add(toPointer);
//         }

//         // трение
//         velocity.multiplyScalar(friction);

//         // ограничение скорости
//         if (velocity.lengthSq() > maxVelocity * maxVelocity) {
//           velocity.setLength(maxVelocity);
//         }

//         // обновление позиции
//         mesh.position.addScaledVector(velocity, 60 * delta);

//         // отскоки от границ по X
//         const radius = mesh.scale.x;
//         if (mesh.position.x - radius < bounds.minX) {
//           mesh.position.x = bounds.minX + radius;
//           velocity.x = Math.abs(velocity.x);
//         } else if (mesh.position.x + radius > bounds.maxX) {
//           mesh.position.x = bounds.maxX - radius;
//           velocity.x = -Math.abs(velocity.x);
//         }

//         // отскоки от границ по Y
//         if (mesh.position.y - radius < bounds.minY) {
//           mesh.position.y = bounds.minY + radius;
//           velocity.y = Math.abs(velocity.y) * 0.9;
//         } else if (mesh.position.y + radius > bounds.maxY) {
//           mesh.position.y = bounds.maxY - radius;
//           velocity.y = -Math.abs(velocity.y) * 0.9;
//         }
//       }

//       renderer.render(scene, camera);
//     };

//     animate();

//     // ----------------- ОЧИСТКА -----------------
//     return () => {
//       window.cancelAnimationFrame(animationFrameId);
//       window.removeEventListener("resize", resize);

//       if (followCursor) {
//         canvas.removeEventListener("pointermove", updatePointer);
//         canvas.removeEventListener("pointerleave", clearPointer);
//         canvas.removeEventListener("pointerdown", updatePointer);
//         canvas.removeEventListener("pointerup", clearPointer);
//       }

//       spheres.forEach((mesh) => {
//         mesh.geometry.dispose();
//         mesh.material.dispose();
//         scene.remove(mesh);
//       });

//       renderer.dispose();
//     };
//   }, [followCursor, count]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{
//         width: "100%",
//         height: "100%",
//         display: "block",
//         pointerEvents: "auto", // курсор нужен для эффекта
//       }}
//     />
//   );
// };

// export default Ballpit;



//----------работает, но залазит на футер------
// // src/components/Ballpit.tsx
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   ACESFilmicToneMapping,
//   AmbientLight,
//   Clock,
//   Color,
//   InstancedMesh,
//   MathUtils,
//   MeshPhysicalMaterial,
//   MeshPhysicalMaterialParameters,
//   Object3D,
//   PerspectiveCamera,
//   Plane,
//   PMREMGenerator,
//   PointLight,
//   Raycaster,
//   Scene,
//   ShaderChunk,
//   SphereGeometry,
//   SRGBColorSpace,
//   Texture,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
//   WebGLRendererParameters,
// } from "three";
// import { RoomEnvironment } from "three/examples/jsm/Addons.js";
// import { gsap } from "gsap";

// /* ======================================================================= */
// /*                               ТИПЫ / ВСПОМОГАШКИ                        */
// /* ======================================================================= */

// interface Shader {
//   uniforms: Record<string, { value: unknown }>;
//   fragmentShader: string;
//   vertexShader: string;
// }

// interface SizeData {
//   width: number;
//   height: number;
//   wWidth: number;
//   wHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// interface ThreeWrapperConfig {
//   canvas?: HTMLCanvasElement;
//   id?: string;
//   rendererOptions?: Partial<WebGLRendererParameters>;
//   size?: "parent" | { width: number; height: number };
// }

// interface PostprocessingLike {
//   setSize(width: number, height: number): void;
//   render(): void;
//   dispose(): void;
// }

// interface AnimationState {
//   elapsed: number;
//   delta: number;
// }

// /* ======================================================================= */
// /*                             ОБЁРТКА ВОКРУГ THREE                        */
// /* ======================================================================= */

// class ThreeWrapper {
//   private config: ThreeWrapperConfig;
//   private postprocessing?: PostprocessingLike;
//   private resizeObserver?: ResizeObserver;
//   private intersectionObserver?: IntersectionObserver;
//   private resizeTimer?: number;
//   private animationFrameId = 0;
//   private clock: Clock = new Clock();
//   private isAnimating = false;
//   private isVisible = false;

//   canvas!: HTMLCanvasElement;
//   camera!: PerspectiveCamera;
//   cameraMinAspect?: number;
//   cameraMaxAspect?: number;
//   cameraFov!: number;
//   maxPixelRatio?: number;
//   minPixelRatio?: number;
//   scene!: Scene;
//   renderer!: WebGLRenderer;

//   size: SizeData = {
//     width: 0,
//     height: 0,
//     wWidth: 0,
//     wHeight: 0,
//     ratio: 0,
//     pixelRatio: 0,
//   };

//   animationState: AnimationState = { elapsed: 0, delta: 0 };

//   render: () => void = this.innerRender.bind(this);
//   onBeforeRender: (state: AnimationState) => void = () => {};
//   onAfterRender: (state: AnimationState) => void = () => {};
//   onAfterResize: (size: SizeData) => void = () => {};
//   isDisposed = false;

//   constructor(config: ThreeWrapperConfig) {
//     this.config = { ...config };
//     this.initCamera();
//     this.initScene();
//     this.initRenderer();
//     this.resize();
//     this.initObservers();
//   }

//   private initCamera() {
//     this.camera = new PerspectiveCamera();
//     this.cameraFov = this.camera.fov;
//   }

//   private initScene() {
//     this.scene = new Scene();
//   }

//   private initRenderer() {
//     if (this.config.canvas) {
//       this.canvas = this.config.canvas;
//     } else if (this.config.id) {
//       const elem = document.getElementById(this.config.id);
//       if (elem instanceof HTMLCanvasElement) {
//         this.canvas = elem;
//       } else {
//         throw new Error("ThreeWrapper: element with given id is not a canvas");
//       }
//     } else {
//       throw new Error("ThreeWrapper: canvas or id must be provided");
//     }

//     this.canvas.style.display = "block";

//     const rendererOptions: WebGLRendererParameters = {
//       canvas: this.canvas,
//       powerPreference: "high-performance",
//       ...(this.config.rendererOptions ?? {}),
//     };

//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;
//   }

//   private initObservers() {
//     if (!(this.config.size instanceof Object)) {
//       const resizeHandler = this.onResize.bind(this);
//       window.addEventListener("resize", resizeHandler);

//       if (this.config.size === "parent" && this.canvas.parentNode) {
//         this.resizeObserver = new ResizeObserver(resizeHandler);
//         this.resizeObserver.observe(this.canvas.parentNode as Element);
//       }
//     }

//     this.intersectionObserver = new IntersectionObserver(
//       this.onIntersection.bind(this),
//       { root: null, rootMargin: "0px", threshold: 0 }
//     );
//     this.intersectionObserver.observe(this.canvas);

//     document.addEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );
//   }

//   private onResize() {
//     if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
//     this.resizeTimer = window.setTimeout(() => this.resize(), 80);
//   }

//   resize() {
//     let w: number;
//     let h: number;

//     if (this.config.size && this.config.size !== "parent") {
//       w = this.config.size.width;
//       h = this.config.size.height;
//     } else if (this.config.size === "parent" && this.canvas.parentNode) {
//       const parent = this.canvas.parentNode as HTMLElement;
//       w = parent.offsetWidth;
//       h = parent.offsetHeight;
//     } else {
//       w = window.innerWidth;
//       h = window.innerHeight;
//     }

//     this.size.width = w;
//     this.size.height = h;
//     this.size.ratio = w / h;

//     this.updateCamera();
//     this.updateRenderer();
//     this.onAfterResize(this.size);
//   }

//   private updateCamera() {
//     this.camera.aspect = this.size.width / this.size.height;

//     if (this.camera.isPerspectiveCamera && this.cameraFov) {
//       if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
//         this.adjustFov(this.cameraMinAspect);
//       } else if (
//         this.cameraMaxAspect &&
//         this.camera.aspect > this.cameraMaxAspect
//       ) {
//         this.adjustFov(this.cameraMaxAspect);
//       } else {
//         this.camera.fov = this.cameraFov;
//       }
//     }

//     this.camera.updateProjectionMatrix();
//     this.updateWorldSize();
//   }

//   private adjustFov(aspect: number) {
//     const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
//     const newTan = tanFov / (this.camera.aspect / aspect);
//     this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
//   }

//   updateWorldSize() {
//     const fovRad = (this.camera.fov * Math.PI) / 180;
//     this.size.wHeight =
//       2 * Math.tan(fovRad / 2) * this.camera.position.length();
//     this.size.wWidth = this.size.wHeight * this.camera.aspect;
//   }

//   private updateRenderer() {
//     this.renderer.setSize(this.size.width, this.size.height);
//     if (this.postprocessing) {
//       this.postprocessing.setSize(this.size.width, this.size.height);
//     }

//     let pr = window.devicePixelRatio;
//     if (this.maxPixelRatio && pr > this.maxPixelRatio) {
//       pr = this.maxPixelRatio;
//     } else if (this.minPixelRatio && pr < this.minPixelRatio) {
//       pr = this.minPixelRatio;
//     }

//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;
//   }

//   get postProcessing(): PostprocessingLike | undefined {
//     return this.postprocessing;
//   }

//   set postProcessing(value: PostprocessingLike | undefined) {
//     this.postprocessing = value;
//     if (value) {
//       this.render = value.render.bind(value);
//     } else {
//       this.render = this.innerRender.bind(this);
//     }
//   }

//   private onIntersection(entries: IntersectionObserverEntry[]) {
//     const isIntersecting = entries[0]?.isIntersecting ?? false;
//     this.isAnimating = isIntersecting;
//     if (isIntersecting) {
//       this.startAnimation();
//     } else {
//       this.stopAnimation();
//     }
//   }

//   private onVisibilityChange() {
//     if (!this.isAnimating) return;
//     if (document.hidden) {
//       this.stopAnimation();
//     } else {
//       this.startAnimation();
//     }
//   }

//   private startAnimation() {
//     if (this.isVisible) return;

//     const animateFrame = () => {
//       this.animationFrameId = window.requestAnimationFrame(animateFrame);
//       this.animationState.delta = this.clock.getDelta();
//       this.animationState.elapsed += this.animationState.delta;

//       this.onBeforeRender(this.animationState);
//       this.render();
//       this.onAfterRender(this.animationState);
//     };

//     this.isVisible = true;
//     this.clock.start();
//     animateFrame();
//   }

//   private stopAnimation() {
//     if (!this.isVisible) return;
//     window.cancelAnimationFrame(this.animationFrameId);
//     this.isVisible = false;
//     this.clock.stop();
//   }

//   private innerRender() {
//     this.renderer.render(this.scene, this.camera);
//   }

//   clear() {
//     this.scene.traverse((obj) => {
//       const anyObj = obj as {
//         isMesh?: boolean;
//         material?: unknown;
//         geometry?: { dispose: () => void };
//       };

//       if (!anyObj.isMesh || !anyObj.material || !anyObj.geometry) return;

//       const mat = anyObj.material as {
//         dispose?: () => void;
//         [key: string]: unknown;
//       };

//       Object.values(mat).forEach((val) => {
//         const maybeDisposable = val as { dispose?: () => void };
//         if (maybeDisposable && typeof maybeDisposable.dispose === "function") {
//           maybeDisposable.dispose();
//         }
//       });

//       if (typeof mat.dispose === "function") {
//         mat.dispose();
//       }

//       anyObj.geometry.dispose();
//     });

//     this.scene.clear();
//   }

//   updateSize(width: number, height: number) {
//     if (this.config.size && typeof this.config.size === 'object') {
//       this.config.size.width = width;
//       this.config.size.height = height;
//     }
//     this.resize();
//   }

//   dispose() {
//     this.stopAnimation();

//     window.removeEventListener("resize", this.onResize.bind(this));
//     this.resizeObserver?.disconnect();
//     this.intersectionObserver?.disconnect();
//     document.removeEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );

//     this.clear();
//     this.postprocessing?.dispose();
//     this.renderer.dispose();
//     this.isDisposed = true;
//   }
// }

// /* ======================================================================= */
// /*                              ФИЗИКА ШАРОВ                               */
// /* ======================================================================= */

// interface PhysicsConfig {
//   count: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   maxSize: number;
//   minSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// class PhysicsSystem {
//   config: PhysicsConfig;
//   positionData: Float32Array;
//   velocityData: Float32Array;
//   sizeData: Float32Array;
//   center: Vector3 = new Vector3();

//   constructor(config: PhysicsConfig) {
//     this.config = { ...config };
//     this.positionData = new Float32Array(3 * config.count).fill(0);
//     this.velocityData = new Float32Array(3 * config.count).fill(0);
//     this.sizeData = new Float32Array(config.count).fill(1);
//     this.center = new Vector3();

//     this.initPositions();
//     this.setSizes();
//   }

//   private initPositions() {
//     const { config, positionData } = this;

//     this.center.toArray(positionData, 0);

//     for (let i = 1; i < config.count; i += 1) {
//       const idx = 3 * i;
//       positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   // НОВЫЙ ПУБЛИЧНЫЙ МЕТОД для пересоздания позиций
//   reinitPositions() {
//     this.initPositions();
//   }

//   setSizes() {
//     const { config, sizeData } = this;

//     sizeData[0] = config.size0;
//     for (let i = 1; i < config.count; i += 1) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     const { config, center, positionData, sizeData, velocityData } = this;

//     let startIdx = 0;

//     const tmpPos = new Vector3();
//     const tmpVel = new Vector3();
//     const diff = new Vector3();
//     const otherPos = new Vector3();
//     const otherVel = new Vector3();

//     if (config.controlSphere0) {
//       startIdx = 1;
//       tmpPos.fromArray(positionData, 0);
//       tmpPos.lerp(center, 0.12).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }

//     // обновляем позиции
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       // гравитация
//       tmpVel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
//       // трение
//       tmpVel.multiplyScalar(config.friction);
//       // ограничение скорости
//       tmpVel.clampLength(0, config.maxVelocity);

//       tmpPos.add(tmpVel);

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }

//     // столкновения и стены
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       const radius = sizeData[idx];

//       for (let j = idx + 1; j < config.count; j += 1) {
//         const otherBase = 3 * j;
//         otherPos.fromArray(positionData, otherBase);
//         otherVel.fromArray(velocityData, otherBase);

//         diff.copy(otherPos).sub(tmpPos);
//         const dist = diff.length();
//         const sumRadius = radius + sizeData[j];

//         if (dist < sumRadius && dist > 0.0001) {
//           const overlap = sumRadius - dist;
//           const correction = diff.normalize().multiplyScalar(0.5 * overlap);

//           const velMag = Math.max(tmpVel.length(), 1);
//           const otherVelMag = Math.max(otherVel.length(), 1);

//           tmpPos.sub(correction);
//           tmpVel.sub(correction.clone().multiplyScalar(velMag));

//           otherPos.add(correction);
//           otherVel.add(correction.clone().multiplyScalar(otherVelMag));

//           tmpPos.toArray(positionData, base);
//           tmpVel.toArray(velocityData, base);

//           otherPos.toArray(positionData, otherBase);
//           otherVel.toArray(velocityData, otherBase);
//         }
//       }

//       // отталкивание от шара 0
//       if (config.controlSphere0) {
//         diff.fromArray(positionData, 0).sub(tmpPos);
//         const d = diff.length();
//         const sumRadius0 = radius + sizeData[0];
//         if (d < sumRadius0 && d > 0.0001) {
//           const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
//           const velCorrection = correction
//             .clone()
//             .multiplyScalar(Math.max(tmpVel.length(), 2));
//           tmpPos.sub(correction);
//           tmpVel.sub(velCorrection);
//         }
//       }

//       // стены по X
//       if (Math.abs(tmpPos.x) + radius > config.maxX) {
//         tmpPos.x = Math.sign(tmpPos.x) * (config.maxX - radius);
//         tmpVel.x = -tmpVel.x * config.wallBounce;
//       }

//       // по Y
//       if (config.gravity === 0) {
//         if (Math.abs(tmpPos.y) + radius > config.maxY) {
//           tmpPos.y = Math.sign(tmpPos.y) * (config.maxY - radius);
//           tmpVel.y = -tmpVel.y * config.wallBounce;
//         }
//       } else if (tmpPos.y - radius < -config.maxY) {
//         tmpPos.y = -config.maxY + radius;
//         tmpVel.y = -tmpVel.y * config.wallBounce;
//       }

//       // по Z
//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(tmpPos.z) + radius > maxBoundary) {
//         tmpPos.z = Math.sign(tmpPos.z) * (config.maxZ - radius);
//         tmpVel.z = -tmpVel.z * config.wallBounce;
//       }

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }
//   }
// }

// /* ======================================================================= */
// /*                     МАТЕРИАЛ С ПОЛУПРОЗРАЧНЫМ СВЕЧЕНИЕМ                 */
// /* ======================================================================= */

// class ScatteringMaterial extends MeshPhysicalMaterial {
//   uniforms: Record<string, { value: number }> = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2 },
//     thicknessScale: { value: 10 },
//   };

//   // ИСПРАВЛЕНИЕ: явно объявляем свойство defines
//   defines?: Record<string, string>;
//   onBeforeCompile2?: (shader: Shader) => void;

//   constructor(params: MeshPhysicalMaterialParameters & { envMap: Texture }) {
//     super(params);

//     this.defines = this.defines || {};
//     this.defines.USE_UV = "";

//     this.onBeforeCompile = (shaderData: unknown) => {
//       const shader = shaderData as Shader;
      
//       Object.assign(shader.uniforms, this.uniforms);

//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//         ` + shader.fragmentShader;

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "void main() {",
//         `
//         void RE_Direct_Scattering(
//           const in IncidentLight directLight,
//           const in vec2 uv,
//           const in vec3 geometryPosition,
//           const in vec3 geometryNormal,
//           const in vec3 geometryViewDir,
//           const in vec3 geometryClearcoatNormal,
//           inout ReflectedLight reflectedLight
//         ) {
//           vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;

//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif

//           reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//         `
//       );

//       const lightsChunkOriginal = ShaderChunk.lights_fragment_begin as string;
//       const lightsChunk = lightsChunkOriginal.replace(
//         "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
//         `
//           RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
//           RE_Direct_Scattering( directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight );
//         `
//       );

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "#include <lights_fragment_begin>",
//         lightsChunk
//       );

//       if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
//     };
//   }
// }

// /* ======================================================================= */
// /*                           КОНФИГ БОЛЬШОГО ПИТА                          */
// /* ======================================================================= */

// interface BallpitConfig {
//   count: number;
//   colors: number[];
//   ambientColor: number;
//   ambientIntensity: number;
//   lightIntensity: number;
//   materialParams: {
//     metalness: number;
//     roughness: number;
//     clearcoat: number;
//     clearcoatRoughness: number;
//   };
//   minSize: number;
//   maxSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// const defaultBallpitConfig: BallpitConfig = {
//   count: 220,
//   colors: [0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xffffff],
//   ambientColor: 0xffffff,
//   ambientIntensity: 1.1,
//   lightIntensity: 220,
//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.35,
//     clearcoat: 1,
//     clearcoatRoughness: 0.18,
//   },
//   minSize: 0.6,
//   maxSize: 1.1,
//   size0: 1.1,
//   gravity: 0.45,
//   friction: 0.995,
//   wallBounce: 0.96,
//   maxVelocity: 0.17,
//   maxX: 5,
//   maxY: 4,
//   maxZ: 2.3,
//   controlSphere0: false,
//   followCursor: true,
// };

// const tempObject = new Object3D();

// /* ======================================================================= */
// /*                            Pointer helper                                */
// /* ======================================================================= */

// interface PointerData {
//   position: Vector2;
//   nPosition: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (data: PointerData) => void;
//   onMove: (data: PointerData) => void;
//   onClick: (data: PointerData) => void;
//   onLeave: (data: PointerData) => void;
//   dispose: () => void;
// }

// const pointerPosition = new Vector2();
// const pointerMap = new Map<HTMLElement, PointerData>();
// let globalPointerActive = false;

// function isInside(rect: DOMRect): boolean {
//   return (
//     pointerPosition.x >= rect.left &&
//     pointerPosition.x <= rect.left + rect.width &&
//     pointerPosition.y >= rect.top &&
//     pointerPosition.y <= rect.top + rect.height
//   );
// }

// function updatePointerData(data: PointerData, rect: DOMRect) {
//   data.position.set(
//     pointerPosition.x - rect.left,
//     pointerPosition.y - rect.top
//   );
//   data.nPosition.set(
//     (data.position.x / rect.width) * 2 - 1,
//     (-data.position.y / rect.height) * 2 + 1
//   );
// }

// function handlePointerMove() {
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && !data.touching) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerMove(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   handlePointerMove();
// }

// function onPointerLeave() {
//   for (const data of pointerMap.values()) {
//     if (data.hover) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerClick(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) data.onClick(data);
//   }
// }

// function onTouchStart(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       data.touching = true;
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     }
//   }
// }

// function onTouchMove(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) {
//       if (!data.hover) {
//         data.hover = true;
//         data.touching = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && data.touching) {
//       data.onMove(data);
//     }
//   }
// }

// function onTouchEnd() {
//   for (const data of pointerMap.values()) {
//     if (data.touching) {
//       data.touching = false;
//       if (data.hover) {
//         data.hover = false;
//         data.onLeave(data);
//       }
//     }
//   }
// }

// function ensureGlobalPointerListeners() {
//   if (globalPointerActive) return;
//   document.body.addEventListener("pointermove", onPointerMove as EventListener);
//   document.body.addEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.addEventListener("click", onPointerClick as EventListener);

//   document.body.addEventListener("touchstart", onTouchStart as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchmove", onTouchMove as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchend", onTouchEnd as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchcancel", onTouchEnd as EventListener, {
//     passive: false,
//   });

//   globalPointerActive = true;
// }

// function cleanupGlobalPointerListeners() {
//   if (!globalPointerActive) return;

//   document.body.removeEventListener(
//     "pointermove",
//     onPointerMove as EventListener
//   );
//   document.body.removeEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.removeEventListener("click", onPointerClick as EventListener);

//   document.body.removeEventListener(
//     "touchstart",
//     onTouchStart as EventListener
//   );
//   document.body.removeEventListener("touchmove", onTouchMove as EventListener);
//   document.body.removeEventListener("touchend", onTouchEnd as EventListener);
//   document.body.removeEventListener(
//     "touchcancel",
//     onTouchEnd as EventListener
//   );

//   globalPointerActive = false;
// }

// function createPointerData(domElement: HTMLElement): PointerData {
//   const data: PointerData = {
//     position: new Vector2(),
//     nPosition: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onClick: () => {},
//     onLeave: () => {},
//     dispose: () => {},
//   };

//   pointerMap.set(domElement, data);
//   ensureGlobalPointerListeners();

//   data.dispose = () => {
//     pointerMap.delete(domElement);
//     if (pointerMap.size === 0) {
//       cleanupGlobalPointerListeners();
//     }
//   };

//   return data;
// }

// /* ======================================================================= */
// /*                             INSTANCED ШАРЫ                               */
// /* ======================================================================= */

// class Spheres extends InstancedMesh {
//   config: BallpitConfig;
//   physics: PhysicsSystem;
//   ambientLight: AmbientLight;
//   light: PointLight;

//   constructor(renderer: WebGLRenderer, params: Partial<BallpitConfig> = {}) {
//     const config: BallpitConfig = {
//       ...defaultBallpitConfig,
//       ...params,
//     };

//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envRT = pmrem.fromScene(roomEnv);
//     const envTexture = envRT.texture as Texture;

//     const geometry = new SphereGeometry(1, 32, 32);
//     const material = new ScatteringMaterial({
//       envMap: envTexture,
//       ...config.materialParams,
//       transmission: 0.96,
//       ior: 1.3,
//       thickness: 1.2,
//     });

//     material.envMapRotation.x = -Math.PI / 2;

//     super(geometry, material, config.count);

//     this.config = config;
//     this.physics = new PhysicsSystem(config);
//     this.ambientLight = new AmbientLight(
//       this.config.ambientColor,
//       this.config.ambientIntensity
//     );
//     this.light = new PointLight(
//       this.config.colors[0],
//       this.config.lightIntensity
//     );

//     this.add(this.ambientLight);
//     this.add(this.light);

//     this.setColors(config.colors);
//   }

//   setColors(colors: readonly number[]) {
//     const colorObjects: Color[] = colors.map((c) => new Color(c));

//     const getColorAt = (ratio: number, out: Color): Color => {
//       const clamped = Math.min(1, Math.max(0, ratio));
//       const scaled = clamped * (colorObjects.length - 1);
//       const idx = Math.floor(scaled);

//       const start = colorObjects[idx];
//       if (idx >= colorObjects.length - 1) {
//         return out.copy(start);
//       }

//       const alpha = scaled - idx;
//       const end = colorObjects[idx + 1];

//       out.r = start.r + alpha * (end.r - start.r);
//       out.g = start.g + alpha * (end.g - start.g);
//       out.b = start.b + alpha * (end.b - start.b);

//       return out;
//     };

//     const tmpColor = new Color();

//     for (let i = 0; i < this.count; i += 1) {
//       this.setColorAt(i, getColorAt(i / this.count, tmpColor));
//       if (i === 0) {
//         this.light.color.copy(tmpColor);
//       }
//     }

//     if (this.instanceColor) {
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     this.physics.update(deltaInfo);

//     for (let idx = 0; idx < this.count; idx += 1) {
//       tempObject.position.fromArray(this.physics.positionData, 3 * idx);

//       if (idx === 0 && !this.config.followCursor) {
//         tempObject.scale.setScalar(0);
//       } else {
//         tempObject.scale.setScalar(this.physics.sizeData[idx]);
//       }

//       tempObject.updateMatrix();
//       this.setMatrixAt(idx, tempObject.matrix);

//       if (idx === 0) {
//         this.light.position.copy(tempObject.position);
//       }
//     }

//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// /* ======================================================================= */
// /*                      ФАБРИКА: СОЗДАНИЕ ПОЛЯ СФЕР                         */
// /* ======================================================================= */

// interface BallpitInstance {
//   three: ThreeWrapper;
//   readonly spheres: Spheres;
//   setCount(count: number): void;
//   togglePause(): void;
//   dispose(): void;
// }

// function createBallpit(
//   canvas: HTMLCanvasElement,
//   config: Partial<BallpitConfig> = {}
// ): BallpitInstance {
//   const threeInstance = new ThreeWrapper({
//     canvas,
//     size: { width: window.innerWidth, height: window.innerHeight },
//     rendererOptions: { antialias: true, alpha: true },
//   });

//   threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
//   threeInstance.camera.position.set(0, 0, 18);
//   threeInstance.camera.lookAt(0, 0, 0);
//   // УБРАНО: cameraMaxAspect = 1.5 ограничивал видимую область!
//   // threeInstance.cameraMaxAspect = 1.5;
//   threeInstance.resize();

//   let spheres: Spheres = new Spheres(threeInstance.renderer, config);
//   threeInstance.scene.add(spheres);

//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();
//   let isPaused = false;

//   const pointerData = createPointerData(canvas);

//   // ИСПРАВЛЕНИЕ: Активируем реакцию на курсор только если followCursor === true
//   if (config.followCursor !== false) {
//     pointerData.onMove = (data) => {
//       raycaster.setFromCamera(data.nPosition, threeInstance.camera);
//       threeInstance.camera.getWorldDirection(plane.normal);
//       raycaster.ray.intersectPlane(plane, intersectionPoint);

//       gsap.to(spheres.physics.center, {
//         x: intersectionPoint.x,
//         y: intersectionPoint.y,
//         z: intersectionPoint.z,
//         duration: 0.35,
//         ease: "power2.out",
//       });

//       spheres.config.controlSphere0 = true;
//     };

//     pointerData.onLeave = () => {
//       spheres.config.controlSphere0 = false;
//     };
//   }

//   canvas.style.touchAction = "none";
//   canvas.style.userSelect = "none";
//   (canvas.style as { webkitUserSelect?: string }).webkitUserSelect = "none";

//   threeInstance.onBeforeRender = (deltaInfo) => {
//     if (!isPaused) spheres.update(deltaInfo);
//   };

//   threeInstance.onAfterResize = (size) => {
//     const oldMaxX = spheres.config.maxX;
//     const oldMaxY = spheres.config.maxY;
//     const newMaxX = size.wWidth / 2;
//     const newMaxY = size.wHeight / 2;
    
//     spheres.config.maxX = newMaxX;
//     spheres.config.maxY = newMaxY;
    
//     // Если размеры значительно изменились, пересоздаем позиции
//     const xChange = Math.abs(newMaxX - oldMaxX) / oldMaxX;
//     const yChange = Math.abs(newMaxY - oldMaxY) / oldMaxY;
//     if (xChange > 0.2 || yChange > 0.2) {
//       spheres.physics.reinitPositions();
//     }
//   };

//   // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Устанавливаем правильные границы сразу!
//   spheres.config.maxX = threeInstance.size.wWidth / 2;
//   spheres.config.maxY = threeInstance.size.wHeight / 2;
  
//   // ПЕРЕСОЗДАЕМ позиции шаров с правильными границами!
//   spheres.physics.reinitPositions();

//   // ДОБАВЛЯЕМ обработчик resize для window
//   const handleWindowResize = () => {
//     threeInstance.updateSize(window.innerWidth, window.innerHeight);
//   };
//   window.addEventListener('resize', handleWindowResize);

//   const initSpheres = (newConfig: BallpitConfig) => {
//     threeInstance.clear();
//     threeInstance.scene.remove(spheres);
//     spheres = new Spheres(threeInstance.renderer, newConfig);
//     threeInstance.scene.add(spheres);
//   };

//   return {
//     three: threeInstance,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initSpheres({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       window.removeEventListener('resize', handleWindowResize);
//       pointerData.dispose();
//       threeInstance.dispose();
//     },
//   };
// }

// /* ======================================================================= */
// /*                           REACT-КОМПОНЕНТ                               */
// /* ======================================================================= */

// // ИСПРАВЛЕНИЕ: расширяем BallpitProps всеми физическими параметрами
// export interface BallpitProps {
//   className?: string;
//   followCursor?: boolean;
//   colors?: number[];
//   count?: number;
//   // Добавляем физические параметры
//   gravity?: number;
//   friction?: number;
//   wallBounce?: number;
//   maxVelocity?: number;
//   minSize?: number;
//   maxSize?: number;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   className,
//   followCursor = true,
//   colors,
//   count,
//   gravity,
//   friction,
//   wallBounce,
//   maxVelocity,
//   minSize,
//   maxSize,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const instanceRef = useRef<BallpitInstance | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // Проверяем что размеры окна определены (важно для SSR и раннего рендера)
//     if (window.innerWidth === 0 || window.innerHeight === 0) {
//       // Пробуем еще раз через небольшую задержку
//       const timeout = setTimeout(() => {
//         if (window.innerWidth > 0 && window.innerHeight > 0) {
//           initBallpit();
//         }
//       }, 100);
//       return () => clearTimeout(timeout);
//     }

//     initBallpit();

//     function initBallpit() {
//       const currentCanvas = canvasRef.current;
//       if (!currentCanvas) return; // Проверка для TypeScript
      
//       instanceRef.current = createBallpit(currentCanvas, {
//         followCursor,
//         ...(colors ? { colors } : {}),
//         ...(typeof count === "number" ? { count } : {}),
//         ...(typeof gravity === "number" ? { gravity } : {}),
//         ...(typeof friction === "number" ? { friction } : {}),
//         ...(typeof wallBounce === "number" ? { wallBounce } : {}),
//         ...(typeof maxVelocity === "number" ? { maxVelocity } : {}),
//         ...(typeof minSize === "number" ? { minSize } : {}),
//         ...(typeof maxSize === "number" ? { maxSize } : {}),
//       });
//     }

//     return () => {
//       instanceRef.current?.dispose();
//     };
//   }, [followCursor, colors, count, gravity, friction, wallBounce, maxVelocity, minSize, maxSize]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{ 
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100vw", 
//         height: "100vh", 
//         display: "block",
//         pointerEvents: "auto",
//         zIndex: 1,
//       }}
//     />
//   );
// };

// export default Ballpit;



// // src/components/Ballpit.tsx
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   ACESFilmicToneMapping,
//   AmbientLight,
//   Clock,
//   Color,
//   InstancedMesh,
//   MathUtils,
//   MeshPhysicalMaterial,
//   MeshPhysicalMaterialParameters,
//   Object3D,
//   PerspectiveCamera,
//   Plane,
//   PMREMGenerator,
//   PointLight,
//   Raycaster,
//   Scene,
//   ShaderChunk,
//   SphereGeometry,
//   SRGBColorSpace,
//   Texture,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
//   WebGLRendererParameters,
// } from "three";
// import { RoomEnvironment } from "three/examples/jsm/Addons.js";
// import { gsap } from "gsap";

// /* ======================================================================= */
// /*                               ТИПЫ / ВСПОМОГАШКИ                        */
// /* ======================================================================= */

// interface Shader {
//   uniforms: Record<string, { value: unknown }>;
//   fragmentShader: string;
//   vertexShader: string;
// }

// interface SizeData {
//   width: number;
//   height: number;
//   wWidth: number;
//   wHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// interface ThreeWrapperConfig {
//   canvas?: HTMLCanvasElement;
//   id?: string;
//   rendererOptions?: Partial<WebGLRendererParameters>;
//   size?: "parent" | { width: number; height: number };
// }

// interface PostprocessingLike {
//   setSize(width: number, height: number): void;
//   render(): void;
//   dispose(): void;
// }

// interface AnimationState {
//   elapsed: number;
//   delta: number;
// }

// /* ======================================================================= */
// /*                             ОБЁРТКА ВОКРУГ THREE                        */
// /* ======================================================================= */

// class ThreeWrapper {
//   private config: ThreeWrapperConfig;
//   private postprocessing?: PostprocessingLike;
//   private resizeObserver?: ResizeObserver;
//   private intersectionObserver?: IntersectionObserver;
//   private resizeTimer?: number;
//   private animationFrameId = 0;
//   private clock: Clock = new Clock();
//   private isAnimating = false;
//   private isVisible = false;

//   canvas!: HTMLCanvasElement;
//   camera!: PerspectiveCamera;
//   cameraMinAspect?: number;
//   cameraMaxAspect?: number;
//   cameraFov!: number;
//   maxPixelRatio?: number;
//   minPixelRatio?: number;
//   scene!: Scene;
//   renderer!: WebGLRenderer;

//   size: SizeData = {
//     width: 0,
//     height: 0,
//     wWidth: 0,
//     wHeight: 0,
//     ratio: 0,
//     pixelRatio: 0,
//   };

//   animationState: AnimationState = { elapsed: 0, delta: 0 };

//   render: () => void = this.innerRender.bind(this);
//   onBeforeRender: (state: AnimationState) => void = () => {};
//   onAfterRender: (state: AnimationState) => void = () => {};
//   onAfterResize: (size: SizeData) => void = () => {};
//   isDisposed = false;

//   constructor(config: ThreeWrapperConfig) {
//     this.config = { ...config };
//     this.initCamera();
//     this.initScene();
//     this.initRenderer();
//     this.resize();
//     this.initObservers();
//   }

//   private initCamera() {
//     this.camera = new PerspectiveCamera();
//     this.cameraFov = this.camera.fov;
//   }

//   private initScene() {
//     this.scene = new Scene();
//   }

//   private initRenderer() {
//     if (this.config.canvas) {
//       this.canvas = this.config.canvas;
//     } else if (this.config.id) {
//       const elem = document.getElementById(this.config.id);
//       if (elem instanceof HTMLCanvasElement) {
//         this.canvas = elem;
//       } else {
//         throw new Error("ThreeWrapper: element with given id is not a canvas");
//       }
//     } else {
//       throw new Error("ThreeWrapper: canvas or id must be provided");
//     }

//     this.canvas.style.display = "block";

//     const rendererOptions: WebGLRendererParameters = {
//       canvas: this.canvas,
//       powerPreference: "high-performance",
//       ...(this.config.rendererOptions ?? {}),
//     };

//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;
//   }

//   private initObservers() {
//     if (!(this.config.size instanceof Object)) {
//       const resizeHandler = this.onResize.bind(this);
//       window.addEventListener("resize", resizeHandler);

//       if (this.config.size === "parent" && this.canvas.parentNode) {
//         this.resizeObserver = new ResizeObserver(resizeHandler);
//         this.resizeObserver.observe(this.canvas.parentNode as Element);
//       }
//     }

//     this.intersectionObserver = new IntersectionObserver(
//       this.onIntersection.bind(this),
//       { root: null, rootMargin: "0px", threshold: 0 }
//     );
//     this.intersectionObserver.observe(this.canvas);

//     document.addEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );
//   }

//   private onResize() {
//     if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
//     this.resizeTimer = window.setTimeout(() => this.resize(), 80);
//   }

//   resize() {
//     let w: number;
//     let h: number;

//     if (this.config.size && this.config.size !== "parent") {
//       w = this.config.size.width;
//       h = this.config.size.height;
//     } else if (this.config.size === "parent" && this.canvas.parentNode) {
//       const parent = this.canvas.parentNode as HTMLElement;
//       w = parent.offsetWidth;
//       h = parent.offsetHeight;
//     } else {
//       w = window.innerWidth;
//       h = window.innerHeight;
//     }

//     this.size.width = w;
//     this.size.height = h;
//     this.size.ratio = w / h;

//     this.updateCamera();
//     this.updateRenderer();
//     this.onAfterResize(this.size);
//   }

//   private updateCamera() {
//     this.camera.aspect = this.size.width / this.size.height;

//     if (this.camera.isPerspectiveCamera && this.cameraFov) {
//       if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
//         this.adjustFov(this.cameraMinAspect);
//       } else if (
//         this.cameraMaxAspect &&
//         this.camera.aspect > this.cameraMaxAspect
//       ) {
//         this.adjustFov(this.cameraMaxAspect);
//       } else {
//         this.camera.fov = this.cameraFov;
//       }
//     }

//     this.camera.updateProjectionMatrix();
//     this.updateWorldSize();
//   }

//   private adjustFov(aspect: number) {
//     const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
//     const newTan = tanFov / (this.camera.aspect / aspect);
//     this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
//   }

//   updateWorldSize() {
//     const fovRad = (this.camera.fov * Math.PI) / 180;
//     this.size.wHeight =
//       2 * Math.tan(fovRad / 2) * this.camera.position.length();
//     this.size.wWidth = this.size.wHeight * this.camera.aspect;
//   }

//   private updateRenderer() {
//     this.renderer.setSize(this.size.width, this.size.height);
//     if (this.postprocessing) {
//       this.postprocessing.setSize(this.size.width, this.size.height);
//     }

//     let pr = window.devicePixelRatio;
//     if (this.maxPixelRatio && pr > this.maxPixelRatio) {
//       pr = this.maxPixelRatio;
//     } else if (this.minPixelRatio && pr < this.minPixelRatio) {
//       pr = this.minPixelRatio;
//     }

//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;
//   }

//   get postProcessing(): PostprocessingLike | undefined {
//     return this.postprocessing;
//   }

//   set postProcessing(value: PostprocessingLike | undefined) {
//     this.postprocessing = value;
//     if (value) {
//       this.render = value.render.bind(value);
//     } else {
//       this.render = this.innerRender.bind(this);
//     }
//   }

//   private onIntersection(entries: IntersectionObserverEntry[]) {
//     const isIntersecting = entries[0]?.isIntersecting ?? false;
//     this.isAnimating = isIntersecting;
//     if (isIntersecting) {
//       this.startAnimation();
//     } else {
//       this.stopAnimation();
//     }
//   }

//   private onVisibilityChange() {
//     if (!this.isAnimating) return;
//     if (document.hidden) {
//       this.stopAnimation();
//     } else {
//       this.startAnimation();
//     }
//   }

//   private startAnimation() {
//     if (this.isVisible) return;

//     const animateFrame = () => {
//       this.animationFrameId = window.requestAnimationFrame(animateFrame);
//       this.animationState.delta = this.clock.getDelta();
//       this.animationState.elapsed += this.animationState.delta;

//       this.onBeforeRender(this.animationState);
//       this.render();
//       this.onAfterRender(this.animationState);
//     };

//     this.isVisible = true;
//     this.clock.start();
//     animateFrame();
//   }

//   private stopAnimation() {
//     if (!this.isVisible) return;
//     window.cancelAnimationFrame(this.animationFrameId);
//     this.isVisible = false;
//     this.clock.stop();
//   }

//   private innerRender() {
//     this.renderer.render(this.scene, this.camera);
//   }

//   clear() {
//     this.scene.traverse((obj) => {
//       const anyObj = obj as {
//         isMesh?: boolean;
//         material?: unknown;
//         geometry?: { dispose: () => void };
//       };

//       if (!anyObj.isMesh || !anyObj.material || !anyObj.geometry) return;

//       const mat = anyObj.material as {
//         dispose?: () => void;
//         [key: string]: unknown;
//       };

//       Object.values(mat).forEach((val) => {
//         const maybeDisposable = val as { dispose?: () => void };
//         if (maybeDisposable && typeof maybeDisposable.dispose === "function") {
//           maybeDisposable.dispose();
//         }
//       });

//       if (typeof mat.dispose === "function") {
//         mat.dispose();
//       }

//       anyObj.geometry.dispose();
//     });

//     this.scene.clear();
//   }

//   dispose() {
//     this.stopAnimation();

//     window.removeEventListener("resize", this.onResize.bind(this));
//     this.resizeObserver?.disconnect();
//     this.intersectionObserver?.disconnect();
//     document.removeEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );

//     this.clear();
//     this.postprocessing?.dispose();
//     this.renderer.dispose();
//     this.isDisposed = true;
//   }
// }

// /* ======================================================================= */
// /*                              ФИЗИКА ШАРОВ                               */
// /* ======================================================================= */

// interface PhysicsConfig {
//   count: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   maxSize: number;
//   minSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// class PhysicsSystem {
//   config: PhysicsConfig;
//   positionData: Float32Array;
//   velocityData: Float32Array;
//   sizeData: Float32Array;
//   center: Vector3 = new Vector3();

//   constructor(config: PhysicsConfig) {
//     this.config = { ...config };
//     this.positionData = new Float32Array(3 * config.count).fill(0);
//     this.velocityData = new Float32Array(3 * config.count).fill(0);
//     this.sizeData = new Float32Array(config.count).fill(1);
//     this.center = new Vector3();

//     this.initPositions();
//     this.setSizes();
//   }

//   private initPositions() {
//     const { config, positionData } = this;

//     this.center.toArray(positionData, 0);

//     for (let i = 1; i < config.count; i += 1) {
//       const idx = 3 * i;
//       positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   setSizes() {
//     const { config, sizeData } = this;

//     sizeData[0] = config.size0;
//     for (let i = 1; i < config.count; i += 1) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     const { config, center, positionData, sizeData, velocityData } = this;

//     let startIdx = 0;

//     const tmpPos = new Vector3();
//     const tmpVel = new Vector3();
//     const diff = new Vector3();
//     const otherPos = new Vector3();
//     const otherVel = new Vector3();

//     if (config.controlSphere0) {
//       startIdx = 1;
//       tmpPos.fromArray(positionData, 0);
//       tmpPos.lerp(center, 0.12).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }

//     // обновляем позиции
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       // гравитация
//       tmpVel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
//       // трение
//       tmpVel.multiplyScalar(config.friction);
//       // ограничение скорости
//       tmpVel.clampLength(0, config.maxVelocity);

//       tmpPos.add(tmpVel);

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }

//     // столкновения и стены
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       const radius = sizeData[idx];

//       for (let j = idx + 1; j < config.count; j += 1) {
//         const otherBase = 3 * j;
//         otherPos.fromArray(positionData, otherBase);
//         otherVel.fromArray(velocityData, otherBase);

//         diff.copy(otherPos).sub(tmpPos);
//         const dist = diff.length();
//         const sumRadius = radius + sizeData[j];

//         if (dist < sumRadius && dist > 0.0001) {
//           const overlap = sumRadius - dist;
//           const correction = diff.normalize().multiplyScalar(0.5 * overlap);

//           const velMag = Math.max(tmpVel.length(), 1);
//           const otherVelMag = Math.max(otherVel.length(), 1);

//           tmpPos.sub(correction);
//           tmpVel.sub(correction.clone().multiplyScalar(velMag));

//           otherPos.add(correction);
//           otherVel.add(correction.clone().multiplyScalar(otherVelMag));

//           tmpPos.toArray(positionData, base);
//           tmpVel.toArray(velocityData, base);

//           otherPos.toArray(positionData, otherBase);
//           otherVel.toArray(velocityData, otherBase);
//         }
//       }

//       // отталкивание от шара 0
//       if (config.controlSphere0) {
//         diff.fromArray(positionData, 0).sub(tmpPos);
//         const d = diff.length();
//         const sumRadius0 = radius + sizeData[0];
//         if (d < sumRadius0 && d > 0.0001) {
//           const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
//           const velCorrection = correction
//             .clone()
//             .multiplyScalar(Math.max(tmpVel.length(), 2));
//           tmpPos.sub(correction);
//           tmpVel.sub(velCorrection);
//         }
//       }

//       // стены по X
//       if (Math.abs(tmpPos.x) + radius > config.maxX) {
//         tmpPos.x = Math.sign(tmpPos.x) * (config.maxX - radius);
//         tmpVel.x = -tmpVel.x * config.wallBounce;
//       }

//       // по Y
//       if (config.gravity === 0) {
//         if (Math.abs(tmpPos.y) + radius > config.maxY) {
//           tmpPos.y = Math.sign(tmpPos.y) * (config.maxY - radius);
//           tmpVel.y = -tmpVel.y * config.wallBounce;
//         }
//       } else if (tmpPos.y - radius < -config.maxY) {
//         tmpPos.y = -config.maxY + radius;
//         tmpVel.y = -tmpVel.y * config.wallBounce;
//       }

//       // по Z
//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(tmpPos.z) + radius > maxBoundary) {
//         tmpPos.z = Math.sign(tmpPos.z) * (config.maxZ - radius);
//         tmpVel.z = -tmpVel.z * config.wallBounce;
//       }

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }
//   }
// }

// /* ======================================================================= */
// /*                     МАТЕРИАЛ С ПОЛУПРОЗРАЧНЫМ СВЕЧЕНИЕМ                 */
// /* ======================================================================= */

// class ScatteringMaterial extends MeshPhysicalMaterial {
//   uniforms: Record<string, { value: number }> = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2 },
//     thicknessScale: { value: 10 },
//   };

//   // ИСПРАВЛЕНИЕ: явно объявляем свойство defines
//   defines?: Record<string, string>;
//   onBeforeCompile2?: (shader: Shader) => void;

//   constructor(params: MeshPhysicalMaterialParameters & { envMap: Texture }) {
//     super(params);

//     this.defines = this.defines || {};
//     this.defines.USE_UV = "";

//     this.onBeforeCompile = (shaderData: unknown) => {
//       const shader = shaderData as Shader;
      
//       Object.assign(shader.uniforms, this.uniforms);

//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//         ` + shader.fragmentShader;

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "void main() {",
//         `
//         void RE_Direct_Scattering(
//           const in IncidentLight directLight,
//           const in vec2 uv,
//           const in vec3 geometryPosition,
//           const in vec3 geometryNormal,
//           const in vec3 geometryViewDir,
//           const in vec3 geometryClearcoatNormal,
//           inout ReflectedLight reflectedLight
//         ) {
//           vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;

//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif

//           reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//         `
//       );

//       const lightsChunkOriginal = ShaderChunk.lights_fragment_begin as string;
//       const lightsChunk = lightsChunkOriginal.replace(
//         "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
//         `
//           RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
//           RE_Direct_Scattering( directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight );
//         `
//       );

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "#include <lights_fragment_begin>",
//         lightsChunk
//       );

//       if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
//     };
//   }
// }

// /* ======================================================================= */
// /*                           КОНФИГ БОЛЬШОГО ПИТА                          */
// /* ======================================================================= */

// interface BallpitConfig {
//   count: number;
//   colors: number[];
//   ambientColor: number;
//   ambientIntensity: number;
//   lightIntensity: number;
//   materialParams: {
//     metalness: number;
//     roughness: number;
//     clearcoat: number;
//     clearcoatRoughness: number;
//   };
//   minSize: number;
//   maxSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// const defaultBallpitConfig: BallpitConfig = {
//   count: 220,
//   colors: [0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xffffff],
//   ambientColor: 0xffffff,
//   ambientIntensity: 1.1,
//   lightIntensity: 220,
//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.35,
//     clearcoat: 1,
//     clearcoatRoughness: 0.18,
//   },
//   minSize: 0.6,
//   maxSize: 1.1,
//   size0: 1.1,
//   gravity: 0.45,
//   friction: 0.995,
//   wallBounce: 0.96,
//   maxVelocity: 0.17,
//   maxX: 5,
//   maxY: 4,
//   maxZ: 2.3,
//   controlSphere0: false,
//   followCursor: true,
// };

// const tempObject = new Object3D();

// /* ======================================================================= */
// /*                            Pointer helper                                */
// /* ======================================================================= */

// interface PointerData {
//   position: Vector2;
//   nPosition: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (data: PointerData) => void;
//   onMove: (data: PointerData) => void;
//   onClick: (data: PointerData) => void;
//   onLeave: (data: PointerData) => void;
//   dispose: () => void;
// }

// const pointerPosition = new Vector2();
// const pointerMap = new Map<HTMLElement, PointerData>();
// let globalPointerActive = false;

// function isInside(rect: DOMRect): boolean {
//   return (
//     pointerPosition.x >= rect.left &&
//     pointerPosition.x <= rect.left + rect.width &&
//     pointerPosition.y >= rect.top &&
//     pointerPosition.y <= rect.top + rect.height
//   );
// }

// function updatePointerData(data: PointerData, rect: DOMRect) {
//   data.position.set(
//     pointerPosition.x - rect.left,
//     pointerPosition.y - rect.top
//   );
//   data.nPosition.set(
//     (data.position.x / rect.width) * 2 - 1,
//     (-data.position.y / rect.height) * 2 + 1
//   );
// }

// function handlePointerMove() {
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && !data.touching) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerMove(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   handlePointerMove();
// }

// function onPointerLeave() {
//   for (const data of pointerMap.values()) {
//     if (data.hover) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerClick(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) data.onClick(data);
//   }
// }

// function onTouchStart(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       data.touching = true;
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     }
//   }
// }

// function onTouchMove(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) {
//       if (!data.hover) {
//         data.hover = true;
//         data.touching = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && data.touching) {
//       data.onMove(data);
//     }
//   }
// }

// function onTouchEnd() {
//   for (const data of pointerMap.values()) {
//     if (data.touching) {
//       data.touching = false;
//       if (data.hover) {
//         data.hover = false;
//         data.onLeave(data);
//       }
//     }
//   }
// }

// function ensureGlobalPointerListeners() {
//   if (globalPointerActive) return;
//   document.body.addEventListener("pointermove", onPointerMove as EventListener);
//   document.body.addEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.addEventListener("click", onPointerClick as EventListener);

//   document.body.addEventListener("touchstart", onTouchStart as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchmove", onTouchMove as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchend", onTouchEnd as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchcancel", onTouchEnd as EventListener, {
//     passive: false,
//   });

//   globalPointerActive = true;
// }

// function cleanupGlobalPointerListeners() {
//   if (!globalPointerActive) return;

//   document.body.removeEventListener(
//     "pointermove",
//     onPointerMove as EventListener
//   );
//   document.body.removeEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.removeEventListener("click", onPointerClick as EventListener);

//   document.body.removeEventListener(
//     "touchstart",
//     onTouchStart as EventListener
//   );
//   document.body.removeEventListener("touchmove", onTouchMove as EventListener);
//   document.body.removeEventListener("touchend", onTouchEnd as EventListener);
//   document.body.removeEventListener(
//     "touchcancel",
//     onTouchEnd as EventListener
//   );

//   globalPointerActive = false;
// }

// function createPointerData(domElement: HTMLElement): PointerData {
//   const data: PointerData = {
//     position: new Vector2(),
//     nPosition: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onClick: () => {},
//     onLeave: () => {},
//     dispose: () => {},
//   };

//   pointerMap.set(domElement, data);
//   ensureGlobalPointerListeners();

//   data.dispose = () => {
//     pointerMap.delete(domElement);
//     if (pointerMap.size === 0) {
//       cleanupGlobalPointerListeners();
//     }
//   };

//   return data;
// }

// /* ======================================================================= */
// /*                             INSTANCED ШАРЫ                               */
// /* ======================================================================= */

// class Spheres extends InstancedMesh {
//   config: BallpitConfig;
//   physics: PhysicsSystem;
//   ambientLight: AmbientLight;
//   light: PointLight;

//   constructor(renderer: WebGLRenderer, params: Partial<BallpitConfig> = {}) {
//     const config: BallpitConfig = {
//       ...defaultBallpitConfig,
//       ...params,
//     };

//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envRT = pmrem.fromScene(roomEnv);
//     const envTexture = envRT.texture as Texture;

//     const geometry = new SphereGeometry(1, 32, 32);
//     const material = new ScatteringMaterial({
//       envMap: envTexture,
//       ...config.materialParams,
//       transmission: 0.96,
//       ior: 1.3,
//       thickness: 1.2,
//     });

//     material.envMapRotation.x = -Math.PI / 2;

//     super(geometry, material, config.count);

//     this.config = config;
//     this.physics = new PhysicsSystem(config);
//     this.ambientLight = new AmbientLight(
//       this.config.ambientColor,
//       this.config.ambientIntensity
//     );
//     this.light = new PointLight(
//       this.config.colors[0],
//       this.config.lightIntensity
//     );

//     this.add(this.ambientLight);
//     this.add(this.light);

//     this.setColors(config.colors);
//   }

//   setColors(colors: readonly number[]) {
//     const colorObjects: Color[] = colors.map((c) => new Color(c));

//     const getColorAt = (ratio: number, out: Color): Color => {
//       const clamped = Math.min(1, Math.max(0, ratio));
//       const scaled = clamped * (colorObjects.length - 1);
//       const idx = Math.floor(scaled);

//       const start = colorObjects[idx];
//       if (idx >= colorObjects.length - 1) {
//         return out.copy(start);
//       }

//       const alpha = scaled - idx;
//       const end = colorObjects[idx + 1];

//       out.r = start.r + alpha * (end.r - start.r);
//       out.g = start.g + alpha * (end.g - start.g);
//       out.b = start.b + alpha * (end.b - start.b);

//       return out;
//     };

//     const tmpColor = new Color();

//     for (let i = 0; i < this.count; i += 1) {
//       this.setColorAt(i, getColorAt(i / this.count, tmpColor));
//       if (i === 0) {
//         this.light.color.copy(tmpColor);
//       }
//     }

//     if (this.instanceColor) {
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     this.physics.update(deltaInfo);

//     for (let idx = 0; idx < this.count; idx += 1) {
//       tempObject.position.fromArray(this.physics.positionData, 3 * idx);

//       if (idx === 0 && !this.config.followCursor) {
//         tempObject.scale.setScalar(0);
//       } else {
//         tempObject.scale.setScalar(this.physics.sizeData[idx]);
//       }

//       tempObject.updateMatrix();
//       this.setMatrixAt(idx, tempObject.matrix);

//       if (idx === 0) {
//         this.light.position.copy(tempObject.position);
//       }
//     }

//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// /* ======================================================================= */
// /*                      ФАБРИКА: СОЗДАНИЕ ПОЛЯ СФЕР                         */
// /* ======================================================================= */

// interface BallpitInstance {
//   three: ThreeWrapper;
//   readonly spheres: Spheres;
//   setCount(count: number): void;
//   togglePause(): void;
//   dispose(): void;
// }

// function createBallpit(
//   canvas: HTMLCanvasElement,
//   config: Partial<BallpitConfig> = {}
// ): BallpitInstance {
//   const threeInstance = new ThreeWrapper({
//     canvas,
//     size: "parent",
//     rendererOptions: { antialias: true, alpha: true },
//   });

//   threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
//   threeInstance.camera.position.set(0, 0, 18);
//   threeInstance.camera.lookAt(0, 0, 0);
//   threeInstance.cameraMaxAspect = 1.5;
//   threeInstance.resize();

//   let spheres: Spheres = new Spheres(threeInstance.renderer, config);
//   threeInstance.scene.add(spheres);

//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();
//   let isPaused = false;

//   const pointerData = createPointerData(canvas);

//   // ИСПРАВЛЕНИЕ: Активируем реакцию на курсор только если followCursor === true
//   if (config.followCursor !== false) {
//     pointerData.onMove = (data) => {
//       raycaster.setFromCamera(data.nPosition, threeInstance.camera);
//       threeInstance.camera.getWorldDirection(plane.normal);
//       raycaster.ray.intersectPlane(plane, intersectionPoint);

//       gsap.to(spheres.physics.center, {
//         x: intersectionPoint.x,
//         y: intersectionPoint.y,
//         z: intersectionPoint.z,
//         duration: 0.35,
//         ease: "power2.out",
//       });

//       spheres.config.controlSphere0 = true;
//     };

//     pointerData.onLeave = () => {
//       spheres.config.controlSphere0 = false;
//     };
//   }

//   canvas.style.touchAction = "none";
//   canvas.style.userSelect = "none";
//   (canvas.style as { webkitUserSelect?: string }).webkitUserSelect = "none";

//   threeInstance.onBeforeRender = (deltaInfo) => {
//     if (!isPaused) spheres.update(deltaInfo);
//   };

//   threeInstance.onAfterResize = (size) => {
//     spheres.config.maxX = size.wWidth / 2;
//     spheres.config.maxY = size.wHeight / 2;
//   };

//   const initSpheres = (newConfig: BallpitConfig) => {
//     threeInstance.clear();
//     threeInstance.scene.remove(spheres);
//     spheres = new Spheres(threeInstance.renderer, newConfig);
//     threeInstance.scene.add(spheres);
//   };

//   return {
//     three: threeInstance,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initSpheres({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       pointerData.dispose();
//       threeInstance.dispose();
//     },
//   };
// }

// /* ======================================================================= */
// /*                           REACT-КОМПОНЕНТ                               */
// /* ======================================================================= */

// // ИСПРАВЛЕНИЕ: расширяем BallpitProps всеми физическими параметрами
// export interface BallpitProps {
//   className?: string;
//   followCursor?: boolean;
//   colors?: number[];
//   count?: number;
//   // Добавляем физические параметры
//   gravity?: number;
//   friction?: number;
//   wallBounce?: number;
//   maxVelocity?: number;
//   minSize?: number;
//   maxSize?: number;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   className,
//   followCursor = true,
//   colors,
//   count,
//   gravity,
//   friction,
//   wallBounce,
//   maxVelocity,
//   minSize,
//   maxSize,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const instanceRef = useRef<BallpitInstance | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     instanceRef.current = createBallpit(canvas, {
//       followCursor,
//       ...(colors ? { colors } : {}),
//       ...(typeof count === "number" ? { count } : {}),
//       ...(typeof gravity === "number" ? { gravity } : {}),
//       ...(typeof friction === "number" ? { friction } : {}),
//       ...(typeof wallBounce === "number" ? { wallBounce } : {}),
//       ...(typeof maxVelocity === "number" ? { maxVelocity } : {}),
//       ...(typeof minSize === "number" ? { minSize } : {}),
//       ...(typeof maxSize === "number" ? { maxSize } : {}),
//     });

//     return () => {
//       instanceRef.current?.dispose();
//     };
//   }, [followCursor, colors, count, gravity, friction, wallBounce, maxVelocity, minSize, maxSize]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{ 
//         width: "100%", 
//         height: "100%", 
//         display: "block",
//         position: "absolute",
//         top: 0,
//         left: 0,
//       }}
//     />
//   );
// };

// export default Ballpit;



// // src/components/Ballpit.tsx
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   ACESFilmicToneMapping,
//   AmbientLight,
//   Clock,
//   Color,
//   InstancedMesh,
//   MathUtils,
//   MeshPhysicalMaterial,
//   MeshPhysicalMaterialParameters,
//   Object3D,
//   PerspectiveCamera,
//   Plane,
//   PMREMGenerator,
//   PointLight,
//   Raycaster,
//   Scene,
//   ShaderChunk,
//   SphereGeometry,
//   SRGBColorSpace,
//   Texture,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
//   WebGLRendererParameters,
// } from "three";
// import { RoomEnvironment } from "three/examples/jsm/Addons.js";
// import { gsap } from "gsap";

// /* ======================================================================= */
// /*                               ТИПЫ / ВСПОМОГАШКИ                        */
// /* ======================================================================= */

// interface Shader {
//   uniforms: Record<string, { value: unknown }>;
//   fragmentShader: string;
//   vertexShader: string;
// }

// interface SizeData {
//   width: number;
//   height: number;
//   wWidth: number;
//   wHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// interface ThreeWrapperConfig {
//   canvas?: HTMLCanvasElement;
//   id?: string;
//   rendererOptions?: Partial<WebGLRendererParameters>;
//   size?: "parent" | { width: number; height: number };
// }

// interface PostprocessingLike {
//   setSize(width: number, height: number): void;
//   render(): void;
//   dispose(): void;
// }

// interface AnimationState {
//   elapsed: number;
//   delta: number;
// }

// /* ======================================================================= */
// /*                             ОБЁРТКА ВОКРУГ THREE                        */
// /* ======================================================================= */

// class ThreeWrapper {
//   private config: ThreeWrapperConfig;
//   private postprocessing?: PostprocessingLike;
//   private resizeObserver?: ResizeObserver;
//   private intersectionObserver?: IntersectionObserver;
//   private resizeTimer?: number;
//   private animationFrameId = 0;
//   private clock: Clock = new Clock();
//   private isAnimating = false;
//   private isVisible = false;

//   canvas!: HTMLCanvasElement;
//   camera!: PerspectiveCamera;
//   cameraMinAspect?: number;
//   cameraMaxAspect?: number;
//   cameraFov!: number;
//   maxPixelRatio?: number;
//   minPixelRatio?: number;
//   scene!: Scene;
//   renderer!: WebGLRenderer;

//   size: SizeData = {
//     width: 0,
//     height: 0,
//     wWidth: 0,
//     wHeight: 0,
//     ratio: 0,
//     pixelRatio: 0,
//   };

//   animationState: AnimationState = { elapsed: 0, delta: 0 };

//   render: () => void = this.innerRender.bind(this);
//   onBeforeRender: (state: AnimationState) => void = () => {};
//   onAfterRender: (state: AnimationState) => void = () => {};
//   onAfterResize: (size: SizeData) => void = () => {};
//   isDisposed = false;

//   constructor(config: ThreeWrapperConfig) {
//     this.config = { ...config };
//     this.initCamera();
//     this.initScene();
//     this.initRenderer();
//     this.resize();
//     this.initObservers();
//   }

//   private initCamera() {
//     this.camera = new PerspectiveCamera();
//     this.cameraFov = this.camera.fov;
//   }

//   private initScene() {
//     this.scene = new Scene();
//   }

//   private initRenderer() {
//     if (this.config.canvas) {
//       this.canvas = this.config.canvas;
//     } else if (this.config.id) {
//       const elem = document.getElementById(this.config.id);
//       if (elem instanceof HTMLCanvasElement) {
//         this.canvas = elem;
//       } else {
//         throw new Error("ThreeWrapper: element with given id is not a canvas");
//       }
//     } else {
//       throw new Error("ThreeWrapper: canvas or id must be provided");
//     }

//     this.canvas.style.display = "block";

//     const rendererOptions: WebGLRendererParameters = {
//       canvas: this.canvas,
//       powerPreference: "high-performance",
//       ...(this.config.rendererOptions ?? {}),
//     };

//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;
//   }

//   private initObservers() {
//     if (!(this.config.size instanceof Object)) {
//       const resizeHandler = this.onResize.bind(this);
//       window.addEventListener("resize", resizeHandler);

//       if (this.config.size === "parent" && this.canvas.parentNode) {
//         this.resizeObserver = new ResizeObserver(resizeHandler);
//         this.resizeObserver.observe(this.canvas.parentNode as Element);
//       }
//     }

//     this.intersectionObserver = new IntersectionObserver(
//       this.onIntersection.bind(this),
//       { root: null, rootMargin: "0px", threshold: 0 }
//     );
//     this.intersectionObserver.observe(this.canvas);

//     document.addEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );
//   }

//   private onResize() {
//     if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
//     this.resizeTimer = window.setTimeout(() => this.resize(), 80);
//   }

//   resize() {
//     let w: number;
//     let h: number;

//     if (this.config.size && this.config.size !== "parent") {
//       w = this.config.size.width;
//       h = this.config.size.height;
//     } else if (this.config.size === "parent" && this.canvas.parentNode) {
//       const parent = this.canvas.parentNode as HTMLElement;
//       w = parent.offsetWidth;
//       h = parent.offsetHeight;
//     } else {
//       w = window.innerWidth;
//       h = window.innerHeight;
//     }

//     this.size.width = w;
//     this.size.height = h;
//     this.size.ratio = w / h;

//     this.updateCamera();
//     this.updateRenderer();
//     this.onAfterResize(this.size);
//   }

//   private updateCamera() {
//     this.camera.aspect = this.size.width / this.size.height;

//     if (this.camera.isPerspectiveCamera && this.cameraFov) {
//       if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
//         this.adjustFov(this.cameraMinAspect);
//       } else if (
//         this.cameraMaxAspect &&
//         this.camera.aspect > this.cameraMaxAspect
//       ) {
//         this.adjustFov(this.cameraMaxAspect);
//       } else {
//         this.camera.fov = this.cameraFov;
//       }
//     }

//     this.camera.updateProjectionMatrix();
//     this.updateWorldSize();
//   }

//   private adjustFov(aspect: number) {
//     const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
//     const newTan = tanFov / (this.camera.aspect / aspect);
//     this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
//   }

//   updateWorldSize() {
//     const fovRad = (this.camera.fov * Math.PI) / 180;
//     this.size.wHeight =
//       2 * Math.tan(fovRad / 2) * this.camera.position.length();
//     this.size.wWidth = this.size.wHeight * this.camera.aspect;
//   }

//   private updateRenderer() {
//     this.renderer.setSize(this.size.width, this.size.height);
//     if (this.postprocessing) {
//       this.postprocessing.setSize(this.size.width, this.size.height);
//     }

//     let pr = window.devicePixelRatio;
//     if (this.maxPixelRatio && pr > this.maxPixelRatio) {
//       pr = this.maxPixelRatio;
//     } else if (this.minPixelRatio && pr < this.minPixelRatio) {
//       pr = this.minPixelRatio;
//     }

//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;
//   }

//   get postProcessing(): PostprocessingLike | undefined {
//     return this.postprocessing;
//   }

//   set postProcessing(value: PostprocessingLike | undefined) {
//     this.postprocessing = value;
//     if (value) {
//       this.render = value.render.bind(value);
//     } else {
//       this.render = this.innerRender.bind(this);
//     }
//   }

//   private onIntersection(entries: IntersectionObserverEntry[]) {
//     const isIntersecting = entries[0]?.isIntersecting ?? false;
//     this.isAnimating = isIntersecting;
//     if (isIntersecting) {
//       this.startAnimation();
//     } else {
//       this.stopAnimation();
//     }
//   }

//   private onVisibilityChange() {
//     if (!this.isAnimating) return;
//     if (document.hidden) {
//       this.stopAnimation();
//     } else {
//       this.startAnimation();
//     }
//   }

//   private startAnimation() {
//     if (this.isVisible) return;

//     const animateFrame = () => {
//       this.animationFrameId = window.requestAnimationFrame(animateFrame);
//       this.animationState.delta = this.clock.getDelta();
//       this.animationState.elapsed += this.animationState.delta;

//       this.onBeforeRender(this.animationState);
//       this.render();
//       this.onAfterRender(this.animationState);
//     };

//     this.isVisible = true;
//     this.clock.start();
//     animateFrame();
//   }

//   private stopAnimation() {
//     if (!this.isVisible) return;
//     window.cancelAnimationFrame(this.animationFrameId);
//     this.isVisible = false;
//     this.clock.stop();
//   }

//   private innerRender() {
//     this.renderer.render(this.scene, this.camera);
//   }

//   clear() {
//     this.scene.traverse((obj) => {
//       const anyObj = obj as {
//         isMesh?: boolean;
//         material?: unknown;
//         geometry?: { dispose: () => void };
//       };

//       if (!anyObj.isMesh || !anyObj.material || !anyObj.geometry) return;

//       const mat = anyObj.material as {
//         dispose?: () => void;
//         [key: string]: unknown;
//       };

//       Object.values(mat).forEach((val) => {
//         const maybeDisposable = val as { dispose?: () => void };
//         if (maybeDisposable && typeof maybeDisposable.dispose === "function") {
//           maybeDisposable.dispose();
//         }
//       });

//       if (typeof mat.dispose === "function") {
//         mat.dispose();
//       }

//       anyObj.geometry.dispose();
//     });

//     this.scene.clear();
//   }

//   dispose() {
//     this.stopAnimation();

//     window.removeEventListener("resize", this.onResize.bind(this));
//     this.resizeObserver?.disconnect();
//     this.intersectionObserver?.disconnect();
//     document.removeEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );

//     this.clear();
//     this.postprocessing?.dispose();
//     this.renderer.dispose();
//     this.isDisposed = true;
//   }
// }

// /* ======================================================================= */
// /*                              ФИЗИКА ШАРОВ                               */
// /* ======================================================================= */

// interface PhysicsConfig {
//   count: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   maxSize: number;
//   minSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// class PhysicsSystem {
//   config: PhysicsConfig;
//   positionData: Float32Array;
//   velocityData: Float32Array;
//   sizeData: Float32Array;
//   center: Vector3 = new Vector3();

//   constructor(config: PhysicsConfig) {
//     this.config = { ...config };
//     this.positionData = new Float32Array(3 * config.count).fill(0);
//     this.velocityData = new Float32Array(3 * config.count).fill(0);
//     this.sizeData = new Float32Array(config.count).fill(1);
//     this.center = new Vector3();

//     this.initPositions();
//     this.setSizes();
//   }

//   private initPositions() {
//     const { config, positionData } = this;

//     this.center.toArray(positionData, 0);

//     for (let i = 1; i < config.count; i += 1) {
//       const idx = 3 * i;
//       positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   setSizes() {
//     const { config, sizeData } = this;

//     sizeData[0] = config.size0;
//     for (let i = 1; i < config.count; i += 1) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     const { config, center, positionData, sizeData, velocityData } = this;

//     let startIdx = 0;

//     const tmpPos = new Vector3();
//     const tmpVel = new Vector3();
//     const diff = new Vector3();
//     const otherPos = new Vector3();
//     const otherVel = new Vector3();

//     if (config.controlSphere0) {
//       startIdx = 1;
//       tmpPos.fromArray(positionData, 0);
//       tmpPos.lerp(center, 0.12).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }

//     // обновляем позиции
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       // гравитация
//       tmpVel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
//       // трение
//       tmpVel.multiplyScalar(config.friction);
//       // ограничение скорости
//       tmpVel.clampLength(0, config.maxVelocity);

//       tmpPos.add(tmpVel);

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }

//     // столкновения и стены
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       const radius = sizeData[idx];

//       for (let j = idx + 1; j < config.count; j += 1) {
//         const otherBase = 3 * j;
//         otherPos.fromArray(positionData, otherBase);
//         otherVel.fromArray(velocityData, otherBase);

//         diff.copy(otherPos).sub(tmpPos);
//         const dist = diff.length();
//         const sumRadius = radius + sizeData[j];

//         if (dist < sumRadius && dist > 0.0001) {
//           const overlap = sumRadius - dist;
//           const correction = diff.normalize().multiplyScalar(0.5 * overlap);

//           const velMag = Math.max(tmpVel.length(), 1);
//           const otherVelMag = Math.max(otherVel.length(), 1);

//           tmpPos.sub(correction);
//           tmpVel.sub(correction.clone().multiplyScalar(velMag));

//           otherPos.add(correction);
//           otherVel.add(correction.clone().multiplyScalar(otherVelMag));

//           tmpPos.toArray(positionData, base);
//           tmpVel.toArray(velocityData, base);

//           otherPos.toArray(positionData, otherBase);
//           otherVel.toArray(velocityData, otherBase);
//         }
//       }

//       // отталкивание от шара 0
//       if (config.controlSphere0) {
//         diff.fromArray(positionData, 0).sub(tmpPos);
//         const d = diff.length();
//         const sumRadius0 = radius + sizeData[0];
//         if (d < sumRadius0 && d > 0.0001) {
//           const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
//           const velCorrection = correction
//             .clone()
//             .multiplyScalar(Math.max(tmpVel.length(), 2));
//           tmpPos.sub(correction);
//           tmpVel.sub(velCorrection);
//         }
//       }

//       // стены по X
//       if (Math.abs(tmpPos.x) + radius > config.maxX) {
//         tmpPos.x = Math.sign(tmpPos.x) * (config.maxX - radius);
//         tmpVel.x = -tmpVel.x * config.wallBounce;
//       }

//       // по Y
//       if (config.gravity === 0) {
//         if (Math.abs(tmpPos.y) + radius > config.maxY) {
//           tmpPos.y = Math.sign(tmpPos.y) * (config.maxY - radius);
//           tmpVel.y = -tmpVel.y * config.wallBounce;
//         }
//       } else if (tmpPos.y - radius < -config.maxY) {
//         tmpPos.y = -config.maxY + radius;
//         tmpVel.y = -tmpVel.y * config.wallBounce;
//       }

//       // по Z
//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(tmpPos.z) + radius > maxBoundary) {
//         tmpPos.z = Math.sign(tmpPos.z) * (config.maxZ - radius);
//         tmpVel.z = -tmpVel.z * config.wallBounce;
//       }

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }
//   }
// }

// /* ======================================================================= */
// /*                     МАТЕРИАЛ С ПОЛУПРОЗРАЧНЫМ СВЕЧЕНИЕМ                 */
// /* ======================================================================= */

// class ScatteringMaterial extends MeshPhysicalMaterial {
//   uniforms: Record<string, { value: number }> = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2 },
//     thicknessScale: { value: 10 },
//   };

//   // ИСПРАВЛЕНИЕ: явно объявляем свойство defines
//   defines?: Record<string, string>;
//   onBeforeCompile2?: (shader: Shader) => void;

//   constructor(params: MeshPhysicalMaterialParameters & { envMap: Texture }) {
//     super(params);

//     this.defines = this.defines || {};
//     this.defines.USE_UV = "";

//     this.onBeforeCompile = (shaderData: unknown) => {
//       const shader = shaderData as Shader;
      
//       Object.assign(shader.uniforms, this.uniforms);

//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//         ` + shader.fragmentShader;

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "void main() {",
//         `
//         void RE_Direct_Scattering(
//           const in IncidentLight directLight,
//           const in vec2 uv,
//           const in vec3 geometryPosition,
//           const in vec3 geometryNormal,
//           const in vec3 geometryViewDir,
//           const in vec3 geometryClearcoatNormal,
//           inout ReflectedLight reflectedLight
//         ) {
//           vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;

//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif

//           reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//         `
//       );

//       const lightsChunkOriginal = ShaderChunk.lights_fragment_begin as string;
//       const lightsChunk = lightsChunkOriginal.replace(
//         "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
//         `
//           RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
//           RE_Direct_Scattering( directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight );
//         `
//       );

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "#include <lights_fragment_begin>",
//         lightsChunk
//       );

//       if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
//     };
//   }
// }

// /* ======================================================================= */
// /*                           КОНФИГ БОЛЬШОГО ПИТА                          */
// /* ======================================================================= */

// interface BallpitConfig {
//   count: number;
//   colors: number[];
//   ambientColor: number;
//   ambientIntensity: number;
//   lightIntensity: number;
//   materialParams: {
//     metalness: number;
//     roughness: number;
//     clearcoat: number;
//     clearcoatRoughness: number;
//   };
//   minSize: number;
//   maxSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// const defaultBallpitConfig: BallpitConfig = {
//   count: 220,
//   colors: [0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xffffff],
//   ambientColor: 0xffffff,
//   ambientIntensity: 1.1,
//   lightIntensity: 220,
//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.35,
//     clearcoat: 1,
//     clearcoatRoughness: 0.18,
//   },
//   minSize: 0.6,
//   maxSize: 1.1,
//   size0: 1.1,
//   gravity: 0.45,
//   friction: 0.995,
//   wallBounce: 0.96,
//   maxVelocity: 0.17,
//   maxX: 5,
//   maxY: 4,
//   maxZ: 2.3,
//   controlSphere0: false,
//   followCursor: true,
// };

// const tempObject = new Object3D();

// /* ======================================================================= */
// /*                            Pointer helper                                */
// /* ======================================================================= */

// interface PointerData {
//   position: Vector2;
//   nPosition: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (data: PointerData) => void;
//   onMove: (data: PointerData) => void;
//   onClick: (data: PointerData) => void;
//   onLeave: (data: PointerData) => void;
//   dispose: () => void;
// }

// const pointerPosition = new Vector2();
// const pointerMap = new Map<HTMLElement, PointerData>();
// let globalPointerActive = false;

// function isInside(rect: DOMRect): boolean {
//   return (
//     pointerPosition.x >= rect.left &&
//     pointerPosition.x <= rect.left + rect.width &&
//     pointerPosition.y >= rect.top &&
//     pointerPosition.y <= rect.top + rect.height
//   );
// }

// function updatePointerData(data: PointerData, rect: DOMRect) {
//   data.position.set(
//     pointerPosition.x - rect.left,
//     pointerPosition.y - rect.top
//   );
//   data.nPosition.set(
//     (data.position.x / rect.width) * 2 - 1,
//     (-data.position.y / rect.height) * 2 + 1
//   );
// }

// function handlePointerMove() {
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && !data.touching) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerMove(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   handlePointerMove();
// }

// function onPointerLeave() {
//   for (const data of pointerMap.values()) {
//     if (data.hover) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerClick(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) data.onClick(data);
//   }
// }

// function onTouchStart(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       data.touching = true;
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     }
//   }
// }

// function onTouchMove(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) {
//       if (!data.hover) {
//         data.hover = true;
//         data.touching = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && data.touching) {
//       data.onMove(data);
//     }
//   }
// }

// function onTouchEnd() {
//   for (const data of pointerMap.values()) {
//     if (data.touching) {
//       data.touching = false;
//       if (data.hover) {
//         data.hover = false;
//         data.onLeave(data);
//       }
//     }
//   }
// }

// function ensureGlobalPointerListeners() {
//   if (globalPointerActive) return;
//   document.body.addEventListener("pointermove", onPointerMove as EventListener);
//   document.body.addEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.addEventListener("click", onPointerClick as EventListener);

//   document.body.addEventListener("touchstart", onTouchStart as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchmove", onTouchMove as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchend", onTouchEnd as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchcancel", onTouchEnd as EventListener, {
//     passive: false,
//   });

//   globalPointerActive = true;
// }

// function cleanupGlobalPointerListeners() {
//   if (!globalPointerActive) return;

//   document.body.removeEventListener(
//     "pointermove",
//     onPointerMove as EventListener
//   );
//   document.body.removeEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.removeEventListener("click", onPointerClick as EventListener);

//   document.body.removeEventListener(
//     "touchstart",
//     onTouchStart as EventListener
//   );
//   document.body.removeEventListener("touchmove", onTouchMove as EventListener);
//   document.body.removeEventListener("touchend", onTouchEnd as EventListener);
//   document.body.removeEventListener(
//     "touchcancel",
//     onTouchEnd as EventListener
//   );

//   globalPointerActive = false;
// }

// function createPointerData(domElement: HTMLElement): PointerData {
//   const data: PointerData = {
//     position: new Vector2(),
//     nPosition: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onClick: () => {},
//     onLeave: () => {},
//     dispose: () => {},
//   };

//   pointerMap.set(domElement, data);
//   ensureGlobalPointerListeners();

//   data.dispose = () => {
//     pointerMap.delete(domElement);
//     if (pointerMap.size === 0) {
//       cleanupGlobalPointerListeners();
//     }
//   };

//   return data;
// }

// /* ======================================================================= */
// /*                             INSTANCED ШАРЫ                               */
// /* ======================================================================= */

// class Spheres extends InstancedMesh {
//   config: BallpitConfig;
//   physics: PhysicsSystem;
//   ambientLight: AmbientLight;
//   light: PointLight;

//   constructor(renderer: WebGLRenderer, params: Partial<BallpitConfig> = {}) {
//     const config: BallpitConfig = {
//       ...defaultBallpitConfig,
//       ...params,
//     };

//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envRT = pmrem.fromScene(roomEnv);
//     const envTexture = envRT.texture as Texture;

//     const geometry = new SphereGeometry(1, 32, 32);
//     const material = new ScatteringMaterial({
//       envMap: envTexture,
//       ...config.materialParams,
//       transmission: 0.96,
//       ior: 1.3,
//       thickness: 1.2,
//     });

//     material.envMapRotation.x = -Math.PI / 2;

//     super(geometry, material, config.count);

//     this.config = config;
//     this.physics = new PhysicsSystem(config);
//     this.ambientLight = new AmbientLight(
//       this.config.ambientColor,
//       this.config.ambientIntensity
//     );
//     this.light = new PointLight(
//       this.config.colors[0],
//       this.config.lightIntensity
//     );

//     this.add(this.ambientLight);
//     this.add(this.light);

//     this.setColors(config.colors);
//   }

//   setColors(colors: readonly number[]) {
//     const colorObjects: Color[] = colors.map((c) => new Color(c));

//     const getColorAt = (ratio: number, out: Color): Color => {
//       const clamped = Math.min(1, Math.max(0, ratio));
//       const scaled = clamped * (colorObjects.length - 1);
//       const idx = Math.floor(scaled);

//       const start = colorObjects[idx];
//       if (idx >= colorObjects.length - 1) {
//         return out.copy(start);
//       }

//       const alpha = scaled - idx;
//       const end = colorObjects[idx + 1];

//       out.r = start.r + alpha * (end.r - start.r);
//       out.g = start.g + alpha * (end.g - start.g);
//       out.b = start.b + alpha * (end.b - start.b);

//       return out;
//     };

//     const tmpColor = new Color();

//     for (let i = 0; i < this.count; i += 1) {
//       this.setColorAt(i, getColorAt(i / this.count, tmpColor));
//       if (i === 0) {
//         this.light.color.copy(tmpColor);
//       }
//     }

//     if (this.instanceColor) {
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     this.physics.update(deltaInfo);

//     for (let idx = 0; idx < this.count; idx += 1) {
//       tempObject.position.fromArray(this.physics.positionData, 3 * idx);

//       if (idx === 0 && !this.config.followCursor) {
//         tempObject.scale.setScalar(0);
//       } else {
//         tempObject.scale.setScalar(this.physics.sizeData[idx]);
//       }

//       tempObject.updateMatrix();
//       this.setMatrixAt(idx, tempObject.matrix);

//       if (idx === 0) {
//         this.light.position.copy(tempObject.position);
//       }
//     }

//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// /* ======================================================================= */
// /*                      ФАБРИКА: СОЗДАНИЕ ПОЛЯ СФЕР                         */
// /* ======================================================================= */

// interface BallpitInstance {
//   three: ThreeWrapper;
//   readonly spheres: Spheres;
//   setCount(count: number): void;
//   togglePause(): void;
//   dispose(): void;
// }

// function createBallpit(
//   canvas: HTMLCanvasElement,
//   config: Partial<BallpitConfig> = {}
// ): BallpitInstance {
//   const threeInstance = new ThreeWrapper({
//     canvas,
//     size: "parent",
//     rendererOptions: { antialias: true, alpha: true },
//   });

//   threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
//   threeInstance.camera.position.set(0, 0, 18);
//   threeInstance.camera.lookAt(0, 0, 0);
//   threeInstance.cameraMaxAspect = 1.5;
//   threeInstance.resize();

//   let spheres: Spheres = new Spheres(threeInstance.renderer, config);
//   threeInstance.scene.add(spheres);

//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();
//   let isPaused = false;

//   const pointerData = createPointerData(canvas);

//   pointerData.onMove = (data) => {
//     raycaster.setFromCamera(data.nPosition, threeInstance.camera);
//     threeInstance.camera.getWorldDirection(plane.normal);
//     raycaster.ray.intersectPlane(plane, intersectionPoint);

//     gsap.to(spheres.physics.center, {
//       x: intersectionPoint.x,
//       y: intersectionPoint.y,
//       z: intersectionPoint.z,
//       duration: 0.35,
//       ease: "power2.out",
//     });

//     spheres.config.controlSphere0 = true;
//   };

//   pointerData.onLeave = () => {
//     spheres.config.controlSphere0 = false;
//   };

//   canvas.style.touchAction = "none";
//   canvas.style.userSelect = "none";
//   (canvas.style as { webkitUserSelect?: string }).webkitUserSelect = "none";

//   threeInstance.onBeforeRender = (deltaInfo) => {
//     if (!isPaused) spheres.update(deltaInfo);
//   };

//   threeInstance.onAfterResize = (size) => {
//     spheres.config.maxX = size.wWidth / 2;
//     spheres.config.maxY = size.wHeight / 2;
//   };

//   const initSpheres = (newConfig: BallpitConfig) => {
//     threeInstance.clear();
//     threeInstance.scene.remove(spheres);
//     spheres = new Spheres(threeInstance.renderer, newConfig);
//     threeInstance.scene.add(spheres);
//   };

//   return {
//     three: threeInstance,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initSpheres({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       pointerData.dispose();
//       threeInstance.dispose();
//     },
//   };
// }

// /* ======================================================================= */
// /*                           REACT-КОМПОНЕНТ                               */
// /* ======================================================================= */

// // ИСПРАВЛЕНИЕ: расширяем BallpitProps всеми физическими параметрами
// export interface BallpitProps {
//   className?: string;
//   followCursor?: boolean;
//   colors?: number[];
//   count?: number;
//   // Добавляем физические параметры
//   gravity?: number;
//   friction?: number;
//   wallBounce?: number;
//   maxVelocity?: number;
//   minSize?: number;
//   maxSize?: number;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   className,
//   followCursor = true,
//   colors,
//   count,
//   gravity,
//   friction,
//   wallBounce,
//   maxVelocity,
//   minSize,
//   maxSize,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const instanceRef = useRef<BallpitInstance | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     instanceRef.current = createBallpit(canvas, {
//       followCursor,
//       ...(colors ? { colors } : {}),
//       ...(typeof count === "number" ? { count } : {}),
//       ...(typeof gravity === "number" ? { gravity } : {}),
//       ...(typeof friction === "number" ? { friction } : {}),
//       ...(typeof wallBounce === "number" ? { wallBounce } : {}),
//       ...(typeof maxVelocity === "number" ? { maxVelocity } : {}),
//       ...(typeof minSize === "number" ? { minSize } : {}),
//       ...(typeof maxSize === "number" ? { maxSize } : {}),
//     });

//     return () => {
//       instanceRef.current?.dispose();
//     };
//   }, [followCursor, colors, count, gravity, friction, wallBounce, maxVelocity, minSize, maxSize]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// };

// export default Ballpit;


// // src/components/Ballpit.tsx
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   ACESFilmicToneMapping,
//   AmbientLight,
//   Clock,
//   Color,
//   InstancedMesh,
//   MathUtils,
//   MeshPhysicalMaterial,
//   MeshPhysicalMaterialParameters,
//   Object3D,
//   PerspectiveCamera,
//   Plane,
//   PMREMGenerator,
//   PointLight,
//   Raycaster,
//   Scene,
//   ShaderChunk,
//   SphereGeometry,
//   SRGBColorSpace,
//   Texture,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
//   WebGLRendererParameters,
// } from "three";
// import { RoomEnvironment } from "three/examples/jsm/Addons.js";
// import { gsap } from "gsap";

// /* ======================================================================= */
// /*                               ТИПЫ / ВСПОМОГАШКИ                        */
// /* ======================================================================= */

// interface Shader {
//   uniforms: Record<string, { value: unknown }>;
//   fragmentShader: string;
//   vertexShader: string;
// }

// interface SizeData {
//   width: number;
//   height: number;
//   wWidth: number;
//   wHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// interface ThreeWrapperConfig {
//   canvas?: HTMLCanvasElement;
//   id?: string;
//   rendererOptions?: Partial<WebGLRendererParameters>;
//   size?: "parent" | { width: number; height: number };
// }

// interface PostprocessingLike {
//   setSize(width: number, height: number): void;
//   render(): void;
//   dispose(): void;
// }

// interface AnimationState {
//   elapsed: number;
//   delta: number;
// }

// /* ======================================================================= */
// /*                             ОБЁРТКА ВОКРУГ THREE                        */
// /* ======================================================================= */

// class ThreeWrapper {
//   private config: ThreeWrapperConfig;
//   private postprocessing?: PostprocessingLike;
//   private resizeObserver?: ResizeObserver;
//   private intersectionObserver?: IntersectionObserver;
//   private resizeTimer?: number;
//   private animationFrameId = 0;
//   private clock: Clock = new Clock();
//   private isAnimating = false;
//   private isVisible = false;

//   canvas!: HTMLCanvasElement;
//   camera!: PerspectiveCamera;
//   cameraMinAspect?: number;
//   cameraMaxAspect?: number;
//   cameraFov!: number;
//   maxPixelRatio?: number;
//   minPixelRatio?: number;
//   scene!: Scene;
//   renderer!: WebGLRenderer;

//   size: SizeData = {
//     width: 0,
//     height: 0,
//     wWidth: 0,
//     wHeight: 0,
//     ratio: 0,
//     pixelRatio: 0,
//   };

//   animationState: AnimationState = { elapsed: 0, delta: 0 };

//   render: () => void = this.innerRender.bind(this);
//   onBeforeRender: (state: AnimationState) => void = () => {};
//   onAfterRender: (state: AnimationState) => void = () => {};
//   onAfterResize: (size: SizeData) => void = () => {};
//   isDisposed = false;

//   constructor(config: ThreeWrapperConfig) {
//     this.config = { ...config };
//     this.initCamera();
//     this.initScene();
//     this.initRenderer();
//     this.resize();
//     this.initObservers();
//   }

//   private initCamera() {
//     this.camera = new PerspectiveCamera();
//     this.cameraFov = this.camera.fov;
//   }

//   private initScene() {
//     this.scene = new Scene();
//   }

//   private initRenderer() {
//     if (this.config.canvas) {
//       this.canvas = this.config.canvas;
//     } else if (this.config.id) {
//       const elem = document.getElementById(this.config.id);
//       if (elem instanceof HTMLCanvasElement) {
//         this.canvas = elem;
//       } else {
//         throw new Error("ThreeWrapper: element with given id is not a canvas");
//       }
//     } else {
//       throw new Error("ThreeWrapper: canvas or id must be provided");
//     }

//     this.canvas.style.display = "block";

//     const rendererOptions: WebGLRendererParameters = {
//       canvas: this.canvas,
//       powerPreference: "high-performance",
//       ...(this.config.rendererOptions ?? {}),
//     };

//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;
//   }

//   private initObservers() {
//     if (!(this.config.size instanceof Object)) {
//       const resizeHandler = this.onResize.bind(this);
//       window.addEventListener("resize", resizeHandler);

//       if (this.config.size === "parent" && this.canvas.parentNode) {
//         this.resizeObserver = new ResizeObserver(resizeHandler);
//         this.resizeObserver.observe(this.canvas.parentNode as Element);
//       }
//     }

//     this.intersectionObserver = new IntersectionObserver(
//       this.onIntersection.bind(this),
//       { root: null, rootMargin: "0px", threshold: 0 }
//     );
//     this.intersectionObserver.observe(this.canvas);

//     document.addEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );
//   }

//   private onResize() {
//     if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
//     this.resizeTimer = window.setTimeout(() => this.resize(), 80);
//   }

//   resize() {
//     let w: number;
//     let h: number;

//     if (this.config.size && this.config.size !== "parent") {
//       w = this.config.size.width;
//       h = this.config.size.height;
//     } else if (this.config.size === "parent" && this.canvas.parentNode) {
//       const parent = this.canvas.parentNode as HTMLElement;
//       w = parent.offsetWidth;
//       h = parent.offsetHeight;
//     } else {
//       w = window.innerWidth;
//       h = window.innerHeight;
//     }

//     this.size.width = w;
//     this.size.height = h;
//     this.size.ratio = w / h;

//     this.updateCamera();
//     this.updateRenderer();
//     this.onAfterResize(this.size);
//   }

//   private updateCamera() {
//     this.camera.aspect = this.size.width / this.size.height;

//     if (this.camera.isPerspectiveCamera && this.cameraFov) {
//       if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
//         this.adjustFov(this.cameraMinAspect);
//       } else if (
//         this.cameraMaxAspect &&
//         this.camera.aspect > this.cameraMaxAspect
//       ) {
//         this.adjustFov(this.cameraMaxAspect);
//       } else {
//         this.camera.fov = this.cameraFov;
//       }
//     }

//     this.camera.updateProjectionMatrix();
//     this.updateWorldSize();
//   }

//   private adjustFov(aspect: number) {
//     const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
//     const newTan = tanFov / (this.camera.aspect / aspect);
//     this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
//   }

//   updateWorldSize() {
//     const fovRad = (this.camera.fov * Math.PI) / 180;
//     this.size.wHeight =
//       2 * Math.tan(fovRad / 2) * this.camera.position.length();
//     this.size.wWidth = this.size.wHeight * this.camera.aspect;
//   }

//   private updateRenderer() {
//     this.renderer.setSize(this.size.width, this.size.height);
//     if (this.postprocessing) {
//       this.postprocessing.setSize(this.size.width, this.size.height);
//     }

//     let pr = window.devicePixelRatio;
//     if (this.maxPixelRatio && pr > this.maxPixelRatio) {
//       pr = this.maxPixelRatio;
//     } else if (this.minPixelRatio && pr < this.minPixelRatio) {
//       pr = this.minPixelRatio;
//     }

//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;
//   }

//   get postProcessing(): PostprocessingLike | undefined {
//     return this.postprocessing;
//   }

//   set postProcessing(value: PostprocessingLike | undefined) {
//     this.postprocessing = value;
//     if (value) {
//       this.render = value.render.bind(value);
//     } else {
//       this.render = this.innerRender.bind(this);
//     }
//   }

//   private onIntersection(entries: IntersectionObserverEntry[]) {
//     const isIntersecting = entries[0]?.isIntersecting ?? false;
//     this.isAnimating = isIntersecting;
//     if (isIntersecting) {
//       this.startAnimation();
//     } else {
//       this.stopAnimation();
//     }
//   }

//   private onVisibilityChange() {
//     if (!this.isAnimating) return;
//     if (document.hidden) {
//       this.stopAnimation();
//     } else {
//       this.startAnimation();
//     }
//   }

//   private startAnimation() {
//     if (this.isVisible) return;

//     const animateFrame = () => {
//       this.animationFrameId = window.requestAnimationFrame(animateFrame);
//       this.animationState.delta = this.clock.getDelta();
//       this.animationState.elapsed += this.animationState.delta;

//       this.onBeforeRender(this.animationState);
//       this.render();
//       this.onAfterRender(this.animationState);
//     };

//     this.isVisible = true;
//     this.clock.start();
//     animateFrame();
//   }

//   private stopAnimation() {
//     if (!this.isVisible) return;
//     window.cancelAnimationFrame(this.animationFrameId);
//     this.isVisible = false;
//     this.clock.stop();
//   }

//   private innerRender() {
//     this.renderer.render(this.scene, this.camera);
//   }

//   clear() {
//     this.scene.traverse((obj) => {
//       const anyObj = obj as {
//         isMesh?: boolean;
//         material?: unknown;
//         geometry?: { dispose: () => void };
//       };

//       if (!anyObj.isMesh || !anyObj.material || !anyObj.geometry) return;

//       const mat = anyObj.material as {
//         dispose?: () => void;
//         [key: string]: unknown;
//       };

//       Object.values(mat).forEach((val) => {
//         const maybeDisposable = val as { dispose?: () => void };
//         if (maybeDisposable && typeof maybeDisposable.dispose === "function") {
//           maybeDisposable.dispose();
//         }
//       });

//       if (typeof mat.dispose === "function") {
//         mat.dispose();
//       }

//       anyObj.geometry.dispose();
//     });

//     this.scene.clear();
//   }

//   dispose() {
//     this.stopAnimation();

//     window.removeEventListener("resize", this.onResize.bind(this));
//     this.resizeObserver?.disconnect();
//     this.intersectionObserver?.disconnect();
//     document.removeEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );

//     this.clear();
//     this.postprocessing?.dispose();
//     this.renderer.dispose();
//     this.isDisposed = true;
//   }
// }

// /* ======================================================================= */
// /*                              ФИЗИКА ШАРОВ                               */
// /* ======================================================================= */

// interface PhysicsConfig {
//   count: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   maxSize: number;
//   minSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// class PhysicsSystem {
//   config: PhysicsConfig;
//   positionData: Float32Array;
//   velocityData: Float32Array;
//   sizeData: Float32Array;
//   center: Vector3 = new Vector3();

//   constructor(config: PhysicsConfig) {
//     this.config = { ...config };
//     this.positionData = new Float32Array(3 * config.count).fill(0);
//     this.velocityData = new Float32Array(3 * config.count).fill(0);
//     this.sizeData = new Float32Array(config.count).fill(1);
//     this.center = new Vector3();

//     this.initPositions();
//     this.setSizes();
//   }

//   private initPositions() {
//     const { config, positionData } = this;

//     this.center.toArray(positionData, 0);

//     for (let i = 1; i < config.count; i += 1) {
//       const idx = 3 * i;
//       positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   setSizes() {
//     const { config, sizeData } = this;

//     sizeData[0] = config.size0;
//     for (let i = 1; i < config.count; i += 1) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     const { config, center, positionData, sizeData, velocityData } = this;

//     let startIdx = 0;

//     const tmpPos = new Vector3();
//     const tmpVel = new Vector3();
//     const diff = new Vector3();
//     const otherPos = new Vector3();
//     const otherVel = new Vector3();

//     if (config.controlSphere0) {
//       startIdx = 1;
//       tmpPos.fromArray(positionData, 0);
//       tmpPos.lerp(center, 0.12).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }

//     // обновляем позиции
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       // гравитация
//       tmpVel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
//       // трение
//       tmpVel.multiplyScalar(config.friction);
//       // ограничение скорости
//       tmpVel.clampLength(0, config.maxVelocity);

//       tmpPos.add(tmpVel);

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }

//     // столкновения и стены
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       const radius = sizeData[idx];

//       for (let j = idx + 1; j < config.count; j += 1) {
//         const otherBase = 3 * j;
//         otherPos.fromArray(positionData, otherBase);
//         otherVel.fromArray(velocityData, otherBase);

//         diff.copy(otherPos).sub(tmpPos);
//         const dist = diff.length();
//         const sumRadius = radius + sizeData[j];

//         if (dist < sumRadius && dist > 0.0001) {
//           const overlap = sumRadius - dist;
//           const correction = diff.normalize().multiplyScalar(0.5 * overlap);

//           const velMag = Math.max(tmpVel.length(), 1);
//           const otherVelMag = Math.max(otherVel.length(), 1);

//           tmpPos.sub(correction);
//           tmpVel.sub(correction.clone().multiplyScalar(velMag));

//           otherPos.add(correction);
//           otherVel.add(correction.clone().multiplyScalar(otherVelMag));

//           tmpPos.toArray(positionData, base);
//           tmpVel.toArray(velocityData, base);

//           otherPos.toArray(positionData, otherBase);
//           otherVel.toArray(velocityData, otherBase);
//         }
//       }

//       // отталкивание от шара 0
//       if (config.controlSphere0) {
//         diff.fromArray(positionData, 0).sub(tmpPos);
//         const d = diff.length();
//         const sumRadius0 = radius + sizeData[0];
//         if (d < sumRadius0 && d > 0.0001) {
//           const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
//           const velCorrection = correction
//             .clone()
//             .multiplyScalar(Math.max(tmpVel.length(), 2));
//           tmpPos.sub(correction);
//           tmpVel.sub(velCorrection);
//         }
//       }

//       // стены по X
//       if (Math.abs(tmpPos.x) + radius > config.maxX) {
//         tmpPos.x = Math.sign(tmpPos.x) * (config.maxX - radius);
//         tmpVel.x = -tmpVel.x * config.wallBounce;
//       }

//       // по Y
//       if (config.gravity === 0) {
//         if (Math.abs(tmpPos.y) + radius > config.maxY) {
//           tmpPos.y = Math.sign(tmpPos.y) * (config.maxY - radius);
//           tmpVel.y = -tmpVel.y * config.wallBounce;
//         }
//       } else if (tmpPos.y - radius < -config.maxY) {
//         tmpPos.y = -config.maxY + radius;
//         tmpVel.y = -tmpVel.y * config.wallBounce;
//       }

//       // по Z
//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(tmpPos.z) + radius > maxBoundary) {
//         tmpPos.z = Math.sign(tmpPos.z) * (config.maxZ - radius);
//         tmpVel.z = -tmpVel.z * config.wallBounce;
//       }

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }
//   }
// }

// /* ======================================================================= */
// /*                     МАТЕРИАЛ С ПОЛУПРОЗРАЧНЫМ СВЕЧЕНИЕМ                 */
// /* ======================================================================= */

// class ScatteringMaterial extends MeshPhysicalMaterial {
//   uniforms: Record<string, { value: number }> = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2 },
//     thicknessScale: { value: 10 },
//   };

//   onBeforeCompile2?: (shader: Shader) => void;

//   constructor(params: MeshPhysicalMaterialParameters & { envMap: Texture }) {
//     super(params);

//     this.defines = this.defines || {};
//     this.defines.USE_UV = "";

//     this.onBeforeCompile = (shaderData: unknown) => {
//       const shader = shaderData as Shader;
      
//       Object.assign(shader.uniforms, this.uniforms);

//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//         ` + shader.fragmentShader;

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "void main() {",
//         `
//         void RE_Direct_Scattering(
//           const in IncidentLight directLight,
//           const in vec2 uv,
//           const in vec3 geometryPosition,
//           const in vec3 geometryNormal,
//           const in vec3 geometryViewDir,
//           const in vec3 geometryClearcoatNormal,
//           inout ReflectedLight reflectedLight
//         ) {
//           vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;

//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif

//           reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//         `
//       );

//       const lightsChunkOriginal = ShaderChunk.lights_fragment_begin as string;
//       const lightsChunk = lightsChunkOriginal.replace(
//         "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
//         `
//           RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
//           RE_Direct_Scattering( directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight );
//         `
//       );

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "#include <lights_fragment_begin>",
//         lightsChunk
//       );

//       if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
//     };
//   }
// }

// /* ======================================================================= */
// /*                           КОНФИГ БОЛЬШОГО ПИТА                          */
// /* ======================================================================= */

// interface BallpitConfig {
//   count: number;
//   colors: number[];
//   ambientColor: number;
//   ambientIntensity: number;
//   lightIntensity: number;
//   materialParams: {
//     metalness: number;
//     roughness: number;
//     clearcoat: number;
//     clearcoatRoughness: number;
//   };
//   minSize: number;
//   maxSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// const defaultBallpitConfig: BallpitConfig = {
//   count: 220,
//   colors: [0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xffffff],
//   ambientColor: 0xffffff,
//   ambientIntensity: 1.1,
//   lightIntensity: 220,
//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.35,
//     clearcoat: 1,
//     clearcoatRoughness: 0.18,
//   },
//   minSize: 0.6,
//   maxSize: 1.1,
//   size0: 1.1,
//   gravity: 0.45,
//   friction: 0.995,
//   wallBounce: 0.96,
//   maxVelocity: 0.17,
//   maxX: 5,
//   maxY: 4,
//   maxZ: 2.3,
//   controlSphere0: false,
//   followCursor: true,
// };

// const tempObject = new Object3D();

// /* ======================================================================= */
// /*                            Pointer helper                                */
// /* ======================================================================= */

// interface PointerData {
//   position: Vector2;
//   nPosition: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (data: PointerData) => void;
//   onMove: (data: PointerData) => void;
//   onClick: (data: PointerData) => void;
//   onLeave: (data: PointerData) => void;
//   dispose: () => void;
// }

// const pointerPosition = new Vector2();
// const pointerMap = new Map<HTMLElement, PointerData>();
// let globalPointerActive = false;

// function isInside(rect: DOMRect): boolean {
//   return (
//     pointerPosition.x >= rect.left &&
//     pointerPosition.x <= rect.left + rect.width &&
//     pointerPosition.y >= rect.top &&
//     pointerPosition.y <= rect.top + rect.height
//   );
// }

// function updatePointerData(data: PointerData, rect: DOMRect) {
//   data.position.set(
//     pointerPosition.x - rect.left,
//     pointerPosition.y - rect.top
//   );
//   data.nPosition.set(
//     (data.position.x / rect.width) * 2 - 1,
//     (-data.position.y / rect.height) * 2 + 1
//   );
// }

// function handlePointerMove() {
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && !data.touching) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerMove(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   handlePointerMove();
// }

// function onPointerLeave() {
//   for (const data of pointerMap.values()) {
//     if (data.hover) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerClick(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) data.onClick(data);
//   }
// }

// function onTouchStart(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       data.touching = true;
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     }
//   }
// }

// function onTouchMove(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) {
//       if (!data.hover) {
//         data.hover = true;
//         data.touching = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && data.touching) {
//       data.onMove(data);
//     }
//   }
// }

// function onTouchEnd() {
//   for (const data of pointerMap.values()) {
//     if (data.touching) {
//       data.touching = false;
//       if (data.hover) {
//         data.hover = false;
//         data.onLeave(data);
//       }
//     }
//   }
// }

// function ensureGlobalPointerListeners() {
//   if (globalPointerActive) return;
//   document.body.addEventListener("pointermove", onPointerMove as EventListener);
//   document.body.addEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.addEventListener("click", onPointerClick as EventListener);

//   document.body.addEventListener("touchstart", onTouchStart as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchmove", onTouchMove as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchend", onTouchEnd as EventListener, {
//     passive: false,
//   });
//   document.body.addEventListener("touchcancel", onTouchEnd as EventListener, {
//     passive: false,
//   });

//   globalPointerActive = true;
// }

// function cleanupGlobalPointerListeners() {
//   if (!globalPointerActive) return;

//   document.body.removeEventListener(
//     "pointermove",
//     onPointerMove as EventListener
//   );
//   document.body.removeEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.removeEventListener("click", onPointerClick as EventListener);

//   document.body.removeEventListener(
//     "touchstart",
//     onTouchStart as EventListener
//   );
//   document.body.removeEventListener("touchmove", onTouchMove as EventListener);
//   document.body.removeEventListener("touchend", onTouchEnd as EventListener);
//   document.body.removeEventListener(
//     "touchcancel",
//     onTouchEnd as EventListener
//   );

//   globalPointerActive = false;
// }

// function createPointerData(domElement: HTMLElement): PointerData {
//   const data: PointerData = {
//     position: new Vector2(),
//     nPosition: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onClick: () => {},
//     onLeave: () => {},
//     dispose: () => {},
//   };

//   pointerMap.set(domElement, data);
//   ensureGlobalPointerListeners();

//   data.dispose = () => {
//     pointerMap.delete(domElement);
//     if (pointerMap.size === 0) {
//       cleanupGlobalPointerListeners();
//     }
//   };

//   return data;
// }

// /* ======================================================================= */
// /*                             INSTANCED ШАРЫ                               */
// /* ======================================================================= */

// class Spheres extends InstancedMesh {
//   config: BallpitConfig;
//   physics: PhysicsSystem;
//   ambientLight: AmbientLight;
//   light: PointLight;

//   constructor(renderer: WebGLRenderer, params: Partial<BallpitConfig> = {}) {
//     const config: BallpitConfig = {
//       ...defaultBallpitConfig,
//       ...params,
//     };

//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envRT = pmrem.fromScene(roomEnv);
//     const envTexture = envRT.texture as Texture;

//     const geometry = new SphereGeometry(1, 32, 32);
//     const material = new ScatteringMaterial({
//       envMap: envTexture,
//       ...config.materialParams,
//       transmission: 0.96,
//       ior: 1.3,
//       thickness: 1.2,
//     });

//     material.envMapRotation.x = -Math.PI / 2;

//     super(geometry, material, config.count);

//     this.config = config;
//     this.physics = new PhysicsSystem(config);
//     this.ambientLight = new AmbientLight(
//       this.config.ambientColor,
//       this.config.ambientIntensity
//     );
//     this.light = new PointLight(
//       this.config.colors[0],
//       this.config.lightIntensity
//     );

//     this.add(this.ambientLight);
//     this.add(this.light);

//     this.setColors(config.colors);
//   }

//   setColors(colors: readonly number[]) {
//     const colorObjects: Color[] = colors.map((c) => new Color(c));

//     const getColorAt = (ratio: number, out: Color): Color => {
//       const clamped = Math.min(1, Math.max(0, ratio));
//       const scaled = clamped * (colorObjects.length - 1);
//       const idx = Math.floor(scaled);

//       const start = colorObjects[idx];
//       if (idx >= colorObjects.length - 1) {
//         return out.copy(start);
//       }

//       const alpha = scaled - idx;
//       const end = colorObjects[idx + 1];

//       out.r = start.r + alpha * (end.r - start.r);
//       out.g = start.g + alpha * (end.g - start.g);
//       out.b = start.b + alpha * (end.b - start.b);

//       return out;
//     };

//     const tmpColor = new Color();

//     for (let i = 0; i < this.count; i += 1) {
//       this.setColorAt(i, getColorAt(i / this.count, tmpColor));
//       if (i === 0) {
//         this.light.color.copy(tmpColor);
//       }
//     }

//     if (this.instanceColor) {
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     this.physics.update(deltaInfo);

//     for (let idx = 0; idx < this.count; idx += 1) {
//       tempObject.position.fromArray(this.physics.positionData, 3 * idx);

//       if (idx === 0 && !this.config.followCursor) {
//         tempObject.scale.setScalar(0);
//       } else {
//         tempObject.scale.setScalar(this.physics.sizeData[idx]);
//       }

//       tempObject.updateMatrix();
//       this.setMatrixAt(idx, tempObject.matrix);

//       if (idx === 0) {
//         this.light.position.copy(tempObject.position);
//       }
//     }

//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// /* ======================================================================= */
// /*                      ФАБРИКА: СОЗДАНИЕ ПОЛЯ СФЕР                         */
// /* ======================================================================= */

// interface BallpitInstance {
//   three: ThreeWrapper;
//   readonly spheres: Spheres;
//   setCount(count: number): void;
//   togglePause(): void;
//   dispose(): void;
// }

// function createBallpit(
//   canvas: HTMLCanvasElement,
//   config: Partial<BallpitConfig> = {}
// ): BallpitInstance {
//   const threeInstance = new ThreeWrapper({
//     canvas,
//     size: "parent",
//     rendererOptions: { antialias: true, alpha: true },
//   });

//   threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
//   threeInstance.camera.position.set(0, 0, 18);
//   threeInstance.camera.lookAt(0, 0, 0);
//   threeInstance.cameraMaxAspect = 1.5;
//   threeInstance.resize();

//   let spheres: Spheres = new Spheres(threeInstance.renderer, config);
//   threeInstance.scene.add(spheres);

//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();
//   let isPaused = false;

//   const pointerData = createPointerData(canvas);

//   pointerData.onMove = (data) => {
//     raycaster.setFromCamera(data.nPosition, threeInstance.camera);
//     threeInstance.camera.getWorldDirection(plane.normal);
//     raycaster.ray.intersectPlane(plane, intersectionPoint);

//     gsap.to(spheres.physics.center, {
//       x: intersectionPoint.x,
//       y: intersectionPoint.y,
//       z: intersectionPoint.z,
//       duration: 0.35,
//       ease: "power2.out",
//     });

//     spheres.config.controlSphere0 = true;
//   };

//   pointerData.onLeave = () => {
//     spheres.config.controlSphere0 = false;
//   };

//   canvas.style.touchAction = "none";
//   canvas.style.userSelect = "none";
//   (canvas.style as { webkitUserSelect?: string }).webkitUserSelect = "none";

//   threeInstance.onBeforeRender = (deltaInfo) => {
//     if (!isPaused) spheres.update(deltaInfo);
//   };

//   threeInstance.onAfterResize = (size) => {
//     spheres.config.maxX = size.wWidth / 2;
//     spheres.config.maxY = size.wHeight / 2;
//   };

//   const initSpheres = (newConfig: BallpitConfig) => {
//     threeInstance.clear();
//     threeInstance.scene.remove(spheres);
//     spheres = new Spheres(threeInstance.renderer, newConfig);
//     threeInstance.scene.add(spheres);
//   };

//   return {
//     three: threeInstance,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initSpheres({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       pointerData.dispose();
//       threeInstance.dispose();
//     },
//   };
// }

// /* ======================================================================= */
// /*                           REACT-КОМПОНЕНТ                               */
// /* ======================================================================= */

// export interface BallpitProps {
//   className?: string;
//   followCursor?: boolean;
//   colors?: number[];
//   count?: number;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   className,
//   followCursor = true,
//   colors,
//   count,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const instanceRef = useRef<BallpitInstance | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     instanceRef.current = createBallpit(canvas, {
//       followCursor,
//       ...(colors ? { colors } : {}),
//       ...(typeof count === "number" ? { count } : {}),
//     });

//     return () => {
//       instanceRef.current?.dispose();
//     };
//   }, [followCursor, colors, count]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// };

// export default Ballpit;


// // src/components/Ballpit.tsx
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   ACESFilmicToneMapping,
//   AmbientLight,
//   Clock,
//   Color,
//   InstancedMesh,
//   MathUtils,
//   MeshPhysicalMaterial,
//   MeshPhysicalMaterialParameters,
//   Object3D,
//   PerspectiveCamera,
//   Plane,
//   PMREMGenerator,
//   Raycaster,
//   RoomEnvironment,
//   Scene,
//   SphereGeometry,
//   SRGBColorSpace,
//   Texture,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
//   WebGLRendererParameters,
//   PointLight,
// } from "three";

// import { gsap } from "gsap";

// /* ======================================================================= */
// /*                               ТИПЫ / ВСПОМОГАШКИ                        */
// /* ======================================================================= */

// type Shader = {
//   uniforms: Record<string, { value: unknown }>;
//   fragmentShader: string;
//   vertexShader: string;
// };

// interface SizeData {
//   width: number;
//   height: number;
//   wWidth: number;
//   wHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// interface ThreeWrapperConfig {
//   canvas?: HTMLCanvasElement;
//   id?: string;
//   rendererOptions?: Partial<WebGLRendererParameters>;
//   size?: "parent" | { width: number; height: number };
// }

// interface PostprocessingLike {
//   setSize(width: number, height: number): void;
//   render(): void;
//   dispose(): void;
// }

// interface AnimationState {
//   elapsed: number;
//   delta: number;
// }

// /* ======================================================================= */
// /*                             ОБЁРТКА ВОКРУГ THREE                        */
// /* ======================================================================= */

// class ThreeWrapper {
//   private config: ThreeWrapperConfig;
//   private postprocessing?: PostprocessingLike;
//   private resizeObserver?: ResizeObserver;
//   private intersectionObserver?: IntersectionObserver;
//   private resizeTimer?: number;
//   private animationFrameId = 0;
//   private clock: Clock = new Clock();
//   private isAnimating = false;
//   private isVisible = false;

//   canvas!: HTMLCanvasElement;
//   camera!: PerspectiveCamera;
//   cameraMinAspect?: number;
//   cameraMaxAspect?: number;
//   cameraFov!: number;
//   maxPixelRatio?: number;
//   minPixelRatio?: number;
//   scene!: Scene;
//   renderer!: WebGLRenderer;

//   size: SizeData = {
//     width: 0,
//     height: 0,
//     wWidth: 0,
//     wHeight: 0,
//     ratio: 0,
//     pixelRatio: 0,
//   };

//   animationState: AnimationState = { elapsed: 0, delta: 0 };

//   render: () => void = this.innerRender.bind(this);
//   onBeforeRender: (state: AnimationState) => void = () => {};
//   onAfterRender: (state: AnimationState) => void = () => {};
//   onAfterResize: (size: SizeData) => void = () => {};
//   isDisposed = false;

//   constructor(config: ThreeWrapperConfig) {
//     this.config = { ...config };
//     this.initCamera();
//     this.initScene();
//     this.initRenderer();
//     this.resize();
//     this.initObservers();
//   }

//   private initCamera() {
//     this.camera = new PerspectiveCamera();
//     this.cameraFov = this.camera.fov;
//   }

//   private initScene() {
//     this.scene = new Scene();
//   }

//   private initRenderer() {
//     if (this.config.canvas) {
//       this.canvas = this.config.canvas;
//     } else if (this.config.id) {
//       const elem = document.getElementById(this.config.id);
//       if (elem instanceof HTMLCanvasElement) {
//         this.canvas = elem;
//       } else {
//         throw new Error("ThreeWrapper: element with given id is not a canvas");
//       }
//     } else {
//       throw new Error("ThreeWrapper: canvas or id must be provided");
//     }

//     this.canvas.style.display = "block";

//     const rendererOptions: WebGLRendererParameters = {
//       canvas: this.canvas,
//       powerPreference: "high-performance",
//       ...(this.config.rendererOptions ?? {}),
//     };

//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;
//   }

//   private initObservers() {
//     if (!(this.config.size instanceof Object)) {
//       const resizeHandler = this.onResize.bind(this);
//       window.addEventListener("resize", resizeHandler);

//       if (this.config.size === "parent" && this.canvas.parentNode) {
//         this.resizeObserver = new ResizeObserver(resizeHandler);
//         this.resizeObserver.observe(this.canvas.parentNode as Element);
//       }
//     }

//     this.intersectionObserver = new IntersectionObserver(
//       this.onIntersection.bind(this),
//       { root: null, rootMargin: "0px", threshold: 0 }
//     );
//     this.intersectionObserver.observe(this.canvas);

//     document.addEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );
//   }

//   private onResize() {
//     if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
//     this.resizeTimer = window.setTimeout(() => this.resize(), 80);
//   }

//   resize() {
//     let w: number;
//     let h: number;

//     if (this.config.size && this.config.size !== "parent") {
//       w = this.config.size.width;
//       h = this.config.size.height;
//     } else if (this.config.size === "parent" && this.canvas.parentNode) {
//       const parent = this.canvas.parentNode as HTMLElement;
//       w = parent.offsetWidth;
//       h = parent.offsetHeight;
//     } else {
//       w = window.innerWidth;
//       h = window.innerHeight;
//     }

//     this.size.width = w;
//     this.size.height = h;
//     this.size.ratio = w / h;

//     this.updateCamera();
//     this.updateRenderer();
//     this.onAfterResize(this.size);
//   }

//   private updateCamera() {
//     this.camera.aspect = this.size.width / this.size.height;

//     if (this.camera.isPerspectiveCamera && this.cameraFov) {
//       if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
//         this.adjustFov(this.cameraMinAspect);
//       } else if (
//         this.cameraMaxAspect &&
//         this.camera.aspect > this.cameraMaxAspect
//       ) {
//         this.adjustFov(this.cameraMaxAspect);
//       } else {
//         this.camera.fov = this.cameraFov;
//       }
//     }

//     this.camera.updateProjectionMatrix();
//     this.updateWorldSize();
//   }

//   private adjustFov(aspect: number) {
//     const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
//     const newTan = tanFov / (this.camera.aspect / aspect);
//     this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
//   }

//   updateWorldSize() {
//     const fovRad = (this.camera.fov * Math.PI) / 180;
//     this.size.wHeight =
//       2 * Math.tan(fovRad / 2) * this.camera.position.length();
//     this.size.wWidth = this.size.wHeight * this.camera.aspect;
//   }

//   private updateRenderer() {
//     this.renderer.setSize(this.size.width, this.size.height);
//     if (this.postprocessing) {
//       this.postprocessing.setSize(this.size.width, this.size.height);
//     }

//     let pr = window.devicePixelRatio;
//     if (this.maxPixelRatio && pr > this.maxPixelRatio) {
//       pr = this.maxPixelRatio;
//     } else if (this.minPixelRatio && pr < this.minPixelRatio) {
//       pr = this.minPixelRatio;
//     }

//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;
//   }

//   get postProcessing(): PostprocessingLike | undefined {
//     return this.postprocessing;
//   }

//   set postProcessing(value: PostprocessingLike | undefined) {
//     this.postprocessing = value;
//     if (value) {
//       this.render = value.render.bind(value);
//     } else {
//       this.render = this.innerRender.bind(this);
//     }
//   }

//   private onIntersection(entries: IntersectionObserverEntry[]) {
//     const isIntersecting = entries[0]?.isIntersecting ?? false;
//     this.isAnimating = isIntersecting;
//     if (isIntersecting) {
//       this.startAnimation();
//     } else {
//       this.stopAnimation();
//     }
//   }

//   private onVisibilityChange() {
//     if (!this.isAnimating) return;
//     if (document.hidden) {
//       this.stopAnimation();
//     } else {
//       this.startAnimation();
//     }
//   }

//   private startAnimation() {
//     if (this.isVisible) return;

//     const animateFrame = () => {
//       this.animationFrameId = window.requestAnimationFrame(animateFrame);
//       this.animationState.delta = this.clock.getDelta();
//       this.animationState.elapsed += this.animationState.delta;

//       this.onBeforeRender(this.animationState);
//       this.render();
//       this.onAfterRender(this.animationState);
//     };

//     this.isVisible = true;
//     this.clock.start();
//     animateFrame();
//   }

//   private stopAnimation() {
//     if (!this.isVisible) return;
//     window.cancelAnimationFrame(this.animationFrameId);
//     this.isVisible = false;
//     this.clock.stop();
//   }

//   private innerRender() {
//     this.renderer.render(this.scene, this.camera);
//   }

//   clear() {
//     this.scene.traverse((obj) => {
//       const anyObj = obj as {
//         isMesh?: boolean;
//         material?: unknown;
//         geometry?: { dispose: () => void };
//       };

//       if (!anyObj.isMesh || !anyObj.material || !anyObj.geometry) return;

//       const mat = anyObj.material as {
//         dispose?: () => void;
//         [key: string]: unknown;
//       };

//       Object.values(mat).forEach((val) => {
//         const maybeDisposable = val as { dispose?: () => void };
//         if (maybeDisposable && typeof maybeDisposable.dispose === "function") {
//           maybeDisposable.dispose();
//         }
//       });

//       if (typeof mat.dispose === "function") {
//         mat.dispose();
//       }

//       anyObj.geometry.dispose();
//     });

//     this.scene.clear();
//   }

//   dispose() {
//     this.stopAnimation();

//     window.removeEventListener("resize", this.onResize.bind(this));
//     this.resizeObserver?.disconnect();
//     this.intersectionObserver?.disconnect();
//     document.removeEventListener(
//       "visibilitychange",
//       this.onVisibilityChange.bind(this)
//     );

//     this.clear();
//     this.postprocessing?.dispose();
//     this.renderer.dispose();
//     this.isDisposed = true;
//   }
// }

// /* ======================================================================= */
// /*                              ФИЗИКА ШАРОВ                               */
// /* ======================================================================= */

// interface PhysicsConfig {
//   count: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   maxSize: number;
//   minSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// class PhysicsSystem {
//   config: PhysicsConfig;
//   positionData: Float32Array;
//   velocityData: Float32Array;
//   sizeData: Float32Array;
//   center: Vector3 = new Vector3();

//   constructor(config: PhysicsConfig) {
//     this.config = { ...config };
//     this.positionData = new Float32Array(3 * config.count).fill(0);
//     this.velocityData = new Float32Array(3 * config.count).fill(0);
//     this.sizeData = new Float32Array(config.count).fill(1);
//     this.center = new Vector3();

//     this.initPositions();
//     this.setSizes();
//   }

//   private initPositions() {
//     const { config, positionData } = this;

//     this.center.toArray(positionData, 0);

//     for (let i = 1; i < config.count; i += 1) {
//       const idx = 3 * i;
//       positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   setSizes() {
//     const { config, sizeData } = this;

//     sizeData[0] = config.size0;
//     for (let i = 1; i < config.count; i += 1) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     const { config, center, positionData, sizeData, velocityData } = this;

//     let startIdx = 0;

//     const tmpPos = new Vector3();
//     const tmpVel = new Vector3();
//     const diff = new Vector3();
//     const otherPos = new Vector3();
//     const otherVel = new Vector3();

//     if (config.controlSphere0) {
//       startIdx = 1;
//       tmpPos.fromArray(positionData, 0);
//       tmpPos.lerp(center, 0.12).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }

//     // обновляем позиции
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       // гравитация
//       tmpVel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
//       // трение
//       tmpVel.multiplyScalar(config.friction);
//       // ограничение скорости
//       tmpVel.clampLength(0, config.maxVelocity);

//       tmpPos.add(tmpVel);

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }

//     // столкновения и стены
//     for (let idx = startIdx; idx < config.count; idx += 1) {
//       const base = 3 * idx;
//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       const radius = sizeData[idx];

//       for (let j = idx + 1; j < config.count; j += 1) {
//         const otherBase = 3 * j;
//         otherPos.fromArray(positionData, otherBase);
//         otherVel.fromArray(velocityData, otherBase);

//         diff.copy(otherPos).sub(tmpPos);
//         const dist = diff.length();
//         const sumRadius = radius + sizeData[j];

//         if (dist < sumRadius && dist > 0.0001) {
//           const overlap = sumRadius - dist;
//           const correction = diff.normalize().multiplyScalar(0.5 * overlap);

//           const velMag = Math.max(tmpVel.length(), 1);
//           const otherVelMag = Math.max(otherVel.length(), 1);

//           tmpPos.sub(correction);
//           tmpVel.sub(correction.clone().multiplyScalar(velMag));

//           otherPos.add(correction);
//           otherVel.add(correction.clone().multiplyScalar(otherVelMag));

//           tmpPos.toArray(positionData, base);
//           tmpVel.toArray(velocityData, base);

//           otherPos.toArray(positionData, otherBase);
//           otherVel.toArray(velocityData, otherBase);
//         }
//       }

//       // отталкивание от шара 0
//       if (config.controlSphere0) {
//         diff
//           .fromArray(positionData, 0)
//           .sub(tmpPos);
//         const d = diff.length();
//         const sumRadius0 = radius + sizeData[0];
//         if (d < sumRadius0 && d > 0.0001) {
//           const correction = diff
//             .normalize()
//             .multiplyScalar(sumRadius0 - d);
//           const velCorrection = correction.clone().multiplyScalar(
//             Math.max(tmpVel.length(), 2)
//           );
//           tmpPos.sub(correction);
//           tmpVel.sub(velCorrection);
//         }
//       }

//       // стены по X
//       if (Math.abs(tmpPos.x) + radius > config.maxX) {
//         tmpPos.x = Math.sign(tmpPos.x) * (config.maxX - radius);
//         tmpVel.x = -tmpVel.x * config.wallBounce;
//       }

//       // по Y
//       if (config.gravity === 0) {
//         if (Math.abs(tmpPos.y) + radius > config.maxY) {
//           tmpPos.y = Math.sign(tmpPos.y) * (config.maxY - radius);
//           tmpVel.y = -tmpVel.y * config.wallBounce;
//         }
//       } else if (tmpPos.y - radius < -config.maxY) {
//         tmpPos.y = -config.maxY + radius;
//         tmpVel.y = -tmpVel.y * config.wallBounce;
//       }

//       // по Z
//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(tmpPos.z) + radius > maxBoundary) {
//         tmpPos.z = Math.sign(tmpPos.z) * (config.maxZ - radius);
//         tmpVel.z = -tmpVel.z * config.wallBounce;
//       }

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }
//   }
// }

// /* ======================================================================= */
// /*                     МАТЕРИАЛ С ПОЛУПРОЗРАЧНЫМ СВЕЧЕНИЕМ                 */
// /* ======================================================================= */

// class ScatteringMaterial extends MeshPhysicalMaterial {
//   uniforms: Record<string, { value: number }> = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2 },
//     thicknessScale: { value: 10 },
//   };

//   onBeforeCompile2?: (shader: Shader) => void;

//   constructor(params: MeshPhysicalMaterialParameters & { envMap: Texture }) {
//     super(params);

//     // у базового Material уже есть defines: Record<string, any> | undefined
//     this.defines = { USE_UV: "" };

//     this.onBeforeCompile = (shader: Shader) => {
//       Object.assign(shader.uniforms, this.uniforms);

//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//         ` + shader.fragmentShader;

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "void main() {",
//         `
//         void RE_Direct_Scattering(
//           const in IncidentLight directLight,
//           const in vec2 uv,
//           const in vec3 geometryPosition,
//           const in vec3 geometryNormal,
//           const in vec3 geometryViewDir,
//           const in vec3 geometryClearcoatNormal,
//           inout ReflectedLight reflectedLight
//         ) {
//           vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;

//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif

//           reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//         `
//       );

//       const lightsChunk = ShaderChunk.lights_fragment_begin.replace(
//         "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
//         `
//           RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
//           RE_Direct_Scattering( directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight );
//         `
//       );

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "#include <lights_fragment_begin>",
//         lightsChunk
//       );

//       if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
//     };
//   }
// }

// /* ======================================================================= */
// /*                           КОНФИГ БОЛЬШОГО ПИТА                          */
// /* ======================================================================= */

// interface BallpitConfig {
//   count: number;
//   colors: number[];
//   ambientColor: number;
//   ambientIntensity: number;
//   lightIntensity: number;
//   materialParams: {
//     metalness: number;
//     roughness: number;
//     clearcoat: number;
//     clearcoatRoughness: number;
//   };
//   minSize: number;
//   maxSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// const defaultBallpitConfig: BallpitConfig = {
//   count: 220,
//   // нежные неоновые цвета
//   colors: [0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xffffff],
//   ambientColor: 0xffffff,
//   ambientIntensity: 1.1,
//   lightIntensity: 220,
//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.35,
//     clearcoat: 1,
//     clearcoatRoughness: 0.18,
//   },
//   minSize: 0.6,
//   maxSize: 1.1,
//   size0: 1.1,
//   gravity: 0.45,
//   friction: 0.995,
//   wallBounce: 0.96,
//   maxVelocity: 0.17,
//   maxX: 5,
//   maxY: 4,
//   maxZ: 2.3,
//   controlSphere0: false,
//   followCursor: true,
// };

// const tempObject = new Object3D();

// /* ======================================================================= */
// /*                            Pointer helper                                */
// /* ======================================================================= */

// interface PointerData {
//   position: Vector2;
//   nPosition: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (data: PointerData) => void;
//   onMove: (data: PointerData) => void;
//   onClick: (data: PointerData) => void;
//   onLeave: (data: PointerData) => void;
//   dispose: () => void;
// }

// const pointerPosition = new Vector2();
// const pointerMap = new Map<HTMLElement, PointerData>();
// let globalPointerActive = false;

// function isInside(rect: DOMRect): boolean {
//   return (
//     pointerPosition.x >= rect.left &&
//     pointerPosition.x <= rect.left + rect.width &&
//     pointerPosition.y >= rect.top &&
//     pointerPosition.y <= rect.top + rect.height
//   );
// }

// function updatePointerData(data: PointerData, rect: DOMRect) {
//   data.position.set(
//     pointerPosition.x - rect.left,
//     pointerPosition.y - rect.top
//   );
//   data.nPosition.set(
//     (data.position.x / rect.width) * 2 - 1,
//     (-data.position.y / rect.height) * 2 + 1
//   );
// }

// function handlePointerMove() {
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && !data.touching) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerMove(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   handlePointerMove();
// }

// function onPointerLeave() {
//   for (const data of pointerMap.values()) {
//     if (data.hover) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerClick(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) data.onClick(data);
//   }
// }

// function onTouchStart(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       data.touching = true;
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     }
//   }
// }

// function onTouchMove(e: TouchEvent) {
//   if (e.touches.length === 0) return;
//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//   for (const [elem, data] of pointerMap.entries()) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) {
//       if (!data.hover) {
//         data.hover = true;
//         data.touching = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && data.touching) {
//       data.onMove(data);
//     }
//   }
// }

// function onTouchEnd() {
//   for (const data of pointerMap.values()) {
//     if (data.touching) {
//       data.touching = false;
//       if (data.hover) {
//         data.hover = false;
//         data.onLeave(data);
//       }
//     }
//   }
// }

// function ensureGlobalPointerListeners() {
//   if (globalPointerActive) return;
//   document.body.addEventListener("pointermove", onPointerMove as EventListener);
//   document.body.addEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.addEventListener("click", onPointerClick as EventListener);

//   document.body.addEventListener(
//     "touchstart",
//     onTouchStart as EventListener,
//     { passive: false }
//   );
//   document.body.addEventListener(
//     "touchmove",
//     onTouchMove as EventListener,
//     { passive: false }
//   );
//   document.body.addEventListener(
//     "touchend",
//     onTouchEnd as EventListener,
//     { passive: false }
//   );
//   document.body.addEventListener(
//     "touchcancel",
//     onTouchEnd as EventListener,
//     { passive: false }
//   );

//   globalPointerActive = true;
// }

// function cleanupGlobalPointerListeners() {
//   if (!globalPointerActive) return;

//   document.body.removeEventListener(
//     "pointermove",
//     onPointerMove as EventListener
//   );
//   document.body.removeEventListener(
//     "pointerleave",
//     onPointerLeave as EventListener
//   );
//   document.body.removeEventListener("click", onPointerClick as EventListener);

//   document.body.removeEventListener(
//     "touchstart",
//     onTouchStart as EventListener
//   );
//   document.body.removeEventListener("touchmove", onTouchMove as EventListener);
//   document.body.removeEventListener("touchend", onTouchEnd as EventListener);
//   document.body.removeEventListener(
//     "touchcancel",
//     onTouchEnd as EventListener
//   );

//   globalPointerActive = false;
// }

// function createPointerData(domElement: HTMLElement): PointerData {
//   const data: PointerData = {
//     position: new Vector2(),
//     nPosition: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onClick: () => {},
//     onLeave: () => {},
//     dispose: () => {},
//   };

//   pointerMap.set(domElement, data);
//   ensureGlobalPointerListeners();

//   data.dispose = () => {
//     pointerMap.delete(domElement);
//     if (pointerMap.size === 0) {
//       cleanupGlobalPointerListeners();
//     }
//   };

//   return data;
// }

// /* ======================================================================= */
// /*                             INSTANCED ШАРЫ                               */
// /* ======================================================================= */

// class Spheres extends InstancedMesh {
//   config: BallpitConfig;
//   physics: PhysicsSystem;
//   ambientLight: AmbientLight;
//   light: PointLight;

//   constructor(
//     renderer: WebGLRenderer,
//     params: Partial<BallpitConfig> = {}
//   ) {
//     const config: BallpitConfig = {
//       ...defaultBallpitConfig,
//       ...params,
//     };

//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envRT = pmrem.fromScene(roomEnv);
//     const envTexture = envRT.texture as Texture;

//     const geometry = new SphereGeometry(1, 32, 32);
//     const material = new ScatteringMaterial({
//       envMap: envTexture,
//       ...config.materialParams,
//       transmission: 0.96,
//       ior: 1.3,
//       thickness: 1.2,
//     });

//     material.envMapRotation.x = -Math.PI / 2;

//     super(geometry, material, config.count);

//     this.config = config;
//     this.physics = new PhysicsSystem(config);
//     this.ambientLight = new AmbientLight(
//       this.config.ambientColor,
//       this.config.ambientIntensity
//     );
//     this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);

//     this.add(this.ambientLight);
//     this.add(this.light);

//     this.setColors(config.colors);
//   }

//   setColors(colors: readonly number[]) {
//     const colorObjects: Color[] = colors.map((c) => new Color(c));

//     const getColorAt = (ratio: number, out: Color): Color => {
//       const clamped = Math.min(1, Math.max(0, ratio));
//       const scaled = clamped * (colorObjects.length - 1);
//       const idx = Math.floor(scaled);

//       const start = colorObjects[idx];
//       if (idx >= colorObjects.length - 1) {
//         return out.copy(start);
//       }

//       const alpha = scaled - idx;
//       const end = colorObjects[idx + 1];

//       out.r = start.r + alpha * (end.r - start.r);
//       out.g = start.g + alpha * (end.g - start.g);
//       out.b = start.b + alpha * (end.b - start.b);

//       return out;
//     };

//     const tmpColor = new Color();

//     for (let i = 0; i < this.count; i += 1) {
//       this.setColorAt(i, getColorAt(i / this.count, tmpColor));
//       if (i === 0) {
//         this.light.color.copy(tmpColor);
//       }
//     }

//     if (this.instanceColor) {
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     this.physics.update(deltaInfo);

//     for (let idx = 0; idx < this.count; idx += 1) {
//       tempObject.position.fromArray(this.physics.positionData, 3 * idx);

//       if (idx === 0 && !this.config.followCursor) {
//         tempObject.scale.setScalar(0);
//       } else {
//         tempObject.scale.setScalar(this.physics.sizeData[idx]);
//       }

//       tempObject.updateMatrix();
//       this.setMatrixAt(idx, tempObject.matrix);

//       if (idx === 0) {
//         this.light.position.copy(tempObject.position);
//       }
//     }

//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// /* ======================================================================= */
// /*                      ФАБРИКА: СОЗДАНИЕ ПОЛЯ СФЕР                         */
// /* ======================================================================= */

// interface BallpitInstance {
//   three: ThreeWrapper;
//   readonly spheres: Spheres;
//   setCount(count: number): void;
//   togglePause(): void;
//   dispose(): void;
// }

// function createBallpit(
//   canvas: HTMLCanvasElement,
//   config: Partial<BallpitConfig> = {}
// ): BallpitInstance {
//   const threeInstance = new ThreeWrapper({
//     canvas,
//     size: "parent",
//     rendererOptions: { antialias: true, alpha: true },
//   });

//   threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
//   threeInstance.camera.position.set(0, 0, 18);
//   threeInstance.camera.lookAt(0, 0, 0);
//   threeInstance.cameraMaxAspect = 1.5;
//   threeInstance.resize();

//   let spheres: Spheres = new Spheres(threeInstance.renderer, config);
//   threeInstance.scene.add(spheres);

//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();
//   let isPaused = false;

//   const pointerData = createPointerData(canvas);

//   pointerData.onMove = (data) => {
//     raycaster.setFromCamera(data.nPosition, threeInstance.camera);
//     threeInstance.camera.getWorldDirection(plane.normal);
//     raycaster.ray.intersectPlane(plane, intersectionPoint);

//     // сглаживаем движение центра к точке
//     gsap.to(spheres.physics.center, {
//       x: intersectionPoint.x,
//       y: intersectionPoint.y,
//       z: intersectionPoint.z,
//       duration: 0.35,
//       ease: "power2.out",
//     });

//     spheres.config.controlSphere0 = true;
//   };

//   pointerData.onLeave = () => {
//     spheres.config.controlSphere0 = false;
//   };

//   canvas.style.touchAction = "none";
//   canvas.style.userSelect = "none";
//   (canvas.style as unknown as { webkitUserSelect?: string }).webkitUserSelect =
//     "none";

//   threeInstance.onBeforeRender = (deltaInfo) => {
//     if (!isPaused) spheres.update(deltaInfo);
//   };

//   threeInstance.onAfterResize = (size) => {
//     spheres.config.maxX = size.wWidth / 2;
//     spheres.config.maxY = size.wHeight / 2;
//   };

//   const initSpheres = (newConfig: BallpitConfig) => {
//     threeInstance.clear();
//     threeInstance.scene.remove(spheres);
//     spheres = new Spheres(threeInstance.renderer, newConfig);
//     threeInstance.scene.add(spheres);
//   };

//   return {
//     three: threeInstance,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initSpheres({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       pointerData.dispose();
//       threeInstance.dispose();
//     },
//   };
// }

// /* ======================================================================= */
// /*                           REACT-КОМПОНЕНТ                               */
// /* ======================================================================= */

// export interface BallpitProps {
//   className?: string;
//   followCursor?: boolean;
//   colors?: number[];
//   count?: number;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   className,
//   followCursor = true,
//   colors,
//   count,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const instanceRef = useRef<BallpitInstance | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     instanceRef.current = createBallpit(canvas, {
//       followCursor,
//       ...(colors ? { colors } : {}),
//       ...(typeof count === "number" ? { count } : {}),
//     });

//     return () => {
//       instanceRef.current?.dispose();
//     };
//   }, [followCursor, colors, count]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// };

// export default Ballpit;





//-----почти то что надо, осталось 2 ошибки------
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   ACESFilmicToneMapping,
//   AmbientLight,
//   Clock,
//   Color,
//   InstancedMesh,
//   MathUtils,
//   MeshPhysicalMaterial,
//   MeshPhysicalMaterialParameters,
//   Object3D,
//   PerspectiveCamera,
//   Plane,
//   PMREMGenerator,
//   PointLight,
//   Raycaster,
//   Scene,
//   SphereGeometry,
//   SRGBColorSpace,
//   Texture,
//   Vector2,
//   Vector3,
//   WebGLRenderer,
//   WebGLRendererParameters,
// } from "three";
// import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
// import { ShaderChunk } from "three";
// import { gsap } from "gsap";
// import { Observer } from "gsap/Observer";

// gsap.registerPlugin(Observer);

// /* ======================================================================== */
// /*  Типы для шейдера и постпроцессинга                                     */
// /* ======================================================================== */

// interface ShaderUniform {
//   value: unknown;
// }

// interface ShaderLike {
//   uniforms: Record<string, ShaderUniform>;
//   fragmentShader: string;
// }

// interface SizeData {
//   width: number;
//   height: number;
//   worldWidth: number;
//   worldHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// /* ======================================================================== */
// /*  Конфиг “двигателя” Three.js                                             */
// /* ======================================================================== */

// interface EngineConfig {
//   canvas: HTMLCanvasElement;
//   rendererOptions?: Partial<WebGLRendererParameters>;
// }

// /* Небольшой wrapper над камерой / сценой / рендерером */
// class Engine {
//   readonly clock = new Clock();
//   readonly camera = new PerspectiveCamera();
//   readonly scene = new Scene();
//   readonly renderer: WebGLRenderer;

//   readonly size: SizeData = {
//     width: 0,
//     height: 0,
//     worldWidth: 0,
//     worldHeight: 0,
//     ratio: 1,
//     pixelRatio: 1,
//   };

//   private readonly resizeListener: () => void;
//   private readonly visibilityListener: () => void;
//   private intersectionObserver?: IntersectionObserver;
//   private resizeObserver?: ResizeObserver;
//   private isRunning = false;
//   private animationFrameId = 0;
//   private readonly baseFov: number;

//   onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {
//     /* noop */
//   };

//   onAfterResize: (size: SizeData) => void = () => {
//     /* noop */
//   };

//   constructor(config: EngineConfig) {
//     const rendererOptions: WebGLRendererParameters = {
//       canvas: config.canvas,
//       antialias: true,
//       alpha: true,
//       powerPreference: "high-performance",
//       ...(config.rendererOptions ?? {}),
//     };

//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;

//     this.baseFov = this.camera.fov;

//     this.resizeListener = () => this.handleResize();
//     this.visibilityListener = () => this.handleVisibilityChange();

//     if (typeof window !== "undefined") {
//       window.addEventListener("resize", this.resizeListener);
//     }

//     if (typeof ResizeObserver !== "undefined" && config.canvas.parentElement) {
//       this.resizeObserver = new ResizeObserver(this.resizeListener);
//       this.resizeObserver.observe(config.canvas.parentElement);
//     }

//     if (typeof IntersectionObserver !== "undefined") {
//       this.intersectionObserver = new IntersectionObserver(
//         (entries) => {
//           const [entry] = entries;
//           if (entry.isIntersecting) {
//             this.start();
//           } else {
//             this.stop();
//           }
//         },
//         { threshold: 0 },
//       );
//       this.intersectionObserver.observe(config.canvas);
//     }

//     if (typeof document !== "undefined") {
//       document.addEventListener("visibilitychange", this.visibilityListener);
//     }

//     this.resize();
//     this.start();
//   }

//   private handleResize(): void {
//     this.resize();
//   }

//   private handleVisibilityChange(): void {
//     if (document.hidden) {
//       this.stop();
//     } else {
//       this.start();
//     }
//   }

//   resize(): void {
//     const canvas = this.renderer.domElement;

//     const width = canvas.parentElement
//       ? canvas.parentElement.clientWidth
//       : window.innerWidth;
//     const height = canvas.parentElement
//       ? canvas.parentElement.clientHeight
//       : window.innerHeight;

//     this.size.width = width;
//     this.size.height = height;
//     this.size.ratio = width / height;

//     this.camera.aspect = this.size.ratio;
//     this.camera.fov = this.baseFov;
//     this.camera.updateProjectionMatrix();

//     const distance = this.camera.position.length();
//     const fovRad = (this.camera.fov * Math.PI) / 180;
//     this.size.worldHeight = 2 * Math.tan(fovRad / 2) * distance;
//     this.size.worldWidth = this.size.worldHeight * this.camera.aspect;

//     this.renderer.setSize(width, height, false);

//     let pr = window.devicePixelRatio;
//     if (pr > 2.5) pr = 2.5;
//     if (pr < 1) pr = 1;
//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;

//     this.onAfterResize(this.size);
//   }

//   private loop = (): void => {
//     const delta = this.clock.getDelta();
//     const elapsed = this.clock.elapsedTime;

//     this.onBeforeRender({ delta, elapsed });
//     this.renderer.render(this.scene, this.camera);

//     this.animationFrameId = requestAnimationFrame(this.loop);
//   };

//   start(): void {
//     if (this.isRunning) return;
//     this.isRunning = true;
//     this.clock.start();
//     this.animationFrameId = requestAnimationFrame(this.loop);
//   }

//   stop(): void {
//     if (!this.isRunning) return;
//     this.isRunning = false;
//     cancelAnimationFrame(this.animationFrameId);
//     this.clock.stop();
//   }

//   dispose(): void {
//     this.stop();

//     if (typeof window !== "undefined") {
//       window.removeEventListener("resize", this.resizeListener);
//     }
//     this.resizeObserver?.disconnect();
//     this.intersectionObserver?.disconnect();
//     if (typeof document !== "undefined") {
//       document.removeEventListener("visibilitychange", this.visibilityListener);
//     }

//     this.scene.traverse((obj) => {
//       const mesh = obj as unknown as {
//         isMesh?: boolean;
//         geometry?: { dispose: () => void };
//         material?: unknown;
//       };

//       if (!mesh.isMesh || !mesh.material) return;

//       const material = mesh.material as {
//         dispose?: () => void;
//         [key: string]: unknown;
//       };

//       Object.values(material).forEach((value) => {
//         const resource = value as { dispose?: () => void } | null;
//         if (resource && typeof resource.dispose === "function") {
//           resource.dispose();
//         }
//       });

//       material.dispose?.();
//       mesh.geometry?.dispose();
//     });

//     this.renderer.dispose();
//   }
// }

// /* ======================================================================== */
// /*  Физика шариков                                                          */
// /* ======================================================================== */

// interface PhysicsConfig {
//   count: number;

//   maxX: number;
//   maxY: number;
//   maxZ: number;

//   maxSize: number;
//   minSize: number;
//   size0: number;

//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;

//   controlSphere0: boolean;
//   followCursor: boolean;
// }

// class Physics {
//   readonly config: PhysicsConfig;

//   readonly positionData: Float32Array;
//   readonly velocityData: Float32Array;
//   readonly sizeData: Float32Array;
//   readonly center = new Vector3();

//   constructor(config: PhysicsConfig) {
//     this.config = config;

//     this.positionData = new Float32Array(3 * config.count);
//     this.velocityData = new Float32Array(3 * config.count);
//     this.sizeData = new Float32Array(config.count);

//     this.initPositions();
//     this.setSizes();
//   }

//   private initPositions(): void {
//     const { positionData, config } = this;

//     this.center.toArray(positionData, 0);

//     for (let i = 1; i < config.count; i += 1) {
//       const base = 3 * i;
//       positionData[base] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[base + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[base + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   setSizes(): void {
//     const { sizeData, config } = this;

//     sizeData[0] = config.size0;

//     for (let i = 1; i < config.count; i += 1) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(delta: number): void {
//     const { config, positionData, velocityData, sizeData, center } = this;

//     const tmpPos = new Vector3();
//     const tmpVel = new Vector3();
//     const tmpPos2 = new Vector3();
//     const tmpVel2 = new Vector3();
//     const diff = new Vector3();

//     let startIndex = 0;

//     if (config.controlSphere0) {
//       startIndex = 1;

//       tmpPos.fromArray(positionData, 0);
//       tmpPos.lerp(center, 0.1).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }

//     for (let i = startIndex; i < config.count; i += 1) {
//       const base = 3 * i;

//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);

//       tmpVel.y -= delta * config.gravity * sizeData[i];
//       tmpVel.multiplyScalar(config.friction);
//       tmpVel.clampLength(0, config.maxVelocity);

//       tmpPos.add(tmpVel);

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }

//     for (let i = startIndex; i < config.count; i += 1) {
//       const base = 3 * i;

//       tmpPos.fromArray(positionData, base);
//       tmpVel.fromArray(velocityData, base);
//       const radius = sizeData[i];

//       for (let j = i + 1; j < config.count; j += 1) {
//         const otherBase = 3 * j;

//         tmpPos2.fromArray(positionData, otherBase);
//         tmpVel2.fromArray(velocityData, otherBase);

//         diff.copy(tmpPos2).sub(tmpPos);
//         const distance = diff.length();
//         const sumRadius = radius + sizeData[j];

//         if (distance < sumRadius && distance > 0.0001) {
//           const overlap = sumRadius - distance;
//           const direction = diff.normalize();
//           const correction = direction.multiplyScalar(0.5 * overlap);

//           tmpPos.sub(correction);
//           tmpVel.sub(correction.clone().multiplyScalar(Math.max(tmpVel.length(), 0.5)));

//           tmpPos.toArray(positionData, base);
//           tmpVel.toArray(velocityData, base);

//           tmpPos2.add(correction);
//           tmpVel2.add(correction.clone().multiplyScalar(Math.max(tmpVel2.length(), 0.5)));

//           tmpPos2.toArray(positionData, otherBase);
//           tmpVel2.toArray(velocityData, otherBase);
//         }
//       }

//       if (config.controlSphere0) {
//         diff
//           .fromArray(positionData, 0)
//           .sub(tmpPos);

//         const distance0 = diff.length();
//         const sumRadius0 = radius + sizeData[0];

//         if (distance0 < sumRadius0 && distance0 > 0.0001) {
//           const correction = diff
//             .normalize()
//             .multiplyScalar(sumRadius0 - distance0);
//           tmpPos.sub(correction);
//           tmpVel.sub(
//             correction.clone().multiplyScalar(Math.max(tmpVel.length(), 1)),
//           );
//         }
//       }

//       if (Math.abs(tmpPos.x) + radius > config.maxX) {
//         tmpPos.x = Math.sign(tmpPos.x) * (config.maxX - radius);
//         tmpVel.x = -tmpVel.x * config.wallBounce;
//       }

//       if (config.gravity === 0) {
//         if (Math.abs(tmpPos.y) + radius > config.maxY) {
//           tmpPos.y = Math.sign(tmpPos.y) * (config.maxY - radius);
//           tmpVel.y = -tmpVel.y * config.wallBounce;
//         }
//       } else if (tmpPos.y - radius < -config.maxY) {
//         tmpPos.y = -config.maxY + radius;
//         tmpVel.y = -tmpVel.y * config.wallBounce;
//       }

//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(tmpPos.z) + radius > maxBoundary) {
//         tmpPos.z = Math.sign(tmpPos.z) * (config.maxZ - radius);
//         tmpVel.z = -tmpVel.z * config.wallBounce;
//       }

//       tmpPos.toArray(positionData, base);
//       tmpVel.toArray(velocityData, base);
//     }
//   }
// }

// /* ======================================================================== */
// /*  Материал с “подсвеченной” толщиной (subsurface scattering-style)       */
// /* ======================================================================== */

// class ScatteringMaterial extends MeshPhysicalMaterial {
//   readonly customUniforms: Record<string, { value: number }> = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0.0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2.0 },
//     thicknessScale: { value: 10.0 },
//   };

//   onBeforeCompile2?: (shader: ShaderLike) => void;

//   constructor(params: MeshPhysicalMaterialParameters & { envMap: Texture }) {
//     super(params);

//     (this as MeshPhysicalMaterial & {
//       defines: Record<string, string>;
//     }).defines = { USE_UV: "" };

//     this.onBeforeCompile = (shader: ShaderLike) => {
//       Object.assign(shader.uniforms, this.customUniforms);

//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//       ` + shader.fragmentShader;

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "void main() {",
//         `
//         void RE_Direct_Scattering(
//           const in IncidentLight directLight,
//           const in vec2 uv,
//           const in vec3 geometryPosition,
//           const in vec3 geometryNormal,
//           const in vec3 geometryViewDir,
//           const in vec3 geometryClearcoatNormal,
//           inout ReflectedLight reflectedLight
//         ) {
//           vec3 scatteringHalf =
//             normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot =
//             pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) *
//             thicknessScale;

//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif

//           reflectedLight.directDiffuse +=
//             scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//       `,
//       );

//       const lightsChunk = ShaderChunk.lights_fragment_begin.replace(
//         "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
//         `
//           RE_Direct(
//             directLight,
//             geometryPosition,
//             geometryNormal,
//             geometryViewDir,
//             geometryClearcoatNormal,
//             material,
//             reflectedLight
//           );
//           RE_Direct_Scattering(
//             directLight,
//             vUv,
//             geometryPosition,
//             geometryNormal,
//             geometryViewDir,
//             geometryClearcoatNormal,
//             reflectedLight
//           );
//         `,
//       );

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "#include <lights_fragment_begin>",
//         lightsChunk,
//       );

//       if (this.onBeforeCompile2) {
//         this.onBeforeCompile2(shader);
//       }
//     };
//   }
// }

// /* ======================================================================== */
// /*  Конфиг шариков                                                          */
// /* ======================================================================== */

// interface BallpitConfig extends PhysicsConfig {
//   colors: number[];
//   ambientColor: number;
//   ambientIntensity: number;
//   lightIntensity: number;
//   materialParams: MeshPhysicalMaterialParameters;
// }

// const DEFAULT_CONFIG: BallpitConfig = {
//   count: 220,

//   colors: [0x6345ff, 0xff71b8, 0xffffff],

//   ambientColor: 0xffffff,
//   ambientIntensity: 1.1,
//   lightIntensity: 220,

//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.35,
//     clearcoat: 1,
//     clearcoatRoughness: 0.12,
//   },

//   minSize: 0.6,
//   maxSize: 1.4,
//   size0: 1.4,
//   gravity: 0.4,
//   friction: 0.9975,
//   wallBounce: 0.95,
//   maxVelocity: 0.15,
//   maxX: 5,
//   maxY: 5,
//   maxZ: 2,
//   controlSphere0: false,
//   followCursor: true,
// };

// /* ======================================================================== */
// /*  Инстанс шариков                                                         */
// /* ======================================================================== */

// const TEMP_OBJECT = new Object3D();

// class Spheres extends InstancedMesh {
//   readonly config: BallpitConfig;
//   readonly physics: Physics;
//   readonly ambientLight: AmbientLight;
//   readonly pointLight: PointLight;

//   constructor(renderer: WebGLRenderer, params: Partial<BallpitConfig> = {}) {
//     const config: BallpitConfig = { ...DEFAULT_CONFIG, ...params };

//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envTexture = pmrem.fromScene(roomEnv).texture;

//     const geometry = new SphereGeometry(1, 32, 32);
//     const material = new ScatteringMaterial({
//       envMap: envTexture,
//       ...config.materialParams,
//     });

//     material.envMapRotation.x = -Math.PI / 2;

//     super(geometry, material, config.count);

//     this.config = config;
//     this.physics = new Physics(config);

//     this.ambientLight = new AmbientLight(
//       config.ambientColor,
//       config.ambientIntensity,
//     );
//     this.add(this.ambientLight);

//     this.pointLight = new PointLight(config.colors[0], config.lightIntensity);
//     this.add(this.pointLight);

//     this.setColors(config.colors);
//   }

//   setColors(colors: readonly number[]): void {
//     if (!Array.isArray(colors) || colors.length === 0) return;

//     const colorObjects = colors.map((c) => new Color(c));

//     const getColorAt = (ratio: number, out = new Color()) => {
//       const clamped = Math.min(1, Math.max(0, ratio));
//       const scaled = clamped * (colorObjects.length - 1);
//       const index = Math.floor(scaled);
//       const start = colorObjects[index];

//       if (index >= colorObjects.length - 1) {
//         return out.copy(start);
//       }

//       const alpha = scaled - index;
//       const end = colorObjects[index + 1];

//       out.r = start.r + alpha * (end.r - start.r);
//       out.g = start.g + alpha * (end.g - start.g);
//       out.b = start.b + alpha * (end.b - start.b);

//       return out;
//     };

//     for (let i = 0; i < this.count; i += 1) {
//       const color = getColorAt(i / this.count);
//       this.setColorAt(i, color);
//       if (i === 0) {
//         this.pointLight.color.copy(color);
//       }
//     }

//     if (this.instanceColor) {
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(delta: number): void {
//     this.physics.update(delta);

//     for (let i = 0; i < this.count; i += 1) {
//       const base = 3 * i;
//       TEMP_OBJECT.position.fromArray(this.physics.positionData, base);

//       if (i === 0 && !this.config.followCursor) {
//         TEMP_OBJECT.scale.setScalar(0);
//       } else {
//         TEMP_OBJECT.scale.setScalar(this.physics.sizeData[i]);
//       }

//       TEMP_OBJECT.updateMatrix();
//       this.setMatrixAt(i, TEMP_OBJECT.matrix);

//       if (i === 0) {
//         this.pointLight.position.copy(TEMP_OBJECT.position);
//       }
//     }

//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// /* ======================================================================== */
// /*  Pointer helper                                                           */
// /* ======================================================================== */

// interface PointerState {
//   readonly domElement: HTMLElement;
//   readonly position: Vector2;
//   readonly normalized: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (state: PointerState) => void;
//   onMove: (state: PointerState) => void;
//   onLeave: (state: PointerState) => void;
//   onClick: (state: PointerState) => void;
// }

// const globalPointer = new Vector2();
// const pointerMap = new Map<HTMLElement, PointerState>();
// let globalPointerListenersAttached = false;

// function updatePointerState(state: PointerState, rect: DOMRect): void {
//   state.position.set(globalPointer.x - rect.left, globalPointer.y - rect.top);
//   state.normalized.set(
//     (state.position.x / rect.width) * 2 - 1,
//     (-state.position.y / rect.height) * 2 + 1,
//   );
// }

// function isInsideRect(rect: DOMRect): boolean {
//   return (
//     globalPointer.x >= rect.left &&
//     globalPointer.x <= rect.right &&
//     globalPointer.y >= rect.top &&
//     globalPointer.y <= rect.bottom
//   );
// }

// function handlePointerMove(event: PointerEvent): void {
//   globalPointer.set(event.clientX, event.clientY);

//   pointerMap.forEach((state, elem) => {
//     const rect = elem.getBoundingClientRect();

//     if (isInsideRect(rect)) {
//       updatePointerState(state, rect);

//       if (!state.hover) {
//         state.hover = true;
//         state.onEnter(state);
//       }
//       state.onMove(state);
//     } else if (state.hover && !state.touching) {
//       state.hover = false;
//       state.onLeave(state);
//     }
//   });
// }

// function handlePointerLeave(): void {
//   pointerMap.forEach((state) => {
//     if (state.hover) {
//       state.hover = false;
//       state.onLeave(state);
//     }
//   });
// }

// function handlePointerClick(event: PointerEvent): void {
//   globalPointer.set(event.clientX, event.clientY);

//   pointerMap.forEach((state, elem) => {
//     const rect = elem.getBoundingClientRect();
//     updatePointerState(state, rect);
//     if (isInsideRect(rect)) {
//       state.onClick(state);
//     }
//   });
// }

// function attachGlobalPointerListeners(): void {
//   if (globalPointerListenersAttached || typeof document === "undefined") return;
//   globalPointerListenersAttached = true;

//   document.body.addEventListener("pointermove", handlePointerMove);
//   document.body.addEventListener("pointerleave", handlePointerLeave);
//   document.body.addEventListener("click", handlePointerClick);
// }

// function detachGlobalPointerListeners(): void {
//   if (!globalPointerListenersAttached || typeof document === "undefined") return;
//   globalPointerListenersAttached = false;

//   document.body.removeEventListener("pointermove", handlePointerMove);
//   document.body.removeEventListener("pointerleave", handlePointerLeave);
//   document.body.removeEventListener("click", handlePointerClick);
// }

// function createPointerState(domElement: HTMLElement): PointerState {
//   attachGlobalPointerListeners();

//   const state: PointerState = {
//     domElement,
//     position: new Vector2(),
//     normalized: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onLeave: () => {},
//     onClick: () => {},
//   };

//   pointerMap.set(domElement, state);
//   return state;
// }

// function disposePointerState(domElement: HTMLElement): void {
//   pointerMap.delete(domElement);
//   if (pointerMap.size === 0) {
//     detachGlobalPointerListeners();
//   }
// }

// /* ======================================================================== */
// /*  createBallpit – инициализация сцены                                     */
// /* ======================================================================== */

// interface CreateBallpitResult {
//   engine: Engine;
//   spheres: Spheres;
//   setCount: (count: number) => void;
//   togglePause: () => void;
//   dispose: () => void;
// }

// function createBallpit(
//   canvas: HTMLCanvasElement,
//   config: Partial<BallpitConfig> = {},
// ): CreateBallpitResult {
//   const engine = new Engine({
//     canvas,
//     rendererOptions: { antialias: true, alpha: true },
//   });

//   engine.renderer.toneMapping = ACESFilmicToneMapping;
//   engine.camera.position.set(0, 0, 20);
//   engine.camera.lookAt(0, 0, 0);

//   let spheres = new Spheres(engine.renderer, config);
//   engine.scene.add(spheres);

//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();

//   let isPaused = false;

//   const pointerState = createPointerState(canvas);
//   pointerState.onMove = () => {
//     raycaster.setFromCamera(pointerState.normalized, engine.camera);
//     engine.camera.getWorldDirection(plane.normal);
//     raycaster.ray.intersectPlane(plane, intersectionPoint);

//     spheres.physics.center.copy(intersectionPoint);
//     spheres.config.controlSphere0 = true;
//   };
//   pointerState.onLeave = () => {
//     spheres.config.controlSphere0 = false;
//   };

//   engine.onBeforeRender = ({ delta }) => {
//     if (!isPaused) {
//       spheres.update(delta * 0.8); // слегка замедляем, чтобы движение было плавным
//     }
//   };

//   engine.onAfterResize = (size) => {
//     spheres.config.maxX = size.worldWidth / 2;
//     spheres.config.maxY = size.worldHeight / 2;
//   };

//   const initSpheres = (override: Partial<BallpitConfig>) => {
//     engine.scene.remove(spheres);
//     spheres.dispose();
//     spheres = new Spheres(engine.renderer, override);
//     engine.scene.add(spheres);
//   };

//   return {
//     engine,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initSpheres({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       disposePointerState(canvas);
//       engine.dispose();
//     },
//   };
// }

// /* ======================================================================== */
// /*  React-компонент Ballpit                                                 */
// /* ======================================================================== */

// export interface BallpitProps extends Partial<BallpitConfig> {
//   className?: string;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   className,
//   followCursor = true,
//   ...config
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const instanceRef = useRef<CreateBallpitResult | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     instanceRef.current = createBallpit(canvas, {
//       ...config,
//       followCursor,
//     });

//     return () => {
//       instanceRef.current?.dispose();
//     };
//   }, [followCursor, config]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// };

// export default Ballpit;





// // src/components/Ballpit.tsx
// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   Clock,
//   PerspectiveCamera,
//   Scene,
//   WebGLRenderer,
//   type WebGLRendererParameters,
//   SRGBColorSpace,
//   MathUtils,
//   Vector2,
//   Vector3,
//   MeshPhysicalMaterial,
//   ShaderChunk,
//   Color,
//   Object3D,
//   InstancedMesh,
//   PMREMGenerator,
//   SphereGeometry,
//   AmbientLight,
//   PointLight,
//   ACESFilmicToneMapping,
//   Raycaster,
//   Plane,
//   type MeshPhysicalMaterialParameters,
// } from "three";
// import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
// import { Observer } from "gsap/Observer";
// import { gsap } from "gsap";

// gsap.registerPlugin(Observer);

// /* ===================== ВСПОМОГАТЕЛЬНЫЕ ТИПЫ ===================== */

// type Shader = {
//   uniforms: Record<string, unknown>;
//   fragmentShader: string;
//   vertexShader: string;
// };

// interface XConfig {
//   canvas?: HTMLCanvasElement;
//   id?: string;
//   rendererOptions?: Partial<WebGLRendererParameters>;
//   size?: "parent" | { width: number; height: number };
// }

// interface SizeData {
//   width: number;
//   height: number;
//   wWidth: number;
//   wHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// interface DisposableLike {
//   dispose?(): void;
// }

// type MaterialLike = DisposableLike & Record<string, unknown>;

// type MeshLike = Object3D & {
//   isMesh?: boolean;
//   material?: MaterialLike;
//   geometry?: DisposableLike;
// };

// interface PostprocessingLike {
//   setSize?(width: number, height: number): void;
//   render?(): void;
//   dispose?(): void;
// }

// /* ===================== БАЗОВЫЙ THREE-КОНТЕЙНЕР ===================== */

// class X {
//   #config: XConfig;
//   #postprocessing?: PostprocessingLike;
//   #resizeObserver?: ResizeObserver;
//   #intersectionObserver?: IntersectionObserver;
//   #resizeTimer?: number;
//   #animationFrameId = 0;
//   #clock: Clock = new Clock();
//   #animationState = { elapsed: 0, delta: 0 };
//   #isAnimating = false;
//   #isVisible = false;

//   canvas!: HTMLCanvasElement;
//   camera!: PerspectiveCamera;
//   cameraMinAspect?: number;
//   cameraMaxAspect?: number;
//   cameraFov!: number;
//   maxPixelRatio?: number;
//   minPixelRatio?: number;
//   scene!: Scene;
//   renderer!: WebGLRenderer;

//   size: SizeData = {
//     width: 0,
//     height: 0,
//     wWidth: 0,
//     wHeight: 0,
//     ratio: 0,
//     pixelRatio: 0,
//   };

//   render: () => void = this.#render.bind(this);
//   onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {};
//   onAfterRender: (state: { elapsed: number; delta: number }) => void = () => {};
//   onAfterResize: (size: SizeData) => void = () => {};
//   isDisposed = false;

//   constructor(config: XConfig) {
//     this.#config = { ...config };
//     this.#initCamera();
//     this.#initScene();
//     this.#initRenderer();
//     this.resize();
//     this.#initObservers();
//   }

//   #initCamera() {
//     this.camera = new PerspectiveCamera();
//     this.cameraFov = this.camera.fov;
//   }

//   #initScene() {
//     this.scene = new Scene();
//   }

//   #initRenderer() {
//     if (this.#config.canvas) {
//       this.canvas = this.#config.canvas;
//     } else if (this.#config.id) {
//       const elem = document.getElementById(this.#config.id);
//       if (elem instanceof HTMLCanvasElement) {
//         this.canvas = elem;
//       } else {
//         console.error("Three: Missing canvas or id parameter");
//       }
//     } else {
//       console.error("Three: Missing canvas or id parameter");
//     }

//     this.canvas.style.display = "block";

//     const rendererOptions: WebGLRendererParameters = {
//       canvas: this.canvas,
//       powerPreference: "high-performance",
//       ...(this.#config.rendererOptions ?? {}),
//     };

//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;
//   }

//   #initObservers() {
//     if (!(this.#config.size instanceof Object)) {
//       window.addEventListener("resize", this.#onResize);
//       if (this.#config.size === "parent" && this.canvas.parentNode) {
//         this.#resizeObserver = new ResizeObserver(this.#onResize);
//         this.#resizeObserver.observe(this.canvas.parentNode as Element);
//       }
//     }

//     this.#intersectionObserver = new IntersectionObserver(
//       this.#onIntersection,
//       {
//         root: null,
//         rootMargin: "0px",
//         threshold: 0,
//       }
//     );
//     this.#intersectionObserver.observe(this.canvas);

//     document.addEventListener("visibilitychange", this.#onVisibilityChange);
//   }

//   #onResize = () => {
//     if (this.#resizeTimer) window.clearTimeout(this.#resizeTimer);
//     this.#resizeTimer = window.setTimeout(() => this.resize(), 100);
//   };

//   resize() {
//     let w: number;
//     let h: number;

//     if (this.#config.size instanceof Object) {
//       w = this.#config.size.width;
//       h = this.#config.size.height;
//     } else if (this.#config.size === "parent" && this.canvas.parentNode) {
//       w = (this.canvas.parentNode as HTMLElement).offsetWidth;
//       h = (this.canvas.parentNode as HTMLElement).offsetHeight;
//     } else {
//       w = window.innerWidth;
//       h = window.innerHeight;
//     }

//     this.size.width = w;
//     this.size.height = h;
//     this.size.ratio = w / h;

//     this.#updateCamera();
//     this.#updateRenderer();
//     this.onAfterResize(this.size);
//   }

//   #updateCamera() {
//     this.camera.aspect = this.size.width / this.size.height;

//     if (this.cameraFov) {
//       if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
//         this.#adjustFov(this.cameraMinAspect);
//       } else if (
//         this.cameraMaxAspect &&
//         this.camera.aspect > this.cameraMaxAspect
//       ) {
//         this.#adjustFov(this.cameraMaxAspect);
//       } else {
//         this.camera.fov = this.cameraFov;
//       }
//     }

//     this.camera.updateProjectionMatrix();
//     this.updateWorldSize();
//   }

//   #adjustFov(aspect: number) {
//     const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
//     const newTan = tanFov / (this.camera.aspect / aspect);
//     this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
//   }

//   updateWorldSize() {
//     const fovRad = (this.camera.fov * Math.PI) / 180;
//     this.size.wHeight =
//       2 * Math.tan(fovRad / 2) * this.camera.position.length();
//     this.size.wWidth = this.size.wHeight * this.camera.aspect;
//   }

//   #updateRenderer() {
//     this.renderer.setSize(this.size.width, this.size.height);
//     this.#postprocessing?.setSize?.(this.size.width, this.size.height);

//     let pr = window.devicePixelRatio;
//     if (this.maxPixelRatio && pr > this.maxPixelRatio) {
//       pr = this.maxPixelRatio;
//     } else if (this.minPixelRatio && pr < this.minPixelRatio) {
//       pr = this.minPixelRatio;
//     }

//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;
//   }

//   get postprocessing(): PostprocessingLike | undefined {
//     return this.#postprocessing;
//   }

//   set postprocessing(value: PostprocessingLike | undefined) {
//     this.#postprocessing = value;
//     if (value?.render) {
//       this.render = value.render.bind(value);
//     } else {
//       this.render = this.#render.bind(this);
//     }
//   }

//   #onIntersection = (entries: IntersectionObserverEntry[]) => {
//     this.#isAnimating = entries[0]?.isIntersecting ?? false;
//     this.#isAnimating ? this.#startAnimation() : this.#stopAnimation();
//   };

//   #onVisibilityChange = () => {
//     if (this.#isAnimating) {
//       document.hidden ? this.#stopAnimation() : this.#startAnimation();
//     }
//   };

//   #startAnimation() {
//     if (this.#isVisible) return;

//     const animateFrame = () => {
//       this.#animationFrameId = requestAnimationFrame(animateFrame);
//       this.#animationState.delta = this.#clock.getDelta();
//       this.#animationState.elapsed += this.#animationState.delta;
//       this.onBeforeRender(this.#animationState);
//       this.render();
//       this.onAfterRender(this.#animationState);
//     };

//     this.#isVisible = true;
//     this.#clock.start();
//     animateFrame();
//   }

//   #stopAnimation() {
//     if (!this.#isVisible) return;
//     cancelAnimationFrame(this.#animationFrameId);
//     this.#isVisible = false;
//     this.#clock.stop();
//   }

//   #render() {
//     this.renderer.render(this.scene, this.camera);
//   }

//   clear() {
//     this.scene.traverse((obj) => {
//       const mesh = obj as MeshLike;
//       if (mesh.isMesh && mesh.material) {
//         const material = mesh.material;

//         Object.values(material).forEach((value) => {
//           if (
//             typeof value === "object" &&
//             value !== null &&
//             "dispose" in value &&
//             typeof (value as DisposableLike).dispose === "function"
//           ) {
//             (value as DisposableLike).dispose?.();
//           }
//         });

//         material.dispose?.();
//         mesh.geometry?.dispose?.();
//       }
//     });

//     this.scene.clear();
//   }

//   dispose() {
//     this.#onResizeCleanup();
//     this.#stopAnimation();
//     this.clear();
//     this.#postprocessing?.dispose?.();
//     this.renderer.dispose();
//     this.isDisposed = true;
//   }

//   #onResizeCleanup() {
//     window.removeEventListener("resize", this.#onResize);
//     this.#resizeObserver?.disconnect();
//     this.#intersectionObserver?.disconnect();
//     document.removeEventListener("visibilitychange", this.#onVisibilityChange);
//   }
// }

// /* ===================== ФИЗИКА ШАРИКОВ ===================== */

// interface WConfig {
//   count: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   maxSize: number;
//   minSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   controlSphere0?: boolean;
//   followCursor?: boolean;
// }

// class W {
//   config: WConfig;
//   positionData: Float32Array;
//   velocityData: Float32Array;
//   sizeData: Float32Array;
//   center: Vector3 = new Vector3();

//   constructor(config: WConfig) {
//     this.config = config;
//     this.positionData = new Float32Array(3 * config.count).fill(0);
//     this.velocityData = new Float32Array(3 * config.count).fill(0);
//     this.sizeData = new Float32Array(config.count).fill(1);
//     this.center = new Vector3();
//     this.#initializePositions();
//     this.setSizes();
//   }

//   #initializePositions() {
//     const { config, positionData } = this;
//     this.center.toArray(positionData, 0);

//     for (let i = 1; i < config.count; i++) {
//       const idx = 3 * i;
//       positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   setSizes() {
//     const { config, sizeData } = this;
//     sizeData[0] = config.size0;

//     for (let i = 1; i < config.count; i++) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     const { config, center, positionData, sizeData, velocityData } = this;

//     let startIdx = 0;
//     if (config.controlSphere0) {
//       startIdx = 1;
//       const firstVec = new Vector3().fromArray(positionData, 0);
//       firstVec.lerp(center, 0.1).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }

//     // движение + гравитация
//     for (let idx = startIdx; idx < config.count; idx++) {
//       const base = 3 * idx;
//       const pos = new Vector3().fromArray(positionData, base);
//       const vel = new Vector3().fromArray(velocityData, base);

//       vel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
//       vel.multiplyScalar(config.friction);
//       vel.clampLength(0, config.maxVelocity);

//       pos.add(vel);
//       pos.toArray(positionData, base);
//       vel.toArray(velocityData, base);
//     }

//     // столкновения и стены
//     for (let idx = startIdx; idx < config.count; idx++) {
//       const base = 3 * idx;
//       const pos = new Vector3().fromArray(positionData, base);
//       const vel = new Vector3().fromArray(velocityData, base);
//       const radius = sizeData[idx];

//       // столкновения шариков
//       for (let jdx = idx + 1; jdx < config.count; jdx++) {
//         const otherBase = 3 * jdx;
//         const otherPos = new Vector3().fromArray(positionData, otherBase);
//         const otherVel = new Vector3().fromArray(velocityData, otherBase);

//         const diff = new Vector3().copy(otherPos).sub(pos);
//         const dist = diff.length();
//         const sumRadius = radius + sizeData[jdx];

//         if (dist < sumRadius) {
//           const overlap = sumRadius - dist;
//           const correction = diff.normalize().multiplyScalar(0.5 * overlap);
//           const velCorrection = correction.clone().multiplyScalar(
//             Math.max(vel.length(), 1)
//           );

//           pos.sub(correction);
//           vel.sub(velCorrection);
//           pos.toArray(positionData, base);
//           vel.toArray(velocityData, base);

//           otherPos.add(correction);
//           otherVel.add(
//             correction.clone().multiplyScalar(Math.max(otherVel.length(), 1))
//           );
//           otherPos.toArray(positionData, otherBase);
//           otherVel.toArray(velocityData, otherBase);
//         }
//       }

//       // столкновение с первым шаром (курсор)
//       if (config.controlSphere0) {
//         const diff = new Vector3()
//           .copy(new Vector3().fromArray(positionData, 0))
//           .sub(pos);
//         const d = diff.length();
//         const sumRadius0 = radius + sizeData[0];

//         if (d < sumRadius0) {
//           const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
//           const velCorrection = correction.clone().multiplyScalar(
//             Math.max(vel.length(), 2)
//           );
//           pos.sub(correction);
//           vel.sub(velCorrection);
//         }
//       }

//       // стены
//       if (Math.abs(pos.x) + radius > config.maxX) {
//         pos.x = Math.sign(pos.x) * (config.maxX - radius);
//         vel.x = -vel.x * config.wallBounce;
//       }

//       if (config.gravity === 0) {
//         if (Math.abs(pos.y) + radius > config.maxY) {
//           pos.y = Math.sign(pos.y) * (config.maxY - radius);
//           vel.y = -vel.y * config.wallBounce;
//         }
//       } else if (pos.y - radius < -config.maxY) {
//         pos.y = -config.maxY + radius;
//         vel.y = -vel.y * config.wallBounce;
//       }

//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(pos.z) + radius > maxBoundary) {
//         pos.z = Math.sign(pos.z) * (config.maxZ - radius);
//         vel.z = -vel.z * config.wallBounce;
//       }

//       pos.toArray(positionData, base);
//       vel.toArray(velocityData, base);
//     }
//   }
// }

// /* ===================== МАТЕРИАЛ С «ТОЛЩИНОЙ» ===================== */

// class Y extends MeshPhysicalMaterial {
//   uniforms: { [key: string]: { value: unknown } } = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2 },
//     thicknessScale: { value: 10 },
//   };

//   defines: Record<string, string> = {};

//   constructor(params: MeshPhysicalMaterialParameters) {
//     super(params);

//     this.defines = { USE_UV: "" };

//     this.onBeforeCompile = (shader: Shader) => {
//       Object.assign(shader.uniforms, this.uniforms);

//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//         ` + shader.fragmentShader;

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "void main() {",
//         `
//         void RE_Direct_Scattering(
//           const in IncidentLight directLight,
//           const in vec2 uv,
//           const in vec3 geometryPosition,
//           const in vec3 geometryNormal,
//           const in vec3 geometryViewDir,
//           const in vec3 geometryClearcoatNormal,
//           inout ReflectedLight reflectedLight
//         ) {
//           vec3 scatteringHalf =
//             normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot =
//             pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower)
//             * thicknessScale;

//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif

//           reflectedLight.directDiffuse +=
//             scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//         `
//       );

//       const lightsChunk = ShaderChunk.lights_fragment_begin.replace(
//         "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
//         `
//           RE_Direct(
//             directLight,
//             geometryPosition,
//             geometryNormal,
//             geometryViewDir,
//             geometryClearcoatNormal,
//             material,
//             reflectedLight
//           );
//           RE_Direct_Scattering(
//             directLight,
//             vUv,
//             geometryPosition,
//             geometryNormal,
//             geometryViewDir,
//             geometryClearcoatNormal,
//             reflectedLight
//           );
//         `
//       );

//       shader.fragmentShader = shader.fragmentShader.replace(
//         "#include <lights_fragment_begin>",
//         lightsChunk
//       );

//       if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
//     };
//   }

//   onBeforeCompile2?: (shader: Shader) => void;
// }

// /* ===================== КОНФИГ ШАРИКОВ ===================== */

// const XConfigDefaults = {
//   count: 220,
//   colors: [0x6366f1, 0xf97316, 0xe5e7eb, 0xa855f7],
//   ambientColor: 0xffffff,
//   ambientIntensity: 1.1,
//   lightIntensity: 220,
//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.35,
//     clearcoat: 1,
//     clearcoatRoughness: 0.12,
//   },
//   minSize: 0.55,
//   maxSize: 1.2,
//   size0: 1.4,
//   gravity: 0.35,
//   friction: 0.995,
//   wallBounce: 0.96,
//   maxVelocity: 0.18,
//   maxX: 5,
//   maxY: 5,
//   maxZ: 2.4,
//   controlSphere0: false,
//   followCursor: true,
// } as const;

// const U = new Object3D();

// /* ===================== POINTER УТИЛИТЫ ===================== */

// let globalPointerActive = false;
// const pointerPosition = new Vector2();

// interface PointerData {
//   position: Vector2;
//   nPosition: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (data: PointerData) => void;
//   onMove: (data: PointerData) => void;
//   onClick: (data: PointerData) => void;
//   onLeave: (data: PointerData) => void;
//   dispose?: () => void;
// }

// const pointerMap = new Map<HTMLElement, PointerData>();

// function updatePointerData(data: PointerData, rect: DOMRect) {
//   data.position.set(pointerPosition.x - rect.left, pointerPosition.y - rect.top);
//   data.nPosition.set(
//     (data.position.x / rect.width) * 2 - 1,
//     (-data.position.y / rect.height) * 2 + 1
//   );
// }

// function isInside(rect: DOMRect) {
//   return (
//     pointerPosition.x >= rect.left &&
//     pointerPosition.x <= rect.left + rect.width &&
//     pointerPosition.y >= rect.top &&
//     pointerPosition.y <= rect.top + rect.height
//   );
// }

// function processPointerInteraction() {
//   for (const [elem, data] of pointerMap) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && !data.touching) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onPointerMove(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   processPointerInteraction();
// }

// function onPointerClick(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   for (const [elem, data] of pointerMap) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) data.onClick(data);
//   }
// }

// function onPointerLeave() {
//   for (const data of pointerMap.values()) {
//     if (data.hover) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onTouchStart(e: TouchEvent) {
//   if (e.touches.length === 0) return;

//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);

//   for (const [elem, data] of pointerMap) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       data.touching = true;
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     }
//   }
// }

// function onTouchMove(e: TouchEvent) {
//   if (e.touches.length === 0) return;

//   e.preventDefault();
//   pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);

//   for (const [elem, data] of pointerMap) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) {
//       if (!data.hover) {
//         data.hover = true;
//         data.touching = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && data.touching) {
//       data.onMove(data);
//     }
//   }
// }

// function onTouchEnd() {
//   for (const [, data] of pointerMap) {
//     if (data.touching) {
//       data.touching = false;
//       if (data.hover) {
//         data.hover = false;
//         data.onLeave(data);
//       }
//     }
//   }
// }

// function createPointerData(
//   options: Partial<PointerData> & { domElement: HTMLElement }
// ): PointerData {
//   const defaultData: PointerData = {
//     position: new Vector2(),
//     nPosition: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onClick: () => {},
//     onLeave: () => {},
//     ...options,
//   };

//   if (!pointerMap.has(options.domElement)) {
//     pointerMap.set(options.domElement, defaultData);

//     if (!globalPointerActive) {
//       document.body.addEventListener("pointermove", onPointerMove);
//       document.body.addEventListener("pointerleave", onPointerLeave);
//       document.body.addEventListener("click", onPointerClick);

//       document.body.addEventListener("touchstart", onTouchStart, {
//         passive: false,
//       });
//       document.body.addEventListener("touchmove", onTouchMove, {
//         passive: false,
//       });
//       document.body.addEventListener("touchend", onTouchEnd, {
//         passive: false,
//       });
//       document.body.addEventListener("touchcancel", onTouchEnd, {
//         passive: false,
//       });

//       globalPointerActive = true;
//     }
//   }

//   defaultData.dispose = () => {
//     pointerMap.delete(options.domElement);
//     if (pointerMap.size === 0) {
//       document.body.removeEventListener("pointermove", onPointerMove);
//       document.body.removeEventListener("pointerleave", onPointerLeave);
//       document.body.removeEventListener("click", onPointerClick);

//       document.body.removeEventListener("touchstart", onTouchStart);
//       document.body.removeEventListener("touchmove", onTouchMove);
//       document.body.removeEventListener("touchend", onTouchEnd);
//       document.body.removeEventListener("touchcancel", onTouchEnd);

//       globalPointerActive = false;
//     }
//   };

//   return defaultData;
// }

// /* ===================== INSTANCED МЕШ СФЕР ===================== */

// class Z extends InstancedMesh {
//   config: typeof XConfigDefaults;
//   physics: W;
//   ambientLight?: AmbientLight;
//   light?: PointLight;

//   constructor(
//     renderer: WebGLRenderer,
//     params: Partial<typeof XConfigDefaults> = {}
//   ) {
//     const config: typeof XConfigDefaults = { ...XConfigDefaults, ...params };

//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envTexture = pmrem.fromScene(roomEnv).texture;

//     const geometry = new SphereGeometry();
//     const material = new Y({
//       envMap: envTexture,
//       ...config.materialParams,
//     });

//     material.envMapRotation.x = -Math.PI / 2;

//     super(geometry, material, config.count);

//     this.config = config;
//     this.physics = new W(config);
//     this.#setupLights();
//     this.setColors(config.colors);
//   }

//   #setupLights() {
//     this.ambientLight = new AmbientLight(
//       this.config.ambientColor,
//       this.config.ambientIntensity
//     );
//     this.add(this.ambientLight);

//     this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
//     this.add(this.light);
//   }

//   setColors(colors: number[]) {
//     if (!Array.isArray(colors) || colors.length <= 1) return;

//     const colorUtils = ((colorsArr: number[]) => {
//       let baseColors = colorsArr;
//       let colorObjects: Color[] = baseColors.map((col) => new Color(col));

//       return {
//         setColors(cols: number[]) {
//           baseColors = cols;
//           colorObjects = baseColors.map((col) => new Color(col));
//         },
//         getColorAt(ratio: number, out: Color = new Color()) {
//           const clamped = Math.max(0, Math.min(1, ratio));
//           const scaled = clamped * (baseColors.length - 1);
//           const idx = Math.floor(scaled);
//           const start = colorObjects[idx];

//           if (idx >= baseColors.length - 1) return start.clone();

//           const alpha = scaled - idx;
//           const end = colorObjects[idx + 1];

//           out.r = start.r + alpha * (end.r - start.r);
//           out.g = start.g + alpha * (end.g - start.g);
//           out.b = start.b + alpha * (end.b - start.b);
//           return out;
//         },
//       };
//     })(colors);

//     for (let idx = 0; idx < this.count; idx++) {
//       const color = colorUtils.getColorAt(idx / this.count);
//       this.setColorAt(idx, color);

//       if (idx === 0 && this.light) {
//         this.light.color.copy(color);
//       }
//     }

//     if (this.instanceColor) {
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     this.physics.update(deltaInfo);

//     for (let idx = 0; idx < this.count; idx++) {
//       U.position.fromArray(this.physics.positionData, 3 * idx);

//       if (idx === 0 && this.config.followCursor === false) {
//         U.scale.setScalar(0);
//       } else {
//         U.scale.setScalar(this.physics.sizeData[idx]);
//       }

//       U.updateMatrix();
//       this.setMatrixAt(idx, U.matrix);

//       if (idx === 0 && this.light) {
//         this.light.position.copy(U.position);
//       }
//     }

//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// /* ===================== ФАБРИКА BALLPIT ===================== */

// interface CreateBallpitReturn {
//   three: X;
//   spheres: Z;
//   setCount: (count: number) => void;
//   togglePause: () => void;
//   dispose: () => void;
// }

// function createBallpit(
//   canvas: HTMLCanvasElement,
//   config: Partial<typeof XConfigDefaults> = {}
// ): CreateBallpitReturn {
//   const threeInstance = new X({
//     canvas,
//     size: "parent",
//     rendererOptions: { antialias: true, alpha: true },
//   });

//   let spheres: Z;

//   threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
//   threeInstance.camera.position.set(0, 0, 20);
//   threeInstance.camera.lookAt(0, 0, 0);
//   threeInstance.cameraMaxAspect = 1.5;
//   threeInstance.resize();

//   const initSpheres = (cfg: Partial<typeof XConfigDefaults>) => {
//     if (spheres) {
//       threeInstance.clear();
//       threeInstance.scene.remove(spheres);
//     }
//     spheres = new Z(threeInstance.renderer, cfg);
//     threeInstance.scene.add(spheres);
//   };

//   initSpheres(config);

//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();
//   let isPaused = false;

//   canvas.style.touchAction = "none";
//   canvas.style.userSelect = "none";
//   canvas.style.setProperty("-webkit-user-select", "none");

//   const pointerData = createPointerData({
//     domElement: canvas,
//     onMove() {
//       raycaster.setFromCamera(pointerData.nPosition, threeInstance.camera);
//       threeInstance.camera.getWorldDirection(plane.normal);
//       raycaster.ray.intersectPlane(plane, intersectionPoint);
//       spheres.physics.center.copy(intersectionPoint);
//       spheres.config.controlSphere0 = true;
//     },
//     onLeave() {
//       spheres.config.controlSphere0 = false;
//     },
//   });

//   threeInstance.onBeforeRender = (deltaInfo) => {
//     if (!isPaused) spheres.update(deltaInfo);
//   };

//   threeInstance.onAfterResize = (size) => {
//     spheres.config.maxX = size.wWidth / 2;
//     spheres.config.maxY = size.wHeight / 2;
//   };

//   return {
//     three: threeInstance,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initSpheres({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       pointerData.dispose?.();
//       threeInstance.dispose();
//     },
//   };
// }

// /* ===================== REACT-КОМПОНЕНТ ===================== */

// interface BallpitProps {
//   className?: string;
//   followCursor?: boolean;
//   // Дополнительные поля для переопределения конфига
//   [key: string]: unknown;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   className = "",
//   followCursor = true,
//   ...props
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const instanceRef = useRef<CreateBallpitReturn | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     instanceRef.current = createBallpit(canvas, {
//       followCursor,
//       ...(props as Partial<typeof XConfigDefaults>),
//     });

//     return () => {
//       instanceRef.current?.dispose();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// };

// export default Ballpit;





//---------слишком быстро работают шарики, нужно замедлить их движение и сделать более плавным отклик на мышь---------
// // src/components/Ballpit.tsx
// "use client";

// import React, { useEffect, useRef } from "react";
// import * as THREE from "three";

// export interface BallpitProps {
//   count?: number;
//   gravity?: number;    // сила притяжения к центру
//   friction?: number;   // трение
//   wallBounce?: number; // отскок от "стен"
//   followCursor?: boolean;
//   className?: string;
// }

// const Ballpit: React.FC<BallpitProps> = ({
//   count = 160,
//   gravity = 0.16,      // было 0.22 – чуть мягче
//   friction = 1.999,    // было 0.992 – медленнее разгоняются/затухают
//   wallBounce = 0.96,
//   followCursor = true,
//   className,
// }) => {
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const frameIdRef = useRef<number | null>(null);

//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;

//     // ---------- СЦЕНА И КАМЕРА ----------
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x020015);
//     scene.fog = new THREE.Fog(0x020015, 180, 450);

//     const camera = new THREE.PerspectiveCamera(
//       45,
//       container.clientWidth / container.clientHeight,
//       1,
//       1000
//     );
//     camera.position.set(0, 0, 260);

//     const renderer = new THREE.WebGLRenderer({
//       antialias: true,
//       alpha: true,
//     });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.setSize(container.clientWidth, container.clientHeight);
//     renderer.outputColorSpace = THREE.SRGBColorSpace;
//     container.appendChild(renderer.domElement);

//     // ---------- СВЕТ ----------
//     const ambient = new THREE.AmbientLight(0xffffff, 0.55);
//     scene.add(ambient);

//     const magentaLight = new THREE.PointLight(0xff4bd1, 1.2, 800, 2);
//     const cyanLight = new THREE.PointLight(0x48d8ff, 1.2, 800, 2);
//     const goldLight = new THREE.PointLight(0xffd166, 0.8, 800, 2);

//     scene.add(magentaLight);
//     scene.add(cyanLight);
//     scene.add(goldLight);

//     // ---------- ГЕОМЕТРИЯ И ШАРИКИ ----------
//     const baseGeometry = new THREE.SphereGeometry(1, 32, 32);

//     const neonPalette: THREE.Color[] = [
//       new THREE.Color("#ffffff"),
//       new THREE.Color("#f5f5ff"),
//       new THREE.Color("#9f7bff"),
//       new THREE.Color("#6c63ff"),
//       new THREE.Color("#4dd0ff"),
//       new THREE.Color("#ff7ce5"),
//       new THREE.Color("#ffd166"),
//     ];

//     interface Ball {
//       mesh: THREE.Mesh;
//       velocity: THREE.Vector3;
//       spinSpeed: THREE.Vector3;
//       swirlSeed: THREE.Vector3;
//     }

//     const balls: Ball[] = [];
//     const bounds = {
//       x: 140,
//       y: 90,
//       z: 140,
//     };

//     const createMaterial = (color: THREE.Color): THREE.MeshPhysicalMaterial => {
//       return new THREE.MeshPhysicalMaterial({
//         color,
//         metalness: 0.4,
//         roughness: 0.15,
//         clearcoat: 0.95,
//         clearcoatRoughness: 0.1,
//         reflectivity: 1.0,
//         emissive: color.clone().multiplyScalar(0.25),
//         emissiveIntensity: 0.8,
//       });
//     };

//     for (let i = 0; i < count; i += 1) {
//       const color =
//         neonPalette[Math.floor(Math.random() * neonPalette.length)] ??
//         neonPalette[0];

//       const material = createMaterial(color);
//       const mesh = new THREE.Mesh(baseGeometry, material);

//       const radius = THREE.MathUtils.randFloat(4, 12);
//       mesh.scale.setScalar(radius);

//       mesh.position.set(
//         THREE.MathUtils.randFloatSpread(bounds.x * 2),
//         THREE.MathUtils.randFloatSpread(bounds.y * 2),
//         THREE.MathUtils.randFloatSpread(bounds.z * 2)
//       );

//       // медленнее стартовая скорость
//       const velocity = new THREE.Vector3(
//         THREE.MathUtils.randFloatSpread(0.35),
//         THREE.MathUtils.randFloatSpread(0.35),
//         THREE.MathUtils.randFloatSpread(0.35)
//       );

//       const spinSpeed = new THREE.Vector3(
//         THREE.MathUtils.randFloat(0.12, 0.4),
//         THREE.MathUtils.randFloat(0.12, 0.4),
//         THREE.MathUtils.randFloat(0.12, 0.4)
//       );

//       const swirlSeed = new THREE.Vector3(
//         Math.random() * Math.PI * 2,
//         Math.random() * Math.PI * 2,
//         Math.random() * Math.PI * 2
//       );

//       scene.add(mesh);
//       balls.push({ mesh, velocity, spinSpeed, swirlSeed });
//     }

//     // ---------- УПРАВЛЕНИЕ МЫШЬЮ ----------
//     const targetRotation = new THREE.Vector2(0, 0);
//     const currentRotation = new THREE.Vector2(0, 0);

//     const pointerInfluence = new THREE.Vector2(0, 0);

//     const handlePointerMove = (event: PointerEvent): void => {
//       if (!followCursor) return;

//       const rect = container.getBoundingClientRect();
//       const nx = (event.clientX - rect.left) / rect.width - 0.5;
//       const ny = (event.clientY - rect.top) / rect.height - 0.5;

//       targetRotation.set(nx, ny);
//       pointerInfluence.set(nx, ny);
//     };

//     if (followCursor) {
//       window.addEventListener("pointermove", handlePointerMove);
//     }

//     // ---------- RESIZE ----------
//     const handleResize = (): void => {
//       if (!container) return;
//       const { clientWidth, clientHeight } = container;
//       camera.aspect = clientWidth / clientHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(clientWidth, clientHeight);
//     };

//     window.addEventListener("resize", handleResize);

//     // ---------- АНИМАЦИЯ ----------
//     const clock = new THREE.Clock();

//     const step = (): void => {
//       const delta = clock.getDelta();
//       const elapsed = clock.getElapsedTime();

//       // медленнее движение света
//       magentaLight.position.set(
//         Math.sin(elapsed * 0.55) * 160,
//         Math.cos(elapsed * 0.45) * 80,
//         80
//       );
//       cyanLight.position.set(
//         Math.cos(elapsed * 0.4 + 1.2) * -150,
//         Math.sin(elapsed * 0.5 + 0.4) * 90,
//         -60
//       );
//       goldLight.position.set(
//         Math.sin(elapsed * 0.6 + 2.3) * 60,
//         Math.cos(elapsed * 0.35 + 1.7) * -110,
//         120
//       );

//       // плавнее реакция камеры
//       currentRotation.lerp(targetRotation, 0.04);
//       camera.position.x = currentRotation.x * 45;
//       camera.position.y = -currentRotation.y * 38;
//       camera.lookAt(0, 0, 0);

//       const centerForceStrength = gravity * 45; // было *60
//       const swirlStrength = 6;                 // было 14 – намного мягче
//       const pointerPush = followCursor ? 4 : 0; // было 8

//       for (const ball of balls) {
//         const { mesh, velocity, spinSpeed, swirlSeed } = ball;

//         // мягкое "бурление"
//         const swirl = new THREE.Vector3(
//           Math.sin(elapsed * 0.65 + swirlSeed.x),
//           Math.cos(elapsed * 0.8 + swirlSeed.y),
//           Math.sin(elapsed * 0.55 + swirlSeed.z)
//         ).multiplyScalar(swirlStrength * delta);

//         velocity.add(swirl);

//         // притяжение к центру
//         const toCenter = new THREE.Vector3()
//           .copy(mesh.position)
//           .multiplyScalar(-1);
//         const distanceToCenter = toCenter.length() || 1;
//         toCenter.normalize().multiplyScalar(
//           (centerForceStrength * delta) / distanceToCenter
//         );
//         velocity.add(toCenter);

//         // лёгкое влияние мыши
//         if (followCursor) {
//           const pointerForce = new THREE.Vector3(
//             pointerInfluence.x,
//             -pointerInfluence.y,
//             0
//           ).multiplyScalar(pointerPush * delta);
//           velocity.add(pointerForce);
//         }

//         // движение — уменьшил множитель с 60 до 35
//         mesh.position.addScaledVector(velocity, 35 * delta);

//         // отскоки от "стен"
//         if (mesh.position.x < -bounds.x) {
//           mesh.position.x = -bounds.x;
//           velocity.x *= -wallBounce;
//         } else if (mesh.position.x > bounds.x) {
//           mesh.position.x = bounds.x;
//           velocity.x *= -wallBounce;
//         }

//         if (mesh.position.y < -bounds.y) {
//           mesh.position.y = -bounds.y;
//           velocity.y *= -wallBounce;
//         } else if (mesh.position.y > bounds.y) {
//           mesh.position.y = bounds.y;
//           velocity.y *= -wallBounce;
//         }

//         if (mesh.position.z < -bounds.z) {
//           mesh.position.z = -bounds.z;
//           velocity.z *= -wallBounce;
//         } else if (mesh.position.z > bounds.z) {
//           mesh.position.z = bounds.z;
//           velocity.z *= -wallBounce;
//         }

//         // трение
//         velocity.multiplyScalar(friction);

//         // вращение — тоже чуть мягче
//         mesh.rotation.x += spinSpeed.x * delta;
//         mesh.rotation.y += spinSpeed.y * delta;
//         mesh.rotation.z += spinSpeed.z * delta;
//       }

//       renderer.render(scene, camera);
//       frameIdRef.current = window.requestAnimationFrame(step);
//     };

//     frameIdRef.current = window.requestAnimationFrame(step);

//     // ---------- CLEANUP ----------
//     return () => {
//       if (frameIdRef.current !== null) {
//         window.cancelAnimationFrame(frameIdRef.current);
//       }

//       window.removeEventListener("resize", handleResize);
//       if (followCursor) {
//         window.removeEventListener("pointermove", handlePointerMove);
//       }

//       balls.forEach(({ mesh }) => {
//         const material = mesh.material;
//         if (material instanceof THREE.Material) {
//           material.dispose();
//         }
//         scene.remove(mesh);
//       });

//       baseGeometry.dispose();
//       renderer.dispose();

//       if (container.contains(renderer.domElement)) {
//         container.removeChild(renderer.domElement);
//       }
//     };
//   }, [count, friction, gravity, wallBounce, followCursor]);

//   return (
//     <div
//       ref={containerRef}
//       className={className}
//       style={{ width: "100%", height: "100%" }}
//     />
//   );
// };

// export default Ballpit;





// // src/components/Ballpit.tsx
// import React, { useRef, useEffect } from 'react';
// import {
//   Clock,
//   PerspectiveCamera,
//   Scene,
//   WebGLRenderer,
//   WebGLRendererParameters,
//   SRGBColorSpace,
//   MathUtils,
//   Vector2,
//   Vector3,
//   MeshPhysicalMaterial,
//   ShaderChunk,
//   Color,
//   Object3D,
//   InstancedMesh,
//   PMREMGenerator,
//   SphereGeometry,
//   AmbientLight,
//   PointLight,
//   ACESFilmicToneMapping,
//   Raycaster,
//   Plane
// } from 'three';
// import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// interface Postprocessing {
//   render: () => void;
//   setSize: (width: number, height: number) => void;
//   dispose: () => void;
// }

// interface XConfig {
//   canvas?: HTMLCanvasElement;
//   id?: string;
//   rendererOptions?: Partial<WebGLRendererParameters>;
//   size?: 'parent' | { width: number; height: number };
// }

// interface SizeData {
//   width: number;
//   height: number;
//   wWidth: number;
//   wHeight: number;
//   ratio: number;
//   pixelRatio: number;
// }

// class X {
//   #config: XConfig;
//   #postprocessing?: Postprocessing;
//   #resizeObserver?: ResizeObserver;
//   #intersectionObserver?: IntersectionObserver;
//   #resizeTimer?: number;
//   #animationFrameId: number = 0;
//   #clock: Clock = new Clock();
//   #animationState = { elapsed: 0, delta: 0 };
//   #isAnimating: boolean = false;
//   #isVisible: boolean = false;

//   canvas!: HTMLCanvasElement;
//   camera!: PerspectiveCamera;
//   cameraMinAspect?: number;
//   cameraMaxAspect?: number;
//   cameraFov!: number;
//   maxPixelRatio?: number;
//   minPixelRatio?: number;
//   scene!: Scene;
//   renderer!: WebGLRenderer;
//   size: SizeData = {
//     width: 0,
//     height: 0,
//     wWidth: 0,
//     wHeight: 0,
//     ratio: 0,
//     pixelRatio: 0
//   };

//   render: () => void = this.#render.bind(this);
//   onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {};
//   onAfterRender: (state: { elapsed: number; delta: number }) => void = () => {};
//   onAfterResize: (size: SizeData) => void = () => {};
//   isDisposed: boolean = false;

//   constructor(config: XConfig) {
//     this.#config = { ...config };
//     this.#initCamera();
//     this.#initScene();
//     this.#initRenderer();
//     this.resize();
//     this.#initObservers();
//   }

//   #initCamera() {
//     this.camera = new PerspectiveCamera();
//     this.cameraFov = this.camera.fov;
//   }

//   #initScene() {
//     this.scene = new Scene();
//   }

//   #initRenderer() {
//     if (this.#config.canvas) {
//       this.canvas = this.#config.canvas;
//     } else if (this.#config.id) {
//       const elem = document.getElementById(this.#config.id);
//       if (elem instanceof HTMLCanvasElement) {
//         this.canvas = elem;
//       } else {
//         console.error('Three: Missing canvas or id parameter');
//       }
//     } else {
//       console.error('Three: Missing canvas or id parameter');
//     }
//     this.canvas!.style.display = 'block';
//     const rendererOptions: WebGLRendererParameters = {
//       canvas: this.canvas,
//       powerPreference: 'high-performance',
//       ...(this.#config.rendererOptions ?? {})
//     };
//     this.renderer = new WebGLRenderer(rendererOptions);
//     this.renderer.outputColorSpace = SRGBColorSpace;
//   }

//   #initObservers() {
//     if (!(this.#config.size instanceof Object)) {
//       window.addEventListener('resize', this.#onResize.bind(this));
//       if (this.#config.size === 'parent' && this.canvas.parentNode) {
//         this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
//         this.#resizeObserver.observe(this.canvas.parentNode as Element);
//       }
//     }
//     this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), {
//       root: null,
//       rootMargin: '0px',
//       threshold: 0
//     });
//     this.#intersectionObserver.observe(this.canvas);
//     document.addEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
//   }

//   #onResize() {
//     if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
//     this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100);
//   }

//   resize() {
//     let w: number, h: number;
//     if (this.#config.size instanceof Object) {
//       w = this.#config.size.width;
//       h = this.#config.size.height;
//     } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
//       w = (this.canvas.parentNode as HTMLElement).offsetWidth;
//       h = (this.canvas.parentNode as HTMLElement).offsetHeight;
//     } else {
//       w = window.innerWidth;
//       h = window.innerHeight;
//     }
//     this.size.width = w;
//     this.size.height = h;
//     this.size.ratio = w / h;
//     this.#updateCamera();
//     this.#updateRenderer();
//     this.onAfterResize(this.size);
//   }

//   #updateCamera() {
//     this.camera.aspect = this.size.width / this.size.height;
//     if (this.camera.isPerspectiveCamera && this.cameraFov) {
//       if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
//         this.#adjustFov(this.cameraMinAspect);
//       } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
//         this.#adjustFov(this.cameraMaxAspect);
//       } else {
//         this.camera.fov = this.cameraFov;
//       }
//     }
//     this.camera.updateProjectionMatrix();
//     this.updateWorldSize();
//   }

//   #adjustFov(aspect: number) {
//     const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
//     const newTan = tanFov / (this.camera.aspect / aspect);
//     this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
//   }

//   updateWorldSize() {
//     if (this.camera.isPerspectiveCamera) {
//       const fovRad = (this.camera.fov * Math.PI) / 180;
//       this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
//       this.size.wWidth = this.size.wHeight * this.camera.aspect;
//     } else {
//       const cam = this.camera as THREE.OrthographicCamera;
//       this.size.wHeight = cam.top - cam.bottom;
//       this.size.wWidth = cam.right - cam.left;
//     }
//   }

//   #updateRenderer() {
//     this.renderer.setSize(this.size.width, this.size.height);
//     this.#postprocessing?.setSize(this.size.width, this.size.height);
//     let pr = window.devicePixelRatio;
//     if (this.maxPixelRatio && pr > this.maxPixelRatio) {
//       pr = this.maxPixelRatio;
//     } else if (this.minPixelRatio && pr < this.minPixelRatio) {
//       pr = this.minPixelRatio;
//     }
//     this.renderer.setPixelRatio(pr);
//     this.size.pixelRatio = pr;
//   }

//   get postprocessing(): Postprocessing | undefined {
//     return this.#postprocessing;
//   }
//   set postprocessing(value: Postprocessing | undefined) {
//     this.#postprocessing = value;
//     if (value) {
//       this.render = value.render.bind(value);
//     }
//   }

//   #onIntersection(entries: IntersectionObserverEntry[]) {
//     this.#isAnimating = entries[0].isIntersecting;
//     this.#isAnimating ? this.#startAnimation() : this.#stopAnimation();
//   }

//   #onVisibilityChange() {
//     if (this.#isAnimating) {
//       document.hidden ? this.#stopAnimation() : this.#startAnimation();
//     }
//   }

//   #startAnimation() {
//     if (this.#isVisible) return;
//     const animateFrame = () => {
//       this.#animationFrameId = requestAnimationFrame(animateFrame);
//       this.#animationState.delta = this.#clock.getDelta();
//       this.#animationState.elapsed += this.#animationState.delta;
//       this.onBeforeRender(this.#animationState);
//       this.render();
//       this.onAfterRender(this.#animationState);
//     };
//     this.#isVisible = true;
//     this.#clock.start();
//     animateFrame();
//   }

//   #stopAnimation() {
//     if (this.#isVisible) {
//       cancelAnimationFrame(this.#animationFrameId);
//       this.#isVisible = false;
//       this.#clock.stop();
//     }
//   }

//   #render() {
//     this.renderer.render(this.scene, this.camera);
//   }

//   clear() {
//     this.scene.traverse(obj => {
//       const mesh = obj as THREE.Mesh;
//       if (mesh.isMesh && mesh.material) {
//         const material = mesh.material as THREE.Material & Record<string, unknown>;
//         Object.keys(material).forEach(key => {
//           const matProp = material[key];
//           if (matProp && typeof matProp === 'object' && 'dispose' in matProp && typeof matProp.dispose === 'function') {
//             matProp.dispose();
//           }
//         });
//         mesh.material.dispose();
//         mesh.geometry.dispose();
//       }
//     });
//     this.scene.clear();
//   }

//   dispose() {
//     this.#onResizeCleanup();
//     this.#stopAnimation();
//     this.clear();
//     this.#postprocessing?.dispose();
//     this.renderer.dispose();
//     this.isDisposed = true;
//   }

//   #onResizeCleanup() {
//     window.removeEventListener('resize', this.#onResize.bind(this));
//     this.#resizeObserver?.disconnect();
//     this.#intersectionObserver?.disconnect();
//     document.removeEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
//   }
// }

// interface WConfig {
//   count: number;
//   maxX: number;
//   maxY: number;
//   maxZ: number;
//   maxSize: number;
//   minSize: number;
//   size0: number;
//   gravity: number;
//   friction: number;
//   wallBounce: number;
//   maxVelocity: number;
//   controlSphere0?: boolean;
//   followCursor?: boolean;
// }

// class W {
//   config: WConfig;
//   positionData: Float32Array;
//   velocityData: Float32Array;
//   sizeData: Float32Array;
//   center: Vector3 = new Vector3();

//   constructor(config: WConfig) {
//     this.config = config;
//     this.positionData = new Float32Array(3 * config.count).fill(0);
//     this.velocityData = new Float32Array(3 * config.count).fill(0);
//     this.sizeData = new Float32Array(config.count).fill(1);
//     this.center = new Vector3();
//     this.#initializePositions();
//     this.setSizes();
//   }

//   #initializePositions() {
//     const { config, positionData } = this;
//     this.center.toArray(positionData, 0);
//     for (let i = 1; i < config.count; i++) {
//       const idx = 3 * i;
//       positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
//       positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
//       positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
//     }
//   }

//   setSizes() {
//     const { config, sizeData } = this;
//     sizeData[0] = config.size0;
//     for (let i = 1; i < config.count; i++) {
//       sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     const { config, center, positionData, sizeData, velocityData } = this;
//     let startIdx = 0;
//     if (config.controlSphere0) {
//       startIdx = 1;
//       const firstVec = new Vector3().fromArray(positionData, 0);
//       firstVec.lerp(center, 0.1).toArray(positionData, 0);
//       new Vector3(0, 0, 0).toArray(velocityData, 0);
//     }
//     for (let idx = startIdx; idx < config.count; idx++) {
//       const base = 3 * idx;
//       const pos = new Vector3().fromArray(positionData, base);
//       const vel = new Vector3().fromArray(velocityData, base);
//       vel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
//       vel.multiplyScalar(config.friction);
//       vel.clampLength(0, config.maxVelocity);
//       pos.add(vel);
//       pos.toArray(positionData, base);
//       vel.toArray(velocityData, base);
//     }
//     for (let idx = startIdx; idx < config.count; idx++) {
//       const base = 3 * idx;
//       const pos = new Vector3().fromArray(positionData, base);
//       const vel = new Vector3().fromArray(velocityData, base);
//       const radius = sizeData[idx];
//       for (let jdx = idx + 1; jdx < config.count; jdx++) {
//         const otherBase = 3 * jdx;
//         const otherPos = new Vector3().fromArray(positionData, otherBase);
//         const otherVel = new Vector3().fromArray(velocityData, otherBase);
//         const diff = new Vector3().copy(otherPos).sub(pos);
//         const dist = diff.length();
//         const sumRadius = radius + sizeData[jdx];
//         if (dist < sumRadius) {
//           const overlap = sumRadius - dist;
//           const correction = diff.normalize().multiplyScalar(0.5 * overlap);
//           const velCorrection = correction.clone().multiplyScalar(Math.max(vel.length(), 1));
//           pos.sub(correction);
//           vel.sub(velCorrection);
//           pos.toArray(positionData, base);
//           vel.toArray(velocityData, base);
//           otherPos.add(correction);
//           otherVel.add(correction.clone().multiplyScalar(Math.max(otherVel.length(), 1)));
//           otherPos.toArray(positionData, otherBase);
//           otherVel.toArray(velocityData, otherBase);
//         }
//       }
//       if (config.controlSphere0) {
//         const diff = new Vector3().copy(new Vector3().fromArray(positionData, 0)).sub(pos);
//         const d = diff.length();
//         const sumRadius0 = radius + sizeData[0];
//         if (d < sumRadius0) {
//           const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
//           const velCorrection = correction.clone().multiplyScalar(Math.max(vel.length(), 2));
//           pos.sub(correction);
//           vel.sub(velCorrection);
//         }
//       }
//       if (Math.abs(pos.x) + radius > config.maxX) {
//         pos.x = Math.sign(pos.x) * (config.maxX - radius);
//         vel.x = -vel.x * config.wallBounce;
//       }
//       if (config.gravity === 0) {
//         if (Math.abs(pos.y) + radius > config.maxY) {
//           pos.y = Math.sign(pos.y) * (config.maxY - radius);
//           vel.y = -vel.y * config.wallBounce;
//         }
//       } else if (pos.y - radius < -config.maxY) {
//         pos.y = -config.maxY + radius;
//         vel.y = -vel.y * config.wallBounce;
//       }
//       const maxBoundary = Math.max(config.maxZ, config.maxSize);
//       if (Math.abs(pos.z) + radius > maxBoundary) {
//         pos.z = Math.sign(pos.z) * (config.maxZ - radius);
//         vel.z = -vel.z * config.wallBounce;
//       }
//       pos.toArray(positionData, base);
//       vel.toArray(velocityData, base);
//     }
//   }
// }

// interface ShaderUniforms {
//   [key: string]: { value: number };
// }

// interface Shader {
//   uniforms: Record<string, { value: unknown }>;
//   fragmentShader: string;
//   vertexShader: string;
// }

// class Y extends MeshPhysicalMaterial {
//   uniforms: ShaderUniforms = {
//     thicknessDistortion: { value: 0.1 },
//     thicknessAmbient: { value: 0 },
//     thicknessAttenuation: { value: 0.1 },
//     thicknessPower: { value: 2 },
//     thicknessScale: { value: 10 }
//   };

//   constructor(params: THREE.MeshPhysicalMaterialParameters) {
//     super(params);
//     this.defines = { USE_UV: '' };
//     this.onBeforeCompile = (shader: Shader) => {
//       Object.assign(shader.uniforms, this.uniforms);
//       shader.fragmentShader =
//         `
//         uniform float thicknessPower;
//         uniform float thicknessScale;
//         uniform float thicknessDistortion;
//         uniform float thicknessAmbient;
//         uniform float thicknessAttenuation;
//         ` + shader.fragmentShader;
//       shader.fragmentShader = shader.fragmentShader.replace(
//         'void main() {',
//         `
//         void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
//           vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
//           float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
//           #ifdef USE_COLOR
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
//           #else
//             vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
//           #endif
//           reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
//         }

//         void main() {
//         `
//       );
//       const lightsChunk = ShaderChunk.lights_fragment_begin.replaceAll(
//         'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
//         `
//           RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
//           RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
//         `
//       );
//       shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsChunk);
//       if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
//     };
//   }
//   onBeforeCompile2?: (shader: Shader) => void;
// }

// const XConfig = {
//   count: 150,
//   colors: [0xF5C518, 0xFFD166, 0x22D3EE, 0xEC4899, 0x34A853],
//   ambientColor: 0xffffff,
//   ambientIntensity: 0.8,
//   lightIntensity: 150,
//   materialParams: {
//     metalness: 0.6,
//     roughness: 0.4,
//     clearcoat: 1,
//     clearcoatRoughness: 0.1
//   },
//   minSize: 0.4,
//   maxSize: 0.9,
//   size0: 1,
//   gravity: 0.7,
//   friction: 0.998,
//   wallBounce: 0.95,
//   maxVelocity: 0.15,
//   maxX: 5,
//   maxY: 5,
//   maxZ: 2,
//   controlSphere0: false,
//   followCursor: true
// };

// const U = new Object3D();

// let globalPointerActive = false;
// const pointerPosition = new Vector2();

// interface PointerData {
//   position: Vector2;
//   nPosition: Vector2;
//   hover: boolean;
//   touching: boolean;
//   onEnter: (data: PointerData) => void;
//   onMove: (data: PointerData) => void;
//   onClick: (data: PointerData) => void;
//   onLeave: (data: PointerData) => void;
//   dispose?: () => void;
// }

// const pointerMap = new Map<HTMLElement, PointerData>();

// function createPointerData(options: Partial<PointerData> & { domElement: HTMLElement }): PointerData {
//   const defaultData: PointerData = {
//     position: new Vector2(),
//     nPosition: new Vector2(),
//     hover: false,
//     touching: false,
//     onEnter: () => {},
//     onMove: () => {},
//     onClick: () => {},
//     onLeave: () => {},
//     ...options
//   };
//   if (!pointerMap.has(options.domElement)) {
//     pointerMap.set(options.domElement, defaultData);
//     if (!globalPointerActive) {
//       document.body.addEventListener('pointermove', onPointerMove as EventListener);
//       document.body.addEventListener('pointerleave', onPointerLeave as EventListener);
//       document.body.addEventListener('click', onPointerClick as EventListener);
//       document.body.addEventListener('touchstart', onTouchStart as EventListener, { passive: false });
//       document.body.addEventListener('touchmove', onTouchMove as EventListener, { passive: false });
//       document.body.addEventListener('touchend', onTouchEnd as EventListener, { passive: false });
//       document.body.addEventListener('touchcancel', onTouchEnd as EventListener, { passive: false });
//       globalPointerActive = true;
//     }
//   }
//   defaultData.dispose = () => {
//     pointerMap.delete(options.domElement);
//     if (pointerMap.size === 0) {
//       document.body.removeEventListener('pointermove', onPointerMove as EventListener);
//       document.body.removeEventListener('pointerleave', onPointerLeave as EventListener);
//       document.body.removeEventListener('click', onPointerClick as EventListener);
//       document.body.removeEventListener('touchstart', onTouchStart as EventListener);
//       document.body.removeEventListener('touchmove', onTouchMove as EventListener);
//       document.body.removeEventListener('touchend', onTouchEnd as EventListener);
//       document.body.removeEventListener('touchcancel', onTouchEnd as EventListener);
//       globalPointerActive = false;
//     }
//   };
//   return defaultData;
// }

// function onPointerMove(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   processPointerInteraction();
// }

// function processPointerInteraction() {
//   for (const [elem, data] of pointerMap) {
//     const rect = elem.getBoundingClientRect();
//     if (isInside(rect)) {
//       updatePointerData(data, rect);
//       if (!data.hover) {
//         data.hover = true;
//         data.onEnter(data);
//       }
//       data.onMove(data);
//     } else if (data.hover && !data.touching) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function onTouchStart(e: TouchEvent) {
//   if (e.touches.length > 0) {
//     e.preventDefault();
//     pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//     for (const [elem, data] of pointerMap) {
//       const rect = elem.getBoundingClientRect();
//       if (isInside(rect)) {
//         data.touching = true;
//         updatePointerData(data, rect);
//         if (!data.hover) {
//           data.hover = true;
//           data.onEnter(data);
//         }
//         data.onMove(data);
//       }
//     }
//   }
// }

// function onTouchMove(e: TouchEvent) {
//   if (e.touches.length > 0) {
//     e.preventDefault();
//     pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
//     for (const [elem, data] of pointerMap) {
//       const rect = elem.getBoundingClientRect();
//       updatePointerData(data, rect);
//       if (isInside(rect)) {
//         if (!data.hover) {
//           data.hover = true;
//           data.touching = true;
//           data.onEnter(data);
//         }
//         data.onMove(data);
//       } else if (data.hover && data.touching) {
//         data.onMove(data);
//       }
//     }
//   }
// }

// function onTouchEnd() {
//   for (const [, data] of pointerMap) {
//     if (data.touching) {
//       data.touching = false;
//       if (data.hover) {
//         data.hover = false;
//         data.onLeave(data);
//       }
//     }
//   }
// }

// function onPointerClick(e: PointerEvent) {
//   pointerPosition.set(e.clientX, e.clientY);
//   for (const [elem, data] of pointerMap) {
//     const rect = elem.getBoundingClientRect();
//     updatePointerData(data, rect);
//     if (isInside(rect)) data.onClick(data);
//   }
// }

// function onPointerLeave() {
//   for (const data of pointerMap.values()) {
//     if (data.hover) {
//       data.hover = false;
//       data.onLeave(data);
//     }
//   }
// }

// function updatePointerData(data: PointerData, rect: DOMRect) {
//   data.position.set(pointerPosition.x - rect.left, pointerPosition.y - rect.top);
//   data.nPosition.set((data.position.x / rect.width) * 2 - 1, (-data.position.y / rect.height) * 2 + 1);
// }

// function isInside(rect: DOMRect) {
//   return (
//     pointerPosition.x >= rect.left &&
//     pointerPosition.x <= rect.left + rect.width &&
//     pointerPosition.y >= rect.top &&
//     pointerPosition.y <= rect.top + rect.height
//   );
// }

// class Z extends InstancedMesh {
//   config: BallpitConfig & typeof XConfig;
//   physics: W;
//   ambientLight: AmbientLight | undefined;
//   light: PointLight | undefined;

//   constructor(renderer: WebGLRenderer, params: BallpitConfig = {}) {
//     const config = { ...XConfig, ...params };
//     const roomEnv = new RoomEnvironment();
//     const pmrem = new PMREMGenerator(renderer);
//     const envTexture = pmrem.fromScene(roomEnv).texture;
//     const geometry = new SphereGeometry();
//     const materialParams: THREE.MeshPhysicalMaterialParameters = { 
//       envMap: envTexture, 
//       ...config.materialParams 
//     };
//     const material = new Y(materialParams);
//     material.envMapRotation.x = -Math.PI / 2;
//     super(geometry, material, config.count);
//     this.config = config;
//     this.physics = new W(config);
//     this.#setupLights();
//     this.setColors(config.colors ?? []);
//   }

//   #setupLights() {
//     this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
//     this.add(this.ambientLight);
//     this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
//     this.add(this.light);
//   }

//   setColors(colors: number[]) {
//     if (Array.isArray(colors) && colors.length > 1) {
//       const colorUtils = (function (colorsArr: number[]) {
//         let baseColors: number[] = colorsArr;
//         let colorObjects: Color[] = [];
//         baseColors.forEach(col => {
//           colorObjects.push(new Color(col));
//         });
//         return {
//           setColors: (cols: number[]) => {
//             baseColors = cols;
//             colorObjects = [];
//             baseColors.forEach(col => {
//               colorObjects.push(new Color(col));
//             });
//           },
//           getColorAt: (ratio: number, out: Color = new Color()) => {
//             const clamped = Math.max(0, Math.min(1, ratio));
//             const scaled = clamped * (baseColors.length - 1);
//             const idx = Math.floor(scaled);
//             const start = colorObjects[idx];
//             if (idx >= baseColors.length - 1) return start.clone();
//             const alpha = scaled - idx;
//             const end = colorObjects[idx + 1];
//             out.r = start.r + alpha * (end.r - start.r);
//             out.g = start.g + alpha * (end.g - start.g);
//             out.b = start.b + alpha * (end.b - start.b);
//             return out;
//           }
//         };
//       })(colors);
//       for (let idx = 0; idx < this.count; idx++) {
//         this.setColorAt(idx, colorUtils.getColorAt(idx / this.count));
//         if (idx === 0) {
//           this.light!.color.copy(colorUtils.getColorAt(idx / this.count));
//         }
//       }
//       if (!this.instanceColor) return;
//       this.instanceColor.needsUpdate = true;
//     }
//   }

//   update(deltaInfo: { delta: number }) {
//     this.physics.update(deltaInfo);
//     for (let idx = 0; idx < this.count; idx++) {
//       U.position.fromArray(this.physics.positionData, 3 * idx);
//       if (idx === 0 && this.config.followCursor === false) {
//         U.scale.setScalar(0);
//       } else {
//         U.scale.setScalar(this.physics.sizeData[idx]);
//       }
//       U.updateMatrix();
//       this.setMatrixAt(idx, U.matrix);
//       if (idx === 0) this.light!.position.copy(U.position);
//     }
//     this.instanceMatrix.needsUpdate = true;
//   }
// }

// interface CreateBallpitReturn {
//   three: X;
//   spheres: Z;
//   setCount: (count: number) => void;
//   togglePause: () => void;
//   dispose: () => void;
// }

// interface BallpitConfig {
//   count?: number;
//   colors?: number[];
//   ambientColor?: number;
//   ambientIntensity?: number;
//   lightIntensity?: number;
//   materialParams?: THREE.MeshPhysicalMaterialParameters;
//   minSize?: number;
//   maxSize?: number;
//   size0?: number;
//   gravity?: number;
//   friction?: number;
//   wallBounce?: number;
//   maxVelocity?: number;
//   maxX?: number;
//   maxY?: number;
//   maxZ?: number;
//   controlSphere0?: boolean;
//   followCursor?: boolean;
// }

// function createBallpit(canvas: HTMLCanvasElement, config: BallpitConfig = {}): CreateBallpitReturn {
//   const threeInstance = new X({
//     canvas,
//     size: 'parent',
//     rendererOptions: { antialias: true, alpha: true }
//   });
//   let spheres: Z;
//   threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
//   threeInstance.camera.position.set(0, 0, 20);
//   threeInstance.camera.lookAt(0, 0, 0);
//   threeInstance.cameraMaxAspect = 1.5;
//   threeInstance.resize();
//   initialize(config);
//   const raycaster = new Raycaster();
//   const plane = new Plane(new Vector3(0, 0, 1), 0);
//   const intersectionPoint = new Vector3();
//   let isPaused = false;

//   canvas.style.touchAction = 'none';
//   canvas.style.userSelect = 'none';
//   (canvas.style as CSSStyleDeclaration & { webkitUserSelect: string }).webkitUserSelect = 'none';

//   const pointerData = createPointerData({
//     domElement: canvas,
//     onMove() {
//       raycaster.setFromCamera(pointerData.nPosition, threeInstance.camera);
//       threeInstance.camera.getWorldDirection(plane.normal);
//       raycaster.ray.intersectPlane(plane, intersectionPoint);
//       spheres.physics.center.copy(intersectionPoint);
//       spheres.config.controlSphere0 = true;
//     },
//     onLeave() {
//       spheres.config.controlSphere0 = false;
//     }
//   });
  
//   function initialize(cfg: BallpitConfig) {
//     if (spheres) {
//       threeInstance.clear();
//       threeInstance.scene.remove(spheres);
//     }
//     spheres = new Z(threeInstance.renderer, cfg);
//     threeInstance.scene.add(spheres);
//   }
  
//   threeInstance.onBeforeRender = deltaInfo => {
//     if (!isPaused) spheres.update(deltaInfo);
//   };
  
//   threeInstance.onAfterResize = size => {
//     spheres.config.maxX = size.wWidth / 2;
//     spheres.config.maxY = size.wHeight / 2;
//   };
  
//   return {
//     three: threeInstance,
//     get spheres() {
//       return spheres;
//     },
//     setCount(count: number) {
//       initialize({ ...spheres.config, count });
//     },
//     togglePause() {
//       isPaused = !isPaused;
//     },
//     dispose() {
//       pointerData.dispose?.();
//       threeInstance.dispose();
//     }
//   };
// }

// interface BallpitProps extends BallpitConfig {
//   className?: string;
// }

// const Ballpit: React.FC<BallpitProps> = ({ 
//   className = '', 
//   followCursor = true, 
//   count = 150,
//   gravity = 0.7,
//   friction = 0.998,
//   wallBounce = 0.95,
//   ...props 
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const spheresInstanceRef = useRef<CreateBallpitReturn | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     spheresInstanceRef.current = createBallpit(canvas, {
//       followCursor,
//       count,
//       gravity,
//       friction,
//       wallBounce,
//       ...props
//     });

//     return () => {
//       if (spheresInstanceRef.current) {
//         spheresInstanceRef.current.dispose();
//       }
//     };
//   }, [followCursor, count, gravity, friction, wallBounce, props]);

//   return <canvas className={className} ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
// };

// export default Ballpit;