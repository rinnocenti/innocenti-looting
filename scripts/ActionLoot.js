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
            currentItems: false,
            currency: {}
        }
        this.lootCurrency = {};
        this.betterTables = game.modules.get("better-rolltables");
    }
    // check targets
    async Check() {
        if (this.targets == undefined || this.targets.size <= 0) return;
        for (let entity of this.targets) {
            if (entity.id == canvas.tokens.controlled[0].id) return ui.notifications.warn(game.i18n.localize('Looting.Errors.thesame'));
            if (this.CheckDistance(entity) != true) return;
            this.data.targetid = entity.id;
            let titleChat = "";
            if (entity.actor.data.data.attributes.hp.value <= 0 && !entity.isPC) {
                // Morto - lootiar
                titleChat = game.i18n.localize('Looting.MsgChat.looting');
                let readyloot = entity.document.getFlag(SETTINGS.MODULE_NAME, SETTINGS.LOOT); //lootFlag ?.looting;
                if (readyloot) return ui.notifications.warn(game.i18n.format("Looting.Errors.invalidCheck", { token: entity.name })); // já foi lootiado.
                await this.LootNPC(entity.actor, this.actor);
            } else {
                ui.notifications.warn(game.i18n.localize('Looting.Errors.isalive'))
                // vivo - Roubar
                if (entity.actor._getSheetClass().name == SETTINGS.MODULE_LOOT_SHEET) return; // não é um bau ou mercador.
                //this.AttempPickpocket(entity.actor, this.actor);
            }
            await this.AttempItemRemove(entity.actor);
            if (this.data.looting || this.data.ppocket) {
                this.ResultChat(titleChat, this.loots, entity.name, this.lootCurrency);
                if (game.user.isGM) {
                    let gmaction = new GMActions(this.data);
                    gmaction.Init();
                } else {
                    game.socket.emit(`module.${SETTINGS.MODULE_NAME}`, this.data);
                }
            }
        }

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
        this.loots = this.InventoryChancesLoot(target.actor);
        let pickpocket = new PickPocket(this.loots, target, tokenactor);
    }

    async LootNPC(target, tokenactor) {
        this.data.looting = true;
        this.data.currency = duplicate(tokenactor.data.data.currency);
        // tipos de loot
        if (game.settings.get(SETTINGS.MODULE_NAME, "lootSystem") == "mode1") {
            this.loots = await this.InventoryChancesLoot(target.items);
            for (let coin in this.lootCurrency) {
                this.data.currency[coin] = this.data.currency[coin] + this.lootCurrency[coin];
            }
        } else if (game.settings.get(SETTINGS.MODULE_NAME, "lootSystem") == "mode2") {

        } else if (game.settings.get(SETTINGS.MODULE_NAME, "lootSystem") == "mode3") {

        }
        this.loots = this.loots.map(i => i.toObject());
        await this.loots.map(a => {
            a.data.equipped = false;
        });
        //console.log(this.loots, "item");
        await tokenactor.createEmbeddedDocuments("Item", this.loots, { noHook: true });
        await tokenactor.update({ "data.currency": this.data.currency });
    }

    async AttempItemRemove(target) {
        if (game.settings.get(SETTINGS.MODULE_NAME, "removeItem")) {
            let items = await this.FilterInventory(target.items);
            this.data.currentItems = items.map(i => i.id);
        }
    }

    async FilterInventory(items) {
        let filtro = await items.filter(item => {
            if (item == null || item == undefined) return;
            if (item.type == "class" || item.type == "spell" || item.type == "feat") return;
            if (item.type === "weapon" && (item.data.data.weaponType == "siege" || item.data.data.weaponType == "natural")) return;
            if (item.type === "equipment" && (item.data.data.equipmentType == "vehicle" || item.data.data.equipmentType == "natural")) return;
            return item;
        });
        return filtro;

    }

    async InventoryChancesLoot(actoritems, check = false) {
        let tables = [];
        let ac = await actoritems.filter(item => {
            if (item == null || item == undefined) return;
            if (item.type == "class" || item.type == "spell" || item.type == "feat") return;
            let agio = (game.settings.get(SETTINGS.MODULE_NAME, "lootEquipable")) ? game.settings.get(SETTINGS.MODULE_NAME, "lootEquipableAgil") : 0;
            // weapon equipment consumable
            if (!game.settings.get(SETTINGS.MODULE_NAME, "lootEquipable") && item.data.data.equipped) return;
            item.data.data.equipped = false;
            if (item.type === "weapon") {
                if (item.data.data.weaponType == "siege" || item.data.data.weaponType == "natural") return;
                if (!check && (Math.floor(Math.random() * 100) + 1) <= game.settings.get(SETTINGS.MODULE_NAME, "perWeapons") + agio) return;  
            }
            if (item.type === "equipment") {
                if (item.data.data.equipmentType == "vehicle" || item.data.data.equipmentType == "natural") return;
                if (!check && (Math.floor(Math.random() * 100) + 1) <= game.settings.get(SETTINGS.MODULE_NAME, "perEquipment") + agio) return;
            }
            if (item.type === "consumable") {
                if (!check && (Math.floor(Math.random() * 100) + 1) <= game.settings.get(SETTINGS.MODULE_NAME, "perConsumable") + agio) return;
            }
            if (item.type === "loot") {
                let matches = item.name.match(/\([a-z]{1,2}\)$/gs);
                if (matches) {
                    let coin = matches[0].substring(1, matches[0].length - 1);
                    this.ConvertItens2Coins(coin, item);
                    return;
                }
                let tmatches = item.name.match(/Table:([\w\s\S]+)/gis);
                if (tmatches) {
                    let t = tmatches[0].split('Table:');
                    tables.push(t[1].trim());
                    return;
                }
            }
            return item;
        });
        for (let tableroll of tables) {
            let item = await this.ConvertItems2TableLoot(tableroll);
            if (item) {
                ac.push(...item)
            }
        }
        return ac;
    }

    async ConvertItems2TableLoot(tableroll) {
        let nItems = [];
        let table = game.tables.getName(tableroll);
        if (this.betterTables && this.betterTables.active) {
            //Bettertable
            let re = await table.roll();
            let result = await re.results;
            //console.log(result);
            for (let r of result) {
                let packs = game.packs.get(r.collection);
                let entity = (packs) ? await packs.getEntity(r.resultId) : game.items.get(r.resultId);
                if (!entity) return ui.notifications.error(game.i18n.localize('Looting.Errors.notItem'));
                let matches = entity.name.match(/\([a-z]{1,2}\)$/gs);
                if (matches) {
                    let coin = matches[0].substring(1, matches[0].length - 1);
                    this.ConvertItens2Coins(coin, entity);
                } else {
                    nItems.push(entity);
                }
            }
        } else {
            //Vanilla
            let re = await table.roll();
            let result = await re.results;
            for (let r of result) {
                console.log(r, "item");
                let packs = game.packs.get(r.data.collection);
                let entity = (packs) ? await packs.getDocument(r.data.resultId) : game.items.get(r.data.resultId);
                console.log(entity, packs);
                let matches = entity.name.match(/\([a-z]{1,2}\)$/gs);
                if (matches) {
                    let coin = matches[0].substring(1, matches[0].length - 1);
                    this.ConvertItens2Coins(coin, entity);
                } else {
                    nItems.push(entity);
                }
            }
        }
        //console.log("items", nItems);
        //console.log(this.lootCurrency);
        return nItems;
    }

    ConvertItens2Coins(coin, item) {
        if (!this.lootCurrency[`${coin}`]) this.lootCurrency[`${coin}`] = 0;
        if (item.data.data.source.match(/[dkfhxo]{1}[0-9\s\+\-\*\/]+/gs)) {
            let r = new Roll(item.data.data.source);
            this.lootCurrency[`${coin}`] += r.evaluate({async: false}).total;
        } else {
            this.lootCurrency[`${coin}`] += item.data.data.quantity;
        }
    }

    ResultChat(titleChat, items, targetName, currency) {
        let title = titleChat + '- ' + targetName;
        let table_content = ``;
        for (let item of items) {
            table_content += `<div><img src="${item.img}" height="35px"/> ${item.name} <div>`;
        }
        let content = `<div>${table_content}</div>`;
        if (currency) {
            let coins = '';
            for (let coin in currency) {
                coins += `<strong>${coin}</strong>: ${currency[coin]} `;
            }
            content = content + `<div><hr/><h3>${game.i18n.localize('Looting.MsgChat.Currency')}</h3> <p>${coins}</p></div>`;
        }
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