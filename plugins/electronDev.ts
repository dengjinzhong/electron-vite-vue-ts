import { ViteDevServer } from "vite";
export let devPlugin = () => {
    return {
        name: "dev-plugin",
        configureServer(server: ViteDevServer) {
            require("esbuild").buildSync({
                entryPoints: ["./src/main/entry.ts"],
                bundle: true,
                platform: "node",
                outfile: "./dist/entry.js",
                external: ["electron"],
            });
            server.httpServer.once("listening", () => {
                let { spawn } = require("child_process");
                let addressInfo = server.httpServer.address();
                let httpAddress = `http://${addressInfo.address}:${addressInfo.port}`;
                let electronProcess = spawn(require("electron").toString(), ["./dist/entry.js", httpAddress], {
                    cwd: process.cwd(),
                    stdio: "inherit",
                });
                electronProcess.on("close", () => {
                    server.close();
                    process.exit();
                });
            });
        },
    };
};