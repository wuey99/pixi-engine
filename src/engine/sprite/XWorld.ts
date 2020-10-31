//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from './XSprite';
import { XSpriteLayer } from './XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { XTask } from '../task/XTask';
import { XDepthSprite} from './XDepthSprite';
import { XGameObject } from '../gameobject/XGameObject';
import { XType } from '../type/XType';
import { XObjectPoolManager } from '../pool/XObjectPoolManager';
import * as Matter from 'matter-js';
import { World, Body, Engine } from 'matter-js';
import { Class } from '../type/XType';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class XWorld extends XSprite {
 
    public static MAX_LAYERS:number;
    public m_layers:Array<XSpriteLayer>;
    public m_XApp:XApp;

    public m_hudLayer:XSpriteLayer;
    public m_XSignalManager:XSignalManager;
    private m_killQueue:Map<XGameObject, number>;
    private m_gameObjects:Map<XGameObject, XDepthSprite>;
    private m_childObjects:Map<XGameObject, XDepthSprite>;	
    private m_children:Map<PIXI.DisplayObject, any>;

    private m_matterEngine:Engine;

    public static readonly SPRITE_LAYER:number = 0;
    public static readonly SPRITE_XDEPTHSPRITE:number = 1;

    //------------------------------------------------------------------------------------------
    constructor (__parent:any, __XApp:XApp, __layers:number = 8, __timerInterval:number = 32) {
        super ();

        this.m_XApp = __XApp;

        // TODO (i needed a add background to allow events to be captured.  figure uot if there's a better solution)
        var graphics = new PIXI.Graphics ();
        graphics.beginFill (0x8080ff, 1.0);
        graphics.drawRect (0, 0, G.SCREEN_WIDTH, G.SCREEN_HEIGHT);
        graphics.endFill ();
        this.addChild (graphics);
            
        XWorld.MAX_LAYERS = __layers;

        this.m_layers = new Array<XSpriteLayer> ();

        var i:number;

        for (i = 0; i < XWorld.MAX_LAYERS; i++ ) {
            this.m_layers.push (null);
        }
    
        for (i = 0; i < XWorld.MAX_LAYERS; i++) {
            this.__createLayer (i);
        }
    
        this.m_hudLayer = new XSpriteLayer ();
        this.m_hudLayer.setup ();
        this.m_hudLayer.world = this;
        this.addChild (this.m_hudLayer);

        this.m_killQueue = new Map<XGameObject, number> ();
        
        this.m_gameObjects = new Map<XGameObject, XDepthSprite> ();
        this.m_childObjects = new Map<XGameObject, XDepthSprite> ();
        this.m_children = new Map<PIXI.DisplayObject, any> ();

        this.createMatterEngine ();
    }

	//------------------------------------------------------------------------------------------
     __createLayer (i:number):void {
        this.m_layers[i] = new XSpriteLayer ();
        this.m_layers[i].setup ();
        this.m_layers[i].world = this;
        this.addChild (this.m_layers[i]);
    }
    
	//------------------------------------------------------------------------------------------
	public setup ():void {
        super.setup ();
    }
    
	//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }

    //------------------------------------------------------------------------------------------
    public update ():void {
        var i:number;

        for (i = 0; i < XWorld.MAX_LAYERS; i++) {
            this.m_layers[i].depthSort ();
        }
        
        this.m_hudLayer.depthSort ();
        
        this.emptyKillQueue ();
        
        Matter.Engine.update (this.getMatterEngine ());

        var __gameObject:XGameObject;

        for (__gameObject of this.m_gameObjects.keys ()) {
            __gameObject.setMasterX (__gameObject.x);
            __gameObject.setMasterY (__gameObject.y);
            __gameObject.setMasterAlpha (__gameObject.alpha);
            __gameObject.setMasterDepth (__gameObject.getDepth ());
            __gameObject.setMasterVisible (__gameObject.visible);
            __gameObject.setMasterScaleX (__gameObject.scale.x);
            __gameObject.setMasterScaleY (__gameObject.scale.y);
            __gameObject.setMasterFlipX (__gameObject.getFlipX ());
            __gameObject.setMasterFlipY (__gameObject.getFlipY ());
            __gameObject.setMasterRotation (__gameObject.angle);
                    
            __gameObject.update ();
        }
    }

    //------------------------------------------------------------------------------------------
    public addGameObject (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = XType.createInstance (__class) as XGameObject;
        __gameObject.setup (this, __layer, __depth);
        
        var __depthSprite:XDepthSprite;
        
        __depthSprite = this.m_layers[__layer].addSprite (__gameObject, __depth, __visible);

        this.m_gameObjects.set (__gameObject, __depthSprite);
        
        return __gameObject;
    }			

    //------------------------------------------------------------------------------------------
    public addChildObject (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = XType.createInstance (__class) as XGameObject;
        __gameObject.setup(this, __layer, __depth);
        
        var __depthSprite:XDepthSprite;
        
        __depthSprite = this.m_layers[__layer].addSprite (__gameObject, __depth, __visible);

        this.m_childObjects.set (__gameObject, __depthSprite);
        
        return __gameObject;
    }	

    //------------------------------------------------------------------------------------------
    public removeGameObject (__gameObject:XGameObject):void {	
        if (this.m_gameObjects.has (__gameObject)) {
            var __depthSprite:XDepthSprite = this.m_gameObjects.get (__gameObject);
            
            this.m_layers[__gameObject.getLayer()].removeSprite (__depthSprite);
            
            this.m_gameObjects.delete (__gameObject);
        }
        
        if (this.m_childObjects.has (__gameObject)) {
            var __depthSprite:XDepthSprite = this.m_childObjects.get (__gameObject);
            
            this.m_layers[__gameObject.getLayer()].removeSprite (__depthSprite);
            
            this.m_childObjects.delete (__gameObject);
        }	
    }

    //------------------------------------------------------------------------------------------
    public addSortableChild (__sprite:PIXI.DisplayObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):void {
        var __depthSprite:XDepthSprite;
        
        __depthSprite = this.m_layers[__layer].addSprite (__sprite, __depth, __visible);

        this.m_children.set (__sprite, [__layer, __depthSprite]);
    }

    //------------------------------------------------------------------------------------------
    public  removeSortableChild (__sprite:PIXI.DisplayObject):void {
        if (this.m_children.has (__sprite)) {
            var x:any  = this.m_children.get (__sprite);
            
            this.m_layers[x[XWorld.SPRITE_LAYER]].removeSprite (x[XWorld.SPRITE_XDEPTHSPRITE]);
            
            this.m_children.delete (__sprite);				
        }
    }

    //------------------------------------------------------------------------------------------
    public killLater (__gameObject:XGameObject):void {
        if (!this.m_killQueue.has (__gameObject)) {
            this.m_killQueue.set (__gameObject, 0);
        }
    }

    //------------------------------------------------------------------------------------------
    public emptyKillQueue ():void {	
        var __gameObject:XGameObject;

        for (__gameObject of this.m_killQueue.keys ()) {
            if (!__gameObject.cleanedUp) {
                __gameObject.cleanup ();
            }
                
            this.removeGameObject (__gameObject);
                
            this.m_killQueue.delete (__gameObject);
        }
    }

    //------------------------------------------------------------------------------------------
    public getStage ():PIXI.Container {
        return this.m_XApp.getStage ();
    }

    //------------------------------------------------------------------------------------------
    public createMatterEngine ():void {
        this.m_matterEngine = Matter.Engine.create ();
    }

    //------------------------------------------------------------------------------------------
    public cleanupMatterEngine ():void {
    }

    //------------------------------------------------------------------------------------------
    public getMatterEngine ():Engine {
        return this.m_matterEngine;
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
        return this.m_XApp.getXRectPoolManager ();
    }

    //------------------------------------------------------------------------------------------
    public getXPointPoolManager ():XObjectPoolManager {
        return this.m_XApp.getXPointPoolManager ();
    }

    //------------------------------------------------------------------------------------------
    public getXDepthSpritePoolManager ():XObjectPoolManager {
        return this.m_XApp.getXDepthSpritePoolManager ();
    }

    //------------------------------------------------------------------------------------------
    public getMaxLayers ():number {
        return XWorld.MAX_LAYERS;
    }

    //------------------------------------------------------------------------------------------
    public getLayer (__layer:number):XSpriteLayer {
        return this.m_layers[__layer];
    }

    //------------------------------------------------------------------------------------------
    public getResourceByName (__name:string):any {
        return this.m_XApp.getXProjectManager ().getResourceByName (__name);
    }

//------------------------------------------------------------------------------------------
}