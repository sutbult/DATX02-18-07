module Add.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import Add.Types exposing (..)

root : Model -> Html Msg
root model =
    div [class "columns"]
        [ div [class "column is-two-fifths"]
            [ div [class "box"]
                [ field "Currency" SetFromCurrency model.fromCurrency
                , field "Amount" SetFromAmount model.fromAmount
                ]
            ]
        , div [class "column is-one-fifths"]
            [ p [style [("font-size", "84px"), ("text-align", "center")]]
                [ i [class "fas fa-long-arrow-alt-right"] []
                ]
            ]
        , div [class "column is-two-fifths"]
            [ div [class "box"]
                [ field "Currency" SetToCurrency model.toCurrency
                , field "Amount" SetToAmount model.toAmount
                ]
            ]
        ]

field : String -> (String -> Msg) -> String -> Html Msg
field title setter currentValue =
    div [class "field"]
        [ div [class "control"]
            [ input
                [ class "input"
                , type_ "text"
                , placeholder title
                , onInput setter
                , value currentValue
                ] []
            ]
        ]
