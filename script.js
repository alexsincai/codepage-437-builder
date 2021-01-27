const loadData = () => JSON.parse(localStorage.getItem("cp437-builder"));
const saveData = (data) =>
    localStorage.setItem("cp437-builder", JSON.stringify(data));

const getCssData = (prop) =>
    parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
            `--${prop}`
        ),
        10
    );

const setCssData = (prop, val) =>
    document.documentElement.style.setProperty(`--${prop}`, val);

const mapRange = (v, im = 0, ix = 1, om = 1, ox = 100) =>
    ((v - im) * (ox - om)) / (ix - im) + om;

const processTiles = (data = {}) => ({
    ...data,
    tiles: [...document.querySelectorAll(".symbol")].map((s) => ({
        ...s.dataset,
    })),
});

const updateGraphic = (el) => {
    el.style.backgroundPositionX = `-${el.dataset.x * size}px`;
    el.style.backgroundPositionY = `-${el.dataset.y * size}px`;
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
    updateGraphic(el);
};

let data = loadData() || {};
let last = null;
let canvas = null;

const size = data.size || getCssData("size");
let tilesx = data.tilesx || getCssData("tilesx");
let tilesy = data.tilesy || getCssData("tilesy");

let focal = document.querySelector("#focus");
const target = document.querySelector("#target");

const setup = () => {
    ["tilesx", "tilesy"].forEach((num) =>
        document.querySelector(`#${num}`).addEventListener("change", (e) => {
            const val = parseInt(e.target.value, 10);
            data[num] = val;
            setCssData(num, v);
            saveData(processTiles(data));
        })
    );

    document.querySelectorAll(".symbol").forEach((s, i) => {
        draw(s, i);
        s.addEventListener("click", (e) => {
            last = e.target;

            document.querySelector(
                "#code"
            ).innerText = `chr(${e.target.dataset.code}) # ${e.target.dataset.icon}`;

            focal.style.gridColumnStart = parseInt(e.target.dataset.x, 10) + 1;
            focal.style.gridRowStart = parseInt(e.target.dataset.y, 10) + 1;
        });
    });

    document.querySelector("#holder").addEventListener("mouseover", () => {
        // html2canvas(document.querySelector("#renderer"), {
        //     onrendered: (c) => {
        //         document.querySelector("#output").innerHTML = "";
        //         document.querySelector("#output").append(c);
        //         canvas = c;
        //     },
        // });
        html2canvas(document.querySelector("#renderer")).then((c) => {
            document.querySelector("#output").innerHTML = "";
            document.querySelector("#output").append(c);
            canvas = c;
        });
    });

    target.addEventListener("dragover", (e) => e.preventDefault());
    target.addEventListener("drop", (e) => {
        const r = target.getClientRects()[0];
        let left = r.left;
        let right = r.left + r.width;
        let top = r.top;
        let bottom = r.top + r.height;

        let x = Math.round(mapRange(e.clientX, left, right, 0, tilesx - 1));
        let y = Math.round(mapRange(e.clientY, top, bottom, 0, tilesy - 1));

        focal.style.gridColumnStart = x + 1;
        focal.style.gridRowStart = y + 1;

        last.dataset.x = x;
        last.dataset.y = y;

        updateGraphic(last);
        saveData(processTiles(data));
    });
};

setup();
