**Get bids**
----
  Fetches all accounts associated with the user.

* **URL**

  /api/getWallet

* **Method:**

  `GET`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[
      [
        {
          currency: "Bitcoin",
          amount: 10
        },
        {
          currency: "Ethereum",
          amount: 100
        }
      ]
    ]`

* **Sample Call:**

  `curl http://localhost:51337/api/getWallet`
