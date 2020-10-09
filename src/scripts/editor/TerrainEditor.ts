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
import { XState } from '../state/XState';
import { TerrainTilePalette } from './TerrainTilePalette';
import { TerrainTileIcon } from './TerrainTileIcon';
import { TerrainTileBrush } from './TerrainTileBrush';
import { G } from '../app/G';
import { XPoint } from '../geom/XPoint';
import { XRect } from '../geom/XRect';
import { TerrainTile } from '../terrain/TerrainTile'
import { TerrainContainer } from '../terrain/TerrainContainer';

//------------------------------------------------------------------------------------------
export class TerrainEditor extends XState {
    public m_currentBrush:TerrainTileBrush;
    public m_terrainContainer:TerrainContainer;

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

        this.m_currentBrush = null;

		this.createObjects ();

        document.addEventListener ('keydown', (key:KeyboardEvent) => {
            // console.log (": keyDown: ", key.code);

            if (key.code == "Space") {
                if (this.m_currentBrush != null) {
                    this.m_currentBrush.nukeLater ();

                    this.m_currentBrush = null;
                }
            }
        });

        this.m_XApp.getStage ().on ("mousedown", (e:PIXI.InteractionEvent) => {
            if (this.m_currentBrush == null) {
                var __x:number = e.data.global.x;
                var __y:number = e.data.global.y;

                var __terrainTile:TerrainTile = this.m_terrainContainer.pickupTerrainTile (__x, __y);
                console.log (": terrainTile: ", __terrainTile);

                if (__terrainTile != null) {
                    this.m_terrainContainer.removeTerrainTile (__terrainTile);
                }
            }
        });

        return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
	public createObjects ():void {
		var __y:number = 16;

		var __terrainTilePalette64:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 0.0) as TerrainTilePalette;
		__terrainTilePalette64.afterSetup ([64, "01"]);
		__terrainTilePalette64.x = 16;
		__terrainTilePalette64.y = __y;
        __terrainTilePalette64.addSelectedListener ((__terrainTileIcon:TerrainTileIcon) => {
            this.createTerrainTileBrush (__terrainTileIcon);
        });
        __y += 64 + 8;

		var __terrainTilePalette32:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 0.0) as TerrainTilePalette;
		__terrainTilePalette32.afterSetup ([32, "01"]);
		__terrainTilePalette32.x = 16;
		__terrainTilePalette32.y = __y;
        __terrainTilePalette32.addSelectedListener ((__terrainTileIcon:TerrainTileIcon) => {
            this.createTerrainTileBrush (__terrainTileIcon);
        });
        __y += 32 + 8;
        
		var __terrainTilePalette16:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 0.0) as TerrainTilePalette;
		__terrainTilePalette16.afterSetup ([16, "01"]);
		__terrainTilePalette16.x = 16;
        __terrainTilePalette16.y = __y;
        __terrainTilePalette16.addSelectedListener ((__terrainTileIcon:TerrainTileIcon) => {
            this.createTerrainTileBrush (__terrainTileIcon);
        });

        this.m_terrainContainer = this.addGameObjectAsChild (TerrainContainer, 0, 0.0) as TerrainContainer;
        this.m_terrainContainer.afterSetup ();
        this.m_terrainContainer.x = 0;
        this.m_terrainContainer.y = 0;
	}

//------------------------------------------------------------------------------------------
    public createTerrainTileBrush (__terrainTileIcon:TerrainTileIcon):void {
        if (this.m_currentBrush == null) {
            var __brush:TerrainTileBrush = this.m_currentBrush = this.addGameObjectAsChild (TerrainTileBrush, 0, 0.0) as TerrainTileBrush;
            __brush.afterSetup ([__terrainTileIcon.getSize (), __terrainTileIcon.getTerrain (), __terrainTileIcon.getFrame ()]);

            this.m_currentBrush.addDroppedListener (() => {
                console.log (": dropped: ");

                var __dx:number = 0; // this.m_currentBrush.getSize () / 2;
                var __dy:number = 0; // this.m_currentBrush.getSize () / 2;

                this.m_terrainContainer.addTerrainTile (
                    this.m_currentBrush.x + __dx, this.m_currentBrush.y + __dy,
                    this.m_currentBrush.getSize (),
                    this.m_currentBrush.getTerrain (),
                    this.m_currentBrush.getFrame ()
                )
            });

            this.m_currentBrush.addKillListener (() => {
                this.m_currentBrush = null;
            });
        }
    }

//------------------------------------------------------------------------------------------
}