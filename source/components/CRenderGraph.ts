/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CGraph from "@ff/graph/components/CGraph";
import CTransform from "./CTransform";

////////////////////////////////////////////////////////////////////////////////

export default class CRenderGraph extends CGraph
{
    static readonly typeName: string = "CRenderGraph";

    create()
    {
        super.create();

        this.trackComponent(CTransform, component => {
            this.getInnerRoots()
                .filter(root => root.is(CTransform))
                .forEach((root: CTransform) => component.object3D.add(root.object3D));
        }, component => {
            this.getInnerRoots()
                .filter(root => root.is(CTransform))
                .forEach((root: CTransform) => component.object3D.remove(root.object3D));
        });
    }

    onAddInnerRoot(component: CTransform)
    {
        if (component.is(CTransform)) {
            const parent = this.getComponent(CTransform, true);
            if (parent) {
                parent.object3D.add(component.object3D);
            }
        }
    }

    onRemoveInnerRoot(component: CTransform)
    {
        if (component.is(CTransform)) {
            const parent = this.getComponent(CTransform, true);
            if (parent) {
                parent.object3D.remove(component.object3D);
            }
        }
    }
}