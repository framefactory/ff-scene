/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { ITypedEvent } from "@ff/core/Publisher";
import Node from "@ff/graph/Node";

import RenderView, { Viewport } from "../RenderView";
import CTransform from "./CTransform";
import CCamera from "./CCamera";

////////////////////////////////////////////////////////////////////////////////

const _context: IRenderSceneContext = {
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

export interface IRenderSceneContext
{
    view: RenderView;
    viewport: Viewport;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
}

interface ISceneEvent<T extends string> extends ITypedEvent<T>
{
    component: CScene;
    context: IRenderSceneContext;
}

export interface ISceneBeforeRenderEvent extends ISceneEvent<"before-render"> { }
export interface ISceneAfterRenderEvent extends ISceneEvent<"after-render"> { }

export interface IActiveCameraEvent extends ITypedEvent<"active-camera">
{
    previous: CCamera;
    next: CCamera;
}

export default class CScene extends CTransform
{
    static readonly type: string = "CScene";
    static readonly isGraphSingleton = true;

    private _activeCameraComponent: CCamera = null;

    constructor(node: Node, id?: string)
    {
        super(node, id);
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

            this.emit<IActiveCameraEvent>({ type: "active-camera", previous, next: component });
        }
    }

    get activeCamera() {
        return this._activeCameraComponent ? this._activeCameraComponent.camera : null;
    }

    beforeRender(context: IRenderSceneContext)
    {
    }

    afterRender(context: IRenderSceneContext)
    {
    }

    protected createObject3D()
    {
        const scene = new THREE.Scene();
        scene.onBeforeRender = this._onBeforeRender.bind(this);
        scene.onAfterRender = this._onAfterRender.bind(this);
        return scene;
    }

    private _onBeforeRender(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera)
    {
        _context.view = renderer["__view"];
        _context.viewport = renderer["__viewport"];
        _context.renderer = renderer;
        _context.scene = scene;
        _context.camera = camera;

        this.beforeRender && this.beforeRender(_context);

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

        this.afterRender && this.afterRender(_context);

        _afterRenderEvent.component = this;
        this.emit<ISceneAfterRenderEvent>(_afterRenderEvent);
    }
}

CScene.prototype.beforeRender = null;
CScene.prototype.afterRender = null;