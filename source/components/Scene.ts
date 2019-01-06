/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph/propertyTypes";
import Node from "@ff/graph/Node";
import Transform from "./Transform";
import { IPointerEvent } from "../RenderView";

////////////////////////////////////////////////////////////////////////////////

export default class Scene extends Transform
{
    static readonly type: string = "Scene";

    ins = this.ins.append({
        activate: types.Event("Scene.Activate"),
        autoActivate: types.Boolean_true("Scene.AutoActivate"),
    });

    get scene(): THREE.Scene {
        return this.object3D as THREE.Scene;
    }

    constructor(node: Node, id?: string)
    {
        super(node, id);
        this.on("pointer", this.onPointer, this);
    }

    update()
    {
        super.update();

        const { activate, autoActivate } = this.ins;

        if (autoActivate.changed && autoActivate.value) {
            if (!this.system.activeSceneComponent) {
                this.system.activeSceneComponent = this;
            }
        }
        if (activate.value) {
            this.system.activeSceneComponent = this;
        }

        return true;
    }

    protected onPointer(event: IPointerEvent)
    {
    }

    protected createObject3D()
    {
        return new THREE.Scene();
    }
}