module View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Types exposing (..)
import Breadcrumb.View
import Browse.View

root : Model -> Html Msg
root model =
    div [class "container is-fullhd"]
        [ Html.map Breadcrumb (Breadcrumb.View.root (.breadcrumb model))
        , Html.map Browse (Browse.View.root (.browse model))
        ]
