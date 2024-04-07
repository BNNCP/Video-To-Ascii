const vidBody = document.getElementById('vid');

const videos = new Map([
    ["Bad Apple", "../src/BadApple.mp4"],
])

const getVideo = () => {
    const returnDom = document.createElement("video");
    returnDom.src = videos.get("Bad Apple");
    returnDom.style.width = "635px";
    returnDom.style.height = "360px";
    return returnDom;
}

const initVideoEvents = (timerId, btn) => {
    const renderVideoFrame = () => {
        const asciiList = ["b", "n", "c", "p", "　"];
        const scale = parseInt(videoDom.videoHeight / parseFloat(videoDom.style.height));
        const gap = 12 / scale;
        const videoSize = { width: parseFloat(videoDom.videoWidth), height: parseFloat(videoDom.videoHeight) };
        let canvas = document.getElementById("canvas");

        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "canvas";
            canvas.style.width = videoDom.style.width;
            canvas.style.height = videoDom.style.height;
            canvas.style.zIndex = 1;
            canvas.style.left = canvas.style.top = "0";
            canvas.width = videoSize.width;
            canvas.height = videoSize.height;
            vidBody.appendChild(canvas);
        }

        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoDom, 0, 0, videoSize.width, videoSize.height);

        const imgData = ctx.getImageData(0, 0, videoSize.width, videoSize.height).data;
        ctx.clearRect(0, 0, videoSize.width, videoSize.height);
        ctx.font = gap + "px Verdana";
        for (let h = 0; h < videoSize.height; h += gap) {
            for (let w = 0; w < videoSize.width; w += gap) {
                const position = (videoSize.width * h + w) * 4;
                const r = imgData[position],
                    g = imgData[position + 1],
                    b = imgData[position + 2];
                const gray = (r * 30 + g * 59 + b * 11 + 50) / 100;
                const i = Math.min(asciiList.length - 1, parseInt(gray / (255 / asciiList.length)));
                ctx.fillText(asciiList[i], w, h);
            }
        }
    }

    const updateRender = () => {
        renderVideoFrame();
        timerId = window.requestAnimationFrame(updateRender);
    }
    const startRender = () => {
        timerId = window.requestAnimationFrame(updateRender);
    }
    const stopRender = () => {
        window.cancelAnimationFrame(timerId);
    }

    videoDom.addEventListener("canplay", () => renderVideoFrame());

    videoDom.addEventListener('play', () => {
        console.log("play");
        btn.innerText = "";

        startRender();
    });

    videoDom.addEventListener('pause', () => {
        console.log("pause");
        btn.innerText = "play";

        stopRender();
    });

    videoDom.addEventListener('ended', () => {
        console.log("end");
        btn.innerText = "play";

        stopRender();
    });
}

const getButton = (dom) => {
    var btnPlayAndPause = document.createElement("div");
    btnPlayAndPause.style.color = "#fff";
    btnPlayAndPause.style.textAlign = "center";
    btnPlayAndPause.style.position = "absolute";
    btnPlayAndPause.style.top = btnPlayAndPause.style.left = "0px";
    btnPlayAndPause.style.width = dom.style.width;
    btnPlayAndPause.style.height = btnPlayAndPause.style.lineHeight = dom.style.height;
    btnPlayAndPause.style.cursor = "pointer";
    btnPlayAndPause.style.fontSize = "50px";
    btnPlayAndPause.style.zIndex = 2;
    btnPlayAndPause.innerText = "play";
    vidBody.appendChild(btnPlayAndPause);
    return btnPlayAndPause;
}

const videoBtnClickEvent = (btn, dom) => {
    if (btn.innerText === "play") {
        dom.play();
    } else {
        dom.pause();
    }
}

const videoDom = getVideo();
var timeId;
const videoBtn = getButton(videoDom);
initVideoEvents(timeId, videoBtn);
videoBtn.addEventListener("click", (e) => videoBtnClickEvent(e.target, videoDom));