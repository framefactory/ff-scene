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
import RenderSystem from "./RenderSystem";

////////////////////////////////////////////////////////////////////////////////

export { INodeEvent, IComponentEvent };

export default class SelectionController extends SelectionControllerBase
{
    readonly system: RenderSystem;

    protected startX = 0;
    protected startY = 0;

    protected brackets = new WeakMap<THREE.Object3D, Bracket>();

    constructor(system: RenderSystem, commander: Commander)
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

    protected onSelectNode(node: Node, selected: boolean)
    {
        super.onSelectNode(node, selected);

        const hierarchy = node.hierarchy;
        if (hierarchy && hierarchy instanceof Transform) {
            this.bracketSelection(hierarchy.object3D, selected);
        }
    }

    protected onSelectComponent(component: Component, selected: boolean)
    {
        super.onSelectComponent(component, selected);

        if (component instanceof Object3D || component instanceof Transform) {
            this.bracketSelection(component.object3D, selected);
        }
    }

    protected bracketSelection(object3D: THREE.Object3D, selected: boolean)
    {
        if (selected) {
            const sceneComponent = this.system.activeSceneComponent;
            if (sceneComponent) {
                const bracket = new Bracket(object3D);
                this.brackets.set(object3D, bracket);
                sceneComponent.scene.add(bracket);
            }
        }
        else {
            const bracket = this.brackets.get(object3D);
            this.brackets.delete(object3D);
            bracket.dispose();
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