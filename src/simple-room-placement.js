let tileGuide = [
    {'name': 'wall', 'value': 1},
    {'name': 'floor', 'value': 2},
];

let roomGuide = [
    //{name:'room1' ,height:2, width:2},
    {name:'room2' ,height:3, width:3},
    {name:'room3' ,height:4, width:4},
   // {name:'room4' ,height:5, width:5},
];

const levelSize = {'height': 20, 'width': 20};
let levelArray =  Array(levelSize.height).fill().map(() => Array(levelSize.width).fill(0));

function generateLevel(){
    console.log('generating level...');
    levelArray = fillLevelWithWalls(levelArray);
    let rooms = pickAndPlaceRooms(10, levelArray);
    placeCorridors(levelArray, rooms);
    // let rooms2 = pickAndPlaceRooms(3, levelArray);
    // placeCorridors(levelArray, rooms2);
    //console.table(levelArray);
    mapLevelToHtmlTable(levelArray);
}

function mapLevelToHtmlTable(levelArray){
    const currentTable = document.getElementById('display');
    let htmlText = '';
    levelArray.forEach(row => {
        htmlText += '<tr class="noBorder">';
        row.forEach(element => {
            htmlText += '<td class="noBorder ' + tileGuide.find(t => t.value == element).name + '">' + element + '</td>';
        });
        htmlText += '</tr>';
    });
    currentTable.innerHTML = htmlText;
}

function fillLevelWithWalls(levelArray){
    levelArray.forEach(row => row.fill(tileGuide.find(t => t.name == 'wall').value));
    return levelArray
}

function pickAndPlaceRooms(roomNumber, levelArray){
    let rooms = [];
    for (let r = 0; r < roomNumber; r++) { 
        let room = pickRoom();
        placeRoom(room, levelArray);
        rooms.push(room);
    };
    rooms.sort((a, b) => {
        let xDiff = a.x - b.x;
        let yDiff = a.y - b.y;
        return xDiff == 0 ? yDiff : xDiff;
    });
    //console.table(rooms);
    return rooms
}

function pickRoom(){
    const room = JSON.parse(JSON.stringify(roomGuide[Math.floor(Math.random() * roomGuide.length)]));
    console.log(room);
    return room
}

function placeRoom(room, levelArray){
    let placed = false;
    let placeable = false;
    let i = 1;
    let x = 0;
    let y = 0;
    let locationTile;
    const wall = tileGuide.find(t => t.name == 'wall').value;
    const floor = tileGuide.find(t => t.name == 'floor').value;

    while (!placed) {
        x = Math.floor(Math.random() * levelSize.width);
        y = Math.floor(Math.random() * levelSize.height);
        //locationTile = levelArray[y][x];
        placeable = checkCanPlace(levelArray, x, x + room.width, y,  y + room.height, wall);
        if (placeable){
            for (let c = y; c < y + room.height; c++){
                for (let r = x; r < x + room.width; r++){
                    levelArray[c][r] = floor;
                }
            }
            room.x = x;
            room.y = y;
            placed = true;
        } else if (i > 5) {
            room = {};
            placed = true;
        }
        i++;
    }
}

function checkCanPlace(levelArray, xStart, xEnd, yStart, yEnd, checkTile){
    if (xEnd >= levelArray[0].length || yEnd >= levelArray.length ||
        xEnd < 0|| yEnd < 0){
        return false
    }

    if (yStart == yEnd && xStart == xEnd) {
        if (levelArray[yStart][xStart] != checkTile) {
            return false;
        }
    }

    for (let c = yStart; c < yEnd; c++){
        for (let r = xStart; r < xEnd; r++){
            if (levelArray[c][r] != checkTile) {
                return false;
            }
        }
    }

    return true;
}

function getRoomDirection(rooms, room, roomIndex) {
    let nextRoomXDirection = rooms[roomIndex + 1].x + rooms[roomIndex + 1].width / 2 > room.x + room.width / 2;
    let nextRoomYDirection = rooms[roomIndex + 1].y + rooms[roomIndex + 1].height / 2 > room.y + room.height / 2;
    return [nextRoomXDirection, nextRoomYDirection]
}

