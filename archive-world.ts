import {
    statSync,
    readdirSync,
    existsSync,
    mkdirSync,
    copyFile,
    readFileSync,
    createWriteStream,
    rmSync,
} from 'fs';
import { join, basename } from 'path';
import { promisify } from 'util';
import archiver, { Archiver } from 'archiver';

export interface WorldsConfig {
    type: 'bedrock'|'java';
    name: string;
    worldsFolder: string;
    storageFolder: string;
    excludeWorlds?: string[];
    excludeServers?: string[];
    conflictResolution: 'ask'|'overwrite-storage'|'overwrite-local';
    additionalFiles?: string[];
}

const rootTempFolder = join(process.platform == 'win32' ? process.env.TEMP : '/tmp', 'minecraft-syncer');

export async function archiveWorld(config: WorldsConfig) {
    const worldFolders = readdirSync(config.worldsFolder, { withFileTypes: true })
        // ensure that Mac-specific config dir does NOT get archived, too...
        .filter(w => w.isDirectory() && w.name != '.DS_Store');
    
    const tempFolder = join(rootTempFolder, config.name);
    
    if (!existsSync(tempFolder)) {
        mkdirSync(tempFolder, { recursive: true });
    }
    
    const archivesToMove: string[] = [];
    
    for (const folder of worldFolders) {
        const archivePath = await new Promise<string>((resolve, reject) => {
            if (!folder.isDirectory() || config.excludeWorlds.includes(folder.name)) return resolve(null);
            
            const archiveStream = archiver('zip', {
                zlib: { level: 9 },
            });
            
            const worldFolderPath = join(config.worldsFolder, folder.name);
            
            let worldName = '';
            let worldExtension = '';
            
            if (config.type == 'bedrock') {
                worldName = `${readFileSync(join(worldFolderPath, 'levelname.txt'), 'utf-8')}-${folder.name}`;
                worldExtension = 'mcworld';
            }
            else {
                worldName = folder.name;
                worldExtension = 'zip';
            }
            
            const outputPath = join(tempFolder, `${worldName}.${worldExtension}`);
            const outputStream = createWriteStream(outputPath);
            
            outputStream.on('close', () => {
                resolve(outputPath);
            });
            
            archiveStream.on('warning', (err) => {
                if (err.code == 'ENOENT') {
                    console.warn(err);
                }
                else {
                    console.error(err);
                    reject(err);
                }
            });
            
            archiveStream.on('error', (err) => {
                console.error(err);
                reject(err);
            });
            
            archiveStream.pipe(outputStream);
            
            archiveDir(archiveStream, worldFolderPath);
            
            archiveStream.finalize();
        });
        
        if (!archivePath) {
            continue;
        }
        
        archivesToMove.push(archivePath);
    }
    
    if (config.additionalFiles?.length) {
        const minecraftRootFolder = join(config.worldsFolder, '..');
        const archivePath = await new Promise<string>((resolve, reject) => {
            const archiveStream = archiver('zip', {
                zlib: { level: 9 },
            });
            const outputPath = join(tempFolder, '_additional-files.zip');
            const outputStream = createWriteStream(outputPath);
            
            outputStream.on('close', () => {
                resolve(outputPath);
            });
            
            archiveStream.on('warning', (err) => {
                if (err.code == 'ENOENT') {
                    console.warn(err);
                }
                else {
                    console.error(err);
                    reject(err);
                }
            });
            
            archiveStream.on('error', (err) => {
                console.error(err);
                reject(err);
            });
            
            archiveStream.pipe(outputStream);
            
            for (const relativeFilePath of config.additionalFiles) {
                const fullFilePath = join(minecraftRootFolder, relativeFilePath);
                
                const stats = statSync(fullFilePath);
                if (stats.isDirectory()) {
                    archiveStream.directory(fullFilePath, relativeFilePath);
                }
                else {
                    archiveStream.file(fullFilePath, { name: relativeFilePath });
                }
            }
            
            archiveStream.finalize();
        });
        
        if (archivePath) {
            archivesToMove.push(archivePath);
        }
    }
    
    for (const archivePath of archivesToMove) {
        if (!existsSync(config.storageFolder)) {
            mkdirSync(config.storageFolder, { recursive: true });
        }
        
        await promisify(copyFile)(archivePath, join(config.storageFolder, basename(archivePath)));
        rmSync(archivePath);
    }
}

function archiveDir(archiveStream: Archiver, fullPath: string) {
    const worldContents = readdirSync(fullPath, { withFileTypes: true });
    
    for (const item of worldContents) {
        if (item.isDirectory()) {
            archiveStream.directory(join(fullPath, item.name), item.name);
        }
        else {
            const itemPath = join(fullPath, item.name);
            // preserve the item date for syncing purposes
            const itemDate = statSync(itemPath).mtime;
            archiveStream.file(itemPath, { name: item.name, date: itemDate });
        }
    }
}
