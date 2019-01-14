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

const ins = {
    activate: types.Event("Activate")
};

export default class CScene extends CTransform
{
    static readonly type: string = "CScene";

    ins = this.addInputs<CTransform, typeof ins>(ins);

    get scene(): THREE.Scene {
        return this.object3D as THREE.Scene;
    }

    create()
    {
        super.create();

        if (!this.system.activeSceneComponent) {
            this.system.activeSceneComponent = this;
        }
    }

    update(context)
    {
        super.update(context);

        if (this.ins.activate.changed) {
            this.system.activeSceneComponent = this;
        }

        return true;
    }

    protected createObject3D()
    {
        return new THREE.Scene();
    }
}