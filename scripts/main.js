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
//var centralize_button = document.getElementById("centralize");
var addHyperbola_button = document.getElementById("addHyperbola");
var drawLight_button = document.getElementById("drawLight");
var clearSubline_button = document.getElementById("clearSubline");
var clearAll_button = document.getElementById("clearAll");


//代码相关
var addtocode_button = document.getElementById("add to code");
var run_code_button = document.getElementById("run code");
var code_input = document.getElementById("code");
var element_list = document.getElementById("element_list");


//全局变量
var canvas_wid = background.clientWidth;//画布宽度
var canvas_hei = background.clientHeight;//画布长度
var canvas_margin = 40;//边缘宽度 使用该参数调整画布大小

var WorldLineList = new Map();//世界线map
var AxisList = new Map();//坐标系map
var staticSpeed = 0; //静止参考系的速度
var mycode = new Array();//生成的代码

//常用图形
var axis = new Path2D();//坐标轴
var grid = new Path2D();//坐标网格
function setPath2D()//初始化坐标网格
{
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
    for (let i = -wid / interval; i < wid / interval; i++){//纵轴
        grid.moveTo(interval * i, 0);
        grid.lineTo(interval * i, hei);
    }
    for (let i = 0; i < hei / interval; i++){//纵轴
        grid.moveTo(-wid, interval * i);
        grid.lineTo(wid, interval * i);
    }
}
class Axis{//坐标轴
    constructor(name = "defaultAxis", x = 0, v = 0, layer = bac2d,axisColor= "black", gridColor="grey"){
        //初始化属性，不可修改
        this.name = name;
        this.x = x;
        this.v = v;
        this.layer = layer;
        this.axisColor = axisColor;
        this.gridColor = gridColor;
        this.showGrid = true;
    }
    //修改内部属性的方法
    setColor(gridC = "grey", axisC = "black"){
        //设置颜色
        this.axisColor = axisC;
        this.gridColor = gridC;
        LiColor(this.name,"axis",axisC);
    }
    setshowGrid(TorF = !this.showGrid){//无参数时默认为反转状态
        //设置是否显示网格
        this.showGrid = TorF;
    }
    //静态元素绘制方法
    DrawGrid(canvas2d = this.layer, setgridColor = this.gridColor){
        //绘制坐标网格
        canvas2d.save();
        Lorentz_transform(staticSpeed, canvas2d);

        Lorentz_transform(-this.v, canvas2d);
        canvas2d.translate(this.x, 0);

        canvas2d.strokeStyle = setgridColor;
        canvas2d.stroke(grid);
        canvas2d.restore();
    }

