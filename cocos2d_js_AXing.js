var layer = new cc.LayerColor(cc.color(0, 0, 0, 127), cc.winSize.width, cc.winSize.height);  
// var layer = new cc.LayerColor(cc.color(0, 0, 0, 127), cc.winSize.width, cc.winSize.height);  
this.addChild(layer);  
var label1 = new cc.LabelTTF('hello world', "Arial", 38);  
label1.setPosition(cc.winSize.width/2, cc.winSize.height/2);  
label1.setColor(cc.color(0,200,200));  
label1.setString("winSize.width, cc.winSize.height =  " + cc.winSize.width + "  " + cc.winSize.height);  
this.addChild(label1);  
  
var MapAtr = [  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],//5  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[1],[1],[1],[1],[1],[1],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],//10  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
    [[0],[0],[0],[0],[0],[0],[0],[0],[0]],  
];  
var MapNode = [];  
var openList = [];  
var closeList = [];  
var resultList = [];  
  
var index = 0;  
for(var i=0; i<16; i++){  
    for(var j=0; j<9; j++){  
        var length = MapNode.length;  
        var _layer = new cc.LayerColor(cc.color(255/25*i, 255/25*j, 255/25*(i+j)/2), cc.winSize.width/16, cc.winSize.height/9);  
        _layer.setPosition(i*cc.winSize.width/16, cc.winSize.height/9*j);  
        _layer.setName('layer' + (i*100 + j));  
        if(MapAtr[i][j][0]){  
            _layer.setColor(cc.color(0,0,0));  
        }  
        var userData = {};  
        userData.i=i;  
        userData.j = j;  
        userData.from=false;  
        userData.end=false;  
        userData.F = 0;  
        userData.G = 0;  
        userData.label = '';  
        userData.color = cc.color(255/25*i, 255/25*j, 255/25*(i+j)/2);  
        userData.arrived = false;  
        _layer.setUserData(userData);  
        this.addChild(_layer);  
        var _label = new cc.LabelTTF('', "Arial", 20);  
        _layer.addChild(_label);  
        _label.setName('stringLabel');  
        // _label.setString(index++);  
        _label.setTag(i+100+j);  
        _label.setPosition(cc.winSize.width/16/2, cc.winSize.height/9/2);  
        // _label.setString((i*100+j).toString());  
        MapNode[length] = _layer;  
    }  
}  
  
var StartNode = null;  
var EndNode = null;  
var chupaiListener = cc.EventListener.create({  
    event: cc.EventListener.TOUCH_ONE_BY_ONE,  
    swallowTouches: true,  
    onTouchBegan: function (touch, event) {  
        if(!StartNode){  
            for(var i=0; i<MapNode.length; i++){  
                if(TouchUtils.isTouchMe(MapNode[i], touch, event, null)){  
                    var userData = MapNode[i].getUserData();  
                    userData.label = "Start";  
                    userData.from = true;  
                    userData.G = 0;  
                    userData.F = 0;  
                    userData.H = 0;  
                    StartNode = MapNode[i];  
                    StartNode.getChildByName('stringLabel').setString('Start');  
                    break;  
                }  
            }  
        } else if(!EndNode) {  
            for(var i=0; i<MapNode.length; i++){  
                if(MapNode[i] == StartNode){  
                    continue;  
                }  
                if(TouchUtils.isTouchMe(MapNode[i], touch, event, null)){  
                    var userData = MapNode[i].getUserData();  
                    EndNode = MapNode[i];  
                    userData.label = "End";  
                    userData.end = true;  
                    EndNode.getChildByName('stringLabel').setString('End');  
                    break;  
                }  
            }  
        } else if(!that.hasCalc){  
            that.hasCalc = true;  
            // 计算  
            var paseList = astart(StartNode, EndNode);  
            if(paseList){  
                findPath(EndNode);  
                if(resultList.length){  
                    console.log('======resultList.length' + resultList.length);  
                    for(var i=0; i<resultList.length; i++){  
                        var __node = resultList[i];  
                        __node.setColor(cc.color(255, 255, 255));  
                    }  
                }  
            }  
        } else {  
            that.hasCalc = false;  
            clearSelectNode();  
        }  
  
        return false;  
    },  
    onTouchMoving: function (touch, event) {  
  
    },  
    onTouchEnd: function (touch, event) {  
  
    },  
});  
that.chupaiListener = chupaiListener;  
cc.eventManager.addListener(chupaiListener, layer);  
  
