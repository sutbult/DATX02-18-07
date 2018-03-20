module Add.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import Add.Types exposing (..)

root : Model -> Html Msg
root model =
    div []
        [ form model
        , submit model.submitting
        ]

form : Model -> Html Msg
form model =
    let
        lfield = field model.submitting
    in
        div [class "columns"]
            [ formBox
                [ lfield "Currency" SetFromCurrency model.fromCurrency
                , lfield "Amount" SetFromAmount model.fromAmount
                ]
            , arrowColumn
            , formBox
                [ lfield "Currency" SetToCurrency model.toCurrency
                , lfield "Amount" SetToAmount model.toAmount
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

field : Bool -> String -> (String -> Msg) -> String -> Html Msg
field submitting title setter currentValue =
    div [class "field"]
        [ div [class "control"]
            [ input
                [ class "input"
                , type_ "text"
                , placeholder title
                , onInput setter
                , value currentValue
                , disabled submitting
                ] []
            ]
        ]

submit : Bool -> Html Msg
submit submitting =
    let
        classNameExtra =
            if submitting then
                " is-loading"
            else
                ""
    in
        div [style [("text-align", "right")]]
            [ button
                [ class <| "button is-link is-medium" ++ classNameExtra
                , onClick Submit
                ]
                [ text "Add bid"
                ]
            ]
