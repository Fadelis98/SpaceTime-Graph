//初始化canvas对象
var background = document.getElementById("background");
var bac2d = background.getContext("2d");
var spacetime = document.getElementById("spacetime");
var spa2d = spacetime.getContext("2d");
var ui = document.getElementById("ui");
var ui2d = ui.getContext("2d");
//获取页面元素

//参数
var name_input = document.getElementById("name");
var target_type_input = document.getElementById("target type");
var x_input = document.getElementById("x");
var v_input = document.getElementById("v");
var color0_input = document.getElementById("color0");
var alpha0_input = document.getElementById("alpha0");
var color1_input = document.getElementById("color1");
var alpha1_input = document.getElementById("alpha1");

//按钮
var add_button = document.getElementById("add");
var remove_button = document.getElementById("remove");
var changeview_button = document.getElementById("changeview");
var centralize_button = document.getElementById("centralize");
var drawHyperbola_button = document.getElementById("drawHyperbola");
var drawLight_button = document.getElementById("drawLight");
var clearSubline_button = document.getElementById("clearSubline");
var clearAll_button = document.getElementById("clearAll");


//代码相关
var addtocode_button = document.getElementById("add to code");
var run_code_button = document.getElementById("run code");
var code_input = document.getElementById("code");


//全局变量
var canvas_wid = background.clientWidth;//画布宽度
var canvas_hei = background.clientHeight;//画布长度
var canvas_margin = 40;//边缘宽度 使用该参数调整画布大小

var WorldLineList = new Map();//世界线map
var AxisList = new Map();//坐标系map
var backgroundElements = new Map();

var staticSpeed = 0; //静止参考系的速度

var mycode = [];

//常用图形
var axis = new Path2D();//坐标轴
var grid = new Path2D();//坐标网格
function setPath2D() {
    //坐标轴
    let wid = canvas_wid / 2 - canvas_margin;
    let hei = canvas_hei - 2 * canvas_margin;
    axis.moveTo(wid, 0);
    axis.lineTo(-wid, 0);
    axis.moveTo(0, 0);
    axis.lineTo(0, hei);
    axis.moveTo(-5, hei - 5);//y轴箭头
    axis.lineTo(0, hei);
    axis.lineTo(5, hei - 5);
    axis.moveTo(wid - 5, 5);//x轴箭头
    axis.lineTo(wid, 0);
    axis.lineTo(wid - 5, -5);
    //坐标网格
    let interval = 10;//网格间隔宽度
    for (let i = -wid / interval; i < wid / interval; i++) {//纵轴
        grid.moveTo(interval * i, 0);
        grid.lineTo(interval * i, hei);
    }
    for (let i = 0; i < hei / interval; i++) {//纵轴
        grid.moveTo(-wid, interval * i);
        grid.lineTo(wid, interval * i);
    }
}

//时空图元素的类
class point {
    constructor(name = "defaultpoint", x = 0, y = 0) {
        this.name = name;
        this.x = x;
        this.y = y;
    }
}

class Axis {
    constructor(name = "defaultAxis", x = 0, v = 0, layer = bac2d) {
        //初始化属性，不可修改
        this.name = name;
        this.x = x;
        this.v = v;
        this.layer = layer;
    }
    //内部属性，不要直接修改和访问
    axisColor = "black";
    gridColor = "grey";
    showGrid = false;

    //修改内部属性的方法
    setColor(gridC = "grey", axisC = "black") {
        //设置颜色
        this.axisColor = axisC;
        this.gridColor = gridC;
    }
    setshowGrid(TorF = !this.showGrid) {//无参数时默认为反转状态
        //设置是否显示网格
        this.showGrid = TorF;
    }
    //静态元素绘制方法
    DrawGrid(canvas2d = this.layer, setgridColor = this.gridColor) {
        //绘制坐标网格
        canvas2d.save();
        Lorentz_transform(staticSpeed, canvas2d);

        Lorentz_transform(-this.v, canvas2d);
        canvas2d.translate(this.x, 0);

        canvas2d.strokeStyle = setgridColor;
        canvas2d.stroke(grid);
        canvas2d.restore();
    }

