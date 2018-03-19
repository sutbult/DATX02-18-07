**Accept bid**
----
  Called when a user accepts a bid existing in the database and triggers the swapping process.

* **URL**

  /api/acceptBid

* **Method:**

  `POST`

* **Data Params**

  `{ "id": "RandomID" }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ }`

* **Sample Call:**

  `curl http://localhost:51337/api/addBid -d '{ "id": "RandomID" }'`

* **Notes:**

  * ~~Har vi något system för att hantera referenser till bud? I så fall borde denna ändpunkt ta emot en sådan referens istället för hela budet. (2018-03-17)~~ Ändpunkten är ändrad så att den tar emot en referens istället för ett helt bud. (2018-03-19)
  * ~~Det lär ju ta en stund att hantrera växlingen genom blockkedjorna, så ska vi göra så att denna ändpunkt väntar med att svara tills denna process är klar eller ska den svara direkt för att sedan ge ett svar via "Server-Sent Events" (https://www.w3schools.com/html/html5_serversentevents.asp)? (2018-03-17)~~ Detta har diskuterats på dagens möte och ett system för att svara med *Server-Sent Events* kommer att implementeras. (2018-03-19)
