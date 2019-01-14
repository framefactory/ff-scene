/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { types } from "@ff/graph/propertyTypes";

import OrbitManip from "@ff/three/OrbitManipulator";

import { IPointerEvent, ITriggerEvent } from "../RenderView";
import RenderComponent from "../RenderComponent";

////////////////////////////////////////////////////////////////////////////////

const ins = {
    enabled: types.Boolean("Enabled", true),
    orbit: types.Vector3("Orbit", [ 0, 0, 0 ]),
    offset: types.Vector3("Offset", [ 0, 0, 50 ]),
    minOrbit: types.Vector3("Min.Orbit", [ -90, NaN, NaN ]),
    minOffset: types.Vector3("Min.Offset", [ NaN, NaN, 0.1 ]),
    maxOrbit: types.Vector3("Max.Orbit", [ 90, NaN, NaN ]),
    maxOffset: types.Vector3("Max.Offset", [ NaN, NaN, 100 ])
};

const outs = {
    orbit: types.Vector3("Orbit"),
    offset: types.Vector3("Offset"),
    size: types.Number("Size")
};

export default class COrbitManipulator extends RenderComponent
{
    static readonly type: string = "COrbitManipulator";

    ins = this.addInputs(ins);
    outs = this.addOutputs(outs);

    protected manip = new OrbitManip();

    create()
    {
        super.create();

        this.manip.cameraMode = true;

        this.system.on(["pointer-down", "pointer-up", "pointer-move"], this.onPointer, this);
        this.system.on("wheel", this.onTrigger, this);
    }

    dispose()
    {
        super.dispose();

        this.system.off(["pointer-down", "pointer-up", "pointer-move"], this.onPointer, this);
        this.system.off("wheel", this.onTrigger, this);
    }

    update()
    {
        const manip = this.manip;
        const ins = this.ins;

        const { minOrbit, minOffset, maxOrbit, maxOffset } = ins;
        if (minOrbit.changed || minOffset.changed || maxOrbit.changed || maxOffset.changed) {
            manip.minOrbit.fromArray(minOrbit.value);
            manip.minOffset.fromArray(minOffset.value);
            manip.maxOrbit.fromArray(maxOrbit.value);
            manip.maxOffset.fromArray(maxOffset.value);
        }

        if (ins.orbit.changed) {
            manip.orbit.fromArray(ins.orbit.value);
        }
        if (ins.offset.changed) {
            manip.offset.fromArray(ins.offset.value);
        }

        return true;
    }

    tick()
    {
        const manip = this.manip;
        const { enabled } = this.ins;
        const { orbit, offset, size } = this.outs;

        if (enabled.value) {
            manip.update();

            manip.orbit.toArray(orbit.value);
            orbit.set();
            manip.offset.toArray(offset.value);
            offset.set();
            size.setValue(manip.size);


            const cameraComponent = this.system.activeCameraComponent;

            if (cameraComponent) {
                const transformComponent = cameraComponent.transform;
                if (transformComponent) {
                    this.manip.toObject(transformComponent.object3D);
                }
                else {
                    this.manip.toObject(cameraComponent.object3D);
                }

                if (cameraComponent.camera.isOrthographicCamera) {
                    cameraComponent.camera.size = this.manip.size;
                }

                return true;
            }
        }

        return false;
    }

    protected onPointer(event: IPointerEvent)
    {
        if (this.ins.enabled.value && this.system.activeCameraComponent) {
            const viewport = event.viewport;
            this.manip.setViewportSize(viewport.width, viewport.height);
            this.manip.onPointer(event);
            event.stopPropagation = true;
        }
    }

    protected onTrigger(event: ITriggerEvent)
    {
        if (this.ins.enabled.value && this.system.activeCameraComponent) {
            const viewport = event.viewport;
            this.manip.setViewportSize(viewport.width, viewport.height);
            this.manip.onTrigger(event);
            event.stopPropagation = true;
        }
    }
}