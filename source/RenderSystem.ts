/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { Dictionary } from "@ff/core/types";

import {
    System,
    Registry,
    Pulse
} from "@ff/graph";

import RenderView, {
    Viewport,
    IPointerEvent,
    ITriggerEvent,
    EPointerEventType,
    ETriggerEventType
} from "./RenderView";

import Scene from "./components/Scene";
import Camera from "./components/Camera";
import Main from "./components/Main";

////////////////////////////////////////////////////////////////////////////////

let _nextObjectIndex = 1;

export { IPointerEvent, ITriggerEvent, EPointerEventType, ETriggerEventType };

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

    addObject3D(object: THREE.Object3D)
    {
        const index = _nextObjectIndex++;
        object.userData["index"] = index;
        this.objects[index] = object;
    }

    removeObject3D(object: THREE.Object3D)
    {
        const index = object.userData["index"];
        delete this.objects[index];
    }

    getObjectByIndex(index: number): THREE.Object3D
    {
        return this.objects[index];
    }

    onPointer(event: IPointerEvent)
    {
        const target = event.component || this.activeSceneComponent;
        this.emitComponentEvent(target, "pointer", event);

        if (!event.stopPropagation) {
            this.emitAny("pointer", event);
        }

        return true;
    }

    onTrigger(event: ITriggerEvent)
    {
        const target = event.component || this.activeSceneComponent;
        this.emitComponentEvent(target, "trigger", event);

        if (!event.stopPropagation) {
            this.emitAny("trigger", event);
        }

        return true;
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