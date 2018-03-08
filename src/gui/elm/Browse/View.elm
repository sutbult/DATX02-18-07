module Browse.View exposing (root)

import Browse.Types exposing (..)
import Browse.Filter.Types exposing (getFilter)
import Browse.Bids.View as BidsView
import Browse.Filter.View as FilterView

import Html exposing (..)

root : Model -> Html Msg
root model =
    div []
        [ Html.map Filter (FilterView.root (.filter model))
        , Html.map Bids (BidsView.root (.bids model) (Debug.log "Filter" <| getFilter <| .filter model))
        ]