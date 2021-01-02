// JavaScript source code
import { SETTINGS } from './settings.js';
import { GMActions } from './gmactions.js';
import { PickPocket } from './pickpocket.js';
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
            if (entity.id == canvas.tokens.controlled[0].id) return;
            if (this.CheckDistance(entity) != true) return;
            this.data.targetid = entity.id;
            if (entity.data.actorData.data.attributes.hp.value <= 0 && !entity.isPC) {
                // Morto - lootiar
                if (entity.getFlag(SETTINGS.MODULE_NAME, SETTINGS.LOOT)) return ui.notifications.warn(game.i18n.format("Looting.Errors.invalidCheck", { token: entity.name })); // já foi lootiado.
                this.LootNPC(entity.actor, this.actor);
            } else {
                // vivo - Roubar
                if (entity.actor.getFlag(SETTINGS.MODULE_LOOT_SHEET, SETTINGS.LOOT_SHEET)) return; // não é um bau ou mercador.
                //this.AttempPickpocket(entity.actor, this.actor);
            }
            if (game.user.isGM) {
                let gmaction = new GMActions(this.data);
                gmaction.Init();
            } else {
                game.socket.emit(`module.${SETTINGS.MODULE_NAME}`, this.data);
            }
        });

    }

    AttempPickpocket(target, actor) {
        // criar um dialogo para verificar se o jogador quer mesmo fzer o pickpocket
        let d = new Dialog({
            title: "PickPocket",
            content: "<p>O alvo ainda está conciente e pode reagir, Você tem certeza que deseja roubar os alvos?</p>",
            buttons: {
                one: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Sim",
                    callback: () => this.PickPocket(target, actor)
                },
                two: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Não",
                    callback: () => console.log("Cancel Pickpoket")
                }
            },
            default: "two",
            //render: html => console.log("Register interactivity in the rendered dialog"),
            //close: html => console.log("This always is logged no matter which option is chosen")
        });
        d.render(true);
    }

    PickPocket(target, tokenactor) {
        this.data.ppocket = true;
        this.loots = this.LootItemList(target.actor);
        let pickpocket = new PickPocket(this.loots, target, tokenactor);
    }

    LootNPC(target, tokenactor) {
        this.data.looting = true;
        // Faz uma lista com possibilidade de perda do item.
        let loots = this.LootItemList(target.items);
        // Cria os itens no token do usuário
        tokenactor.createEmbeddedEntity("OwnedItem", loots);
        this.ResultChat("Looting", loots, target.name);
        if (game.settings.get(SETTINGS.MODULE_NAME, "removeItem")) {
            let items = this.LootItemList(target.items, true);
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
    ResultChat(titleChat, items, targetName) {
        let title = titleChat + '- ' + targetName;
        let table_content = ``;
        for (let item of items) {
            table_content += `<div><img src="${item.img}" height="35px"/> ${item.name} <div>`;
        }
        let content = `<div>${table_content}</div>`;
        ChatMessage.create({
            content: content,
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
            speaker: ChatMessage.getSpeaker(),
            flavor: `<h2>${title}</h2>`
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