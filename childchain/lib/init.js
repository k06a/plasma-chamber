const Chain = require("./chain");
const Snapshot = require("./state/snapshot")
const levelup = require('levelup');
const leveldown = require('leveldown');

module.exports = {
    run: async _=>{
        const blockDB = levelup(leveldown('./.blockdb'));
        const metaDB = levelup(leveldown('./.metadb'));
        const snapshotDB = levelup(leveldown('./.snapshotdb'));
        const childChain = new Chain();
        childChain.setMetaDB(metaDB);
        childChain.setBlockDB(blockDB);
        const snapshot = new Snapshot();
        snapshot.setDB(snapshotDB);
        childChain.setSnapshot(snapshot);
        await childChain.setChainID("NKJ23H3213WHKHSAL");
        await childChain.init();
        return childChain;
    }
}