//matter JS
const {Engine,Runner,Render,World,Bodies,Body,Events}=Matter;
let cellsHorizontal=14;   //no of cells  horizontal
let cellsVertical=10;    //no of cells vertical 

const width = window.innerWidth;
const height=window.innerHeight;

const unitLengthX=width/cellsHorizontal;
const unitLengthY=height/cellsVertical;

const engine=Engine.create();
//disable gravity of ball
engine.world.gravity.y=0;
const {world}=engine;
const render=Render.create({
    element:document.body,
    engine:engine,
    options:{
wireframes:false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(),engine);


//walls
const walls=[
    Bodies.rectangle(width/2,0,width,2,{  //x-axis,y-axis,width,height    axis to center of shape
        isStatic:true   //dont move otherwise it will fall
    }),
    Bodies.rectangle(width/2,height,width,2,{isStatic:true}),   //bottom border
    Bodies.rectangle(0,height/2,2,height,{isStatic:true}),      //left
    Bodies.rectangle(width,height/2,2,height,{isStatic:true})     //right
     
];
World.add(world,walls)   //to showup

//Maze Geneartion
const shuffle=(arr)=>{    //shuffle neigbours
  let counter=arr.length;
  while(counter>0){
      const index=Math.floor(Math.random()*counter);
      counter--;
      //swapping
      const temp=arr[counter];
      arr[counter]=arr[index];
      arr[index]=temp;
  }
  return arr;
}

const grid=Array(cellsVertical).fill(null).map(()=>Array(cellsHorizontal).fill(false))
const verticals=Array(cellsVertical).fill(null).map(()=>Array(cellsHorizontal-1).fill(false))
const horizontals=Array(cellsVertical-1).fill(null).map(()=>Array(cellsHorizontal).fill(false))

const startRow=Math.floor(Math.random()*cellsVertical)
const startColumn=Math.floor(Math.random()*cellsHorizontal)

//randomly ordered list of neighbours
const stepThroughCell=(row,column)=>{
 //if visited the row or column then return
 if(grid[row][column]){
     return;
 }

 //mark this cell as being visited
 grid[row][column]=true;

 //assemble randomly ordered list of neighbors
 const neighbours=shuffle([
     [row-1,column,'up'],   //top
     [row,column+1,'right'] ,   //right
     [row+1,column,'down'],    //bottom
     [row,column-1,'left']    //left   
 ]);

 //for each neighbour
 for(let neighor of neighbours){
 const [nextRow,nextColumn,direction]=neighor;

 //see if the neigbours is out of bounds
if(nextRow<0 ||
     nextRow>=cellsVertical ||
      nextColumn<0 ||
       nextColumn>=cellsHorizontal
       ){
    continue;  // won't break the for loop
}

 //if we have visited that neighbour,continue to next neigbour
 if(grid[nextRow][nextColumn]){
     continue;
 }
 
 //remove a wall from either horizontals or verticals
 if(direction==='left'){
     verticals[row][column-1]=true;
 }else if(direction==='right'){
     verticals[row][column]=true;
 }else if(direction==='up'){
     horizontals[row-1][column]=true;
 }else if(direction==='down'){
     horizontals[row][column]=true;
 }

 stepThroughCell(nextRow,nextColumn)
}

 //visit that next cell
}
stepThroughCell(startRow,startColumn);

//horizontal walls
horizontals.forEach((row,rowIndex)=>{      //inner arrays of horizontal array
    row.forEach((open,columnIndex)=>{
       if(open===true){
           return;        //no need to draw anything for open
       } 
       const wall=Bodies.rectangle(
           columnIndex*unitLengthX+unitLengthX/2,
           rowIndex*unitLengthY+unitLengthY,
           unitLengthX,
           5,
           {   label:'wall',
               isStatic:true,
               render:{
                fillStyle:'red'
            }
           }
       );
       World.add(world,wall)
    })
})

//vertical walls
verticals.forEach((row,rowIndex)=>{      //inner arrays of horizontal array
    row.forEach((open,columnIndex)=>{
       if(open===true){
           return;        //no need to draw anything for open
       } 
       const wall=Bodies.rectangle(
           columnIndex*unitLengthX+unitLengthX,
           rowIndex*unitLengthY+unitLengthY/2,
          5,
           unitLengthY,
           
           {   label:'wall',
               isStatic:true,
               render:{
                   fillStyle:'red'
               }
           }
       );
       World.add(world,wall)
    })
})

//goal
const goal=Bodies.rectangle(
width -unitLengthX/2,
height-unitLengthY/2,
unitLengthX*0.7,
unitLengthY*0.7,{
    isStatic:true,
    label:'goal',
    render:{
        fillStyle:'green'
    }
}
);
World.add(world,goal)

//ball
const ballRadius=Math.min(unitLengthX,unitLengthY)/4;
const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,{
        label:'ball',
        render:{
            fillStyle:'blue'
        }
    }
)
World.add(world,ball)

//keys to move
document.addEventListener('keydown',event=>{
     const {x,y}=ball.velocity;
    if(event.keyCode===38){   //up
        Body.setVelocity(ball,{x,y:y-5})
    }
    if(event.keyCode===39){
        Body.setVelocity(ball,{x:x+5,y})   //right
    }
    if(event.keyCode===40){
        Body.setVelocity(ball,{x,y:y+5})  //down
    }
    if(event.keyCode===37){
        Body.setVelocity(ball,{x:x-5,y})  //left

    }
});

//win condition
Events.on(engine,'collisionStart',event=>{
event.pairs.forEach((collision)=>{
  const labels=['ball','goal'];
  if(labels.includes(collision.bodyA.label) &&
  labels.includes(collision.bodyB.label))
  {
      document.querySelector('.winner').classList.remove('hidden')
      //enable gravity  
    world.gravity.y=1;
    world.bodies.forEach(body=>{
        if(body.label==='wall'){
            Body.setStatic(body,false)
        }
    })

  }
})
});
  