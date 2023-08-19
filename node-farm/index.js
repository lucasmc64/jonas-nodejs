const fs = require("fs");
const http = require("http");
const url = require("url");

const slugify = require("slugify");

const replaceTemplate = require("./modules/replaceTemplate");

//////////////////////////////////////
// FILES

// Blocking, synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);
// const textOut = `This is what we know about avocado: ${textIn}\nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written!");

// Non-blocking, asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (error, data1) => {
//   if (error) return console.log("ERROR!");

//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (error, data2) => {
//     console.log(data2);

//     fs.readFile("./txt/append.txt", "utf-8", (error, data3) => {
//       console.log(data3);

//       fs.writeFile(
//         "./txt/final.txt",
//         `${data2}\n${data3}`,
//         "utf-8",
//         (error) => {
//           console.log("Your file has been written :)");
//         },
//       );
//     });
//   });
// });

//////////////////////////////////////
// SERVER

const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8",
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8",
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8",
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const slugs = dataObj.map((element) =>
  slugify(element.productName, { lower: true }),
);

console.log(slugs);

const server = http.createServer((request, response) => {
  const { query, pathname: pathName } = url.parse(request.url, true);

  if (pathName === "/" || pathName === "/overview") {
    // Overview page

    const cardsHtml = dataObj
      .map((product) => replaceTemplate(templateCard, product))
      .join("");

    const output = templateOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    response.writeHead(200, {
      "Content-type": "text/html",
    });
    response.end(output);
  } else if (pathName === "/product") {
    // Product page
    const product = dataObj[query.id];
    const output = replaceTemplate(templateProduct, product);

    response.writeHead(200, {
      "Content-type": "text/html",
    });

    response.end(output);
  } else if (pathName === "/api") {
    // API
    response.writeHead(200, {
      "Content-type": "application/json",
    });
    response.end(data);
  } else {
    // Not found
    response.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });

    response.end("Page not found!");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
