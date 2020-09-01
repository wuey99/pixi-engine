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
import { XType } from '../type/XType';
import { GameObject} from '../gameobject/GameObject';
import { XGameInstance } from './XGameInstance';

//------------------------------------------------------------------------------------------
export class XState extends GameObject {
    
    public m_gameInstance:XGameInstance;

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):GameObject {
        super.setup (__world, __layer, __depth);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):GameObject {
        super.afterSetup (__params);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public getGameInstance ():XGameInstance {
		return this.m_gameInstance;
	}
		
//------------------------------------------------------------------------------------------
	public setGameInstance (__gameInstance:XGameInstance):GameObject {
		this.m_gameInstance = __gameInstance;
			
		return this;
    }
        
//------------------------------------------------------------------------------------------
}