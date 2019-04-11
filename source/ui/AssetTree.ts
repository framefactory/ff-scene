/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import System from "@ff/graph/System";

import Tree, { customElement, property, html } from "@ff/ui/Tree";

import CAssetManager, { IAssetEntry, IAssetTreeChangeEvent } from "../components/CAssetManager";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-asset-tree")
export default class AssetTree extends Tree<IAssetEntry>
{
    @property({ attribute: false })
    system: System;

    protected assetManager: CAssetManager = null;

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-asset-tree");

        this.addEventListener("click", this.onContainerClick.bind(this));
    }

    protected connected()
    {
        super.connected();

        this.assetManager = this.system.components.get(CAssetManager);
        this.assetManager.on<IAssetTreeChangeEvent>("tree-change", this.onTreeChange, this);
    }

    protected disconnected()
    {
        this.assetManager.off<IAssetTreeChangeEvent>("tree-change", this.onTreeChange, this);
        this.assetManager = null;

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

    protected getClasses(treeNode: IAssetEntry): string
    {
        return treeNode.info.folder ? "ff-folder" : "ff-file";
    }

    protected getId(treeNode: IAssetEntry): string
    {
        return treeNode.path;
    }

    protected isNodeExpanded(treeNode: IAssetEntry): boolean
    {
        return treeNode.expanded;
    }

    protected isNodeSelected(treeNode: IAssetEntry): boolean
    {
        return this.assetManager.isSelected(treeNode);
    }

    protected onTreeChange(event: IAssetTreeChangeEvent)
    {
        this.root = event.root;
        this.requestUpdate();
    }

    protected onContainerClick()
    {
        this.assetManager.select(null, false);
    }

    protected onNodeClick(event: MouseEvent, treeNode: IAssetEntry)
    {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

        if (event.clientX - rect.left < 30) {
            this.toggleExpanded(treeNode);
        }
        else {
            this.assetManager.select(treeNode, event.ctrlKey);
        }
    }

    protected onNodeDblClick(event: MouseEvent, treeNode: IAssetEntry)
    {
        this.assetManager.open(treeNode);
    }

    protected canDrop(event: DragEvent, targetTreeNode: IAssetEntry): boolean
    {
        // dropping assets and files into folders only
        return targetTreeNode.info.folder &&
            (super.canDrop(event, targetTreeNode) ||
                !!event.dataTransfer.types.find(type => type === "Files"));
    }

    protected onNodeDragStart(event: DragEvent, sourceTreeNode: IAssetEntry)
    {
        this.assetManager.select(sourceTreeNode, event.ctrlKey);
        event.dataTransfer.setData("text/plain", sourceTreeNode.path);

        const mimeType = sourceTreeNode.info.type;
        if (mimeType === "image/jpeg" || mimeType === "image/png") {
            const url = this.assetManager.getAssetURL(sourceTreeNode.path);
            event.dataTransfer.setData("text/html", `<img src="${url}">`);
        }

        return super.onNodeDragStart(event, sourceTreeNode);
    }

    protected onNodeDrop(event: DragEvent, targetTreeNode: IAssetEntry)
    {
        super.onNodeDrop(event, targetTreeNode);
        const files = event.dataTransfer.files;

        if (files.length > 0) {
            console.log("dropping files", files.item(0));
            this.assetManager.uploadFiles(files, targetTreeNode);
        }
        else {
            const sourceTreeNode = this.getNodeFromDragEvent(event);
            console.log("dropping asset", sourceTreeNode.path);
            this.assetManager.moveSelected(targetTreeNode);
        }
    }
}