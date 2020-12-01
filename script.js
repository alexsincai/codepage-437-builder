const loadData = () => JSON.parse(localStorage.getItem("cp437-builder"));
const saveData = (data) =>
    localStorage.setItem("cp437-builder", JSON.stringify(data));

const getCssData = (prop) =>
    parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(`--${prop}`)
    );

const setCssData = (prop, val) =>
    document.documentElement.style.setProperty(`--${prop}`, val);

const setSliders = () =>
    ["symbolx", "symboly"].forEach((s) =>
        document
            .querySelector(`#${s}`)
            .setAttribute("max", getCssData(s.replace("symbol", "tiles")))
    );

const processTiles = (data = {}) => ({
    ...data,
    tiles: [...document.querySelectorAll(".symbol")].map((s) => ({
        ...s.dataset,
    })),
});

const setTileSize = (prop) => {
    document.querySelector(`#${prop}`).addEventListener("change", (e) => {
        let v = parseInt(e.target.value);
        setCssData(prop, v);
        data[prop] = v;
        saveData(processTiles(data));
        setSliders();
    });
    setSliders();
};

const setSymbol = (e) => {
    last = e.target;
    document.querySelector("#symbolx").value = last.dataset.x;
    document.querySelector("#symboly").value = last.dataset.y;

    document.querySelector("#code").innerText = last.dataset.code;

    let span = document.querySelector("#holder span");
    span.style.gridColumnStart = parseInt(last.dataset.x, 10) + 1;
    span.style.gridRowStart = parseInt(last.dataset.y, 10) + 1;
};

const draw = (el, i) => {
    if (data.tiles && data.tiles[i] && data.tiles[i].x) {
        if (parseInt(data.tiles[i].x, 10) !== parseInt(el.dataset.x, 10)) {
            el.dataset.x = data.tiles[i].x;
        }
    }
    if (data.tiles && data.tiles[i] && data.tiles[i].y) {
        if (parseInt(data.tiles[i].y, 10) !== parseInt(el.dataset.y, 10)) {
            el.dataset.y = data.tiles[i].y;
        }
    }

    let s = size + 1;

    el.style.backgroundPositionX = `-${parseInt(el.dataset.x, 10) * s}px`;
    el.style.backgroundPositionY = `-${parseInt(el.dataset.y, 10) * s}px`;
};

const updateSymbol = (e) => {
    let prop = e.target.id.replace("symbol", "");
    last.dataset[prop] = Math.max(0, parseInt(e.target.value, 10) - 1);

    saveData(processTiles(data));
    draw(last);

    let span = document.querySelector("#holder span");
    if (prop === "x") {
        span.style.gridColumnStart = e.target.value;
    } else {
        span.style.gridRowStart = e.target.value;
    }
};

let data = loadData() || {};
let last = null;
let canvas = null;

const size = data.size || getCssData("size");
let tilesx = data.tilesx || getCssData("tilesx");
let tilesy = data.tilesy || getCssData("tilesy");

["tilesx", "tilesy"].forEach((p) => setTileSize(p));

["symbolx", "symboly"].forEach((s) =>
    document.querySelector(`#${s}`).addEventListener("change", updateSymbol)
);

document.querySelectorAll(".symbol").forEach((s, i) => {
    draw(s, i);
    s.addEventListener("click", setSymbol);
});

document.querySelector("#holder").addEventListener("mouseover", () => {
    html2canvas(document.querySelector("#renderer"), {
        onrendered: (c) => {
            document.querySelector("#output").innerHTML = "";
            document.querySelector("#output").append(c);
            canvas = c;
        },
    });
});

document.querySelector("#renderlink").addEventListener("click", (e) => {
    let imagedata = canvas.toDataURL("image/png");
    let newdata = imagedata.replace(
        /^data:image\/png/,
        "data:application/octet-stream"
    );
    e.target.setAttribute("download", "testfont.png");
    e.target.setAttribute("href", newdata);
});
