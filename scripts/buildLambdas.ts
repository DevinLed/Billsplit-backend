import * as esbuild from "esbuild";
import * as fs from "fs";
/**
 * TODO
 * 1. Read in all the files from './src/lambdas' automatically (look at fs)
 * 2. Change outdir to 'dist'
 * 3. Verify that we are using the correct tsconfig
 * 4. Replace build:src with the content from build:lambdas and then remove build:lambdas
 * 5. Commit this all
 */
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
