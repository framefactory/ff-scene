/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph/propertyTypes";
import CTransform from "./CTransform";

////////////////////////////////////////////////////////////////////////////////

export default class CScene extends CTransform
{
    static readonly type: string = "CScene";

    ins = this.ins.append({
        activate: types.Event("Activate")
    });

    get scene(): THREE.Scene {
        return this.object3D as THREE.Scene;
    }

    update(context)
    {
        super.update(context);

        const ins = this.ins;

        if (ins.activate.changed) {
            this.system.activeSceneComponent = this;
        }

        return true;
    }

    protected createObject3D()
    {
        return new THREE.Scene();
    }
}