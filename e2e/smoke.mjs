// End-to-end smoke test: drives the built app in a headless Chrome through every tool and
// asserts on persisted state, canvas pixels and the DOM layers.
//
//   npm run test:e2e                          builds, starts the server, runs the checks, stops it
//   BASE_URL=http://... node e2e/smoke.mjs    runs against an already running server instead
//   CHROME_PATH=/path/to/chrome               overrides browser discovery
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const PORT = 3017;
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}/`;
/** Mirrors ZOOM.sensitivity in lib/constants.ts. */
const ZOOM_SENSITIVITY = 0.003;
const COLLECTIONS = ["strokes", "texts", "shapes", "stickers"];
const CLEAR_ALL = "button::-p-text(Clear All)";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((path) => existsSync(path));
if (!chrome) {
  console.error("No Chrome found. Set CHROME_PATH to a Chrome or Chromium binary.");
  process.exit(2);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Server lifecycle (skipped when BASE_URL points at a running server) ---
let server = null;
if (!process.env.BASE_URL) {
  if (spawnSync("npx", ["next", "build"], { stdio: "inherit" }).status !== 0) process.exit(1);
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore", detached: true });
  process.on("exit", () => process.kill(-server.pid, "SIGTERM"));
}
for (let attempt = 0; attempt < 120; attempt++) {
  try {
    if ((await fetch(BASE_URL)).ok) break;
  } catch {}
  await sleep(500);
}

// --- Harness ---
const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? `  (${detail})` : ""}`);
};

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

const consoleIssues = [];
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") consoleIssues.push(`${msg.type()}: ${msg.text()}`);
});
page.on("pageerror", (err) => consoleIssues.push(`pageerror: ${err.message}`));

const byLabel = (label) => `[aria-label="${label}"]`;
const has = (selector) => page.$(selector).then((el) => !!el);
const hasLabel = (label) => has(byLabel(label));
const count = (selector) => page.$$eval(selector, (els) => els.length);
const clickLabel = async (label) => {
  await page.waitForSelector(byLabel(label), { timeout: 5000 });
  await page.click(byLabel(label));
  await sleep(60);
};
const clickAt = async (x, y, settle = 80) => {
  await page.mouse.click(x, y);
  await sleep(settle);
};
const drag = async (from, to, steps = 12) => {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  await page.mouse.move(to[0], to[1], { steps });
  await page.mouse.up();
  await sleep(80);
};
const reload = async (settle = 0) => {
  await page.reload({ waitUntil: "networkidle0" });
  if (settle) await sleep(settle);
};
const stored = (key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), key);
const storedAll = async () =>
  Object.fromEntries(await Promise.all(COLLECTIONS.map(async (name) => [name, await stored(`whiteboard:${name}`)])));
const textareaStyle = (prop) => page.$eval("textarea", (el, p) => parseFloat(el.style[p]), prop);
const textareaWidth = () => page.$eval("textarea", (el) => el.getBoundingClientRect().width);
const canvasAlphaAt = (x, y) =>
  page.evaluate(
    (x, y) => {
      const canvas = document.querySelector("canvas");
      const dpr = window.devicePixelRatio;
      return canvas.getContext("2d").getImageData(Math.round(x * dpr), Math.round(y * dpr), 1, 1).data[3];
    },
    x,
    y,
  );

