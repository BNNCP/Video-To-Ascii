const vidBody = document.getElementById('vid');
const serverUrl = ' http://localhost:5000';

const videos = new Map([
    ["Bad Apple", "../src/BadApple.mp4"],
    ["Baka Mitai", "../src/BakaMitai.mp4"]
])

const getVideo = async () => {
    const getStreamByUrl = async (_url) => await fetch(`${serverUrl}/getvideo/${_url}`).then(async (response) => await response.blob());
    const resetElements = (_elements) => elements.forEach(i => {
        let dom = document.getElementById(i);
        while (dom != null) {
            dom.remove();
            dom = document.getElementById(i);
        }
    })

    const elements = ["canvas", "btnPlayAndPause", "videoDom"];
    resetElements(elements);

    const url = document.getElementById("search-url").value;
    const encodedUrl = encodeURIComponent(url);
    const blob = await getStreamByUrl(encodedUrl);
    const videoDom = document.createElement("video");
    videoDom.id = "videoDom";
    videoDom.src = URL.createObjectURL(blob);
    videoDom.style.width = "1200px";
    videoDom.style.height = "720px";

    var timeId;
    const videoBtn = getButton(videoDom);
    initVideoEvents(timeId, videoBtn, videoDom);
    videoBtn.addEventListener("click", (e) => videoBtnClickEvent(e.target, videoDom));
}

const initVideoEvents = (timerId, btn, videoDom) => {
    const renderVideoFrame = () => {
        const asciiList = ["@", "#", "8", "&", "o", ":", "*", ".", " "];
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
            vidBody.appendChild(videoDom);
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
                ctx.fillStyle = `rgb(${r},${g},${b})`;
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
    btnPlayAndPause.id = 'btnPlayAndPause';
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

const searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener("click", async () => await getVideo());