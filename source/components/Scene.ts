/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import Node from "@ff/graph/Node";
import Transform from "./Transform";
import { IPointerEvent } from "../RenderView";

////////////////////////////////////////////////////////////////////////////////

export default class Scene extends Transform
{
    static readonly type: string = "Scene";

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