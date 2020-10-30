//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XType } from '../type/XType';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XSignal } from '../signals/XSignal';
import { XSignalManager} from '../signals/XSignalManager';
import { XSprite } from '../sprite/XSprite';
import { XObjectPoolManager } from '../pool/XObjectPoolManager';
import { XClassPoolManager } from '../pool/XClassPoolManager';
import { XDepthSprite } from '../sprite/XDepthSprite';
import { XGameInstance } from '../state/XGameInstance';
import { XGameObject } from '../gameobject/XGameObject';
import { XProjectManager } from '../resource/XProjectManager';
import { XPoint } from '../geom/XPoint';
import { XRect } from '../geom/XRect';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export interface XAppParams {
    containerId: string,
    canvasW: number,
    canvasH: number,
    fpsMax: number
}

//------------------------------------------------------------------------------------------
export class XApp {
  
    public container: HTMLElement;
    public loader: PIXI.Loader;
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public graphics: PIXI.Graphics;
    public fpsMax: number;

	private m_XTaskManager:XTaskManager;
    private m_XSignalManager:XSignalManager;
    
	private m_XClassPoolManager:XClassPoolManager;
	
	// private m_XTextureManager:XTextureManager;
	// private m_XSubTextureManager:XSubTextureManager;
    private m_XSignalPoolManager:XObjectPoolManager;
    private m_XRectPoolManager:XObjectPoolManager;
    private m_XPointPoolManager:XObjectPoolManager;
	private m_XTilemapPoolManager:XObjectPoolManager;
	private m_TilePoolManager:XObjectPoolManager;
	private m_XDepthSpritePoolManager:XObjectPoolManager;
	// private m_XBitmapDataAnimManager:XBitmapDataAnimManager;
    private m_XBitmapPoolManager:XObjectPoolManager;
    private m_XProjectManager:XProjectManager;

    private m_frameRateScale:number;
	private m_currentTimer:number;
    private m_previousTimer:number;
    private m_inuse_TIMER_FRAME:number;

    private m_mousePoint:XPoint;

    private m_canvasWidth:number;
    private m_canvasHeight:number;
    private m_screenWidth:number;
    private m_screenHeight:number;
    private m_scaleXRatio:number;
    private m_scaleYRatio:number;

    private m_scaleRatio:number;
    private m_xoffset:number;
    private m_yoffset:number;

    //------------------------------------------------------------------------------------------
    constructor (params: XAppParams, __container:HTMLElement = null) {
        this.loader = PIXI.Loader.shared;
        this.renderer = PIXI.autoDetectRenderer ({
            width: params.canvasW,
            height: params.canvasH,
            antialias: true
        });
        this.stage = new PIXI.Container ();
        this.graphics = new PIXI.Graphics ();
        this.fpsMax = params.fpsMax;

        this.stage.interactive = true;
        this.stage.interactiveChildren = true;

        if (__container != null) {
            this.container = __container;
        } else {
            this.container = params.containerId ? document.getElementById(params.containerId) || document.body : document.body;
        }
        this.container.appendChild (this.renderer.view)

        this.setupSize (params.canvasW, params.canvasH, G.SCREEN_WIDTH, G.SCREEN_HEIGHT);
        this.fitScreenToCanvas ();
        this.stage.scale.x = this.getScaleRatio ();
        this.stage.scale.y = this.getScaleRatio ();

        console.log (": scaleRatio: ", this.getScaleRatio (), this.getXOffset (), this.getYOffset ());

		XGameObject.setXApp(this);
		XTask.setXApp (this);
		// TODO XTilemap.setXApp (this);
		XSprite.setXApp (this);
		// TODO XTextureManager.setXApp (this);
		// TODO XTileSubTextureManager.setXApp (this);
        // TODO XSubTextureManager.setXApp (this);
        XGameInstance.setXApp (this);

        this.__initPoolManagers (this.getDefaultPoolSettings ());

		this.m_XTaskManager = new XTaskManager (this);	
        this.m_XSignalManager = new XSignalManager (this);
        this.m_XProjectManager = new XProjectManager (this);

        this.m_frameRateScale = 1.0;
		this.m_previousTimer = XType.getNowDate ().getTime ();
        this.m_currentTimer = 0.0;
        this.m_inuse_TIMER_FRAME = 0;
        
        this.m_mousePoint = new XPoint ();

        this.getStage ().on ("mousemove", (e:PIXI.InteractionEvent) => {
            var __mousePos:PIXI.Point = e.data.getLocalPosition (this.getStage ());

            this.m_mousePoint.x = __mousePos.x;
            this.m_mousePoint.y = __mousePos.y;
        })
    }

