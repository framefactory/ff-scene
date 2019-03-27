/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import CTexture, { Node, types } from "./CTexture";

////////////////////////////////////////////////////////////////////////////////

export default class CImageTexture extends CTexture
{
    static readonly typeName: string = "CImageTexture";

    private static readonly ins = {
        imagePath: types.String("Image.Path"),
    };

    ins = this.addInputs<CTexture, typeof CImageTexture.ins>(CImageTexture.ins, 0);

    constructor(node: Node, id: string)
    {
        super(node, id);
        this._texture = new THREE.Texture();
    }

    update(context)
    {
        super.update(context);

        const texture = this._texture;
        const ins = this.ins;
        const outs = this.outs;

        if (ins.imagePath.changed) {
            const path = ins.imagePath.value;

            if (path) {
                new THREE.ImageLoader().load(path, image => {
                    texture.image = image;
                    texture.needsUpdate = true;
                    outs.width.setValue(image.width);
                    outs.height.setValue(image.height);
                    outs.isReady.setValue(true);
                    outs.self.set();
                }, undefined, () => {
                    texture.dispose();
                    texture.image = THREE.Texture.DEFAULT_IMAGE;
                    outs.width.setValue(texture.image ? texture.image.width : 0);
                    outs.height.setValue(texture.image ? texture.image.height : 0);
                    outs.isReady.setValue(!!texture.image);
                    outs.self.set();
                });
            }
            else {
                texture.dispose();
                texture.image = THREE.Texture.DEFAULT_IMAGE;
                outs.width.setValue(texture.image ? texture.image.width : 0);
                outs.height.setValue(texture.image ? texture.image.height : 0);
                outs.isReady.setValue(!!texture.image);
                outs.self.set();
            }
        }

        return true;
    }
}