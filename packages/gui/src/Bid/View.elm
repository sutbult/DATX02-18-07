module Bid.View exposing
    ( bidList
    )

import Html exposing (..)
import Html.Events
import Html.Attributes exposing (..)

import Bid.Types exposing
    ( Bid
    , Value
    , Status
    , amountString
    )


withStatus : Bool -> v -> List v
withStatus showStatus value =
    if showStatus then
        [value]
    else
        []


bidList : Bool -> (Bid -> msg) -> List Bid -> Html msg
bidList showStatus onClick bids =
    table [class "table is-fullwidth is-hoverable is-striped"]
        [ head showStatus
        , tbody []
            <| List.map (bidView showStatus onClick) bids
        ]


head : Bool -> Html msg
head showStatus =
    thead []
        [ tr [] <|
            [ th [] [text "From"]
            , th [] []
            , th [] [text "To"]
            , th [] []
            ] ++ (withStatus showStatus <| th [] [text "Status"])
        , tr [] <|
            [ th [] [text "Currency"]
            , th [] [text "Amount"]
            , th [] [text "Currency"]
            , th [] [text "Amount"]
            ] ++ (withStatus showStatus <| th [] [])
        ]


bidView : Bool -> (Bid -> msg) -> Bid -> Html msg
bidView showStatus onClick bid =
    let
        trStyle =
            withStatus showStatus <|
            style <|
            statusStyle bid.status

        trAttribs =
            [Html.Events.onClick <| onClick bid] ++ trStyle
    in
        tr trAttribs
            <| valueView bid.from
            ++ valueView bid.to
            ++ (withStatus showStatus <| statusView bid.status)


valueView : Value -> List (Html msg)
valueView value =
    [ td [] <| [ text value.currency]
    , td [] <| [ text <| amountString value]
    ]


statusView : Status -> Html msg
statusView status =
    td []
        [text <| toString status]


statusStyle : Status -> List ((String, String))
statusStyle status =
    case status of
        Bid.Types.Active ->
            []

        Bid.Types.Pending ->
            [("background-color", "hsl(48, 100%, 67%)")]

        Bid.Types.Finished ->
            [("background-color", "hsl(141, 71%, 48%)")]
