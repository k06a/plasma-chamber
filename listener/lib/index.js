require("dotenv").config();
const Web3 = require('web3');
const web3 = new Web3(process.env.ROOTCHAIN_ENDPOINT);
const RootChainAbi = require('../assets/RootChain.json').abi;

const rootChain = new web3.eth.Contract(RootChainAbi, process.env.ROOTCHAIN_ADDRESS);

class EventListener {

  constructor() {
    this.seenEvents = {};
  }

  async getEvents(event, confirmation, handler) {
    const block = await web3.eth.getBlock('latest');
    const events = await rootChain.getPastEvents(event, {
      fromBlock: block.number - (confirmation * 2 + 1),
      toBlock: block.number + 1 - confirmation
    });
    events.filter(e => {
      return !this.seenEvents[e.transactionHash];
    }).forEach((e) => {
      handler(e);
      this.seenEvents[e.transactionHash] = true;
    });
    setTimeout(()=>{
      this.getEvents(event, confirmation, handler);
    }, 10000);
  }

}


module.exports.run = childChain => {

  const eventListener = new EventListener();

  childChain.events.Ready((e) => {
  })

  childChain.events.TxAdded(async (e) => {
    await childChain.saveCommitmentTxs(); //async func

    if (e.type == "deposit") {
      await childChain.generateBlock();
    } else if (e.type == "basic") {

      // TODO: Must make it blocksize
      if (childChain.commitmentTxs.length > 100) {
        await childChain.generateBlock();
      }
    }
  })
  childChain.events.BlockGenerated((e) => {
    let newBlock = e.payload;
    /**
     * @param address _chain The index of child chain
     * @param bytes32 _root The merkle root of a child chain transactions.
     */
    // rootchain.methods.submitBlock(childChain.id, newBlock.merkleHash());
  })
  eventListener.getEvents('Deposit', 1, (e) => {
    console.log('Deposit', e.transactionHash);
    childChain.applyDeposit(e);
  })
  // rootChain.events.BlockSubmitted((e) => {
  //   console.log(e);
  // })

}