function placeCorridors(levelArray, rooms){
    const wall = tileGuide.find(t => t.name == 'wall').value;
    console.table(rooms);
    rooms.forEach((room, roomIndex) => {
        //console.log(roomIndex, room);
        if (room.x == undefined || room.y == undefined || ((roomIndex + 1) >= rooms.length)) return;
        let corridorDirection = 'right';

        let [nextRoomXDirection, nextRoomYDirection] = getRoomDirection(rooms, room, roomIndex);
        console.log('roomDirections',nextRoomXDirection,nextRoomYDirection);

        // TODO check if direcion is viable on board, if not then pick the other one
        
        if(nextRoomXDirection && nextRoomYDirection) {
            corridorDirection =  Math.random() < 0.5 ? 'right' : 'down';
        } else if (nextRoomXDirection && !nextRoomYDirection) {
            corridorDirection =  Math.random() < 0.5 ? 'right' : 'up';
        } else if (!nextRoomXDirection && !nextRoomYDirection) {
            corridorDirection =  Math.random() < 0.5 ? 'left' : 'up';
        } else if (!nextRoomXDirection && nextRoomYDirection) {
            corridorDirection =  Math.random() < 0.5 ? 'left' : 'down';
        }

        console.log('corridorDirection', corridorDirection);
        let ix = 0;
        let iy = 0;
        let corridorX = 0;
        let corridorY = 0;
        let stepX = 0;
        let stepY = 0;

        switch (corridorDirection) {
            case 'right':
                corridorX = Math.floor(room.x + room.width);
                corridorY = Math.floor(room.y + room.height / 2);
                stepX = 1;
                break;
            case 'down':
                corridorX = Math.floor(room.x + room.width / 2);
                corridorY = Math.floor(room.y + room.height);
                stepY = 1;
                break;
            case 'left':
                corridorX = Math.floor(room.x) - 1;
                corridorY = Math.floor(room.y + room.height / 2);
                stepX = -1;
                break;
            case 'up':
                corridorX = Math.floor(room.x + room.width / 2);
                corridorY = Math.floor(room.y) - 1;
                stepY = -1;
                break;
            default:
                console.error('error');
        }
        
        corridorX = corridorX;
        corridorY = corridorY;
        console.log(roomIndex, room.name, corridorX, stepX, corridorY, stepY);

        console.log('checkCanPlace',checkCanPlace(levelArray, corridorX, corridorX, corridorY, corridorY, wall));
        while (checkCanPlace(levelArray, corridorX, corridorX, corridorY, corridorY, wall)) {

            console.log('corridorY', corridorY, 'stepY', stepY, 'corridorX', corridorX, 'stepX', stepX);

            levelArray[corridorY][corridorX] = 2;

            let nextRoomXDirection = corridorX >= Math.floor(rooms[roomIndex + 1].x + rooms[roomIndex + 1].width / 2);
            let nextRoomYDirection = corridorY >= Math.floor(rooms[roomIndex + 1].y + rooms[roomIndex + 1].height / 2);

            if(stepX == 1 && nextRoomXDirection) {
                stepX = 0;
                stepY = nextRoomYDirection ? -1 : 1;
            } else if (stepX == -1 && !nextRoomXDirection) {
                stepX = 0;
                stepY = nextRoomYDirection ? -1 : 1;
            } else if (stepY == 1 && nextRoomYDirection) {
                stepX = nextRoomXDirection ? -1 : 1;
                stepY = 0;
            } else if (stepY == -1 && !nextRoomYDirection) {
                stepX = nextRoomXDirection ? -1 : 1;
                stepY = 0;
            }

            // if (stepX == 1 && (corridorX) >= Math.floor(rooms[roomIndex + 1].x + (rooms[roomIndex + 1].width / 2)) ){
            //     stepX = 0;
            //     stepY = rooms[roomIndex + 1].y >= (corridorY) ? 1 : -1;
            //     corridorDirection = 1;
            // } else if(stepY == 1 && (corridorY) >= Math.floor(rooms[roomIndex + 1].y + rooms[roomIndex + 1].height / 2) ){
            //     stepX = 1;
            //     stepY = 0;
            //     corridorDirection = 0;
            // } else if(stepX == -1 && (corridorX) <= Math.floor(rooms[roomIndex + 1].x + rooms[roomIndex + 1].width / 2) ){
            //     stepX = 0;
            //     stepY = -1;
            //     corridorDirection = 2;
            // } else if(stepY == -1 && (corridorY) <= Math.floor(rooms[roomIndex + 1].y + rooms[roomIndex + 1].height / 2) ){
            //     stepX = -1;
            //     stepY = 0;
            //     corridorDirection = 3;
            // }
            
            corridorX = corridorX + stepX;
            corridorY = corridorY + stepY;
          }
    })
}
