module Browse.Accept.Rest exposing (..)

import Browse.Accept.Types exposing (..)

import Bid.Types exposing
    ( Bid
    )
import Bid.Rest exposing
    ( encodeBidId
    )

import Json.Decode
import Utils.Rest exposing
    ( post
    )


acceptBid : Bid -> Int -> Cmd Msg
acceptBid bid sseID =
    if sseID >= 0 then
        post
            (encodeBidId bid sseID)
            "acceptBid"
            (Json.Decode.succeed ())
            (\_ -> Noop)
            AcceptFailure
    else
        Cmd.none
