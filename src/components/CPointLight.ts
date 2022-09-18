/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Vector3, PointLight } from "three";

import { Node, types } from "@ff/graph/Component";

import CLight from "./CLight";

////////////////////////////////////////////////////////////////////////////////

const _vec3 = new Vector3();

export default class CPointLight extends CLight
{
    static readonly typeName: string = "CPointLight";

    protected static readonly pointLightIns = {
        position: types.Vector3("Light.Position"),
        distance: types.Number("Light.Distance"),
        decay: types.Number("Light.Decay", 1),
    };

    ins = this.addInputs<CLight, typeof CPointLight["pointLightIns"]>(CPointLight.pointLightIns);

    constructor(node: Node, id: string)
    {
        super(node, id);
        this.object3D = new PointLight();
    }

    get light(): PointLight {
        return this.object3D as PointLight;
    }

    update(context)
    {
        super.update(context);

        const light = this.light;
        const ins = this.ins;

        if (ins.position.changed) {
            light.position.fromArray(ins.position.value);
            light.updateMatrix();
        }

        if (ins.distance.changed || ins.decay.changed) {
            light.distance = ins.distance.value;
            light.decay = ins.decay.value;
        }

        light.updateMatrix();
        return true;
    }
}