module BidList.Table.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Bid.Types exposing
    ( Bid
    )
import BidList.Filter.Types exposing
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
        if List.isEmpty model.bids then
            error "There is no bids to display"

        else if List.isEmpty bids then
            error "Selected filter doesn't match any bids"

        else
            bidList model.showStatus Click bids


-- Error

error : String -> Html Msg
error message =
    article [class "message is-danger"]
        [ div [class "message-body"]
            [ p [] [text message]
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