    DrawAxis(canvas2d = this.layer, setaxisColor = this.axisColor){
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
class WorldLine{//世界线
    constructor(name, x, v, lineColor = "blue"){
        //初始化属性，不可修改
        this.name = name;
        this.x = x;
        this.v = v;
        this.lineColor = lineColor;
    }

    //修改内部属性的方法
    setColor(lineColor){
        //设置颜色
        this.lineColor = lineColor;
        LiColor(this.name,"worldline",this.lineColor);
    }

    //静态元素绘制方法
    DrawWorldLine(canvas2d = spa2d, setlineColor = this.lineColor){
        //绘制速度v的世界线
        canvas2d.save();0
        Lorentz_transform(staticSpeed, canvas2d);
        Lorentz_transform(-this.v, canvas2d);
        canvas2d.translate(this.x, 0);
        canvas2d.beginPath();
        canvas2d.moveTo(0, -100);
        canvas2d.lineTo(0, canvas_hei);
        canvas2d.closePath();
        canvas2d.strokeStyle = setlineColor;
        canvas2d.stroke();
        canvas2d.restore();
    }
}

//坐标变换
function trans_Descartes(canvas2d)//从原绘图坐标系切换到笛卡尔坐标系
{
    //初始化时使用
    canvas2d.resetTransform();
    canvas2d.translate(0, background.clientHeight);
    canvas2d.scale(1, -1);
    canvas2d.translate(canvas_wid / 2, canvas_margin);
}

function Lorentz_transform(v, canvas2d)//洛沦兹变换
{
    //对canvas的绘图坐标系作变换
    let gamma = 1 / Math.sqrt(1 - v * v)
    canvas2d.transform(gamma, -gamma * v, -gamma * v, gamma, 0, 0)
}


//动画函数
function clearCanvas(canvas2d)//清空画布
{
    canvas2d.save();
    canvas2d.resetTransform();
    canvas2d.clearRect(0, 0, canvas_wid, canvas_hei);
    canvas2d.restore();
}

function Draw()//从元素map中读取元素并绘制
{    
    clearCanvas(spa2d);
    for (let axis of AxisList.values())
   {
        axis.DrawAxis();
        if (axis.showGrid)
       {
            axis.DrawGrid();
        }
    }
    for (let worldline of WorldLineList.values())
   {
        worldline.DrawWorldLine();
    }
}

function TransformAnimation(StartSpeed, TargetSpeed){
    //不同速度的惯性系间切换动画
    var now = StartSpeed;
    var dv = (TargetSpeed - StartSpeed) / 60;
    var draw = function (){
        staticSpeed = now;
        Draw();
        now += dv;
        if (Math.abs(now-TargetSpeed) >= Math.abs(dv)){
            wl = window.requestAnimationFrame(draw);
        }
        else{
            window.cancelAnimationFrame(wl);
            staticSpeed = TargetSpeed;
            Draw();
        }
    }
    draw()
    
}

//静态元素绘制
function DrawHyperbola([x, y], distance, canvas2d = ui2d, color = "orange")//绘制校准曲线
{    
    canvas2d.save();
    canvas2d.resetTransform();
    canvas2d.moveTo(0, 0);
    canvas2d.beginPath();
    canvas2d.moveTo(distance * 1 / Math.cos(-Math.PI * 1.5 + 0.001) + x, distance * Math.tan(-Math.PI / 2 - 0.001));
    for (let t = -Math.PI * 1.5 + 0.001; t < -Math.PI / 2 - 0.001; t = t + 0.01){
        var hyperx = distance * 1 / Math.cos(t) + x;
        var hypery = distance * Math.tan(t) + y;
        canvas2d.lineTo(hyperx, hypery);
    }
    canvas2d.moveTo(distance * 1 / Math.cos(-Math.PI / 2 + 0.001) + x, distance * Math.tan(Math.PI / 2 - 0.001));
    for (let t = -Math.PI / 2 + 0.001; t < Math.PI / 2 - 0.001; t = t + 0.01){
        var hyperx = distance * 1 / Math.cos(t) + x;
        var hypery = distance * Math.tan(t) + y;
        canvas2d.lineTo(hyperx, hypery);
    }
    canvas2d.moveTo(0, 0);
    canvas2d.closePath();
    canvas2d.strokeStyle = color;
    canvas2d.stroke();
    canvas2d.restore();
}

function DrawLight([x = 0, y = 0], canvas2d = ui2d, lightColor = "yellow")//画出光的世界线(辅助线)
{
    canvas2d.save();
    canvas2d.resetTransform();
    canvas2d.translate(x, y);
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
function uiPointer(event = "none"){
    var ball = //球状的位置指示器
   {
        x: 0,
        y: 0,
        radius: 5,
        color: 'red',
        draw: function (){
            ui2d.beginPath();
            ui2d.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
            ui2d.closePath();
            ui2d.fillStyle = this.color;
            ui2d.fill();
        }
    };
    function setPointer(e){//追踪鼠标位置定位并绘制指示器的回调函数
        clearCanvas(ui2d);
        ball.x = e.offsetX;
        ball.y = e.offsetY;
        ball.draw();
    }

    //绘制光线
    function showLight(){//根据指示器位置绘制光线预览
        DrawLight([ball.x, ball.y]);
    }
    function drawLight(){//在背景上绘制光线
        clearCanvas(ui2d);
        ui.removeEventListener("mousemove", setPointer);
        ui.removeEventListener("mousemove", showLight);
        ui.removeEventListener("click", drawLight);
        DrawLight([ball.x, ball.y], bac2d);
    }

    //绘制校准曲线
    var running = false;
    function showHyperbola(e)
   {
        if (!running){
            clearCanvas(ui2d);
            ball.draw();
            ui.addEventListener("click", drawHyperbola);
            ui.removeEventListener("mousemove", setPointer);
            ui.removeEventListener("click", showHyperbola);
            ui.addEventListener("mousemove", showHyperbola);
            running = true;
        }
        else{
            clearCanvas(ui2d);
            ball.draw();
            hx = e.offsetX;
            hy = e.offsetY;
            DrawHyperbola([ball.x, ball.y], Math.abs(hx - ball.x));
        }
    }
    function drawHyperbola(e)
   {
        ui.removeEventListener("click", drawHyperbola);
        ui.removeEventListener("mousemove", drawHyperbola);
        ui.removeEventListener("mousemove", showHyperbola);
        running = false;
        clearCanvas(ui2d);
        hx = e.offsetX;
        hy = e.offsetY;
        DrawHyperbola([ball.x, ball.y], Math.abs(hx - ball.x),bac2d);
    }

    //启用交互
    ui.addEventListener('mousemove', setPointer);
    if (event == "none"){
        ui.removeEventListener("mousemove", setPointer)
        ui.removeEventListener("mousemove", showLight);
        ui.removeEventListener("mousemove", showHyperbola)
    }
    else if (event == "light"){
        ui.addEventListener("mousemove", showLight);
        ui.addEventListener("click", drawLight);
    }
    else if (event == "hyperbola"){
        ui.addEventListener("click", showHyperbola);
    }
}


//用户接口
function addWorldLine(name, x, v, lineColor){
    //添加世界线
    if (WorldLineList.has(name)){//检测名称是否重复
        alert("名称重复");

        return 0//调用函数时，可以使用if(!addWorldLine)处理名字重复的异常
    }
    else{
        WorldLineList.set(name, new WorldLine(name, x, v, lineColor));
        addLi(name,"worldline",x,v);
        LiColor(name,"worldline",lineColor);
        return 1
    }
}
function removeWorldLine(name){
    //删除世界线
    if (WorldLineList.has(name)){//检测名称是否存在
        WorldLineList.delete(name);
        delLi(name,"worldline");
        return 1
    }
    else{
        alert("不存在该元素，请检查名称是否正确")
        return 0
    }
}
function addAxis(name, x, v, canvas2d = spa2d,axisColor= "black", gridColor="grey"){
    //添加坐标系
    if (AxisList.has(name)){//检测名称存在
        return 0
    }
    else{
        AxisList.set(name, new Axis(name, x, v, canvas2d,axisColor,gridColor));
        addLi(name,"axis",x,v);
        LiColor(name,"axis",axisColor);
        return 1
    }
}
function removeAxis(name){
    //删除坐标系
    if (AxisList.has(name)){//检测名称是否存在
        AxisList.delete(name);
        delLi(name,"axis");
        return 1
    }
    else{
        alert("不存在该元素，请检查名称是否正确")
        return 0
    }
}
/*
function centralizeWorldline(name,elementClass){//目前的实现有bug，暂不使用。
    //将指定名称的世界线居中绘制
    if (elementClass == "worldline")
    {
        if(WorldLineList.has(name))
        {
            var x = WorldLineList.get(name).x;
        }
        else
        {
            alert("不存在这条世界线");
        }
    }
    else if (elementClass == "axis")
    {
        if(AxisList.has(name))
        {
            var x = AxisList.get(name).x;
        }
        else
        {
            alert("不存在这个坐标系");
        }
    }
    for (let axis of AxisList.values()){
        axis.x -= x
    }
    for (let worldline of WorldLineList.values()){
        worldline.x -= x
    }
    Draw()
}
*/
function changeViewTo(name,elementClass){
    //切换到指定名称的惯性系的视角
    if (elementClass == "worldline")
    {
        if(WorldLineList.has(name))
        {
            var v = WorldLineList.get(name).v;
        }
        else
        {
            alert("不存在这条世界线");
            return 0
        }
    }
    else if (elementClass == "axis")
    {
        if(AxisList.has(name))
        {
            var v = AxisList.get(name).v;
        }
        else
        {
            alert("不存在这个坐标系");
            return 0
        }
    } 
    TransformAnimation(staticSpeed, v);
    return 1
}

function addLi(name,elementClass,x,v)
{
    var li = document.createElement("li");
    var line = "<span class='{0}'>{1}：({2},{3})</span>".format(elementClass,name,x,v);
    var id="element_{0}_{1}".format(name,elementClass);
    li.innerHTML = line;
    li.setAttribute("id",id);
    //li.setAttribute("style","color : red");
    element_list.appendChild(li);
}

function LiColor(name,elementClass,color)
{
    var id="element_{0}_{1}".format(name,elementClass);
    var li=document.getElementById(id);
    console.log(id);
    style = "color : "+color;
    li.setAttribute("style",style);
}

function delLi(name,elementClass)
{
    var id = "element_{0}_{1}".format(name,elementClass);
    var li=document.getElementById(id);
    element_list.removeChild(li);
}

//处理页面事件
String.prototype.format = function ()//格式化字符串的辅助函数
{    
    if (arguments.length == 0) return this;
    var param = arguments[0];
    var s = this;
    if (typeof (param) == 'object'){
        for (var key in param)
            s = s.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
        return s;
    } else{
        for (var i = 0; i < arguments.length; i++)
            s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return s;
    }
}


//处理页面事件的函数
function button_add_worldline(){//添加世界线
    color = color0_input.value + parseInt(alpha0_input.value).toString(16);
    if(addWorldLine(name_input.value, x_input.value, v_input.value, color))
    {
        var str = "addWorldLine(\"{0}\",{1},{2},\"{3}\")".format(name_input.value, x_input.value, v_input.value, color);
        mycode.push(str);
        Draw();
    }


}

function button_remove_woldline(){//删除世界线
    if(removeWorldLine(name_input.value))
    {
        var str = "removeWorldLine(\"{0}\")".format(name_input.value);
        mycode.push(str);
        Draw();
    }


}

function button_add_axis(){//添加坐标轴
    color0 = color0_input.value + parseInt(alpha0_input.value).toString(16);
    color1 = color1_input.value + parseInt(alpha1_input.value).toString(16);
    if(addAxis(name_input.value, x_input.value, v_input.value, spa2d,color0, color1))
    {
        var str = "addAxis(\"{0}\",{1},{2},{3},\"{4}\",\"{5}\")".format(name_input.value, x_input.value, v_input.value, "spa2d",color0, color1);
        mycode.push(str);
        if (alpha1_input != 0)
        {
            AxisList.get(name_input.value).setshowGrid(true);
            mycode.push("AxisList.get(\"{0}\").setshowGrid(true)".format(name_input.value));
        }
        Draw()
    }

}

function button_remove_axis(){//删除坐标轴
    if(removeAxis(name_input.value))
    {
        Draw();
        var str = "removeAxis(\"{0}\")".format(name_input.value);
        mycode.push(str);
    }
}

function button_change_view(){
    var typeIndex = target_type_input.selectedIndex;
    var elementClass = target_type_input.options[typeIndex].value;
    if(changeViewTo(name_input.value,elementClass))
    {
        var str = "changeViewTo(\"{0}\",\"{1}\")".format(name_input.value,elementClass);
        mycode.push(str);
    }

}
/*
function button_centralize(){
    var typeIndex = target_type_input.selectedIndex;
    var elementClass = target_type_input.options[typeIndex].value;
    centralizeWorldline(name_input.value,elementClass);
    var str = "centralizeWorldline(\"{0}\",\"{1}\")".format(name_input.value,elementClass);
    mycode.push(str);
}
*/
function button_add_light(){//交互式添加光线
    uiPointer("light");
}

function button_add_hyperbola(){//交互式添加校准曲线
    uiPointer("hyperbola");
}

function button_clear_subline(){//清空辅助线
    clearCanvas(bac2d);
    //var str = "clearCanvas(bac2d)";
    //mycode.push(str);
}

function button_clear_all(){//重置画布
    clearCanvas(bac2d);
    AxisList.forEach(element => {
        removeAxis(element.name);
    });
    WorldLineList.forEach(element => {
        removeWorldLine(element.name);
    })
    addAxis("basic",0,0,spa2d);
    staticSpeed = 0;
    mycode=[];
    Draw();
}

function button_output_code()//处理代码输出
{
    code_input.value=mycode.join(";\n")+";";
}

function button_run_code()//运行代码
{
    var code = new Array();
    var codestr = code_input.value;
    code = codestr.split("\n");
    code.forEach(command => {
        eval(command);
    });

}



//添加按钮的页面事件
add_button.onclick = function(){
    var typeIndex = target_type_input.selectedIndex;
    switch (target_type_input.options[typeIndex].value){
        case "worldline":
            button_add_worldline();
            break
        case "axis":
            button_add_axis();
            break
        default:
            break
    }
}

remove_button.onclick = function(){
    var typeIndex = target_type_input.selectedIndex;
    switch (target_type_input.options[typeIndex].value){
        case "worldline":
            button_remove_woldline();
            break
        case "axis":
            button_remove_axis();
            break
        default:
            break
    }
}

changeview_button.onclick = function (){
    button_change_view();
}
/*
centralize_button.onclick = function (){
    button_centralize();
}
*/
addHyperbola_button.onclick = function (){
    button_add_hyperbola();
}

drawLight_button.onclick = function (){
    button_add_light();
}

clearSubline_button.onclick = function (){
    button_clear_subline();
}

clearAll_button.onclick = function (){
    button_clear_all();
}

addtocode_button.onclick = function (){
    button_output_code();
}

run_code_button.onclick = function (){
    button_run_code();
}

//初始化
function init(){
    setPath2D();
    trans_Descartes(bac2d);
    trans_Descartes(spa2d);
    //trans_Descartes(ui2d);
    bac2d.save();
    spa2d.save();
    addAxis("basic",0,0,spa2d);
    AxisList.get("basic").setshowGrid(true);
    Draw();
    //ui2d.save();
}


//主程序

function TrainandPark(){
    //车库佯谬的时空图
    addWorldLine("trainhead",0,0.5,"#0011ffff");
    addWorldLine("traintail",-100,0.5,"#0011ffff");
    addAxis("trainhead",0,0.5,spa2d,"#00ffdd66","#9d71d117");
    AxisList.get("trainhead").setshowGrid(true);
    addWorldLine("parkhead",150,0,"#ff0000ff");
    addWorldLine("parktail",50,0,"#ff0000ff");
    changeViewTo("trainhead","worldline");
}
init()
//justTest()
//TrainandPark()

