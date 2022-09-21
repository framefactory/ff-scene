/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Object3D } from "three";

import { Node } from "@ffweb/graph/Node.js";
import { Graph } from "@ffweb/graph/Graph.js";
import { CTransform } from "./components/CTransform.js";
import { CMesh } from "./components/CMesh.js";
import { CDirectionalLight } from "./components/CDirectionalLight.js";
import { CPointLight } from "./components/CPointLight.js";
import { CSpotLight } from "./components/CSpotLight.js";
import { CGeometry } from "./components/CGeometry.js";

////////////////////////////////////////////////////////////////////////////////

export function parseScene(root: Object3D, graph: Graph, includeRoot: boolean)
{
    // TODO: implement
}

function parse(object: any, parent: CTransform)
{
    let node: Node = null;

    if (object.isMesh) {
        node = parent.graph.createNode(object.name || "Mesh");
        const transform = node.createComponent(CTransform);
        parent.addChild(transform);

        const mesh = node.createComponent(CMesh);
        mesh.object3D = object;

        if (object.geometry) {
            const geometry = node.createComponent(CGeometry);
            geometry.geometry = object.geometry;
            geometry.outs.self.linkTo(mesh.ins.geometry);
        }

        if (object.material) {
            // TODO: implement
        }
    }

    if (object.isDirectionalLight) {
        node = parent.graph.createNode(object.name || "Mesh");
        const transform = node.createComponent(CTransform);
        parent.addChild(transform);

        const light = node.createComponent(CDirectionalLight);
        light.object3D = object;
    }

    if (object.isPointLight) {
        node = parent.graph.createNode(object.name || "Mesh");
        const transform = node.createComponent(CTransform);
        parent.addChild(transform);

        const light = node.createComponent(CPointLight);
        light.object3D = object;
    }

    if (object.isSpotLight) {
        node = parent.graph.createNode(object.name || "Mesh");
        const transform = node.createComponent(CTransform);
        parent.addChild(transform);

        const light = node.createComponent(CSpotLight);
        light.object3D = object;
    }
}

