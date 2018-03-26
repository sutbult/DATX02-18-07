module UserBids.View exposing (root)

import Bid.View exposing (bidList)

import Html exposing (..)

import UserBids.Types exposing (..)

root : Model -> Html Msg
root model =
    div []
        [ bidList True (const Noop) model.bids
        ]


const : v -> a -> v
const v _ = v
