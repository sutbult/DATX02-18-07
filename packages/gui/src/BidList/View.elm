module BidList.View exposing
    ( root
    )

import Html exposing (..)
import Html.Attributes exposing (..)

import BidList.Types exposing (..)

import BidList.Table.View as TableView
import BidList.Filter.View as FilterView
import Error.View as ErrorView


root : Model -> Html Msg
root model =
    if model.loading then
        loading
    else
        div []
            [ Html.map ToError (ErrorView.root (.error model))
            , Html.map ToFilter (FilterView.root (.filter model))
            , Html.map mapTableCmd
                <| TableView.root model.table
            ]


loading : Html Msg
loading =
    div []
        [ p
            [ class "subtitle"
            , style [("text-align", "center")]
            ]
            [ text "Loading bids"
            ]
        ]
