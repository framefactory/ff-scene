/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component, { types } from "@ff/graph/Component";
import ComponentTracker from "@ff/graph/ComponentTracker";
import Node from "@ff/graph/Node";
import Graph from "@ff/graph/Graph";
import CSelection from "@ff/graph/components/CSelection";

import Bracket from "@ff/three/Bracket";

import { IPointerEvent } from "../RenderView";

import CObject3D from "./CObject3D";
import CTransform from "./CTransform";
import CScene, { ISceneAfterRenderEvent } from "./CScene";

////////////////////////////////////////////////////////////////////////////////

const inputs = {
    bracketsVisible: types.Boolean("Brackets.Visible", true)
};

export default class CPickSelection extends CSelection
{
    static readonly type: string = "CPickSelection";

    ins = this.addInputs(inputs);

    protected startX = 0;
    protected startY = 0;

    private _brackets = new Map<Component, Bracket>();
    private _sceneTracker: ComponentTracker<CScene> = null;

    create()
    {
        super.create();

        this.system.on<IPointerEvent>("pointer-down", this.onPointerDown, this);
        this.system.on<IPointerEvent>("pointer-up", this.onPointerUp, this);
    }

    dispose()
    {
        this.system.off<IPointerEvent>("pointer-down", this.onPointerDown, this);
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

        const transform = node.components.get(CTransform);
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

    protected onActiveGraph(graph: Graph)
    {
        if (this._sceneTracker) {
            this._sceneTracker.dispose();
        }

        if (graph) {
            this._sceneTracker = new ComponentTracker(graph.components, CScene, component => {
                component.on<ISceneAfterRenderEvent>("after-render", this.onSceneAfterRender, this);
            }, component => {
                component.off<ISceneAfterRenderEvent>("after-render", this.onSceneAfterRender, this);
            });
        }
    }

    protected onPointerDown(event: IPointerEvent)
    {
        if (event.isPrimary) {
            this.startX = event.centerX;
            this.startY = event.centerY;
        }
    }

    protected onPointerUp(event: IPointerEvent)
    {
        if (event.isPrimary) {
            const distance = Math.abs(this.startX - event.centerX) + Math.abs(this.startY - event.centerY);
            if (distance < 2) {
                if (event.component) {
                    this.selectComponent(event.component, event.ctrlKey);
                }
                else if (!event.ctrlKey) {
                    this.clearSelection();
                }
            }
        }
    }

    protected onSceneAfterRender(event: ISceneAfterRenderEvent)
    {
        const renderer = event.context.renderer;
        const camera = event.context.camera;

        if (this.ins.bracketsVisible.value) {
            for (let entry of this._brackets) {
                renderer.render(entry[1] as any, camera);
            }
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
    }
}