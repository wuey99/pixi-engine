//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XDepthSprite} from '../../engine/sprite/XDepthSprite';
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';

//------------------------------------------------------------------------------------------
export class TerrainTileIcon extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;
    public x_sprite:XDepthSprite;
	
	public m_name:string;
	public m_size:number;
	public m_world:string;
	public m_frame:number;

	public static MAX_ICONS:number = 27;

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

		this.m_name = __params[0] as string;
		this.m_size = __params[1] as number;
		this.m_world = __params[2] as string;
		this.m_frame = __params[3] as number;

		this.createSprites ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}

//------------------------------------------------------------------------------------------
	public getName ():string {
		return this.m_name;
	}

//------------------------------------------------------------------------------------------
    public getSize ():number {
        return this.m_size;
    }

//------------------------------------------------------------------------------------------
    public getWorld ():string {
        return this.m_world;
    }

//------------------------------------------------------------------------------------------
    public getFrame ():number {
        return this.m_frame;
    }

//------------------------------------------------------------------------------------------
    public createSprites ():void {
        console.log (": TerrainTile: ", this.m_world + "_" + this.m_name + this.m_size + "x" + this.m_size);

		this.m_sprite = this.createAnimatedSprite (this.m_world + "_" + this.m_name + this.m_size + "x" + this.m_size);
		this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), true);
		this.m_sprite.gotoAndStop (this.m_frame);

		this.m_sprite.interactive = true;
		this.m_sprite.interactiveChildren = true;

        this.m_sprite.on ("mousedown", (e:PIXI.InteractionEvent) => {
            var __interactionData:PIXI.InteractionData = e.data;

            var __point:PIXI.Point = new PIXI.Point ();

	        this.fireMouseDownSignal (e);
		});

        this.show ();
    }

//------------------------------------------------------------------------------------------
}