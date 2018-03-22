**Get bids**
----
  Fetches all bids associated with the user.

* **URL**

  /api/getUserBids

* **Method:**

  `GET`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[
      {
        id: "RandomID",
        from: {
          currency: "Bitcoin",
          amount: 10
        },
        to: {
          currency: "Ethereum",
          amount: 100
        }
      }
    ]`

* **Sample Call:**

  `curl http://localhost:51337/api/getUserBids`
