/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component, { ITypedEvent } from "@ff/graph/Component";
import CPulse from "@ff/graph/components/CPulse";

import RenderView from "../RenderView";
import CScene, { IActiveCameraEvent } from "./CScene";

////////////////////////////////////////////////////////////////////////////////

export interface IActiveSceneEvent extends ITypedEvent<"active-scene">
{
    previous: CScene;
    next: CScene;
}

export default class CRenderer extends Component
{
    static readonly type: string = "CRenderer";
    static readonly isSystemSingleton: boolean = true;

    readonly views: RenderView[] = [];

    private _activeSceneComponent: CScene = null;


    constructor(id: string)
    {
        super(id);
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
        this.trackComponent(CPulse, component => {
            component.on("pulse", this.onPulse, this)
        }, component => {
            component.off("pulse", this.onPulse, this);
        });
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
            throw new Error("render view not registered");
        }
        this.views.splice(index, 1);
        //console.log("RenderSystem.detachView - total views: %s", this.views.length);
    }

    protected onPulse()
    {
        this.views.forEach(view => {
            view.render();
        });
    }

    protected onActiveCamera(event: IActiveCameraEvent)
    {
        this.emit<IActiveCameraEvent>(event);
    }
}