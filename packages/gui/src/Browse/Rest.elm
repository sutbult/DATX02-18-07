module Browse.Rest exposing (getBids)

import Browse.Types exposing (..)
import Json.Decode exposing (..)

import Bid.Types exposing
    ( Bid
    , Value
    )
import Bid.Rest exposing
    ( decodeBid
    )
import Utils.Rest exposing
    ( get
    )


getBids : Cmd Msg
getBids =
    get
        "getBids"
        decodeBids
        SetBids
        Error


decodeBids : Decoder (List Bid)
decodeBids = list decodeBid
