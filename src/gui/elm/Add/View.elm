module Add.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import Add.Types exposing (..)

root : Model -> Html Msg
root model =
    div []
        [ test
        , form model
        , submit model.submitting
        ]


-- TODO: Implementera som enhetstester
test : Html Msg
test =
    let
        cases =
            [ ("Bitcoin", "")
            , ("Bitcoin", "1")
            , ("Bitcoin", "12")
            , ("Ethereum", "1")
            , ("Ethereum", "21")
            , ("Bitcoin", "1.1")
            , ("Ethereum", "1.1")
            , ("Ethereum", "1.1.1")
            , ("Ethereum", "1.1e1")
            , ("Ethereum", "1e1.1")
            , ("Ethereum", "-1")
            , ("Ethereum", "e1")
            , ("Dogecoin", "2")
            , ("Bitcoin", "0")
            , ("Bitcoin", "0.0")
            , ("Bitcoin", ".0")
            , ("Bitcoin", "000000000001.00001")
            ]
        caseView (currency, amount) =
            p []
                [ text
                    <| toString
                    <| amountStatus currency amount
                ]
    in
        div []
            <| List.map caseView cases


form : Model -> Html Msg
form model =
    let
        lamountField = amountField model.submitting
        lcurrencySelector = currencySelector model.submitting model.currencies
    in
        div [class "columns"]
            [ formBox
                [ lcurrencySelector SetFromCurrency model.fromCurrency
                , lamountField SetFromAmount model.fromCurrency model.fromAmount
                ]
            , arrowColumn
            , formBox
                [ lcurrencySelector SetToCurrency model.toCurrency
                , lamountField SetToAmount model.toCurrency model.toAmount
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


fullWidth : Attribute Msg
fullWidth = style [("width", "100%")]


currencySelector : Bool -> List String -> (String -> Msg) -> String -> Html Msg
currencySelector submitting options setter currentValue =
    let
        optionView currency =
            option
                [ value currency
                , fullWidth
                , selected (currency == currentValue)
                ]
                [ text currency
                ]
    in
        div [class "field"]
            [ div [class "control"]
                [ div [class "select", fullWidth]
                    [ select [fullWidth, onInput setter]
                        <| List.map optionView options
                    ]
                ]
            ]

amountField
    :  Bool
    -> (String -> Msg)
    -> String
    -> String
    -> Html Msg
amountField submitting setter currency currentValue =
    let
        (extraClass, info) =
            case amountStatus currency currentValue of
                None ->
                    ("", "")

                Error ->
                    ("is-danger", "Must be a positive numerical value")

                Success amount unit ->
                    ("is-success", amount ++ " " ++ unit)
    in
        div [class "field"]
            [ div [class "control"]
                [ input
                    [ class <| "input " ++ extraClass
                    , type_ "text"
                    , placeholder "Amount"
                    , onInput setter
                    , value currentValue
                    , disabled submitting
                    ] []
                ]
                , p
                    [ class <| "help " ++ extraClass
                    , style [("text-align", "right")]
                    ]
                    [ text info
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
