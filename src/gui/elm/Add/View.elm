module Add.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import Add.Types exposing (..)

root : Model -> Html Msg
root model =
    div [class "columns"]
        [ formBox
            [ field "Currency" SetFromCurrency model.fromCurrency
            , field "Amount" SetFromAmount model.fromAmount
            ]
        , arrowColumn
        , formBox
            [ field "Currency" SetToCurrency model.toCurrency
            , field "Amount" SetToAmount model.toAmount
            ]
        ]

formBox : List (Html Msg) -> Html Msg
formBox content =
    div [class "column is-two-fifths"]
        [ div [class "box"]
            content
        ]

arrowColumn : Html Msg
arrowColumn =
    div [class "column is-one-fifths"]
        [ arrow "mobile" "right"
        , arrow "tablet" "down"
        ]

arrow : String -> String -> Html Msg
arrow hiddenOn arrowType =
    p
        [ class <| "is-hidden-" ++ hiddenOn
        , style
            [ ("font-size", "84px")
            , ("text-align", "center")
            ]
        ]
        [ i
            [ class <| "fas fa-long-arrow-alt-" ++ arrowType
            ] []
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
