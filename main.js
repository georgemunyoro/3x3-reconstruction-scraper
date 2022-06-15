const puppeteer = require("puppeteer");
const { joinImages } = require("join-images");
const fs = require("fs");

const links = [
  "https://speedcubedb.com/r/index?search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=2",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=3",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=4",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=5",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=6",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=7",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=8",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=9",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=10",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=11",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=12",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=13",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=14",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=15",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=16",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=17",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=18",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=19",
  // "https://speedcubedb.com/r/index/?&search=&orderby=None&sortbyorder=asc&cfop=on&3x3=on&official=on&page=20",
];

const run = async () => {
  const browser = await puppeteer.launch();

  for (let link of links) {
    const page = await browser.newPage();
    await page.goto(link);
    const ids = await page.$$eval("a.recontable-line", (elements) =>
      elements.map((item) => item.getAttribute("href").slice(3))
    );
    await page.close();

    for (let id of ids) {
      await fetchRecon(id, browser);
    }
  }

  await browser.close();
};

const fetchRecon = async (id, browser) => {
  const page = await browser.newPage();
  await page.goto(`https://speedcubedb.com/r/${id}`);
  await page.waitForSelector(
    "body > div:nth-child(4) > div.row.recon-container > div.col-12.col-md-6.recon-right > div:nth-child(2)"
  );

  const solve_info = await page.$(
    "body > div:nth-child(4) > div.row.recon-container > div.col-12.col-md-6.recon-right > div.d-flex.justify-content-end"
  );
  await solve_info.evaluate((e) => (e.style.display = "none"));

  const recon_nav = await page.$(
    "body > div:nth-child(4) > div:nth-child(1) > div"
  );
  await recon_nav.evaluate((e) => (e.style.display = "none"));

  const el = await page.$(
    "body > div:nth-child(4) > div.row.recon-container > div.col-12.col-md-6.recon-right > div:nth-child(2)"
  );

  let { x, y, width, height } = await el.boundingBox();
  x -= 10;
  width += 10;
  height /= 2;

  const container = await page.$(
    "body > div:nth-child(4) > div.row.recon-container > div.col-12.col-md-6.recon-right"
  );
  await container.evaluate((c) => (c.style.backgroundColor = "white"));

  await page.screenshot({
    path: `shots/${id}-recon.png`,
    clip: {
      x,
      y,
      width,
      height,
    },
  });

  const solver_info = await page.$(
    "body > div:nth-child(4) > div.row.recon-container > div.col-12.col-md-6.recon-left > div:nth-child(1)"
  );
  await solver_info.screenshot({
    path: `shots/${id}-solver_info.png`,
  });

  joinImages([`shots/${id}-solver_info.png`, `shots/${id}-recon.png`], {
    direction: "horizontal",
    color: "#ffffff",
    offset: 25,
    margin: 10,
  })
    .then((img) => img.toFile(`shots/${id}.png`))
    .then(() => {
      fs.rmSync(`shots/${id}-solver_info.png`);
      fs.rmSync(`shots/${id}-recon.png`);
    });

  await page.close();
};

run();
