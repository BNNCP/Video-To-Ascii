const vidBody = document.getElementById('vid');
const serverUrl = 'http://localhost:5000';
// const serverUrl = 'https://localhost:7097';

const resetElements = async () => {
    const elements = ["canvas", "btnPlayAndPause", "videoDom", "volumn-control", 'ascii-panel'];
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let dom = document.getElementById(element);
        while (dom != null) {
            dom.remove();
            dom = document.getElementById(element);
        }
    }
}

const getVideo = async () => {
    const getStreamByUrl = async (_url) => await fetch(`${serverUrl}/getvideo/${_url}`).then(async (response) => {
        console.log(response)
        return await response.blob();
    }).then((data) => (data)).catch((err) => {
        console.log(err);
        return null;
    });

    vidBody.classList.add("loader");
    await resetElements();

    const url = document.getElementById("search-url").value;
    const encodedUrl = encodeURIComponent(url);
    const blob = await getStreamByUrl(encodedUrl);
    console.log(blob);
    if (blob != null) {
        const videoDom = document.createElement("video");
        videoDom.id = "videoDom";
        videoDom.src = URL.createObjectURL(blob);
        videoDom.style.width = "1200px";
        videoDom.style.height = "720px";
        vidBody.appendChild(videoDom);
        const videoBtn = await getButton(videoDom);
        initControls();
        initVideoEvents(videoBtn, videoDom);
    }
    else {
        alert("[Error] Wrong url. Please try again!");
    }
    vidBody.classList.remove("loader");
}

const initVideoEvents = (btn, videoDom) => {
    const getAsciiMode = () => {
        const asciiControl = document.getElementById('ascii-control');
        const isChecked = asciiControl.checked;
        return isChecked ? [" ", "-", "c", "o", "b", "&", "8", "#", "@"] : ["@", "#", "8", "&", "b", "o", "c", "-", " "];
    }
    const renderVideoFrame = () => {
        //const asciiList = ["@", "#", "8", "&", "o", ":", "*", ".", " "];
        const asciiList = getAsciiMode();
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
                ctx.fillStyle = `rgba(${r},${g},${b},1)`;
                ctx.fillText(asciiList[i], w, h);
            }
        }
    }
    var timerId;

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
        btn.innerText = "▶";

        stopRender();
    });

    videoDom.addEventListener('ended', () => {
        console.log("end");
        btn.innerText = "▶";

        stopRender();
    });
}

const initControls = () => {
    const setVolumnControl = () => {
        const setVolumn = (val) => {
            const player = document.getElementById('videoDom');
            if (player) {
                player.volume = val / 100;
            }
        }
        const vidControl = document.getElementById('vid-control');

        const volumnControl = document.createElement("input");
        volumnControl.id = 'volumn-control'
        volumnControl.type = 'range';
        volumnControl.min = 0;
        volumnControl.max = 100;
        volumnControl.step = 1;
        volumnControl.value = 75;
        volumnControl.addEventListener("input", () => setVolumn(volumnControl.value));
        volumnControl.addEventListener("change", () => setVolumn(volumnControl.value));

        vidControl.appendChild(volumnControl);
    }

    const setAsciiControl = () => {
        const setMode = (lbl, val) => {
            if (val) {
                lbl.innerText = '黑底模式'
            }
            else {
                lbl.innerText = '白底模式'
            }
        }

        const vidControl = document.getElementById('vid-control');
        const controlDiv = document.createElement("div");
        controlDiv.style.display = 'flex';
        controlDiv.id = 'ascii-panel';
        const asciiLabel = document.createElement("div");
        asciiLabel.innerText = '黑底模式';
        const asciiControl = document.createElement("input");
        asciiControl.id = 'ascii-control'
        asciiControl.type = 'checkbox';
        asciiControl.checked = true;
        asciiControl.addEventListener("change", () => setMode(asciiLabel, asciiControl.checked));

        vidControl.appendChild(controlDiv);
        controlDiv.appendChild(asciiControl);
        controlDiv.appendChild(asciiLabel);
    }

    setVolumnControl();
    setAsciiControl();
}

const getButton = async (dom) => {
    const btnPlayAndPause = document.createElement("div");
    btnPlayAndPause.id = 'btnPlayAndPause';
    btnPlayAndPause.style.color = "#fff";
    btnPlayAndPause.style.textAlign = "center";
    btnPlayAndPause.style.position = "absolute";
    btnPlayAndPause.style.top = btnPlayAndPause.style.left = "0px";
    btnPlayAndPause.style.width = `${dom.parentNode.clientWidth}px`;
    btnPlayAndPause.style.height = btnPlayAndPause.style.lineHeight = dom.style.height;
    btnPlayAndPause.style.cursor = "pointer";
    btnPlayAndPause.style.fontSize = "50px";
    btnPlayAndPause.style.zIndex = 2;
    btnPlayAndPause.innerText = "▶";
    btnPlayAndPause.addEventListener("click", (e) => videoBtnClickEvent(e.target, dom));
    vidBody.appendChild(btnPlayAndPause);
    return btnPlayAndPause;
}

const videoBtnClickEvent = (btn, dom) => {
    if (btn.innerText === "▶") {
        dom.play();
    } else {
        dom.pause();
    }
}

const searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener("click", async () => await getVideo());

const ResetBtn = document.getElementById('reset-btn');
ResetBtn.addEventListener("click", async () => { await resetElements(); document.getElementById("search-url").value = ''; });