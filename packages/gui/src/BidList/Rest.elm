module BidList.Rest exposing
    ( getBids
    )

import BidList.Types exposing (..)
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


getBids : String -> Cmd Msg
getBids path =
    get
        path
        decodeBids
        SetBids
        ToError


decodeBids : Decoder (List Bid)
decodeBids = list decodeBid
