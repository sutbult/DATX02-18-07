**Get bids**
----
  Fetches the bids from the database.

* **URL**

  /api/getBids

* **Method:**

  `GET`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[
      {
        id: "RandomID",
        status: "ACTIVE",
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

  `curl http://localhost:51337/api/getBids`
