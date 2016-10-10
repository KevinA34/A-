# A-
寻路算法

/**
 *
 * @author 
 *
 */
'use strict';
module foxgame{
    export class AstarPathStep{
        m_tilePos: egret.Point;
        m_gScore: number = 0;
        m_hScore: number = 0;
        m_parent: AstarPathStep;
        m_inOpen = false;
        m_inClose = false;
        
        public constructor(tilePos: egret.Point) {
            this.m_tilePos = tilePos;
            this.m_parent = null;
        }

        /**
         * 返回这个点的f评分
         * */
        public fScore(): number {
            return this.m_gScore + this.m_hScore;
        }

        /**
         * 是同一个AstarPathStep
         * */
        public isEqual(setp: AstarPathStep): boolean {
            if(this.m_tilePos.x == setp.m_tilePos.x && this.m_tilePos.y == setp.m_tilePos.y) {
                return true;
            }
            return false;
        }

        /**
         * 是同一个点
         * */
        public isEqualByPos(pos: egret.Point): boolean {
            if(this.m_tilePos.x == pos.x && this.m_tilePos.y == pos.y) {
                return true;
            }
            return false;
        }

        /**
         * 设置为开放节点
         * */
        public setInOpen(flag) {
            this.m_inOpen = flag;
        }

        /**
         * 设置为关闭节点
         * */
        public setInClose(flag) {
            this.m_inClose = flag;
        }
    }
    
    export class Astar {
        
        private static _instance: Astar;

        static get instance(): Astar {
            if(!this._instance) {
                this._instance = new Astar();
            }
            return this._instance;
        }

        /**
         * 开放节点列表
         * */
        m_openList: Array<AstarPathStep>/* = new Array<AstarPathStep>()*/;

        /**
         * 关闭节点列表
         * */
        m_closeList: foxgame.HashMap = new foxgame.HashMap();

        /**
         * 横向移动一格的评分
         * */
        public static COST_HORIZONTAL = 20;

        /**
         * 竖向移动一格的路劲评分
         * */
        public static COST_VERTICAL = 10;

        /**
         * 斜向移动一格的路劲评分
         * */
        public static COST_DIAGONAL = 12;
        
        public constructor() {

        }
        
        /**
     * 地图类对象
     * */
        public tileMap: foxgame.TiledMap;
        
        /**
    	  * 寻路
    	  * */
        public findPath(startPos: egret.Point,endPos: egret.Point,tileMap: foxgame.TiledMap) {
            
            this.tileMap = tileMap;//地图
            
            var isFind = false;

            var starTime = egret.getTimer();//开始寻路的时间

            if(egret.Point.distance(startPos,endPos) < 0.5) {
                if(Global.logLevel > Global.logLevelInfo) {
                    console.log("You're already there! :P");
                }
                return null;
            }

            if(tileMap.isPass(endPos.x,endPos.y) != true) {
                if(Global.logLevel > Global.logLevelInfo) {
                    console.log("blocf or beyond the range");
                }
                return null;
            }
            
            if (!this.m_openList)
                this.m_openList = new Array<AstarPathStep>();

            this.m_closeList.clear();

            var endStep = new AstarPathStep(endPos);
            var startStep = new AstarPathStep(startPos);
            
            startStep.m_hScore = this.getHValue(startStep,endStep);
            this.insertAndSort(startStep);

            var curStep: AstarPathStep;
            do { 
                var elapesTime = egret.getTimer() - starTime;
//                if(elapesTime > 600) {
//                    isFind = false;
//                    //寻路超时
//                    break;
//                }
                curStep = this.m_openList.shift();
                curStep.setInClose(true);
                curStep.setInOpen(false);
                this.m_closeList.put(curStep.m_tilePos.x + "_" + curStep.m_tilePos.y,true);

                if(curStep.isEqualByPos(endPos)) {
                    isFind = true;
                    break;
                }

                var arundNodes = this.getAroundsNode(curStep.m_tilePos);
                for(var i = 0;i < arundNodes.length;i++) {
                    var onePos = arundNodes[i];
                    var nextStep = new AstarPathStep(onePos);
                    var gValue = this.getGValue(curStep,nextStep);
                    var hValue = this.getHValue(endStep,nextStep);

                    if(nextStep.m_inOpen == true) {
                        if(gValue < nextStep.m_gScore) {
                            nextStep.m_gScore = gValue;
                            nextStep.m_hScore = hValue;
                            nextStep.m_parent = curStep;
                            this.findAndSort(nextStep);
                        }
                    } else {
                        nextStep.m_gScore = gValue;
                        nextStep.m_hScore = hValue;
                        nextStep.m_parent = curStep;
                        this.insertAndSort(nextStep);
                    }
                }
                
            } while(this.m_openList.length > 0);

            if(isFind) {
                var path = this.createPath(curStep);
                //this.m_openList = new Array<AstarPathStep>();
                this.m_openList.length = 0;
                this.m_closeList.clear();
                return path;
            } else {
                //this.m_openList = new Array<AstarPathStep>();
                this.m_openList.length = 0;
                this.m_closeList.clear();
                return null;
            }
        }

