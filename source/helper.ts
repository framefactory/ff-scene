/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import {
    Node,
    Graph,
    Hierarchy
} from "@ff/graph";

import {
    Box,
    Camera,
    DirectionalLight,
    Mesh,
    PhongMaterial,
    PointLight,
    Scene,
    SpotLight,
    Torus,
    Transform
} from "./components";

////////////////////////////////////////////////////////////////////////////////

const createScene = function(graph: Graph, name?: string): Node
{
    const entity = graph.createNode(name);
    entity.createComponent(Scene);
    return entity;
};

const createTransform = function(parent: Node, name?: string): Node
{
    const hierarchy = parent.components.get(Hierarchy);
    if (!hierarchy) {
        throw new Error("can't attach to parent; missing a hierarchy component");
    }

    const entity = parent.graph.createNode(name);
    hierarchy.addChild(entity.createComponent(Transform));
    return entity;
};

const createCamera = function(parent: Node, name?: string): Node
{
    const entity = createTransform(parent, name);
    entity.createComponent(Camera);
    return entity;
};

const createDirectionalLight = function(parent: Node, name?: string): Node
{
    const entity = createTransform(parent, name);
    entity.createComponent(DirectionalLight);
    return entity;
};

const createPointLight = function(parent: Node, name?: string): Node
{
    const entity = createTransform(parent, name);
    entity.createComponent(PointLight);
    return entity;
};

const createSpotLight = function(parent: Node, name?: string): Node
{
    const entity = createTransform(parent, name);
    entity.createComponent(SpotLight);
    return entity;
};

const createBox = function(parent: Node, name?: string): Node
{
    const entity = createTransform(parent, name);
    entity.createComponent(Mesh);
    entity.createComponent(Box);
    entity.createComponent(PhongMaterial);
    return entity;
};

const createTorus = function(parent: Node, name?: string): Node
{
    const entity = createTransform(parent, name);
    entity.createComponent(Mesh);
    entity.createComponent(Torus);
    entity.createComponent(PhongMaterial);
    return entity;
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
