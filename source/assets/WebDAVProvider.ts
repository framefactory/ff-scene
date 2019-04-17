/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as xmlTools from "xml-js";
import resolvePathname from "resolve-pathname";

import { Dictionary } from "@ff/core/types";

////////////////////////////////////////////////////////////////////////////////

interface IXMLElement extends xmlTools.Element
{
    dict?: Dictionary<IXMLElement>;
    texts?: string[];
}

// recursively puts elements in a dictionary for access by name
const _transform = function(element: IXMLElement) {

    if (element.elements) {
        const dict = {};
        const texts = [];

        element.elements.forEach(element => {
            _transform(element);
            if (element.type === "element" && element.name) {
                dict[element.name] = element;
            }
            else if (element.type === "text") {
                texts.push(element.text);
            }
        });

        element.dict = dict;
        element.texts = texts;
    }

    return element;
};

export interface IFileInfo
{
    url: string;
    path: string;
    name: string;
    text: string;
    created: string;
    modified: string;
    folder: boolean;
    size: number;
    type: string;
}

export default class WebDAVProvider
{
    private _rootUrl: string;
    private _rootPath: string;

    constructor(rootUrl?: string)
    {
        this.rootUrl = rootUrl || window.location.href;
    }

    set rootUrl(url: string) {
        this._rootUrl = url;
        this._rootPath = new URL(url).pathname;

        console.log("WebDAVProvider - rootUrl: %s, rootPath: %s", this.rootUrl, this.rootPath)
    }
    get rootUrl() {
        return this._rootUrl;
    }
    get rootPath() {
        return this._rootPath;
    }

    get(folderPath: string | IFileInfo, recursive: boolean): Promise<IFileInfo[]>
    {
        folderPath = typeof folderPath === "object" ? folderPath.path : folderPath;

        const url = resolvePathname(folderPath, this.rootUrl);

        const props = {
            headers: {
                "Content-Type": "text/xml",
            },
            method: "PROPFIND",
        };

        if (!recursive) {
            props.headers["Depth"] = "1";
        }

        return fetch(url, props).then(response => {
                if (!response.ok) {
                    throw new Error(`failed to get content: ${response.status} ${response.statusText}`);
                }

                return response.text();
            })
            .then(xml => xmlTools.xml2js(xml))
            .then(document => _transform(document.elements[0]))
            .then(element => this.parseMultistatus(element));
    }

    create(parentPath: string | IFileInfo, folderName: string): Promise<void>
    {
        parentPath = typeof parentPath === "object" ? parentPath.path : parentPath;

        let url = resolvePathname(parentPath, this.rootUrl);
        url = resolvePathname(folderName, url);

        console.log("WebDAVProvider.create - url: %s", url);

        const props = {
            headers: {
                "Content-Type": "text/xml",
            },
            method: "MKCOL",
        };

        return fetch(url, props).then(response => {
            if (!response.ok) {
                throw new Error(`failed to create folder: ${response.status} ${response.statusText}`);
            }
        });
    }

    delete(filePath: string | IFileInfo)
    {
        filePath = typeof filePath === "object" ? filePath.path : filePath;

        const url = resolvePathname(filePath, this.rootUrl);
        console.log("WebDAVProvider.delete - url: %s", url);

        const props = {
            headers: {
                "Content-Type": "text/xml",
            },
            method: "DELETE",
        };

        return fetch(url, props).then(response => {
            if (!response.ok) {
                throw new Error(`failed to delete: ${response.status} ${response.statusText}`);
            }
        });
    }

    rename(filePath: string | IFileInfo, name: string): Promise<void>
    {
        filePath = typeof filePath === "object" ? filePath.path : filePath;

        const parts = filePath.split("/");
        parts.pop();
        const destinationPath = parts.join("/") + "/" + name;

        return this.move(filePath, destinationPath);
    }

    move(filePath: string | IFileInfo, destinationPath: string | IFileInfo)
    {
        filePath = typeof filePath === "object" ? filePath.path : filePath;
        destinationPath = typeof destinationPath === "object" ? destinationPath.path : destinationPath;

        const props = {
            headers: {
                "Content-Type": "text/xml",
                "Destination": encodeURI(resolvePathname(destinationPath, this.rootUrl)),
                "Overwrite": "F",
            },
            method: "MOVE",
        };

        const url = encodeURI(resolvePathname(filePath, this.rootUrl));
        console.log("WebDAVProvider.move/rename - url: %s to %s", url, props.headers.Destination);

        return fetch(url, props).then(response => {
            if (!response.ok) {
                throw new Error(`failed to move/rename: ${response.status} ${response.statusText}`);
            }
        });
    }

    exists(filePath: string | IFileInfo): Promise<boolean>
    {
        return this.get(filePath, false)
            .then(() => true)
            .catch(() => false);
    }

    protected parseMultistatus(element: IXMLElement): IFileInfo[]
    {
        if (element.name !== "D:multistatus") {
            return null;
        }

        return element.elements.filter(element => element.name === "D:response")
            .map(element => this.parseResponse(element));
    }

    protected parseResponse(element: IXMLElement): IFileInfo
    {
        const propStat = element.dict["D:propstat"];
        const prop = propStat.dict["D:prop"];

        const resourceType = prop.dict["D:resourcetype"];
        const isCollection = resourceType && resourceType.elements ? !!resourceType.dict["D:collection"] : false;

        const contentLength = prop.dict["D:getcontentlength"];
        const contentType = prop.dict["D:getcontenttype"];

        const info: Partial<IFileInfo> = {
            url: decodeURI(element.dict["D:href"].elements[0].text as string),
            name: decodeURI(prop.dict["D:displayname"].elements[0].text as string),
            created: prop.dict["D:creationdate"].elements[0].text as string,
            modified: prop.dict["D:getlastmodified"].elements[0].text as string,
            folder: isCollection,
            size: contentLength ? contentLength.elements[0].text as number : 0,
            type: contentType ? contentType.elements[0].text as string : "",
        };

        let path = new URL(info.url).pathname;
        const index = path.indexOf(this._rootPath);
        if (index >= 0) {
            path = path.substr(index + this._rootPath.length);
        }

        info.path = path;

        return info as IFileInfo;
    }
}