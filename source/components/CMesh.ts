/**
 * FF Typescript Foundation Library
 * Copyright 2019 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { Node, types } from "@ff/graph/Component";

import CTransform from "./CTransform";
import CObject3D from "./CObject3D";
import CGeometry from "./CGeometry";
import CMaterial from "./CMaterial";

////////////////////////////////////////////////////////////////////////////////

export default class CMesh extends CObject3D
{
    static readonly typeName: string = "CMesh";

    static readonly meshIns = Object.assign({}, CTransform.transformIns, {
        geometry: types.Object("Mesh.Geometry", CGeometry),
        material: types.Object("Mesh.Material", CMaterial),
        castShadow: types.Boolean("Shadow.Cast"),
        receiveShadow: types.Boolean("Shadow.Receive"),
    });

    ins = this.addInputs<CObject3D, typeof CMesh["meshIns"]>(CMesh.meshIns);

    constructor(node: Node, id: string)
    {
        super(node, id);

        this.object3D = new THREE.Mesh();
        this.object3D.visible = false;
        this.object3D.castShadow = true;
    }

    get mesh() {
        return this.object3D as THREE.Mesh;
    }

    update(context)
    {
        super.update(context);
        super.updateTransform();

        const ins = this.ins;

        if (ins.geometry.changed) {
            this.updateGeometry(ins.geometry.value);
        }
        if (ins.material.changed) {
            this.updateMaterial(ins.material.value);
        }
        if (ins.castShadow.changed) {
            this.object3D.castShadow = ins.castShadow.value;
        }
        if (ins.receiveShadow.changed) {
            this.object3D.receiveShadow = ins.receiveShadow.value;
        }

        return true;
    }

    toString()
    {
        const geo = this.mesh.geometry;
        const mat = this.mesh.material as THREE.Material;
        return `${this.typeName} - Geometry: '${geo ? geo.type : "N/A"}', Material: '${mat ? mat.type : "N/A"}'`
    }

    protected updateGeometry(component: CGeometry | null)
    {
        const geometry = component ? component.geometry : null;
        this.mesh.geometry = geometry;
        this.mesh.visible = !!(geometry && this.mesh.material);
    }

    protected updateMaterial(component: CMaterial | null)
    {
        const material = component ? component.material : null;
        this.mesh.material = material;
        this.mesh.visible = !!(this.mesh.geometry && material);
    }
}