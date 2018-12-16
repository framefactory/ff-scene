/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { Hierarchy } from "@ff/graph";
import Transform from "./Transform";
import { IPointerEvent } from "../RenderView";

////////////////////////////////////////////////////////////////////////////////

export default class Scene extends Hierarchy
{
    static readonly type: string = "Scene";

    protected _scene: THREE.Scene;

    get object3D(): THREE.Object3D {
        return this._scene;
    }

    get scene(): THREE.Scene {
        return this._scene;
    }

    /**
     * Returns an array of child components of this.
     */
    get children(): Readonly<Transform[]>
    {
        return this._children as Transform[] || [];
    }

    create()
    {
        this._scene = new THREE.Scene();
        this.on("pointer", this.onPointer, this);
    }

    update()
    {
        return false;
    }

    addChild(component: Transform)
    {
        super.addChild(component);
        this._scene.add(component.object3D);
    }

    removeChild(component: Transform)
    {
        this._scene.remove(component.object3D);
        super.removeChild(component);
    }

    protected onPointer(event: IPointerEvent)
    {
    }
}