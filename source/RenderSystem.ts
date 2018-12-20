/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { Dictionary } from "@ff/core/types";

import {
    Component,
    System,
    Registry,
    Pulse
} from "@ff/graph";

import IndexShader from "@ff/three/shaders/IndexShader";

import RenderView, { Viewport } from "./RenderView";

import Scene from "./components/Scene";
import Camera from "./components/Camera";
import Main from "./components/Main";

////////////////////////////////////////////////////////////////////////////////

export interface IRenderContext
{
    view: RenderView;
    viewport: Viewport;
    scene: THREE.Scene;
    camera: THREE.Camera;
}

export default class RenderSystem extends System
{
    protected pulse: Pulse;
    protected animHandler: number;
    protected views: RenderView[];
    protected objects: Dictionary<THREE.Object3D>;


    constructor(registry?: Registry)
    {
        super(registry);

        this.onAnimationFrame = this.onAnimationFrame.bind(this);

        this.pulse = new Pulse();
        this.animHandler = 0;
        this.views = [];
        this.objects = {};
    }

    get activeSceneComponent(): Scene | null {
        const mainComponent = this.components.get(Main);
        if (mainComponent) {
            return mainComponent.sceneComponent;
        }

        return this.components.get(Scene);
    }

    get activeCameraComponent() {
        const mainComponent = this.components.get(Main);
        if (mainComponent) {
            return mainComponent.cameraComponent;
        }

        return this.components.get(Camera);
    }

    get activeScene(): THREE.Scene {
        const sceneComponent = this.activeSceneComponent;
        return sceneComponent ? sceneComponent.scene : null;
    }

    get activeCamera(): THREE.Camera {
        const cameraComponent = this.activeCameraComponent;
        return cameraComponent ? cameraComponent.camera : null;
    }

    start()
    {
        if (this.animHandler === 0) {
            this.pulse.start();
            this.animHandler = window.requestAnimationFrame(this.onAnimationFrame);
        }
    }

    stop()
    {
        if (this.animHandler !== 0) {
            this.pulse.stop();
            window.cancelAnimationFrame(this.animHandler);
            this.animHandler = 0;
        }
    }

    attachView(view: RenderView)
    {
        this.views.push(view);
        //console.log("RenderSystem.attachView - total views: %s", this.views.length);
    }

    detachView(view: RenderView)
    {
        const index = this.views.indexOf(view);
        if (index < 0) {
            throw new Error("render view not found");
        }
        this.views.splice(index, 1);
        //console.log("RenderSystem.detachView - total views: %s", this.views.length);
    }

    registerObject3D(object: THREE.Object3D, component?: Component)
    {
        if (component) {
            object.userData["component"] = component;
        }

        object.traverse(object => {
            if ((object as any).isMesh) {
                this.objects[object.id] = object;
                object.onBeforeRender = function(renderer, scene, camera, geometry, material) {
                    const shader = material as IndexShader;
                    // index rendering for picking: set shader index uniform to object index
                    if (shader.isIndexShader) {
                        shader.setIndex(this.id);
                    }
                }
            }
        });
    }

    unregisterObject3D(object: THREE.Object3D)
    {
        object.traverse(object => {
            if ((object as any).isMesh) {
                object.onBeforeRender = null;
                delete this.objects[object.id];
            }
        });
    }

    getObjectByIndex(index: number): THREE.Object3D
    {
        return this.objects[index];
    }

    protected renderFrame()
    {
        const pulse = this.pulse;
        pulse.advance();

        this.update(pulse);
        this.tick(pulse);

        const scene = this.activeScene;
        const camera = this.activeCamera;

        if (!scene) {
            console.warn("no active scene");
        }
        if (!camera) {
            console.warn("no active camera");
        }

        // this in turn calls preRender() and postRender() for each view and viewport
        this.views.forEach(view => view.render(scene, camera));
    }

    protected onAnimationFrame()
    {
        this.renderFrame();
        this.animHandler = window.requestAnimationFrame(this.onAnimationFrame);
    }
}