    DrawAxis(canvas2d = this.layer, setaxisColor = this.axisColor) {
        //绘制坐标系
        canvas2d.save();
        Lorentz_transform(staticSpeed, canvas2d);

        Lorentz_transform(-this.v, canvas2d);
        canvas2d.translate(this.x, 0);

        canvas2d.strokeStyle = setaxisColor;
        canvas2d.stroke(axis);
        canvas2d.restore();
    }
}

class WorldLine {
    constructor(name, x, v, lineColor = "blue") {
        //初始化属性，不可修改
        this.name = name
        this.x = x
        this.v = v
        this.lineColor = lineColor
    }

    //修改内部属性的方法
    setColor(lineColor) {
        //设置颜色
        this.lineColor = lineColor
    }

    //静态元素绘制方法
    DrawWorldLine(canvas2d = spa2d, setlineColor = this.lineColor) {
        //绘制速度v的世界线
        canvas2d.save()
        Lorentz_transform(staticSpeed, canvas2d)
        Lorentz_transform(-this.v, canvas2d)
        canvas2d.translate(this.x, 0)
        canvas2d.beginPath()
        canvas2d.moveTo(0, 0)
        canvas2d.lineTo(0, canvas_hei)
        canvas2d.closePath()
        canvas2d.strokeStyle = setlineColor
        canvas2d.stroke()
        canvas2d.restore()
    }
}

//坐标变换
function trans_Descartes(canvas2d) {
    //初始化时使用
    //从原绘图坐标系切换到笛卡尔坐标系
    canvas2d.resetTransform()
    canvas2d.translate(0, background.clientHeight)
    canvas2d.scale(1, -1)
    canvas2d.translate(canvas_wid / 2, canvas_margin)
}



function Lorentz_transform(v, canvas2d) {
    //洛沦兹变换
    //对canvas的绘图坐标系作变换
    let gamma = 1 / Math.sqrt(1 - v * v)
    canvas2d.transform(gamma, -gamma * v, -gamma * v, gamma, 0, 0)
}


//动画函数
function clearCanvas(canvas2d) {
    //清空画布
    canvas2d.save()
    canvas2d.resetTransform()
    canvas2d.clearRect(0, 0, canvas_wid, canvas_hei)
    canvas2d.restore()
}

function Draw() {
    //读取元素并绘制
    clearCanvas(spa2d)
    for (let axis of AxisList.values()) {
        axis.DrawAxis()
        if (axis.showGrid) {
            axis.DrawGrid()
        }
    }
    for (let worldline of WorldLineList.values()) {
        worldline.DrawWorldLine()
    }
}

function DrawBackground() {
    //绘制背景元素
    for (let bacEle of backgroundElements.values()) {
        bacEle.DrawAxis()
        if (axis.showGrid) {
            axis.DrawGrid()
        }
    }
}

function TransformAnimation(StartSpeed, TargetSpeed) {
    //不同速度的惯性系间切换动画
    var now = StartSpeed
    var dv = (TargetSpeed - StartSpeed) / 60
    var draw = function () {
        staticSpeed = now
        Draw()
        now += dv
        if (now <= TargetSpeed + 0.001) {
            wl = window.requestAnimationFrame(draw);
        }
        else {
            window.cancelAnimationFrame(wl);
        }
    }
    draw()
}

//静态元素绘制
function DrawHyperbola([x, y], distance, canvas2d = ui2d, color = "orange") {
    //绘制校准曲线
    canvas2d.save();
    canvas2d.resetTransform();
    canvas2d.moveTo(0, 0);
    canvas2d.beginPath();
    canvas2d.moveTo(distance * 1 / Math.cos(-Math.PI * 1.5 + 0.001) + x, distance * Math.tan(-Math.PI / 2 - 0.001));
    for (let t = -Math.PI * 1.5 + 0.001; t < -Math.PI / 2 - 0.001; t = t + 0.01) {
        var hyperx = distance * 1 / Math.cos(t) + x
        var hypery = distance * Math.tan(t) + y
        canvas2d.lineTo(hyperx, hypery)
    }
    canvas2d.moveTo(distance * 1 / Math.cos(-Math.PI / 2 + 0.001) + x, distance * Math.tan(Math.PI / 2 - 0.001))
    for (let t = -Math.PI / 2 + 0.001; t < Math.PI / 2 - 0.001; t = t + 0.01) {
        var hyperx = distance * 1 / Math.cos(t) + x
        var hypery = distance * Math.tan(t) + y
        canvas2d.lineTo(hyperx, hypery)
    }
    canvas2d.moveTo(0, 0)
    canvas2d.closePath()
    canvas2d.strokeStyle = color
    canvas2d.stroke()
    canvas2d.restore()
}

