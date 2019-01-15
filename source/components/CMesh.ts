/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import ComponentTracker from "@ff/graph/ComponentTracker";

import CGeometry from "./CGeometry";
import CMaterial from "./CMaterial";
import CObject3D from "./CObject3D";

////////////////////////////////////////////////////////////////////////////////

export default class CMesh extends CObject3D
{
    static readonly type: string = "CMesh";

    protected geometryTracker: ComponentTracker<CGeometry>;
    protected materialTracker: ComponentTracker<CMaterial>;


    get mesh() {
        return this.object3D as THREE.Mesh;
    }

    create()
    {
        super.create();

        this.object3D = new THREE.Mesh();
        this.object3D.visible = false;

        this.geometryTracker = this.trackComponent(CGeometry, component => {
            this.mesh.geometry = component.geometry;
            component.on("geometry", this.updateGeometry, this);
        }, component => {
            this.mesh.geometry = null;
            component.off("geometry", this.updateGeometry, this);
        });

        this.materialTracker = this.trackComponent(CMaterial, component => {
            this.mesh.material = component.material;
            component.on("material", this.updateMaterial, this);
        }, component => {
            this.mesh.material = null;
            component.off("material", this.updateMaterial, this);
        });
    }

    toString()
    {
        const geo = this.mesh.geometry;
        const mat = this.mesh.material as THREE.Material;
        return `${this.type} - Geometry: '${geo ? geo.type : "N/A"}', Material: '${mat ? mat.type : "N/A"}'`
    }

    protected updateGeometry(geometry: THREE.BufferGeometry)
    {
        this.mesh.geometry = geometry;
        this.mesh.visible = !!(geometry && this.mesh.material);
    }

    protected updateMaterial(material: THREE.Material)
    {
        this.mesh.material = material;
        this.mesh.visible = !!(this.mesh.geometry && material);
    }
}