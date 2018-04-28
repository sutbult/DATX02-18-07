function construct (balance, send, validate, claim, search, unlock, wallet) {
    this.validate = validate;
    this.balance = balance;
    this.claim = claim;
    this.search = search;
    this.unlock = unlock;
    this.send = send;
    this.wallet = wallet;
}

module.exports = {
    construct
};

