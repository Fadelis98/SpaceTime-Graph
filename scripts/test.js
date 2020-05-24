//初始化

var canvas = document.getElementById('spacetime');
var ctx = canvas.getContext("2d");

//全局变量
var circle = new Path2D;//⚪
circle.moveTo(300,300);
circle.arc(100,100,100,0,Math.PI*2);

var triangle = new Path2D;
triangle.lineTo(10,5);
triangle.lineTo(5,10);
triangle.lineTo(0,0);

//测试函数
function TestDrawRect() {
    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    ctx.fillRect(30,30,50,50);
    ctx.fillRect(25, 25, 100, 100);
    ctx.clearRect(45, 45, 60, 60);
    ctx.strokeRect(50, 50, 50, 50);
}

function TestDrawLine() {
    ctx.beginPath();
    ctx.moveTo(50,50);
    ctx.lineTo(50,450);
    ctx.lineTo(450,450);
    ctx.stroke();
}

function TestDrawArc() {
    ctx.beginPath();
    ctx.arc(75,75,50,0,Math.PI*2,true); // 绘制
    ctx.moveTo(110,75);
    ctx.arc(75,75,35,0,Math.PI,false);   // 口(顺时针)
    ctx.moveTo(65,65);
    ctx.arc(60,65,5,0,Math.PI*2,true);  // 左眼
    ctx.moveTo(95,65);
    ctx.arc(90,65,5,0,Math.PI*2,true);  // 右眼
    ctx.stroke();
}

function TestTranslate() {
    ctx.fillRect(30,30,50,50);
    ctx.translate(30,30);
    ctx.fillRect(30,30,50,50);

}

function TestRotate(){
    ctx.translate(150,150);
    ctx.save();
    for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI/3)
        ctx.fill(triangle);
    }
}
TestRotate()