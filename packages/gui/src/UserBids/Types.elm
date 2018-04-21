module UserBids.Types exposing (..)

import BidList.Types as BidListTypes
import Bid.Types exposing
    ( Bid
    )
import Utils.List exposing
    ( nub
    )

type alias Model =
    { bidList : BidListTypes.Model
    }

type Msg
    = ToBidList BidListTypes.Msg
    | TriggerPassword
        (List String)
        (Maybe Msg)
        (Maybe Msg)
        Msg

mapBidList : BidListTypes.Msg -> Msg
mapBidList msg =
    case msg of
        BidListTypes.SetBids bids ->
            TriggerPassword
                (involvedCurrencies bids)
                Nothing
                Nothing
                (ToBidList <| BidListTypes.SetBids bids)

        _ ->
            ToBidList msg

involvedCurrencies : List Bid -> List String
involvedCurrencies = nub
    << (List.map .currency)
    << List.concat
    << (List.map <| \bid -> [bid.from, bid.to])