        public createPath(step: AstarPathStep) {
            var path: Array<egret.Point> = new Array<egret.Point>();
            do{
                if(step.m_parent != null){
                    var curPos: egret.Point = step.m_tilePos;
                    path.unshift(curPos);
                }
                step = step.m_parent;
            } while(step != null) 
            return path;
        }

        //
        private findAndSort(step: AstarPathStep) {
            var openCount = this.m_openList.length;
            if(openCount < 1) {
                return
            }

            var stepFScore = step.fScore();
            for(var i = 0;i < openCount;i++) {
                var oneStep = this.m_openList[i];
                if(step.isEqual(oneStep) == false) {
                    if(stepFScore <= oneStep.fScore()) {
                        this.m_openList.splice(i,0,step);
                    }
                    if(step.isEqual(oneStep)) {
                        this.m_openList.splice(i,1);
                    }
                }
            }
        }

        /**
         * 获取G值
         * */
        public getGValue(curStep: AstarPathStep,nextStep: AstarPathStep): number {
            var extaScore = 0;
            var curPos = curStep.m_tilePos;
            var nextPos = nextStep.m_tilePos;

            var G = 0;
            if(curPos.y == nextPos.y) {//横向移动
                G = curStep.m_gScore + Astar.COST_HORIZONTAL;
            } else if(((curPos.y + 2) == nextPos.y) || ((curPos.y - 2) == nextPos.y)) {
                G = curStep.m_gScore + Astar.COST_VERTICAL * 2;
            } else {
                G = curStep.m_gScore + Astar.COST_DIAGONAL;
            }

            return G;
        }


        /**
         * 获取周围的节点
         * */
        public getAroundsNode(tpt: egret.Point): Array<egret.Point> {
            var aroundNodes: Array<egret.Point> = new Array();
            var p: egret.Point = new egret.Point();
            //左下
            p = new egret.Point(tpt.x - 1 + tpt.y % 2,tpt.y + 1);
            if(this.isWalkable(p) && this.isInClosed(p) == false) {
                aroundNodes.push(p);
            }
            p = new egret.Point(tpt.x + tpt.y % 2,tpt.y - 1);
            //右上
            if(this.isWalkable(p) && this.isInClosed(p) == false) {
                aroundNodes.push(p);
            }

            var p: egret.Point = new egret.Point();
            //下
            p.x = tpt.x
            p.y = tpt.y + 2;
            if(this.isWalkable(p) && this.isInClosed(p) == false) {
                aroundNodes.push(p);
            }
            //左
            p = new egret.Point(tpt.x - 1,tpt.y);
            if(this.isWalkable(p) && this.isInClosed(p) == false) {
                aroundNodes.push(p);
            }
            //右
            p = new egret.Point(tpt.x + 1,tpt.y);
            if(this.isWalkable(p) && this.isInClosed(p) == false) {
                aroundNodes.push(p);
            }
            //上
            p = new egret.Point(tpt.x,tpt.y - 2);
            if(this.isWalkable(p) && this.isInClosed(p) == false) {
                aroundNodes.push(p);
            }
            p = new egret.Point(tpt.x - 1 + (tpt.y % 2),tpt.y - 1);
            //左上
            if(this.isWalkable(p) && this.isInClosed(p) == false) {
                aroundNodes.push(p);
            }
            //右下
            p = new egret.Point(tpt.x + (tpt.y % 2),tpt.y + 1);
            if(this.isWalkable(p) && this.isInClosed(p) == false) {
                aroundNodes.push(p);
            }
            return aroundNodes;
        }

        public isInClosed(tpt: egret.Point): boolean {
            //if(AStarPathFinder.instance.m_closeList.keys.length > 0){
            if(this.m_closeList.get(tpt.x + "_" + tpt.y)) {
                return true;
            } else {
                return false;
            }
            //        }else{
            //            return false;
            //        }
        }

        public isWalkable(tpt: egret.Point): boolean {
            if(this.tileMap.isPass(tpt.x,tpt.y)) {
                return true;
            }
            return false;
        }

