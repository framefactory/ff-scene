/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CObject3D, { types } from "./CObject3D";
import Floor from "@ff/three/Floor";

////////////////////////////////////////////////////////////////////////////////

const _inputs = {
    offset: types.Vector3("Floor.Offset", [ 0, -25, 0 ]),
    radius: types.Number("Floor.Radius", 50),
    color: types.ColorRGB("Floor.Color", [ 0.6, 0.75, 0.8 ]),
    opacity: types.Percent("Floor.Opacity", 0.5)
};

export default class CFloor extends CObject3D
{
    static readonly typeName: string = "CFloor";

    ins = this.addInputs<CObject3D, typeof _inputs>(_inputs);

    protected get floor() {
        return this.object3D as Floor;
    }

    create()
    {
        this.object3D = new Floor();
    }

    update(context)
    {
        super.update(context);

        const ins = this.ins;
        const floor = this.floor;

        if (ins.offset.changed || ins.radius.changed) {
            floor.position.fromArray(ins.offset.value);
            floor.scale.setScalar(ins.radius.value);
            floor.updateMatrix();
        }
        if (ins.color.changed) {
            floor.material.color.fromArray(ins.color.value);
        }
        if (ins.opacity.changed) {
            floor.material.opacity = ins.opacity.value;
        }

        return true;
    }

    dispose()
    {
        this.floor.dispose();
        super.dispose();
    }
}