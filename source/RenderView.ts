/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import Publisher from "@ff/core/Publisher";
import Component from "@ff/graph/Component";
import ComponentTracker from "@ff/graph/ComponentTracker";
import System from "@ff/graph/System";


import {
    IManip,
    IPointerEvent as IManipPointerEvent,
    ITriggerEvent as IManipTriggerEvent
} from "@ff/browser/ManipTarget";

import GPUPicker from "@ff/three/GPUPicker";
import Viewport, {
    IBaseEvent as IViewportBaseEvent
} from "@ff/three/Viewport";

import CRenderer from "./components/CRenderer";
import CScene from "./components/CScene";

////////////////////////////////////////////////////////////////////////////////

export { Viewport };

interface IBaseEvent extends IViewportBaseEvent
{
    view: RenderView;
    object3D: THREE.Object3D;
    component: Component;
    stopPropagation: boolean;
}

export interface IPointerEvent extends IManipPointerEvent, IBaseEvent { }
export interface ITriggerEvent extends IManipTriggerEvent, IBaseEvent { }

export default class RenderView extends Publisher implements IManip
{
    readonly system: System;
    readonly renderer: THREE.WebGLRenderer;
    readonly canvas: HTMLCanvasElement;
    readonly overlay: HTMLElement;
    readonly viewports: Viewport[] = [];

    protected sceneTracker: ComponentTracker<CScene>;
    protected activeViewport: Viewport = null;
    protected activeObject3D: THREE.Object3D = null;
    protected activeComponent: Component = null;

    protected shouldResize = false;
    protected picker: GPUPicker;

    constructor(system: System, canvas: HTMLCanvasElement, overlay: HTMLElement)
    {
        super();

        this.system = system;
        this.canvas = canvas;
        this.overlay = overlay;

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });

        this.renderer.autoClear = false;
        this.renderer.setClearColor("#0090c0");

        this.sceneTracker = new ComponentTracker(this.system.graph.components, CScene);
        this.picker = new GPUPicker(this.renderer);
    }

    dispose()
    {
        this.renderer.dispose();
        this.sceneTracker.dispose();
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

        const renderer = this.system.components.safeGet(CRenderer);
        renderer.attachView(this);
    }

    detach()
    {
        const renderer = this.system.components.safeGet(CRenderer);
        renderer.detachView(this);
    }

    render()
    {
        const sceneComponent = this.sceneTracker.component;
        if (!sceneComponent) {
            return;
        }

        const scene = sceneComponent.scene;
        const camera = sceneComponent.activeCamera;

        if (!scene || !camera) {
            return;
        }

        const renderer = this.renderer;

        if (this.shouldResize) {
            this.shouldResize = false;

            const width = this.canvas.width = this.canvas.clientWidth;
            const height = this.canvas.height = this.canvas.clientHeight;

            this.viewports.forEach(viewport => viewport.setCanvasSize(width, height));
            renderer.setSize(width, height, false);
        }

        renderer.clear();
        renderer["__view"] = this;

        const viewports = this.viewports;
        for (let i = 0, n = viewports.length; i < n; ++i) {
            const viewport = viewports[i];

            if (viewport.enabled) {
                renderer["__viewport"] = viewport;
                const viewportCamera = viewport.updateCamera(camera);
                viewport.applyViewport(this.renderer);
                renderer.render(scene, viewportCamera);
            }
        }
    }

    resize()
    {
        this.shouldResize = true;
    }

    addViewport(): Viewport
    {
        const viewport = new Viewport();
        this.viewports.push(viewport);
        return viewport;
    }

    addViewports(count: number)
    {
        for (let i = 0; i < count; ++i) {
            this.viewports.push(new Viewport());
        }
    }

    removeViewport(viewport: Viewport)
    {
        const index = this.viewports.indexOf(viewport);
        if (index < 0) {
            throw new Error("viewport not found");
        }

        this.viewports.slice(index, 1);
    }

    enableViewport(index: number, enabled: boolean)
    {
        this.viewports[index].enabled = enabled;
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
            if (viewEvent.component) {
                viewEvent.component.propagateUp(viewEvent);
            }
            else {
                this.system.emit(viewEvent);
            }

            if (!viewEvent.stopPropagation) {
                viewEvent.viewport.onPointer(viewEvent);
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
            if (viewEvent.component) {
                viewEvent.component.propagateUp(viewEvent);
            }
            else {
                this.system.emit(viewEvent);
            }

            if (!viewEvent.stopPropagation) {
                viewEvent.viewport.onTrigger(viewEvent);
            }

            return true;
        }

        return false;
    }

    protected routeEvent(event: IPointerEvent, doHitTest: boolean, doPick: boolean): IPointerEvent;
    protected routeEvent(event: ITriggerEvent, doHitTest: boolean, doPick: boolean): ITriggerEvent;
    protected routeEvent(event, doHitTest, doPick)
    {
        let viewport = this.activeViewport;
        let object3D = this.activeObject3D;
        let component = this.activeComponent;

        // if no active viewport, perform a hit test against all viewports
        if (doHitTest) {
            viewport = null;
            const viewports = this.viewports;
            for (let i = 0, n = viewports.length; i < n; ++i) {
                const vp = viewports[i];
                if (vp.enabled && vp.isPointInside(event.localX, event.localY)) {
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
            const sceneComponent = this.sceneTracker.component;
            const scene = sceneComponent && sceneComponent.scene;
            const camera = sceneComponent &&sceneComponent.activeCamera;

            object3D = null;
            component = null;

            if (scene && camera) {
                let object3D = this.picker.pickObject(scene, camera, event);
                if (object3D === undefined) {
                    console.log("Pick Index - Background");
                }
                else {
                    while(object3D && !component) {
                        component = object3D.userData["component"];
                        if (!component) {
                            object3D = object3D.parent;
                        }
                    }
                    if (component) {
                        console.log("Pick Index - Component: %s", component.type);
                    }
                    else {
                        console.warn("Pick Index - Object without component");
                    }
                }
            }
        }

        viewEvent.object3D = object3D;
        viewEvent.component = component;

        this.activeViewport = viewport;
        this.activeObject3D = object3D;
        this.activeComponent = component;

        return viewEvent;
    }
}