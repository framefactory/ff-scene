/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { PropertySocket } from "@ffweb/graph/PropertySocket.js";
import { PropertySocketGroup } from "@ffweb/graph/PropertySocketGroup.js";
import { Component } from "@ffweb/graph/Component.js";
import { Node } from "@ffweb/graph/Node.js";
import { System } from "@ffweb/graph/System.js";

import { CSelection, INodeEvent, IComponentEvent } from "@ffweb/graph/components/CSelection.js";

import { Tree, customElement, property, html, ITreeNode } from "@ffweb/ui/Tree.js";

import "./PropertyView.js";

////////////////////////////////////////////////////////////////////////////////

interface IPropertyTreeNode extends ITreeNode
{
    id: string;
    children: IPropertyTreeNode[];
    text: string;
    classes: string;
    property?: PropertySocket;
}

@customElement("ff-property-tree")
export class PropertyTree extends Tree<IPropertyTreeNode>
{
    @property({ attribute: false })
    system: System;

    protected selection: CSelection = null;


    constructor(system?: System)
    {
        super();
        this.includeRoot = true;

        this.system = system;
        this.selection = system.getComponent(CSelection, true);
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-property-tree");
    }

    protected connected()
    {
        super.connected();

        const selection = this.selection;

        selection.selectedNodes.on(Node, this.onSelectNode, this);
        selection.selectedComponents.on(Component, this.onSelectComponent, this);

        const node = selection.getSelectedNode();
        if (node) {
            this.root = this.createNodeTreeNode(node);
        }
        else {
            const component = selection.getSelectedComponent();
            this.root = component ? this.createComponentTreeNode(component) : null;
        }
    }

    protected disconnected()
    {
        super.disconnected();

        this.selection.selectedNodes.off(Node, this.onSelectNode, this);
        this.selection.selectedComponents.off(Component, this.onSelectComponent, this);
    }

    protected getClasses(node: IPropertyTreeNode)
    {
        return node.classes;
    }

    protected renderNodeHeader(node: IPropertyTreeNode)
    {
        if (node.property) {
            return html`<div class="ff-text ff-property-label ff-ellipsis">${node.text}</div>
                <ff-property-view .property=${node.property}></ff-property-view>`;
        }

        return html`<div class="ff-text ff-label ff-ellipsis">${node.text}</div>`;
    }

    protected onSelectNode(event: INodeEvent)
    {
        if (event.add) {
            this.root = this.createNodeTreeNode(event.object);
        }
        else {
            this.root = null;
        }
    }

    protected onSelectComponent(event: IComponentEvent)
    {
        if (event.add) {
            this.root = this.createComponentTreeNode(event.object);
        }
        else {
            this.root = null;
        }
    }

    protected createNodeTreeNode(node: Node): IPropertyTreeNode
    {
        return {
            id: node.id,
            text: node.displayName,
            classes: "ff-node",
            children: node.components.getArray().map(component => this.createComponentTreeNode(component))
        };
    }

    protected createComponentTreeNode(component: Component): IPropertyTreeNode
    {
        const id = component.id;
        const inputsId = id + "i";
        const outputsId = id + "o";

        return {
            id,
            text: component.displayName,
            classes: "ff-component",
            property: null,
            children: [
                this.createGroupNode(inputsId, "Inputs", component.ins),
                this.createGroupNode(outputsId, "Outputs", component.outs)
            ]
        };
    }

    protected createGroupNode(id: string, text: string, group: PropertySocketGroup): IPropertyTreeNode
    {
        const sockets = group.sockets;
        const root: IPropertyTreeNode = {
            id,
            text,
            classes: group.isInputGroup() ? "ff-inputs" : "ff-outputs",
            children: []
        };

        sockets.forEach(socket => {
            const fragments = socket.path.split(".");
            let node = root;

            const count = fragments.length;
            const last = count - 1;

            for (let i = 0; i < count; ++i) {
                const fragment = fragments[i];
                let child = node.children.find(node => node.text === fragment);

                if (!child) {
                    const id = i === last ? socket.key : fragment;

                    child = {
                        id,
                        text: fragment,
                        classes: "",
                        children: [],
                        property: i === last ? socket : null
                    };
                    node.children.push(child);
                }
                node = child;
            }
        });

        return root;
    }
}
