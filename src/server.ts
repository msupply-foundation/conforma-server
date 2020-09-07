import fastify from "fastify";
import path from "path";
import { loadActionPlugins } from "./components/postgresConnect";
import { saveFiles, getFilename, createFilesFolder, filesFolderName } from "./components/fileHandler";
import getAppRootDir from "./components/getAppRoot";

// Bare-bones Fastify server

const startServer = async () => {
  await loadActionPlugins(); // Connects to Database and listens for Triggers

  createFilesFolder();

  const server = fastify();

  server.register(require("fastify-static"), {
    root: path.join(getAppRootDir(), filesFolderName),
  });

  server.register(require("fastify-multipart"));

  // File download endpoint (get by Database ID)
  server.get("/file", async function (request: any, reply: any) {
    const filename = await getFilename(request.query.id);
    // TO-DO Check for permission to access file
    return reply.sendFile(filename);
  });

  // File upload endpoint
  server.post("/upload", async function (request: any, reply) {
    // TO-DO: Check if logged in
    const data = await request.files();
    await saveFiles(data, request.query);
    reply.send();
  });

  server.get("/", async (request, reply) => {
    console.log("Request made");
    return "This is the response\n";
  });

  server.listen(8080, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });

  // Fastify TO DO:
  //  - Serve actual bundled React App
  //  - Authentication endpoint
  //  - Endpoint for file serving
  //  - etc...
};

startServer();

// Just for testing
// setTimeout(() => console.log(actionLibrary, actionSchedule), 3000);