   //------------------------------------------------------------------------------------------
    public getMaximalPoolSettings ():any {
        return {
            XSignal: {init: 10000, overflow: 1000},
            XTilemap: {init: 4000, overflow: 1000},
            XBitmap: {init: 4000, overflow: 1000},
            Tile: {init: 4000, overflow: 1000},
            XDepthSprite: {init: 4000, overflow: 1000},
        };
    }

//------------------------------------------------------------------------------------------
    public getDefaultPoolSettings ():any {
        return {
            XSignal: {init: 2000, overflow: 1000},
            XRect: {init: 25000, overflow: 1000},				
            XPoint: {init: 25000, overflow: 1000},
            XTilemap: {init: 4000, overflow: 1000},
            XBitmap: {init: 4000, overflow: 1000},
            Tile: {init: 4000, overflow: 1000},
            XDepthSprite: {init: 2000, overflow: 1000},
        };
    }

//------------------------------------------------------------------------------------------
    private __initPoolManagers (__poolSettings:any):void {

//------------------------------------------------------------------------------------------
// XSignals
//------------------------------------------------------------------------------------------
        this.m_XSignalPoolManager = new XObjectPoolManager (
            ():any => {
                return new XSignal ();
            },
            
            (__src:any, __dst:any):any => {
                return null;
            },
            
            __poolSettings.XSignal.init, __poolSettings.XSignal.overflow
        );
        
//------------------------------------------------------------------------------------------
// XRect
//------------------------------------------------------------------------------------------
        this.m_XRectPoolManager = new XObjectPoolManager (
            ():any => {
                return new XRect ();
            },
            
            (__src:any, __dst:any):any => {
                var __rect1:XRect = __src as XRect;
                var __rect2:XRect = __dst as XRect;
                
                __rect2.x = __rect1.x;
                __rect2.y = __rect1.y;
                __rect2.width = __rect1.width;
                __rect2.height = __rect1.height;
                
                return __rect2;
            },
            
            __poolSettings.XRect.init, __poolSettings.XRect.overflow
        );

//------------------------------------------------------------------------------------------
// XPoint
//------------------------------------------------------------------------------------------
        this.m_XPointPoolManager = new XObjectPoolManager (
            ():any => {
                return new XPoint ();
            },
            
            (__src:any, __dst:any):any => {
                var __point1:XPoint = __src as XPoint;
                var __point2:XPoint = __dst as XPoint;
                
                __point2.x = __point1.x;
                __point2.y = __point1.y;

                return __point2;
            },
            
            __poolSettings.XPoint.init, __poolSettings.XPoint.overflow
        );

//------------------------------------------------------------------------------------------
// XTilemap
//------------------------------------------------------------------------------------------
    /* TODO
    m_XTilemapPoolManager = new XObjectPoolManager (
        function ():Dynamic {
            var __bitmap:XTilemap = new XTilemap ();
            
            return __bitmap;
        },
        
        function (__src:Dynamic, __dst:Dynamic):Dynamic {
            return null;
        },
        
        __poolSettings.XTilemap.init, __poolSettings.XTilemap.overflow
    );
    */
//------------------------------------------------------------------------------------------
// XBitmap
//------------------------------------------------------------------------------------------
    /* TODO
    m_XBitmapPoolManager = new XObjectPoolManager (
        function ():Dynamic {
            var __bitmap:XBitmap = new XBitmap ();

            return __bitmap;
        },
        
        function (__src:Dynamic, __dst:Dynamic):Dynamic {
            return null;
        },
        
        __poolSettings.XBitmap.init, __poolSettings.XBitmap.overflow
    );
    */

//------------------------------------------------------------------------------------------
// Tile
//------------------------------------------------------------------------------------------
    /* TODO
    m_TilePoolManager = new XObjectPoolManager (
        function ():Dynamic{
            var __tile:Tile = new Tile (0, 0, 0, 1.0, 1.0, 0.0);
            
            return __tile;
        },
        
        function (__src:Dynamic, __dst:Dynamic):Dynamic {
            return null;
        },
        
        __poolSettings.Tile.init, __poolSettings.Tile.overflow
    );
    */

//------------------------------------------------------------------------------------------
// XDepthSprite
//------------------------------------------------------------------------------------------
        this.m_XDepthSpritePoolManager = new XObjectPoolManager (
            ():any => {
                var __sprite:XDepthSprite = new XDepthSprite ();
                
                __sprite.clear ();
                
                return __sprite;
            },
            
            (__src:any, __dst:any):any => {
                return null;
            },
            
            __poolSettings.XDepthSprite.init, __poolSettings.XDepthSprite.overflow
        );
    }

//------------------------------------------------------------------------------------------
	public update ():void {
		if (this.m_inuse_TIMER_FRAME > 0) {
			console.log (": overflow: TIMER_FRAME: ");
				
			return;
		}
        
		this.m_inuse_TIMER_FRAME++;
		
		var __deltaTime:number = XType.getNowDate ().getTime () - this.m_previousTimer;
		
        {
            console.log (": XApp: update: ");

			this.getXTaskManager ().updateTasks ();
			
			this.m_currentTimer += __deltaTime;
		}
		
		this.m_previousTimer = XType.getNowDate ().getTime ();
		
		this.m_inuse_TIMER_FRAME--;
    }