        /**
         * 获取H值
         * */
        public getHValue(endStep: AstarPathStep,nextStep: AstarPathStep): number {
            var to0 = nextStep.m_tilePos.x * Astar.COST_HORIZONTAL + (Math.floor(nextStep.m_tilePos.y) % 2) * Astar.COST_HORIZONTAL / 2;
            var endTo0 = endStep.m_tilePos.x * Astar.COST_HORIZONTAL + (Math.floor(endStep.m_tilePos.y) % 2) * Astar.COST_HORIZONTAL / 2;
            return Math.abs(endTo0 - to0) + Math.abs(endStep.m_tilePos.y - nextStep.m_tilePos.y) * Astar.COST_VERTICAL;
        }

        /**
         * 插入
         * */
        private insertAndSort(step: AstarPathStep) {
            step.setInOpen(true);
            var stepFScore = step.fScore();
            var openCount = this.m_openList.length;
            if(openCount == 0) {
                this.m_openList.push(step);
            } else {
                for(var i = 0;i < openCount;i++) {
                    var oneStep = this.m_openList[i];
                    if(stepFScore <= oneStep.fScore()) {
                        this.m_openList.splice(i,0,step);
                        return
                    }
                }
            }
        }

        /**
         * 返回移动方向
         * */
        
        public judgeNextDirection(curPos,nextPos): number {
            var p = new egret.Point(curPos.x - 1,curPos.y);
            if(egret.Point.distance(p,nextPos) < 0.1) {
                return EnumManager.DIRECTION_ENUM.DIR_LEFT;
            }
            var p = new egret.Point(curPos.x,curPos.y - 2);
            if(egret.Point.distance(p,nextPos) < 0.1) {
                return EnumManager.DIRECTION_ENUM.DIR_UP;
            }
            var p = new egret.Point(curPos.x + 1,curPos.y);
            if(egret.Point.distance(p,nextPos) < 0.1) {
                return EnumManager.DIRECTION_ENUM.DIR_RIGHT;
            }
            var p = new egret.Point(curPos.x,curPos.y + 2);
            if(egret.Point.distance(p,nextPos) < 0.1) {
                return EnumManager.DIRECTION_ENUM.DIR_DOWN;
            }
            var p = new egret.Point(curPos.x - 1 + curPos.y % 2,curPos.y - 1);
            if(egret.Point.distance(p,nextPos) < 0.1) {
                return EnumManager.DIRECTION_ENUM.DIR_UP_LEFT;
            }
            var p = new egret.Point(curPos.x + curPos.y%2,curPos.y - 1);
            if(egret.Point.distance(p,nextPos) < 0.1) {
                return EnumManager.DIRECTION_ENUM.DIR_UP_RIGHT;
            }
            var p = new egret.Point(curPos.x + curPos.y%2,curPos.y + 1);
            if(egret.Point.distance(p,nextPos) < 0.1) {
                return EnumManager.DIRECTION_ENUM.DIR_DOWN_RIGHT;
            }
            var p = new egret.Point(curPos.x - 1 + curPos.y%2,curPos.y+1);
            if(egret.Point.distance(p,nextPos) < 0.1) {
                return EnumManager.DIRECTION_ENUM.DIR_DOWN_LEFT;
            }
            console.log("方向解析失败");
            
            //方向解析失败后直接使用角度进行方向解析
            var angleSpeed: number = Math.atan2(curPos.y - nextPos.y,curPos.x - nextPos.x);
            var N = angleSpeed * 180 / Math.PI;
            if(N <= 20 && N >= -20) {
                return EnumManager.DIRECTION_ENUM.DIR_LEFT;
            } else if(N <= 110 && N >= 70) {
                return EnumManager.DIRECTION_ENUM.DIR_UP;
            } else if(N <= -170 || N >= 170) {
                return EnumManager.DIRECTION_ENUM.DIR_RIGHT;
            } else if(N <= -70 && N >= -110) {
                return EnumManager.DIRECTION_ENUM.DIR_DOWN;
            } else if(N < 70 && N > 20) {
                return EnumManager.DIRECTION_ENUM.DIR_UP_LEFT;
            } else if(N < 170 && N > 110) {
                return EnumManager.DIRECTION_ENUM.DIR_UP_RIGHT;
            } else if(N < -110 && N > -170) {
                return EnumManager.DIRECTION_ENUM.DIR_DOWN_RIGHT;
            } else if(N < -20 && N > -70) {
                return EnumManager.DIRECTION_ENUM.DIR_DOWN_LEFT;
            }
            return EnumManager.DIRECTION_ENUM.DIR_DOWN;
        }
        
    }
}

