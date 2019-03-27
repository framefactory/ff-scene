/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component, { Node, ITypedEvent, types } from "@ff/graph/Component";
import CPulse, { IPulseEvent } from "@ff/graph/components/CPulse";

import RenderView from "../RenderView";
import CScene, { IActiveCameraEvent } from "./CScene";

////////////////////////////////////////////////////////////////////////////////

export { IActiveCameraEvent };

/**
 * Emitted by [[CRenderer]] if the active scene changes.
 * @event
 */
export interface IActiveSceneEvent extends ITypedEvent<"active-scene">
{
    previous: CScene;
    next: CScene;
}

const _inputs = {
    shadowsEnabled: types.Boolean("Shadows.Enabled", true),
};

const _outputs = {
    maxTextureSize: types.Integer("Caps.MaxTextureSize"),
    maxCubemapSize: types.Integer("Caps.MaxCubemapSize"),
};

/**
 * Manages 3D rendering. Keeps track of one "active" scene/camera pair,
 * and of a number of render views. During each render cycle, the active scene
 * and camera are rendered to each render view.
 *
 * ### Events
 * - *"active-scene"* - emits [[IActiveSceneEvent]] when the active scene changes.
 * - *"active-camera"* - emits [[IActiveCameraEvent]] when the active camera changes.
 *
 * ### See also
 * - [[CScene]]
 * - [[CCamera]]
 * - [[RenderView]]
 */
export default class CRenderer extends Component
{
    static readonly typeName: string = "CRenderer";
    static readonly isSystemSingleton: boolean = true;

    ins = this.addInputs(_inputs);
    outs = this.addOutputs(_outputs);

    readonly views: RenderView[] = [];

    private _activeSceneComponent: CScene = null;


    constructor(node: Node, id: string)
    {
        super(node, id);
        this.addEvents("active-scene", "active-camera");
    }

    get activeSceneComponent() {
        return this._activeSceneComponent;
    }
    set activeSceneComponent(component: CScene) {
        if (component !== this._activeSceneComponent) {
            const previousScene = this._activeSceneComponent;
            const previousCamera = this.activeCameraComponent;

            if (previousScene) {
                previousScene.off<IActiveCameraEvent>("active-camera", this.onActiveCamera, this);
            }

            if (component) {
                component.on<IActiveCameraEvent>("active-camera", this.onActiveCamera, this);
            }

            this._activeSceneComponent = component;
            const nextCamera = this.activeCameraComponent;

            const sceneEvent: IActiveSceneEvent = { type: "active-scene", previous: previousScene, next: component };
            this.emit(sceneEvent);

            const cameraEvent: IActiveCameraEvent = { type: "active-camera", previous: previousCamera, next: nextCamera };
            this.emit(cameraEvent);
        }
    }

    get activeSceneGraph() {
        return this._activeSceneComponent ? this._activeSceneComponent.graph : null;
    }
    get activeScene() {
        return this._activeSceneComponent ? this._activeSceneComponent.scene : null;
    }

    get activeCameraComponent() {
        return this._activeSceneComponent ? this._activeSceneComponent.activeCameraComponent : null;
    }
    get activeCamera() {
        const component = this._activeSceneComponent ? this._activeSceneComponent.activeCameraComponent : null;
        return component ? component.camera : null;
    }

    create()
    {
        super.create();

        this.trackComponent(CPulse, component => {
            component.on("pulse", this.onPulse, this)
        }, component => {
            component.off("pulse", this.onPulse, this);
        });
    }

    update()
    {
        const ins = this.ins;

        if (ins.shadowsEnabled.changed) {
            this.views.forEach(view => view.renderer.shadowMap.enabled = ins.shadowsEnabled.value);
        }

        return true;
    }

    attachView(view: RenderView)
    {
        // set WebGL caps if it's the first view attached
        if (!this.views.length) {
            const renderer = view.renderer;
            this.outs.maxTextureSize.setValue(renderer.capabilities.maxTextureSize);
            this.outs.maxCubemapSize.setValue(renderer.capabilities.maxCubemapSize);
        }

        this.views.push(view);
        //console.log("RenderSystem.attachView - total views: %s", this.views.length);
    }

    detachView(view: RenderView)
    {
        const index = this.views.indexOf(view);
        if (index < 0) {
            throw new Error("render view not registered");
        }
        this.views.splice(index, 1);
        //console.log("RenderSystem.detachView - total views: %s", this.views.length);
    }

    protected onPulse(event: IPulseEvent)
    {
        if (event.systemUpdated) {
            console.log("CRenderer.onPulse - render views...");

            this.views.forEach(view => {
                view.render();
            });
        }
    }

    protected onActiveCamera(event: IActiveCameraEvent)
    {
        this.emit<IActiveCameraEvent>(event);
    }
}