    //------------------------------------------------------------------------------------------
    public setupSize (__canvasWidth:number, __canvasHeight:number, __screenWidth:number, __screenHeight:number):void {
        this.m_canvasWidth = __canvasWidth;
        this.m_canvasHeight = __canvasHeight;

        this.m_screenWidth = __screenWidth;
        this.m_screenHeight = __screenHeight;

        this.m_scaleXRatio = this.m_screenWidth / this.m_canvasWidth;
        this.m_scaleYRatio = this.m_screenHeight / this.m_canvasHeight;
    }

        
    //------------------------------------------------------------------------------------------
    public getCanvasWidth ():number {
        return this.m_canvasWidth;
    }

    //------------------------------------------------------------------------------------------
    public getCanvasHeight ():number {
        return this.m_canvasHeight;
    }

    //------------------------------------------------------------------------------------------
    public getScreenWidth ():number {
        return this.m_screenWidth;
    }

    //------------------------------------------------------------------------------------------
    public getScreenHeight ():number {
        return this.m_screenHeight;
    }

    //------------------------------------------------------------------------------------------
	public fitScreenToCanvas ():void {
		var __scaleX:number = this.getCanvasWidth () / this.getScreenWidth ();
		var __scaleY:number = this.getCanvasHeight () / this.getScreenHeight ();
			
		this.m_scaleRatio = Math.min (__scaleX, __scaleY);
			
		this.m_xoffset = (this.getCanvasWidth () - this.getScreenWidth () * this.m_scaleRatio) / 2;
		this.m_yoffset = (this.getCanvasHeight () - this.getScreenHeight () * this.m_scaleRatio) / 2;
	}
		
    //------------------------------------------------------------------------------------------
	public getXOffset ():number {
		return this.m_xoffset;
	}
		
    //------------------------------------------------------------------------------------------
	public getYOffset ():number {
		return this.m_yoffset;
	}
		
    //------------------------------------------------------------------------------------------
	public getScaleRatio ():number {
		return this.m_scaleRatio;
	}

    //------------------------------------------------------------------------------------------
    public getRenderer ():PIXI.Renderer {
        return this.renderer;
    }

    //------------------------------------------------------------------------------------------
    public getStage ():PIXI.Container {
        return this.stage;
    }

    //------------------------------------------------------------------------------------------
    public getMousePos ():XPoint {
        return this.m_mousePoint;
    }

    //------------------------------------------------------------------------------------------
    public getFrameRateScale ():number {
        return this.m_frameRateScale;
    }

    //------------------------------------------------------------------------------------------
	public getTime ():number {
		return this.m_currentTimer;
    }

    //------------------------------------------------------------------------------------------
    public getXTaskManager ():XTaskManager {
        return this.m_XTaskManager;
    }

    //------------------------------------------------------------------------------------------
    public createXSignal ():XSignal {
        return this.m_XSignalManager.createXSignal ();
    }
        
    //------------------------------------------------------------------------------------------
    public getXSignalManager ():XSignalManager {
        return this.m_XSignalManager;
    }

    //------------------------------------------------------------------------------------------
    public getXRectPoolManager ():XObjectPoolManager {
        return this.m_XRectPoolManager;
    }

    //------------------------------------------------------------------------------------------
    public getXPointPoolManager ():XObjectPoolManager {
        return this.m_XPointPoolManager;
    }

    //------------------------------------------------------------------------------------------
    public getXDepthSpritePoolManager ():XObjectPoolManager {
        return this.m_XDepthSpritePoolManager;
    }

    //------------------------------------------------------------------------------------------
    public getXProjectManager ():XProjectManager {
        return this.m_XProjectManager;
    }

    //------------------------------------------------------------------------------------------
    public getResourceByName (__name:string):any {
        return this.m_XProjectManager.getResourceByName (__name);
    }

//------------------------------------------------------------------------------------------
}