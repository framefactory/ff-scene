/**
 * FF Typescript Foundation Library
 * Copyright 2019 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { Node, types } from "@ff/graph/Component";

import CLight from "./CLight";
import { ERotationOrder } from "./CTransform";

////////////////////////////////////////////////////////////////////////////////

const _vec3 = new THREE.Vector3();


export default class CSpotLight extends CLight
{
    static readonly typeName: string = "CSpotLight";

    protected static readonly spotLightIns = {
        position: types.Vector3("Light.Position", [ 0, 1, 0 ]),
        rotation: types.Vector3("Light.Rotation", [ 0, 0, 0 ]),
        order: types.Enum("Light.RotationOrder", ERotationOrder),
        distance: types.Number("Light.Distance"),
        decay: types.Number("Light.Decay", 1),
        angle: types.Number("Light.Angle", 45),
        penumbra: types.Number("Light.Penumbra", 0.5),
    };

    ins = this.addInputs<CLight, typeof CSpotLight["spotLightIns"]>(CSpotLight.spotLightIns);

    constructor(node: Node, id: string)
    {
        super(node, id);
        this.object3D = new THREE.SpotLight();
    }

    get light(): THREE.SpotLight {
        return this.object3D as THREE.SpotLight;
    }

    update(context)
    {
        super.update(context);

        const light = this.light;
        const ins = this.ins;

        if (ins.position.changed || ins.rotation.changed || ins.order.changed) {
            light.position.fromArray(ins.position.value);
            _vec3.fromArray(ins.rotation.value).multiplyScalar(THREE.Math.DEG2RAD);
            const orderName = ins.order.getOptionText();
            light.rotation.setFromVector3(_vec3, orderName);
            light.updateMatrix();
        }

        if (ins.distance.changed || ins.decay.changed || ins.angle.changed || ins.penumbra.changed) {
            light.distance = ins.distance.value;
            light.decay = ins.decay.value;
            light.angle = ins.angle.value * THREE.Math.DEG2RAD;
            light.penumbra = ins.penumbra.value;
        }

        return true;
    }
}