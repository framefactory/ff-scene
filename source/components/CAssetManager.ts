/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

//import resolvePathname from "resolve-pathname";

import Component, { Node } from "@ff/graph/Component";
import WebDAVProvider from "../assets/WebDAVProvider";

////////////////////////////////////////////////////////////////////////////////

export default class CAssetManager extends Component
{
    static readonly typeName: string = "CAssetManager";
    static readonly isGraphSingleton = true;

    private _assetBaseUrl: string = "";
    private _provider: WebDAVProvider = null;

    constructor(node: Node, id: string)
    {
        super(node, id);
        this._provider = new WebDAVProvider();
    }

    test()
    {
        this._provider.test();
    }

    get assetBaseUrl() {
        return this._assetBaseUrl;
    }
    set assetBaseUrl(url: string) {
        //this._assetBaseUrl = resolvePathname(".", url);
    }

    getAssetUrl(path: string)
    {
        //return resolvePathname(path, this._assetBaseUrl);
    }
}