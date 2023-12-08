import { createServer } from "http";

const RECORDS = 300;

function handleServerInfo(url, response) {
    response.writeHead(200, {
        "Content-Type": "application/json",
    });
    response.write(JSON.stringify({
        capabilities: {
            attachments: {
                base_url: new URL("/attachments/", url.href),
            },
        },
    }));
    response.end();
}

function handleRecords(url, response) {
    console.log(`200 - ${url.pathname}`);
    response.writeHead(200, {
        "Content-Type": "application/json",
        "ETag": `"15"`,
    });
    let records = [];
    for (let i = 1; i <= RECORDS; i++) {
        records.push({
            id: i.toString(10).padStart(4, "0"),
            type: "data",
            last_modified: 15,
            attachment: {
                filename: `data-${i}.json`,
                mimetype: "application/json",
                location: `data-${i}.json`,
                hash: "",
                size: 0,
            },
        });
    }
    response.write(JSON.stringify({
        data: records,
    }));
    response.end();
}

function handleAttachment(url, response) {
    let matches = /^\/attachments\/data\-(\d+)\.json$/.exec(url.pathname);
    if (!matches) {
        throw new Error(`Unexpected GET for ${url}`);
    }
    let id = parseInt(matches[1], 10);
    if (id == 299) {
        console.log(`503 - ${url.pathname}`);
        response.writeHead(503, {
            "Content-Type": "application/json",
        });
        response.end();
        return;
    }
    console.log(`200 - ${url.pathname}`);
    response.writeHead(200, {
        "Content-Type": "application/json",
    });
    response.write(JSON.stringify({
        id,
        advertiser: "Good Place Eats",
        iab_category: "8 - Food & Drink",
        keywords: [`${id}la`, `${id}las`, `${id}lasa`, `${id}lasagna`, `${id}lasagna come out tomorrow`],
        title: `Lasagna Come Out Tomorrow - ${id}`,
        url: `https://www.lasagna.restaurant/${id}`,
        icon: `{$id}-icon`,
        impression_url: `https://example.com/impression_url/${id}`,
        click_url: `https://example.com/click_url/${id}`,
    }));
    response.end();
}

function main() {
    let server = createServer(function(request, response) {
        if (request.method != "GET") {
            throw new Error(`Bad request method: ${request.method}`);
        }
        let url = new URL(request.url, `http://${request.headers.host}`);
        if (url.pathname == "/") {
            handleServerInfo(url, response);
        } else if (url.pathname == "/v1/buckets/main/collections/quicksuggest/records") {
            handleRecords(url, response);
        } else if (url.pathname.startsWith("/attachments/")) {
            handleAttachment(url, response);
        } else {
            throw new Error(`Unexpected GET for ${url}`);
        }
    });
    server.listen(8080);
}

main();
