/**
 * FF Typescript Foundation Library
 * Copyright 2019 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component, { Node, ITypedEvent, types } from "@ff/graph/Component";
import CPulse, { IPulseEvent } from "@ff/graph/components/CPulse";

import RenderView from "../RenderView";
import CScene, { IActiveCameraEvent } from "./CScene";
import Notification from "@ff/ui/Notification";

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

    static readonly ins = {
        shadowsEnabled: types.Boolean("Shadows.Enabled", true),
    };

    static readonly outs = {
        maxTextureSize: types.Integer("Caps.MaxTextureSize"),
        maxCubemapSize: types.Integer("Caps.MaxCubemapSize"),
    };

    ins = this.addInputs(CRenderer.ins);
    outs = this.addOutputs(CRenderer.outs);

    readonly views: RenderView[] = [];

    private _activeSceneComponent: CScene = null;
    private _forceRender = false;

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

    forceRender() {
        this._forceRender = true;
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
        if (this.views.length === 0) {
            const renderer = view.renderer;
            const outs = this.outs;
            outs.maxTextureSize.setValue(renderer.capabilities.maxTextureSize);
            outs.maxCubemapSize.setValue(renderer.capabilities.maxCubemapSize);

            if (ENV_DEVELOPMENT) {
                //Notification.show(`Max. texture size: ${outs.maxTextureSize.value}`, "info");
            }
        }

        this.views.push(view);

        if (ENV_DEVELOPMENT) {
            console.log("RenderSystem.attachView - total views: %s", this.views.length);
        }
    }

    detachView(view: RenderView)
    {
        const index = this.views.indexOf(view);
        if (index < 0) {
            throw new Error("render view not registered");
        }
        this.views.splice(index, 1);

        if (ENV_DEVELOPMENT) {
            console.log("RenderSystem.detachView - total views: %s", this.views.length);
        }
    }

    logInfo()
    {
        this.views.forEach(view => {
            console.log(view.renderer.info);
        });
    }

    protected onPulse(event: IPulseEvent)
    {
        if (event.systemUpdated || this._forceRender) {
            if (ENV_DEVELOPMENT) {
                console.log("CRenderer.onPulse - render views...");
            }

            this.views.forEach(view => {
                view.render();
            });

            this._forceRender = false;
        }
    }

    protected onActiveCamera(event: IActiveCameraEvent)
    {
        this.emit<IActiveCameraEvent>(event);
    }
}