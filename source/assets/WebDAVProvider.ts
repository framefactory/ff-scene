/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as xmlTools from "xml-js";
import * as moment from "moment";

import { Dictionary } from "@ff/core/types";

////////////////////////////////////////////////////////////////////////////////

interface IXMLElement extends xmlTools.Element
{
    dict?: Dictionary<IXMLElement>;
    texts?: string[];
}

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
    url: string;

    constructor(url?: string)
    {
        this.url = url;
    }

    getFolderInfo(url: string, recursive: boolean): Promise<IFileInfo[]>
    {
        const props = {
            headers: {
                "Content-type": "text/xml",
            },
            method: "PROPFIND"
        };

        if (!recursive) {
            props.headers["Depth"] = "1";
        }

        return fetch(url, props)
            .then(response => response.text())
            .then(xml => xmlTools.xml2js(xml))
            .then(document => _transform(document.elements[0]))
            .then(element => this.parseMultistatus(element))
    }

    createFolder(parent: IFileInfo, name: string)
    {

    }

    deleteFile(file: IFileInfo)
    {

    }

    renameFile(file: IFileInfo, name: string)
    {

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
            path: element.dict["D:href"].elements[0].text as string,
            name: prop.dict["D:displayname"].elements[0].text as string,
            created: prop.dict["D:creationdate"].elements[0].text as string,
            modified: prop.dict["D:getlastmodified"].elements[0].text as string,
            folder: isCollection,
            size: contentLength ? contentLength.elements[0].text as number : 0,
            type: contentType ? contentType.elements[0].text as string : "",
        };

        info.text = decodeURIComponent(info.name);

        return info as IFileInfo;
    }
}