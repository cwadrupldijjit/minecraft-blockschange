import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { archiveWorld } from './archive-world.js';
import { restoreWorld } from './restore-world.js';

let configFolder = 'minecraft-syncer';

if (process.platform == 'win32') {
    configFolder = join(process.env.APPDATA, configFolder);
}
else if (process.platform == 'darwin') {
    // come up with a different location; possibly the packaged app's folder, though that might then apply to all users...
    configFolder = join(process.env.HOME, `.${configFolder}`);
}
else {
    configFolder = join(process.env.HOME, `.${configFolder}`);
}

if (!existsSync(configFolder)) {
    mkdirSync(configFolder);
}

const configFile = join(configFolder, 'sync.json');

if (!existsSync(configFile)) {
    writeFileSync(configFile, '[]');
}

const configs = JSON.parse(readFileSync(configFile, 'utf-8'));

if (!configs.length) {
    // TODO: Change this into a prompt of some kind; refer to the default directories below for ideas on how to handle this in future
    console.log('Nothing to sync');
    process.exit(0);
}

console.log(configs);

if (process.argv.includes('--export') || process.argv.includes('-e')) {
    for (const config of configs) {
        await archiveWorld(config)
    }
}
else if (process.argv.includes('--import') || process.argv.includes('-i')) {
    for (const config of configs) {
        await restoreWorld(config);
    }
}

// Default location for bedrock files is: C:\Users\<Username>\AppData\Local\Packages\Microsoft.MinecraftUWP_<somehash>\LocalState\games\com.mojang.default
// Default location for java files is:
//   - (Windows) C:\Users\<Username>\AppData\Roaming\.minecraft
//   - (Mac) /Users/<Username>/Library/Application Support/minecraft
//   - (Linux) /home/<Username>/.minecraft
