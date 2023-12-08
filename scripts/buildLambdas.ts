import * as esbuild from "esbuild";
import * as fs from "fs";

const lambdaDirectory = "./src/lambdas";
const lambdaFiles = fs
  .readdirSync(lambdaDirectory)
  .filter((file) => file.endsWith(".ts"))
  .map((file) => `./${lambdaDirectory}/${file}`);

async function build() {
  await esbuild.build({
    entryPoints: lambdaFiles,
    bundle: true,
    platform: "node",
    outdir: "dist",
    tsconfig: "./tsconfig.src.json",
  });
}

build().then(() => "Done building");
