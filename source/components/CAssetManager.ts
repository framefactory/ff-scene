/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import resolvePathname from "resolve-pathname";

import Component from "@ff/graph/Component";

////////////////////////////////////////////////////////////////////////////////

export default class CAssetManager extends Component
{
    static readonly typeName: string = "CAssetManager";
    static readonly isGraphSingleton = true;

    private _assetBaseUrl: string = "";

    get assetBaseUrl() {
        return this._assetBaseUrl;
    }
    set assetBaseUrl(url: string) {
        this._assetBaseUrl = resolvePathname(".", url);
    }

    getAssetUrl(path: string)
    {
        return resolvePathname(path, this._assetBaseUrl);
    }
}