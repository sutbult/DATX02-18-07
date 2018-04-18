module UserBids.View exposing (root)

import Html exposing (..)

import UserBids.Types exposing (..)
import BidList.View as BidListView


root : Model -> Html Msg
root model =
    div []
        [ Html.map mapBidListCmd
            <| BidListView.root model.bidList
        ]