function DrawLight([x = 0, y = 0], canvas2d = ui2d, lightColor = "yellow") {
    //画出光的世界线(辅助线)
    canvas2d.save();
    canvas2d.resetTransform();
    canvas2d.translate(x, y);
    //canvas2d.beginPath();
    canvas2d.moveTo(0, 0);
    canvas2d.beginPath();
    canvas2d.moveTo(canvas_hei, canvas_hei);
    canvas2d.lineTo(0, 0);
    canvas2d.moveTo(-canvas_hei, canvas_hei);
    canvas2d.lineTo(0, 0);
    canvas2d.moveTo(canvas_hei, -canvas_hei);
    canvas2d.lineTo(0, 0);
    canvas2d.moveTo(-canvas_hei, -canvas_hei);
    canvas2d.lineTo(0, 0);
    canvas2d.closePath();
    canvas2d.strokeStyle = lightColor;
    canvas2d.stroke();
    canvas2d.restore();
}

//交互动画
function uiPointer(event = "none") {
    var ball = {
        x: 0,
        y: 0,
        radius: 5,
        color: 'red',
        draw: function () {
            ui2d.beginPath();
            ui2d.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
            ui2d.closePath();
            ui2d.fillStyle = this.color;
            ui2d.fill();
        }
    };
    function setPointer(e) {
        clearCanvas(ui2d);
        ball.x = e.offsetX;
        ball.y = e.offsetY;
        ball.draw();
    }
    function showLight() {
        DrawLight([ball.x, ball.y]);
    }
    function drawLight() {
        clearCanvas(ui2d);
        ui.removeEventListener("mousemove", setPointer);
        ui.removeEventListener("mousemove", showLight);
        ui.removeEventListener("click", drawLight);
        DrawLight([ball.x, ball.y], bac2d);
    }
    var running = false;
    function showHyperbola(e) {
        if (!running) {
            clearCanvas(ui2d);
            ball.draw();
            ui.addEventListener("click", drawHyperbola);
            ui.removeEventListener("mousemove", setPointer);
            ui.removeEventListener("click", showHyperbola);
            ui.addEventListener("mousemove", showHyperbola);
            running = true;
        }
        else {
            clearCanvas(ui2d);
            ball.draw();
            hx = e.offsetX;
            hy = e.offsetY;
            DrawHyperbola([ball.x, ball.y], Math.abs(hx - ball.x));
        }
    }
    function drawHyperbola(e) {
        ui.removeEventListener("click", drawHyperbola);
        ui.removeEventListener("mousemove", drawHyperbola);
        ui.removeEventListener("mousemove", showHyperbola);
        clearCanvas(ui2d);
        hx = e.offsetX;
        hy = e.offsetY;
        DrawHyperbola([ball.x, ball.y], Math.abs(hx - ball.x),bac2d);
    }
    ui.addEventListener('mousemove', setPointer);
    if (event == "none") {
        ui.removeEventListener("mousemove", setPointer)
        ui.removeEventListener("mousemove", showLight);
        ui.removeEventListener("mousemove", showHyperbola)
    }
    else if (event == "light") {
        ui.addEventListener("mousemove", showLight);
        ui.addEventListener("click", drawLight);
    }
    else if (event == "hyperbola") {
        ui.addEventListener("click", showHyperbola);
    }
}




//用户接口
function addWorldLine(name, x, v, lineColor) {
    //添加世界线
    if (WorldLineList.has(name)) {//检测名称是否重复
        alert("名称重复")
        return 0//调用函数时，可以使用if(!addWorldLine)处理名字重复的异常
    }
    else {
        WorldLineList.set(name, new WorldLine(name, x, v, lineColor))
        return 1
    }
}
function removeWorldLine(name) {
    //删除世界线
    if (WorldLineList.has(name)) {//检测名称是否存在
        WorldLineList.delete(name)
        return 1
    }
    else {
        alert("不存在该元素，请检查名称是否正确")
        return 0
    }
}
function addAxis(name, x, v, canvas2d = bac2d) {
    //添加坐标系
    if (AxisList.has(name)) {//检测名称存在
        return 0
    }
    else {
        if (canvas2d === bac2d) {//如果在背景层则加入背景元素map
            backgroundElements.set(name, new Axis(name, x, v, canvas2d))
            DrawBackground()
        }
        else {
            AxisList.set(name, new Axis(name, x, v, canvas2d))

        }
        return 1
    }
}
function removeAxis(name) {
    //删除坐标系
    if (AxisList.has(name)) {//检测名称是否存在
        AxisList.delete(name)
        return 1
    }
    else {
        alert("不存在该元素，请检查名称是否正确")
        return 0
    }
}

