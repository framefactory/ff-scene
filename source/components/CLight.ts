/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph/propertyTypes";
import CObject3D from "./CObject3D";

////////////////////////////////////////////////////////////////////////////////

export enum EShadowMapResolution { Low, Medium, High }

const _mapResolution = {
    [EShadowMapResolution.Low]: 512,
    [EShadowMapResolution.Medium]: 1024,
    [EShadowMapResolution.High]: 2048,
};

export default class CLight extends CObject3D
{
    static readonly typeName: string = "CLight";

    protected static readonly lightIns = {
        color: types.ColorRGB("Light.Color"),
        intensity: types.Number("Light.Intensity", 1),
        shadowEnabled: types.Boolean("Shadow.Enabled"),
        shadowMap: types.Enum("Shadow.Resolution", EShadowMapResolution),
        shadowBlur: types.Number("Shadow.Blur", 1),
    };

    ins = this.addInputs<CObject3D, typeof CLight["lightIns"]>(CLight.lightIns);

    get light(): THREE.Light
    {
        return this.object3D as THREE.Light;
    }

    update(context)
    {
        super.update(context);

        const light = this.light;
        const ins = this.ins;

        if (ins.color.changed || ins.intensity.changed) {
            light.color.fromArray(ins.color.value);
            light.intensity = ins.intensity.value;
        }

        if (ins.shadowEnabled.changed || (ins.shadowEnabled.value && (
            ins.shadowMap.changed || ins.shadowBlur.changed))) {

            light.castShadow = ins.shadowEnabled.value;
            const mapResolution = _mapResolution[ins.shadowMap.getValidatedValue()];
            light.shadow.mapSize.set(mapResolution, mapResolution);
            light.shadow.radius = ins.shadowBlur.value;
        }

        return true;
    }
}