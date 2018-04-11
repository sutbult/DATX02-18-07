module UserBids.Rest exposing (getUserBids)

import Json.Decode exposing (..)

import UserBids.Types exposing (..)
import Bid.Rest exposing
    ( decodeBid
    )
import Rest


getUserBids : Cmd Msg
getUserBids =
    Rest.get
        "getUserBids"
        (list decodeBid)
        SetBids
        ToError