var inCloseList = function(curNode){  
    for(var i=0; i<closeList.length; i++){  
        if(closeList[i] == curNode)  
            return true;  
    }  
    return false;  
};  
var isInOpenList = function(curNode){  
    for(var i=0; i<openList.length; i++){  
        if(openList[i] == curNode)  
            return true;  
    }  
    return false;  
};  
var calcNodeGHF = function(curNode){  
  
};  
var initOpenList = function(){  
    openList = [];  
    openList.push(StartNode);  
};  
//G 为 start 到当前的耗费， H 为当前到 end 的耗费  
var searceCanArrivedList = function(curNode, EndNode, indexOfOpen){  
    console.log('==============indeOf  calc === ' + indexOfOpen);  
    var curX = curNode.getUserData().i;  
    var curY = curNode.getUserData().j;  
    var endX = EndNode.getUserData().i;  
    var endY = EndNode.getUserData().j;  
    closeList.push(curNode);  
    openList.splice(0, 1);  
    if(MapNode[(curX-1)*9+curY] == EndNode){  
        EndNode.Parent = curNode;  
        return true;  
    }  
    if(MapNode[(curX-1)*9+curY] && MapAtr[curX-1][curY] && !MapAtr[curX-1][curY][0] && !inCloseList(MapNode[(curX-1)*9+curY])){  
        // 判断点是不是在 openlist 里面  
        if(!isInOpenList(MapNode[(curX-1)*9 + curY])){  
            openList.push(MapNode[(curX-1)*9 + curY]);  
            MapNode[(curX-1)*9+curY].getUserData().G = curNode.getUserData().G + 1;  
            MapNode[(curX-1)*9+curY].getUserData().H = Math.abs(endX - MapNode[(curX-1)*9+curY].getUserData().i) + Math.abs(endY - MapNode[(curX-1)*9+curY].getUserData().j);  
            MapNode[(curX-1)*9+curY].getUserData().F = MapNode[(curX-1)*9+curY].getUserData().G + MapNode[(curX-1)*9+curY].getUserData().H;  
            MapNode[(curX-1)*9+curY].getUserData().arrived = true;  
            MapNode[(curX-1)*9+curY].getChildByName('stringLabel').setString('k' + (indexOfOpen*10 + 1));  
            MapNode[(curX-1)*9+curY].Parent = curNode;  
        }  
    }  
    if(MapNode[(curX+1)*9+curY] == EndNode){  
        EndNode.Parent = curNode;  
        return true;  
    }  
    if(MapNode[(curX+1)*9+curY] && MapAtr[curX+1][curY] && !MapAtr[curX+1][curY][0] && !inCloseList(MapNode[(curX+1)*9+curY])){  
        if(!isInOpenList(MapNode[(curX + 1) * 9 + curY])) {  
            openList.push(MapNode[(curX + 1) * 9 + curY]);  
            MapNode[(curX + 1) * 9 + curY].getUserData().G = curNode.getUserData().G + 1;  
            MapNode[(curX + 1) * 9 + curY].getUserData().H = Math.abs(endX - MapNode[(curX + 1) * 9 + curY].getUserData().i) + Math.abs(endY - MapNode[(curX + 1) * 9 + curY].getUserData().j);  
            MapNode[(curX + 1) * 9 + curY].getUserData().F = MapNode[(curX + 1) * 9 + curY].getUserData().G + MapNode[(curX + 1) * 9 + curY].getUserData().H;  
            MapNode[(curX + 1) * 9 + curY].getUserData().arrived = true;  
            MapNode[(curX + 1) * 9 + curY].getChildByName('stringLabel').setString('K' + (indexOfOpen * 10 + 2));  
            MapNode[(curX + 1) * 9 + curY].Parent = curNode;  
        }  
    }  
    if(MapNode[curX*9+curY+1] == EndNode){  
        EndNode.Parent = curNode;  
        return true;  
    }  
    if(MapNode[curX*9+curY+1] && MapAtr[curX][curY+1] && !MapAtr[curX][curY+1][0] && !inCloseList(MapNode[curX*9+curY+1])){  
        if(!isInOpenList(MapNode[curX * 9 + curY + 1])) {  
            openList.push(MapNode[curX * 9 + curY + 1]);  
            MapNode[curX * 9 + curY + 1].getUserData().G = curNode.getUserData().G + 1;  
            MapNode[curX * 9 + curY + 1].getUserData().H = Math.abs(endX - MapNode[curX * 9 + curY + 1].getUserData().i) + Math.abs(endY - MapNode[curX * 9 + curY + 1].getUserData().j);  
            MapNode[curX * 9 + curY + 1].getUserData().F = MapNode[curX * 9 + curY + 1].getUserData().G + MapNode[curX * 9 + curY + 1].getUserData().H;  
            MapNode[curX * 9 + curY + 1].getUserData().arrived = true;  
            MapNode[curX * 9 + curY + 1].getChildByName('stringLabel').setString('K' + (indexOfOpen * 10 + 3));  
            MapNode[curX * 9 + curY + 1].Parent = curNode;  
        }  
    }  
    if(MapNode[curX*9+curY-1] == EndNode){  
        EndNode.Parent = curNode;  
        return true;  
    }  
    if(MapNode[curX*9+curY-1] && MapAtr[curX][curY-1] &&!MapAtr[curX][curY-1][0] && !inCloseList(MapNode[curX*9+curY-1])){  
        if(!isInOpenList(MapNode[curX * 9 + curY - 1])) {  
            openList.push(MapNode[curX * 9 + curY - 1]);  
            MapNode[curX * 9 + curY - 1].getUserData().G = curNode.getUserData().G + 1;  
            MapNode[curX * 9 + curY - 1].getUserData().H = Math.abs(endX - MapNode[curX * 9 + curY - 1].getUserData().i) + Math.abs(endY - MapNode[curX * 9 + curY - 1].getUserData().j);  
            MapNode[curX * 9 + curY - 1].getUserData().F = MapNode[curX * 9 + curY - 1].getUserData().G + MapNode[curX * 9 + curY - 1].getUserData().H;  
            MapNode[curX * 9 + curY - 1].getUserData().arrived = true;  
            MapNode[curX * 9 + curY - 1].getChildByName('stringLabel').setString('K' + (indexOfOpen * 10 + 4));  
            MapNode[curX * 9 + curY - 1].Parent = curNode;  
        }  
    }  
  
    //判断当前的openList的 F 值最小  
    if(openList.length){  
        var _F = openList[0].getUserData().F;  
        var _idx = 0;  
        for(var i=0; i<openList.length; i++){  
            if(openList[i].getUserData().F < _F){  
                _F = openList[i].getUserData().F;  
                _idx = i;  
            }  
        }  
        if(_idx != 0){  
            var tem = openList[0];  
            openList[0] = openList[_idx];  
            openList[_idx] = tem;  
        }  
    }  
    return false;  
};  
var findPath = function(EndNode){  
    resultList.push(EndNode);  
    var node = EndNode.Parent;  
    while(node.Parent){  
        resultList.push(node);  
        node = node.Parent;  
    }  
    // Start 节点要不要添加进去？  
}  
var astart = function(StartNode, EndNode){  
    initOpenList(StartNode);  
    var indexOfOpen = 0;  
    var result = searceCanArrivedList(StartNode, EndNode, indexOfOpen++);  
    if(!result){  
        while(openList.length) {  
            result = searceCanArrivedList(openList[0], EndNode, indexOfOpen++);  
            if(result){  
                return true;  
            }  
        }  
    }  
    return result;  
};  
var clearSelectNode = function(){  
    StartNode = null;  
    EndNode = null;  
    openList = [];  
    resultList = [];  
    closeList = [];  
    for(var i=0; i<MapNode.length; i++){  
        var userData = MapNode[i].getUserData();  
        MapNode[i].getChildByName('stringLabel').setString('');  
        if(MapAtr[userData.i][userData.j][0]){  
            MapNode[i].setColor(cc.color(0,0,0));  
        } else {  
            MapNode[i].setColor( userData.color );  
        }  
        if(MapNode[i].Parent)  
            MapNode[i].Parent = null;  
        if(userData.G)  
            userData.G = 0;  
        if(userData.F)  
            userData.F = 0;  
        if(userData.H)  
            userData.H = 0;  
        if(userData.arrived)  
            userData.arrived = false;  
        if(userData.from)  
            userData.from = 0;  
        if(userData.label)  
            userData.label = '';  
    }  
}  
