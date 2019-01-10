/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Commander from "@ff/core/Commander";
import Component from "@ff/graph/Component";
import Node from "@ff/graph/Node";

import SelectionControllerBase, { INodeEvent, IComponentEvent } from "@ff/graph/SelectionController";

import Bracket from "@ff/three/Bracket";
import Transform from "./components/Transform";
import Object3D from "./components/Object3D";

import { IPointerEvent } from "./RenderView";
import EditorSystem, { IRenderContext } from "./EditorSystem";

////////////////////////////////////////////////////////////////////////////////

export { INodeEvent, IComponentEvent };

export default class SelectionController extends SelectionControllerBase
{
    readonly system: EditorSystem;

    protected startX = 0;
    protected startY = 0;

    protected brackets = new Map<Component, Bracket>();

    constructor(system: EditorSystem, commander: Commander)
    {
        super(system, commander);
        system.on<IPointerEvent>("pointer-down", this.onPointerDown, this);
        system.on<IPointerEvent>("pointer-up", this.onPointerUp, this);
    }

    dispose()
    {
        super.dispose();
        this.system.off<IPointerEvent>("pointer-down", this.onPointerDown, this);
        this.system.off<IPointerEvent>("pointer-up", this.onPointerUp, this);
    }

    render(renderer, scene, camera)
    {
        for (let entry of this.brackets) {
            renderer.render(entry[1], camera);
        }
    }

    protected onSelectNode(node: Node, selected: boolean)
    {
        super.onSelectNode(node, selected);

        const hierarchy = node.hierarchy;
        if (hierarchy && hierarchy instanceof Transform) {
            this.bracketSelection(hierarchy, selected);
        }
    }

    protected onSelectComponent(component: Component, selected: boolean)
    {
        super.onSelectComponent(component, selected);

        if (component instanceof Object3D || component instanceof Transform) {
            this.bracketSelection(component, selected);
        }
    }

    protected bracketSelection(component: Transform | Object3D, selected: boolean)
    {
        if (!component) {
            return;
        }

        if (selected) {
            const sceneComponent = this.system.activeSceneComponent;
            if (sceneComponent) {
                const bracket = new Bracket(component.object3D);
                this.brackets.set(component, bracket);
            }
        }
        else {
            const bracket = this.brackets.get(component);
            if (bracket) {
                this.brackets.delete(component);
                bracket.dispose();
            }
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
                //this.selectNode(event.node, event.ctrlKey);
                this.selectComponent(event.component, event.ctrlKey);
            }
        }
    }
}