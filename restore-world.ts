import {
    createReadStream,
    createWriteStream,
    readdirSync,
    existsSync,
    mkdirSync,
} from 'fs';
import { join, basename, normalize, dirname } from 'path';
import { Extract, Parse } from 'unzipper';

import type { WorldsConfig } from './archive-world';

export async function restoreWorld(config: WorldsConfig) {
    const worldArchives = readdirSync(config.storageFolder, { withFileTypes: true });
    
    for (const archive of worldArchives) {
        if (archive.isDirectory() || archive.name.startsWith('_additional-files') || config.excludeWorlds.some(name => archive.name.includes(name))) {
            continue;
        }
        const readStream = createReadStream(join(config.storageFolder, archive.name));
        
        let worldFolderName = basename(archive.name, '.zip');
        
        if (config.type == 'bedrock') {
            worldFolderName = basename(worldFolderName, '.mcworld').slice(worldFolderName.lastIndexOf('-') + 1);
        }
        
        // TODO: remove the `+ '_TEST'` from the end of the worlds folder when verified that it worked correctly
        const extractStream = Extract({ concurrency: 5, path: join(config.worldsFolder, worldFolderName + '_TEST') });
        
        await readStream.pipe(extractStream)
            .promise();
    }
    
    const additionalFilesZipPath = join(config.storageFolder, '_additional-files.zip');
    if (config.additionalFiles?.length && existsSync(additionalFilesZipPath)) {
        const readStream = createReadStream(additionalFilesZipPath);
        const rootMinecraftFolder = join(config.worldsFolder, '..');
        
        for await (const item of readStream.pipe(Parse({ forceStream: true }))) {
            const normalizedPath = normalize(item.path);
            if (config.additionalFiles.includes(normalizedPath)) {
                const itemFolder = dirname(normalizedPath);
                const destinationFolder = join(rootMinecraftFolder, itemFolder);
                if (itemFolder != '.' && !existsSync(destinationFolder)) {
                    mkdirSync(destinationFolder, { recursive: true });
                }
                
                item.pipe(createWriteStream(join(rootMinecraftFolder, normalizedPath)));
            }
            else {
                item.autodrain();
            }
        }
    }
}
