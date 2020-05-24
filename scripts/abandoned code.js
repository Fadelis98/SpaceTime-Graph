
function backgroundAnimation(begin, end, now) {
    now = begin
    var draw = function (time) {
        clearCanvas(bac2d)
        //DrawBackground("#11111111", "black")
        bac2d.save()
        Lorentz_transform(begin, bac2d)
        DrawBackground("#0055AA11", "#111111AA", bac2d)
        bac2d.restore()
        bac2d.save()
        Lorentz_transform(now, bac2d)
        DrawBackground("#0055AAAF", "black", bac2d)
        bac2d.restore()
        now += 0.005;
        if (now <= end + 0.001) {
            raf = window.requestAnimationFrame(draw);
        }
        else {
            window.cancelAnimationFrame(raf);
        }
    }
    draw()
}

function worldLineAnimation(begin, end, now, beginColor = "grey", endColor = "blue") {
    now = begin
    var draw = function (time) {
        clearCanvas(spa2d)
        //DrawWorldLine(0.3,"orange")
        spa2d.save()
        Lorentz_transform(begin, spa2d)
        DrawWorldLine(begin, beginColor, spa2d)
        spa2d.restore()
        spa2d.save()
        Lorentz_transform(now, spa2d)
        DrawWorldLine(begin, endColor, spa2d)
        //DrawBackground(now,"grey",spa2d)
        spa2d.restore()
        now += 0.005;
        if (now <= end + 0.001) {
            wl = window.requestAnimationFrame(draw);
        }
        else {
            window.cancelAnimationFrame(wl);
        }
    }
    draw()
}
function start_animate(duration,animate,TransParameters) {
    //按指定速度执行动画
    var requestID;
    var startTime = null;
    var time;
    var distance = TransParameters.end - TransParameters.begin
    var frame = function (time) {
        time = new Date().getTime(); //millisecond-timstamp
        if (startTime === null) {
            startTime = time;
        }
        var progress = time - startTime;

        if (progress < duration) {
            TransParameters.now = progress/duration * 1000
            //animate(TransParameters)
            spa2d.beginPath();
            spa2d.arc(TransParameters.now,100,30, 0, Math.PI * 2, true);
            spa2d.closePath();
            spa2d.fill();
            requestID = requestAnimationFrame(frame);
        }
        else {
            cancelAnimationFrame(requestID);
        }
        requestID = requestAnimationFrame(frame);
    }
    frame();
}
