const { exec } = require("child_process");
const packageJson = require("./package.json");

const packages = Object.keys(packageJson.dependencies)
  .map(
    (dependency) => `${dependency}@${[packageJson.dependencies[dependency]]}`
  )
  .join(" ");

exec(`npm install ${packages}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Output:\n${stdout}`);
});
