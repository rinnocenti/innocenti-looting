// JavaScript source code
import { SETTINGS } from './settings.js';
export class ActionLoot {
    constructor() {
        //
        if (canvas.tokens.controlled.length === 0) {
            return ui.notifications.error(game.i18n.localize('Looting.Errors.noSelect'));
        }
        if (!game.user.targets.values().next().value) {
            return ui.notifications.warn(game.i18n.localize('Looting.Errors.noToken'));
        }
        this.actor = canvas.tokens.controlled[0].actor;
        this.targets = game.user.targets;
        this.data = {
            tokenid: canvas.tokens.controlled[0].id,
            targetid: false,
            looting: false,
            ppocket: false,
            currentItems: false
        }
        this.Check();
    }
    // check targets
    async Check() {
        this.targets.forEach(entity => {
            if (this.CheckDistance(entity) != true) return;
            this.data.targetid = entity.id;
            if (entity.data.actorData.data.attributes.hp.value <= 0 && !entity.isPC) {
                // Morto - lootiar
                if (entity.getFlag(SETTINGS.MODULE_NAME, SETTINGS.LOOT)) return ui.notifications.warn(game.i18n.format("Looting.Errors.invalidCheck", { token: entity.name })); // já foi lootiado.
                this.LootNPC(entity.actor, this.actor);
            } else {
                // vivo - Roubar
                if (entity.actor.getFlag(SETTINGS.MODULE_LOOT_SHEET, SETTINGS.LOOT_SHEET)) return; // não é um bau ou mercador.
                this.PickPocket(entity.actor.items);
            }
            game.socket.emit(`module.${SETTINGS.MODULE_NAME}`, this.data);
        });
        console.log("Check", this)
    }

    PickPocket(actoritems) {
        this.data.ppocket = true;
        this.loots = this.LootItemList(actoritems);
    }

    LootNPC(actor, tokenactor) {
        this.data.looting = true;
        // Faz uma lista com possibilidade de perda do item.
        let loots = this.LootItemList(actor.items);
        // Cria os itens no token do usuário
        tokenactor.createEmbeddedEntity("OwnedItem", loots);        
        if (game.settings.get(SETTINGS.MODULE_NAME, "removeItem")) {
            let items = this.LootItemList(actor.items, true);
            this.data.currentItems = items.map(i => i._id);
        }
    }

    LootItemList(actoritems, check = false) {
        return actoritems.filter(item => {
            if (item == null || item == undefined) return;
            if (item.type == "class" || item.type == "spell" || item.type == "feat") return;
            // weapon equipment consumable
            if (item.type === "weapon") {
                if (item.data.data.weaponType == "siege" || item.data.data.weaponType == "natural") return;
                if (!check && (Math.floor(Math.random() * 100) + 1) <= game.settings.get(SETTINGS.MODULE_NAME, "perWeapons")) return;
            }
            if (item.type === "equipment") {
                if (item.data.data.equipmentType == "vehicle" || item.data.data.equipmentType == "natural") return;
                if (!check && (Math.floor(Math.random() * 100) + 1) <= game.settings.get(SETTINGS.MODULE_NAME, "perEquipment")) return;
            }
            if (item.type === "consumable") {
                if (!check && (Math.floor(Math.random() * 100) + 1) <= game.settings.get(SETTINGS.MODULE_NAME, "perConsumable")) return;
            }
            return item;
        });
    }
    CheckDistance(targetToken) {
        let minDistance = game.settings.get(SETTINGS.MODULE_NAME, "interactDistance");
        let gridDistance = (minDistance < 1) ? 1 : minDistance;
        // minimo de distancia 1
        let distance = Math.ceil(canvas.grid.measureDistance(canvas.tokens.controlled[0], targetToken, { gridSpaces: true }));
        let nGrids = Math.floor(distance / canvas.scene.data.gridDistance);
        if (nGrids <= gridDistance) return true;
        ui.notifications.warn(game.i18n.format("Looting.Errors.invalidDistance", { dist: gridDistance }));
        return false;
    }
}