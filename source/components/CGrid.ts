/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import math from "@ff/core/math";
import { types } from "@ff/graph/propertyTypes";
import CObject3D from "./CObject3D";

import ThreeGrid, { IGridProps } from "@ff/three/Grid";

////////////////////////////////////////////////////////////////////////////////

const _vec3a = new THREE.Vector3();
const _vec3b = new THREE.Vector3();

const _inputs = {
    position: types.Vector3("Transform.Position"),
    rotation: types.Vector3("Transform.Rotation"),
    scale: types.Scale3("Transform.Scale"),
    size: types.Number("Grid.Size", 20),
    mainDivs: types.Number("Grid.Main.Divisions", 2),
    mainColor: types.ColorRGB("Grid.Main.Color", [ 1, 1, 1 ]),
    subDivs: types.Number("Grid.Sub.Divisions", 10),
    subColor: types.ColorRGB("Grid.Sub.Color", [ 0.5, 0.5, 0.5 ])
};

export default class CGrid extends CObject3D
{
    ins = this.addInputs<CObject3D, typeof _inputs>(_inputs);


    update(): boolean
    {
        let grid = this.object3D as ThreeGrid;

        const { size, mainDivs, mainColor, subDivs, subColor } = this.ins;
        if (size.changed || mainDivs.changed || mainColor.changed || subDivs.changed || subColor.changed) {

            const props: IGridProps = {
                size: size.value,
                mainDivisions: mainDivs.value,
                mainColor: new THREE.Color().fromArray(mainColor.value),
                subDivisions: subDivs.value,
                subColor: new THREE.Color().fromArray(subColor.value)
            };

            const newGrid = this.object3D = new ThreeGrid(props);
            if (grid) {
                newGrid.matrix.copy(grid.matrix);
                newGrid.matrixWorldNeedsUpdate = true;
            }

            grid = newGrid;
        }

        const { position, rotation, scale } = this.ins;
        if (position.changed || rotation.changed || scale.changed) {
            grid.position.fromArray(position.value);
            _vec3a.fromArray(rotation.value).multiplyScalar(math.DEG2RAD);
            grid.rotation.setFromVector3(_vec3a, "XYZ");
            grid.scale.fromArray(scale.value);
            grid.updateMatrix();
        }

        return true;
    }
}