module Browse.Bids.View exposing (root)

import Browse.Bids.Types exposing (..)
import Bid.Types exposing (Bid, Value)

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
                [ tableView bids
                , bidModalMaybe model.modal
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


-- Table

tableView : List Bid -> Html Msg
tableView bids =
    table [class "table is-fullwidth is-hoverable is-striped"]
        [ head
        , tbody []
            <| List.map bidView bids
        ]

head : Html Msg
head =
    thead []
        [ tr []
            [ th [] [text "From"]
            , th [] []
            , th [] [text "To"]
            , th [] []
            ]
        , tr []
            [ th [] [text "Currency"]
            , th [] [text "Amount"]
            , th [] [text "Currency"]
            , th [] [text "Amount"]
            ]
        ]

bidView : Bid -> Html Msg
bidView bid =
    tr [onClick (DisplayModal bid)]
        <| valueView (.from bid)
        ++ valueView (.to bid)

valueView : Value -> List (Html Msg)
valueView value =
    [ td [] <| [ text <| .currency value]
    , td [] <| [ text <| toString <| .amount value]
    ]

filteredBids : Model -> Filter -> List Bid
filteredBids model filter = List.filter (filterBid filter) (.bids model)

filterBid : Filter -> Bid -> Bool
filterBid filter bid =
    List.member (.currency <| .from bid) (.from filter) &&
    List.member (.currency <| .to bid) (.to filter)
