const vidBody = document.getElementById('vid');
const serverUrl = 'http://localhost:5000';
// const serverUrl = 'https://localhost:7097';

const resetElements = async () => {
    const elements = ["canvas", "videoDom", "volumn-control", 'ascii-panel'];
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let dom = document.getElementById(element);
        while (dom != null) {
            dom.remove();
            dom = document.getElementById(element);
        }
    }
}

const skip = (duration, dom) => {
    dom.currentTime += duration;
}

const muteClickEvent = (dom) => {
    dom.muted = !dom.muted;
}

const volumeChangeEvent = (dom, e) => {
    dom.volume = e.target.value;
    dom.muted = e.target.value === 0;
}

const videoBtnClickEvent = (dom) => {
    if (dom) {
        dom.paused ? dom.play() : dom.pause();
    }
}

const theaterClickEvent = () => {
    vidBody.classList.toggle("theater");
}

const miniPlayerClickEvent = (dom) => {
    if (vidBody.classList.contains("mini-player")) {
        document.exitPictureInPicture();
    }
    else {
        dom.requestPictureInPicture();
    }
}

const fullScreenClickEvent = () => {
    if (document.fullscreenElement == null) {
        vidBody.requestFullscreen();
    }
    else {
        document.exitFullscreen();
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
    if (blob != null) {
        const setVideoEvent = (vid) => {
            const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
                minimumIntegerDigits: 2,
            })
            const formatDuration = (time) => {
                const sec = Math.floor(time % 60);
                const min = Math.floor(time / 60) % 60;
                const hrs = Math.floor(time / 3600);
                if (hrs === 0) {
                    return `${min}:${leadingZeroFormatter.format(sec)}`
                } else {
                    return `${hrs}:${leadingZeroFormatter.format(
                        min
                    )}:${leadingZeroFormatter.format(sec)}`
                }
            }
            vid.addEventListener(("click"), (e) => videoBtnClickEvent(e.target));
            vid.addEventListener("enterpictureinpicture", () => {
                vidBody.classList.add('mini-player');
            })
            vid.addEventListener("leavepictureinpicture", () => {
                vidBody.classList.remove('mini-player');
            })
            vid.addEventListener("volumechange", () => {
                const volumnSlider = document.getElementById("volume-slider");
                volumnSlider.value = vid.volume;
                let volumeLevel;
                if (vid.muted || vid.volume === 0) {
                    volumnSlider.value = 0;
                    volumeLevel = "muted";
                }
                else if (vid.volume >= .5) {
                    volumeLevel = "high";
                }
                else {
                    volumeLevel = "low";
                }
                vidBody.dataset.volumeLevel = volumeLevel;
            })
            vid.addEventListener("loadeddata", () => {
                const totalTime = document.getElementById("total-time");
                totalTime.textContent = formatDuration(vid.duration);
            })
            vid.addEventListener("timeupdate", () => {
                const currentTime = document.getElementById("current-time");
                currentTime.textContent = formatDuration(vid.currentTime);
            })
            vid.addEventListener("dblclick", () => fullScreenClickEvent());
        }
        const videoDom = document.createElement("video");
        videoDom.id = "videoDom";
        videoDom.src = URL.createObjectURL(blob);
        videoDom.style.width = "50%";
        videoDom.style.height = "100%";
        setVideoEvent(videoDom);
        vidBody.appendChild(videoDom);
        getButton(videoDom);
        initControls(videoDom);
        initVideoEvents(videoDom);
    }
    else {
        alert("[Error] Wrong url. Please try again!");
    }
    vidBody.classList.remove("loader");
}

const initVideoEvents = (videoDom) => {
    const getAsciiMode = () => {
        const asciiControl = document.getElementById('ascii-control');
        const isChecked = asciiControl.checked;
        return isChecked ? [" ", ".", "-", "+", "*", "c", "o", "b", "&", "8", "#", "@"] : ["@", "#", "8", "&", "b", "o", "c", "*", "+", "-", ".", " "];
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
            canvas.width = videoSize.width;
            canvas.height = videoSize.height;
            canvas.addEventListener(("click"), () => videoBtnClickEvent(videoDom));
            canvas.addEventListener("dblclick", () => fullScreenClickEvent());
            vidBody.appendChild(canvas);
        }
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
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

    videoDom.addEventListener("canplay", () => {
        renderVideoFrame();
    });

    videoDom.addEventListener('play', () => {
        vidBody.classList.remove("paused");

        startRender();
    });

    videoDom.addEventListener('pause', () => {
        vidBody.classList.add("paused");

        stopRender();
    });

    videoDom.addEventListener('ended', () => {
        vidBody.classList.add("paused");

        stopRender();
    });
}

const initControls = () => {
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
        vidControl.style.display = 'flex';
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
    setAsciiControl();
}

const getButton = (dom) => {
    const btnPlayAndPause = document.getElementById("play-pause-btn");
    const miniPlayerBtn = document.getElementById("mini-player-btn");
    const theaterBtn = document.getElementById("theater-btn");
    const fullScreenBtn = document.getElementById("full-screen-btn");
    const muteBtn = document.getElementById("mute-btn");
    const volumnSlider = document.getElementById("volume-slider");
    const currentTime = document.getElementById("current-time");
    const totalTime = document.getElementById("total-time");
    btnPlayAndPause.addEventListener("click", () => videoBtnClickEvent(dom));
    theaterBtn.addEventListener("click", () => theaterClickEvent());
    miniPlayerBtn.addEventListener("click", () => miniPlayerClickEvent(dom));
    fullScreenBtn.addEventListener("click", () => fullScreenClickEvent());
    muteBtn.addEventListener("click", () => muteClickEvent(dom));
    volumnSlider.addEventListener("input", (e) => volumeChangeEvent(dom, e))
}



document.addEventListener("fullscreenchange", () => {
    vidBody.classList.toggle('full-screen', document.fullscreenElement);
})

document.addEventListener("keydown", (e) => {
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === "input") return;

    if (e.key.toLowerCase()) {
        const vid = document.getElementById("videoDom");
        switch (e.key.toLowerCase()) {
            case " ":
                if (tag === "button") return;
            case "k":
                if (vid) {
                    videoBtnClickEvent(vid);
                }
                break;
            case "f":
                fullScreenClickEvent();
                break;
            case "t":
                theaterClickEvent();
                break;
            case "i":
                miniPlayerClickEvent(vid);
                break;
            case "m":
                muteClickEvent(vid);
                break;
            case "arrowleft":
            case "j":
                skip(-5, vid);
                break;
            case "arrowright":
            case "k":
                skip(5, vid);
                break;
        }
    }
})

const searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener("click", async () => await getVideo());

const ResetBtn = document.getElementById('reset-btn');
ResetBtn.addEventListener("click", async () => { await resetElements(); document.getElementById("search-url").value = ''; });

