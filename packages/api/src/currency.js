function construct (balance, send, validate, claim, search, unlock, wallet) {
    /** balance(address)
     * @param {hex} address - The address to check the balance of
     * @returns {int} The address balance
     */
    this.balance = balance;

    /** send(account, digest, destination, value, refund_time)
     * @param {hex} account - The address/account that sends and funds
     * the contract
     * @param {hex} digest - The digest that will lock the contract
     * @param {hex} destination - The claim destination of the
     * contract
     * @param {int} value - The value to send to the contract
     * expressed in the smallest unit
     * @param {int} refund_time - How many (hours) the contract should
     * be locked
     * @returns {receipt} Object with .contractAddress, .digest and .timelock
     */
    this.send = send;

    /** validate(contract, destination, value, digest, timelock, margin)
     * @param {hex} contract - The address of the contract
     * @param {hex} destination - The claim destination of the
     * contract
     * @param {int} value - The value in the contract expressed in the
     * smallest unit
     * @param {hex} digest - The digest that is locking the contract
     * @param {int} timelock - The timestamp when the contract is
     * unlocked
     * @param {int} margin - The acceptable amount of margin in
     * timestamp difference
     * @returns {bool} If the contract is valid or not
     */
    this.validate = validate;

    /** claim(secret, account, contract)
     * @param {string} secret - The pre image hash of the digest in
     * the contract
     * @param {hex} account - The address/account to unlock the
     * contract with
     * @param {hex} contract - The address of the contract to claim
     * @returns {bool} Returns true if it's claimed
     */
    this.claim = claim;

    /** search(contract, from_block) 
     * @param {hex} contract - The address of the contract
     * @param {int} [from_block] - (Optional) From what block to
     * @returns {string} Returns the secret, if found
     */
    this.search = search;

    /** unlock(account, password, time)
     * @param {hex} account - The address/account of the account to
     * unlock
     * @param {string} password - The password to unlock the account
     * with
     * @param {int} [time] - (Optional) The time to have the account
     * unlocked
     * @returns {bool} Returns true if unlocked
     */
    this.unlock = unlock;

    /** wallet()
     * @returns {account} Returns the account in some form
     */
    this.wallet = wallet;
}

module.exports = {
    construct
};

