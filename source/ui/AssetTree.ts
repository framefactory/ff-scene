/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import System from "@ff/graph/System";

import Icon from "@ff/ui/Icon";
import Tree, { customElement, property, PropertyValues, html } from "@ff/ui/Tree";

import CAssetManager, { IAssetEntry, IAssetTreeChangeEvent } from "../components/CAssetManager";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-asset-tree")
export default class AssetTree extends Tree<IAssetEntry>
{
    @property({ attribute: false })
    system: System;

    protected get assetManager() {
        return this.system.components.get(CAssetManager);
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-asset-tree");
    }

    protected connected()
    {
        super.connected();
        this.assetManager.on<IAssetTreeChangeEvent>("tree-change", this.onTreeChange, this);
    }

    protected disconnected()
    {
        this.assetManager.off<IAssetTreeChangeEvent>("tree-change", this.onTreeChange, this);
        super.disconnected();
    }

    protected renderNodeHeader(treeNode: IAssetEntry)
    {
        const isFolder = treeNode.info.folder;
        const iconName = isFolder ? "folder" : "file";
        const iconClass = isFolder ? "ff-folder" : "ff-file";

        return html`<ff-icon class=${iconClass} name=${iconName}></ff-icon>
            <div class="ff-text ff-ellipsis">${treeNode.info.text}</div>`;
    }

    protected getId(treeNode: IAssetEntry): string
    {
        return treeNode.info.path;
    }

    protected onTreeChange(event: IAssetTreeChangeEvent)
    {
        console.log(event.root);
        this.root = event.root;
        this.requestUpdate();
    }
}