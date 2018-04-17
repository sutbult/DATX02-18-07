module BidList.Table.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Bid.Types exposing
    ( Bid
    )
import Browse.Filter.Types exposing
    ( Filter
    )
import BidList.Table.Types exposing (..)
import Bid.View exposing
    ( bidList
    )


root : Model -> Filter -> Html Msg
root model filter =
    let
        bids = filteredBids model filter
    in
        if List.isEmpty bids then
            error
        else
            bidList False Click bids


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
filteredBids model filter =
    List.filter (filterBid filter) model.bids


filterBid : Filter -> Bid -> Bool
filterBid filter bid =
    List.member (.currency <| .from bid) (.from filter) &&
    List.member (.currency <| .to bid) (.to filter)
