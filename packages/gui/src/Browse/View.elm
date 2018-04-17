module Browse.View exposing (root)

import Browse.Types exposing (..)

import BidList.View as BidListView
import Browse.Accept.View as AcceptView

import Html exposing (..)

root : Model -> Html Msg
root model =
    div []
        [ Html.map mapBidListCmd
            <| BidListView.root model.bidList

        , Html.map mapAcceptCmd
            <| AcceptView.root model.accept
        ]
