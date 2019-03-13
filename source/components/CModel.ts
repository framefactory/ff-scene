/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import CRenderGraph from "./CRenderGraph";

////////////////////////////////////////////////////////////////////////////////

export default class CModel extends CRenderGraph
{
    static readonly typeName: string = "CModel";

    protected static readonly modelIns = {
    };

    protected static readonly modelOuts = {
    };

    ins = this.addInputs(CModel.modelIns);
    outs = this.addOutputs(CModel.modelOuts);

    protected createModelGraph(model: THREE.Object3D)
    {

    }
}