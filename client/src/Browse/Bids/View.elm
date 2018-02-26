module Browse.Bids.View exposing (root)

import Browse.Bids.Types exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)

import Browse.Filter.Types exposing (Filter)

root : Model -> Filter -> Html Msg
root model filter =
    table [class "table is-fullwidth is-hoverable is-striped"]
        [ thead []
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
        , tbody []
            <| List.map bidView
            <| filteredBids model filter
        ]

bidView : Bid -> Html Msg
bidView bid =
    tr [] <| valueView (.from bid) ++ valueView (.to bid)

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
