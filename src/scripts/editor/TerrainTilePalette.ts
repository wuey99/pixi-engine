//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XType } from '../type/Xtype';
import { XGameObject} from '../gameobject/XGameObject';
import { TerrainTileIcon } from './TerrainTileIcon';

//------------------------------------------------------------------------------------------
export class TerrainTilePalette extends XGameObject {

	public m_size:number;
	public m_terrain:string;

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);

		this.m_size = __params[0];
		this.m_terrain = __params[1];

		var i:number;

		for (i = 0; i < TerrainTileIcon.MAX_ICONS; i++) {
			var __terrainTile:TerrainTileIcon = this.addGameObjectAsChild (TerrainTileIcon) as TerrainTileIcon;
			__terrainTile.afterSetup (["" + this.m_size, this.m_terrain, i]);
			__terrainTile.x = i * (this.m_size + 8);
			__terrainTile.y = 0;
		}

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}