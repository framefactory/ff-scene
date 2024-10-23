/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { WebGLRenderer, Object3D, Camera, Scene, Box3, Vector3 } from "three";

import { Publisher } from "@ffweb/core/Publisher.js";
import { System } from "@ffweb/graph/System.js";
import { Component } from "@ffweb/graph/Component.js";
import { CHierarchy } from "@ffweb/graph/components/CHierarchy.js";

import {
    IManipListener,
    IManipEvent as IManipBaseEvent,
    IPointerEvent as IManipPointerEvent,
    ITriggerEvent as IManipTriggerEvent
} from "@ffweb/browser/ManipTarget.js";

import {
    Viewport,
    IViewportEventExt,
} from "@ffweb/three/Viewport.js";

import { ViewportOverlay } from "@ffweb/three/ui/ViewportOverlay.js";
import { GPUPicker } from "@ffweb/three/GPUPicker.js";
import { UniversalCamera } from "@ffweb/three/UniversalCamera.js";

import { CRenderer } from "./components/CRenderer.js";

////////////////////////////////////////////////////////////////////////////////

export { Viewport };

interface IRenderViewEventExt extends IViewportEventExt
{
    /** The render view on which the event occurred. */
    view: RenderView;
    /** The component the event originates from. */
    component: Component;
    /** The 3D object the event originates from. */
    object3D: Object3D;
    /** In order to stop propagation of the event, set this to true while handling the event. */
    stopPropagation: boolean;
}

export interface IBaseEvent extends IManipBaseEvent, IRenderViewEventExt { }
export interface IPointerEvent extends IManipPointerEvent, IRenderViewEventExt { }
export interface ITriggerEvent extends IManipTriggerEvent, IRenderViewEventExt { }

export class RenderView extends Publisher implements IManipListener
{
    readonly system: System;
    readonly renderer: WebGLRenderer;
    readonly canvas: HTMLCanvasElement;
    readonly overlay: HTMLElement;
    readonly viewports: Viewport[] = [];

    protected rendererComponent: CRenderer = null;

    protected targetViewport: Viewport = null;
    protected targetObject3D: Object3D = null;
    protected targetComponent: Component = null;
    protected targetScene: Scene = null;
    protected targetCamera: Camera = null;

    protected defaultScene = new Scene();
    protected defaultCamera = new UniversalCamera();

    protected picker: GPUPicker;

    constructor(system: System, canvas: HTMLCanvasElement, overlay: HTMLElement)
    {
        super();

        this.system = system;
        this.canvas = canvas;
        this.overlay = overlay;

        this.renderer = new WebGLRenderer({
            canvas,
            antialias: true
        });

        this.renderer.autoClear = false;
        //this.renderer.gammaOutput = true;
        //this.renderer.gammaFactor = 2;

        this.picker = new GPUPicker(this.renderer);
    }

    dispose()
    {
        this.renderer.dispose();
        this.viewports.forEach(viewport => viewport.dispose());
    }

    get canvasWidth()
    {
        return this.canvas.width;
    }

    get canvasHeight()
    {
        return this.canvas.height;
    }

    attach()
    {
        const width = this.canvasWidth;
        const height = this.canvasHeight;

        this.viewports.forEach(viewport => viewport.setCanvasSize(width, height));
        this.renderer.setSize(width, height, false);

        this.rendererComponent = this.system.getComponent(CRenderer, true);
        this.rendererComponent.attachView(this);
    }

    detach()
    {
        this.rendererComponent = this.system.getComponent(CRenderer, true);
        this.rendererComponent.detachView(this);
        this.rendererComponent = null;
    }

    renderImage(width: number, height: number, format: string, quality: number)
    {
        if (ENV_DEVELOPMENT) {
            console.log("RenderView.renderImage - width: %s, height: %s, format: %s, quality: %s",
                width, height, format, quality);
        }

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        this.setRenderSize(width, height);
        this.render();
        const dataURL = this.canvas.toDataURL(format, quality);
        this.setRenderSize(canvasWidth, canvasHeight);

        return dataURL;
    }

    render()
    {
        const sceneComponent = this.rendererComponent.activeSceneComponent;
        if (!sceneComponent) {
            return;
        }

        let scene = sceneComponent.scene;
        let camera = sceneComponent.activeCamera;

        if (!scene || !camera) {
            if (ENV_DEVELOPMENT) {
                console.warn(!scene ? !camera ? "no scene/camera" : "no scene" : "no camera");
            }

            scene = this.defaultScene;
            camera = this.defaultCamera;
        }

        const renderer = this.renderer;
        renderer.clear();
        renderer["__view"] = this;

        const viewports = this.viewports;

        for (let i = 0, n = viewports.length; i < n; ++i) {
            const viewport = viewports[i];

            renderer["__viewport"] = viewport;
            const currentCamera = viewport.updateCamera(camera);
            viewport.applyViewport(this.renderer);
            renderer.render(scene, currentCamera);
        }
    }

    protected setRenderSize(width: number, height: number)
    {
        this.canvas.width = width;
        this.canvas.height = height;

        this.viewports.forEach(viewport => viewport.setCanvasSize(width, height));
        this.renderer.setSize(width, height, false);
    }

    resize()
    {
        this.setRenderSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.render();
    }

