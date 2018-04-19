module UserBids.View exposing (root)

import Html exposing (..)

import UserBids.Types exposing (..)
import BidList.View as BidListView


root : Model -> Html Msg
root model =
    div []
        [ Html.map ToBidList
            <| BidListView.root model.bidList
        ]
