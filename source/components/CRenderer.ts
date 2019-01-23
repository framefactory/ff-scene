/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component, { ITypedEvent } from "@ff/graph/Component";
import CPulse from "@ff/graph/components/CPulse";

import RenderView from "../RenderView";
import CScene from "./CScene";

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
        this.addEvents("active-scene");
    }

    get activeSceneGraph() {
        return this._activeSceneComponent ? this._activeSceneComponent.graph : null;
    }

    get activeSceneComponent() {
        return this._activeSceneComponent;
    }
    set activeSceneComponent(component: CScene) {
        if (component !== this._activeSceneComponent) {
            const previous = this._activeSceneComponent;
            this._activeSceneComponent = component;

            const event: IActiveSceneEvent = { type: "active-scene", previous, next: component };
            this.emit(event);
            this.system.emit(event);
        }
    }

    get activeScene() {
        return this._activeSceneComponent ? this._activeSceneComponent.scene : null;
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
}