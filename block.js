exports.BlockHeader = class BlockHeader {
  constructor(version, previousBlockHeader, merkleRoot, time, nBits, nounce) {
    // Version - at the time of writing there are 4 block versions.
    this.version = version;

    // Previous block header hash - A SHA256(SHA256()) hash of the previous block's header. Ensures that previous block cannot be changed as this block needs to be changed as well
    this.previousBlockHeader = previousBlockHeader;

    // Merkle root hash - a merkle tree is binary tree which holds all the hashed pairs of the tree.
    this.merkleRoot = merkleRoot;

    // a Unix epoch time when the miner started hashing the header.
    this.time = time;
  }
};

exports.Block = class Block {
  constructor(blockHeader, index, txns) {
    this.blockHeader = blockHeader;

    // GenesisBlock is the first block - block 0
    this.index = index;

    // txns is the raw transactions in the block
    this.txns = txns;
  }
};
