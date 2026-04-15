// This Vite config file (vite.config.js) tells Rollup (production bundler) 
// to treat multiple HTML files as entry points so each becomes its own built page.

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                login: resolve(__dirname, "login.html"),
                account: resolve(__dirname, "account.html"),
                bcplacemap: resolve(__dirname, "BC_Place_map.html"),
                congestion: resolve(__dirname, "congestion.html")
            }
        }
    }
});
