module UserBids.View exposing (root)

import Html exposing (..)

import Bid.View exposing (bidList)
import UserBids.Types exposing (..)
import Error.View

root : Model -> Html Msg
root model =
    div []
        [ Html.map ToError (Error.View.root model.error)
        , bidList True (const Noop) model.bids
        ]


const : v -> a -> v
const v _ = v
