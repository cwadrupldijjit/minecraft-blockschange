# Blockschange

Do you use more than one computer and have a single-player Minecraft world you don't want to go to all the trouble of setting up a realm just to access it everywhere?  Or are you tired of having to remember what your settings were on your other machine and have to set them up just right on your new one?  Or do you just want to copy everything from your old computer to a new one?  What about backing up worlds?

These are a few of the concerns that I struggle with all the time, and so I made a way to automate it.

What this process does is fairly simple:

- Your world is synced from your worlds folder, zipped up, and saved to the destination that you want, or
- Your backed-up world is extracted from the destination you want into your worlds folder

This by itself is quite nice and can be just used for backing up your worlds/settings to somewhere on your own computer if you're making changes that might overwrite those.  But then consider possibly putting those files on a flash drive or external harddrive and move them between devices.  Even better?  Store the backups in a cloud storage location on your current computer.  In that case, anywhere you have those files being synced to will also have your Minecraft worlds.

Interested in how to get this set up on your machine?

Keep reading to find out!

> **Note:** This is still a WIP and the way you use it will likely change as features are added, but the core of the process is there.  Look for the section below called "Future Improvements"

## Setup

To start, you will need to have the following installed on your machine:

- [Node.js](https://nodejs.org) (version 16 or later)
  - You will have to be sure that NPM is installed with it, otherwise you'll have to install that separately
- Minecraft Bedrock (Windows only) and/or Java (Cross-platform) Editions

The process will be run in your computer's terminal.  After Node is installed, it should be available from the terminal (as long as you allowed it to be installed in your PATH if prompted).

To open your terminal, here is the suggested base applications per platform:
- Windows - PowerShell (search your computer by pressing <kbd>Windows</kbd> + <kbd>S</kbd> and typing "PowerShell" in)
- Mac - Terminal (search your computer by pressing <kbd>Cmd</kbd> + <kbd>Space</kbd> and typing "Terminal" in)
- Linux - Any terminal/console for your computer that you have--it changes per distro or preference

> **Note:** From this point on, most of the commands should work cross-platform, but if it doesn't, it will be annotated.

Extract the downloaded `.zip` file containing the code to your home directory:
- Windows: `C:/Users/<your-username>/minecraft-syncer`
- Mac: `/Users/<your-username>/minecraft-syncer`
- Linux: `/home/<your-username>/minecraft-syncer`

Navigate in your console by using the following command:

```bash
cd ~/minecraft-syncer
```

> **Note:** If you're on Windows and using command prompt (`cmd`) instead of PowerShell, you can navigate using `cd %HOME%\minecraft-syncer` (be careful of the slashes)

If you type in `ls` and press <kbd>Enter</kbd> (or <kbd>return</kbd>), you should see several files including `index.ts` and `package.json`.  If you do, you're in the right place.

Now type:

```bash
npm install
```

... and wait for the process to finish, where it will let you type in the command line again.  If you see output saying either "up to date" or "installed `x` packages" with no `npm ERR` output, then you should know it ran correctly.  If it doesn't, there might be a different problem that is preventing you from running it and feel free to add an issue asking about it with your system information and which terminal you used to try to install it.

The last step before the syncer can do its thing is to add a configuration for your worlds.  This means going to the following locations and creating a `.minecraft-syncer` folder followed by a `sync.json` file inside of that folder.  You can have that made for you by running the process for the first time as follows:

```bash
npm start
```

It has run successfully if you see "Nothing to sync".  If you go look at the configuration directory and file, you should see it generated correctly:
- Windows: `C:\Users\<Username>\AppData\Roaming\minecraft-syncer\sync.json`
- Mac: `/Users/<Username>/.minecraft-syncer/sync.json`
- Linux: `/home/<Username>/.minecraft-syncer/sync.json`

If you open that file up with a code or text editor, you'll see that all it at first has is an empty array (or `[]`) in it.  That is because there can be more than one configuration that this process can make, but there hasn't been one set up yet.  You'll have to provide it for now, though future improvements will make it so you won't have to modify this file manually.

The configuration is explained in more detail in the "Configuration" section below, but a basic example should looks like the following:

```json

[
    {
        "type": "bedrock",
        "name": "My Bedrock Worlds",
        "worldsFolder": "C:\\Users\\<Username>\\AppData\\Local\\Packages\\Microsoft.MinecraftUWP_<somehash>\\LocalState\\games\\com.mojang.default\\minecraftWorlds",
        "storageFolder": "C:\\Users\\<Username>\\OneDrive\\Documents\\Games\\Minecraft\\Saves\\Bedrock",
        "excludeWorlds": [],
        "additionalFiles": [
            "minecraftpe\\options.txt",
            "minecraftpe\\external_servers.txt",
            "resource_packs",
            "behavior_packs",
            "skin_packs",
            "world_templates"
        ]
    }
]
```

As a brief explanation, you can see that we're syncing a Bedrock edition world and it's coming from the original worlds folder and being synced into the OneDrive folder.  On top of the world files, it's also copying the options/settings, servers, and then some of the packs I'd want to use between devices.  This format works between both Bedrock and Java editions, though the options and servers are stored a little differently and will have to be added manually.

The explanations for these fields will be explained later.

## Running the syncer

There are essentially two modes to this process:

1. Export (backup), and
2. Import (restore)

When running the process, you should only do one at a time (for now).  You will have to be running the following in the `minecraft-syncer` folder in your terminal.

### To Export (backup):

```bash
npm start -- --export
```

### To Import (restore):

```bash
npm start -- --import
```

## Configuration

With the information above, you should mainly be able to do most of what you need, but if you've run into a snag here or there, then you might need more information.  This section will guide you on what to do to modify this file.

The best thing you can do in this version of the syncer is to learn JSON if you haven't already.  It'll be changing in future (hopefully), but if you're familiar with the JSON format, you should be able to do just about anything that you need.

### WorldsConfig Object

The key part of this file is the configuration objects--they drive the entire sync process.  Each of those objects pertain to one Minecraft instance.  The following snippet shows a sample of one of these objects:

```json
{
    "type": "bedrock",
    "name": "My Bedrock Worlds",
    "worldsFolder": "C:\\Users\\<Username>\\AppData\\Local\\Packages\\Microsoft.MinecraftUWP_<somehash>\\LocalState\\games\\com.mojang.default\\minecraftWorlds",
    "storageFolder": "C:\\Users\\<Username>\\OneDrive\\Documents\\Games\\Minecraft\\Saves\\Bedrock",
    "excludeWorlds": [],
    "additionalFiles": [
        "minecraftpe\\options.txt",
        "minecraftpe\\external_servers.txt",
        "resource_packs",
        "behavior_packs",
        "skin_packs",
        "world_templates"
    ]
}
```

> **Note:** Recognize that the paths have doulbe backslashes (or `\\`).  This is because it's pointing to a Windows computer.  However, if you're not on Windows, you can use `/` instead and only use one at a time.

#### `type`

One of `bedrock` or `java`.  Required

#### `name`

A string containing any name of the configuration you wish--used during the syncing process for temporary copies, so any characters not allowed by the filesystem you have should not be added to this field.  Required.

#### `worldsFolder`

A string containing the path to the `minecraftWorlds` or `saves` folder.  If omitted, default paths will be used.  Also requires

#### `storageFolder`

A string containing the path to the folder you want the backed-up worlds to be stored.  This can be any other place on your device, though to use the syncing process, it's best to point it at a place that will be synced to the cloud.

#### `excludeWorlds`

An array of folder names that match any of the folders in your `minecraftWorlds` or `saves` folders, as those are the names (not the world's name) that is excluded from the sync process.  Great if you don't want some of the worlds you have to be synced or backed up.

#### `additionalFiles`

An array of folders and files that should be included. Optional.  Note also that the paths aren't full paths (such as starting with a drive letter (e.g., `C:`) or a slash (e.g., `/Users`), etc.).  Instead, it's relative to the root minecraft directory (e.g., `.minecraft`).

## Advanced Ideas

This process is very flexible, which also means that it has some very interesting uses.

You could:

- Sync some worlds to a different cloud storage account than others (utilizing the "excludeWorlds" property in the configurations),
- Copy only servers, settings, etc., between computers (such as Sky Factory Prestige points, etc.)

## Future Improvements

- Better log messages + persistent log
   - The messages for the process don't happen much--if you see no output or what output that does show doesn't have an error in it, you're probably fine, but it would be great to be able to watch the process as it does its thing to get a bit more comfort that it's doing what it's supposed to
- Configuration Wizard
   - Which will prompt you the first time you run the process to ask where things need to go
- CurseForge Save Compatibility
   - Use CurseForge to help manage your Java mods/modpacks?  We could support that out-of-the-box!  This can definitely be done manually, but that makes life a lot harder.
- GUI/Graphical User Interface
   - Instead of having to mess around with JSON (especially if you're not familiar with the format), imagine having a window that you can view which worlds are currently in the synced location, in your worlds folder, or any other files that you'd like to sync?  Then you don't have to worry about mistakes you accidentally wrote in the configuration file, nor do you have to keep track of changes to the format!  And that's only the tip of the iceberg.  Notifications, background processes, merge conflict resolutions, etc., can help immensely to make the experience better.
- All dependencies bundled
   - Then you don't have to install Node or anything else--just download the .zip of the process and you're good to go!
- Partial copies of settings
   - That way, you can move between devices and copy only the configurations you want between games--think OptiFine, sounds, brightness, auto-jump, etc.  No need to manually tweak settings
- Per-world settings, applied when syncing
   - Allows for worlds (such as challenge worlds) to have specific settings applied when you want to launch that world; has to happen after partial application of settings has been implemented and might need some further concept planning (maybe a mod to help catch when a world is opened/closed to change/apply different settings, though that makes it a little less accessible...)
- Syncing directly to a cloud storage location instead of copying to another place on a filesystem
   - This means that you don't have to do it yourself, but will require me putting together privacy explanations, etc.  At this point in time, since the process doesn't touch anything outside of the configuration location and where you stick it and no other reach, no provisos need to be mentioned.  Once it's on your machine, there is no talking with any 3rd-party services; no telemetry, etc., is being collected.  All feedback can be found in the GitHub issues at this point in time, where you can choose how much information you'll provide about your system.
