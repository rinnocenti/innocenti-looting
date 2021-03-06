import { SETTINGS } from './settings.js';
export class GMActions {
    constructor(data = {}) {
        this.data = data;
        this.targetToken = canvas.tokens.get(data.targetid);
        this.token = canvas.tokens.get(data.tokenid);
        this.actor = game.actors.contents.find(a => a.id === this.token.actor.id);
    }

    async Init() {     
        await this.SetFlags();
        if (this.data.currentItems != false) {
            await this.RemoveItems(this.targetToken.actor, this.data.currentItems)
        }
    }

    async RemoveItems(actor, currentItems) {
        actor.deleteEmbeddedDocuments("Item", currentItems);
    }

    async SetFlags() {
        if (this.data.looting == true) {
            await this.targetToken.document.setFlag(SETTINGS.MODULE_NAME, SETTINGS.LOOT, true);
            console.log("SALVANDO FLAGS...", this.data);
        }
    }
}