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
import * as Matter from 'matter-js';
import { World, Body, Engine } from 'matter-js';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class TerrainPiece extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;
    public x_sprite:XDepthSprite;

    public m_frame:number;

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

        this.x = __params[0];
        this.y = __params[1];
        this.m_frame = __params[2];

        this.createSprites ();

        this.createBody ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createAnimatedSprite ("Terrain64x64_01");
        this.addSortableChild (this.m_sprite, 0, 0.0, true);

        this.m_sprite.gotoAndStop (this.m_frame - 1);

        this.show ();
    }

//------------------------------------------------------------------------------------------
    public getSize ():number {
        return 64;
    }

//------------------------------------------------------------------------------------------
    public setPivot (__dx:number, __dy:number):void {
        this.m_sprite.pivot.x = __dx;
        this.m_sprite.pivot.y = __dy;
    }

//------------------------------------------------------------------------------------------
    public createBody ():void {
        var __shapes:Array<Array<any>> =
        [
            // frame 1, UL45
            [
                {x: 1, y: 0},
                {x: 0, y: 1},
                {x: 1, y: 1},
            ],
            // frame 2, UR45
            [
                {x: 0, y: 0},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
            // frame 3, UL BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 4, UL BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 5, LL45
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
            ],
            // frame 6, LR45
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 0, y: 1}, 
            ],
            // frame 7 LL BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 8 LR BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 9 LF BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 10 RT BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 11 TOP BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 12 BOT BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 13 EMPTY BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 14 UL22.5
            [
                {x: 0, y: 1},
                {x: 1, y: 1},
                {x: 1, y: 0.5},
            ],
            // frame 15 UR22.5
            [
                {x: 0, y: 0.5},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
            // frame 16 UL67.5
            [
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 0.5, y: 1},
            ],
            // frame 17 UR67.5
            [
                {x: 0, y: 0},
                {x: 0.5, y: 1},
                {x: 0, y: 1},
            ],
            // frame 18 LL22.5
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 0.5},
            ],
            // frame 19 LE22.5
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 0, y: 0.5},
            ],
            // frame 20 LL67.5
            [
                {x: 0.5, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1},
            ],
            // frame 21 LR67.5
            [
                {x: 0, y: 0},
                {x: 0.5, y: 0},
                {x: 0, y: 1},
            ],
        ];
        
        var __vertices:Array<any> = __shapes[this.m_frame - 1];

        var __vertex:any;

        for (__vertex of __vertices) {
            __vertex.x *= this.getSize ();
            __vertex.y *= this.getSize ();
        }

        this.attachMatterBodyVertices (
            Matter.Bodies.fromVertices (this.x, this.y, __vertices, { isStatic: false, angle: 0 }),
            __vertices,
            true
        );
    }

//------------------------------------------------------------------------------------------
}