/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

//import resolvePathname from "resolve-pathname";

import Component, { Node, ITypedEvent } from "@ff/graph/Component";
import WebDAVProvider, { IFileInfo } from "../assets/WebDAVProvider";

////////////////////////////////////////////////////////////////////////////////

const _reNoTrailingSlash = /(.*?)[\/\\]?$/;

export { IFileInfo };

export interface IAssetEntry
{
    info: IFileInfo;
    expanded: boolean;
    children: IAssetEntry[];
}

export interface IAssetTreeChangeEvent extends ITypedEvent<"tree-change">
{
    root: IAssetEntry;
}

export default class CAssetManager extends Component
{
    static readonly typeName: string = "CAssetManager";
    static readonly isGraphSingleton = true;

    private _rootUrl: string = "";
    private _provider: WebDAVProvider = null;
    private _rootAsset: IAssetEntry;

    constructor(node: Node, id: string)
    {
        super(node, id);

        this._rootUrl = "https://voyager.framelab.io/data/";
        this._provider = new WebDAVProvider();
    }

    get rootUrl() {
        return this._rootUrl;
    }
    set rootUrl(url: string) {
        this._rootUrl = url;
    }

    create()
    {
        super.create();
        this.refresh();
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
        const rootPath = this.getPathNoTrail(this._rootUrl) + "/";

        infos.sort((a, b) => a.path < b.path ? -1 : (a.path > b.path ? 1 : 0));

        const root: IAssetEntry = {
            info: infos[0],
            expanded: true,
            children: []
        };

        for (let i = 1, ni = infos.length; i < ni; ++i) {
            const info = infos[i];
            const path = this.getPathNoTrail(info.path).substr(rootPath.length);
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
                    entry.children.push({
                        info,
                        expanded: false,
                        children: []
                    });
                }
            }
        }

        return root;
    }

    protected getPathNoTrail(url: string)
    {
        return _reNoTrailingSlash.exec(new URL(url).pathname)[1];
    }
}