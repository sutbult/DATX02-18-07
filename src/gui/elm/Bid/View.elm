module Bid.View exposing (bidList)

import Html exposing (..)
import Html.Events
import Html.Attributes exposing (..)

import Bid.Types exposing
    ( Bid
    , Value
    )

bidList : (Bid -> msg) -> List Bid -> Html msg
bidList onClick bids =
    table [class "table is-fullwidth is-hoverable is-striped"]
        [ head
        , tbody []
            <| List.map (bidView onClick) bids
        ]

head : Html msg
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

bidView : (Bid -> msg) -> Bid -> Html msg
bidView onClick bid =
    tr [Html.Events.onClick <| onClick bid]
        <| valueView (.from bid)
        ++ valueView (.to bid)

valueView : Value -> List (Html msg)
valueView value =
    [ td [] <| [ text <| .currency value]
    , td [] <| [ text <| toString <| .amount value]
    ]
