/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Component, types } from "@ffweb/graph/Component.js";
import { ComponentTracker } from "@ffweb/graph/ComponentTracker.js";
import { Node } from "@ffweb/graph/Node.js";
import { CSelection } from "@ffweb/graph/components/CSelection.js";
import { Bracket } from "@ffweb/three/Bracket.js";

import { IPointerEvent } from "../RenderView.js";

import { CObject3D } from "./CObject3D.js";
import { CTransform } from "./CTransform.js";
import { CScene, ISceneAfterRenderEvent } from "./CScene.js";

////////////////////////////////////////////////////////////////////////////////

const _inputs = {
    viewportPicking: types.Boolean("Viewport.Picking", true),
    viewportBrackets: types.Boolean("Viewport.Brackets", true),
};

export class CPickSelection extends CSelection
{
    static readonly typeName: string = "CPickSelection";

    ins = this.addInputs<CSelection, typeof _inputs>(_inputs);

    private _brackets = new Map<Component, Bracket>();
    private _sceneTracker: ComponentTracker<CScene> = null;


    create()
    {
        super.create();

        this.system.on<IPointerEvent>("pointer-up", this.onPointerUp, this);

        this._sceneTracker = new ComponentTracker(this.system.components, CScene, component => {
            component.on<ISceneAfterRenderEvent>("after-render", this.onSceneAfterRender, this);
        }, component => {
            component.off<ISceneAfterRenderEvent>("after-render", this.onSceneAfterRender, this);
        });
    }

    dispose()
    {
        this._sceneTracker.dispose();

        this.system.off<IPointerEvent>("pointer-up", this.onPointerUp, this);
        this._sceneTracker.dispose();

        super.dispose();
    }

    update()
    {
        return true;
    }

    protected onSelectNode(node: Node, selected: boolean)
    {
        super.onSelectNode(node, selected);

        const transform = node.getComponent(CTransform, true);
        if (transform) {
            this.updateBracket(transform, selected);
        }
    }

    protected onSelectComponent(component: Component, selected: boolean)
    {
        super.onSelectComponent(component, selected);

        if (component instanceof CObject3D || component instanceof CTransform) {
            this.updateBracket(component, selected);
        }
    }

    // protected onActiveGraph(graph: Graph)
    // {
    //     if (this._sceneTracker) {
    //         this._sceneTracker.dispose();
    //     }
    //
    //     if (graph) {
    //         this._sceneTracker = new ComponentTracker(graph.components, CScene, component => {
    //             component.on<ISceneAfterRenderEvent>("after-render", this.onSceneAfterRender, this);
    //         }, component => {
    //             component.off<ISceneAfterRenderEvent>("after-render", this.onSceneAfterRender, this);
    //         });
    //     }
    // }

    protected onPointerUp(event: IPointerEvent)
    {
        if (!this.ins.viewportPicking.value || !event.isPrimary || event.isDragging) {
            return;
        }

        if (event.component) {
            this.selectComponent(event.component, event.ctrlKey);
        }
        else if (!event.ctrlKey) {
            this.clearSelection();
        }
    }

    protected onSceneAfterRender(event: ISceneAfterRenderEvent)
    {
        if (!this.ins.viewportBrackets.value) {
            return;
        }

        const renderer = event.context.renderer;
        const camera = event.context.camera;

        for (let entry of this._brackets) {
            renderer.render(entry[1] as any, camera);
        }
    }

    protected updateBracket(component: CTransform | CObject3D, selected: boolean)
    {
        if (!component) {
            return;
        }

        if (selected) {
            const object3D = component.object3D;
            if (object3D) {
                const bracket = new Bracket(component.object3D);
                this._brackets.set(component, bracket);
            }
        }
        else {
            const bracket = this._brackets.get(component);
            if (bracket) {
                this._brackets.delete(component);
                bracket.dispose();
            }
        }

        this.changed = true;
    }
}