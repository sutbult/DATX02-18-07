

function construct (balance, send, validate, claim, search, unlock) {
    this.validate = validate;
    this.balance = balance;
    this.claim = claim;
    this.search = search;
    this.unlock = unlock;
    this.send = send;
}

module.exports = {
    construct
};