    setViewportCount(count: number)
    {
        const viewports = this.viewports;

        for (let i = count; i < viewports.length; ++i) {
            viewports[i].dispose();
        }
        for (let i = viewports.length; i < count; ++i) {

            const overlay = new ViewportOverlay().appendTo(this.overlay);

            viewports[i] = new Viewport();
            viewports[i].setCanvasSize(this.canvasWidth, this.canvasHeight);
            viewports[i].overlay = overlay;
        }

        viewports.length = count;
    }

    getViewportCount()
    {
        return this.viewports.length;
    }

    onPointer(event: IPointerEvent)
    {
        const system = this.system;
        if (!system) {
            return false;
        }

        let doPick = false;
        let doHitTest = false;

        if (event.type === "pointer-hover") {
            doHitTest = true;
        }
        else if (event.isPrimary && event.type === "pointer-down") {
            doHitTest = true;
            doPick = true;
        }

        const viewEvent = this.routeEvent(event, doHitTest, doPick);

        if (viewEvent) {
            const component = viewEvent.component;
            if (component) {
                component.emit(viewEvent);

                const hierarchy = component.getComponent(CHierarchy);
                if (!viewEvent.stopPropagation && hierarchy) {
                    hierarchy.propagateUp(false, true, viewEvent);
                }
            }

            if (!viewEvent.stopPropagation) {
                this.system.emit(viewEvent);
            }

            if (!viewEvent.stopPropagation) {
                const updated = viewEvent.viewport.onPointer(viewEvent);
                if (updated) {
                    this.system.getMainComponent(CRenderer).forceRender();
                }
            }

            return true;
        }

        return false;
    }

    onTrigger(event: ITriggerEvent)
    {
        const system = this.system;
        if (!system) {
            return false;
        }

        const viewEvent = this.routeEvent(event, true, true);

        if (viewEvent) {
            const component = viewEvent.component;
            if (component) {
                component.emit(viewEvent);

                const hierarchy = component.getComponent(CHierarchy);
                if (!viewEvent.stopPropagation && hierarchy) {
                    hierarchy.propagateUp(false, true, viewEvent);
                }
            }

            if (!viewEvent.stopPropagation) {
                this.system.emit(viewEvent);
            }

            if (!viewEvent.stopPropagation) {
                const updated = viewEvent.viewport.onTrigger(viewEvent);
                if (updated) {
                    this.system.getMainComponent(CRenderer).forceRender();
                }
            }

            return true;
        }

        return false;
    }

    pickPosition(event: IPointerEvent, range?: Box3, result?: Vector3)
    {
        return this.picker.pickPosition(this.targetScene, this.targetCamera, event, range, result);
    }

    pickNormal(event: IPointerEvent, result?: Vector3)
    {
        return this.picker.pickNormal(this.targetScene, this.targetCamera, event, result);
    }

    protected routeEvent(event: IPointerEvent, doHitTest: boolean, doPick: boolean): IPointerEvent;
    protected routeEvent(event: ITriggerEvent, doHitTest: boolean, doPick: boolean): ITriggerEvent;
    protected routeEvent(event, doHitTest, doPick)
    {
        let viewport = this.targetViewport;
        let object3D = this.targetObject3D;
        let component = this.targetComponent;

        // if no active viewport, perform a hit test against all viewports
        if (doHitTest) {
            viewport = null;
            const viewports = this.viewports;
            for (let i = 0, n = viewports.length; i < n; ++i) {
                const vp = viewports[i];
                if (vp.isInside(event)) {
                    viewport = vp;
                    break;
                }
            }
        }

        // without an active viewport, return null to cancel the event
        if (!viewport) {
            return null;
        }

        // if we have an active viewport now, augment event with viewport/view information
        const viewEvent = event as IBaseEvent;
        viewEvent.view = this;
        viewEvent.viewport = viewport;
        viewEvent.deviceX = viewport.getDeviceX(event.localX);
        viewEvent.deviceY = viewport.getDeviceY(event.localY);
        viewEvent.stopPropagation = false;

        // perform 3D pick
        if (doPick) {
            const sceneComponent = this.rendererComponent.activeSceneComponent;
            const scene = this.targetScene = sceneComponent && sceneComponent.scene;
            const camera = this.targetCamera = sceneComponent &&sceneComponent.activeCamera;

            object3D = null;
            component = null;

            if (scene && camera) {
                object3D = this.picker.pickObject(scene, camera, event);
                if (object3D === undefined) {
                    if (ENV_DEVELOPMENT) {
                        console.log("Pick Index - Background");
                    }
                }
                else {
                    let componentObject3D = object3D;
                    while(componentObject3D && !component) {
                        component = componentObject3D.userData["component"];
                        if (!component) {
                            componentObject3D = componentObject3D.parent;
                        }
                    }

                    if (ENV_DEVELOPMENT) {
                        if (component) {
                            console.log("Pick Index - Component: %s", component.typeName);
                        }
                        else {
                            console.warn("Pick Index - Object without component");
                        }
                    }
                }
            }
        }

        viewEvent.object3D = object3D;
        viewEvent.component = component;

        this.targetViewport = viewport;
        this.targetObject3D = object3D;
        this.targetComponent = component;

        return viewEvent;
    }
}