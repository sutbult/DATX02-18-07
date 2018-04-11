module Error.View exposing (root)

import Error.Types exposing (..)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)


root : Model -> Html Msg
root model =
    if String.isEmpty model.title || String.isEmpty model.message then
        div [] []
    else
        visible model

visible : Model -> Html Msg
visible model =
    article [class "message is-danger"]
        [ div [class "message-header"]
            [ p [] [ text model.title]
            , button
                [ class "delete"
                , attribute "aria-label" "delete"
                , onClick Dismiss
                ]
                []
            ]
        , div [class "message-body"]
            [ text model.message
            ]
        ]
