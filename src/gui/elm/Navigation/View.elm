module Navigation.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import Navigation.Types exposing (..)

import Browse.View
import Add.View

root : Model -> Html Msg
root model =
    div []
        [ tabs model.shown
        , viewSelector model
        ]

viewSelector : Model -> Html Msg
viewSelector model =
    case model.shown of
        Browse ->
            Html.map ToBrowse <| Browse.View.root model.models.browse

        Add ->
            Html.map ToAdd <| Add.View.root model.models.add

tabs : View -> Html Msg
tabs shown =
    div [class "tabs is-centered"]
        [ ul []
            <| List.map (tab shown)
                [ (Add, "Add bid")
                , (Browse, "Browse bids")
                ]
        ]

tab : View -> (View, String) -> Html Msg
tab shown (view, title) =
    let
        attribs =
            if shown == view then
                [class "is-active"]
            else
                []
    in
        li attribs
            [ a [onClick (Show view)] [text title]
            ]
