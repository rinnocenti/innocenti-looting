# Innocenti Looting

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D02SYZA)

A simple module to use for looting dead NPCs tokens.
With it the token's targets will have their items moved to the user's sheet.
(with the exception of some like natural weapons, feats and spells).
Some items have a chance of not being in good use and will not be sent to the sheet (configurable percentage).

## Installation
You can install this module by using the following manifest URL : https://raw.githubusercontent.com/rinnocenti/innocenti-looting/main/module.json

## Dependencies
This module was created to work in a world with other support modules so you don't have to increase your workload.

The module is system dependent:
  * System Dnd5 (v. 1.0 or greater) - Maybe work in another system.. (need tests)

And the Modules:
* Loot Sheet npc5e (by ChalkOne) for to differentiate combat npcs, chests and merchants: https://raw.githubusercontent.com/jopeek/fvtt-loot-sheet-npc-5e/master/module.json

Create a macro with permission for all your players with the following content:

Macro - LOOTING

`let actions = new InnocentiLoot.Loot();`

## How to Use
the module basically works looking for a items in the token inventory of npc with hp 0, can be looted using the target with a macro, unless they are:
classes, spells, feats, natural weapons, siege weapons, vehicle equipment and natural equipment.

Items also have a percentage (configurable) chance of not being in good use and not being moved (and deleted) to the character sheet.

## Future Features
* Looting Gold.
* Pickpocket in lives npcs
* Sort Golds in loot and robbery (maybe in rolltables)

## Support
If you like this module and would like to help or found a bug or request new features call me on discord @Innocenti#1455 or create a issue here.

## License
This Foundry VTT module, writen by Innocenti, is licensed under a Creative Commons Attribution 4.0 International License.