try {
  await page.goto(BASE_URL, { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.clear());
  await reload();

  // --- Toolbar ---
  for (const label of ["Select", "Pen", "Eraser", "Shapes", "Text", "Stickers"]) {
    check(`toolbar has ${label}`, await hasLabel(label));
  }
  check("icons are inline SVG", (await count("button svg path")) >= 4);

  // --- Pen ---
  await clickLabel("Pen");
  check("pen toolbar opens", await hasLabel("Brush size"));
  await drag([400, 300], [600, 400]);
  let strokes = await stored("whiteboard:strokes");
  check("stroke persisted", strokes?.length === 1 && strokes[0].tool === "pen" && strokes[0].points.length > 2);
  check("pen toolbar closes when drawing starts", !(await hasLabel("Brush size")));
  check("stroke pixels painted", (await canvasAlphaAt(500, 350)) > 0);

  // Releasing over the main toolbar must still commit the stroke (pointer capture).
  await drag([400, 500], [640, 770]);
  strokes = await stored("whiteboard:strokes");
  check("stroke released over toolbar still commits", strokes?.length === 2);

  await clickAt(900, 150);
  check("click leaves a dot", (await canvasAlphaAt(900, 150)) > 0);

  // --- Eraser ---
  await clickLabel("Eraser");
  check("eraser toolbar opens", await has(CLEAR_ALL));
  await drag([500, 250], [500, 450]);
  strokes = await stored("whiteboard:strokes");
  check("eraser stroke persisted", strokes?.length === 4 && strokes[3].tool === "eraser");
  check("eraser cleared pixels", (await canvasAlphaAt(500, 350)) === 0);

  // --- Shapes ---
  await clickLabel("Shapes");
  await clickLabel("Circle");
  await drag([200, 200], [300, 300]);
  let shapes = await stored("whiteboard:shapes");
  check("circle shape persisted", shapes?.length === 1 && shapes[0].type === "circle" && Math.round(shapes[0].width) === 100);
  check("circle rendered as an SVG path", await has('svg[data-shape="circle"] path'));
  await clickAt(700, 600);
  shapes = await stored("whiteboard:shapes");
  check("zero-size click adds no shape", shapes?.length === 1);

  await clickLabel("Select");
  await clickAt(250, 250);
  check("shape settings open on select", await hasLabel("Border width"));
  await clickLabel("Border width");
  await clickLabel("Border width 8");
  shapes = await stored("whiteboard:shapes");
  check("border width applied", shapes?.[0]?.borderWidth === 8);
  await clickLabel("Delete shape");
  shapes = await stored("whiteboard:shapes");
  check("shape deleted", shapes?.length === 0 && !(await hasLabel("Border width")));


  // --- Text ---
  await clickLabel("Text");
  await clickAt(500, 200, 120);
  check("new text box focused", await page.evaluate(() => document.activeElement?.tagName === "TEXTAREA"));
  await page.keyboard.type("Hello");
  await sleep(80);
  let texts = await stored("whiteboard:texts");
  check("text persisted", texts?.length === 1 && texts[0].value === "Hello");
  check("text settings open", await hasLabel("Larger text"));
  await clickLabel("Larger text");
  texts = await stored("whiteboard:texts");
  check("font size +1", texts?.[0]?.fontSize === 21);
  await clickLabel("Font");
  await page.click('button[title="Judson"]');
  await sleep(80);
  texts = await stored("whiteboard:texts");
  check("font stored by name", texts?.[0]?.font === "Judson");
  const widthBefore = await textareaWidth();
  await page.focus("textarea");
  await page.keyboard.press("End");
  await page.keyboard.type(" world");
  await sleep(80);
  check("text box grows with content", (await textareaWidth()) > widthBefore);

  await clickLabel("Select");
  await clickAt(1000, 650);
  check(
    "canvas press deselects text",
    !(await hasLabel("Larger text")) && (await page.evaluate(() => document.activeElement?.tagName !== "TEXTAREA")),
  );
  texts = await stored("whiteboard:texts");
  check("blur trimmed value kept", texts?.[0]?.value === "Hello world");

  // --- Stickers ---
  await clickLabel("Stickers");
  await clickLabel("Star");
  await clickAt(700, 300, 150);
  let stickers = await stored("whiteboard:stickers");
  check(
    "sticker placed centered",
    stickers?.length === 1 && stickers[0].src === "/star.png" && Math.round(stickers[0].x) === 650 && Math.round(stickers[0].y) === 250,
  );
  check("sticker wheel stays open while placing", await hasLabel("Star"));
  await sleep(300);
  check("sticker pixels painted", (await canvasAlphaAt(700, 300)) > 0);
  await clickLabel("Select");
  await clickAt(700, 300);
  check("sticker delete handle shows", await hasLabel("Delete sticker"));
  await clickLabel("Delete sticker");
  stickers = await stored("whiteboard:stickers");
  check("sticker deleted", stickers?.length === 0);

  // --- Pan and zoom ---
  const leftBefore = await textareaStyle("left");
  await drag([100, 600], [200, 650]);
  check("pan moves text box", Math.round((await textareaStyle("left")) - leftBefore) === 100);
  // Chrome delivers a different wheel delta than requested, so derive the expectation from what the page saw.
  await page.evaluate(() => {
    window.__wheel = 0;
    window.addEventListener("wheel", (e) => (window.__wheel += e.deltaY));
  });
  await page.mouse.move(640, 400);
  await page.mouse.wheel({ deltaY: -100 });
  await sleep(100);
  const deliveredDelta = await page.evaluate(() => window.__wheel);
  const expectedFontSize = 21 * (1 - deliveredDelta * ZOOM_SENSITIVITY);
  check("zoom scales text box", Math.abs((await textareaStyle("fontSize")) - expectedFontSize) < 0.01);

  // --- Persistence ---
  await reload(200);
  const persisted = await storedAll();
  check("board survives reload", persisted.texts?.length === 1 && persisted.strokes?.length === 4 && (await count("textarea")) === 1);
  check("strokes repaint on load", (await canvasAlphaAt(420, 310)) > 0 && (await canvasAlphaAt(900, 150)) > 0);

  // --- Legacy storage import ---
  const legacy = {
    strokes: [{ penColor: "#ff0000", width: 5, tool: "rubber", points: [{ x: 1, y: 2 }, { x: 3, y: 4 }] }],
    textStrokes: [{ color: "#00ff00", font: "Times New Roman", fontSize: 30, value: "old", points: [{ x: 10, y: 20 }] }],
    shapeStrokes: [{ type: "rhombus", width: 50, height: 60, left: 5, top: 6, color: "#0000ff", borderWidth: 4, borderStyle: "dashed", points: [] }],
    stickerStrokes: [{ src: "/no.png", width: 140, height: 62.5, points: [{ x: 7, y: 8 }], left: 7, top: 8 }],
  };
  await page.evaluate((records) => {
    localStorage.clear();
    for (const [key, value] of Object.entries(records)) localStorage.setItem(key, JSON.stringify(value));
  }, legacy);
  await reload(200);
  const migrated = await storedAll();
  const oldKeysLeft = await page.evaluate((keys) => keys.filter((k) => localStorage.getItem(k) !== null), Object.keys(legacy));
  check(
    "legacy boards imported",
    migrated.strokes?.[0]?.tool === "eraser" &&
      migrated.strokes[0].color === "#ff0000" &&
      !!migrated.strokes[0].id &&
      migrated.texts?.[0]?.x === 10 &&
      migrated.texts[0].font === "Default" &&
      migrated.shapes?.[0]?.x === 5 &&
      migrated.shapes[0].borderStyle === "dashed" &&
      !("points" in migrated.shapes[0]) &&
      migrated.stickers?.[0]?.y === 8 &&
      oldKeysLeft.length === 0,
  );
  check("legacy items render", (await count("textarea")) === 1 && (await has('svg[data-shape="rhombus"]')));

  // --- Every shape type draws, persists and renders as a path ---
  await page.evaluate(() => localStorage.clear());
  await reload();
  const SHAPE_TYPES = ["square", "circle", "rhombus", "triangle", "hexagon", "star", "arrow", "heart"];
  for (const [i, type] of SHAPE_TYPES.entries()) {
    await clickLabel("Shapes"); // drawing closes the transient toolbar, so reopen it for each type
    await clickLabel(type[0].toUpperCase() + type.slice(1));
    await drag([80 + i * 60, 420], [130 + i * 60, 480]);
  }
  shapes = await stored("whiteboard:shapes");
  check(
    "all shape types persist and render",
    shapes?.length === SHAPE_TYPES.length &&
      shapes.every((s, i) => s.type === SHAPE_TYPES[i]) &&
      (await count("svg[data-shape] path")) === SHAPE_TYPES.length,
    `${shapes?.length} shapes, ${await count("svg[data-shape] path")} paths`,
  );

  // --- Clear All ---
  await clickLabel("Eraser");
  await page.click(CLEAR_ALL);
  await sleep(100);
  const afterClear = await storedAll();
  check("clear all empties every collection", Object.values(afterClear).every((list) => list?.length === 0));

  // --- Responsive: no toolbar, popover or button may be cut off at any of these sizes ---
  const VIEWPORTS = [
    { name: "phone", width: 375, height: 667, mobile: true },
    { name: "phone landscape", width: 667, height: 375, mobile: true },
    { name: "small window", width: 800, height: 600 },
    { name: "laptop", width: 1406, height: 755 },
  ];
  const overflowing = () =>
    page.evaluate(() => {
      const { clientWidth: W, clientHeight: H } = document.documentElement;
      const wheel = document.querySelector('[aria-label="Star"]')?.parentElement?.parentElement;
      return [...document.querySelectorAll(".panel, button"), ...(wheel ? [wheel] : [])]
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && (r.left < -0.5 || r.top < -0.5 || r.right > W + 0.5 || r.bottom > H + 0.5))
        .map(({ el }) => el.getAttribute("aria-label") ?? el.className.split(" ")[0]);
    });
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
    const { width: w, height: h } = vp;
    const scenarios = {
      "pen picker": async () => { await clickLabel("Pen"); await clickLabel("Custom color"); },
      "shapes picker": async () => { await clickLabel("Shapes"); await clickLabel("Shape color"); },
      "sticker wheel": async () => { await clickLabel("Stickers"); },
      "text settings": async () => { await clickLabel("Text"); await clickAt(w * 0.15, h * 0.5, 120); await clickLabel("Font"); },
      "shape settings": async () => {
        await clickLabel("Shapes");
        await drag([w * 0.55, h * 0.2], [w * 0.75, h * 0.4]);
        await clickLabel("Select");
        await clickAt(w * 0.65, h * 0.3);
        await clickLabel("Border width");
      },
    };
    for (const [scenario, run] of Object.entries(scenarios)) {
      await page.evaluate(() => localStorage.clear());
      await reload();
      await run();
      const cutOff = await overflowing();
      check(`${vp.name}: ${scenario} fits the screen`, cutOff.length === 0, cutOff.join(", "));
    }
  }

  const realIssues = consoleIssues.filter((issue) => !/favicon/i.test(issue));
  check("no console errors or warnings", realIssues.length === 0, realIssues.join(" | ").slice(0, 500));
} finally {
  await browser.close();
}

const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
