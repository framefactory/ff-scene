/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CGraph from "@ff/graph/components/CGraph";

import CTransform from "./CTransform";
import CScene from "./CScene";

////////////////////////////////////////////////////////////////////////////////

export default class CRenderGraph extends CGraph
{
    static readonly typeName: string = "CRenderGraph";

    /** The component node's transform component. */
    get transform(): CTransform | undefined {
        return this.node.components.get(CTransform, true);
    }
    /** The scene this renderable object is part of. */
    get scene(): CScene | undefined {
        const transform = this.transform;
        return transform ? transform.getParentComponent(CScene, true) : undefined;
    }

    create()
    {
        super.create();

        this.trackComponent(CTransform, component => {
            this.innerRoots
                .filter(root => root.is(CTransform))
                .forEach((root: CTransform) => component.object3D.add(root.object3D));
        }, component => {
            this.innerRoots
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