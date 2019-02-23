/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { ITypedEvent } from "@ff/core/Publisher";

import { types } from "@ff/graph/propertyTypes";

import RenderView, { Viewport } from "../RenderView";
import CRenderer, { IActiveSceneEvent } from "./CRenderer";

import CTransform from "./CTransform";
import CCamera from "./CCamera";
import CObject3D from "./CObject3D";
import { IChildComponentEvent, IHierarchyEvent } from "@ff/graph/components/CHierarchy";

////////////////////////////////////////////////////////////////////////////////

export { IActiveSceneEvent };

const _context: IRenderContext = {
    view: null,
    viewport: null,
    renderer: null,
    scene: null,
    camera: null
};

const _beforeRenderEvent: ISceneBeforeRenderEvent = {
    type: "before-render",
    component: null,
    context: _context
};

const _afterRenderEvent: ISceneAfterRenderEvent = {
    type: "after-render",
    component: null,
    context: _context
};

export interface IRenderContext
{
    view: RenderView;
    viewport: Viewport;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
}

interface ISceneRenderEvent<T extends string> extends ITypedEvent<T>
{
    component: CScene;
    context: IRenderContext;
}

export interface ISceneBeforeRenderEvent extends ISceneRenderEvent<"before-render"> { }
export interface ISceneAfterRenderEvent extends ISceneRenderEvent<"after-render"> { }

export interface IActiveCameraEvent extends ITypedEvent<"active-camera">
{
    previous: CCamera;
    next: CCamera;
}

const _inputs = {
    activate: types.Event("Scene.Activate")
};

/**
 * Represents a 3D scene. Root of a hierarchy of a number of 3D renderable objects and one
 * or multiple cameras. Only one camera at a time can be the "active" camera which is
 * used during each render cycle to render the currently active scene to one or multiple render views.
 */
export default class CScene extends CTransform
{
    static readonly typeName: string = "CScene";
    static readonly isGraphSingleton = true;

    private _activeCameraComponent: CCamera = null;
    private _preRenderList: CObject3D[] = [];
    private _postRenderList: CObject3D[] = [];

    ins = this.addInputs<CTransform, typeof _inputs>(_inputs, 0);

    constructor(id: string)
    {
        super(id);
        this.addEvents("before-render", "after-render", "active-camera");
    }

    get scene(): THREE.Scene {
        return this.object3D as THREE.Scene;
    }

    get activeCameraComponent() {
        return this._activeCameraComponent;
    }
    set activeCameraComponent(component: CCamera) {
        if (component !== this._activeCameraComponent) {
            const previous = this._activeCameraComponent;
            this._activeCameraComponent = component;

            const event: IActiveCameraEvent = { type: "active-camera", previous, next: component };
            this.emit(event);
        }
    }

    get activeCamera() {
        return this._activeCameraComponent ? this._activeCameraComponent.camera : null;
    }

    protected get renderer(): CRenderer {
        return this.getMainComponent(CRenderer);
    }

    create()
    {
        super.create();

        this.on<IHierarchyEvent>("hierarchy", this.updateRenderLists, this);
        this.on<IChildComponentEvent>("child-component", this.updateRenderLists, this);

        const renderer = this.renderer;
        if (renderer && !renderer.activeSceneComponent) {
            renderer.activeSceneComponent = this;
        }
    }

    update(context)
    {
        const updated = super.update(context);

        if (this.ins.activate.changed) {
            const renderer = this.renderer;
            if (renderer) {
                renderer.activeSceneComponent = this;
            }
        }

        return updated;
    }

    dispose()
    {
        const renderer = this.renderer;
        if (renderer && renderer.activeSceneComponent === this) {
            renderer.activeSceneComponent = null;
        }

        this.off<IHierarchyEvent>("hierarchy", this.updateRenderLists, this);
        this.off<IChildComponentEvent>("child-component", this.updateRenderLists, this);

        super.dispose();
    }

    preRender(context: IRenderContext)
    {
        const preRenderList = this._preRenderList;
        for (let i = 0, n = preRenderList.length; i < n; ++i) {
            preRenderList[i].preRender(context);
        }
    }

    postRender(context: IRenderContext)
    {
        const postRenderList = this._postRenderList;
        for (let i = 0, n = postRenderList.length; i < n; ++i) {
            postRenderList[i].postRender(context);
        }
    }

    protected createObject3D()
    {
        const scene = new THREE.Scene();
        scene.onBeforeRender = this._onBeforeRender.bind(this);
        scene.onAfterRender = this._onAfterRender.bind(this);
        return scene;
    }

    protected updateRenderLists()
    {
        this._preRenderList = [];
        this._postRenderList = [];

        this.traverseDown(true, true, true, (component: CObject3D) => {
            if (component.is(CObject3D)) {
                if (component.preRender) {
                    this._preRenderList.push(component);
                }
                if (component.postRender) {
                    this._postRenderList.push(component);
                }
            }

            return false;
        });


        // registerComponent(component: CObject3D)
        // {
        //     if (component.preRender) {
        //         this._preRenderList.push(component);
        //     }
        //     if (component.postRender) {
        //         this._postRenderList.push(component);
        //     }
        // }
        //
        // unregisterComponent(component: CObject3D)
        // {
        //     if (component.preRender) {
        //         this._preRenderList.splice(this._preRenderList.indexOf(component), 1);
        //     }
        //     if (component.postRender) {
        //         this._postRenderList.splice(this._postRenderList.indexOf(component), 1);
        //     }
        // }
    }

    private _onBeforeRender(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera)
    {
        _context.view = renderer["__view"];
        _context.viewport = renderer["__viewport"];
        _context.renderer = renderer;
        _context.scene = scene;
        _context.camera = camera;

        this.preRender(_context);

        _beforeRenderEvent.component = this;
        this.emit<ISceneBeforeRenderEvent>(_beforeRenderEvent);
    }

    private _onAfterRender(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera)
    {
        _context.view = renderer["__view"];
        _context.viewport = renderer["__viewport"];
        _context.renderer = renderer;
        _context.scene = scene;
        _context.camera = camera;

        this.postRender(_context);

        _afterRenderEvent.component = this;
        this.emit<ISceneAfterRenderEvent>(_afterRenderEvent);
    }
}