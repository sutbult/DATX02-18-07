module Browse.Bids.Rest exposing (..)

import Browse.Bids.Types exposing (..)

import Bid.Types exposing
    ( Bid
    )
import Bid.Rest exposing
    ( encodeBidId
    )

import Json.Decode
import Rest


acceptBid : Bid -> Int -> Cmd Msg
acceptBid bid sseID =
    if sseID >= 0 then
        Rest.post
            (encodeBidId bid sseID)
            "acceptBid"
            (Json.Decode.succeed ())
            (\_ -> Noop)
            -- TODO: Implementera felhantering
            (\_ -> Noop)
    else
        Cmd.none
