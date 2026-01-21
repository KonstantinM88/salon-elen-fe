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