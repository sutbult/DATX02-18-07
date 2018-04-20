module Password.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Password.Types exposing (..)

root : Model -> Html Msg
root _ =
    div [class "modal is-active"]
        [ div
            [ class "modal-background"
            ]
            []
        , div
            [ class "modal-content"
            ]
            [ div [class "box", style [("text-align", "center")]]
                [ p []
                    [ text "Password modal"
                    ]
                ]
            ]
        ]
