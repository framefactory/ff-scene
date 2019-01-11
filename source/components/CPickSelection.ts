/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Node from "@ff/graph/Node";
import Component from "@ff/graph/Component";
import CSelection from "@ff/graph/components/CSelection";

import Bracket from "@ff/three/Bracket";

import Transform from "./Transform";
import Object3D from "./Object3D";

import { IActiveSceneEvent } from "../RenderSystem";
import { IPointerEvent } from "../RenderView";

////////////////////////////////////////////////////////////////////////////////

export default class CPickSelection extends CSelection
{
    static readonly type: string = "CPickSelection";

    protected startX = 0;
    protected startY = 0;

    protected brackets = new Map<Component, Bracket>();
    protected onAfterRender = null;

    create()
    {
        super.create();

        this.system.on<IPointerEvent>("pointer-down", this.onPointerDown, this);
        this.system.on<IPointerEvent>("pointer-up", this.onPointerUp, this);
        this.system.on<IActiveSceneEvent>("active-scene", this.onActiveScene, this);
    }

    dispose()
    {
        this.system.off<IPointerEvent>("pointer-down", this.onPointerDown, this);
        this.system.off<IPointerEvent>("pointer-up", this.onPointerUp, this);
        this.system.off<IActiveSceneEvent>("active-scene", this.onActiveScene, this);

        super.dispose();
    }

    protected onSelectNode(node: Node, selected: boolean)
    {
        super.onSelectNode(node, selected);

        const hierarchy = node.hierarchy;
        if (hierarchy && hierarchy instanceof Transform) {
            this.updateBracket(hierarchy, selected);
        }
    }

    protected onSelectComponent(component: Component, selected: boolean)
    {
        super.onSelectComponent(component, selected);

        if (component instanceof Object3D || component instanceof Transform) {
            this.updateBracket(component, selected);
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

    protected onActiveScene(event: IActiveSceneEvent)
    {
        if (event.previous) {
            event.previous.scene.onAfterRender = this.onAfterRender;
        }

        if (event.next) {
            const scene = event.next.scene;
            this.onAfterRender = scene.onAfterRender;

            scene.onAfterRender = (renderer, scene, camera) => {
                this.renderBrackets(renderer, scene, camera);
                this.onAfterRender && this.onAfterRender();
            };
        }
    }

    protected updateBracket(component: Transform | Object3D, selected: boolean)
    {
        if (!component) {
            return;
        }

        if (selected) {
            const object3D = component.object3D;
            if (object3D) {
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

    protected renderBrackets(renderer, scene, camera)
    {
        for (let entry of this.brackets) {
            renderer.render(entry[1], camera);
        }
    }
}