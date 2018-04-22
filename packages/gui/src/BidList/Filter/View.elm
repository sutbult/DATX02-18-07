module BidList.Filter.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import BidList.Filter.Types exposing (..)

import BidList.Filter.Part.View as PartView

root : Model -> Html Msg
root model =
    div [class "box"]
        [ h4 [class "title is-4"] [text "Filter"]
        , div [class "columns"]
            [ Html.map From (PartView.root (.from model))
            , Html.map To (PartView.root (.to model))
            ]
        ]
