module BidList.View exposing
    ( root
    )

import Html exposing (..)

import BidList.Filter.Types exposing
    ( getFilter
    )
import BidList.Types exposing (..)

import BidList.Table.View as TableView
import BidList.Filter.View as FilterView
import Error.View as ErrorView


root : Model -> Html Msg
root model =
    div []
        [ Html.map Error (ErrorView.root (.error model))
        , Html.map Filter (FilterView.root (.filter model))
        , Html.map mapTableCmd
            <| TableView.root model.table
            <| getFilter model.filter
        ]
