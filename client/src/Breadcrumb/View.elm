module Breadcrumb.View exposing (root)

import Breadcrumb.Types exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)

root : Model -> Html Msg
root _ =
    nav [class "breadcrumb"]
        [ ul []
            [ li [] [ a [href "#"] [text "Home"] ]
            , li [class "is-active"] [ a [href "#"] [text "Browse bids"] ]
            ]
        ]
