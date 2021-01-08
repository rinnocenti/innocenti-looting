// JavaScript source code
export let SETTINGS = {
    MODULE_NAME: 'innocenti-looting',
    LOOT_SHEET: 'lootsheettype',
    MODULE_LOOT_SHEET: 'lootsheetnpc5e',
    TYPE_LOOT_SHEET: 'Loot',
    LOOT: 'looting'
}
Hooks.once("init", () => {
    game.settings.register(SETTINGS.MODULE_NAME, "lootSystem", {
        name: game.i18n.localize('Looting.Settings.lootSystem'),
        hint: game.i18n.localize('Looting.Settings.lootSystemHint'),
        scope: "world",
        config: true,
        choices: {
            "mode1": "Loot Iventory"//,
            //"mode2": "Random Table Loot",
            //"mode3": "Loot Iventory Random Loot"
        },
        default: "mode1",
        onChange: value => console.log(value),
        type: String
    });
    game.settings.register(SETTINGS.MODULE_NAME, "interactDistance", {
        name: game.i18n.localize('Looting.Settings.interactDistance'),
        hint: game.i18n.localize('Looting.Settings.interactDistanceHint'),
        scope: "world",
        config: true,
        default: 1,
        type: Number
    });
    game.settings.register(SETTINGS.MODULE_NAME, "perWeapons", {
        name: game.i18n.localize('Looting.Settings.percentWeapon'),
        hint: game.i18n.localize('Looting.Settings.percentWeaponHint'),
        scope: "world",
        config: true,
        default: "30",
        type: Number
    });
    game.settings.register(SETTINGS.MODULE_NAME, "perEquipment", {
        name: game.i18n.localize('Looting.Settings.percentEquipment'),
        hint: game.i18n.localize('Looting.Settings.percentEquipmentHint'),
        scope: "world",
        config: true,
        default: "60",
        type: Number
    });
    game.settings.register(SETTINGS.MODULE_NAME, "perConsumable", {
        name: game.i18n.localize('Looting.Settings.percentConsumable'),
        hint: game.i18n.localize('Looting.Settings.percentConsumableHint'),
        scope: "world",
        config: true,
        default: "20",
        type: Number
    });
    game.settings.register(SETTINGS.MODULE_NAME, "removeItem", {
        name: game.i18n.localize('Looting.Settings.removeItem'),
        hint: game.i18n.localize('Looting.Settings.removeItemHint'),
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });
});
