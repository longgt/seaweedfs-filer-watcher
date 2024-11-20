require("dotenv").config();

const path = require("node:path");
const fs = require("node:fs");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const FILER_PROTO = path.join(__dirname, "proto", "filer.proto");
const LAST_WATCH_DT = path.join(__dirname, ".lastwatch");
const MILI_TO_NANO = 1000000;
const packageDefinition = protoLoader.loadSync(FILER_PROTO, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const filerProtobuf = grpc.loadPackageDefinition(packageDefinition).filer_pb;
const credentials = grpc.credentials.createInsecure();

const client = new filerProtobuf.SeaweedFiler(
  process.env.FILER_GRPC_ADDRESS,
  credentials,
);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function updateLastWatchDt() {
  fs.writeFileSync(
    LAST_WATCH_DT,
    (new Date().getTime() * MILI_TO_NANO).toString()
  );
}

(async () => {
  let lastWatchDateTime = new Date().getTime() * MILI_TO_NANO;
  if (fs.existsSync(LAST_WATCH_DT)) {
    lastWatchDateTime = Number(fs.readFileSync(LAST_WATCH_DT).toString());
  }
  const payload = {
    clientName: process.env.FILER_WATCHER_CLIENT_NAME,
    clientId: getRandomInt(1000000),
    pathPrefix: process.env.FILER_WATCHER_PATH_PREFIX,
    sinceNs: lastWatchDateTime,
  };
  const stream = client.subscribeMetadata(payload);

  const mapEntry = (filerEntry) => {
    if (!filerEntry) {
      return filerEntry;
    }
    return {
      name: filerEntry.name,
      isDirectory: filerEntry.isDirectory,
      attributes: filerEntry.attributes,
    };
  }

  stream.on("data", function (data) {
    const eventNotification = data.eventNotification;
    console.log({
      directory: data.directory.replace(
        process.env.FILER_WATCHER_PATH_PREFIX,
        ""
      ),
      lastUpdate: new Date(data.tsNs / MILI_TO_NANO),
      eventNotification: {
        oldEntry: mapEntry(eventNotification.oldEntry),
        newEntry: mapEntry(eventNotification.newEntry),
      },
    });
    updateLastWatchDt();
  });

  stream.on("error", function (err) {
    console.error(err);
  });

  stream.on("end", function () {
    console.log("End of stream");
  });
})();
