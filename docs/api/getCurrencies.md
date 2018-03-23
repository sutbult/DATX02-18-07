**Get available currencies**
----
  Fetches the currencies which is available for the user to create bids with.

* **URL**

  /api/getCurrencies

* **Method:**

  `GET`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[
      "Bitcoin",
      "Bitcoin cash",
      "Ethereum",
      "Ethereum classic",
      "Monero",
      "Dogecoin"
    ]`

* **Sample Call:**

  `curl http://localhost:51337/api/getCurrencies`
