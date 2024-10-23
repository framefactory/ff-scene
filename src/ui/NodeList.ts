/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Component, ComponentOrType, IComponentEvent } from "@ffweb/graph/Component.js";
import { Node, NodeOrType, INodeEvent } from "@ffweb/graph/Node.js";
import { Graph } from "@ffweb/graph/Graph.js";
import { CSelection } from "@ffweb/graph/components/CSelection.js";

import { customElement, property, PropertyValues } from "@ffweb/ui/CustomElement.js";
import { List } from "@ffweb/ui/List.js";

////////////////////////////////////////////////////////////////////////////////

/**
 * Displays a list of nodes, of the given type, contained in the given graph.
 * Clicking on an item in the list selects the corresponding node.
 * If a component type is given, the component with the given type is selected instead of the node.
 *
 */
@customElement("ff-node-list")
export class NodeList<N extends Node = Node, C extends Component = Component> extends List<N>
{
    @property({ attribute: false })
    graph: Graph = null;

    @property({ attribute: false })
    node: NodeOrType<N> = null;

    @property({ attribute: false })
    component: ComponentOrType<C> = null;

    private _graph: Graph = null;
    private _nodeType: NodeOrType<N> = null;
    private _componentType: ComponentOrType<C> = null;

    private get _selection() {
        return this._graph.system.getMainComponent(CSelection, true);
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-node-list");
    }

    protected connected()
    {
        super.connected();
        this.subscribe();
    }

    protected disconnected()
    {
        this.unsubscribe();
        super.disconnected();
    }

    protected update(props: PropertyValues)
    {
        this.subscribe();
        this.data = this._graph.nodes.getArray<N>(this._nodeType);

        super.update(props);
    }

    protected renderItem(node: N): string
    {
        return node.displayName;
    }

    protected isItemSelected(node: N): boolean
    {
        const selection = this._selection;

        if (selection.selectedNodes.contains(node)) {
            return true;
        }

        if (this._componentType) {
            const component = node.components.get(this._componentType);
            if (selection.selectedComponents.contains(component)) {
                return true;
            }
        }

        return false;
    }

    protected subscribe()
    {
        this.unsubscribe();

        this._graph = this.graph;
        this._nodeType = this.node;
        this._componentType = this.component;

        if (this._graph) {
            this._graph.nodes.on(this._nodeType, this.onUpdateNodes, this);
            this._selection.selectedNodes.on(this._nodeType, this.onSelectNode, this);

            if (this._componentType) {
                this._selection.selectedComponents.on(this._componentType, this.onSelectComponent, this);
            }
        }
    }

    protected unsubscribe()
    {
        if (this._graph) {
            this._graph.nodes.off(this._nodeType, this.onUpdateNodes, this);
            this._selection.selectedNodes.off(this._nodeType, this.onSelectNode, this);

            if (this._componentType) {
                this._selection.selectedComponents.off(this._componentType, this.onSelectComponent, this);
            }

            this._graph = null;
        }
    }

    protected onClickItem(event: MouseEvent, node: N)
    {
        const component = this._componentType ? node.components.get(this._componentType) : null;

        if (component) {
            this._selection.selectComponent(component, event.ctrlKey);
        }
        else {
            this._selection.selectNode(node, event.ctrlKey);
        }
    }

    protected onClickEmpty(_event: MouseEvent)
    {
        const selection = this._selection;

        if (selection.selectedComponents.has(this._componentType)) {
            selection.clearSelection();
        }
        else if (selection.selectedNodes.has(this._nodeType)) {
            selection.clearSelection();
        }
    }

    protected onUpdateNodes()
    {
        this.requestUpdate();
    }

    protected onSelectNode(event: INodeEvent<N>)
    {
        this.setSelected(event.object, event.add);
    }

    protected onSelectComponent(event: IComponentEvent<C>)
    {
        const component = event.object;
        const node = component.node;

        if (node.is(this._nodeType) && component.is(this._componentType)) {
            this.setSelected(node as N, event.add);
        }
    }
}