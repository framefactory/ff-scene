/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import resolvePathname from "resolve-pathname";

import Component, { Node, ITypedEvent } from "@ff/graph/Component";
import WebDAVProvider, { IFileInfo } from "../assets/WebDAVProvider";
import { Dictionary } from "@ff/core/types";

////////////////////////////////////////////////////////////////////////////////

const _reNoTrailingSlash = /(.*?)[\/\\]?$/;

export { IFileInfo };

export interface IAssetEntry
{
    info: IFileInfo;
    path: string;
    expanded: boolean;
    children: IAssetEntry[];
}

export interface IAssetTreeChangeEvent extends ITypedEvent<"tree-change">
{
    root: IAssetEntry;
}

export interface IAssetOpenEvent extends ITypedEvent<"asset-open">
{
    asset: IAssetEntry;
}

export default class CAssetManager extends Component
{
    static readonly typeName: string = "CAssetManager";
    static readonly isGraphSingleton = true;

    private _rootUrl: string = "";
    private _rootPath: string = "";
    private _provider: WebDAVProvider = null;
    private _assetsByPath: Dictionary<IAssetEntry> = {};
    private _rootAsset: IAssetEntry = null;
    private _selection = new Set<IAssetEntry>();

    constructor(node: Node, id: string)
    {
        super(node, id);
        this._provider = new WebDAVProvider();
    }

    get rootPath() {
        return this._rootPath;
    }

    get rootUrl() {
        return this._rootUrl;
    }

    set rootUrl(url: string) {
        url = url.split("?")[0];
        if (!url.endsWith("/")) {
            url += "/";
        }

        const href = window.location.href.split("?")[0];
        url = resolvePathname(url, href);

        this._rootUrl = resolvePathname(".", url);
        this._rootPath = new URL(this._rootUrl).pathname;

        console.log("CAssetManager - rootUrl: %s, rootPath: %s", this.rootUrl, this.rootPath)
        this.refresh();
    }

    uploadFiles(files: FileList, folder: IAssetEntry)
    {

    }

    open(asset: IAssetEntry)
    {
        this.emit<IAssetOpenEvent>({ type: "asset-open", asset });
    }

    moveSelected(folder: IAssetEntry)
    {

    }

    select(asset: IAssetEntry, toggle: boolean)
    {
        const selection = this._selection;

        if (toggle && selection.has(asset)) {
            selection.delete(asset);
        }
        else {
            if (!toggle) {
                selection.clear();
            }
            if (asset) {
                selection.add(asset);
            }
        }

        this.emit<IAssetTreeChangeEvent>({ type: "tree-change", root: this._rootAsset });
    }

    isSelected(asset: IAssetEntry)
    {
        return this._selection.has(asset);
    }

    getAssetURL(uri: string)
    {
        return resolvePathname(uri, this._rootUrl);
    }

    getAssetPathFromUrl(url: string)
    {
        if (url.endsWith("/")) {
            url = url.substr(0, url.length - 1);
        }
        const index = url.indexOf(this._rootPath);
        if (index >= 0) {
            return url.substr(index + this._rootPath.length);
        }

        return url;
    }

    getAssetByPath(path: string)
    {
        return this._assetsByPath[path];
    }

    refresh()
    {
        this._provider.getFolderInfo(this._rootUrl, true)
            .then(infos => {
                this._rootAsset = this.createAssetTree(infos);
                this.emit<IAssetTreeChangeEvent>({ type: "tree-change", root: this._rootAsset });
            });
    }

    protected createAssetTree(infos: IFileInfo[]): IAssetEntry
    {
        infos.sort((a, b) => a.url < b.url ? -1 : (a.url > b.url ? 1 : 0));

        const root: IAssetEntry = {
            info: infos[0],
            path: "",
            expanded: true,
            children: []
        };

        for (let i = 1, ni = infos.length; i < ni; ++i) {
            const info = infos[i];
            const path = this.getAssetPathFromUrl(info.url);
            const parts = path.split("/");

            let entry = root;
            for (let j = 0, nj = parts.length; j < nj; ++j) {
                const part = parts[j];

                if (j < nj - 1) {
                    entry = entry.children.find(child => child.info.name === part);
                    if (!entry) {
                        break;
                    }
                }
                else {
                    const asset: IAssetEntry = {
                        info,
                        path,
                        expanded: false,
                        children: []
                    };

                    this._assetsByPath[path] = asset;
                    entry.children.push(asset);
                }
            }
        }

        return root;
    }
}