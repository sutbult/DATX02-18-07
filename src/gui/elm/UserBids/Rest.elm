module UserBids.Rest exposing (getUserBids)

import Http
import Json.Decode exposing (..)

import UserBids.Types exposing (..)
import Bid.Rest exposing
    ( decodeBid
    )

getUserBids : Cmd Msg
getUserBids =
    let
        request = Http.get "http://localhost:51337/api/getUserBids" <| list decodeBid
        onResponse result =
            case result of
                Ok bids ->
                    SetBids bids

                Err _ ->
                    Noop
    in
        Http.send onResponse request
