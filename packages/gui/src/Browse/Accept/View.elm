module Browse.Accept.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import Browse.Accept.Types exposing (..)
import Bid.Types exposing
    ( Bid
    , Value
    , amountString
    )


root : Model -> Html Msg
root model =
    if model.processing then
        processingModal
    else
        bidModalMaybe model.modal


-- Processing modal

processingModal : Html Msg
processingModal =
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
                    [ text "Processing transaction"
                    ]
                ]
            ]
        ]


-- Bid modal

bidModalMaybe : Maybe Bid -> Html Msg
bidModalMaybe mbid =
    case mbid of
        Just bid ->
            bidModal bid

        Nothing ->
            div [] []


bidModal : Bid -> Html Msg
bidModal bid =
    div [class "modal is-active"]
        [ div
            [ class "modal-background"
            , onClick CancelModal
            ]
            []
        , div
            [ class "modal-content"
            , style [("max-width", "300px")]
            ]
            [ div
                [ class "box"
                , style [("text-align", "center")]
                ]
                [ table
                    [ class "table"
                    , style [("display", "inline")]
                    ]
                    [ tbody []
                        <| valueRows "From" bid.from
                        ++ valueRows "To" bid.to
                    ]
                , div
                    [ class "buttons is-right"
                    , style [("margin-top", "20px")]
                    ]
                    [ button
                        [ class "button"
                        , onClick CancelModal
                        ]
                        [ text "Cancel"
                        ]
                    , button
                        [ class "button is-link"
                        , onClick (AcceptBid bid)
                        ]
                        [ text "Accept bid"
                        ]
                    ]
                ]
            ]
        , button
            [ class "modal-close is-large"
            , attribute "aria-label" "close"
            , onClick CancelModal
            ]
            []
        ]


valueRows : String -> Value -> List (Html Msg)
valueRows title value =
    let
        ltd =
            td
                [ style
                    [ ("border-color", "white")
                    ]
                ]
        heading ltitle =
            ltd
                [ strong []
                    [ text ltitle
                    ]
                ]
    in
        [ tr []
            [ heading title
            , heading "Currency"
            , ltd
                [ text value.currency
                ]
            ]
        , tr []
            [ ltd []
            , heading "Amount"
            , ltd
                [ text <| amountString value
                ]
            ]
        ]
