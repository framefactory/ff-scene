/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import Component, { types } from "@ff/graph/Component";

////////////////////////////////////////////////////////////////////////////////

export { types };

export enum EMappingMode {
    UV,
    CubeReflection,
    CubeRefraction,
    EquiRectReflection,
    EquiRectRefraction,
    SphericalReflection,
    CubeUVReflection,
    CubeUVRefraction,
}

const _THREE_MAPPING_MODE = [
    THREE.UVMapping,
    THREE.CubeReflectionMapping,
    THREE.CubeRefractionMapping,
    THREE.EquirectangularReflectionMapping,
    THREE.EquirectangularRefractionMapping,
    THREE.SphericalReflectionMapping,
    THREE.CubeUVReflectionMapping,
    THREE.CubeUVRefractionMapping,
];

export enum EWrapMode {
    Clamp,
    Repeat,
    Mirrored,
}

const _THREE_WRAP_MODE = [
    THREE.ClampToEdgeWrapping,
    THREE.RepeatWrapping,
    THREE.MirroredRepeatWrapping
];

export enum EFilterMode {
    Linear,
    Nearest,
}

const _THREE_FILTER_MODE = [
    THREE.LinearFilter,
    THREE.NearestFilter
];

const _THREE_MIPMAP_FILTER_MODE = [
    [ THREE.LinearMipMapLinearFilter, THREE.LinearMipMapNearestFilter ],
    [ THREE.NearestMipMapLinearFilter, THREE.NearestMipMapNearestFilter ],
];

export enum EEncodingType {
    Linear,
    sRGB,
    Gamma,
    RGBE,
    // LogLuv,
    // RGBM7,
    // RGBM16,
    // RGBD,
}

const _THREE_ENCODING_TYPE = [
    THREE.LinearEncoding,
    THREE.sRGBEncoding,
    THREE.GammaEncoding,
    THREE.RGBEEncoding,
    THREE.LogLuvEncoding,
    THREE.RGBM7Encoding,
    THREE.RGBM16Encoding,
    THREE.RGBDEncoding
];

export default class CTexture extends Component
{
    static readonly typeName: string = "CTexture";

    private static readonly texIns = {
        mipmaps: types.Boolean("Texture.Mipmaps", true),
        mapping: types.Enum("Texture.Mapping", EMappingMode, EMappingMode.UV),
        encoding: types.Enum("Texture.Encoding", EEncodingType, EEncodingType.Linear),
        wrapS: types.Enum("Wrap.Horizontal", EWrapMode, EWrapMode.Clamp),
        wrapT: types.Enum("Wrap.Vertical", EWrapMode, EWrapMode.Clamp),
        magFilter: types.Enum("Filter.Mag", EFilterMode, EFilterMode.Linear),
        minFilter: types.Enum("Filter.Min", EFilterMode, EFilterMode.Linear),
        mipmapFilter: types.Enum("Filter.Mipmap", EFilterMode, EFilterMode.Linear),
        anisotropy: types.Integer("Filter.Anisotropy", { min: 1, max: 16, preset: 1 }),
        offset: types.Vector2("Transform.Offset"),
        repeat: types.Scale2("Transform.Repeat"),
        center: types.Vector2("Transform.RotationCenter"),
        rotation: types.Number("Transform.Rotation"),
    };

    private static readonly texOuts = {
        self: types.Object("Texture.Component", CTexture),
        isReady: types.Boolean("Texture.IsReady"),
        width: types.Integer("Texture.Width"),
        height: types.Integer("Texture.Height"),
    };

    ins = this.addInputs(CTexture.texIns);
    outs = this.addOutputs(CTexture.texOuts);

    protected _texture: THREE.Texture = undefined;

    get texture() {
        return this._texture;
    }

    create()
    {
        (this._texture as any).matrixAutoUpdate = false;
        this.outs.self.setValue(this);
    }

    update(context)
    {
        const ins = this.ins;
        const texture = this._texture;

        if (ins.mipmaps.changed || ins.encoding.changed || ins.wrapS.changed || ins.wrapT.changed) {
            texture.generateMipmaps = ins.mipmaps.value;
            texture.encoding = _THREE_ENCODING_TYPE[ins.encoding.getValidatedValue()];
            texture.wrapS = _THREE_WRAP_MODE[ins.wrapS.getValidatedValue()];
            texture.wrapT = _THREE_WRAP_MODE[ins.wrapT.getValidatedValue()];
            texture.needsUpdate = true;
        }
        if (ins.mapping.changed) {
            texture.mapping = _THREE_MAPPING_MODE[ins.mapping.getValidatedValue()];
        }
        if (ins.minFilter.changed || ins.magFilter.changed || ins.mipmapFilter.changed) {
            texture.magFilter = _THREE_FILTER_MODE[ins.magFilter.getValidatedValue()];
            const minFilter = ins.minFilter.getValidatedValue();

            if (ins.mipmaps.value) {
                const mipFilter = ins.mipmapFilter.getValidatedValue();
                texture.minFilter = _THREE_MIPMAP_FILTER_MODE[minFilter][mipFilter];
            }
            else {
                texture.minFilter = _THREE_FILTER_MODE[minFilter];
            }
        }
        if (ins.anisotropy.changed) {
            texture.anisotropy = ins.anisotropy.getValidatedValue();
        }
        if (ins.offset.changed || ins.repeat.changed || ins.rotation.changed || ins.center.changed) {
            texture.offset.fromArray(ins.offset.value);
            texture.repeat.fromArray(ins.repeat.value);
            texture.center.fromArray(ins.center.value);
            texture.rotation = ins.rotation.value * THREE.Math.DEG2RAD;
            (texture as any).updateMatrix();
        }

        return true;
    }

    dispose()
    {
        this._texture.dispose();
        this._texture = null;

        super.dispose();
    }
}