function removeBackground(name) {
    //删除背景元素
    if (backgroundElements.has(name)) {
        backgroundElements.delete(name)
    }
    else {
        alert("不存在该元素，请检查名称是否正确")
    }

}

function centralizeWorldline(name) {
    //将指定名称的世界线居中绘制
    var x = WorldLineList.get(name).x
    for (let axis of AxisList.values()) {
        axis.x -= x
    }
    for (let worldline of WorldLineList.values()) {
        worldline.x -= x
    }
    Draw()
}

function ChangeViewTo(name) {
    //切换到指定名称的惯性系的视角
    var v = WorldLineList.get(name).v
    TransformAnimation(staticSpeed, v)
}

//页面事件


String.prototype.format = function () {
    //格式化字符串的辅助函数
    if (arguments.length == 0) return this;
    var param = arguments[0];
    var s = this;
    if (typeof (param) == 'object') {
        for (var key in param)
            s = s.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
        return s;
    } else {
        for (var i = 0; i < arguments.length; i++)
            s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return s;
    }
}

function button_add_worldline() {
    color = color0_input.value + parseInt(alpha0_input.value).toString(16);
    addWorldLine(name_input.value, x_input.value, v_input.value, color);
    Draw();
    var str = "addWorldLine({0},{1},{2},{3})".format(name_input.value, x_input.value, v_input.value, color);
    mycode.push(str);
}

function button_add_axis() {
    color0 = color0_input.value + parseInt(alpha0_input.value).toString(16);
    color1 = color1_input.value + parseInt(alpha1_input.value).toString(16);
    addAxis(name_input.value, x_input.value, v_input.value, spa2d);
    AxisList.get(name_input.value).setColor(color1, color0);
    var str1 = "addAxis({0},{1},{2},{3})".format(name_input.value, x_input.value, v_input.value, "spa2d");
    var str = "AxisList.get({0}).setColor({1},{2})".format(name_input.value, color1, color0);
    mycode.push(str1);
    mycode.push(str);
    Draw()
}

function button_add_light() {
    //color0 = color0_input.value +  parseInt(alpha0_input.value).toString(16)
    //color0_input.value = "yellow"
    //alpha0_input.value = 255
    DrawLight([]);
    var str = "DrawLight({0})".format(name_input.value);
    mycode.push(str);
}



run_code_button.onclick = function () {
    var code = code_input.value
    eval(code)
}






//初始化
function init() {
    setPath2D();
    trans_Descartes(bac2d);
    trans_Descartes(spa2d);
    //trans_Descartes(ui2d);
    bac2d.save();
    spa2d.save();
    //ui2d.save();
}


//主程序

function TrainandPark() {
    //车库佯谬的时空图
    addAxis("parkhead", 150, 0, spa2d)
    AxisList.get("parkhead").setColor("grey", "#00000000")
    addAxis("trainhead", 0, 0.6, spa2d)
    AxisList.get("trainhead").setColor("grey", "green")
    //addAxis("traintail", -100, 0.7, spa2d)
    //AxisList.get("traintail").setColor("grey", "green")
    AxisList.get("trainhead").setshowGrid()
    //AxisList.get("parkhead").setshowGrid()
    addWorldLine("trainhead", 0, 0.6)
    addWorldLine("traintail", -100, 0.6)
    addWorldLine("parkhead", 150, 0, "red")
    addWorldLine("parktail", 50, 0, "red")
    Draw()
    //DrawLight("basic")
    //DrawHyperbola("basic", 100, 200)
    ChangeViewTo("trainhead")
    centralizeWorldline("trainhead")
    //DrawHyperbola("basic",100,125)
}

init()
//justTest()
TrainandPark()
uiPointer("hyperbola")

