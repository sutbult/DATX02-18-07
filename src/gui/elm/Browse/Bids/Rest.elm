module Browse.Bids.Rest exposing (..)

import Browse.Bids.Types exposing (..)

import Bid.Types exposing
    ( Bid
    )
import Bid.Rest exposing
    ( encodeBidId
    )

import Http
import Json.Decode

acceptBid : Bid -> Int -> Cmd Msg
acceptBid bid sseID =
    let
        body = Http.jsonBody <| encodeBidId bid sseID
        request = Http.post "http://localhost:51337/api/acceptBid" body (Json.Decode.succeed ())
        onResponse _ = Noop
    in
        Http.send onResponse request
