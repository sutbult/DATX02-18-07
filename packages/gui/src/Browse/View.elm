module Browse.View exposing (root)

import Browse.Types exposing (..)
import Browse.Filter.Types exposing (getFilter)

import BidList.Table.View as TableView
import Browse.Filter.View as FilterView
import Browse.Accept.View as AcceptView

import Error.View as ErrorView

import Html exposing (..)

root : Model -> Html Msg
root model =
    div []
        [ Html.map Error (ErrorView.root (.error model))
        , Html.map Filter (FilterView.root (.filter model))
        , Html.map mapTableCmd
            <| TableView.root model.table
            <| getFilter model.filter
        , Html.map ToAccept (AcceptView.root model.accept)
        ]
