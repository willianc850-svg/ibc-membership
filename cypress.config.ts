import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    chromeWebSecurity: false,
    setupNodeEvents(on) {
      on("task", {
        lerPlanilha(caminho: string) {
          const XLSX = require("xlsx");
          const wb = XLSX.readFile(caminho);
          return {
            abas: wb.SheetNames as string[],
            resumo: XLSX.utils.sheet_to_json(wb.Sheets.Resumo, { header: 1 }),
          };
        },
        apagarArquivo(caminho: string) {
          const fs = require("fs");
          if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
          return null;
        },
      });
    },
  },
});
