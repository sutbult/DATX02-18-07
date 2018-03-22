module Browse.Bids.View exposing (root)

import Browse.Bids.Types exposing (..)
import Bid.Types exposing (Bid, Value)
import Bid.View exposing (bidList)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import Browse.Filter.Types exposing (Filter)

root : Model -> Filter -> Html Msg
root model filter =
    let
        bids = filteredBids model filter
    in
        if List.isEmpty bids then
            error
        else
            div []
                [ bidList False DisplayModal bids
                , modal model
                ]


modal : Model -> Html Msg
modal model =
    if model.processing then
        processingModal
    else
        bidModalMaybe model.modal


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
                [ text <| toString value.amount
                ]
            ]
        ]


-- Error

error : Html Msg
error =
    article [class "message is-danger"]
        [ div [class "message-body"]
            [ p [] [text "Selected filter doesn't match any bids"]
            ]
        ]


-- Filter

filteredBids : Model -> Filter -> List Bid
filteredBids model filter = List.filter (filterBid filter) (.bids model)

filterBid : Filter -> Bid -> Bool
filterBid filter bid =
    List.member (.currency <| .from bid) (.from filter) &&
    List.member (.currency <| .to bid) (.to filter)
