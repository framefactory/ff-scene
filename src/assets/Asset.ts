/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

export enum EAssetType {
    Image,
    Video,
    Audio,
    Text,
    Geometry,
    Model
}

export class Asset
{
    path: string;
    type: EAssetType;
    mimeType: string;

    get extension() {
        return this.path.split(".").pop();
    }
}

export interface IAssetType
{
    id: string;
    name: string;
    //reader: AssetReader;
    //writer: AssetWriter;
}