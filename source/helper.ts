/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Node from "@ff/graph/Node";
import Graph from "@ff/graph/Graph";

import CHierarchy from "@ff/graph/components/CHierarchy";

import {
    CBox,
    CCamera,
    CDirectionalLight,
    CMesh,
    CPhongMaterial,
    CPointLight,
    CScene,
    CSpotLight,
    CTorus,
    CTransform
} from "./components";

////////////////////////////////////////////////////////////////////////////////

const createScene = function(graph: Graph, name?: string): Node
{
    const node = graph.createNode(Node, name);
    node.createComponent(CScene);
    return node;
};

const createTransform = function(parent: Node, name?: string): Node
{
    const hierarchy = parent.components.get(CHierarchy);
    if (!hierarchy) {
        throw new Error("can't attach to parent; missing a hierarchy component");
    }

    const node = parent.graph.createNode(Node, name);
    hierarchy.addChild(node.createComponent(CTransform));
    return node;
};

const createCamera = function(parent: Node, name?: string): Node
{
    const node = createTransform(parent, name);
    node.createComponent(CCamera);
    return node;
};

const createDirectionalLight = function(parent: Node, name?: string): Node
{
    const node = createTransform(parent, name);
    node.createComponent(CDirectionalLight);
    return node;
};

const createPointLight = function(parent: Node, name?: string): Node
{
    const node = createTransform(parent, name);
    node.createComponent(CPointLight);
    return node;
};

const createSpotLight = function(parent: Node, name?: string): Node
{
    const node = createTransform(parent, name);
    node.createComponent(CSpotLight);
    return node;
};

const createBox = function(parent: Node, name?: string): Node
{
    const node = createTransform(parent, name);
    node.createComponent(CMesh);
    node.createComponent(CBox);
    node.createComponent(CPhongMaterial);
    return node;
};

const createTorus = function(parent: Node, name?: string): Node
{
    const node = createTransform(parent, name);
    node.createComponent(CMesh);
    node.createComponent(CTorus);
    node.createComponent(CPhongMaterial);
    return node;
};

export {
    createScene,
    createTransform,
    createCamera,
    createDirectionalLight,
    createPointLight,
    createSpotLight,
    createBox,
    createTorus
};
