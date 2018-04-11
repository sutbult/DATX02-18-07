**Add bid**
----
  Add a bid to the database.
  
* **URL**

  /api/addBid

* **Method:**

  `POST`
  
* **Data Params**

  `{ "from": { "currency": "Bitcoin", "amount": 10 }, "to": { "currency": "Ethereum", "amount": 100 } }`

* **Success Response:**
  
  * **Code:** 200 <br />
    **Content:** `{ }`
  
* **Sample Call:**

  `curl http://localhost:51337/api/addBid -d '{ "from": { "currency": "Bitcoin", "amount": 10 }, "to": { "currency": "Ethereum", "amount": 100 } }'`
