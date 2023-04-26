# Electron + Vue3 + TS + Vite 桌面应用开发
# 项目初体验
## 初始化项目
在项目安装之前先确定环境配置，当前环境使用的是
```shell
node -v
v16.19.0
npm -v
8.19.3
npm install -g yarn
yarn config set registry http://registry.npm.taobao.org/
npm install pnpm -g
pnpm config set registry https://registry.npmmirror.com/
```
通过 vite 提供的脚手架命令初始化项目, 这里使用 pnpm 进行初始化
```shell
# npm 6.x
npm create vite@latest electron-vite-vue-ts --template vue-ts
# npm 7+
npm create vite@latest electron-vite-vue-ts -- --template vue-ts
# yarn
yarn create vite electron-vite-vue-ts --template vue-ts
# pnpm
pnpm create vite electron-vite-vue-ts --template vue-ts
```
修改版本信息与配置 package.json
```json
{
  "name": "electron-vite-vue-ts",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.1.0",
    "electron": "^24.1.2",
    "typescript": "^5.0.2",
    "vite": "^4.3.2",
    "vue": "^3.2.47",
    "vue-tsc": "^1.4.2"
  }
}

```
安装依赖并运行
```shell
pnpm install
pnpm run dev
```
## electron 环境准备
安装 electron，因为国内网络环境问题大概率会安装失败，如果安装失败可以设置淘宝镜像源
```shell
pnpm config set electron_mirror "https://npm.taobao.org/mirrors/electron/"
pnpm add electron -D
```
## 创建主进程
```ts
//src\main\entry.ts
import { app, BrowserWindow } from "electron";

let mainWindow: BrowserWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(process.argv[2]);
});
```
## 开发环境 Vite 插件
```ts
//plugins\electronDev.ts
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
```
使用插件
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { devPlugin } from "./plugins/electronDev";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [devPlugin(), vue()],
})
```
## 运行项目
```shell
pnpm run dev
```
# 项目结构优化