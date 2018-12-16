/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { ComponentTracker } from "@ff/graph";

import Geometry from "./Geometry";
import Material from "./Material";
import Object3D from "./Object3D";

////////////////////////////////////////////////////////////////////////////////

export default class Mesh extends Object3D
{
    static readonly type: string = "Mesh";

    protected geometryTracker: ComponentTracker<Geometry>;
    protected materialTracker: ComponentTracker<Material>;


    get mesh() {
        return this.object3D as THREE.Mesh;
    }

    create()
    {
        super.create();

        this.object3D = new THREE.Mesh();
        this.object3D.visible = false;

        this.geometryTracker = this.trackComponent(Geometry, component => {
            this.mesh.geometry = component.geometry;
            component.on(Geometry.geometryEvent, this.updateGeometry, this);
        }, component => {
            this.mesh.geometry = null;
            component.off(Geometry.geometryEvent, this.updateGeometry, this);
        });

        this.materialTracker = this.trackComponent(Material, component => {
            this.mesh.material = component.material;
            component.on(Material.materialEvent, this.updateMaterial, this);
        }, component => {
            this.mesh.material = null;
            component.off(Material.materialEvent, this.updateMaterial, this);
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