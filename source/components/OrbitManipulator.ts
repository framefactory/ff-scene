/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { types } from "@ff/graph/propertyTypes";

import ObjectManipulator from "@ff/three/ObjectManipulator";

import Main from "./Main";
import { IPointerEvent, ITriggerEvent } from "../RenderView";
import Component from "../Component";

////////////////////////////////////////////////////////////////////////////////

export default class OrbitManipulator extends Component
{
    static readonly type: string = "OrbitManipulator";

    ins = this.ins.append({
        enabled: types.Boolean("Enabled", true),
        overPush: types.Event("Override.Push"),
        overEnabled: types.Boolean("Override.Enabled", false),
        overOrientation: types.Vector3("Override.Orientation", [ 0, 0, 0 ]),
        overOffset: types.Vector3("Override.Offset", [ 0, 0, 50 ]),
        minOrientation: types.Vector3("Min.Orientation", [ -90, NaN, NaN ]),
        minOffset: types.Vector3("Min.Offset", [ NaN, NaN, 0.1 ]),
        maxOrientation: types.Vector3("Max.Orientation", [ 90, NaN, NaN ]),
        maxOffset: types.Vector3("Max.Offset", [ NaN, NaN, 100 ])
    });

    outs = this.outs.append({
        orientation: types.Vector3("Orientation"),
        offset: types.Vector3("Offset"),
        size: types.Number("Size")
    });

    protected manip = new ObjectManipulator();
    protected main = this.trackComponent(Main);

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

        const { minOrientation, minOffset, maxOrientation, maxOffset } = ins;
        if (minOrientation.changed || minOffset.changed || maxOrientation.changed || maxOffset.changed) {
            manip.minOrientation.fromArray(minOrientation.value);
            manip.minOffset.fromArray(minOffset.value);
            manip.maxOrientation.fromArray(maxOrientation.value);
            manip.maxOffset.fromArray(maxOffset.value);
        }

        const { overPush, overEnabled, overOrientation, overOffset } = ins;
        if (overPush.changed || overEnabled.value) {
            manip.orientation.fromArray(overOrientation.value);
            manip.offset.fromArray(overOffset.value);
        }

        return true;
    }

    tick()
    {
        const manip = this.manip;
        const { enabled } = this.ins;
        const { orientation, offset, size } = this.outs;

        if (enabled.value) {
            manip.update();

            manip.orientation.toArray(orientation.value);
            orientation.set();
            manip.offset.toArray(offset.value);
            offset.set();
            size.setValue(manip.size);


            const main = this.main.component;
            const cameraComponent = main ? main.cameraComponent : null;

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
        if (this.ins.enabled.value && this.main.component) {
            const viewport = event.viewport;
            this.manip.setViewportSize(viewport.width, viewport.height);
            this.manip.onPointer(event);
            event.stopPropagation = true;
        }
    }

    protected onTrigger(event: ITriggerEvent)
    {
        if (this.ins.enabled.value && this.main.component) {
            const viewport = event.viewport;
            this.manip.setViewportSize(viewport.width, viewport.height);
            this.manip.onTrigger(event);
            event.stopPropagation = true;
        }
    }
}