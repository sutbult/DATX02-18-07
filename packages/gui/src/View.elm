module View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Types exposing (..)
import Navigation.View

root : Model -> Html Msg
root model =
    section [class "section"]
        [ div [class "container is-fullhd"]
            [ Html.map ToNavigation (Navigation.View.root model.navigation)
            ]
        ]
