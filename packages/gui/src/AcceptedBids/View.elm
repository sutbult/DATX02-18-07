module AcceptedBids.View exposing (root)

import Html exposing (..)

import AcceptedBids.Types exposing (..)
import BidList.View as BidListView


root : Model -> Html Msg
root model =
    div []
        [ Html.map ToBidList
            <| BidListView.root model.bidList
        ]
