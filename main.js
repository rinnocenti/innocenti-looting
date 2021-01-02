import { ActionLoot } from './scripts/ActionLoot.js';
import { GMActions } from './scripts/gmactions.js';
import { SETTINGS } from './scripts/settings.js';

Hooks.once("init", async () => {
    game.socket.on(`module.${SETTINGS.MODULE_NAME}`, async (data) => {
        if (game.user.isGM) {
            let gmaction = new GMActions(data);
            await gmaction.Init();
        }
    });
});

window.InnocentiLoot = {
    Loot: ActionLoot
}