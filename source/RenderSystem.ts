/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { Dictionary } from "@ff/core/types";

import Component from "@ff/graph/Component";
import System from "@ff/graph/System";
import Registry from "@ff/graph/Registry";
import Pulse from "@ff/graph/Pulse";

import IndexShader from "@ff/three/shaders/IndexShader";

import RenderView, { Viewport } from "./RenderView";

import Scene from "./components/Scene";
import Camera from "./components/Camera";

import { ITypedEvent } from "@ff/core/Publisher";

////////////////////////////////////////////////////////////////////////////////

export interface IRenderContext
{
    view: RenderView;
    viewport: Viewport;
    scene: THREE.Scene;
    camera: THREE.Camera;
}

export interface IActiveSceneEvent extends ITypedEvent<"active-scene">
{
    previous: Scene;
    next: Scene;
}

export interface IActiveCameraEvent extends ITypedEvent<"active-camera">
{
    previous: Camera;
    next: Camera;
}

/**
 * Establishes an node-component system which renders 3D graphics to a canvas.
 * The [[RenderSystem]] class extends the base [[System]] by adding an animation loop,
 * management of [[RenderView]] viewports and the notion of an active camera and scene.
 * It also adds support for picking 3D objects.
 */
export default class RenderSystem extends System
{
    protected pulse: Pulse;
    protected animHandler: number;
    protected objects: Dictionary<THREE.Object3D>;

    private _views: RenderView[];
    private _activeCamera: Camera;
    private _activeScene: Scene;

    constructor(registry?: Registry)
    {
        super(registry);

        this.onAnimationFrame = this.onAnimationFrame.bind(this);

        this.pulse = new Pulse();
        this.animHandler = 0;
        this._views = [];
        this.objects = {};
    }

    get views(): Readonly<RenderView[]> {
        return this._views;
    }

    set activeSceneComponent(scene: Scene) {
        if (scene !== this._activeScene) {
            this.emit<IActiveSceneEvent>({ type: "active-scene", previous: this._activeScene, next: scene });
            this._activeScene = scene;
        }
    }

    get activeSceneComponent(): Scene | null {
        return this._activeScene;
    }

    set activeCameraComponent(camera: Camera) {
        if (camera !== this._activeCamera) {
            this.emit<IActiveCameraEvent>({ type: "active-camera", previous: this._activeCamera, next: camera });
            this._activeCamera = camera;
        }
    }

    get activeCameraComponent() {
        return this._activeCamera;
    }

    get activeScene(): THREE.Scene {
        return this._activeScene ? this._activeScene.scene : null;
    }

    get activeCamera(): THREE.Camera {
        return this._activeCamera ? this._activeCamera.camera : null;
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
        this._views.push(view);
        //console.log("RenderSystem.attachView - total views: %s", this.views.length);
    }

    detachView(view: RenderView)
    {
        const index = this._views.indexOf(view);
        if (index < 0) {
            throw new Error("render view not found");
        }
        this._views.splice(index, 1);
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

        // this in turn calls preRender() and postRender() for each view and viewport
        this._views.forEach(view => view.render(scene, camera));
    }

    protected onAnimationFrame()
    {
        this.renderFrame();
        this.animHandler = window.requestAnimationFrame(this.onAnimationFrame);
    }
}