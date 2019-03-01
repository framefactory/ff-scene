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

import Grid, { IGridProps } from "@ff/three/Grid";

////////////////////////////////////////////////////////////////////////////////

const _vec3a = new THREE.Vector3();
const _vec3b = new THREE.Vector3();


export default class CGrid extends CObject3D
{
    static readonly typeName: string = "CGrid";

    static readonly gridIns = Object.assign({}, CObject3D.transformIns, {
        size: types.Number("Grid.Size", 20),
        mainDivs: types.Number("Grid.Main.Divisions", 2),
        mainColor: types.ColorRGB("Grid.Main.Color", [ 1, 1, 1 ]),
        subDivs: types.Number("Grid.Sub.Divisions", 10),
        subColor: types.ColorRGB("Grid.Sub.Color", [ 0.5, 0.5, 0.5 ])
    });

    ins = this.addInputs<CObject3D, typeof CGrid["gridIns"]>(CGrid.gridIns);

    protected get grid() {
        return this.object3D as Grid;
    }

    update(context)
    {
        super.update(context);
        super.updateTransform();

        const ins = this.ins;
        let grid = this.grid;

        const { size, mainDivs, mainColor, subDivs, subColor } = this.ins;
        if (size.changed || mainDivs.changed || mainColor.changed || subDivs.changed || subColor.changed) {

            const props: IGridProps = {
                size: size.value,
                mainDivisions: mainDivs.value,
                mainColor: new THREE.Color().fromArray(mainColor.value),
                subDivisions: subDivs.value,
                subColor: new THREE.Color().fromArray(subColor.value)
            };

            const newGrid = this.object3D = new Grid(props);
            if (grid) {
                newGrid.matrix.copy(grid.matrix);
                newGrid.matrixWorldNeedsUpdate = true;
            }

            grid = newGrid;
        }

        return true;
    }
}