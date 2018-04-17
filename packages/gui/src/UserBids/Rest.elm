module UserBids.Rest exposing (getUserBids)

import Json.Decode exposing (..)

import UserBids.Types exposing (..)
import Bid.Rest exposing
    ( decodeBid
    )
import Utils.Rest exposing
    ( get
    )


getUserBids : Cmd Msg
getUserBids =
    get
        "getUserBids"
        (list decodeBid)
        SetBids
        ToError
